const UserService = require('../services/UserService');
const JwtService = require('../services/JwtService');
const { sendError, sendServiceResult, sendSuccess } = require('../utils/httpResponse');

const emailPattern = /^\S+@\S+\.\S+$/;
const serverError = (res) => sendError(res, 'Lỗi máy chủ. Vui lòng thử lại sau.', 500);

const creatUser = async (req, res) => {
  try {
    const { email, password, confirmPassword } = req.body;
    if (!email || !password || !confirmPassword) return sendError(res, 'Vui lòng nhập đầy đủ thông tin', 400);
    if (!emailPattern.test(email)) return sendError(res, 'Email không hợp lệ', 400);
    if (password !== confirmPassword) return sendError(res, 'Mật khẩu xác nhận không khớp', 400);
    if (password.length < 8) return sendError(res, 'Mật khẩu phải có ít nhất 8 ký tự', 400);
    const result = await UserService.creatUser(req.body);
    return sendServiceResult(res, result, { successStatus: 201, errorStatus: 409 });
  } catch (error) {
    console.error('Create user error:', error.message);
    return serverError(res);
  }
};

const loginUser = async (req, res) => {
  try {
    const { email, password } = req.body;
    if (!email || !password || !emailPattern.test(email)) return sendError(res, 'Email hoặc mật khẩu không hợp lệ', 400);
    const result = await UserService.loginUser(req.body);
    if (result.status !== 'OK') return sendServiceResult(res, result, { errorStatus: 401 });
    const { refresh_token, ...publicResult } = result;
    res.cookie('refresh_token', refresh_token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: process.env.NODE_ENV === 'production' ? 'none' : 'lax',
      maxAge: 7 * 24 * 60 * 60 * 1000,
      path: '/api/user',
    });
    return res.status(200).json(publicResult);
  } catch (error) {
    console.error('Login error:', error.message);
    return serverError(res);
  }
};

const updateUser = async (req, res) => {
  try {
    if (!req.params.id) return sendError(res, 'Thiếu mã người dùng', 400);
    return sendServiceResult(res, await UserService.updateUser(req.params.id, req.body), { errorStatus: 404 });
  } catch { return serverError(res); }
};

const deleteUser = async (req, res) => {
  try {
    if (!req.params.id) return sendError(res, 'Thiếu mã người dùng', 400);
    return sendServiceResult(res, await UserService.deleteUser(req.params.id), { errorStatus: 404 });
  } catch { return serverError(res); }
};

const deleteManyUser = async (req, res) => {
  try {
    if (!Array.isArray(req.body.ids) || !req.body.ids.length) return sendError(res, 'Danh sách người dùng không hợp lệ', 400);
    return sendServiceResult(res, await UserService.deleteManyUser(req.body.ids));
  } catch { return serverError(res); }
};

const getAllUser = async (req, res) => {
  try { return sendServiceResult(res, await UserService.getAllUser()); }
  catch { return serverError(res); }
};

const getDetailUser = async (req, res) => {
  try {
    if (!req.params.id) return sendError(res, 'Thiếu mã người dùng', 400);
    return sendServiceResult(res, await UserService.getDetailUser(req.params.id), { errorStatus: 404 });
  } catch { return serverError(res); }
};

const refreshToken = async (req, res) => {
  try {
    if (!req.cookies.refresh_token) return sendError(res, 'Thiếu refresh token', 401);
    return sendServiceResult(res, await JwtService.refreshTokenJwtService(req.cookies.refresh_token), { errorStatus: 401 });
  } catch { return sendError(res, 'Refresh token không hợp lệ hoặc đã hết hạn', 401); }
};

const logoutUser = async (req, res) => {
  res.clearCookie('refresh_token', { path: '/api/user' });
  return sendSuccess(res, undefined, 'Đăng xuất thành công');
};

const forgotPassword = async (req, res) => {
  try {
    const email = String(req.body.email || '').trim().toLowerCase();
    if (!emailPattern.test(email)) return sendError(res, 'Email không hợp lệ', 400);
    return sendServiceResult(res, await UserService.requestPasswordReset(email));
  } catch (error) {
    console.error('Forgot password error:', error.message);
    return sendError(res, 'Chưa thể gửi email đặt lại mật khẩu. Vui lòng thử lại sau.', 503);
  }
};

const resetPassword = async (req, res) => {
  try {
    const { password, confirmPassword } = req.body;
    if (!password || password.length < 8) return sendError(res, 'Mật khẩu phải có ít nhất 8 ký tự', 400);
    if (password !== confirmPassword) return sendError(res, 'Mật khẩu xác nhận không khớp', 400);
    return sendServiceResult(res, await UserService.resetPassword(req.params.token, password));
  } catch { return serverError(res); }
};

module.exports = { creatUser, loginUser, updateUser, deleteUser, getAllUser, getDetailUser, refreshToken, logoutUser, deleteManyUser, forgotPassword, resetPassword };
