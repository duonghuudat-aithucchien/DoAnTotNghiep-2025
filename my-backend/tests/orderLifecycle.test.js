const test = require('node:test');
const assert = require('node:assert/strict');
const { canTransitionOrder, paymentExpiryDate, isReturnWindowOpen, calculateReturnAmount } = require('../src/utils/orderLifecycle');

test('enforces fulfillment status transitions', () => {
  assert.equal(canTransitionOrder('pending', 'confirmed'), true);
  assert.equal(canTransitionOrder('pending', 'delivered'), false);
  assert.equal(canTransitionOrder('expired', 'confirmed'), false);
});

test('only online payments receive an expiry time', () => {
  const now = new Date('2026-01-01T00:00:00Z');
  assert.equal(paymentExpiryDate('paypal', now, 30).toISOString(), '2026-01-01T00:30:00.000Z');
  assert.equal(paymentExpiryDate('COD', now, 30), undefined);
});

test('checks return window from delivery date', () => {
  const order = { status: 'delivered', deliveredAt: new Date('2026-01-01T00:00:00Z') };
  assert.equal(isReturnWindowOpen(order, new Date('2026-01-07T23:59:59Z'), 7), true);
  assert.equal(isReturnWindowOpen(order, new Date('2026-01-09T00:00:00Z'), 7), false);
});

test('calculates return amount from server order values', () => {
  const order = {
    itemsPrice: 200000, voucherDiscount: 20000, totalPrice: 170000,
    orderItems: [{ _id: 'item1', price: 100000, amount: 2, discount: 10 }],
  };
  assert.equal(calculateReturnAmount(order, [{ orderItemId: 'item1', quantity: 1 }]), 80000);
  assert.throws(
    () => calculateReturnAmount(order, [{ orderItemId: 'item1', quantity: 2 }, { orderItemId: 'item1', quantity: 1 }]),
    /không hợp lệ/
  );
});
