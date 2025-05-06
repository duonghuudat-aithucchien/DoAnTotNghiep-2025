import { axiosJWT } from './UserService'

export const getDashboardData = async (access_token) => {
    const res = await axiosJWT.get(`${process.env.REACT_APP_API_URL}/dashboard`, {
        headers: {
            token: `Bearer ${access_token}`,
        }
    })
    return res.data
}
