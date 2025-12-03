const Pricing = require('../models/pricingModel');
const ApiError = require('../utils/apiError');
const asyncHandler = require('express-async-handler');
const Promocode = require('../models/promocodeModel');

// POST /api/v1/plans/calculate

exports.calculatePricing = asyncHandler(async (req, res, next) => {
  const {
    teacherLevel,
    sessionsPerMonth,
    months,
    sessionMinutes,
    isPeak = false,
    promocode,
  } = req.body;

  const config = await Pricing.findOne({});
 // if (!config) return next(new ApiError('Pricing configuration missing', 500));

  const {
    basePrice,
    minPricePerMinute,
    peakFeeMultiplier,
    teacherLevels,
    sessionsDiscount,
    durationDiscounts,
  } = config;

  // -----------------------------
  // VALIDATION
  // -----------------------------
  const levelEntry = teacherLevels.find((l) => l.name === teacherLevel);
  //if (!levelEntry) return next(new ApiError(`Teacher level '${teacherLevel}' not found`, 404));

  const sessionsEntry = sessionsDiscount.find((d) => d.sessionsPerMonth === sessionsPerMonth);
  const durationEntry = durationDiscounts.find((d) => d.months === months);

  const levelFactor = levelEntry.factor;
  const sessionDiscountPercent = sessionsEntry?.discount || 0;
  const durationDiscountPercent = durationEntry?.discount || 0;

  if (![15, 30, 45, 60].includes(sessionMinutes))
    return next(new ApiError('sessionMinutes must be 15, 30, 45, or 60', 400));

  // -----------------------------
  // PRICING CALCULATION
  // -----------------------------

  // base price per minute
  const basePricePerMinute = (basePrice / 30) * levelFactor;

  // base price per session
  let pricePerSession = basePricePerMinute * sessionMinutes;

  // apply per-session discount
  pricePerSession *= 1 - sessionDiscountPercent / 100;

  // peak multiplier
  if (isPeak) {
    pricePerSession *= peakFeeMultiplier;
  }

  const monthlyPrice = pricePerSession * sessionsPerMonth;

  let totalPriceWithoutCode = monthlyPrice * months * (1 - durationDiscountPercent / 100);

  // enforce minimum price per minute
  const pricePerMinute = Math.max(pricePerSession / sessionMinutes, minPricePerMinute);

  const pricePerHour = pricePerMinute * 60;

  // -----------------------------
  // PROMOCODE CALCULATION
  // -----------------------------
  let finalPrice = totalPriceWithoutCode;
  let promoInfo = null;

  if (promocode) {
    const now = new Date();
    // first, fetch promo to validate window and global limit
    const promo = await Promocode.findOne({ code: promocode.toUpperCase(), isActive: true });
    if (!promo) {
      promoInfo = { valid: false, message: 'Invalid or inactive promocode' };
    } else if (now < promo.validFrom || now > promo.validUntil) {
      promoInfo = { valid: false, message: 'Promocode expired or not active yet' };
    } else if (promo.totalUsage >= (promo.globalMaxUsage ?? Infinity)) {
      promoInfo = { valid: false, message: 'Promocode global usage limit reached' };
    } else {
      // Try atomic update:
      const userId = req.user._id;
      // Try to increment existing user entry if count < maxUsagePerUser and totalUsage < globalMaxUsage
      const updated = await Promocode.findOneAndUpdate(
        {
          _id: promo._id,
          totalUsage: { $lt: promo.globalMaxUsage ?? Number.MAX_SAFE_INTEGER },
          $or: [
            { 'usedBy.user': userId, 'usedBy.count': { $lt: promo.maxUsagePerUser } },
            { 'usedBy.user': { $ne: userId } }, // or user doesn't exist in usedBy (we will push)
          ],
        },
        [
          // aggregation pipeline update (Mongo 4.2+ required)
          {
            $set: {
              totalUsage: { $add: ['$totalUsage', 1] },
            },
          },
        ],
        { new: true }
      );

      if (!updated) {
        // update failed due to limits — check precisely why
        // re-fetch to check user usage
        const fresh = await Promocode.findById(promo._id);
        const userEntry = (fresh.usedBy || []).find((u) => u.user.toString() === userId.toString());
        const userUsageCount = userEntry ? userEntry.count : 0;
        if (userUsageCount >= (fresh.maxUsagePerUser || 1)) {
          promoInfo = {
            valid: false,
            message: `You have already used this promocode ${fresh.maxUsagePerUser} times`,
          };
        } else {
          promoInfo = { valid: false, message: 'Promocode global usage limit reached' };
        }
      } else {
        // Now we still need to increment user's count or push the user entry.
        // Use another atomic update to increment or push:
        const userUpdated = await Promocode.findOneAndUpdate(
          { _id: updated._id, 'usedBy.user': userId },
          { $inc: { 'usedBy.$.count': 1 } },
          { new: true }
        );

        if (!userUpdated) {
          // user entry didn't exist => push new
          await Promocode.findByIdAndUpdate(updated._id, {
            $push: { usedBy: { user: userId, count: 1 } },
          });
        }

        // compute discount and response using 'promo' or refetch
        let discountAmount =
          promo.discountType === 'percentage'
            ? (totalPriceWithoutCode * promo.discountValue) / 100
            : promo.discountValue;

        finalPrice = Math.max(totalPriceWithoutCode - discountAmount, 0);

        promoInfo = {
          valid: true,
          code: promo.code,
          discountType: promo.discountType,
          discountValue: promo.discountValue,
          discountAmount: Number(discountAmount.toFixed(2)),
        };
      }
    }
  }

  // -----------------------------
  // RESPONSE
  // -----------------------------

  res.status(200).json({
    status: 'success',

    pricing: {
      teacherLevel,
      sessionsPerMonth,
      months,
      sessionMinutes,
      isPeak,
    },

    priceBreakdown: {
      basePricePerMinute: Number(basePricePerMinute.toFixed(2)),
      pricePerSession: Number(pricePerSession.toFixed(2)),
      pricePerMinute: Number(pricePerMinute.toFixed(2)),
      pricePerHour: Number(pricePerHour.toFixed(2)),
      monthlyPrice: Number(monthlyPrice.toFixed(2)),
    },

    totalPrice: {
      withoutPromocode: Number(totalPriceWithoutCode.toFixed(2)),
      withPromocode: Number(finalPrice.toFixed(2)),
    },

    promocode: promoInfo,
  });
});
