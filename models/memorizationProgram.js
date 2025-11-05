// models/MemorizationProgram.js
const mongoose = require('mongoose');

const memorizationProgramSchema = new mongoose.Schema({
  student: {
    type: mongoose.Schema.ObjectId,
    ref: 'User',
    required: true,
  },
  teacher: {
    type: mongoose.Schema.ObjectId,
    ref: 'User',
  },
  pathType: {
    type: String,
    enum: ['new_memorization', 'revision'],
    required: true,
  },
  direction: {
    type: String,
    enum: ['from_start', 'from_end', 'specific'],
    default: 'from_start',
  },
  startSurah: String,
  endSurah: String,
  revisionType: {
    type: String,
    enum: ['daily', 'weekly', 'monthly'],
  },
  currentPart: {
    type: String,
  },
  memorizedParts: [String], // e.g. ['Al-Fatiha', 'Al-Baqarah']
  weeklySessions: Number,
  sessionDuration: Number,
  preferredTimes: [String],
  preferredDays: [String],
  notes: String,
  teacherComment: String,
  planStatus: {
    type: String,
    enum: ['pending', 'active', 'completed'],
    default: 'pending',
  },
  progress: {
    memorized: Number, // e.g. ayahs or surahs count
    revised: Number,
    comment: String,
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
});

const MemorizationProgram = mongoose.model('MemorizationProgram', memorizationProgramSchema);
module.exports = MemorizationProgram;
