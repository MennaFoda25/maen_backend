// models/MemorizationProgram.js
const mongoose = require('mongoose');

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
    preferredTimes: [
      {
        day: {
          type: String,
          enum: ['sunday', 'monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday'],
        },
        start: String, // e.g. "18:00"
      },
    ],
    packageDuration: {
      type: Number,
      enum: [1, 3, 6],
      required: true,
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
