const express = require('express');
const ReturnController = require('../controllers/ReturnController');
const { authMiddleware, authUserMiddleware } = require('../middleware/authMiddleware');

const router = express.Router();

router.post('/create', authUserMiddleware, ReturnController.create);
router.get('/mine', authUserMiddleware, ReturnController.mine);
router.get('/', authMiddleware, ReturnController.all);
router.put('/:id/status', authMiddleware, ReturnController.updateStatus);
router.post('/:id/refund', authMiddleware, ReturnController.refund);
router.get('/:id', authUserMiddleware, ReturnController.details);

module.exports = router;
