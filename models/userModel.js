const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

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
    current_level: String,
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
    firebaseUid: {
      type: String,
      unique: true,
      index: true,
      sparse: true, // allows non-firebase users to exist
    },

    // password: {
    //   type: String,
    //   required: function () {
    //     // 🔥 Only require password if the user is NOT from Firebase
    //     return !this.firebaseUid;
    //   },
    //   select: false,
    // },

    role: {
      type: String,
      enum: ['student', 'teacher', 'admin'],
      default: 'student',
    },
    status: {
      type: String,
      enum: ['active', 'inactive', 'pending','rejected', 'approved'],
      default: 'active',
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

// Encrypt password before saving
// userSchema.pre('save', async function (next) {
//   if (!this.isModified('password')) {
//     return next();
//   }
//   this.password = await bcrypt.hash(this.password, 12);
//   next();
// });
const User = mongoose.model('User', userSchema);

module.exports = User;
