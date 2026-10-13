const express = require("express")
const router = express.Router()
const userController = require('../controllers/UserController')
const { authMiddleware, authUserMiddleware } = require("../middleware/authMiddleware")
const { createRateLimit } = require('../middleware/rateLimitMiddleware')
const authRateLimit = createRateLimit({ windowMs: 15 * 60 * 1000, max: 20 })

router.post('/sign-up', authRateLimit, userController.creatUser)
router.post('/sign-in', authRateLimit, userController.loginUser)
router.post('/forgot-password', authRateLimit, userController.forgotPassword)
router.post('/reset-password/:token', authRateLimit, userController.resetPassword)
router.post('/log-out', userController.logoutUser)
router.put('/update-user/:id', authUserMiddleware, userController.updateUser)
router.delete('/delete-user/:id',authMiddleware, userController.deleteUser)
router.get('/getAll',authMiddleware, userController.getAllUser)
router.get('/get-details/:id',authUserMiddleware, userController.getDetailUser)
router.post('/refresh-token', authRateLimit, userController.refreshToken)
router.post('/delete-many', authMiddleware, userController.deleteManyUser)







module.exports = router
