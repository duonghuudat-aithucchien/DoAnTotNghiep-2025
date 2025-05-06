import axios from "axios"

export const getFilteredProducts = async (filters = {}, page = 0, limit = 10, sort = '') => {
  const params = new URLSearchParams()

  // Thêm filter params nếu có
  if (filters.type) params.append('type', filters.type)
  if (filters.colors) params.append('colors', filters.colors.join(','))
  if (filters.sizes) params.append('sizes', filters.sizes.join(','))
  if (filters.price) params.append('price', filters.price.join(','))
  if (filters.rating) params.append('rating', filters.rating)

  // Pagination
  params.append('page', page)
  params.append('limit', limit)

  // Sort nếu có (ví dụ: sort = "desc,price")
  if (sort) params.append('sort', sort)

  try {
    const res = await axios.get(`${process.env.REACT_APP_API_URL}/filter/products?${params.toString()}`)
    return res.data
  } catch (error) {
    console.error('Filter API error:', error)
    throw error
  }
}
