const mongoose = require('mongoose');

const eventSchema = new mongoose.Schema(
  {
    title: { type: String, required: true },
    description: { type: String },
    imageUrl: { type: String, required: true },

    startDate: { type: Date, required: true },
    endDate: { type: Date, required: true },

    // isActive: Single source of truth
    // - true = event should be displayed (admin enabled it AND endDate hasn't passed)
    // - false = event should not be displayed (admin disabled it OR endDate has passed)
    isActive: { type: Boolean, default: true },
    price:{type: Number}
  },
  { timestamps: true }
);

eventSchema.index({ endDate: 1 }, { expireAfterSeconds: 0 });

// Pre-save middleware: automatically set isActive to false if endDate has passed
// This ensures expired events are never displayed, even if admin manually set isActive to true
eventSchema.pre('save', function (next) {
  const now = new Date();
  if (this.endDate && now > this.endDate) {
    this.isActive = false; // Force inactive when expired
  }
  next();
});

// Pre-find middleware: Also check endDate during queries
eventSchema.pre(/^find/, function (next) {
  const now = new Date();
  // Update any documents where endDate has passed to set isActive = false
  const originalExec = this.exec.bind(this);

  this.exec = function () {
    return originalExec().then((docs) => {
      if (!Array.isArray(docs)) return docs;

      // Mark expired events as inactive in the response
      docs.forEach((doc) => {
        if (doc.endDate && now > doc.endDate) {
          doc.isActive = false;
        }
      });
      return docs;
    });
  };

  next();
});

const Event = mongoose.model('Event', eventSchema);
module.exports = Event;
