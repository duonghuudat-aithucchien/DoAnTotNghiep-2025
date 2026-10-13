const express = require('express');
const router = express.Router();
const PaymentController = require('../controllers/PaymentController');
const { authUserMiddleware } = require('../middleware/authMiddleware');

router.get('/config', PaymentController.getConfig);
router.get('/vietqr/config', PaymentController.getVietQRConfig);
router.post('/vnpay/create-payment-url', authUserMiddleware, PaymentController.createVNPayPayment);
router.get('/vnpay/vnpay-return', PaymentController.vnpayReturn);
router.get('/vnpay/ipn', PaymentController.vnpayIpn);
router.post('/paypal/verify', authUserMiddleware, PaymentController.verifyPayPalPayment);
router.post('/paypal/webhook', PaymentController.paypalWebhook);

module.exports = router;
