const express = require('express')
const router = express.Router()
const FilterController = require('../controllers/FilterController')

router.get('/products', FilterController.filterProducts)
router.get('/products/top-selling', FilterController.filterTopSellingProducts);
router.get('/products/top-new', FilterController.filterTopNewProducts);

module.exports = router
