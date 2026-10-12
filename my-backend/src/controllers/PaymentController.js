const VNPayService = require('../services/VNPayService');

function getConfig(req, res) {
  return res.status(200).json({ status: 'OK', data: process.env.CLIENT_ID || '' });
}

function getVietQRConfig(req, res) {
  return res.status(200).json({
    status: 'OK',
    data: {
      bankId: process.env.VIETQR_BANK_ID || '',
      accountNo: process.env.VIETQR_ACCOUNT_NO || '',
      accountName: process.env.VIETQR_ACCOUNT_NAME || '',
      template: process.env.VIETQR_TEMPLATE || 'compact2',
      bankName: process.env.VIETQR_BANK_NAME || '',
    },
  });
}

async function createVNPayPayment(req, res) {
  try {
    const { orderId, orderInfo, bankCode } = req.body;
    if (!orderId) return res.status(400).json({ status: 'ERR', message: 'Thiếu mã đơn hàng' });
    const response = await VNPayService.createVNPayUrl(req, {
      orderId,
      orderInfo,
      bankCode,
      requester: req.user,
    });
    return res.status(response.status === 'OK' ? 200 : 400).json(response);
  } catch (error) {
    return res.status(500).json({ status: 'ERR', message: error.message });
  }
}

async function vnpayReturn(req, res) {
  try {
    const response = await VNPayService.verifyVNPayReturn(req.query);
    return res.status(response.status === 'OK' ? 200 : 400).json(response);
  } catch (error) {
    return res.status(500).json({ status: 'ERR', message: error.message });
  }
}

async function verifyPayPalPayment(req, res) {
  try {
    const { orderId, paypalOrderId } = req.body;
    if (!orderId || !paypalOrderId) return res.status(400).json({ status: 'ERR', message: 'Thiếu thông tin thanh toán PayPal' });
    const response = await VNPayService.verifyPayPalPayment({ orderId, paypalOrderId, requester: req.user });
    return res.status(response.status === 'OK' ? 200 : 400).json(response);
  } catch (error) {
    return res.status(500).json({ status: 'ERR', message: error.message });
  }
}

module.exports = { getConfig, getVietQRConfig, createVNPayPayment, vnpayReturn, verifyPayPalPayment };
