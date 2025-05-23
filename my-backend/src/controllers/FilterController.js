const { filterProducts: filterProductsService } = require('../services/FilterService');

const filterProducts = async (req, res) => {
  try {
    let { limit = 10, page = 0, sort = 'desc', colors, sizes, rating, type } = req.query;

    limit = parseInt(limit);
    page = parseInt(page);

    if (isNaN(limit) || isNaN(page)) {
      return res.status(400).json({ status: 'ERR', message: 'limit hoặc page không hợp lệ.' });
    }

    const filters = {};

    if (typeof colors === 'string' && colors.length > 0) {
      filters.colors = colors.split(',');
    }

    if (typeof sizes === 'string' && sizes.length > 0) {
      filters.sizes = sizes.split(',');
    }

    if (rating !== undefined) {
      const ratingNumber = Number(rating);
      if (isNaN(ratingNumber)) {
        return res.status(400).json({ status: 'ERR', message: 'Giá trị rating không hợp lệ.' });
      }
      filters.rating = ratingNumber;
    }

    if (type) {
      filters.type = type;
    }

    const response = await filterProductsService(filters, limit, page, sort);
    return res.status(200).json(response);
  } catch (error) {
    console.error("Lỗi khi gọi filterProducts:", error);
    return res.status(500).json({
      status: 'ERROR',
      message: 'Đã xảy ra lỗi khi lọc sản phẩm',
      error: error.message,
    });
  }
};

const filterTopSellingProducts = async (req, res) => {
  try {
    const limit = parseInt(req.query.limit) || 50;
    const page = parseInt(req.query.page) || 0;

    const filters = {}; // không cần type

    const response = await filterProductsService(filters, limit, page, 'selled'); // sort theo selled
    return res.status(200).json(response);
  } catch (error) {
    console.error("Lỗi khi gọi filterTopSellingProducts:", error);
    return res.status(500).json({
      status: 'ERROR',
      message: 'Lỗi khi lọc sản phẩm bán chạy',
      error: error.message,
    });
  }
};

const filterTopNewProducts = async (req, res) => {
  try {
    const limit = parseInt(req.query.limit) || 50;
    const page = parseInt(req.query.page) || 0;

    const filters = {};

    const response = await filterProductsService(filters, limit, page, 'createdAt'); // sort theo ngày tạo
    return res.status(200).json(response);
  } catch (error) {
    console.error("Lỗi khi gọi filterTopNewProducts:", error);
    return res.status(500).json({
      status: 'ERROR',
      message: 'Lỗi khi lọc sản phẩm mới',
      error: error.message,
    });
  }
};

module.exports = {
  filterProducts,
  filterTopSellingProducts,
  filterTopNewProducts,
};
