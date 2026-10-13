import axios from "axios"

const API_URL = (process.env.REACT_APP_API_URL || 'http://localhost:3001/api').replace(/\/$/, '')

export const getConfig = async () => {
    const res = await axios.get(`${API_URL}/payment/config`)
    return res.data
}

export const getVietQRConfig = async () => {
    const res = await axios.get(`${API_URL}/payment/vietqr/config`)
    return res.data
}

export const createVNPayPayment = async (data, accessToken) => {
    const res = await axios.post(`${API_URL}/payment/vnpay/create-payment-url`, data, {
        headers: { token: `Bearer ${accessToken}` }
    })
    return res.data
}

export const verifyPayPalPayment = async (data, accessToken) => {
    const res = await axios.post(`${API_URL}/payment/paypal/verify`, data, {
        headers: { token: `Bearer ${accessToken}` }
    })
    return res.data
}

export const verifyVNPayReturn = async (queryString) => {
    const res = await axios.get(`${API_URL}/payment/vnpay/vnpay-return?${queryString}`)
    return res.data
}
