const test = require('node:test');
const assert = require('node:assert/strict');
const { createResetToken, hashResetToken } = require('../src/utils/passwordReset');

test('creates a one-way password reset token', () => {
  const { token, tokenHash } = createResetToken();
  assert.equal(token.length, 64);
  assert.notEqual(token, tokenHash);
  assert.equal(hashResetToken(token), tokenHash);
});
