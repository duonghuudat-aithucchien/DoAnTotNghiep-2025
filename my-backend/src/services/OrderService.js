const User = require("../models/UserModel")
const bcrypt = require("bcrypt")
const { genneralAccessToken, genneralRefreshToken } = require("./JwtService")
const Order = require("../models/OrderProduct")
const Product = require("../models/ProductModel")
const EmailService = require("../services/EmailService")
const mongoose = require('mongoose');

const createOrder = (newOrder) => {
    return new Promise(async (resolve, reject) => {
        const { orderItems, paymentMethod, itemsPrice, shippingPrice, totalPrice, 
            fullName, address, city, phone, user, isPaid, paidAt, email} = newOrder

        try {
            const promises = orderItems.map(async(order) => {
                const productData = await Product.findOneAndUpdate({
                    _id: order.product,
                    countInStock: {$gte: order.amount}
                },
                {
                    $inc: {
                        countInStock: -order.amount,
                        selled: +order.amount
                    }
                },
                {new: true}
            )
            if(productData) {
                return {
                    status: 'OK',
                    message: 'SUCCESS'
                }
            } else {
                return{
                    status: 'OK',
                    message: 'ERR',
                    id: order.product
                }
            }
        }) 
        const results = await Promise.all(promises) 
        const newData = results && results.filter((item) => item.id)
        if(newData.length) {
            const arrId = []
            newData.forEach((item) => {
                arrId.push(item.id)
            })
            resolve({
                status: 'ERR',
                message: `Sản phẩm với id${arrId.join(',')} không đủ hàng`
            })
        } else {
            const createOrder = await Order.create({
                orderItems,
                shippingAddress: {
                    fullName,
                    address,
                    city,
                    phone
                },
                paymentMethod,
                itemsPrice,
                shippingPrice,
                totalPrice,
                user: user,
                isPaid,
                paidAt,
            })
            if(createOrder) {
                await EmailService.sendEmailCreateOrder(email, orderItems)
                return resolve({
                    status: 'OK',
                    message: 'SUCCESS',
                })
            }
        }
        resolve({
            status: 'OK',
            message: 'Success'
        })
        // console.log('result', results)
        } catch (e) {
            reject(e)
        }
    })
}

// const createOrder = (newOrder) => {
//     return new Promise(async (resolve, reject) => {
//         const {
//             orderItems,
//             paymentMethod,
//             itemsPrice,
//             shippingPrice,
//             totalPrice,
//             fullName,
//             address,
//             city,
//             phone,
//             user,
//             isPaid,
//             paidAt,
//             email
//         } = newOrder;

//         try {
//             // 1. Kiểm tra tồn kho & cập nhật
//             const promises = orderItems.map(async (item) => {
//                 const productData = await Product.findOneAndUpdate(
//                     {
//                         _id: item.product,
//                         countInStock: { $gte: item.amount }
//                     },
//                     {
//                         $inc: {
//                             countInStock: -item.amount,
//                             selled: +item.amount
//                         }
//                     },
//                     { new: true }
//                 );

//                 if (productData) {
//                     return {
//                         status: 'OK',
//                         message: 'SUCCESS'
//                     };
//                 } else {
//                     return {
//                         status: 'ERR',
//                         message: 'Không đủ hàng',
//                         id: item.product
//                     };
//                 }
//             });

//             const results = await Promise.all(promises);

//             // 2. Kiểm tra xem có sản phẩm nào lỗi không
//             const failedItems = results.filter((item) => item.status === 'ERR');

//             if (failedItems.length > 0) {
//                 const failedIds = failedItems.map((item) => item.id);
//                 return resolve({
//                     status: 'ERR',
//                     message: `Sản phẩm với ID: ${failedIds.join(', ')} không đủ hàng`
//                 });
//             }

//             // 3. Tạo đơn hàng nếu mọi sản phẩm đều hợp lệ
//             const createdOrder = await Order.create({
//                 orderItems,
//                 shippingAddress: {
//                     fullName,
//                     address,
//                     city,
//                     phone
//                 },
//                 paymentMethod,
//                 itemsPrice,
//                 shippingPrice,
//                 totalPrice,
//                 user,
//                 isPaid,
//                 paidAt
//             });

//             if (createdOrder) {
//                 await EmailService.sendEmailCreateOrder(email, orderItems);

//                 return resolve({
//                     status: 'OK',
//                     message: 'Đặt hàng thành công'
//                 });
//             }

//             return resolve({
//                 status: 'ERR',
//                 message: 'Tạo đơn hàng thất bại'
//             });
//         } catch (error) {
//             console.error("Lỗi trong createOrder:", error);
//             return reject({
//                 status: 'ERR',
//                 message: 'Lỗi máy chủ',
//                 error: error.message
//             });
//         }
//     });
// };


const getAllDetailsOrder = (id) => {
    return new Promise(async (resolve, reject) => {

        try {
            const order = await Order.find({
                user: id
            })
            if(order === null) {
                resolve({
                    status: 'OK',
                    message: 'The get all order is not defined'
                })
            }

            resolve({
                status: 'OK',
                message: 'SUCCESS',
                data: order
                     
            })
            //
            
        } catch (e) {
            reject(e)
        }
    })
}

// const getOrderDetails = (id) => {
//     return new Promise(async (resolve, reject) => {
//         try {
//             console.log('id', id)       
//             const order = await Order.findById({_id: id})
//             if(order === null) {
//                 resolve({
//                     status: 'OK',
//                     message: 'The order is not defined'
//                 })
//             }

//             resolve ({
//                 status: 'OK',
//                 message: 'SUCCESS',
//                 data: order
                     
//             })
//             //
            
//         } catch (e) {
//             reject(e)
//         }
//     })
// }

const getOrderDetails = (id) => {
    return new Promise(async (resolve, reject) => {
        try {

            // Kiểm tra nếu id không hợp lệ
            if (!mongoose.Types.ObjectId.isValid(id)) {
                return resolve({
                    status: 'ERR',
                    message: 'Invalid order ID',
                });
            }

            // Truy vấn MongoDB
            const order = await Order.findById(id);
            console.log('Order from DB:', order); // Log kết quả truy vấn
            if (!order) { // Kiểm tra nếu không tìm thấy đơn hàng
                return resolve({
                    status: 'ERR',
                    message: 'The order is not defined',
                });
            }

            // Trả về dữ liệu đơn hàng
            resolve({
                status: 'OK',
                message: 'SUCCESS',
                data: order,
            });
        } catch (e) {
            console.error('Error in getOrderDetails:', e); // Log lỗi
            reject({
                status: 'ERR',
                message: 'Internal server error',
                error: e.message,
            });
        }
    });
};


const cancelOrderDetails = (id, data) => {
    return new Promise(async (resolve, reject) => {
        try {
            let order = []
            const promises = data.map(async(order) => {
                const productData = await Product.findOneAndUpdate({
                    _id: order.product,
                    selled: {$gte: order.amount}
                },
                {
                    $inc: {
                        countInStock: +order.amount,
                        selled: -order.amount
                    }
                },
                {new: true}
            )
            if(productData) {
                order = await Order.findByIdAndDelete(id)
                if(order === null) {
                    resolve({
                        status: 'OK',
                        message: 'The order is not defined'
                    })
                }
            } else {
                return{
                    status: 'OK',
                    message: 'ERR',
                    id: order.product
                }
            }
        }) 
        const results = await Promise.all(promises) 
        const newData = results && results.filter((item) => item)
        if(newData.length) {
            resolve({
                status: 'ERR',
                message: `Sản phẩm với id${newData.joim(',')} không tồn tại`
            })
        }
        resolve({
            status: 'OK',
            message: 'Success',
            data: order
        })
        console.log('result', results)
            
        } catch (e) {
            reject(e)
        }
    })
}

const getAllOrder = () => {
    return new Promise(async (resolve, reject) => {

        try {
            const allOrder = await Order.find()
            resolve({
                status: 'OK',
                message: 'SUCCESS',
                data: allOrder
                     
            })
            //
            
        } catch (e) {
            reject(e)
        }
    })
}

module.exports = {
    createOrder,
    getAllDetailsOrder,
    getOrderDetails,
    cancelOrderDetails,
    getAllOrder

}