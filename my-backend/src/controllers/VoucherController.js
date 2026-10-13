const VoucherService = require('../services/VoucherService');
const { sendError, sendServiceResult } = require('../utils/httpResponse');

const serverError = (res) => sendError(res, 'Lỗi máy chủ. Vui lòng thử lại sau.', 500);

const createVoucher = async (req, res) => {
  try {
    const { code, name, discountValue, endDate } = req.body;
    if (!code || !name || discountValue === undefined || !endDate) return sendError(res, 'Thông tin voucher chưa đầy đủ', 400);
    return sendServiceResult(res, await VoucherService.createVoucher(req.body), { successStatus: 201, errorStatus: 409 });
  } catch { return serverError(res); }
};

const updateVoucher = async (req, res) => {
  try { return sendServiceResult(res, await VoucherService.updateVoucher(req.params.id, req.body), { errorStatus: 404 }); }
  catch { return serverError(res); }
};

const deleteVoucher = async (req, res) => {
  try { return sendServiceResult(res, await VoucherService.deleteVoucher(req.params.id), { errorStatus: 404 }); }
  catch { return serverError(res); }
};

const getAllVouchers = async (req, res) => {
  try { return sendServiceResult(res, await VoucherService.getAllVouchers(req.query.limit, req.query.page, req.query.sort)); }
  catch { return serverError(res); }
};

const getAvailableVouchers = async (req, res) => {
  try { return sendServiceResult(res, await VoucherService.getAvailableVouchers()); }
  catch { return serverError(res); }
};

const applyVoucher = async (req, res) => {
  try {
    if (!req.body.code) return sendError(res, 'Vui lòng nhập mã voucher', 400);
    return sendServiceResult(res, await VoucherService.applyVoucher(req.body.code, req.body.itemsPrice));
  } catch { return serverError(res); }
};

module.exports = { createVoucher, updateVoucher, deleteVoucher, getAllVouchers, getAvailableVouchers, applyVoucher };
