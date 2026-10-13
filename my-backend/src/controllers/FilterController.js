const { filterProducts: filterProductsService } = require('../services/FilterService');
const { sendError, sendServiceResult } = require('../utils/httpResponse');

const parsePaging = (req, res) => {
  const limit = Number.parseInt(req.query.limit || '10', 10);
  const page = Number.parseInt(req.query.page || '0', 10);
  if (!Number.isInteger(limit) || limit < 1 || limit > 100 || !Number.isInteger(page) || page < 0) {
    sendError(res, 'limit hoặc page không hợp lệ', 400);
    return null;
  }
  return { limit, page };
};

const filterProducts = async (req, res) => {
  try {
    const paging = parsePaging(req, res);
    if (!paging) return;
    const filters = {};
    if (req.query.colors) filters.colors = String(req.query.colors).split(',');
    if (req.query.sizes) filters.sizes = String(req.query.sizes).split(',');
    if (req.query.rating !== undefined) {
      const rating = Number(req.query.rating);
      if (!Number.isFinite(rating)) return sendError(res, 'Giá trị rating không hợp lệ', 400);
      filters.rating = rating;
    }
    if (req.query.type) filters.type = req.query.type;
    return sendServiceResult(res, await filterProductsService(filters, paging.limit, paging.page, req.query.sort || 'desc'));
  } catch (error) {
    console.error(error);
    return sendError(res, 'Đã xảy ra lỗi khi lọc sản phẩm', 500);
  }
};

const filterTopSellingProducts = async (req, res) => {
  try {
    const paging = parsePaging(req, res);
    if (!paging) return;
    return sendServiceResult(res, await filterProductsService({}, paging.limit, paging.page, 'selled'));
  } catch { return sendError(res, 'Lỗi khi lọc sản phẩm bán chạy', 500); }
};

const filterTopNewProducts = async (req, res) => {
  try {
    const paging = parsePaging(req, res);
    if (!paging) return;
    return sendServiceResult(res, await filterProductsService({}, paging.limit, paging.page, 'createdAt'));
  } catch { return sendError(res, 'Lỗi khi lọc sản phẩm mới', 500); }
};

module.exports = { filterProducts, filterTopSellingProducts, filterTopNewProducts };
