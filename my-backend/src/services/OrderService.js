const mongoose = require('mongoose');
const Order = require('../models/OrderProduct');
const Product = require('../models/ProductModel');
const User = require('../models/UserModel');
const Voucher = require('../models/VoucherModel');
const EmailService = require('./EmailService');
const { calculateOrderTotals } = require('../utils/orderPricing');

const CANCELLABLE_STATUSES = ['pending', 'confirmed'];
const STATUS_TRANSITIONS = {
  pending: ['confirmed', 'cancelled'],
  confirmed: ['shipping', 'cancelled'],
  shipping: ['delivered'],
  delivered: [],
  cancelled: [],
};

function normalizeOrderItems(requestedItems, productsById) {
  return requestedItems.map((requestedItem) => {
    const product = productsById.get(String(requestedItem.product));
    if (!product) throw new Error(`Sản phẩm ${requestedItem.product} không tồn tại`);
    const amount = Number(requestedItem.amount);
    if (!Number.isInteger(amount) || amount < 1) throw new Error(`Số lượng của ${product.name} không hợp lệ`);
    return {
      name: product.name,
      amount,
      image: product.image,
      price: product.price,
      discount: product.discount || 0,
      product: product._id,
      sizes: Array.isArray(requestedItem.sizes) ? requestedItem.sizes : [],
      colors: Array.isArray(requestedItem.colors) ? requestedItem.colors : [],
    };
  });
}

async function findValidVoucher(code, eligibleAmount, session) {
  if (!code) return null;
  const now = new Date();
  const voucher = await Voucher.findOne({
    code: String(code).trim().toUpperCase(),
    isActive: true,
    startDate: { $lte: now },
    endDate: { $gte: now },
    $expr: { $lt: ['$usedCount', '$usageLimit'] },
  }).session(session);
  if (!voucher) throw new Error('Voucher không hợp lệ hoặc đã hết lượt sử dụng');
  if (eligibleAmount < voucher.minOrderValue) throw new Error(`Đơn hàng chưa đạt giá trị tối thiểu ${voucher.minOrderValue}`);
  return voucher;
}

async function createOrder(input, authenticatedUserId) {
  const session = await mongoose.startSession();
  let createdOrder;
  let canonicalItems;
  let customerEmail;
  try {
    await session.withTransaction(async () => {
      const requestedItems = input.orderItems || [];
      if (!requestedItems.length) throw new Error('Đơn hàng phải có ít nhất một sản phẩm');
      const productIds = requestedItems.map((item) => item.product);
      const products = await Product.find({ _id: { $in: productIds } }).session(session);
      const productsById = new Map(products.map((product) => [String(product._id), product]));
      canonicalItems = normalizeOrderItems(requestedItems, productsById);

      const initialTotals = calculateOrderTotals(canonicalItems);
      const voucher = await findValidVoucher(
        input.voucherCode,
        initialTotals.itemsPrice,
        session
      );
      const totals = calculateOrderTotals(canonicalItems, voucher);

      for (const item of canonicalItems) {
        const updated = await Product.findOneAndUpdate(
          { _id: item.product, countInStock: { $gte: item.amount } },
          { $inc: { countInStock: -item.amount, selled: item.amount } },
          { new: true, session }
        );
        if (!updated) throw new Error(`${item.name} không đủ hàng`);
      }

      if (voucher) {
        const updatedVoucher = await Voucher.findOneAndUpdate(
          { _id: voucher._id, $expr: { $lt: ['$usedCount', '$usageLimit'] } },
          { $inc: { usedCount: 1 } },
          { new: true, session }
        );
        if (!updatedVoucher) throw new Error('Voucher vừa hết lượt sử dụng');
      }

      const user = await User.findById(authenticatedUserId).select('email').session(session);
      if (!user) throw new Error('Người dùng không tồn tại');
      customerEmail = user.email;
      const documents = await Order.create([{
        orderItems: canonicalItems,
        shippingAddress: {
          fullName: input.fullName,
          address: input.address,
          city: input.city,
          phone: input.phone,
        },
        paymentMethod: input.paymentMethod,
        ...totals,
        voucherCode: voucher?.code || '',
        user: authenticatedUserId,
        isPaid: false,
        status: 'pending',
      }], { session });
      createdOrder = documents[0];
    });
  } catch (error) {
    return { status: 'ERR', message: error.message };
  } finally {
    await session.endSession();
  }

  EmailService.sendEmailCreateOrder(customerEmail, canonicalItems)
    .catch((error) => console.error('Không thể gửi email xác nhận:', error.message));
  return { status: 'OK', message: 'Đặt hàng thành công', data: createdOrder };
}

async function getAllDetailsOrder(userId) {
  const orders = await Order.find({ user: userId }).sort({ createdAt: -1 });
  return { status: 'OK', message: 'SUCCESS', data: orders };
}

async function getOrderDetails(orderId, requester) {
  if (!mongoose.Types.ObjectId.isValid(orderId)) return { status: 'ERR', message: 'Mã đơn hàng không hợp lệ' };
  const query = requester.isAdmin === true ? { _id: orderId } : { _id: orderId, user: requester.id };
  const order = await Order.findOne(query);
  if (!order) return { status: 'ERR', message: 'Không tìm thấy đơn hàng hoặc bạn không có quyền truy cập' };
  return { status: 'OK', message: 'SUCCESS', data: order };
}

async function cancelOrderDetails(orderId, requester) {
  const session = await mongoose.startSession();
  let cancelledOrder;
  try {
    await session.withTransaction(async () => {
      const query = { _id: orderId, status: { $in: CANCELLABLE_STATUSES }, isPaid: false };
      if (requester.isAdmin !== true) query.user = requester.id;
      cancelledOrder = await Order.findOneAndUpdate(query, { status: 'cancelled' }, { new: true, session });
      if (!cancelledOrder) throw new Error('Không thể hủy đơn đã thanh toán, đang giao hoặc không thuộc tài khoản này');
      for (const item of cancelledOrder.orderItems) {
        await Product.updateOne(
          { _id: item.product },
          { $inc: { countInStock: item.amount, selled: -item.amount } },
          { session }
        );
      }
      if (cancelledOrder.voucherCode) {
        await Voucher.updateOne(
          { code: cancelledOrder.voucherCode, usedCount: { $gt: 0 } },
          { $inc: { usedCount: -1 } },
          { session }
        );
      }
    });
    return { status: 'OK', message: 'Hủy đơn hàng thành công', data: cancelledOrder };
  } catch (error) {
    return { status: 'ERR', message: error.message };
  } finally {
    await session.endSession();
  }
}

async function getAllOrder() {
  const orders = await Order.find().sort({ createdAt: -1 });
  return { status: 'OK', message: 'SUCCESS', data: orders };
}

async function updateOrderStatus(orderId, newStatus) {
  if (newStatus === 'cancelled') return cancelOrderDetails(orderId, { isAdmin: true });
  const order = await Order.findById(orderId);
  if (!order) return { status: 'ERR', message: 'Không tìm thấy đơn hàng' };
  if (!STATUS_TRANSITIONS[order.status]?.includes(newStatus)) {
    return { status: 'ERR', message: `Không thể chuyển từ ${order.status} sang ${newStatus}` };
  }
  order.status = newStatus;
  if (newStatus === 'delivered') {
    order.isDelivered = true;
    order.deliveredAt = new Date();
    if (['COD', 'later_money'].includes(order.paymentMethod) && !order.isPaid) {
      order.isPaid = true;
      order.paidAt = new Date();
    }
  }
  await order.save();
  return { status: 'OK', message: 'Cập nhật trạng thái thành công', data: order };
}

module.exports = { createOrder, getAllDetailsOrder, getOrderDetails, cancelOrderDetails, getAllOrder, updateOrderStatus };
