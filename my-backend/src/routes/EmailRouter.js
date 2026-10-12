const express = require('express');
const router = express.Router();
const EmailController = require('../controllers/EmailController');
const { createRateLimit } = require('../middleware/rateLimitMiddleware');
const subscribeRateLimit = createRateLimit({ windowMs: 60 * 60 * 1000, max: 5 });

router.post('/subscribe', subscribeRateLimit, EmailController.subscribe);

module.exports = router;
