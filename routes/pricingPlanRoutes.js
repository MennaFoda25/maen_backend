const express = require('express');
const { firebaseAuth } = require('../middlewares/firebaseAuth');
const { allowedTo } = require('../controllers/authServices');
const { CreatePricingPlan } = require('../controllers/pricingServices');

const router = express.Router();

router.post('/', allowedTo('admin'), CreatePricingPlan);

module.exports = router;
