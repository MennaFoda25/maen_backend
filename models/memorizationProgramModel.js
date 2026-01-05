const mongoose = require('mongoose');
const crypto = require('crypto');

const memorizationProgramSchema = new mongoose.Schema(
  {
    // 🔹 Ownership
    firebaseUid: { type: String, required: true, index: true },
    student: {
      type: mongoose.Schema.ObjectId,
      ref: 'User',
      required: true,
    },
    teacher: {
      type: mongoose.Schema.ObjectId,
      ref: 'User',
    },

    programTypeKey: { type: String, default: 'MemorizationProgram' },

    // 🔹 Program Setup
    programType: {
      type: String,
      enum: ['new_memorization', 'memorization_revision', 'revision_consolidation'],
      required: true,
    },
    planName: {
      type: String,
      required: true,
    },
    memorizationDirection: { type: String, enum: ['fatihah_to_nas', 'nas_to_fatihah'] },
    memorizedParts: { type: Number, min: 0, max: 30 }, // e.g. ['Al-Fatiha', 'Al-Baqarah']

    // 🔹 Scheduling
    weeklySessions: { type: Number, enum: [1, 2, 3, 4, 5], required: true },
    sessionDuration: { type: Number, enum: [15, 30, 45, 60], required: true },
    preferredDays: {
      type: [String],
      enum: ['sunday', 'monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday'],
      validate: [(v) => v.length > 0, 'At least one day is required'],
    },
    packageDuration: {
      type: Number,
      enum: [1, 3, 6,12],
      required: true,
    },

    reservedSlots: [
  {
    day: {
      type: String,
      enum: ['sunday','monday','tuesday','wednesday','thursday','friday','saturday'],
      required: true,
    },
    start: {
      type: String, // "18:00"
      required: true,
    },
    duration: {
      type: Number, // minutes
      required: true,
    }
  }
],


     trialSession: {
      type: Boolean,
      default: false,
    },
    meetingLink: String,
    meetingId: {
      type: String,
      unique: false,
      default: () => crypto.randomBytes(8).toString('hex'),
    },

    // 🔹 Memorization Details
    memorizationRange: {
      fromSurah: String,
      fromAyah: Number,
      toSurah: String,
      toAyah: Number,
    },
    pagePerSession: { type: Number, min: 0.5, max: 10 },

    // 🔹 Revision Section (optional)
    revisionRange: {
      fromSurah: String,
      fromAyah: Number,
      toSurah: String,
      toAyah: Number,
    },
    revisionPagesPerSession: { type: Number },
    revisionType: {
      type: String,
      enum: ['daily', 'weekly', 'monthly'],
    },

    // 🔹 Progress Tracking
    totalPages: { type: Number, default: 0 },
    completedPages: { type: Number, default: 0 },
    progressPercent: { type: Number, default: 0 },
    lastSession: {
      date: { type: Date },
      fromSurah: String,
      fromAyah: Number,
      toSurah: String,
      toAyah: Number,
      notes: String,
    },
    nextTarget: { type: String },
    createdAt: {
      type: Date,
      default: Date.now,
    },
    updatedAt: { type: Date, default: Date.now },
  },
  { timestamps: true }
);

// 🧮 Auto-calculate progress percentage before saving
memorizationProgramSchema.pre('save', function (next) {
  if (this.totalPages > 0) {
    this.progressPercent = Math.min(Math.round((this.completedPages / this.totalPages) * 100), 100);
  } else {
    this.progressPercent = 0;
  }
  next();
});

const MemorizationProgram = mongoose.model('MemorizationProgram', memorizationProgramSchema);
module.exports = MemorizationProgram;
