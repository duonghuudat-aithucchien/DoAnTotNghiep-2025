import { axiosJWT } from "./UserService"

const API_URL = (process.env.REACT_APP_API_URL || 'http://localhost:3001/api').replace(/\/$/, '')

// export const createProduct = async (data) => {
//     const res = await axios.post(`${process.env.REACT_APP_API_URL}/product/create`, data)
//     return res.data
// }



export const createOrder = async (data, access_token) => {
    const res = await axiosJWT.post(`${API_URL}/order/create`, data, {
        headers: {
            token: `Bearer ${access_token}`,
        }
    })
    return res.data
}

export const getOrderbyUserId = async (id, access_token) => {
    const res = await axiosJWT.get(`${API_URL}/order/get-all-order/${id}`, {
        headers: {
            token: `Bearer ${access_token}`,
        }
    })
    return res.data
}

export const getDetailsOrder = async (id, access_token) => {
    const res = await axiosJWT.get(`${API_URL}/order/get-details-order/${id}`, {
        headers: {
            token: `Bearer ${access_token}`,
        }
    })
    return res.data
}

export const cancelOrder = async (id, access_token, orderItems) => {
    const res = await axiosJWT.delete(`${API_URL}/order/cancel-order/${id}`, {
        headers: {
            token: `Bearer ${access_token}`,
        },
    })
    return res.data
}


export const getAllOrder = async (access_token) => {
    const res = await axiosJWT.get(`${API_URL}/order/get-all-order`, {
        headers: {
            token: `Bearer ${access_token}`,
        }
    })
    return res.data
}

export const updateOrderStatus = async (id, data, access_token) => {
    const payload = typeof data === 'string' ? { status: data } : data
    const res = await axiosJWT.put(`${API_URL}/order/update-status/${id}`,
        payload,
        {
            headers: {
                token: `Bearer ${access_token}`,
            }
        }
    )
    return res.data
}

export const addTrackingEvent = async (id, data, access_token) => {
    const res = await axiosJWT.put(`${API_URL}/order/tracking/${id}`, data, {
        headers: { token: `Bearer ${access_token}` }
    })
    return res.data
}

export const createReturnRequest = async (data, access_token) => {
    const res = await axiosJWT.post(`${API_URL}/returns/create`, data, {
        headers: { token: `Bearer ${access_token}` }
    })
    return res.data
}

export const getMyReturns = async (access_token) => {
    const res = await axiosJWT.get(`${API_URL}/returns/mine`, {
        headers: { token: `Bearer ${access_token}` }
    })
    return res.data
}

export const getAllReturns = async (access_token) => {
    const res = await axiosJWT.get(`${API_URL}/returns`, {
        headers: { token: `Bearer ${access_token}` }
    })
    return res.data
}

export const updateReturnStatus = async (id, data, access_token) => {
    const res = await axiosJWT.put(`${API_URL}/returns/${id}/status`, data, {
        headers: { token: `Bearer ${access_token}` }
    })
    return res.data
}

export const processRefund = async (id, data, access_token) => {
    const res = await axiosJWT.post(`${API_URL}/returns/${id}/refund`, data, {
        headers: { token: `Bearer ${access_token}` }
    })
    return res.data
}
