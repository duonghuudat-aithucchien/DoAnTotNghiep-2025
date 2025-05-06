const Product = require('../models/ProductModel')

const filterProducts = (filters = {}, limit, page, sort) => {
  return new Promise(async (resolve, reject) => {
    try {
      const query = {}

      // Xử lý filters
      if (filters.type) query.type = filters.type
      if (filters.colors) query.colors = { $in: filters.colors }
      if (filters.sizes) query.sizes = { $in: filters.sizes }
      if (filters.rating) query.rating = { $gte: filters.rating }
      if (filters.price) {
        const [min, max] = filters.price
        query.price = { $gte: min, $lte: max }
      }

      const total = await Product.countDocuments(query)
      let resultQuery = Product.find(query)

      // Pagination
      if (limit) {
        resultQuery = resultQuery.limit(Number(limit)).skip(Number(page) * Number(limit))
      }

      // Sorting
      if (sort) {
        const [order, field] = sort
        resultQuery = resultQuery.sort({ [field]: order === 'asc' ? 1 : -1 })
      }

      const data = await resultQuery

      resolve({
        status: 'OK',
        message: 'SUCCESS',
        data,
        total,
        pageCurrent: Number(page) + 1,
        totalPage: Math.ceil(total / limit)
      })
    } catch (error) {
      reject(error)
    }
  })
}

module.exports = {
  filterProducts
}
