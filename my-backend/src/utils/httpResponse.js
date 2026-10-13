const sendSuccess = (res, data, message = 'SUCCESS', statusCode = 200, meta = {}) => (
  res.status(statusCode).json({ status: 'OK', message, ...(data !== undefined ? { data } : {}), ...meta })
);

const sendError = (res, message, statusCode = 400, details) => (
  res.status(statusCode).json({ status: 'ERR', message, ...(details ? { details } : {}) })
);

const sendServiceResult = (res, result, options = {}) => {
  const successStatus = options.successStatus || 200;
  const errorStatus = options.errorStatus || 400;
  return res.status(result?.status === 'OK' ? successStatus : errorStatus).json({
    status: result?.status === 'OK' ? 'OK' : 'ERR',
    message: result?.message || (result?.status === 'OK' ? 'SUCCESS' : 'Yêu cầu không hợp lệ'),
    ...(result?.data !== undefined ? { data: result.data } : {}),
    ...Object.fromEntries(Object.entries(result || {}).filter(([key]) => !['status', 'message', 'data', 'error', 'stack'].includes(key))),
  });
};

module.exports = { sendSuccess, sendError, sendServiceResult };
