const mongoose = require('mongoose');

const teacherSchema = new mongoose.Schema(
  {
    bio: String,
    certificates: [String],
    specialties: [String],
    hourly_rate: Number,
    availability_schedule: [String],
  },
  { _id: false }
);

const studentSchema = new mongoose.Schema(
  {
    learning_goals: [String],
    current_level: [String],
  },
  { _id: false }
);

const userSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      trim: true,
      required: [true, 'Please enter your name'],
    },
    slug: {
      type: String,
      lowercase: true,
    },
    email: {
      type: String,
      required: [true, 'Please enter your email'],
      unique: true,
      lowercase: true,
    },
    phone: String,
    password: {
      type: String,
      required: [true, 'Please enter your password'],
    },
    role: {
      type: String,
      enum: ['student', 'teacher', 'admin'],
      default: 'student',
    },
    country: { type: String },
    language: { type: String, default: 'en' },
    currency: { type: String, default: 'EGP' },
    profile_picture: { type: String },
    teacherProfile: teacherSchema,
    studentProfile: studentSchema,
    createdAt: { type: Date, default: Date.now },
  },
  {
    toJSON: { virtuals: true },
    toObject: { virtuals: true },
    timestamps: true,
  }
);

//Conditional validation logic
userSchema.pre('save', function (next) {
  if (this.role === 'teacher' && !this.teacherProfile) {
    return next(new Error('Teacher profile is required'));
  }

  // if (this.role === 'student' && !this.studentProfile) {
  //   return next(new Error('Student profile is required'));
  // }
  next();
});

const User = mongoose.model('User', userSchema);

module.exports = User;
