const express = require('express')
const router = express.Router()
const FilterController = require('../controllers/FilterController')

router.get('/products', FilterController.filterProducts)

module.exports = router
