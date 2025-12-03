const express = require('express');
const { firebaseAuth } = require('../middlewares/firebaseAuth');
const { allowedTo } = require('../controllers/authServices');
const { calculatePricing } = require('../controllers/pricingServices');

const router = express.Router();

router.post('/', firebaseAuth,calculatePricing);

module.exports = router;
