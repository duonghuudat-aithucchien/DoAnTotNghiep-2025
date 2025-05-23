import axios from "axios"
import { axiosJWT } from "./UserService"

export const getAllProduct = async (search, limit) => {
    let res = {}
    if(search?.length > 0 ) {
        res = await axios.get(`${process.env.REACT_APP_API_URL}/product/get-all?filter=name&filter=${search}&limit=${limit}`)
    } else {
        res = await axios.get(`${process.env.REACT_APP_API_URL}/product/get-all?limit=${limit}`)
    }
    return res.data
}

// export const getAllProduct = async (search, limit) => {
//     const params = new URLSearchParams()
//     if (search?.length > 0) {
//       params.append('filter', `name:${search}`)
//     }
//     if (limit) {
//       params.append('limit', limit)
//     }
  
//     const res = await axios.get(`${process.env.REACT_APP_API_URL}/product/get-all?${params.toString()}`)
//     return res.data
//   }
  
  

export const getProductType = async (type, page, limit) => {
    if(type) {
        const res = await axios.get(`${process.env.REACT_APP_API_URL}/product/get-all?filter=type&filter=${type}&limit=${limit}&page=${page}`)
        return res.data
    }
}


export const createProduct = async (data) => {
    const res = await axios.post(`${process.env.REACT_APP_API_URL}/product/create`, data)
    return res.data
}

export const getDetailsProduct = async (id) => {
    const res = await axios.get(`${process.env.REACT_APP_API_URL}/product/get-details/${id}`)
    return res.data
}

export const updateProduct = async (id, access_token, data) => {
    const res = await axiosJWT.put(`${process.env.REACT_APP_API_URL}/product/update/${id}`, data, {
        headers: {
            token: `Bearer ${access_token}`,
        }
    })
    return res.data
}

export const deleteProduct = async (id, access_token) => {
    const res = await axiosJWT.delete(`${process.env.REACT_APP_API_URL}/product/delete/${id}`, {
        headers: {
            token: `Bearer ${access_token}`,
        }
    })
    return res.data
}

export const deleteManyProduct = async (data, access_token) => {
    const res = await axiosJWT.post(`${process.env.REACT_APP_API_URL}/product/delete-many`, data, {
        headers: {
            token: `Bearer ${access_token}`,
        }
    })
    return res.data
}

export const getAllTypeProduct = async () => {
    const res = await axios.get(`${process.env.REACT_APP_API_URL}/product/get-all-type`)
    return res.data
}

export const getProductByType = async (type, limit = 5) => {
    const res = await axios.get(`${process.env.REACT_APP_API_URL}/product/get-by-type?type=${type}&limit=${limit}`)
    return res.data
  }
  
export const getTopSellingProducts = async (limit = 5) => {
    const res = await axios.get(`${process.env.REACT_APP_API_URL}/product/top-selling?limit=${limit}`)
    return res.data
  }
  
export const getTopNewProducts = async (limit = 5) => {
const res = await axios.get(`${process.env.REACT_APP_API_URL}/product/top-new?limit=${limit}`)
return res.data
}
  
export const addReview = async (productId, rating, comment, access_token) => {
    try {
        const res = await axiosJWT.post(
            `${process.env.REACT_APP_API_URL}/product/${productId}/reviews`,
            { rating, comment },
            {
                headers: {
                    token: `Bearer ${access_token}`,
                },
            }
        );
        return res.data;
    } catch (error) {
        console.error('Error adding review:', error);
        return {
            status: 'ERR',
            message: error.response?.data?.message || 'An error occurred while adding the review',
        };
    }
};

export const getReviews = async (productId) => {
    try {
        const res = await axios.get(`${process.env.REACT_APP_API_URL}/product/${productId}/reviews`);
        return res.data;
    } catch (error) {
        console.error('Error fetching reviews:', error);
        return {
            status: 'ERR',
            message: error.response?.data?.message || 'An error occurred while fetching reviews',
        };
    }
};