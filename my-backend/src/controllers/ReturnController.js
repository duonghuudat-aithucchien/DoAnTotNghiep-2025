const ReturnService = require('../services/ReturnService');
const { sendError, sendServiceResult } = require('../utils/httpResponse');

const serverError = (res) => sendError(res, 'Lỗi máy chủ. Vui lòng thử lại sau.', 500);

const create = async (req, res) => {
  try {
    return sendServiceResult(res, await ReturnService.createReturnRequest(req.body, req.user.id), { successStatus: 201 });
  } catch { return serverError(res); }
};

const mine = async (req, res) => {
  try { return sendServiceResult(res, await ReturnService.getUserReturns(req.user.id)); }
  catch { return serverError(res); }
};

const all = async (req, res) => {
  try { return sendServiceResult(res, await ReturnService.getAllReturns()); }
  catch { return serverError(res); }
};

const details = async (req, res) => {
  try { return sendServiceResult(res, await ReturnService.getReturnDetails(req.params.id, req.user), { errorStatus: 404 }); }
  catch { return serverError(res); }
};

const updateStatus = async (req, res) => {
  try {
    if (!req.body.status) return sendError(res, 'Thiếu trạng thái đổi trả', 400);
    return sendServiceResult(res, await ReturnService.updateReturnStatus(req.params.id, req.body.status, req.body.note, req.user.id));
  } catch { return serverError(res); }
};

const refund = async (req, res) => {
  try {
    const ipAddr = String(req.headers['x-forwarded-for'] || req.socket?.remoteAddress || '127.0.0.1').split(',')[0].trim();
    return sendServiceResult(res, await ReturnService.processRefund(req.params.id, { ...req.body, ipAddr }, req.user));
  } catch { return serverError(res); }
};

module.exports = { create, mine, all, details, updateStatus, refund };
