const express = require('express');
const { sendSuccess } = require('../utils/httpResponse');
const router = express.Router();
const mongoose = require('mongoose');
const { authReviewMiddleware } = require('../middleware/authMiddleware');
const { sendError } = require('../utils/httpResponse');
const Order = require('../models/OrderProduct');
const ReturnRequest = require('../models/ReturnRequestModel');
const { isReturnWindowOpen } = require('../utils/orderLifecycle');

router.get('/orders/:id/tracking', authReviewMiddleware, async (req, res, next) => {
  try {
    if (!mongoose.isValidObjectId(req.params.id)) return sendError(res, 'Mã đơn không hợp lệ', 400);
    const order = await Order.findOne({ _id: req.params.id, user: req.user.id })
      .select('status paymentStatus isPaid isDelivered deliveredAt trackingNumber carrier estimatedDeliveryAt trackingHistory refundStatus');
    if (!order) return sendError(res, 'Không tìm thấy đơn hàng', 404);
    return sendSuccess(res, {
      status: order.status, paymentStatus: order.paymentStatus, isPaid: order.isPaid, isDelivered: order.isDelivered,
      deliveredAt: order.deliveredAt, trackingNumber: order.trackingNumber, carrier: order.carrier,
      estimatedDeliveryAt: order.estimatedDeliveryAt, refundStatus: order.refundStatus,
      trackingHistory: (order.trackingHistory || []).map((event) => ({ title: event.title, status: event.status, createdAt: event.createdAt })),
    });
  } catch (error) { return next(error); }
});

// Always scope to the token owner, including admins using the shopping assistant.
router.get('/returns/:id/eligibility', authReviewMiddleware, async (req, res, next) => {
  try {
    if (!mongoose.isValidObjectId(req.params.id)) return sendError(res, 'Mã đơn không hợp lệ', 400);
    const order = await Order.findOne({ _id: req.params.id, user: req.user.id }).select('status isDelivered deliveredAt updatedAt');
    if (!order) return sendError(res, 'Không tìm thấy đơn hàng', 404);
    const windowDays = Number(process.env.RETURN_WINDOW_DAYS || 7);
    const existing = await ReturnRequest.exists({ order: order._id, status: { $ne: 'rejected' } });
    const inWindow = isReturnWindowOpen(order, new Date(), windowDays);
    return sendSuccess(res, { eligible: inWindow && !existing, reason: existing ? 'existing_request' : inWindow ? 'in_window' : 'outside_window', windowDays, approvalRequired: true });
  } catch (error) { return next(error); }
});

// This public contract contains policies only; no credentials or customer data.
router.get('/policies', (req, res) => {
  const methods = [{ id: 'COD', label: 'Thanh toán khi nhận hàng (COD)' }];
  if (process.env.CLIENT_ID && process.env.PAYPAL_CLIENT_SECRET) methods.push({ id: 'paypal', label: 'PayPal' });
  if (process.env.VNP_TMN_CODE && process.env.VNP_HASH_SECRET) methods.push({ id: 'vnpay', label: 'VNPAY' });
  if (process.env.VIETQR_BANK_ID && process.env.VIETQR_ACCOUNT_NO) methods.push({ id: 'vietqr', label: 'Chuyển khoản VietQR' });
  return sendSuccess(res, {
    payment: { methods, unpaidOrderTtlMinutes: Number(process.env.UNPAID_ORDER_TTL_MINUTES || 30) },
    returns: {
      windowDays: Number(process.env.RETURN_WINDOW_DAYS || 7), requiresDelivery: true,
      types: ['return_refund', 'refund_only'], approvalRequired: true,
    },
    shipping: { estimate: 'Thời gian giao dự kiến, mã vận đơn và lịch sử vận chuyển được cập nhật trong chi tiết từng đơn hàng.' },
    privacy: { retentionDays: Number(process.env.CONVERSATION_RETENTION_DAYS || 30) },
  });
});

module.exports = router;
