const mongoose = require('mongoose');

const trialSessionSchema = new mongoose.Schema(
  {
    program: {
      type: mongoose.Schema.ObjectId,
      ref: 'CorrectionProgram',
      required: true,
    },

    student: {
      type: mongoose.Schema.ObjectId,
      ref: 'User',
      required: true,
    },
    teacher: {
      type: mongoose.Schema.ObjectId,
      ref: 'User',
      required: true,
    },
    duration: {
      type: Number,
      default: 15,
    },
    status: {
      type: String,
      enum: ['pending', 'scheduled', 'completed', 'cancelled'],
      default: 'pending',
    },
    scheduledAt: Date,
    meetingLink: String,
    createdAt: {
      type: Date,
      default: Date.now,
    },
  preferredTimes: {
      type: [String],
     // enum: ['6-9_am', '10-1_pm', '2-5_pm', '6-9_pm', '10-1_am'],
    }, // e.g. ['evening', 'afternoon']
    Days: {
      type: [String],
      required:true},
  },
  { toJSON: { virtuals: true }, toObject: { virtuals: true } }
);

const TrialSession = mongoose.model('TrialSession', trialSessionSchema);
module.exports = TrialSession;
