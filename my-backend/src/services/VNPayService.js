const crypto = require('crypto');
const mongoose = require('mongoose');
const Order = require('../models/OrderProduct');

function sortObject(object) {
  return Object.keys(object).sort().reduce((result, key) => {
    if (object[key] !== '' && object[key] != null) result[key] = object[key];
    return result;
  }, {});
}

function stringifyParams(params) {
  return Object.keys(params)
    .map((key) => `${encodeURIComponent(key)}=${encodeURIComponent(params[key]).replace(/%20/g, '+')}`)
    .join('&');
}

function signParams(params, secretKey) {
  return crypto.createHmac('sha512', secretKey)
    .update(Buffer.from(stringifyParams(params), 'utf-8'))
    .digest('hex');
}

async function createVNPayUrl(req, { orderId, orderInfo, bankCode, requester }) {
  if (!mongoose.isValidObjectId(orderId)) return { status: 'ERR', message: 'Mã đơn hàng không hợp lệ' };
  const order = await Order.findOne({ _id: orderId, user: requester.id, isPaid: false });
  if (!order) return { status: 'ERR', message: 'Đơn hàng không tồn tại, đã thanh toán hoặc không thuộc tài khoản này' };

  const date = new Date();
  const pad = (number) => String(number).padStart(2, '0');
  const createDate = `${date.getFullYear()}${pad(date.getMonth() + 1)}${pad(date.getDate())}${pad(date.getHours())}${pad(date.getMinutes())}${pad(date.getSeconds())}`;
  const ipAddr = String(req.headers['x-forwarded-for'] || req.socket?.remoteAddress || '127.0.0.1').split(',')[0].trim();
  const secretKey = process.env.VNP_HASH_SECRET;
  const tmnCode = process.env.VNP_TMN_CODE;
  const paymentUrl = process.env.VNP_URL || 'https://sandbox.vnpayment.vn/paymentv2/vpcpay.html';
  const returnUrl = process.env.VNP_RETURN_URL;
  if (!secretKey || !tmnCode || !returnUrl) return { status: 'ERR', message: 'VNPay chưa được cấu hình đầy đủ' };

  const params = sortObject({
    vnp_Version: '2.1.0',
    vnp_Command: 'pay',
    vnp_TmnCode: tmnCode,
    vnp_Locale: 'vn',
    vnp_CurrCode: 'VND',
    vnp_TxnRef: String(order._id),
    vnp_OrderInfo: orderInfo || `Thanh toan don hang ${order._id}`,
    vnp_OrderType: 'other',
    vnp_Amount: Math.round(order.totalPrice * 100),
    vnp_ReturnUrl: returnUrl,
    vnp_IpAddr: ipAddr,
    vnp_CreateDate: createDate,
    ...(bankCode ? { vnp_BankCode: bankCode } : {}),
  });
  const secureHash = signParams(params, secretKey);
  return { status: 'OK', paymentUrl: `${paymentUrl}?${stringifyParams({ ...params, vnp_SecureHash: secureHash })}` };
}

async function verifyVNPayReturn(vnpParams) {
  const params = { ...vnpParams };
  const secureHash = params.vnp_SecureHash;
  delete params.vnp_SecureHash;
  delete params.vnp_SecureHashType;
  const sortedParams = sortObject(params);
  const expectedHash = signParams(sortedParams, process.env.VNP_HASH_SECRET || '');
  if (!secureHash || secureHash.length !== expectedHash.length ||
      !crypto.timingSafeEqual(Buffer.from(secureHash), Buffer.from(expectedHash))) {
    return { status: 'ERR', message: 'Chữ ký thanh toán không hợp lệ' };
  }
  if (params.vnp_ResponseCode !== '00' || params.vnp_TransactionStatus && params.vnp_TransactionStatus !== '00') {
    return { status: 'ERR', message: 'Giao dịch không thành công', code: params.vnp_ResponseCode };
  }

  const order = await Order.findById(params.vnp_TxnRef);
  if (!order) return { status: 'ERR', message: 'Không tìm thấy đơn hàng' };
  const paidAmount = Number(params.vnp_Amount) / 100;
  if (paidAmount !== order.totalPrice) return { status: 'ERR', message: 'Số tiền thanh toán không khớp đơn hàng' };

  if (!order.isPaid) {
    order.isPaid = true;
    order.paidAt = new Date();
    if (order.status === 'pending') order.status = 'confirmed';
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
    headers: {
      Authorization: `Basic ${Buffer.from(`${clientId}:${clientSecret}`).toString('base64')}`,
      'Content-Type': 'application/x-www-form-urlencoded',
    },
    body: 'grant_type=client_credentials',
  });
  if (!response.ok) throw new Error('Không thể xác thực với PayPal');
  const data = await response.json();
  return { accessToken: data.access_token, baseUrl };
}

async function verifyPayPalPayment({ orderId, paypalOrderId, requester }) {
  if (!mongoose.isValidObjectId(orderId)) return { status: 'ERR', message: 'Mã đơn hàng không hợp lệ' };
  const reusedTransaction = await Order.exists({ paymentTransactionId: paypalOrderId, _id: { $ne: orderId } });
  if (reusedTransaction) return { status: 'ERR', message: 'Giao dịch PayPal đã được dùng cho đơn hàng khác' };
  const order = await Order.findOne({ _id: orderId, user: requester.id });
  if (!order) return { status: 'ERR', message: 'Không tìm thấy đơn hàng' };
  if (order.isPaid) {
    return order.paymentTransactionId === paypalOrderId
      ? { status: 'OK', message: 'Thanh toán đã được xác minh', data: order }
      : { status: 'ERR', message: 'Đơn hàng đã được thanh toán bằng giao dịch khác' };
  }

  const { accessToken, baseUrl } = await getPayPalAccessToken();
  const response = await fetch(`${baseUrl}/v2/checkout/orders/${encodeURIComponent(paypalOrderId)}`, {
    headers: { Authorization: `Bearer ${accessToken}` },
  });
  if (!response.ok) return { status: 'ERR', message: 'Không tìm thấy giao dịch PayPal' };
  const payment = await response.json();
  const paidValue = Number(payment.purchase_units?.[0]?.payments?.captures?.[0]?.amount?.value);
  const paidCurrency = payment.purchase_units?.[0]?.payments?.captures?.[0]?.amount?.currency_code;
  const exchangeRate = Number(process.env.PAYPAL_VND_PER_USD || 25000);
  const expectedValue = Number((order.totalPrice / exchangeRate).toFixed(2));
  if (payment.status !== 'COMPLETED' || paidCurrency !== 'USD' || Math.abs(paidValue - expectedValue) > 0.01) {
    return { status: 'ERR', message: 'Trạng thái hoặc số tiền PayPal không khớp đơn hàng' };
  }

  const updated = await Order.findOneAndUpdate(
    { _id: order._id, isPaid: false },
    { isPaid: true, paidAt: new Date(), status: 'confirmed', paymentTransactionId: paypalOrderId },
    { new: true }
  );
  if (!updated) return { status: 'ERR', message: 'Giao dịch đang được xử lý, vui lòng kiểm tra lại đơn hàng' };
  return { status: 'OK', message: 'Thanh toán PayPal đã được xác minh', data: updated };
}

module.exports = { createVNPayUrl, verifyVNPayReturn, verifyPayPalPayment };
