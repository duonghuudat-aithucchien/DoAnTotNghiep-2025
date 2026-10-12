const express = require('express');
const router = express.Router();
const VoucherController = require('../controllers/VoucherController');
const { authMiddleware } = require('../middleware/authMiddleware');

// Public route: người dùng kiểm tra áp dụng mã voucher
router.post('/apply', VoucherController.applyVoucher);

// Public route: người dùng lấy danh sách voucher khả dụng để chọn
router.get('/available', VoucherController.getAvailableVouchers);

// Admin routes: Quản lý voucher
router.post('/create', authMiddleware, VoucherController.createVoucher);
router.put('/update/:id', authMiddleware, VoucherController.updateVoucher);
router.delete('/delete/:id', authMiddleware, VoucherController.deleteVoucher);
router.get('/get-all', authMiddleware, VoucherController.getAllVouchers);

module.exports = router;
