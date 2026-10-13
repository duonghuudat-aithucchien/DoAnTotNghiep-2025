const mongoose = require('mongoose');
const ProductService = require('../services/ProductService');
const { sendError, sendServiceResult } = require('../utils/httpResponse');

const serverError = (res, error) => {
  console.error('Product controller error:', error?.message || error);
  return sendError(res, 'Lỗi máy chủ. Vui lòng thử lại sau.', 500);
};

const createProduct = async (req, res) => {
  try {
    const { name, image, type, price, rating } = req.body;
    if (!name || !image || !type || price == null || rating == null) return sendError(res, 'Thông tin sản phẩm chưa đầy đủ', 400);
    const hasVariants = Array.isArray(req.body.variants) && req.body.variants.length > 0;
    if (!hasVariants && req.body.countInStock == null) return sendError(res, 'Vui lòng nhập tồn kho', 400);
    return sendServiceResult(res, await ProductService.createProduct(req.body), { successStatus: 201, errorStatus: 409 });
  } catch (error) {
    if (error.name === 'ValidationError') return sendError(res, error.message, 400);
    return serverError(res, error);
  }
};

const updateProduct = async (req, res) => {
  try {
    if (!mongoose.isValidObjectId(req.params.id)) return sendError(res, 'Mã sản phẩm không hợp lệ', 400);
    return sendServiceResult(res, await ProductService.updateProduct(req.params.id, req.body), { errorStatus: 404 });
  } catch (error) {
    if (error.name === 'ValidationError' || /biến thể|SKU|Tồn kho|Giá/.test(error.message)) return sendError(res, error.message, 400);
    return serverError(res, error);
  }
};

const getDetailProduct = async (req, res) => {
  try {
    if (!mongoose.isValidObjectId(req.params.id)) return sendError(res, 'Mã sản phẩm không hợp lệ', 400);
    return sendServiceResult(res, await ProductService.getDetailProduct(req.params.id), { errorStatus: 404 });
  } catch (error) { return serverError(res, error); }
};

const deleteProduct = async (req, res) => {
  try {
    if (!mongoose.isValidObjectId(req.params.id)) return sendError(res, 'Mã sản phẩm không hợp lệ', 400);
    return sendServiceResult(res, await ProductService.deleteProduct(req.params.id), { errorStatus: 404 });
  } catch (error) { return serverError(res, error); }
};

const deleteManyProduct = async (req, res) => {
  try {
    if (!Array.isArray(req.body.ids) || !req.body.ids.length) return sendError(res, 'Danh sách sản phẩm không hợp lệ', 400);
    return sendServiceResult(res, await ProductService.deleteManyProduct(req.body.ids));
  } catch (error) { return serverError(res, error); }
};

const getAllProduct = async (req, res) => {
  try {
    const { limit, page, sort, filter } = req.query;
    return sendServiceResult(res, await ProductService.getAllProduct(Number(limit) || null, Number(page) || 0, sort, filter));
  } catch (error) { return serverError(res, error); }
};

const getAllType = async (req, res) => {
  try { return sendServiceResult(res, await ProductService.getAllType()); }
  catch (error) { return serverError(res, error); }
};

const getProductByType = async (req, res) => {
  try {
    if (!req.query.type) return sendError(res, 'Thiếu loại sản phẩm', 400);
    return sendServiceResult(res, await ProductService.getProductByType(req.query.type, Number(req.query.page) || 0, Number(req.query.limit) || 10));
  } catch (error) { return serverError(res, error); }
};

const getTopSellingProducts = async (req, res) => {
  try { return sendServiceResult(res, await ProductService.getTopSellingProducts(Number(req.query.limit) || 5)); }
  catch (error) { return serverError(res, error); }
};

const getTopNewProducts = async (req, res) => {
  try { return sendServiceResult(res, await ProductService.getTopNewProducts(Number(req.query.limit) || 5)); }
  catch (error) { return serverError(res, error); }
};

const addReview = async (req, res) => {
  try {
    if (!mongoose.isValidObjectId(req.params.productId)) return sendError(res, 'Mã sản phẩm không hợp lệ', 400);
    return sendServiceResult(res, await ProductService.addReview(req.params.productId, req.user.id, req.body.rating, req.body.comment), { successStatus: 201 });
  } catch (error) {
    return sendError(res, error?.message || 'Không thể thêm đánh giá', /not found/i.test(error?.message || '') ? 404 : 400);
  }
};

const getReviews = async (req, res) => {
  try { return sendServiceResult(res, await ProductService.getReviews(req.params.productId), { errorStatus: 404 }); }
  catch (error) { return sendError(res, error?.message || 'Không thể tải đánh giá', 400); }
};

module.exports = { createProduct, updateProduct, getDetailProduct, deleteProduct, getAllProduct, deleteManyProduct, getAllType, getProductByType, getTopSellingProducts, getTopNewProducts, addReview, getReviews };
