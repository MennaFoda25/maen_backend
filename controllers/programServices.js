const TrialSession = require('../models/trialSessionModel');
const User = require('../models/userModel');
const ApiError = require('../utils/apiError');
const factory = require('./handlerFactory');
const asyncHandler = require('express-async-handler');
const ProgramType = require('../models/programTypeModel');

// exports.addPrograms = asyncHandler(async (req, res, next) => {
//   const { name, key } = req.body;
//   //const teachers = await User.find({role:'teacher', status:'active', })
//   const newProgram = await ProgramType.create({ name, key });
//   res.status(201).json({ Count: newProgram.length, data: newProgram });
// });

exports.getProgramTypes = asyncHandler(async (req, res, next) => {
  const programTypes = await ProgramType.find();

  const results = [];

  for (const p of programTypes) {
    const teachers = await User.find({
      role: 'teacher',
      status: 'active',
      'teacherProfile.programPreference': p._id,
    }).select('name email profile_picture rating');

    results.push({
      programType: p,
      teachers,
      teacherCount: teachers.length,
    });
    await p.save()
  }

  res.status(200).json({
    status: 'success',
    programCount: results.length,
    data: results,
  });
});
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

exports.getTeachersByProgramType = asyncHandler(async (req, res) => {
  const programId = req.params.id;

  const teachers = await User.find({
    role: 'teacher',
    status: 'active',
    'teacherProfile.programPreference': programId,
  });

  res.status(200).json({
    status: 'success',
    count: teachers.length,
    data: teachers,
  });
});

// exports.getTeacherByProgram = asyncHandler(async (req, res) => {
//   const programId = req.params.id;
//   const teacher = await User.find({
//     role: 'teacher',
//     status: 'active',
//     teacherProfile?.programPreference: programId,
//   })//.select('name email profile_picture rating teacherProfile');

//   res.status(200).json({
//     status: 'success',
//     count: teacher.length,
//     data: teacher,
//   })
// })
