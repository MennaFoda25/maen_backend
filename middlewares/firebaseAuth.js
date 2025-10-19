const admin = require('../config/firebase');
const ApiError = require('../utils/apiError');
const User = require('../models/userModel');
const asyncHandler = require('express-async-handler');

// ✔ Verifies Firebase token
// ✔ Finds Mongo user and attaches it to req.user
// ✔ If user not found, auto-creates one
const authMiddleware = asyncHandler(async (req, res, next) => {
  const header = req.headers.authorization;

  if (!header || !header.startsWith('Bearer ')) {
    return next(new ApiError('You are not logged in, Please login to get access', 401));
  }

  const idToken = header.split(' ')[1];
  const decoded = await admin.auth().verifyIdToken(idToken);
  if (!decoded) {
    return next(new ApiError('Invalid token, Please login again', 401));
  }

  // find or create user in MongoDB
  let user = await User.findOne({ firebase_uid: decoded.uid });

  if (!user) {
    user = await User.create({
      name: decoded.name || decoded.email?.split('@')[0] || 'NoName',
      email: decoded.email,
      firebase_uid: decoded.uid,
      role: 'student', // default
      status: 'active',
    });
  }

  req.user = user;
  next();
});

module.exports = authMiddleware;

// const protectFirebase= asyncHandler(async function protectFirebase(req, res, next) {
//   const header = req.headers.authorization || '';
//   if (!header.startsWith('Bearer')) {
//     return next(new ApiError('You are not logged in, Please login to get access', 401));
//   }
//   const idToken = header.split(' ')[1];
//   const decoded = await auth.verifyIdToken(idToken);
//   req.firebaseUser = decoded;

//   let user = await User.findOne({ firebase_uid: decoded.uid });
//   if (!user) {
//     user = await User.create({
//       name: decoded.name || decoded.email?.split('@')[0] || 'NoName',
//       email: decoded.email,
//       firebase_uid: decoded.uid,
//       role: 'student',
//       status: 'active',
//     });
//   }

//   req.user = user;
//   next();
// });
// module.exports = protectFirebase;
