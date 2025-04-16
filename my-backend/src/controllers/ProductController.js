const ProductService = require('../services/ProductService')

const createProduct = async (req, res) => {
    try {
        const { name, image, type, price, countInStock, rating, description, discount, sizes, colors} =req.body
        if(!name || !image || !type || !price || !countInStock || !rating || !discount || !sizes || !colors) {
            return res.status(200).json({
                status: 'ERR',
                message: 'The input is required'
            })
        } 

        console.log('response', req.body)
        const response = await ProductService.createProduct(req.body)
        return res.status(200).json(response)
    } catch (e) {
        return res.status(404).json({
            message: e
        })
        
    }
}

const updateProduct = async (req, res) => {
    try {
        const productId = req.params.id
        const data = req.body
        if(!productId) {
            return res.status(200).json({
                status: 'ERR',
                message: 'The productId is required'
            })
        }
        const response = await ProductService.updateProduct(productId, data)
        return res.status(200).json(response)
    } catch (e) {
        return res.status(404).json({
            message: e
        })
        
    }
}

const getDetailProduct = async (req, res) => {
    try {
        const productId = req.params.id
       
        if(!productId) {
            return res.status(200).json({
                status: 'ERR',
                message: 'The productId is required'
            })
        }
        const response = await ProductService.getDetailProduct(productId)
        return res.status(200).json(response)
    } catch (e) {
        return res.status(404).json({
            message: e
        })
        
    }
}

const deleteProduct = async (req, res) => {
    try {
        const productId = req.params.id
       
        if(!productId) {
            return res.status(200).json({
                status: 'ERR',
                message: 'The productId is required'
            })
        }
        const response = await ProductService.deleteProduct(productId)
        return res.status(200).json(response)
    } catch (e) {
        return res.status(404).json({
            message: e
        })
        
    }
}

const deleteManyProduct = async (req, res) => {
    try {
        const ids = req.body.ids
       
        if(!ids) {
            return res.status(200).json({
                status: 'ERR',
                message: 'The ids is required'
            })
        }
        const response = await ProductService.deleteManyProduct(ids)
        return res.status(200).json(response)
    } catch (e) {
        return res.status(404).json({
            message: e
        })
        
    }
}

const getAllProduct = async (req, res) => {
    try {
        const {limit, page, sort, filter} = req.query
        const response = await ProductService.getAllProduct(Number(limit) || null, Number(page) || 0, sort, filter)
        return res.status(200).json(response)
    } catch (e) {
        return res.status(404).json({
            message: e
        })
        
    }
}

const getAllType = async (req, res) => {
    try {
        const response = await ProductService.getAllType()
        return res.status(200).json(response)
    } catch (e) {
        return res.status(404).json({
            message: e
        })
        
    }
}

const getProductByType = async (req, res) => {
    try {
      const type = req.query.type
      const limit = Number(req.query.limit) || 6
  
      const response = await ProductService.getProductByType(type, limit)
      return res.status(200).json(response)
    } catch (e) {
      return res.status(500).json({
        status: 'ERR',
        message: e.message
      })
    }
  }


module.exports = {
    createProduct,
    updateProduct,
    getDetailProduct,
    deleteProduct,
    getAllProduct,
    deleteManyProduct,
    getAllType,
    getProductByType
}