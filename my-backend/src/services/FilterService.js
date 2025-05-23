const Product = require('../models/ProductModel');

const filterProducts = (filters = {}, limit, page, sort) => {
  return new Promise(async (resolve, reject) => {
    try {
      const query = {};

      // Type filter
      if (filters.type) {
        query.type = filters.type;
      }

      // Colors filter
      if (Array.isArray(filters.colors) && filters.colors.length > 0) {
        query.colors = { $in: filters.colors };
      }

      // Sizes filter
      if (Array.isArray(filters.sizes) && filters.sizes.length > 0) {
        query.sizes = { $in: filters.sizes };
      }

      // Rating filter
      if (!isNaN(filters.rating)) {
        query.rating = { $gte: Number(filters.rating) };
      }

      // Pagination + Sorting
      const limitNumber = parseInt(limit) || 10;
      const pageNumber = parseInt(page) || 0;

      let resultQuery = Product.find(query)
        .limit(limitNumber)
        .skip(pageNumber * limitNumber);

      if (sort === 'asc') {
        resultQuery = resultQuery.sort({ price: 1 });
      } else if (sort === 'desc') {
        resultQuery = resultQuery.sort({ price: -1 });
      }

      const data = await resultQuery;
      const total = await Product.countDocuments(query);

      // ✅ Lấy filters khả dụng theo type (nếu có) bằng aggregation
      const filterListQuery = {};
      if (filters.type) {
        filterListQuery.type = filters.type;
      }

      const sizesAgg = await Product.aggregate([
        { $match: filterListQuery },
        { $unwind: '$sizes' },
        { $match: { sizes: { $ne: '' } } }, // bỏ trống
        { $group: { _id: null, sizes: { $addToSet: '$sizes' } } },
      ]);

      const colorsAgg = await Product.aggregate([
        { $match: filterListQuery },
        { $unwind: '$colors' },
        { $match: { colors: { $ne: '' } } }, // bỏ trống
        { $group: { _id: null, colors: { $addToSet: '$colors' } } },
      ]);

      const sizes = sizesAgg[0]?.sizes || [];
      const colors = colorsAgg[0]?.colors || [];

      resolve({
        status: 'OK',
        message: 'SUCCESS',
        data,
        total,
        pageCurrent: pageNumber + 1,
        totalPage: Math.ceil(total / limitNumber),
        filtersAvailable: {
          sizes,
          colors,
        },
      });
    } catch (error) {
      console.error('Error filtering products:', error);
      reject({
        status: 'ERROR',
        message: 'Failed to filter products',
        error: error.message,
      });
    }
  });
};

const extractFiltersFromList = (products) => {
  const sizesSet = new Set();
  const colorsSet = new Set();

  products.forEach((product) => {
    (product.sizes || []).forEach((s) => sizesSet.add(s));
    (product.colors || []).forEach((c) => colorsSet.add(c));
  });

  return {
    sizes: Array.from(sizesSet),
    colors: Array.from(colorsSet),
  };
};

// Top bán chạy
const filterTopSellingProducts = async (req, res) => {
  try {
    const limit = parseInt(req.query.limit) || 50;
    const products = await Product.find({})
      .sort({ selled: -1 })
      .limit(limit);

    const filtersAvailable = extractFiltersFromList(products);

    res.status(200).json({
      status: 'OK',
      message: 'SUCCESS',
      data: [],
      filtersAvailable,
    });
  } catch (error) {
    res.status(500).json({
      status: 'ERROR',
      message: 'Failed to fetch top-selling filters',
      error: error.message,
    });
  }
};

// Sản phẩm mới
const filterTopNewProducts = async (req, res) => {
  try {
    const limit = parseInt(req.query.limit) || 50;
    const products = await Product.find({})
      .sort({ createdAt: -1 })
      .limit(limit);

    const filtersAvailable = extractFiltersFromList(products);

    res.status(200).json({
      status: 'OK',
      message: 'SUCCESS',
      data: [],
      filtersAvailable,
    });
  } catch (error) {
    res.status(500).json({
      status: 'ERROR',
      message: 'Failed to fetch top-new filters',
      error: error.message,
    });
  }
};

module.exports = {
  filterProducts,
  filterTopSellingProducts,
  filterTopNewProducts,
};
