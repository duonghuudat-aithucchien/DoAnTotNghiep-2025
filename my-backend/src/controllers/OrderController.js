const OrderService = require('../services/OrderService')

const createOrder = async (req, res) => {
    try {
        const {orderItems, paymentMethod, itemsPrice, shippingPrice, totalPrice, 
            fullName, address, city, phone, email, user,} = req.body
        // if(!orderItems || !Array.isArray(orderItems) || orderItems.length === 0 || !paymentMethod || !itemsPrice || !shippingPrice || !totalPrice || !fullName || !address || !city || !phone || !email) {
        if (
            !orderItems || !Array.isArray(orderItems) || orderItems.length === 0 ||
            paymentMethod == null || itemsPrice == null || 
            shippingPrice == null || totalPrice == null ||
            !fullName || !address || !city || !phone || !email || !user
            ) 
        {                 
            return res.status(200).json({
                status: 'ERR',
                message: 'The input is required'
            })
        } 
        console.log('response', req.body)
        const response = await OrderService.createOrder(req.body)
        return res.status(200).json(response)
    } catch (e) {
        return res.status(404).json({
            message: e
        })        
    }
}

const getAllDetailsOrder = async (req, res) => {
    try {
        const userId = req.params.id
       
        if(!userId) {
            return res.status(200).json({
                status: 'ERR',
                message: 'The userId is required'
            })
        }
        const response = await OrderService.getAllDetailsOrder(userId)
        return res.status(200).json(response)
    } catch (e) {
        return res.status(404).json({
            message: e
        })
        
    }
}

const getDetailsOrder = async (req, res) => {
    try {
        const orderId = req.params.id
        if(!orderId) {
            return res.status(200).json({
                status: 'ERR',
                message: 'The orderId is required'
            })
        }
        const response = await OrderService.getOrderDetails(orderId)
        return res.status(200).json(response)
    } catch (e) {
        return res.status(404).json({
            message: e
        })
        
    }
}

const cancelOrderDetails = async (req, res) => {
    try {
        const orderId = req.params.id
        const data = req.body
        if(!orderId) {
            return res.status(200).json({
                status: 'ERR',
                message: 'The orderId is required'
            })
        }
        const response = await OrderService.cancelOrderDetails(orderId, data)
        return res.status(200).json(response)
    } catch (e) {
        return res.status(404).json({
            message: e
        })
        
    }
}

const getAllOrder = async (req, res) => {
    try {
        const data = await OrderService.getAllOrder()
        return res.status(200).json(data)
    } catch (e) {
        return res.status(404).json({
            message: e
        })
        
    }
}



module.exports = {
    createOrder,
    getAllDetailsOrder,
    getDetailsOrder,
    cancelOrderDetails,
    getAllOrder
}