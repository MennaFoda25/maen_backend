const asyncHandler = require('express-async-handler');
const ApiError = require('../utils/apiError');
const User = require('../models/userModel');

const safeJsonParse = (data, fallback = {}) => {
  return typeof data === 'string' ? JSON.parse(data) : data || fallback;
};


const extractProfileImg = (files, body, decoded) =>
  files?.profileImg?.[0]?.path || body.profile_picture ||  null;

exports.studentSignUp = asyncHandler(async (req, res, next) => {
  const decoded = req.firebase;

  const update = {
    email:  req.body.email,
    name:  req.body.name ,
    profile_picture: extractProfileImg(req.files, req.body, decoded),
    role: 'student',
    phone: req.body.phone ,
    gender: req.body.gender,
    status: 'active',
    studentProfile: safeJsonParse(req.body.studentProfile),
  };

  const user = await User.findOneAndUpdate(
    { firebaseUid: decoded.uid },
    { $set: update },
    { new: true, upsert: true }
  ).lean();

  res.status(201).json({
    message: 'Student profile initialized successfully.',
    user,
  });
});


