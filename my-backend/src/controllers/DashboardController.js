const dashboardService = require('../services/DashboardService');
const { sendError, sendSuccess } = require('../utils/httpResponse');

const getDashboard = async (req, res) => {
  try { return sendSuccess(res, await dashboardService.getDashboardStats()); }
  catch (error) {
    console.error(error);
    return sendError(res, 'Lỗi máy chủ khi lấy dữ liệu dashboard', 500);
  }
};

module.exports = { getDashboard };
