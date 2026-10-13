const mongoose = require('mongoose');
const Order = require('../models/OrderProduct');
const ReturnRequest = require('../models/ReturnRequestModel');
const InventoryService = require('./InventoryService');
const PaymentGateway = require('./VNPayService');
const { RETURN_TYPES, isReturnWindowOpen, calculateReturnAmount } = require('../utils/orderLifecycle');

const RETURN_TRANSITIONS = {
  requested: ['approved', 'rejected'],
  approved: ['awaiting_return', 'refund_processing'],
  awaiting_return: ['received'],
  received: ['refund_processing'],
  refund_processing: ['refunded'],
  rejected: [], refunded: ['closed'], closed: [],
};

async function createReturnRequest(input, userId) {
  if (!mongoose.isValidObjectId(input.orderId)) return { status: 'ERR', message: 'Mã đơn hàng không hợp lệ' };
  if (!RETURN_TYPES.includes(input.type)) return { status: 'ERR', message: 'Loại yêu cầu đổi trả không hợp lệ' };
  if (!input.reason || !Array.isArray(input.items) || !input.items.length) return { status: 'ERR', message: 'Vui lòng chọn sản phẩm và nhập lý do' };
  const order = await Order.findOne({ _id: input.orderId, user: userId });
  if (!order) return { status: 'ERR', message: 'Không tìm thấy đơn hàng' };
  if (!isReturnWindowOpen(order, new Date(), Number(process.env.RETURN_WINDOW_DAYS || 7))) {
    return { status: 'ERR', message: 'Đơn hàng không còn trong thời hạn đổi trả' };
  }
  if (await ReturnRequest.exists({ order: order._id, status: { $ne: 'rejected' } })) {
    return { status: 'ERR', message: 'Đơn hàng đã có yêu cầu đổi trả; chỉ có thể tạo lại khi yêu cầu trước bị từ chối' };
  }

  let refundAmount;
  try { refundAmount = calculateReturnAmount(order, input.items); }
  catch (error) { return { status: 'ERR', message: error.message }; }
  const orderItems = new Map(order.orderItems.map((item) => [String(item._id), item]));
  const items = input.items.map((requested) => {
    const item = orderItems.get(String(requested.orderItemId));
    return {
      orderItemId: item._id, product: item.product, variantId: item.variantId,
      name: item.name, sku: item.sku, size: item.size || item.sizes?.[0] || '',
      color: item.color || item.colors?.[0] || '', quantity: Number(requested.quantity),
    };
  });
  const request = await ReturnRequest.create({
    order: order._id, user: userId, type: input.type, items, reason: input.reason,
    description: input.description || '', evidenceUrls: (input.evidenceUrls || []).slice(0, 5),
    refundAmount, history: [{ status: 'requested', note: 'Khách hàng tạo yêu cầu', actor: userId }],
  });
  order.refundStatus = 'requested';
  await order.save();
  return { status: 'OK', message: 'Đã gửi yêu cầu đổi trả', data: request };
}

async function getUserReturns(userId) {
  return { status: 'OK', message: 'SUCCESS', data: await ReturnRequest.find({ user: userId }).populate('order').sort({ createdAt: -1 }) };
}

async function getAllReturns() {
  return {
    status: 'OK',
    message: 'SUCCESS',
    data: await ReturnRequest.find()
      .populate('order', 'status paymentMethod totalPrice shippingAddress paymentStatus')
      .populate('user', 'email name')
      .sort({ createdAt: -1 }),
  };
}

async function getReturnDetails(id, requester) {
  if (!mongoose.isValidObjectId(id)) return { status: 'ERR', message: 'Mã yêu cầu không hợp lệ' };
  const query = requester.isAdmin === true ? { _id: id } : { _id: id, user: requester.id };
  const request = await ReturnRequest.findOne(query).populate('order');
  return request ? { status: 'OK', message: 'SUCCESS', data: request } : { status: 'ERR', message: 'Không tìm thấy yêu cầu đổi trả' };
}

async function updateReturnStatus(id, newStatus, note, actorId) {
  if (!mongoose.isValidObjectId(id)) return { status: 'ERR', message: 'Mã yêu cầu không hợp lệ' };
  const session = await mongoose.startSession();
  let updated;
  try {
    await session.withTransaction(async () => {
      const request = await ReturnRequest.findById(id).session(session);
      if (!request) throw new Error('Không tìm thấy yêu cầu đổi trả');
      if (!RETURN_TRANSITIONS[request.status]?.includes(newStatus)) throw new Error(`Không thể chuyển từ ${request.status} sang ${newStatus}`);
      if (newStatus === 'received' && !request.inventoryRestored) {
        await InventoryService.restoreItems(request.items, session);
        request.inventoryRestored = true;
      }
      request.status = newStatus;
      request.adminNote = note || request.adminNote;
      request.history.push({ status: newStatus, note: note || '', actor: actorId });
      updated = await request.save({ session });
      const refundStatus = newStatus === 'rejected' ? 'rejected' : newStatus === 'refund_processing' ? 'processing' : 'requested';
      await Order.updateOne({ _id: request.order }, { refundStatus }, { session });
    });
    return { status: 'OK', message: 'Cập nhật yêu cầu đổi trả thành công', data: updated };
  } catch (error) {
    return { status: 'ERR', message: error.message };
  } finally { await session.endSession(); }
}

async function processRefund(id, input, actor) {
  if (!mongoose.isValidObjectId(id)) return { status: 'ERR', message: 'Mã yêu cầu không hợp lệ' };
  const request = await ReturnRequest.findById(id);
  if (!request) return { status: 'ERR', message: 'Không tìm thấy yêu cầu đổi trả' };
  const allowed = request.type === 'refund_only' ? ['approved', 'refund_processing'] : ['received', 'refund_processing'];
  if (!allowed.includes(request.status)) return { status: 'ERR', message: 'Yêu cầu chưa đủ điều kiện hoàn tiền' };
  const order = await Order.findById(request.order);
  if (!order || !order.isPaid) return { status: 'ERR', message: 'Đơn hàng chưa được thanh toán' };
  if (request.status !== 'refund_processing') {
    request.status = 'refund_processing';
    request.history.push({ status: 'refund_processing', note: 'Bắt đầu hoàn tiền', actor: actor.id });
    await request.save();
  }

  try {
    let refund;
    if (order.paymentMethod === 'paypal') refund = await PaymentGateway.refundPayPal(order, request.refundAmount);
    else if (order.paymentMethod === 'vnpay') refund = await PaymentGateway.refundVNPay(order, request.refundAmount, actor.email || 'admin', input.ipAddr);
    else {
      if (!input.manualReference) return { status: 'ERR', message: 'Cần mã tham chiếu hoàn tiền thủ công' };
      refund = { transactionId: String(input.manualReference), status: 'COMPLETED' };
    }

    request.status = 'refunded';
    request.refundMethod = order.paymentMethod;
    request.refundTransactionId = refund.transactionId;
    request.history.push({ status: 'refunded', note: input.note || 'Hoàn tiền thành công', actor: actor.id });
    await request.save();
    order.refundedAmount = Math.min(order.totalPrice, Number(order.refundedAmount || 0) + request.refundAmount);
    const refundIds = new Set(order.paymentMetadata?.refundIds || []);
    refundIds.add(refund.transactionId);
    order.paymentMetadata = { ...(order.paymentMetadata || {}), refundIds: [...refundIds] };
    const fullyRefunded = order.refundedAmount >= order.totalPrice;
    order.refundStatus = fullyRefunded ? 'refunded' : 'partial';
    order.paymentStatus = fullyRefunded ? 'refunded' : 'partially_refunded';
    await order.save();
    return { status: 'OK', message: 'Hoàn tiền thành công', data: request };
  } catch (error) {
    request.history.push({ status: 'refund_processing', note: `Hoàn tiền lỗi: ${error.message}`, actor: actor.id });
    await request.save();
    return { status: 'ERR', message: error.message };
  }
}

module.exports = { createReturnRequest, getUserReturns, getAllReturns, getReturnDetails, updateReturnStatus, processRefund };
