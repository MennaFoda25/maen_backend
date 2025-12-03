const mongoose = require('mongoose');

const pricingModel = new mongoose.Schema(
  {
    basePrice : {type:Number , default:30},
    minPricePerMinute: {type:Number, default:0.6},
    peakFeeMultiplier:{ type:Number, default:1},

    teacherLevels: [
      {
        name:String,
        factor:Number
      }
    ],
    sessionsDiscount:[{
       sessionsPerMonth: Number,
    discount: Number
  }],

  durationDiscounts:[
    {
      months:Number,
      discount:Number
    }
  ]
});

const Pricing = mongoose.model('Pricing', pricingModel);
module.exports = Pricing;
