const Pricing = require('../models/pricingModel')
const ApiError = require('../utils/apiError');
const asyncHandler = require('express-async-handler');

exports.CreatePricingPlan= asyncHandler(async(req,res,next)=>{
const rules= req.body

const prices = await Pricing.create(rules)
res.status(200).json({
    status: 'success',
    message: 'Pricing rules created successfully',
    data: rules,
  });
})
