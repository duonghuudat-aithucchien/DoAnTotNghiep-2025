const VNPayService = require('../services/VNPayService');
const PaymentWebhookService = require('../services/PaymentWebhookService');
const { sendError, sendServiceResult, sendSuccess } = require('../utils/httpResponse');

const getConfig = (req, res) => sendSuccess(res, process.env.CLIENT_ID || '');

const getVietQRConfig = (req, res) => sendSuccess(res, {
  bankId: process.env.VIETQR_BANK_ID || '',
  accountNo: process.env.VIETQR_ACCOUNT_NO || '',
  accountName: process.env.VIETQR_ACCOUNT_NAME || '',
  template: process.env.VIETQR_TEMPLATE || 'compact2',
  bankName: process.env.VIETQR_BANK_NAME || '',
});

const createVNPayPayment = async (req, res) => {
  try {
    const { orderId, orderInfo, bankCode } = req.body;
    if (!orderId) return sendError(res, 'Thiếu mã đơn hàng', 400);
    return sendServiceResult(res, await VNPayService.createVNPayUrl(req, { orderId, orderInfo, bankCode, requester: req.user }));
  } catch { return sendError(res, 'Không thể khởi tạo thanh toán VNPAY', 500); }
};

const vnpayReturn = async (req, res) => {
  try { return sendServiceResult(res, await VNPayService.verifyVNPayReturn(req.query)); }
  catch { return sendError(res, 'Không thể xác minh thanh toán VNPAY', 500); }
};

const verifyPayPalPayment = async (req, res) => {
  try {
    const { orderId, paypalOrderId } = req.body;
    if (!orderId || !paypalOrderId) return sendError(res, 'Thiếu thông tin thanh toán PayPal', 400);
    return sendServiceResult(res, await VNPayService.verifyPayPalPayment({ orderId, paypalOrderId, requester: req.user }));
  } catch { return sendError(res, 'Không thể xác minh thanh toán PayPal', 500); }
};

const vnpayIpn = async (req, res) => {
  try {
    return res.status(200).json(await PaymentWebhookService.handleVNPayIpn(req.query));
  } catch {
    return res.status(200).json({ RspCode: '99', Message: 'Unknown error' });
  }
};

const paypalWebhook = async (req, res) => {
  try {
    const result = await PaymentWebhookService.handlePayPalWebhook(req.headers, req.body);
    return sendServiceResult(res, result, { errorStatus: 400 });
  } catch (error) {
    return sendError(res, error.message || 'Không thể xử lý webhook PayPal', 500);
  }
};

module.exports = { getConfig, getVietQRConfig, createVNPayPayment, vnpayReturn, verifyPayPalPayment, vnpayIpn, paypalWebhook };
