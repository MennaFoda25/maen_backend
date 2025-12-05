const ApiError = require('../utils/apiError');
const MemorizationProgram = require('../models/memorizationProgramModel');
const asyncHandler = require('express-async-handler');
const Session = require('../models/sessionModel');
const { createTrialSession, generatePlanSessionsForProgram } = require('./sessionServices');
const User = require('../models/userModel');
const factory = require('./handlerFactory');

const toArray = (value) => {
  if (!value) return [];
  if (Array.isArray(value)) {
    return value.map((v) => {
      if (typeof v === 'string') return v.trim();
      return v; // keep objects unchanged
    });
  }

  // If value is an object, wrap in array
  if (typeof value === 'object') return [value];

  // Otherwise treat as string "a,b,c"
  return String(value)
    .split(',')
    .map((v) => v.trim())
    .filter(Boolean);
};

// @desc    Create new memorization Program for student
// @route   POST /api/v1/programs/memorization
// @access  Protected (student only)
exports.createMemorizationProgram = asyncHandler(async (req, res, next) => {
  const student = await User.findById(req.user._id);

  if (student.status !== 'active') {
    return next(new ApiError('only active student can create a memorization program', 403));
  }

  // Auto-extract days from preferredTimes
  let days = [];

  if (Array.isArray(req.body.preferredTimes)) {
    days = req.body.preferredTimes.map((pt) => pt.day).filter(Boolean); // remove null/undefined
  }

  // if (!days.length) {
  //   return next(new ApiError('preferredTimes must include at least one day', 400));
  // }

  const newProgram = await MemorizationProgram.create({
    firebaseUid: student.firebaseUid,
    student: student._id,
    //trackType: req.body.trackType,
    teacher: req.body.teacher|| req.body.assignedTeacher,
    programType: req.body.programType,
    planName: req.body.planName,
    memorizationDirection: req.body.memorizationDirection,
    memorizedParts: req.body.memorizedParts,
    weeklySessions: req.body.weeklySessions,
    sessionDuration: req.body.sessionDuration,
    packageDuration: req.body.packageDuration,
    preferredTimes: toArray(req.body.preferredTimes),
    days,
    memorizationRange: {
      fromSurah: req.body.fromSurah,
      fromAyah: req.body.fromAyah,
      toSurah: req.body.toSurah,
      toAyah: req.body.toAyah,
    },
    pagePerSession: req.body.pagePerSession,
    revisionRange: {
      fromSurah: req.body.revisionFromSurah,
      fromAyah: req.body.revisionFromAyah,
      toSurah: req.body.revisionToSurah,
      toAyah: req.body.revisionToAyah,
    },
    revisionPagesPerSession: req.body.revisionPagesPerSession,
    revisionType: req.body.revisionType, // enum: ['daily', 'weekly', 'monthly']
    totalPages: req.body.totalPages,
    completedPages: req.body.completedPages || 0,

    nextTarget: req.body.nextTarget,
  });

  const teacher = await User.findById(newProgram.teacher);

  let createdSessions = [];
  if (teacher) {
    try {
      createdSessions = await generatePlanSessionsForProgram(newProgram, teacher);
    } catch (err) {
      console.error('Error generating plan sessions:', err.message);
      // Continue even if session generation fails - the program is created
    }
  }

  let populatedTrial = null;
  if (req.body.trialSession && req.body.teacher) {
    const trial = await createTrialSession({
      programId: newProgram._id,
      programModel: 'MemorizationProgram',
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
  const populatedProgram = await MemorizationProgram.findById(newProgram._id)
    .populate('student', 'name email')
    .populate('teacher', 'name email');

  res.status(201).json({
    status: 'success',
    message: 'Memorization program created successfully',
    data: {
      program: populatedProgram,
      trialSession: populatedTrial,
      createdSessions: createdSessions.length,
      createdSessions,
    },
  });
});

// @desc    Get all memorization programs (Admin )
exports.getAllMemorizationPrograms = factory.getAll(MemorizationProgram);

// @desc    Get all memorization Programs for logged in teacher
// @route   POST /api/v1/programs/memorization
// @access  Protected (teacher only)
exports.getMyMemoPrograms = asyncHandler(async (req, res, next) => {
  const { _id, role } = req.user;

  // Determine filter & population based on role
  let filter = {};
  let populateField = '';

  if (role === 'teacher') {
    filter = { teacher: _id };
    populateField = 'student';
  } else if (role === 'student') {
    filter = { student: _id };
    populateField = 'teacher';
  } else {
    return next(new ApiError('Only teachers and students can access their programs', 403));
  }

  // Fetch assigned programs
  const programs = await MemorizationProgram.find(filter)
    .populate(populateField, 'name email')
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
