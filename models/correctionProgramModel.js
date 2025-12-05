const mongoose = require('mongoose');
const crypto = require('crypto');

const correctionProgramSchema = new mongoose.Schema(
  {
    student: {
      type: mongoose.Schema.ObjectId,
      ref: 'User',
      required: true,
    },

    // 🎯 NEW — To match your hardcoded types
    programTypeId: { type: Number, default: 1 }, // always 1
    programTypeKey: { type: String, default: 'correction' },

    teacher: {
      type: mongoose.Schema.ObjectId,
      ref: 'User',
    },
    goal: {
      type: String,
      enum: [
        'general_mistakes',
        'hidden_mistakes',
        'ijazah_preparation',
        'performance_development',
      ],
      required: [true, 'Goal is required'],
    },
    meetingLink: String,
    meetingId: {
      type: String,
      default: () => crypto.randomBytes(8).toString('hex'),
    },
    currentLevel: {
      type: String,
      enum: ['beginner', 'intermediate', 'advanced'],
      required: [true, 'Level is required'],
    },
    weeklySessions: {
      type: Number,
      enum: [1, 2, 3, 4, 5],
      required: [true, 'Number of weekly sessions is required'],
    },
    sessionDuration: {
      type: Number, // minutes
      enum: [15, 30, 45, 60],
      required: [true, 'Session duration is required'],
    },
     preferredTimes: [
      {
        day: {
          type: String,
          enum: ['sunday', 'monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday'],
        },
        start: String, // e.g. "18:00"
      },
    ],
    //days:[String],
    planName: {
      type: String,
      required: true,
    },
    fromSurah: {
      type: String,
      required: [true, 'Starting surah is required'],
    },
    toSurah: {
      type: String,
      required: [true, 'Ending surah is required'],
    },

    audioReferences: { type: String },

    pagesPerSession: {
      type: Number,
      min: 0.25,
      max: 5,
      default: 1,
    },
    packageDuration: {
      type: Number,
      enum: [1, 3, 6],
      required: true,
    },
    totalPages: {
      type: Number,
    },
    completedPages: { type: Number },
    trialSession: {
      type: Boolean,
      default: false,
    },
    teacherComment: String,
    notes: String,

    progress: {
      completedPages: { type: Number, default: 0 },
      totalMistakes: { type: Number, default: 0 },
      completionRate: { type: Number, default: 0 }, // auto = completedPages / totalPages * 100
    },
    status: {
      type: String,
      enum: ['active', 'paused', 'completed'],
      default: 'active',
    },
    createdAt: {
      type: Date,
      default: Date.now,
    },
  },
  { toJSON: { virtuals: true }, toObject: { virtuals: true } }
);

correctionProgramSchema.pre('save', function (next) {
  if (this.totalPages && this.progress.completedPages) {
    this.progress.completionRate = Math.round(
      (this.progress.completedPages / this.totalPages) * 100
    );
  }
  next();
});

const CorrectionProgram = mongoose.model('CorrectionProgram', correctionProgramSchema);
module.exports = CorrectionProgram;
