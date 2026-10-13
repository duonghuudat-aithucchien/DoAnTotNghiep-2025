const crypto = require('crypto');

const hashResetToken = (token) => crypto.createHash('sha256').update(String(token)).digest('hex');

const createResetToken = () => {
  const token = crypto.randomBytes(32).toString('hex');
  return { token, tokenHash: hashResetToken(token) };
};

module.exports = { createResetToken, hashResetToken };
