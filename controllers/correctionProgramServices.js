const CorrectionProgram = require('../models/correctionProgramModel');
const TrialSession = require('../models/trialSessionModel');
const ApiError = require('../utils/apiError');
const asyncHandler = require('express-async-handler');
const User = require('../models/userModel');
const factory = require('../controllers/handlerFactory');

// @desc    Create new Correction Program for student
// @route   POST /api/v1/programs/correction
// @access  Protected (student only)

exports.createCorrectionProgram = asyncHandler(async (req, res, next) => {
  const studentId = req.user._id;
  const student = await User.findById(studentId);

  if (!student || student.role !== 'student' || student.status !== 'active') {
    return next(new ApiError('Only active student can proceed', 403));
  }

  const newProgram = await CorrectionProgram.create({
    student: studentId,
    ...req.body, // spread first so it doesn’t overwrite parsed data later

    preferredTimes: req.body.preferredTimes
      ? Array.isArray(req.body.preferredTimes)
        ? req.body.preferredTimes
        : req.body.preferredTimes.split(',').map((t) => t.trim())
      : [],

    Days: req.body.Days
      ? Array.isArray(req.body.Days)
        ? req.body.Days
        : req.body.Days.split(',').map((d) => d.trim())
      : [],

    status: 'active',
  });

  let trial = null;
  if (req.body.trialSession && req.body.assignedTeacher) {
    const neededTeacher = await User.findById(req.body.assignedTeacher);
    if (!neededTeacher || neededTeacher.status !== 'active') {
      return next(new ApiError('Sorry this teacher is no available ', 403));
    }
    trial = await TrialSession.create({
      program: newProgram._id,
      student: req.user._id,
      teacher: req.body.assignedTeacher,
      duration: 15,
      status: 'pending',
      preferredTimes: newProgram.preferredTimes,
      Days: newProgram.Days,
    });
  }

  // ✅ Populate response
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
    message: 'Correction program is created successfully',
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
  const programs = await CorrectionProgram.find({ student: req.user._id }).populate(
    'assignedTeacher',
    'name email'
  );

  if (!programs) {
    return next(new ApiError('No programs found for this user', 403));
  }

  res.status(200).json({
    status: 'success',
    results: programs.length,
    data: programs,
  });
});

// @desc    Get all correction programs (Admin )
exports.getAllCorrectionPrograms = factory.getAll(CorrectionProgram);

exports.getAllFreeTrials = factory.getAll(TrialSession);

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
