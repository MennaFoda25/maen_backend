const mongoose = require('mongoose');
const teacherRequestSchema = new mongoose.Schema(
  {
    //🔹 Basic Info
    firebaseUid: { type: String, required: true, index: true },
    name: { type: String, required: true },
    email: { type: String, required: true, lowerCase: true },
    gender: { type: String, enum: ['male', 'female'], required: true },
    phone: String,
    birthDate: Date,
    countryOfResidence: String,
    nationality: String,
    profile_picture: {
      type: String,
    },

    // 🔹 Teacher Profile (Nested)
    teacherProfile: {
      bio: { type: String },

      // 🎓 Academic & Quran Qualifications
      educationLeve: {
        type: String,
        enum: ['phd', 'master', 'bachelor', 'diploma', 'high_school', 'other'],
      },
      major: { type: String },
      hasIjazah: { type: Boolean, default: false },
      qiraat: {
        type: [String],
        enum: ['hafs', 'shubah', 'warsh', 'qaloon', 'sabaa', 'ashr_soghra', 'ashr_kubra', 'other'],
      },
      otherQiraat: { type: String },

      // 🧭 Teaching Tracks / Fields
      teachingTracks: {
        type: [String],
        enum: [
          'tilawah',
          'performance',
          'hifz',
          'tajweed',
          'mutoon',
          'qiraat',
          'kids',
          'arabic_for_non_arabs',
        ],
      },
      // 📜 Uploaded Certificates (Cloudinary)
      certificates: [
        {
          fileUrl: { type: String },
          fileName: { type: String , required: true},
        },
      ],

      // 💼 Experience & Skills
      quranTeahcingExperience: {
        type: String,
        enum: ['less_than_1', '1_to_3', '3_to_5', '5_to_10', 'more_than_10'],
      },
      onlineTeachingExperience: {
        type: String,
        enum: ['none', 'less_than_1', '1_to_3', '3_to_5', 'more_than_5'],
      },
      ageGroups: {
        type: [String],
        enum: ['children', 'teens', 'adults'],
      },
      teachingNonArabs: {
        type: String,
        enum: ['excellent', 'basic', 'none'],
      },
      languages: {
        type: [String],
        enum: ['arabic', 'english', 'french', 'german', 'urdu'],
      },

      // ⚙️ Technical Setup & Availability

      quietEnvironment: { type: Boolean },
      deviceType: {
        type: String,
        enum: ['desktop', 'tablet', 'mobile'],
      },
      timezone: { type: String },
      availabilitySchedule: [
        {
          day: {
            type: String,
            enum: ['saturday', 'sunday', 'monday', 'tuesday', 'wednesday', 'thursday', 'friday'],
          },
          timeSlots: [
            {
              from: String,
              to: String,
            },
          ],
        },
      ],
    },

    // 🧾 Agreement Fields
    declarationAccuracy: { type: Boolean, default: false },
    acceptTerms: { type: Boolean, default: false },
    acceptPrivacy: { type: Boolean, default: false },

    // ⚙️ Admin Review Fields
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
  },
  {
    timestamps: true,
  }
);
const TeacherRequest = mongoose.model('TeacherRequest', teacherRequestSchema);

module.exports = TeacherRequest;
