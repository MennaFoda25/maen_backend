const mongoose = require('mongoose');

const certificateSchema = new mongoose.Schema(
  {
    fileUrl: { type: String },
    fileName: { type: String },
  },
  { _id: false }
);
const teacherSchema = new mongoose.Schema(
  {
    bio: { type: String },
    certificates: [certificateSchema],
    specialties: [String],
    programPreference: [
      {
        type: mongoose.Schema.ObjectId,
        ref: 'ProgramType',
      },
    ],
    hourly_rate: { type: Number },
    availabilitySchedule: [
      {
        day: {
          type: String,
          enum: ['saturday', 'sunday', 'monday', 'tuesday', 'wednesday', 'thursday', 'friday'],
        },
        slots: [
          {
            start: { type: String, required: true }, // "14:00"
            end: { type: String, required: true }, // "15:30"
          },
        ],
      },
    ],
    fulfilledMinutes: {
      type: Number,
      default: 0, // increases after each completed session
    },
    earnings: {
      total: { type: Number, default: 0 }, // total money earned
      transactions: [
        {
          session: { type: mongoose.Schema.ObjectId, ref: 'Session' },
          minutes: Number,
          rate: Number,
          amount: Number,
          createdAt: { type: Date, default: Date.now },
        },
      ],
    },
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

    role: {
      type: String,
      enum: ['student', 'teacher', 'admin'],
      default: 'student',
    },
    status: {
      type: String,
      enum: ['active', 'inactive', 'pending', 'rejected'],
      default: 'active',
    },
    country: { type: String },
    language: { type: String, default: 'en' },
    currency: { type: String, default: 'EGP' },
    profile_picture: {
      type: String,
    },
    gender: { type: String, enum: ['male', 'female'], requied: true },
    teacherProfile: teacherSchema,
    studentProfile: studentSchema,
    createdAt: { type: Date, default: Date.now },
    rating: { type: Number, default: 0 }, // average rating (0–5)
    ratingCount: { type: Number, default: 0 }, // number of ratings
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
// const TeacherSchema = mongoose.model('Teahcer',teacherSchema)
module.exports = User;
