const TrialSession = require('../models/trialSessionModel');
const User = require('../models/userModel');
const ApiError = require('../utils/apiError');
const factory = require('./handlerFactory');
const asyncHandler = require('express-async-handler');

exports.createTrialSession = asyncHandler(async (program, teacherId, studentId, programModel) => {
  if (!teacherId) return null;

  const teacher = await User.findById(teacherId);

  if (!teacher || teacher.status !== 'active') {
    return next(new ApiError('Selected teacher is not available', 403));
  }

  const trial = await TrialSession.create({
    program: program._id,
    programModel,
    student: studentId,
    teacher: teacherId,
    duration: 15,
    status: 'pending',
    days: program.days,
  });
  return trial;
});

exports.getAllFreeTrials = factory.getAll(TrialSession);

// exports.getDedicatedTeachers = asyncHandler(async (req, res, next) => {
//   const { programPreference } = req.body;

//   const teachers = await User.find({ programPreference });
// });

exports.getTopTeachers = asyncHandler(async (req, res, next) => {
  // 1) fetch all teachers with ratings
  const teachers = await User.find({
    role: 'teacher',
    status: 'active',
    rating: { $gte: 0 },
  })
    .select('name email profile_picture rating ratingCount teacherProfile')
    .lean();

  // 2) sort by highest rating
  const top = teachers.sort((a, b) => b.rating - a.rating).slice(0, 5);

  // 3) respond
  res.status(200).json({
    status: 'success',
    count: top.length,
    data: top,
  });
});

exports.getProgramTeachers = asyncHandler(async (req, res, next) => {
  const program = req.query.program;

  const validPrograms = ['CorrectionProgram', 'MemorizationProgram', 'ChildMemorizationProgram'];

  if (!validPrograms.includes(program)) {
    return next(
      new ApiError('Invalid program type. Valid: correction, memorization, kids_memorization', 400)
    );
  }

  const teachers = await User.find({
    role: 'teacher',
    status: 'active',
    'teacherProfile.programPreference': program,
  }).select('name email profile_picture rating ratingCount teacherProfile');

  res.status(200).json({
    status: 'success',
    count: teachers.length,
    data: teachers,
  });
});
