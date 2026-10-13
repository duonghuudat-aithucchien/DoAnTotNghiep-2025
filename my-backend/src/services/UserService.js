const User = require("../models/UserModel")
const bcrypt = require("bcrypt")
const { genneralAccessToken, genneralRefreshToken } = require("./JwtService")
const EmailService = require('./EmailService')
const { createResetToken, hashResetToken } = require('../utils/passwordReset')

const PUBLIC_USER_FIELDS = 'name email isAdmin phone address avatar city createdAt updatedAt'
const ALLOWED_PROFILE_FIELDS = ['name', 'phone', 'address', 'avatar', 'city']

const toPublicUser = (user) => {
    if (!user) return null
    const value = user.toObject ? user.toObject() : { ...user }
    delete value.password
    delete value.__v
    return value
}

const creatUser = (newUser) => {
    return new Promise(async (resolve, reject) => {
        const { name, email, password, confirmPassword, phone} =newUser

        try {
            const checkUser = await User.findOne({
                email: email.toLowerCase().trim()
            })
           if(checkUser !== null) {
                return resolve({
                    status: 'ERR',
                    message: 'The email is already'
                })
           }
        //    if (password !== confirmPassword) {
        //     return resolve({
        //         status: 'ERR',
        //         message: 'Passwords do not match'
        //     });
        // }
           const hash = bcrypt.hashSync(password, 10) // ma hoa password
            const createdUser = await User.create({
                name, 
                email: email.toLowerCase().trim(),
                password: hash, 
                confirmPassword: hash, 
                phone
            })
            if(createdUser) {
                resolve({
                    status: 'OK',
                    message: 'SUCCESS',
                    data: toPublicUser(createdUser)
                })
            }
        } catch (e) {
            reject(e)
        }
    })
}

const loginUser = (userLogin) => {
    return new Promise(async (resolve, reject) => {
        const { email, password} =userLogin

        try {
            const checkUser = await User.findOne({
                email: email.toLowerCase().trim()
            }).select('+password')
           if(checkUser === null) {
                return resolve({
                    status: 'ERR',
                    message: 'The user is not defined'
                })
           }
           const comparePassword = bcrypt.compareSync(password, checkUser.password)
            if(!comparePassword) {
                return resolve({
                    status: 'ERR',
                    message: 'The password or user is incorrect'
                })
            }

            //Xac thuc jwt jsonwebtoken
            const access_token = await genneralAccessToken({
                id: checkUser.id,
                isAdmin: checkUser.isAdmin === true
            })

            const refresh_token = await genneralRefreshToken({
                id: checkUser.id,
                isAdmin: checkUser.isAdmin === true
            })

            resolve({
                status: 'OK',
                message: 'SUCCESS',
                access_token,
                refresh_token      
            })
            //
            
        } catch (e) {
            reject(e)
        }
    })
}

const updateUser = (id, data) => {
    return new Promise(async (resolve, reject) => {

        try {
            const checkUser = await User.findOne({
                _id: id
            })
            if(checkUser === null) {
                return resolve({
                    status: 'ERR',
                    message: 'The user is not defined'
                })
            }

            const safeUpdates = ALLOWED_PROFILE_FIELDS.reduce((result, field) => {
                if (Object.prototype.hasOwnProperty.call(data, field)) result[field] = data[field]
                return result
            }, {})
            const updatedUser = await User.findByIdAndUpdate(id, safeUpdates, {
                new: true,
                runValidators: true,
            }).select(PUBLIC_USER_FIELDS)
            resolve({
                status: 'OK',
                message: 'SUCCESS',
                data: toPublicUser(updatedUser)
                     
            })
            //
            
        } catch (e) {
            reject(e)
        }
    })
}

const deleteUser = (id) => {
    return new Promise(async (resolve, reject) => {

        try {
            const checkUser = await User.findOne({
                _id: id
            })
            if(checkUser === null) {
                return resolve({
                    status: 'ERR',
                    message: 'The user is not defined'
                })
            }

            await User.findByIdAndDelete(id)
            resolve({
                status: 'OK',
                message: 'Delete SUCCESS'
                     
            })
            //
            
        } catch (e) {
            reject(e)
        }
    })
}

const deleteManyUser = (ids) => {
    return new Promise(async (resolve, reject) => {

        try {
            await User.deleteMany({ _id: { $in: ids } })
            resolve({
                status: 'OK',
                message: 'Delete SUCCESS'
                     
            })
            //
            
        } catch (e) {
            reject(e)
        }
    })
}

const getAllUser = () => {
    return new Promise(async (resolve, reject) => {

        try {
            const allUser = await User.find().select(PUBLIC_USER_FIELDS)
            resolve({
                status: 'OK',
                message: 'SUCCESS',
                data: allUser.map(toPublicUser)
                     
            })
            //
            
        } catch (e) {
            reject(e)
        }
    })
}

const getDetailUser = (id) => {
    return new Promise(async (resolve, reject) => {

        try {
            const user = await User.findOne({
                _id: id
            }).select(PUBLIC_USER_FIELDS)
            if(user === null) {
                return resolve({
                    status: 'ERR',
                    message: 'The user is not defined'
                })
            }

            resolve({
                status: 'OK',
                message: 'SUCCESS',
                data: toPublicUser(user)
                     
            })            
        } catch (e) {
            reject(e)
        }
    })
}

const requestPasswordReset = async (email) => {
    const generic = { status: 'OK', message: 'Nếu email tồn tại, hướng dẫn đặt lại mật khẩu đã được gửi.' }
    const user = await User.findOne({ email: String(email).trim().toLowerCase() })
    if (!user) return generic

    const { token, tokenHash } = createResetToken()
    const expiresMinutes = Number(process.env.PASSWORD_RESET_EXPIRES_MINUTES || 15)
    user.passwordResetToken = tokenHash
    user.passwordResetExpires = new Date(Date.now() + expiresMinutes * 60 * 1000)
    await user.save({ validateBeforeSave: false })

    const frontendUrl = String(process.env.FRONTEND_URL || 'http://localhost:3000').replace(/\/$/, '')
    try {
        await EmailService.sendPasswordResetEmail(user.email, `${frontendUrl}/reset-password/${token}`)
    } catch (error) {
        user.passwordResetToken = undefined
        user.passwordResetExpires = undefined
        await user.save({ validateBeforeSave: false })
        throw error
    }
    return generic
}

const resetPassword = async (token, password) => {
    const user = await User.findOne({
        passwordResetToken: hashResetToken(token),
        passwordResetExpires: { $gt: new Date() },
    }).select('+passwordResetToken +passwordResetExpires')
    if (!user) return { status: 'ERR', message: 'Liên kết đặt lại mật khẩu không hợp lệ hoặc đã hết hạn' }

    user.password = await bcrypt.hash(password, 10)
    user.passwordResetToken = undefined
    user.passwordResetExpires = undefined
    user.passwordChangedAt = new Date()
    await user.save()
    return { status: 'OK', message: 'Đặt lại mật khẩu thành công' }
}



module.exports = {
    creatUser,
    loginUser,
    updateUser,
    deleteUser,
    getAllUser,
    getDetailUser,
    deleteManyUser,
    requestPasswordReset,
    resetPassword
}
