const ONLINE_PAYMENT_METHODS = ['paypal', 'vnpay', 'vietqr'];
const RETURN_TYPES = ['return_refund', 'refund_only'];
const RETURN_STATUSES = ['requested', 'approved', 'rejected', 'awaiting_return', 'received', 'refund_processing', 'refunded', 'closed'];

const STATUS_TRANSITIONS = {
  pending: ['confirmed', 'cancelled', 'expired'],
  confirmed: ['shipping', 'cancelled'],
  shipping: ['delivered'],
  delivered: [],
  payment_review: ['cancelled'],
  expired: [],
  cancelled: [],
};

const TRACKING_TITLES = {
  pending: 'Đơn hàng đã được tạo',
  confirmed: 'Đơn hàng đã được xác nhận',
  shipping: 'Đơn hàng đang được vận chuyển',
  delivered: 'Giao hàng thành công',
  cancelled: 'Đơn hàng đã bị hủy',
  expired: 'Đơn hàng hết hạn thanh toán',
  payment_review: 'Thanh toán cần được kiểm tra',
};

function canTransitionOrder(fromStatus, toStatus) {
  return Boolean(STATUS_TRANSITIONS[fromStatus]?.includes(toStatus));
}

function createTrackingEvent(status, options = {}) {
  return {
    status,
    title: options.title || TRACKING_TITLES[status] || status,
    description: options.description || '',
    location: options.location || '',
    createdBy: options.createdBy,
    createdAt: options.createdAt || new Date(),
  };
}

function paymentExpiryDate(paymentMethod, now = new Date(), ttlMinutes = 30) {
  if (!ONLINE_PAYMENT_METHODS.includes(paymentMethod)) return undefined;
  return new Date(now.getTime() + Number(ttlMinutes) * 60 * 1000);
}

function isReturnWindowOpen(order, now = new Date(), windowDays = 7) {
  if (order.status !== 'delivered' || !order.deliveredAt) return false;
  return now.getTime() <= new Date(order.deliveredAt).getTime() + Number(windowDays) * 24 * 60 * 60 * 1000;
}

function calculateReturnAmount(order, requestedItems) {
  const orderItems = new Map((order.orderItems || []).map((item) => [String(item._id), item]));
  const requestedQuantities = new Map();
  const grossItemsPrice = Number(order.itemsPrice || 0) || 1;
  const orderLevelDiscount = Number(order.voucherDiscount || 0);
  let amount = 0;
  for (const requested of requestedItems || []) {
    const item = orderItems.get(String(requested.orderItemId));
    const quantity = Number(requested.quantity);
    const cumulativeQuantity = (requestedQuantities.get(String(requested.orderItemId)) || 0) + quantity;
    if (!item || !Number.isInteger(quantity) || quantity < 1 || cumulativeQuantity > item.amount) {
      throw new Error('Sản phẩm hoặc số lượng đổi trả không hợp lệ');
    }
    requestedQuantities.set(String(requested.orderItemId), cumulativeQuantity);
    const itemGross = Number(item.price) * quantity;
    const productDiscount = itemGross * Number(item.discount || 0) / 100;
    const voucherShare = orderLevelDiscount * (itemGross / grossItemsPrice);
    amount += Math.max(0, itemGross - productDiscount - voucherShare);
  }
  return Math.round(Math.min(amount, Number(order.totalPrice || amount)));
}

module.exports = {
  ONLINE_PAYMENT_METHODS,
  RETURN_TYPES,
  RETURN_STATUSES,
  STATUS_TRANSITIONS,
  canTransitionOrder,
  createTrackingEvent,
  paymentExpiryDate,
  isReturnWindowOpen,
  calculateReturnAmount,
};
