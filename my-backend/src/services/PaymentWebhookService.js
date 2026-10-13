const crypto = require('crypto');
const Order = require('../models/OrderProduct');
const PaymentEvent = require('../models/PaymentEventModel');
const PaymentGateway = require('./VNPayService');

async function createEvent(provider, eventId, eventType, payload) {
  try {
    return await PaymentEvent.create({ provider, eventId, eventType, payload, status: 'processing' });
  } catch (error) {
    if (error.code === 11000) {
      return PaymentEvent.findOneAndUpdate(
        { provider, eventId, status: 'failed' },
        { $set: { status: 'processing', errorMessage: '' } },
        { new: true }
      );
    }
    throw error;
  }
}

async function handleVNPayIpn(params) {
  if (!PaymentGateway.verifyVNPaySignature(params)) return { RspCode: '97', Message: 'Invalid signature' };
  const order = await Order.findById(params.vnp_TxnRef);
  if (!order) return { RspCode: '01', Message: 'Order not found' };
  if (Number(params.vnp_Amount) / 100 !== Number(order.totalPrice)) return { RspCode: '04', Message: 'Invalid amount' };
  if (order.isPaid) return { RspCode: '02', Message: 'Order already confirmed' };

  const eventId = params.vnp_TransactionNo || crypto.createHash('sha256').update(JSON.stringify(params)).digest('hex');
  const event = await createEvent('vnpay', eventId, 'payment.ipn', params);
  if (!event) return { RspCode: '02', Message: 'Duplicate event' };
  event.order = order._id;

  try {
    if (params.vnp_ResponseCode !== '00' || (params.vnp_TransactionStatus && params.vnp_TransactionStatus !== '00')) {
      order.paymentStatus = 'failed';
      await order.save();
      event.status = 'ignored';
      event.processedAt = new Date();
      await event.save();
      return { RspCode: '00', Message: 'Payment failure recorded' };
    }
    PaymentGateway.applySuccessfulPayment(order, {
      transactionId: params.vnp_TransactionNo,
      metadata: { provider: 'vnpay', transactionDate: params.vnp_PayDate, bankCode: params.vnp_BankCode },
    });
    await order.save();
    event.status = 'processed';
    event.processedAt = new Date();
    await event.save();
    return { RspCode: '00', Message: 'Confirm success' };
  } catch (error) {
    event.status = 'failed';
    event.errorMessage = error.message;
    await event.save();
    return { RspCode: '99', Message: 'Unknown error' };
  }
}

function paypalOrderReference(event) {
  return event.resource?.custom_id
    || event.resource?.purchase_units?.[0]?.custom_id
    || event.resource?.supplementary_data?.related_ids?.custom_id;
}

async function handlePayPalWebhook(headers, eventPayload) {
  if (!await PaymentGateway.verifyPayPalWebhook(headers, eventPayload)) {
    return { status: 'ERR', message: 'Chữ ký webhook PayPal không hợp lệ' };
  }
  if (!eventPayload.id || !eventPayload.event_type) return { status: 'ERR', message: 'Webhook PayPal thiếu thông tin' };
  const event = await createEvent('paypal', eventPayload.id, eventPayload.event_type, eventPayload);
  if (!event) return { status: 'OK', message: 'Webhook đã được xử lý trước đó' };

  try {
    const type = eventPayload.event_type;
    const resource = eventPayload.resource || {};
    const paypalOrderId = resource.supplementary_data?.related_ids?.order_id || resource.id;
    let order = null;
    const customId = paypalOrderReference(eventPayload);
    if (customId) order = await Order.findById(customId);
    if (!order && paypalOrderId) order = await Order.findOne({ paymentTransactionId: paypalOrderId });
    if (!order && resource.supplementary_data?.related_ids?.capture_id) {
      order = await Order.findOne({ paymentCaptureId: resource.supplementary_data.related_ids.capture_id });
    }
    if (!order && resource.id) order = await Order.findOne({ paymentCaptureId: resource.id });

    if (!order) {
      event.status = 'ignored';
      event.errorMessage = 'Không ánh xạ được webhook tới đơn hàng';
    } else if (type === 'PAYMENT.CAPTURE.COMPLETED') {
      const exchangeRate = Number(process.env.PAYPAL_VND_PER_USD || 25000);
      const expected = Number((order.totalPrice / exchangeRate).toFixed(2));
      if (resource.amount?.currency_code !== 'USD' || Math.abs(Number(resource.amount?.value) - expected) > 0.01) {
        throw new Error('Số tiền webhook PayPal không khớp đơn hàng');
      }
      PaymentGateway.applySuccessfulPayment(order, {
        transactionId: paypalOrderId,
        captureId: resource.id,
        metadata: { provider: 'paypal', currency: 'USD', paidValue: Number(resource.amount.value) },
      });
      await order.save();
      event.status = 'processed';
      event.order = order._id;
    } else if (['PAYMENT.CAPTURE.REFUNDED', 'PAYMENT.CAPTURE.REVERSED'].includes(type)) {
      const exchangeRate = Number(process.env.PAYPAL_VND_PER_USD || 25000);
      const refundIds = new Set(order.paymentMetadata?.refundIds || []);
      if (!refundIds.has(resource.id)) {
        order.refundedAmount = Math.min(order.totalPrice, order.refundedAmount + Math.round(Number(resource.amount?.value || 0) * exchangeRate));
        refundIds.add(resource.id);
        order.paymentMetadata = { ...(order.paymentMetadata || {}), refundIds: [...refundIds] };
      }
      order.refundStatus = order.refundedAmount >= order.totalPrice ? 'refunded' : 'partial';
      order.paymentStatus = order.refundedAmount >= order.totalPrice ? 'refunded' : 'partially_refunded';
      await order.save();
      event.status = 'processed';
      event.order = order._id;
    } else {
      event.status = 'ignored';
      if (order) event.order = order._id;
    }
    event.processedAt = new Date();
    await event.save();
    return { status: 'OK', message: 'Webhook PayPal đã được ghi nhận' };
  } catch (error) {
    event.status = 'failed';
    event.errorMessage = error.message;
    await event.save();
    throw error;
  }
}

module.exports = { handleVNPayIpn, handlePayPalWebhook };
