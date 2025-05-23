const express = require("express")
const router = express.Router()
const ProductController = require('../controllers/ProductController')
const {authMiddleware, authUserMiddleware, authReviewMiddleware} = require("../middleware/authMiddleware")

router.post('/create', ProductController.createProduct)
router.put('/update/:id', authMiddleware, ProductController.updateProduct)
router.get('/get-details/:id', ProductController.getDetailProduct)
router.delete('/delete/:id', authMiddleware, ProductController.deleteProduct)
router.get('/get-all', ProductController.getAllProduct)
router.post('/delete-many', authMiddleware, ProductController.deleteManyProduct)
router.get('/get-all-type', ProductController.getAllType)
router.get('/get-by-type', ProductController.getProductByType)
router.get('/top-selling', ProductController.getTopSellingProducts);
router.get('/top-new', ProductController.getTopNewProducts);

router.post('/:productId/reviews', authReviewMiddleware, ProductController.addReview);
router.get('/:productId/reviews', ProductController.getReviews);

module.exports = router