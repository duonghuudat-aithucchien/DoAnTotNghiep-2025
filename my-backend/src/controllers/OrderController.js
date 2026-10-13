const OrderService = require('../services/OrderService');
const { sendError, sendServiceResult } = require('../utils/httpResponse');

const serverError = (res) => sendError(res, 'Lỗi máy chủ. Vui lòng thử lại sau.', 500);

const createOrder = async (req, res) => {
  try {
    const { orderItems, paymentMethod, fullName, address, city, phone } = req.body;
    if (!Array.isArray(orderItems) || !orderItems.length || !paymentMethod || !fullName || !address || !city || !phone) {
      return sendError(res, 'Thông tin đơn hàng chưa đầy đủ', 400);
    }
    return sendServiceResult(res, await OrderService.createOrder(req.body, req.user.id), { successStatus: 201 });
  } catch { return serverError(res); }
};

const updateOrderStatus = async (req, res) => {
  try {
    const valid = ['pending', 'confirmed', 'shipping', 'delivered', 'cancelled'];
    if (!valid.includes(req.body.status)) return sendError(res, 'Trạng thái không hợp lệ', 400);
    return sendServiceResult(res, await OrderService.updateOrderStatus(req.params.id, req.body.status, req.body, req.user.id));
  } catch { return serverError(res); }
};

const addTrackingEvent = async (req, res) => {
  try {
    return sendServiceResult(res, await OrderService.addTrackingEvent(req.params.id, req.body, req.user.id));
  } catch { return serverError(res); }
};

const getAllDetailsOrder = async (req, res) => {
  try {
    if (!req.params.id) return sendError(res, 'Thiếu mã người dùng', 400);
    if (req.user.isAdmin !== true && String(req.user.id) !== String(req.params.id)) return sendError(res, 'Không có quyền truy cập đơn hàng này', 403);
    return sendServiceResult(res, await OrderService.getAllDetailsOrder(req.params.id));
  } catch { return serverError(res); }
};

const getDetailsOrder = async (req, res) => {
  try {
    if (!req.params.id) return sendError(res, 'Thiếu mã đơn hàng', 400);
    return sendServiceResult(res, await OrderService.getOrderDetails(req.params.id, req.user), { errorStatus: 404 });
  } catch { return serverError(res); }
};

const cancelOrderDetails = async (req, res) => {
  try {
    if (!req.params.id) return sendError(res, 'Thiếu mã đơn hàng', 400);
    return sendServiceResult(res, await OrderService.cancelOrderDetails(req.params.id, req.user));
  } catch { return serverError(res); }
};

const getAllOrder = async (req, res) => {
  try { return sendServiceResult(res, await OrderService.getAllOrder()); }
  catch { return serverError(res); }
};

module.exports = { createOrder, getAllDetailsOrder, getDetailsOrder, cancelOrderDetails, getAllOrder, updateOrderStatus, addTrackingEvent };
