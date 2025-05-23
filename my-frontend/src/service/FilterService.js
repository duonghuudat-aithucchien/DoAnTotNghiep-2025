import axios from "axios";

export const getFilteredProducts = async (filters = {}, page = 0, limit = 10, sort = '') => {
  try {
    const params = new URLSearchParams();

    if (filters.type) {
      params.append('type', filters.type);
    }

    if (filters.colors?.length) {
      params.append('colors', filters.colors.join(','));
    }

    if (filters.sizes?.length) {
      params.append('sizes', filters.sizes.join(','));
    }

    if (Array.isArray(filters.rating) && filters.rating.length > 0) {
      const minRating = Math.min(...filters.rating);
      if (!isNaN(minRating)) {
        params.append('rating', minRating);
      }
    } else if (!isNaN(filters.rating)) {
      params.append('rating', filters.rating);
    }
    

    params.append('page', page);
    params.append('limit', limit);

    if (sort === 'asc' || sort === 'desc') {
      params.append('sort', sort);
    }

    const response = await axios.get(`${process.env.REACT_APP_API_URL}/filter/products?${params.toString()}`);
    return response.data;
  } catch (error) {
    console.error('Filter API error:', error.response?.data || error.message);
    throw new Error(error.response?.data?.message || 'Lỗi khi gọi API lọc sản phẩm');
  }
};
export const getTopSellingFilteredProducts = async (limit = 50, page = 0) => {
  try {
    const response = await axios.get(`${process.env.REACT_APP_API_URL}/filter/products/top-selling?limit=${limit}&page=${page}`);
    return response.data;
  } catch (error) {
    console.error('Top Selling API error:', error.response?.data || error.message);
    throw new Error('Lỗi khi gọi API top-selling');
  }
};

export const getTopNewFilteredProducts = async (limit = 50, page = 0) => {
  try {
    const response = await axios.get(`${process.env.REACT_APP_API_URL}/filter/products/top-new?limit=${limit}&page=${page}`);
    return response.data;
  } catch (error) {
    console.error('Top New API error:', error.response?.data || error.message);
    throw new Error('Lỗi khi gọi API top-new');
  }
};