const test = require('node:test');
const assert = require('node:assert/strict');
const express = require('express');
const router = require('../src/routes/ChatbotRouter');

test('chatbot policies contain no credentials and private eligibility requires auth', async () => {
  const app = express();
  app.use('/api/chatbot', router);
  const server = app.listen(0, '127.0.0.1');
  await new Promise((resolve) => server.once('listening', resolve));
  try {
    const base = `http://127.0.0.1:${server.address().port}/api/chatbot`;
    const response = await fetch(`${base}/policies`);
    assert.equal(response.status, 200);
    const data = await response.json();
    assert.equal(data.status, 'OK');
    assert.equal(data.data.returns.approvalRequired, true);
    assert.equal(data.data.payment.methods[0].id, 'COD');
    const serialized = JSON.stringify(data);
    assert.ok(!serialized.includes('ACCESS_TOKEN'));
    assert.ok(!serialized.includes('MONGO_URI'));
    assert.equal((await fetch(`${base}/returns/507f1f77bcf86cd799439011/eligibility`)).status, 401);
    assert.equal((await fetch(`${base}/orders/507f1f77bcf86cd799439011/tracking`)).status, 401);
  } finally { await new Promise((resolve) => server.close(resolve)); }
});

test('shopping tracking restricts admins to their own orders and never exposes addresses', async () => {
  const jwt = require('jsonwebtoken');
  const Order = require('../src/models/OrderProduct');
  const original = Order.findOne;
  const oldSecret = process.env.ACCESS_TOKEN;
  process.env.ACCESS_TOKEN = 'test-only-chatbot-key-with-more-than-32-characters';
  const owner = '507f1f77bcf86cd799439011';
  let actualQuery;
  Order.findOne = (query) => {
    actualQuery = query;
    return { select: async () => ({ status: 'shipping', shippingAddress: { phone: 'private' }, trackingHistory: [{ title: 'Đang giao', status: 'shipping', createdBy: 'private-staff', createdAt: '2026-10-12' }] }) };
  };
  const app = express(); app.use('/api/chatbot', router);
  const server = app.listen(0, '127.0.0.1');
  await new Promise((resolve) => server.once('listening', resolve));
  try {
    const token = jwt.sign({ id: owner, isAdmin: true }, process.env.ACCESS_TOKEN, { expiresIn: '1m' });
    const response = await fetch(`http://127.0.0.1:${server.address().port}/api/chatbot/orders/${owner}/tracking`, { headers: { Authorization: `Bearer ${token}` } });
    assert.equal(response.status, 200);
    assert.equal(actualQuery.user, owner);
    const body = await response.json();
    assert.ok(!JSON.stringify(body).includes('private'));
  } finally {
    Order.findOne = original;
    if (oldSecret === undefined) delete process.env.ACCESS_TOKEN; else process.env.ACCESS_TOKEN = oldSecret;
    await new Promise((resolve) => server.close(resolve));
  }
});
