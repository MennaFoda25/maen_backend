const CorrectionProgram = require('../models/correctionProgramModel');
const Session = require('../models/sessionModel');
const ApiError = require('../utils/apiError');
const asyncHandler = require('express-async-handler');
const { createTrialSession } = require('./sessionServices');
const User = require('../models/userModel');
const factory = require('../controllers/handlerFactory');

// Helper to safely convert strings or arrays into array of strings
const toArray = (value) => {
  if (!value) return [];
  if (Array.isArray(value)) {return value.map((v) =>{
      if (typeof v === "string") return v.trim();
      return v; // keep objects unchanged
    });
  }

  // If value is an object, wrap in array
  if (typeof value === "object") return [value];

  // Otherwise treat as string "a,b,c"
  return String(value)
    .split(',')
    .map((v) => v.trim())
    .filter(Boolean);
};

// @desc    Create new Correction Program for student
// @route   POST /api/v1/programs/correction
// @access  Protected (student only)

exports.createCorrectionProgram = asyncHandler(async (req, res, next) => {
  const student = await User.findById(req.user._id);

  if (student.status !== 'active') {
    return next(new ApiError('Only active student can proceed', 403));
  }

  const newProgram = await CorrectionProgram.create({
    student: student._id,
    goal: req.body.goal,
    currentLevel: req.body.currentLevel,
    weeklySessions: req.body.weeklySessions,
    sessionDuration: req.body.sessionDuration,
    preferredTimes: toArray(req.body.preferredTimes),
   // days: toArray(req.body.days),
    teacher: req.body.teacher,
    planName: req.body.planName,
    fromSurah: req.body.fromSurah,
    toSurah: req.body.toSurah,
    audioReferences: req.body.audioReferences,
    pagesPerSession: req.body.pagesPerSession,
    totalPages: req.body.totalPages,
    completedPages: req.body.completedPages || 0,
    packageDuration: req.body.packageDuration,

    status: 'active',
  });

  let populatedTrial = null;

  //const programData = await CorrectionProgram.findById(newProgram._id);
  if (req.body.trialSession && req.body.teacher) {
    
    const trial = await createTrialSession({
      programId: newProgram._id,
      programModel: 'CorrectionProgram',
      studentId: req.user._id,
      teacherId: newProgram.teacher,
      preferredTimes: newProgram.preferredTimes,
      days: newProgram.days,
    });
    populatedTrial = (await trial)
      ? await Session.findById(trial._id)
          .populate('student', 'name email')
          .populate('teacher', 'name email')
      : null;
  }
  // Populate for response
  const populatedProgram = await CorrectionProgram.findById(newProgram._id)
    .populate('student', 'name email')
    .populate('teacher', 'name email');

  res.status(201).json({
    status: 'success',
    message: 'Correction program created successfully',
    data: {
      program: populatedProgram,
      trialSession: populatedTrial,
    },
  });
});

// @desc    Get all correction programs for logged-in student
// @route   GET /api/v1/programs/correction
// @access  Protected

exports.getMyCorrectionProgram = asyncHandler(async (req, res, next) => {
  let filter = {};
  const { _id, role } = req.user;
  let populated = '';

  if (role === 'teacher') {
    filter = { teacher: _id };
    populated = 'student';
  } else if (role === 'student') {
    filter = { student: _id };
    populated = 'teacher';
  } else {
    return next(new ApiError('Only teachers and students can access their programs'), 403);
  }

  const programs = await CorrectionProgram.find(filter)
    .populate(populated, 'name email')
    .select('-__v');

  if (!programs || programs.length === 0) {
    return next(
      new ApiError(
        role === 'teacher'
          ? 'No memorization programs assigned to you yet'
          : "You don't have any memorization programs yet",
        404
      )
    );
  }

  res.status(200).json({
    status: 'success',
    count: programs.length,
    role,
    data: programs,
  });
});

// @desc    Get all correction programs (Admin )
exports.getAllCorrectionPrograms = factory.getAll(CorrectionProgram);

exports.getAssignedTeacherTrials = asyncHandler(async (req, res, next) => {
  const teacher = req.user._id;

  if (req.user.role !== 'teacher') {
    return next(new ApiError('Only teachers can access trial sessions', 403));
  }

  const trialSession = await Session.find({ teacher, type:"trial" })
    .populate('student', 'name email')
    .populate('program', 'planName goal currentLevel status')
    .sort({ createdAt: -1 });
  if (!trialSession) {
    return next(new ApiError("you don't have anytrial session requests"), 403);
  }
  res.status(200).json({ status: 'success', count: trialSession.length, data: { trialSession } });
});
