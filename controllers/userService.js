const asyncHandler = require('express-async-handler');
const User = require('../models/userModel');
const factory = require('./handlerFactory');
const ApiError = require('../utils/apiError');
const admin = require('../config/firebase');

// @desc    Create user
// @route   POST  /api/v1/users
// @access  Private/Admin
exports.createAdmin = asyncHandler(async (req, res, next) => {
  if (!req.firebase || !req.firebase.uid) return next(new ApiError('Missing Firebase token', 401));
  const decoded = req.firebase;
  if (req.body.role === 'admin') {
    const admin = await User.create({
      firebaseUid: decoded.uid,
      name: decoded.name || req.body.name,
      email: decoded.email || req.body.email,
      phone: decoded.phone || req.body.phone,
      role: 'admin',
      status: 'active',
    });
    return res.status(201).json({ message: 'Admin create successfully', admin });
  }
});

// @desc    Update specific user
// @route   PUT /api/v1/users/:id
// @access  Private/Admin
exports.updateUser = asyncHandler(async (req, res, next) => {
  const user = req.user;

  // Debug logging
  // console.log('=== UPDATE USER DEBUG ===');
  // console.log('req.uploadedFiles:', req.uploadedFiles);
  // console.log('profile_picture:', req.uploadedFiles?.profile_picture);
  // console.log('req.body:', req.body);

  // if (req.body.password) {
  //   return next(
  //     new ApiError('You cannot update password from here, please use /changeMyPassword route', 400)
  //   );
  // }

  // Handle case where req.body is null (when only files are uploaded)
  if (!req.body) {
    req.body = {};
  }

  // Remove empty strings that Swagger sends
  Object.keys(req.body).forEach((key) => {
    if (req.body[key] === '') {
      delete req.body[key];
    }
  });

  const allowedFields = ['name', 'slug', 'phone', 'email'];
  const updateData = {};

  for (const field of allowedFields) {
    if (req.body[field] !== undefined) {
      updateData[field] = req.body[field];
    }
  }

  // Handle profile picture upload (from file upload middleware)
  console.log('Checking profile picture:', req.uploadedFiles?.profile_picture?.[0]);
  if (req.uploadedFiles?.profile_picture?.[0]?.fileUrl) {
    console.log('Profile picture found:', req.uploadedFiles.profile_picture[0].fileUrl);
    updateData.profile_picture = req.uploadedFiles.profile_picture[0].fileUrl;
  } else {
    console.log('No profile picture uploaded');
  }
  // const updateData = {
  //   name: req.body.name || user.name,
  //   slug: req.body.slug || user.slug,
  //   phone: req.body.phone || user.phone,
  //   email: req.body.email || user.email,
  //   profile_picture: req.body.profile_picture || user.profile_picture,
  // };

  if (user.role === 'student') {
    const { learning_goals, current_level, preferredTimes } = req.body;
    updateData.studentProfile = {
      learning_goals: learning_goals
        ? Array.isArray(learning_goals)
          ? learning_goals
          : String(learning_goals)
              .split(',')
              .map((v) => v.trim())
        : (user.studentProfile?.learning_goals ?? []),
      current_level: current_level ?? user.studentProfile?.current_level ?? '',
    };
  }
  if (user.role === 'teacher') {
    const { bio, specialties, hourly_rate, availabilitySchedule, certificates } = req.body;

    // -----------------------------
    // 1️⃣ Parse availabilitySchedule correctly
    // -----------------------------
    let parsedSchedule = user.teacherProfile?.availabilitySchedule ?? [];

    if (availabilitySchedule) {
      let scheduleData = availabilitySchedule;

      // If string in form-data → parse it
      if (typeof availabilitySchedule === 'string') {
        try {
          scheduleData = JSON.parse(availabilitySchedule);
        } catch (err) {
          return next(new ApiError('Invalid availabilitySchedule JSON format', 400));
        }
      }

      // Convert into valid format
      if (Array.isArray(scheduleData)) {
        parsedSchedule = scheduleData.map((item) => ({
          day: item.day,
          slots: Array.isArray(item.slots)
            ? item.slots // already correct
            : [
                {
                  start: item.start,
                  end: item.end,
                },
              ],
        }));
      }
    }

    // -----------------------------
    // 2️⃣ Parse specialties safely
    // -----------------------------
    const parsedSpecialties = specialties
      ? Array.isArray(specialties)
        ? specialties
        : String(specialties)
            .split(',')
            .map((v) => v.trim())
      : (user.teacherProfile?.specialties ?? []);

    // -----------------------------
    // 3️⃣ Certificates handling
    // -----------------------------
    let parsedCertificates = user.teacherProfile?.certificates ?? [];

    if (req.uploadedFiles?.certificates?.length > 0) {
      parsedCertificates = req.uploadedFiles.certificates.map((c) => c.fileUrl);
    } else if (certificates) {
      parsedCertificates = Array.isArray(certificates)
        ? certificates
        : String(certificates)
            .split(',')
            .map((v) => v.trim());
    }

    // -----------------------------
    // 4️⃣ Build final teacher profile
    // -----------------------------
    updateData.teacherProfile = {
      bio: bio ?? user.teacherProfile?.bio ?? '',
      specialties: parsedSpecialties,
      hourly_rate: hourly_rate ?? user.teacherProfile?.hourly_rate ?? 0,
      availabilitySchedule: parsedSchedule,
      certificates: parsedCertificates,
      programPreference: user.teacherProfile?.programPreference ?? [], // do NOT overwrite
    };
  }

  const updatedUser = await User.findByIdAndUpdate(user._id, updateData, {
    new: true,
    runValidators: true,
  }).lean();

  res.status(200).json({
    status: 'success',
    message: 'User updated successfully',
    data: updatedUser,
  });
});

// @desc    Get specific user by id
// @route   GET /api/v1/users/:id
// @access  Private/Admin
exports.getUser = factory.getOne(User);

// @desc    Get list of users
// @route   GET /api/v1/users
// @access  Private/Admin
exports.getAllUsers = factory.getAll(User);

// @desc    Delete specific user
// @route   DELETE /api/v1/users/:id
// @access  Private/Admin
exports.deleteUser = factory.deleteOne(User);

// @desc    change user password
// @route   Put /api/v1/users/:id
// @access  Private/Admin

exports.changePassword = asyncHandler(async (req, res, next) => {
  const firebaseUid = req.firebase?.uid;
  if (!firebaseUid) return next(new ApiError('Missing Firebase token', 401));
  const { newPassword } = req.body;
  if (!newPassword) {
    return next(new ApiError('New password is required', 400));
  }

  await admin.auth().updateUser(firebaseUid, { password: newPassword });

  return res.status(200).json({ status: 'success', message: 'Password changed successfully' });
});
/**
 * PUT /api/v1/admin/user/:id/suspend
 * Body: { action: 'suspend'|'activate' }
 */
exports.suspendUser = asyncHandler(async (req, res, next) => {
  const { status } = req.body;

  if (!['inactive', 'active'].includes(status)) {
    return next(new ApiError('Action must be either "suspend" or "activate"', 400));
  }

  const user = await User.findById(req.params.id);
  if (!user) {
    return next(new ApiError('User not found', 404));
  }
  user.status = status;

  await user.save();
  res.json({ message: 'user status has changed susseccfully ', user });
});

exports.deleteMe = asyncHandler(async (req, res, next) => {
  const firebaseUid = req.user.firebaseUid;

  await User.findOneAndDelete({ firebaseUid });
  res.status(204).json({ status: 'success', message: 'User deleted successfully' });
});
