const ApiError = require('../utils/apiError.js');
const admin = require('../config/firebase.js');
const asyncHandler = require('express-async-handler');
const User = require('../models/userModel.js');
const TeacherRequest = require('../models/teacherRequestModel.js');

exports.registerUser = asyncHandler(async (req, res) => {
  const { email, password, role } = req.body;

  if (!email || !password || !role) {
    return next(new ApiError('Email, password and role are required', 400));
  }

  //1- create firebase user
  const firebaseUser = await admin.auth().createUser({
    email,
    password,
    displayName: req.body.name
  });

  //2- prepare profile
  let profile = {};

  if (role === 'student') {
    if (!req.body.learning_goals || !req.body.current_level) {
      return next(
        new ApiError(
          'Student profile must include at least one learning goal and current level',
          400
        )
      );
    }

    profile = {
      studentProfile: {
        learning_goals: req.body.learning_goals,
        current_level: req.body.current_level,
      },
    };
  }

  if (role === 'teacher') {
    if (!req.body.bio) {
      return next(new ApiError('Teacher must include bio', 400));
    }
     
    profile = {
      teacherProfile: {
        bio: req.body.bio,
        certificates: req.body.certificates || [],
        specialties: req.body.specialties || [],
      },
      status: 'pending',
    };
  }

  //3- save user to Mongo
  const user = await User.create({
    firebase_uid: firebaseUser.uid,
    email,
    name:req.body.name,
    role,
    profile_picture: req.body.profile_picture || '',
    ...profile,
  });

  if(role === 'teacher'){
   await TeacherRequest.create({
    userId: user._id,
    status: 'pending',
    reason: req.body.reason || 'Teacher initial sign up',
  });
  }

  // const { email, password } = req.body;

  // const user = await admin.auth().createUser({
  //   email,
  //   password,
  // });
  res.status(201).json({
    status: 'success',
    message: 'User registered successfully',
    data: user,
  });
});

exports.loginUser = asyncHandler(async (req, res) => {
  res.status(200).json({
    message:
      'Login is handled by Firebase client SDK. Use the Firebase token in Authorization header for protected routes.',
  });
});

exports.getFirebaseUser = asyncHandler(async (req, res, next) => {
  const { firebase_uid } = req.user;

  const userRecord = await admin.auth().getUser(firebase_uid);
  res.status(200).json({ user: userRecord, dbUser: req.user });

  if (!userRecord) {
    return next(new ApiError('No user found with this id', 404));
  }
});

exports.allowedTo = (...roles) => {
  return (req, res, next) => {
    if (!roles.includes(req.user.role)) {
      return next(new ApiError('You are not allowed to access this route', 403));
    }
    if (req.user.role === 'teacher' && req.user.status === 'pending') {
  return next(new ApiError('Your teacher account is awaiting approval', 403));
}

    next();
  };
};
