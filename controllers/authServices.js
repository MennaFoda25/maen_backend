const ApiError = require('../utils/apiError.js');
const asyncHandler = require('express-async-handler');
const User = require('../models/userModel.js');
const { teacherSignUp } = require('./teacherRequestService');
const { studentSignUp } = require('./studentServices');
const TeacherRequest = require('../models/teacherRequestModel');

exports.firstLogin = asyncHandler(async (req, res, next) => {
  const { role } = req.body;

  if (!role) {
    return next(new ApiError('Missing user role in request body', 400));
  }

  if (role === 'teacher') return teacherSignUp(req, res, next);
  if (role === 'student') return studentSignUp(req, res, next);
});

exports.getFirebaseUser = asyncHandler(async (req, res, next) => {
  const uid =
    req.firebase?.uid ||
    req.query?.firebaseUid ||
    req.headers['x-firebase-uid'];

  // if (!uid) {
  //   return next(new ApiError('Missing firebaseUid. Please include it in the request.', 401));
  // }
  console.log('🔥 UID received:', uid);

    // Get notification token (from header or body)
  const notificationToken =
    req.headers['x-notification-token'] ||
    null;

  const user = await User.findOne({ firebaseUid: uid });
  if (user) {
      // Update token if provided
    if (notificationToken && user.notificationToken !== notificationToken) {
      user.notificationToken = notificationToken;
      await user.save();
      console.log("🔔 Saved new notification token for user:", user._id);
    }

    return res.status(200).json({
      message: 'User retrieved successfully',
      status: 'active',
      user,
      notificationToken: user.notificationToken,
    });
  }

  const teacherRequest = await TeacherRequest.findOne({ firebaseUid: uid });
  if (teacherRequest) {
    return res.status(200).json({
      message: 'Teacher request found. Awaiting admin approval.',
      status: teacherRequest.status, // pending / rejected
      request: teacherRequest,
    });
  }
  return next(new ApiError('User not found. Please complete registration.', 404));
});

exports.allowedTo = (...roles) =>
  asyncHandler(async (req, res, next) => {
    const firebaseUid = req.firebase?.uid;
    // if (!firebaseUid) {
    //   return next(new ApiError('Missing firebaseUid', 401));
    // }
    const user = await User.findOne({ firebaseUid });
    if (!user) {
      return next(new ApiError('User not found. Please complete registration first.', 404));
    }

        if (user.role === 'teacher' && user.status === 'pending') {
      return next(new ApiError('Your teacher account is awaiting admin approval', 403));
    }
  // Role check
    if (!roles.includes(user.role)) {
      return next(new ApiError(`Access denied. Only [${roles.join(', ')}] allowed.`, 403));
    }

    req.user = user;
    next();
  });
