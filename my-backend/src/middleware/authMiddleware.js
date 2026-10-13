const jwt = require('jsonwebtoken');
const { sendError } = require('../utils/httpResponse');

const readAccessToken = (req, res) => {
  const header = req.headers.token || req.headers.authorization;
  if (!header) {
    sendError(res, 'Cần đăng nhập để tiếp tục', 401);
    return null;
  }
  const token = header.includes(' ') ? header.split(' ')[1] : header;
  try { return jwt.verify(token, process.env.ACCESS_TOKEN); }
  catch { sendError(res, 'Phiên đăng nhập không hợp lệ hoặc đã hết hạn', 401); return null; }
};

const authMiddleware = (req, res, next) => {
  const user = readAccessToken(req, res);
  if (!user) return;
  if (user.isAdmin !== true) return sendError(res, 'Cần quyền quản trị viên', 403);
  req.user = user;
  return next();
};

const authUserMiddleware = (req, res, next) => {
  const user = readAccessToken(req, res);
  if (!user) return;
  req.user = user;
  if (user.isAdmin === true) return next();

  if (req.baseUrl?.includes('user')) {
    if (req.params.id && user.id === req.params.id) return next();
    return sendError(res, 'Không có quyền truy cập tài nguyên người dùng này', 403);
  }
  if (req.body?.user && String(req.body.user) !== String(user.id)) return sendError(res, 'Không thể đặt hàng cho tài khoản khác', 403);
  if (req.path?.includes('get-all-order') && req.params.id && String(req.params.id) !== String(user.id)) return sendError(res, 'Không thể xem đơn hàng của tài khoản khác', 403);
  return next();
};

const authReviewMiddleware = (req, res, next) => {
  const user = readAccessToken(req, res);
  if (!user) return;
  if (!user.id) return sendError(res, 'Token không có mã người dùng', 403);
  req.user = { id: user.id, isAdmin: user.isAdmin === true };
  return next();
};

module.exports = { authMiddleware, authUserMiddleware, authReviewMiddleware };
