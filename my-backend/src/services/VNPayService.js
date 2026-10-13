const crypto = require('crypto');
const mongoose = require('mongoose');
const Order = require('../models/OrderProduct');
const { createTrackingEvent } = require('../utils/orderLifecycle');

function sortObject(object) {
  return Object.keys(object).sort().reduce((result, key) => {
    if (object[key] !== '' && object[key] != null) result[key] = object[key];
    return result;
  }, {});
}

function stringifyParams(params) {
  return Object.keys(params).map((key) => `${encodeURIComponent(key)}=${encodeURIComponent(params[key]).replace(/%20/g, '+')}`).join('&');
}

function signParams(params, secretKey) {
  return crypto.createHmac('sha512', secretKey).update(Buffer.from(stringifyParams(params), 'utf-8')).digest('hex');
}

function formatVnpDate(date = new Date()) {
  const pad = (number) => String(number).padStart(2, '0');
  return `${date.getFullYear()}${pad(date.getMonth() + 1)}${pad(date.getDate())}${pad(date.getHours())}${pad(date.getMinutes())}${pad(date.getSeconds())}`;
}

function verifyVNPaySignature(vnpParams) {
  const params = { ...vnpParams };
  const secureHash = String(params.vnp_SecureHash || '').toLowerCase();
  delete params.vnp_SecureHash;
  delete params.vnp_SecureHashType;
  const expectedHash = signParams(sortObject(params), process.env.VNP_HASH_SECRET || '');
  if (!secureHash || secureHash.length !== expectedHash.length) return false;
  return crypto.timingSafeEqual(Buffer.from(secureHash), Buffer.from(expectedHash));
}

function applySuccessfulPayment(order, paymentData = {}) {
  order.isPaid = true;
  order.paidAt = order.paidAt || new Date();
  order.paymentTransactionId = paymentData.transactionId || order.paymentTransactionId;
  order.paymentCaptureId = paymentData.captureId || order.paymentCaptureId;
  order.paymentMetadata = { ...(order.paymentMetadata || {}), ...(paymentData.metadata || {}) };
  if (order.status === 'expired') {
    order.status = 'payment_review';
    order.paymentStatus = 'paid_after_expiry';
    order.trackingHistory.push({
      status: 'payment_review',
      title: 'Thanh toán đến sau khi đơn hết hạn',
      description: 'Cần kiểm tra tồn kho hoặc hoàn tiền cho khách hàng',
      createdAt: new Date(),
    });
  } else {
    order.paymentStatus = 'paid';
    if (order.status === 'pending') {
      order.status = 'confirmed';
      order.trackingHistory.push(createTrackingEvent('confirmed', { description: 'Thanh toán đã được xác nhận' }));
    }
  }
}

async function createVNPayUrl(req, { orderId, orderInfo, bankCode, requester }) {
  if (!mongoose.isValidObjectId(orderId)) return { status: 'ERR', message: 'Mã đơn hàng không hợp lệ' };
  const order = await Order.findOne({ _id: orderId, user: requester.id, isPaid: false, status: { $ne: 'expired' } });
  if (!order) return { status: 'ERR', message: 'Đơn hàng không tồn tại, đã thanh toán hoặc đã hết hạn' };
  const secretKey = process.env.VNP_HASH_SECRET;
  const tmnCode = process.env.VNP_TMN_CODE;
  const returnUrl = process.env.VNP_RETURN_URL;
  if (!secretKey || !tmnCode || !returnUrl) return { status: 'ERR', message: 'VNPay chưa được cấu hình đầy đủ' };

  const ipAddr = String(req.headers['x-forwarded-for'] || req.socket?.remoteAddress || '127.0.0.1').split(',')[0].trim();
  const expiresAt = order.paymentExpiresAt || new Date(Date.now() + 30 * 60 * 1000);
  const params = sortObject({
    vnp_Version: '2.1.0', vnp_Command: 'pay', vnp_TmnCode: tmnCode, vnp_Locale: 'vn', vnp_CurrCode: 'VND',
    vnp_TxnRef: String(order._id), vnp_OrderInfo: orderInfo || `Thanh toan don hang ${order._id}`,
    vnp_OrderType: 'other', vnp_Amount: Math.round(order.totalPrice * 100), vnp_ReturnUrl: returnUrl,
    vnp_IpAddr: ipAddr, vnp_CreateDate: formatVnpDate(), vnp_ExpireDate: formatVnpDate(expiresAt),
    ...(bankCode ? { vnp_BankCode: bankCode } : {}),
  });
  const paymentUrl = process.env.VNP_URL || 'https://sandbox.vnpayment.vn/paymentv2/vpcpay.html';
  return { status: 'OK', message: 'Tạo liên kết thanh toán thành công', paymentUrl: `${paymentUrl}?${stringifyParams({ ...params, vnp_SecureHash: signParams(params, secretKey) })}` };
}

async function verifyVNPayReturn(vnpParams) {
  if (!verifyVNPaySignature(vnpParams)) return { status: 'ERR', message: 'Chữ ký thanh toán không hợp lệ' };
  const params = { ...vnpParams };
  if (params.vnp_ResponseCode !== '00' || (params.vnp_TransactionStatus && params.vnp_TransactionStatus !== '00')) {
    return { status: 'ERR', message: 'Giao dịch không thành công', code: params.vnp_ResponseCode };
  }
  const order = await Order.findById(params.vnp_TxnRef);
  if (!order) return { status: 'ERR', message: 'Không tìm thấy đơn hàng' };
  if (Number(params.vnp_Amount) / 100 !== order.totalPrice) return { status: 'ERR', message: 'Số tiền thanh toán không khớp đơn hàng' };
  if (!order.isPaid) {
    applySuccessfulPayment(order, {
      transactionId: params.vnp_TransactionNo,
      metadata: { provider: 'vnpay', transactionDate: params.vnp_PayDate, bankCode: params.vnp_BankCode },
    });
    await order.save();
  }
  return { status: 'OK', message: 'Thanh toán VNPay thành công', orderId: order.id, code: params.vnp_ResponseCode };
}

async function getPayPalAccessToken() {
  const clientId = process.env.CLIENT_ID;
  const clientSecret = process.env.PAYPAL_CLIENT_SECRET;
  if (!clientId || !clientSecret) throw new Error('PayPal chưa được cấu hình đầy đủ');
  const baseUrl = process.env.PAYPAL_BASE_URL || 'https://api-m.sandbox.paypal.com';
  const response = await fetch(`${baseUrl}/v1/oauth2/token`, {
    method: 'POST',
    headers: { Authorization: `Basic ${Buffer.from(`${clientId}:${clientSecret}`).toString('base64')}`, 'Content-Type': 'application/x-www-form-urlencoded' },
    body: 'grant_type=client_credentials',
  });
  if (!response.ok) throw new Error('Không thể xác thực với PayPal');
  const data = await response.json();
  return { accessToken: data.access_token, baseUrl };
}

async function verifyPayPalPayment({ orderId, paypalOrderId, requester }) {
  if (!mongoose.isValidObjectId(orderId)) return { status: 'ERR', message: 'Mã đơn hàng không hợp lệ' };
  const reused = await Order.exists({ paymentTransactionId: paypalOrderId, _id: { $ne: orderId } });
  if (reused) return { status: 'ERR', message: 'Giao dịch PayPal đã được dùng cho đơn hàng khác' };
  const order = await Order.findOne({ _id: orderId, user: requester.id });
  if (!order) return { status: 'ERR', message: 'Không tìm thấy đơn hàng' };
  if (order.isPaid) return order.paymentTransactionId === paypalOrderId
    ? { status: 'OK', message: 'Thanh toán đã được xác minh', data: order }
    : { status: 'ERR', message: 'Đơn hàng đã được thanh toán bằng giao dịch khác' };

  const { accessToken, baseUrl } = await getPayPalAccessToken();
  const response = await fetch(`${baseUrl}/v2/checkout/orders/${encodeURIComponent(paypalOrderId)}`, { headers: { Authorization: `Bearer ${accessToken}` } });
  if (!response.ok) return { status: 'ERR', message: 'Không tìm thấy giao dịch PayPal' };
  const payment = await response.json();
  const capture = payment.purchase_units?.[0]?.payments?.captures?.[0];
  const exchangeRate = Number(process.env.PAYPAL_VND_PER_USD || 25000);
  const expectedValue = Number((order.totalPrice / exchangeRate).toFixed(2));
  if (payment.status !== 'COMPLETED' || capture?.amount?.currency_code !== 'USD' || Math.abs(Number(capture?.amount?.value) - expectedValue) > 0.01) {
    return { status: 'ERR', message: 'Trạng thái hoặc số tiền PayPal không khớp đơn hàng' };
  }
  applySuccessfulPayment(order, {
    transactionId: paypalOrderId,
    captureId: capture.id,
    metadata: { provider: 'paypal', currency: 'USD', paidValue: Number(capture.amount.value) },
  });
  await order.save();
  return { status: 'OK', message: 'Thanh toán PayPal đã được xác minh', data: order };
}

async function verifyPayPalWebhook(headers, event) {
  if (!process.env.PAYPAL_WEBHOOK_ID) throw new Error('Chưa cấu hình PAYPAL_WEBHOOK_ID');
  const { accessToken, baseUrl } = await getPayPalAccessToken();
  const response = await fetch(`${baseUrl}/v1/notifications/verify-webhook-signature`, {
    method: 'POST',
    headers: { Authorization: `Bearer ${accessToken}`, 'Content-Type': 'application/json' },
    body: JSON.stringify({
      transmission_id: headers['paypal-transmission-id'], transmission_time: headers['paypal-transmission-time'],
      cert_url: headers['paypal-cert-url'], auth_algo: headers['paypal-auth-algo'],
      transmission_sig: headers['paypal-transmission-sig'], webhook_id: process.env.PAYPAL_WEBHOOK_ID,
      webhook_event: event,
    }),
  });
  if (!response.ok) return false;
  return (await response.json()).verification_status === 'SUCCESS';
}

async function refundPayPal(order, amountVnd) {
  if (!order.paymentCaptureId) throw new Error('Đơn hàng chưa có mã PayPal capture để hoàn tiền');
  const { accessToken, baseUrl } = await getPayPalAccessToken();
  const exchangeRate = Number(process.env.PAYPAL_VND_PER_USD || 25000);
  const response = await fetch(`${baseUrl}/v2/payments/captures/${encodeURIComponent(order.paymentCaptureId)}/refund`, {
    method: 'POST',
    headers: { Authorization: `Bearer ${accessToken}`, 'Content-Type': 'application/json', 'PayPal-Request-Id': `refund-${order.id}-${amountVnd}` },
    body: JSON.stringify({ amount: { value: (Number(amountVnd) / exchangeRate).toFixed(2), currency_code: 'USD' } }),
  });
  const data = await response.json();
  if (!response.ok || !['COMPLETED', 'PENDING'].includes(data.status)) throw new Error(data.message || 'PayPal từ chối hoàn tiền');
  return { transactionId: data.id, status: data.status };
}

async function refundVNPay(order, amountVnd, actorName, ipAddr = '127.0.0.1') {
  const transactionDate = order.paymentMetadata?.transactionDate;
  if (!transactionDate) throw new Error('Đơn hàng thiếu ngày giao dịch VNPAY để hoàn tiền');
  const requestId = crypto.randomUUID();
  const createDate = formatVnpDate();
  const body = {
    vnp_RequestId: requestId, vnp_Version: '2.1.0', vnp_Command: 'refund', vnp_TmnCode: process.env.VNP_TMN_CODE,
    vnp_TransactionType: Number(amountVnd) >= Number(order.totalPrice) ? '02' : '03', vnp_TxnRef: String(order._id),
    vnp_Amount: Math.round(Number(amountVnd) * 100), vnp_TransactionNo: order.paymentTransactionId || '0',
    vnp_TransactionDate: transactionDate, vnp_CreateBy: actorName || 'admin', vnp_CreateDate: createDate,
    vnp_IpAddr: ipAddr, vnp_OrderInfo: `Hoan tien don hang ${order._id}`,
  };
  const signData = [body.vnp_RequestId, body.vnp_Version, body.vnp_Command, body.vnp_TmnCode, body.vnp_TransactionType,
    body.vnp_TxnRef, body.vnp_Amount, body.vnp_TransactionNo, body.vnp_TransactionDate, body.vnp_CreateBy,
    body.vnp_CreateDate, body.vnp_IpAddr, body.vnp_OrderInfo].join('|');
  body.vnp_SecureHash = crypto.createHmac('sha512', process.env.VNP_HASH_SECRET || '').update(signData).digest('hex');
  const response = await fetch(process.env.VNP_API_URL || 'https://sandbox.vnpayment.vn/merchant_webapi/api/transaction', {
    method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(body),
  });
  const data = await response.json();
  if (!response.ok || data.vnp_ResponseCode !== '00') throw new Error(data.vnp_Message || 'VNPAY từ chối hoàn tiền');
  return { transactionId: data.vnp_TransactionNo || requestId, status: 'COMPLETED' };
}

module.exports = {
  createVNPayUrl, verifyVNPayReturn, verifyPayPalPayment, verifyVNPaySignature, applySuccessfulPayment,
  getPayPalAccessToken, verifyPayPalWebhook, refundPayPal, refundVNPay,
};
