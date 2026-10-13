const jwt = require('jsonwebtoken')
const dotenv = require('dotenv')
const User = require('../models/UserModel')
dotenv.config()

const genneralAccessToken = async (payload) => {
    const access_token = jwt.sign({
        ...payload
    }, process.env.ACCESS_TOKEN, {expiresIn: '15m'})

    return access_token
}

const genneralRefreshToken = async (payload) => {
    const refresh_token = jwt.sign({
        ...payload
    }, process.env.REFRESH_TOKEN, {expiresIn: '7d'})

    return refresh_token
}

const refreshTokenJwtService = (token) => {
    return new Promise((resolve, reject) => {

        try {
            jwt.verify(token, process.env.REFRESH_TOKEN, async (err, user) => {
                if(err) {
                    return resolve({
                        status: 'ERR',
                        message: 'The authentication'
                    })
                }
                const currentUser = await User.findById(user?.id).select('+passwordChangedAt')
                if (!currentUser || (currentUser.passwordChangedAt && currentUser.passwordChangedAt.getTime() > user.iat * 1000)) {
                    return resolve({ status: 'ERR', message: 'Phiên đăng nhập đã hết hiệu lực' })
                }
                const access_token = await genneralAccessToken ({
                    id: user?.id,
                    isAdmin: user?.isAdmin
                })
                resolve({
                    status: 'OK',
                    message: 'SUCCESS',
                    access_token
                         
                })
            })   
        } catch (e) {
            reject(e)
        }
    })

}

module.exports = {
    genneralAccessToken,
    genneralRefreshToken,
    refreshTokenJwtService
}
