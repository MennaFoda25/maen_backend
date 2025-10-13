const asyncHandler = require('express-async-handler');
const { uploadAndAttachUrl } = require('../middlewares/uploadImageMiddleware');
const User = require('../models/userModel');
const factory = require('./handlerFactory');
const ApiError = require('../utils/apiError');

exports.uploadUserImg = uploadAndAttachUrl('profile_picture');

exports.createUser = asyncHandler(async (req, res, next) => {
  //1- Role based validation

  if (req.body.role === 'student') {
    if (!req.body.learning_goals || !req.body.current_level) {
      return next(
        new ApiError(
          'Student profile must include at least one learning goal and current level',
          400
        )
      );
    }

    req.body.studentProfile = {
      learning_goals: Array.isArray(req.body.learning_goals)
        ? req.body.learning_goals
        : [req.body.learning_goals],
      current_level: Array.isArray(req.body.current_level)
        ? req.body.current_level
        : [req.body.current_level],
    };
  }

  if (req.body.role === 'teacher') {
    if (!req.body.bio) {
      return next(new ApiError('Teacher profile must include bio information', 400));
    }
    req.body.teacherProfile = {
      bio: req.body.bio,
      certificates: req.body.certificates ? req.body.certificates.split(',') : [],
      specialties: req.body.specialties ? req.body.specialties.split(',') : [],
      hourly_rate: req.body.hourly_rate || 0,
      availability_schedule: req.body.availability_schedule
        ? req.body.availability_schedule.split(',')
        : [],
    };
  }

  const document = await User.create(req.body);

  res.status(201).json({ status: 'success', data: document });

  //2- create user document
  //3- respond
});

exports.updateUser = factory.updateOne(User);

exports.getUser = factory.getOne(User);

exports.getAllUsers = factory.getAll(User);

exports.deleteUser = factory.deleteOne(User);
