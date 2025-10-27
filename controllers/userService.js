const asyncHandler = require('express-async-handler');
const { uploadAndAttachUrl } = require('../middlewares/uploadImageMiddleware');
const User = require('../models/userModel');
const factory = require('./handlerFactory');
const ApiError = require('../utils/apiError');
const admin = require('../config/firebase');

exports.uploadUserImg = uploadAndAttachUrl('profile_picture');

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
  const user = await User.findById(req.params.id);

  if (!user) {
    return next(new ApiError('User not found', 404));
  }

  if (req.body.password) {
    return next(
      new ApiError('You cannot update password from here, please use /changeMyPassword route', 400)
    );
  }
  let updateData = {
    name: req.body.name || user.name,
    slug: req.body.slug || user.slug,
    phone: req.body.phone || user.phone,
    email: req.body.email || user.email,
    profile_picture: req.body.profile_picture || user.profile_picture,
    role: req.body.role || user.role,
  };

  if (user.role === 'student') {
    updateData.studentProfile = {
      learning_goals: req.body.learning_goals
        ? Array.isArray(req.body.learning_goals)
          ? req.body.learning_goals
          : [req.body.learning_goals]
        : user.studentProfile?.learning_goals || [],
      current_level: req.body.current_level
        ? Array.isArray(req.body.current_level)
          ? req.body.current_level
          : [req.body.current_level]
        : user.studentProfile?.current_level || [],
    };
  } else if (user.role === 'teacher') {
    updateData.teacherProfile = {
      bio: req.body.bio || user.teacherProfile?.bio || '',
      certificates: req.body.certificates
        ? req.body.certificates.split(',')
        : user.teacherProfile?.certificates || [],
      specialties: req.body.specialties
        ? req.body.specialties.split(',')
        : user.teacherProfile?.specialties || [],
      hourly_rate: req.body.hourly_rate || user.teacherProfile?.hourly_rate || 0,
      availability_schedule: req.body.availability_schedule
        ? req.body.availability_schedule.split(',')
        : user.teacherProfile?.availability_schedule || [],
    };
  }

  const updatedUser = await User.findByIdAndUpdate(req.params.id, updateData, {
    new: true,
    runValidators: true,
  });

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
