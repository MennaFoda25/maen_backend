const mongoose = require('mongoose');
const crypto = require('crypto');

const memorizationRangeSchema = new mongoose.Schema(
  {
    fromSurah: String,
    fromAyah: Number,
    toSurah: String,
    toAyah: Number,
  },
  { _id: false }
);

const childMemProgramSchema = new mongoose.Schema(
  {
    firebaseUid: { type: String, required: true, index: true },
    parent: { type: mongoose.Schema.ObjectId, ref: 'User', required: true },

    // Child
    childName: { type: String, required: true, trim: true },
    childGender: { type: String, enum: ['male', 'female'], required: true },
    childAge: { type: Number, min: 3, max: 11, required: true },

    // Quran level
    hasPriorLearning: { type: Boolean, default: false },
    knownSurahs: { type: String },
    readingLevel: {
      type: String,
      enum: ['no_reading', 'phonetic', 'fluent'],
      default: 'no_reading',
    },

    // Goal & schedule
    mainGoal: {
      type: String,
      enum: ['start_from_zero', 'stabilize_memorization', 'improve_pronunciation'],
      required: true,
    },
    weeklySessions: { type: Number, enum: [2, 3, 4, 5], required: true },
    sessionDuration: { type: Number, enum: [15, 30, 45, 60], required: true },
    // days: {
    //   type: [String],
    //   enum: ['sunday', 'monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday'],
    //   validate: [(arr) => arr.length <= 5, 'Cannot exceed 5 days per week'],
    //   default: [],
    // },
    preferredTimes: [
      {
        day: {
          type: String,
          enum: ['sunday', 'monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday'],
        },
        start: String, // e.g. "18:00"
      },
    ],

    // Teacher/session preferences
    teacherGender: {
      type: String,
      enum: ['female', 'male', 'no_preference'],
      default: 'no_preference',
    },
    notesForTeacher: { type: String },

    // Plan
    planName: { type: String, required: true },
    memorizationDirection: {
      type: String,
      enum: ['fatihah_to_nas', 'nas_to_fatihah'],
      default: 'fatihah_to_nas',
    },
    memorizationRange: memorizationRangeSchema,
    facesLabel: { type: String, enum: ['quarter', 'half', 'one', 'custom'], default: 'one' },
    facesPerSession: { type: Number, default: 1 }, // allow decimals for quarter/half
    totalFaces: { type: Number, default: 0 },
    completedFaces: { type: Number, default: 0 },
    progressPercent: { type: Number, default: 0 },
    packageDuration: {
      type: Number,
      enum: [1, 3, 6],
      required: true,
    },
    // Admin / assignment
    teacher: { type: mongoose.Schema.ObjectId, ref: 'User' }, // assigned later
    trialSession: {
      type: Boolean,
      default: false,
    },
    meetingLing: String,
    meetingId: {
      type: String,
      unique:false,
      default: () => crypto.randomBytes(8).toString('hex'),
    },
    // meta
    lastSession: {
      date: Date,
      notes: String,
      fromSurah: String,
      toSurah: String,
    },
  },
  { timestamps: true }
);

// compute progress
childMemProgramSchema.pre('save', function (next) {
  if (this.totalFaces > 0) {
    this.progressPercent = Math.min(Math.round((this.completedFaces / this.totalFaces) * 100), 100);
  } else {
    this.progressPercent = 0;
  }
  next();
});

childMemProgramSchema.index({ parent: 1, createdAt: -1 });

module.exports = mongoose.model('ChildMemorizationProgram', childMemProgramSchema);
