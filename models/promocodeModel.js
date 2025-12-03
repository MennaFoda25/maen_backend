const mongoose = require('mongoose');

const promoSchema = new mongoose.Schema({
  code: {
    type: String,
    unique: true,
    uppercase: true,
    trim: true,
    required:true
  },
  discountType: {
    type: String,
    enum: ['percentage', 'fixed'],
    required: true,
  },
  discountValue: {
    type: Number,
    required: true,

  },

  maxUsagePerUser: { type: Number, default: 1 },
  globalMaxUsage: { type: Number, default: 1000 },
 
usedBy: [
  {
    user: { type: mongoose.Schema.ObjectId, ref: "User" },
    count: { type: Number, default: 0 }
  }
],

  validFrom: Date,
  validUntil: Date,
  isActive: { type: Boolean, default: true },
  totalUsage: {type:Number, default:0}
},{timestamps:true});

const PromoCode = mongoose.model('promocode',promoSchema)

module.exports = PromoCode