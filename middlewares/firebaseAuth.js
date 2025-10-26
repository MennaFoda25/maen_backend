const admin = require('../config/firebase');
const asyncHandler = require('express-async-handler');
const User = require('../models/userModel');
const ApiError = require('../utils/apiError');

/**
 * verifyFirebaseToken
 * - Strict: invalid/expired token => 401
 * - Attaches req.firebase (decoded token)
 * - Attaches req.user if Mongo user exists
 */
const verifyFirebaseToken = asyncHandler(async (req, res, next) => {
  const header = req.headers.authorization || '';
  const match = header.match(/^Bearer (.+)$/);
  if (!match) return next(new ApiError('Missing or malformed Authorization header', 401));

  const idToken = match[1];

  // Strict: map verification errors to 401 using .catch (no explicit try/catch)
  const decoded = await admin
    .auth()
    .verifyIdToken(idToken)
    .catch(() => {
      // throws to be handled by asyncHandler -> global error handler
      throw new ApiError('Invalid or expired Firebase ID token', 401);
    });

  req.firebase = decoded;

  // Attach Mongo user if exists (do not auto-create here)
  const user = await User.findOne({ firebaseUid: decoded.uid });
  if (user) req.user = user;

  next();
});

module.exports = { verifyFirebaseToken };
