import axios from "axios"

export const getConfig = async () => {
    const res = await axios.get(`${process.env.REACT_APP_API_URL}/payment/config`)
    return res.data
}

export const getVietQRConfig = async () => {
    const res = await axios.get(`${process.env.REACT_APP_API_URL}/payment/vietqr/config`)
    return res.data
}

export const createVNPayPayment = async (data, accessToken) => {
    const res = await axios.post(`${process.env.REACT_APP_API_URL}/payment/vnpay/create-payment-url`, data, {
        headers: { token: `Bearer ${accessToken}` }
    })
    return res.data
}

export const verifyPayPalPayment = async (data, accessToken) => {
    const res = await axios.post(`${process.env.REACT_APP_API_URL}/payment/paypal/verify`, data, {
        headers: { token: `Bearer ${accessToken}` }
    })
    return res.data
}

export const verifyVNPayReturn = async (queryString) => {
    const res = await axios.get(`${process.env.REACT_APP_API_URL}/payment/vnpay/vnpay-return?${queryString}`)
    return res.data
}
