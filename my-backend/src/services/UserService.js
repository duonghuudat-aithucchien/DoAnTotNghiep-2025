const User = require("../models/UserModel")
const bcrypt = require("bcrypt")
const { genneralAccessToken, genneralRefreshToken } = require("./JwtService")

const creatUser = (newUser) => {
    return new Promise(async (resolve, reject) => {
        const { name, email, password, confirmPassword, phone} =newUser

        try {
            const checkUser = await User.findOne({
                email: email
            })
           if(checkUser !== null) {
                resolve({
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
           console.log('hash', hash)
            const createdUser = await User.create({
                name, 
                email, 
                password: hash, 
                confirmPassword: hash, 
                phone
            })
            if(createdUser) {
                resolve({
                    status: 'OK',
                    message: 'SUCCESS',
                    data: createdUser
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
                email: email
            })
           if(checkUser === null) {
                resolve({
                    status: 'ERR',
                    message: 'The user is not defined'
                })
           }
           const comparePassword = bcrypt.compareSync(password, checkUser.password)
           console.log('comparePassword', comparePassword)           

            if(!comparePassword) {
                resolve({
                    status: 'ERR',
                    message: 'The password or user is incorrect'
                })
            }

            //Xac thuc jwt jsonwebtoken
            const access_token = await genneralAccessToken({
                id: checkUser.id,
                isAdmin: checkUser.isAdmin 
            })

            const refresh_token = await genneralRefreshToken({
                id: checkUser.id,
                isAdmin: checkUser.isAdmin 
            })

            console.log('access_token', access_token)            
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
                resolve({
                    status: 'OK',
                    message: 'The user is not defined'
                })
            }

            const updatedUser = await User.findByIdAndUpdate(id, data, { new: true})
            resolve({
                status: 'OK',
                message: 'SUCCESS',
                data: updatedUser
                     
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
                resolve({
                    status: 'OK',
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
            await User.deleteManyUser({_id: ids})
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
            const allUser = await User.find()
            resolve({
                status: 'OK',
                message: 'SUCCESS',
                data: allUser
                     
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
            })
            if(user === null) {
                resolve({
                    status: 'OK',
                    message: 'The user is not defined'
                })
            }

            resolve({
                status: 'OK',
                message: 'SUCCESS',
                data: user
                     
            })            
        } catch (e) {
            reject(e)
        }
    })
}



module.exports = {
    creatUser,
    loginUser,
    updateUser,
    deleteUser,
    getAllUser,
    getDetailUser,
    deleteManyUser
}