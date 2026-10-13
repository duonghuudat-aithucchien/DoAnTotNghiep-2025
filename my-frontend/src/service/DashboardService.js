import { axiosJWT } from './UserService'

const API_URL = (process.env.REACT_APP_API_URL || 'http://localhost:3001/api').replace(/\/$/, '')

export const getDashboardData = async (access_token) => {
    const res = await axiosJWT.get(`${API_URL}/dashboard`, {
        headers: {
            token: `Bearer ${access_token}`,
        }
    })
    return res.data.data
}
