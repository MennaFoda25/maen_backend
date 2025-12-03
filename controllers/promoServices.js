const Promocode = require('../models/promocodeModel');
const asyncHandler = require('express-async-handler');
const ApiError = require('../utils/apiError');
const factory = require('./handlerFactory')

/**
 * ADMIN — Create Promocode
 */

exports.createPromocode = asyncHandler(async (req, res, next) => {
  const promo = await Promocode.create(req.body);
  res.status(200).json({
    status: 'success',
    data: promo,
  });
});

//ADMIN — Update Promocode
exports.updatePromocode = asyncHandler(async (req, res, next) => {
  const promo = await Promocode.findByIdAndUpdate(req.params.id, req.body, { new: true });

  if (!promo) return next(new ApiError('Promocode not found', 404));
  res.status(200).json({
    status: 'success',
    data: promo,
  });
});

//Delete promo
exports.deletePromo = asyncHandler(async (req, res, next) => {
  const promo = await Promocode.findByIdAndDelete(req.params.id);
  if (!promo) return next(new ApiError('Promocode not found', 404));
  res.status(200).json({
    status: 'success',
    message: 'Promocode deleted',
  });
});

//Public - Apply promocode during pricing
exports.applyPromocode = asyncHandler(async(req,res,next)=>{
    const {code , originalPrice} = req.body
    const userId = req.user._id

    if(!code) return next(new ApiError("Promocode is required", 400))

    const promo = await Promocode.findOne({code: code.toUpperCase()})
      if (!promo) return next(new ApiError("Invalid promocode", 404));

        const now = new Date();
        // VALIDITY WINDOW
  if (now < promo.validFrom || now > promo.validUntil)
    return next(new ApiError("Promocode is expired or not active yet", 400));

  if (!promo.isActive)
    return next(new ApiError("This promocode is disabled", 400));
  if (promo.totalUsage >= promo.globalMaxUsage)
    return next(new ApiError("Promocode has expired", 400));

  // USER USAGE LIMIT
  const userUsage = promo.usedBy.find(
    (u) => u.user.toString() === userId.toString()
  );

  if (userUsage && userUsage.count >= promo.maxUsagePerUser)
    return next(new ApiError("You have already used this promocode", 400));

  let finalPrice = originalPrice
  let discountAmount = 0

  if(promo.discountType ==="percentage"){
      discountAmount = (originalPrice * promo.discountValue) / 100;
    finalPrice = originalPrice - discountAmount;
  }else{
        // fixed amount
    discountAmount = promo.discountValue;
    finalPrice = Math.max(originalPrice - discountAmount, 0);
  }
  
  // Return calculated pricing (REAL update happens when user pays)
  res.status(200).json({
    status: "success",
    promocode: promo.code,
    originalPrice,
    discountAmount,
    finalPrice: Number(finalPrice.toFixed(2)),
    discountType: promo.discountType,
  });
})

/**
 * INTERNAL — Mark promocode as used (after payment)
 */
exports.markPromocodeUsed = async (promocode, userId) => {
  const promo = await Promocode.findOne({ code: promocode.toUpperCase() });
  if (!promo) return;

  promo.totalUsage += 1;

  let userEntry = promo.usedBy.find(
    (u) => u.user.toString() === userId.toString()
  );

  if (userEntry) {
    userEntry.count += 1;
  } else {
    promo.usedBy.push({ user: userId, count: 1 });
  }

  await promo.save();
};

exports.getAllPromos = factory.getAll(Promocode)