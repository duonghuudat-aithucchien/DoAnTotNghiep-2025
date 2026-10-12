const test = require('node:test');
const assert = require('node:assert/strict');
const {
  calculateOrderTotals,
  calculateShippingPrice,
  calculateVoucherDiscount,
} = require('../src/utils/orderPricing');

test('calculates product, voucher and shipping discounts on the server', () => {
  const items = [
    { price: 200000, amount: 2, discount: 10 },
    { price: 100000, amount: 1, discount: 0 },
  ];
  const voucher = { discountType: 'percent', discountValue: 20, maxDiscountAmount: 50000 };
  assert.deepEqual(calculateOrderTotals(items, voucher), {
    itemsPrice: 500000,
    discountPrice: 40000,
    voucherDiscount: 50000,
    shippingPrice: 0,
    totalPrice: 410000,
  });
});

test('uses the configured shipping tiers', () => {
  assert.equal(calculateShippingPrice(199999), 20000);
  assert.equal(calculateShippingPrice(200000), 10000);
  assert.equal(calculateShippingPrice(500000), 0);
});

test('never discounts more than the eligible amount', () => {
  assert.equal(calculateVoucherDiscount({ discountType: 'fixed', discountValue: 300000 }, 100000), 100000);
});
