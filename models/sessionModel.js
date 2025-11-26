const mongoose = require('mongoose');
const crypto = require('crypto');
const sessionSchema = new mongoose.Schema(
  {
    type: {
      type: String,
      enum: ['trial', 'program'],
      // required: true,
    },
    program: {
      type: mongoose.Schema.ObjectId,
      // ref: 'programModel',
      required: true,
    },

    programModel: {
      type: String,
      required: true,
      enum: ['CorrectionProgram', 'MemorizationProgram', 'ChildMemorizationProgram'],
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
      enum: [15, 30, 45, 60],
      default: 15,
    },
    status: {
      type: String,
      enum: ['pending', 'scheduled','started', 'completed', 'cancelled'],
      default: 'pending',
    },
       scheduledAtDate: {
      type: Date,
      // required: true, // only enable once migrated
    },

    scheduledAt: [
      {
        day: {
          type: String,
          enum: ['saturday', 'sunday', 'monday', 'tuesday', 'wednesday', 'thursday', 'friday'],
        },
        slots: [
          {
            start: { type: String }, // "14:00"
          },
        ],
      },
    ],
    meetingLink: String,

    meetingId: {
      type: String,
      unique: true,
      default: () => crypto.randomBytes(8).toString('hex'), // e.g. “a4f9c2e8d1b0c933”
    },
    createdAt: {
      type: Date,
      default: Date.now,
    },
    preferredTimes: {
      type: [String],
      // enum: ['6-9_am', '10-1_pm', '2-5_pm', '6-9_pm', '10-1_am'],
    }, // e.g. ['evening', 'afternoon']
    days: {
      type: [String],
      enum: ['sunday', 'monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday'],
      required: true,
    },
    completedAt: Date,
    startedAt:Date
  },
  { toJSON: { virtuals: true }, toObject: { virtuals: true }, timestamps: true }
);

const Session = mongoose.model('Session', sessionSchema);
module.exports = Session;
