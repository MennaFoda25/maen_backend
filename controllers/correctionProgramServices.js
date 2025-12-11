const CorrectionProgram = require('../models/correctionProgramModel');
const Session = require('../models/sessionModel');
const ApiError = require('../utils/apiError');
const asyncHandler = require('express-async-handler');
const { createTrialSession } = require('./sessionServices');
const User = require('../models/userModel');
const factory = require('../controllers/handlerFactory');
const ProgramType = require('../models/programTypeModel');

// Helper to safely convert strings or arrays into array of strings
const toArray = (value) => {
  if (!value) return [];
  if (Array.isArray(value)) return value;
  if (typeof value === 'object') return [value];

  // string "a,b" → array ["a", "b"]
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
  // Auto-extract days from preferredTimes
  let preferredTimes  = toArray(req.body.preferredTimes);
    // Each item must have: { day, start, end }
  const invalid = preferredTimes.some(
    (pt) =>
      !pt ||
      !pt.day ||
      !pt.start ||
      !pt.end ||
      typeof pt.day !== 'string' ||
      !/^([01]\d|2[0-3]):[0-5]\d$/.test(pt.start) ||
      !/^([01]\d|2[0-3]):[0-5]\d$/.test(pt.end)
  );

  if (invalid || preferredTimes.length === 0) {
    return next(
      new ApiError(
        'preferredTimes must be an array of objects: { day, start, end }',
        400
      )
    );
  }


  const newProgram = await CorrectionProgram.create({
    student: student._id,
    goal: req.body.goal,
    currentLevel: req.body.currentLevel,
    weeklySessions: req.body.weeklySessions,
    sessionDuration: req.body.sessionDuration,
    preferredTimes: preferredTimes,
    planName: req.body.planName,
    fromSurah: req.body.fromSurah,
    toSurah: req.body.toSurah,
    audioReferences: req.body.audioReferences,
    pagesPerSession: req.body.pagesPerSession,
    totalPages: req.body.totalPages,
    completedPages: req.body.completedPages || 0,
    packageDuration: req.body.packageDuration,
    trialSession: req.body.trialSession,

    status: 'active',
  });

  const program = await CorrectionProgram.findById(newProgram._id)
  if(!program) return next(new ApiError('Program could not be created',500));

const programModel = program.programTypeKey;
// STEP 3 — Validate ProgramType exists
  const programType = await ProgramType.findOne({ key: programModel });
  if (!programType) {
    console.log("❌ ProgramType not found for key:", programModel); // debugging
    return next(new ApiError("ProgramType not found for this program", 404));
  }


  let createdSessions = []
  let populatedTrial = null
  // if (teacher) {
  //   try {
  //     createdSessions = await generatePlanSessionsForProgram(newProgram, teacher);
  //   } catch (err) {
  //     console.error('Error generating plan sessions:', err.message);
  //     // Continue even if session generation fails - the program is created
  //   }
  // }

  // let populatedTrial = null;

  //const programData = await CorrectionProgram.findById(newProgram._id);
  // if (req.body.trialSession && req.body.teacher) {
  //   const trial = await createTrialSession({
  //     programId: newProgram._id,
  //     programModel: 'CorrectionProgram',
  //     studentId: req.user._id,
  //     teacherId: newProgram.teacher,
  //     preferredTimes: newProgram.preferredTimes,
  //     days: newProgram.days,
  //   });
  //   populatedTrial = (await trial)
  //     ? await Session.findById(trial._id)
  //         .populate('student', 'name email')
  //         .populate('teacher', 'name email')
  //     : null;
  // }
  // Populate for response
  const populatedProgram = await CorrectionProgram.findById(newProgram._id)
    .populate('student', 'name email')

  res.status(201).json({
    status: 'success',
    message: 'Correction program created successfully',
    data: {
      program: populatedProgram,
      trialSession: populatedTrial,
     createdSessions: createdSessions.length,
      createdSessions,
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
          ? 'No correction programs assigned to you yet'
          : "You don't have any correction programs yet",
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

  const trialSession = await Session.find({ teacher, type: 'trial' })
    .populate('student', 'name email')
    .populate('program', 'planName goal currentLevel status')
    .sort({ createdAt: -1 });
  if (!trialSession) {
    return next(new ApiError("you don't have anytrial session requests"), 403);
  }
  res.status(200).json({ status: 'success', count: trialSession.length, data: { trialSession } });
});

