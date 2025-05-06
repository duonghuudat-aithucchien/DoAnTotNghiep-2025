const FilterService = require('../services/FilterService')

const filterProducts = async (req, res) => {
  try {
    const { limit, page, sort, ...filters } = req.query

    // Xử lý các tham số dạng mảng
    if (filters.colors) filters.colors = filters.colors.split(',')
    if (filters.sizes) filters.sizes = filters.sizes.split(',')
    if (filters.price) filters.price = filters.price.split(',').map(Number)
    if (filters.rating) filters.rating = Number(filters.rating)

    const response = await FilterService.filterProducts(filters, Number(limit), Number(page || 0), sort?.split(','))
    return res.status(200).json(response)
  } catch (e) {
    return res.status(500).json({ status: 'ERR', message: e.message })
  }
}

module.exports = {
  filterProducts
}
