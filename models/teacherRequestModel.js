const mongoose = require('mongoose');

const teacherRequestSchema = new mongoose.Schema(
  {
    email: { type: String, required: true, lowerCase: true },
    name: { type: String, required: true },
    firebaseUid: { type: String, required: true, index: true },
    teacherProfile: {
      bio: { type: String },
      certificates: [{ type: String }],
      specialties: [{ type: String }],
      hourly_rate: { type: Number },
    },
    userId: {
      type: mongoose.Schema.ObjectId,
      ref: 'User',
    },
    status: {
      type: String,
      enum: ['pending', 'approved', 'rejected'],
      default: 'pending',
    },
    reason: {
      type: String,
      trim: true,
    },
    createdAt: {
      type: Date,
      default: Date.now(),
    },
  },
  {
    timestamps: true,
  }
);
const TeacherRequest = mongoose.model('TeacherRequest', teacherRequestSchema);

module.exports = TeacherRequest;
