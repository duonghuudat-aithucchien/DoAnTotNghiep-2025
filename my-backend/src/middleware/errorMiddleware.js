// Middleware xử lý route không tồn tại (404)
const notFound = (req, res, next) => {
  const error = new Error(`Không tìm thấy đường dẫn - ${req.originalUrl}`);
  res.status(404);
  next(error);
};

// Middleware xử lý lỗi tập trung
const errorHandler = (err, req, res, next) => {
  const statusCode = err.statusCode || (res.statusCode === 200 ? 500 : res.statusCode);
  res.status(statusCode).json({
    status: 'ERR',
    message: err.message,
    ...(process.env.NODE_ENV === 'production' ? {} : { stack: err.stack }),
  });
};

module.exports = {
  notFound,
  errorHandler,
};
