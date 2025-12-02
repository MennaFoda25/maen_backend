const mongoose = require('mongoose');

const pricingModel = new mongoose.Schema(
  {
    global: {
      basePrice30: { type: Number },
      defaultSessionMin: { type: Number },
      minPricePerMin: Number,
      peakFeeMulti: Number,
    },

    level: String,
    factor: Number,

    sessionDisctount: [
      {
        sessionsPerMonth: Number,
        discount: Number,
      },
    ],
    durationDiscounts: [
      {
        months: Number,
        discount: Number,
      },
    ],

    isActive: Boolean,
  },
  { timestamps: true }
);

const Pricing = mongoose.model('Pricing', pricingModel);
module.exports = Pricing;
