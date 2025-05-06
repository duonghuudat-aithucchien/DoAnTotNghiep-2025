const express = require('express')
const router = express.Router()
const { getDashboard } = require('../controllers/DashboardController')

router.get('/', getDashboard)

module.exports = router
