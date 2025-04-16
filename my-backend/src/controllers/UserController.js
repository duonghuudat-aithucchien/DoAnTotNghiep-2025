const UserService = require('../services/UserService')
const JwtService = require('../services/JwtService')

const creatUser = async (req, res) => {
    try {
        const { name, email, password, confirmPassword, phone} =req.body
        const reg = /^\w+([-+.']\w+)*@\w+([-.]\w+)*\.\w+([-.]\w+)*$/ //RegEx check email
        const isCheckEmail = reg.test(email)
        if(!email || !password || !confirmPassword) {
            return res.status(200).json({
                status: 'ERR',
                message: 'The input is required'
            })
        } else if(!isCheckEmail) {
            return res.status(200).json({
                status: 'ERR',
                message: 'The input is email'
            })
        } else if(password !== confirmPassword) {
            return res.status(200).json({
                status: 'ERR',
                message: 'The password is equal confirmPassword'
            })
        }
        console.log('isCheckEmail', isCheckEmail)
        const response = await UserService.creatUser(req.body)
        return res.status(200).json(response)
    } catch (e) {
        return res.status(404).json({
            message: e
        })
        
    }
}

const loginUser = async (req, res) => {
    try {
        const { email, password} =req.body
        const reg = /^\w+([-+.']\w+)*@\w+([-.]\w+)*\.\w+([-.]\w+)*$/ //RegEx check email
        const isCheckEmail = reg.test(email)
        if(!email || !password) {
            return res.status(200).json({
                status: 'ERR',
                message: 'The input is required'
            })
        } else if(!isCheckEmail) {
            return res.status(200).json({
                status: 'ERR',
                message: 'The input is required'
            })
        } 
        //console.log('isCheckEmail', isCheckEmail)
        const response = await UserService.loginUser(req.body)
        const { refresh_token, ...newResponse} = response
        //console.log('response', response)
        res.cookie('refresh_token', refresh_token, {
            httpOnly: true,
            secure: false,
            samesite: 'strict'
        })
        return res.status(200).json(newResponse)
    } catch (e) {
        return res.status(404).json({
            message: e
        })
        
    }
}

const updateUser = async (req, res) => {
    try {
        const userID = req.params.id
        const data = req.body
        if(!userID) {
            return res.status(200).json({
                status: 'ERR',
                message: 'The userID is required'
            })
        }
        const response = await UserService.updateUser(userID, data)
        return res.status(200).json(response)
    } catch (e) {
        return res.status(404).json({
            message: e
        })
        
    }
}

const deleteUser = async (req, res) => {
    try {
        const userID = req.params.id
       
        if(!userID) {
            return res.status(200).json({
                status: 'ERR',
                message: 'The userID is required'
            })
        }
        const response = await UserService.deleteUser(userID)
        return res.status(200).json(response)
    } catch (e) {
        return res.status(404).json({
            message: e
        })
        
    }
}

const deleteManyUser = async (req, res) => {
    try {
        const ids = req.body.ids
       
        if(!ids) {
            return res.status(200).json({
                status: 'ERR',
                message: 'The ids is required'
            })
        }
        const response = await UserService.deleteManyUser(ids)
        return res.status(200).json(response)
    } catch (e) {
        return res.status(404).json({
            message: e
        })
        
    }
}

const getAllUser = async (req, res) => {
    try {
        const response = await UserService.getAllUser()
        return res.status(200).json(response)
    } catch (e) {
        return res.status(404).json({
            message: e
        })
        
    }
}

const getDetailUser = async (req, res) => {
    try {
        const userID = req.params.id
       
        if(!userID) {
            return res.status(200).json({
                status: 'ERR',
                message: 'The userID is required'
            })
        }
        const response = await UserService.getDetailUser(userID)
        return res.status(200).json(response)
    } catch (e) {
        return res.status(404).json({
            message: e
        })
        
    }
}

const refreshToken = async (req, res) => {
    //console.log('req.cookies', req.cookies)
    try {
        const token = req.cookies.refresh_token
       
        if(!token) {
            return res.status(200).json({
                status: 'ERR',
                message: 'The token is required'
            })
        }
        const response = await JwtService.refreshTokenJwtService(token)
        return res.status(200).json(response)
        return
    } catch (e) {
        return res.status(404).json({
            message: e
        })
        
    }
}

const logoutUser = async (req, res) => {
    try {       
        res.clearCookie('refresh_token')
        return res.status(200).json({
            status: 'OK',
            message: 'Logout successfully'
        })    
    } catch (e) {
        return res.status(404).json({
            message: e
        })
        
    }
}


module.exports = {
    creatUser,
    loginUser,
    updateUser,
    deleteUser,
    getAllUser,
    getDetailUser,
    refreshToken,
    logoutUser,
    deleteManyUser
}