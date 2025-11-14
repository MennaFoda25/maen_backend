const CorrectionProgram = require('../models/correctionProgramModel');
const TrialSession = require('../models/trialSessionModel');
const ApiError = require('../utils/apiError');
const asyncHandler = require('express-async-handler');
const User = require('../models/userModel');
const factory = require('../controllers/handlerFactory');
const { createTrialSession } = require('./programServices');

// Helper to safely convert strings or arrays into array of strings
const toArray = (value) => {
  if (!value) return [];
  if (Array.isArray(value)) return value.map((v) => v.trim());
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

  if (!student || student.role !== 'student' || student.status !== 'active') {
    return next(new ApiError('Only active student can proceed', 403));
  }

  const newProgram = await CorrectionProgram.create({
    student: student._id,
    goal: req.body.goal,
    currentLevel: req.body.currentLevel,
    sessionsPerWeek: req.body.sessionsPerWeek,
    sessionDuration: req.body.sessionDuration,
    preferredTimes: toArray(req.body.preferredTimes),
    Days: toArray(req.body.Days),
    assignedTeacher: req.body.assignedTeacher || null,
    planName: req.body.planName,
    fromSurah: req.body.fromSurah,
    toSurah: req.body.toSurah,
    audioReferences: req.body.audioReferences,
    pagesPerSession: req.body.pagesPerSession,
    totalPages: req.body.totalPages,
    completedPages: req.body.completedPages || 0,
    status: 'active',
  });

  let trial = null;
  // if (req.body.trialSession && (req.body.teacher || req.body.assignedTeacher)) {
  //   const teacherId = req.body.teacher || req.body.assignedTeacher;
  //   // trial = await createTrialSession(newProgram, teacherId, req.user._id, 'MemorizationProgram');
  // }

  const programData = await CorrectionProgram.findById(newProgram._id);

  trial = await TrialSession.create({
    program: newProgram._id,
    programModel: 'CorrectionProgram',
    teacher: newProgram.assignedTeacher._id,
    student: req.user._id,
    duration: 15,
    status: 'pending',
    preferredTimes: programData.preferredTimes || req.body.preferredTimes || [],
    days: programData.Days || req.body.Days || [],
  });

  // Populate for response
  const populatedProgram = await CorrectionProgram.findById(newProgram._id)
    .populate('student', 'name email')
    .populate('assignedTeacher', 'name email');

  const populatedTrial = trial
    ? await TrialSession.findById(trial._id)
        .populate('student', 'name email')
        .populate('teacher', 'name email')
    : null;

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
    filter = { assignedTeacher: _id };
    populated = 'student';
  } else if (role === 'student') {
    filter = { student: _id };
    populated = 'assignedTeacher';
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


exports.trialSessionAccept = asyncHandler(async (req, res, next) => {
  const { scheduledAt, meetingLink } = req.body;

  const trial = await TrialSession.findByIdAndUpdate(
    req.params.id,
    {
      scheduledAt,
      meetingLink,
      status: 'scheduled',
    },
    {
      new: true,
    }
  );
  if (!trial) return next(new ApiError('Trial not found'));

  res.status(200).json({
    status: 'success',
    message: 'Trial session confirmed',
    data: trial,
  });
});

exports.getAssignedTeacherTrials = asyncHandler(async (req, res, next) => {
  const teacher = req.user._id;

  if (req.user.role !== 'teacher') {
    return next(new ApiError('Only teachers can access trial sessions', 403));
  }

  const trialSession = await TrialSession.find({ teacher })
    .populate('student', 'name email')
    .populate('program', 'planName goal currentLevel status')
    .sort({ createdAt: -1 });
  if (!trialSession) {
    return next(new ApiError("you don't have anytrial session requests"), 403);
  }
  res.status(200).json({ status: 'success', count: trialSession.length, data: { trialSession } });
});

