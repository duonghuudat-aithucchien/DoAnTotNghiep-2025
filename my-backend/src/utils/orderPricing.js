const SHIPPING_LOW_ORDER = 20000;
const SHIPPING_MEDIUM_ORDER = 10000;
const FREE_SHIPPING_THRESHOLD = 500000;
const MEDIUM_SHIPPING_THRESHOLD = 200000;

function calculateShippingPrice(itemsPrice) {
  if (itemsPrice >= FREE_SHIPPING_THRESHOLD) return 0;
  if (itemsPrice >= MEDIUM_SHIPPING_THRESHOLD) return SHIPPING_MEDIUM_ORDER;
  return SHIPPING_LOW_ORDER;
}

function calculateProductDiscount(price, amount, discountPercent = 0) {
  const safeDiscount = Math.min(100, Math.max(0, Number(discountPercent) || 0));
  return Math.round(Number(price) * Number(amount) * safeDiscount / 100);
}

function calculateVoucherDiscount(voucher, eligibleAmount) {
  if (!voucher) return 0;
  let amount = voucher.discountType === 'percent'
    ? eligibleAmount * Number(voucher.discountValue) / 100
    : Number(voucher.discountValue);
  if (voucher.maxDiscountAmount != null) {
    amount = Math.min(amount, Number(voucher.maxDiscountAmount));
  }
  return Math.round(Math.min(Math.max(amount, 0), eligibleAmount));
}

function calculateOrderTotals(items, voucher = null) {
  const itemsPrice = items.reduce((total, item) => total + Number(item.price) * Number(item.amount), 0);
  const discountPrice = items.reduce(
    (total, item) => total + calculateProductDiscount(item.price, item.amount, item.discount), 0
  );
  const discountedItemsPrice = Math.max(0, itemsPrice - discountPrice);
  const voucherDiscount = calculateVoucherDiscount(voucher, itemsPrice);
  const shippingPrice = calculateShippingPrice(itemsPrice);
  const totalPrice = Math.max(0, discountedItemsPrice - voucherDiscount + shippingPrice);
  return { itemsPrice, discountPrice, voucherDiscount, shippingPrice, totalPrice };
}

module.exports = { calculateOrderTotals, calculateShippingPrice, calculateVoucherDiscount };
