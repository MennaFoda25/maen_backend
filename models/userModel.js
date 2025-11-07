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

// const mongoose = require('mongoose');

// const trialSessionSchema = new mongoose.Schema(
//   {
//     program: {
//       type: mongoose.Schema.ObjectId,
//       ref: 'CorrectionProgram',
//       required: true,
//     },

//     student: {
//       type: mongoose.Schema.ObjectId,
//       ref: 'User',
//       required: true,
//     },
//     teacher: {
//       type: mongoose.Schema.ObjectId,
//       ref: 'User',
//       required: true,
//     },
//     duration: {
//       type: Number,
//       default: 15,
//     },
//     status: {
//       type: String,
//       enum: ['pending', 'scheduled', 'completed', 'cancelled'],
//       default: 'pending',
//     },
//     scheduledAt: Date,
//     meetingLink: String,
//     createdAt: {
//       type: Date,
//       default: Date.now,
//     },
//   preferredTimes: {
//       type: [String],
//      // enum: ['6-9_am', '10-1_pm', '2-5_pm', '6-9_pm', '10-1_am'],
//     }, // e.g. ['evening', 'afternoon']
//     Days: {
//       type: [String],
//       required:true},
//   },
//   { toJSON: { virtuals: true }, toObject: { virtuals: true } }
// );

// const TrialSession = mongoose.model('TrialSession', trialSessionSchema);
// module.exports = TrialSession;
