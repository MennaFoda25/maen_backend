const ApiError = require('../utils/apiError.js');
const asyncHandler = require('express-async-handler');
const User = require('../models/userModel.js');
const TeacherRequest = require('../models/teacherRequestModel.js');

//  * POST /api/v1/auth/first-login
//  * - requires verifyFirebaseToken middleware
exports.firstLogin = asyncHandler(async (req, res, next) => {
  if (!req.firebase || !req.firebase.uid) {
    return next(new ApiError('Missing or invalid Firebase token. Please login.', 401));
  }
  const decoded = req.firebase;
  const { role } = req.body;

  if (role === 'teacher') {
    const existingReq = await TeacherRequest.findOne({ firebaseUid: decoded.uid });
    if (existingReq) {
      return next(new ApiError('A teacher request for this user already exists.', 400));
    }
    // Do not create a User. Create TeacherRequest
    // const teacherProfile = req.body.teacherProfile || JSON.parse(req.body.teacherProfile)|| {};
    // if (!teacherProfile.bio || !Array.isArray(teacherProfile.certificates)) {
    //   return next(
    //     new ApiError(
    //       'To sign up as teacher you must send teacherProfile with bio and certificates array.',
    //       400
    //     )
    //   );
    // }
    const tr = await TeacherRequest.create({
      email: decoded.email || req.body.email,
      name:
        decoded.name || req.body.name || (decoded.email ? decoded.email.split('@')[0] : 'NoName'),
      firebaseUid: decoded.uid,
      profile_picture: decoded.picture || req.body.profile_picture || undefined,
      teacherProfile: JSON.parse(req.body.teacherProfile),
      status: 'pending',
    });

    return res
      .status(201)
      .json({ message: 'Teacher request created and pending admin approval', request: tr });
  }

  let user = await User.findOne({ firebaseUid: decoded.uid });

  if (user) {
    let changed = false;
    if (decoded.email && user.email !== decoded.email) {
      user.email = decoded.email;
      changed = true;
    }

    if (decoded.name && user.name !== decoded.name) {
      user.name = decoded.name;
      changed = true;
    }

    if (decoded.picture && user.profile_picture !== decoded.picture) {
      user.profile_picture = decoded.picture;
      changed = true;
    }

    if (changed) await user.save();

    return res.json({ user });
  }

  user = await User.create({
    firebaseUid: decoded.uid,
    email: decoded.email || req.body.email,
    name: decoded.name || req.body.name || (decoded.email ? decoded.email.split('@')[0] : 'NoName'),
    profile_picture: decoded.picture || req.body.profile_picture || undefined,
    role: decoded.role,
    status: 'active',
    studentProfile: JSON.parse(req.body.studentProfile) || undefined,
  });

  return res.status(201).json({ message: 'Account created', user });
});

//GET /api/v1/auth/me
// get current firebase user and verify token

exports.getFirebaseUser = asyncHandler(async (req, res, next) => {
  if (!req.firebase || !req.firebase.uid) {
    return next(new ApiError('Missing or invalid Firebase token. Please login.', 401));
  }
  const decoded = req.firebase;

  const user = await User.findOne({ firebaseUid: decoded.uid });
  if (!user) return next(new ApiError('User not found. Please complete first-login.', 404));

  let changed = false;
  if (decoded.email && user.email !== decoded.email) {
    user.email = decoded.email;
    changed = true;
  }
  if (decoded.name && user.name !== decoded.name) {
    user.name = decoded.name;
    changed = true;
  }
  if (decoded.picture && user.profile_picture !== decoded.picture) {
    user.profile_picture = decoded.picture;
    changed = true;
  }
  if (changed) await user.save();

  res.json({ user });
});

exports.allowedTo = (...roles) =>
  asyncHandler(async (req, res, next) => {
    if (!roles.includes(req.user.role)) {
      return next(new ApiError('You are not allowed to access this route', 403));
    }
    if (req.user.role === 'teacher' && req.user.status === 'pending') {
      return next(new ApiError('Your teacher account is awaiting approval', 403));
    }
    next();
  });
