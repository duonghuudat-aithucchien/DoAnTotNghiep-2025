import axios from "axios"

const API_URL = (process.env.REACT_APP_API_URL || 'http://localhost:3001/api').replace(/\/$/, '')

export const axiosJWT = axios.create()

export const getStoredAccessToken = () => {
    try {
        return JSON.parse(localStorage.getItem('access_token')) || ''
    } catch {
        return ''
    }
}

export const LoginUser = async (data) => {
    const res = await axios.post(`${API_URL}/user/sign-in`, data, { withCredentials: true });
    return res.data
}

export const SignUpUser = async (data) => {
    const res = await axios.post(`${API_URL}/user/sign-up`, data);
    return res.data
}

export const requestPasswordReset = async (email) => {
    const res = await axios.post(`${API_URL}/user/forgot-password`, { email });
    return res.data;
}

export const resetPassword = async (token, data) => {
    const res = await axios.post(`${API_URL}/user/reset-password/${encodeURIComponent(token)}`, data);
    return res.data;
}

export const getDetailsUser = async (id, access_token) => {
    const res = await axiosJWT.get(`${API_URL}/user/get-details/${id}`, {
        headers: {
            token: `Bearer ${access_token}`
        }
    });
    return res.data
}


export const getAllUser = async (access_token) => {
    const res = await axiosJWT.get(`${API_URL}/user/getAll`, {
        headers: {
            token: `Bearer ${access_token}`
        }
    });
    return res.data
}

export const refreshToken = async () => {
    const res = await axios.post(`${API_URL}/user/refresh-token`, null, {
        withCredentials: true
    });
    return res.data
}


export const logoutUser = async () => {
    const res = await axios.post(`${API_URL}/user/log-out`, null, { withCredentials: true })
    return res.data
}

export const updateUser = async (id, data, access_token) => {
    const res = await axiosJWT.put(`${API_URL}/user/update-user/${id}`, data, {
        headers: {
            token: `Bearer ${access_token}`
        }
    })
    return res.data
}

export const deleteUser = async (id, data, access_token) => {
    const res = await axiosJWT.delete(`${API_URL}/user/delete-user/${id}`, data, {
        headers: {
            token: `Bearer ${access_token}`
        }
    })
    return res.data
}

export const deleteManyUser = async (data, access_token) => {
    const res = await axiosJWT.post(`${API_URL}/user/delete-many`, data, {
        headers: {
            token: `Bearer ${access_token}`,
        }
    })
    return res.data
}
