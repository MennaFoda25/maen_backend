const mongoose = require('mongoose');

const bannserSchema = new mongoose.Schema(
  {
    title: { type: String, required: true },
    description: { type: String },
    imageUrl: { type: String, required: true },

    startDate: { type: Date, required: true },
    endDate: { type: Date, required: true }, // TTL will act on this

    isActive: { type: Boolean, default: true },
  },
  { timestamps: true }
);

bannerSchema.index({ endDate: 1 }, { expireAfterSeconds: 0 });

module.exports = mongoose.model('Banner', bannerSchema);
