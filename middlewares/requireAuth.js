const asyncHandler = require('express-async-handler');
const ApiError = require('../utils/apiError');

const requireAuth = asyncHandler(async (req, res, next) => {
  if (!req.user) return next(new ApiError('You are not logged in', 401));

  if (req.user.status !== 'active' && req.user.role !== 'admin') {
    return next(new ApiError('your account is in active', 403));
  }
  next();
});

const requireAdmin = (req, res, next) => {
  if (!req.user || req.user.role !== 'admin')
    return next(new ApiError('Admin privileges required', 403));
  return next();
};

const requireTeacherActive = (req, res, next) => {
  if (!req.user || req.user.role !== 'teacher')
    return next(new ApiError('Teacher account required', 403));
  if (req.user.status !== 'active') {
    return next(
      new ApiError(
        'Your teacher account is pending approval. You cannot access teacher features yet.',
        403
      )
    );
  }
  return next();
};

module.exports = { requireAuth, requireAdmin, requireTeacherActive };
