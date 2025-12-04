const asyncHandler = require('express-async-handler');
const ApiError = require('../utils/apiError');
const ChildProgram = require('../models/childMemoProgramModel');
const User = require('../models/userModel');
const Session = require('../models/sessionModel');
const factory = require('./handlerFactory');
const { markPromocodeUsed } = require("../controllers/programServices");
const { createTrialSession } = require('./sessionServices');

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

// create program (parent)
exports.createChildMemProgram = asyncHandler(async (req, res, next) => {
  const parent = await User.findById(req.user._id);
  if (!parent) return next(new ApiError('Parent not found', 404));

  const payload = {
    firebaseUid: parent.firebaseUid,
    parent: parent._id,
    childName: req.body.childName,
    childGender: req.body.childGender,
    childAge: req.body.childAge,
    hasPriorLearning: req.body.hasPriorLearning,
    knowSurahs: req.body.savedSurahsOrParts,
    readingLevel: req.body.readingLevel,
    mainGoal: req.body.mainGoal,
    weeklySessions: req.body.weeklySessions,
    sessionDuration: req.body.sessionDuration,
    days: toArray(req.body.days),
    preferredTimes: toArray(req.body.preferredTimes),
    teacherGender: req.body.teacherGender,
    notesForTeacher: req.body.notesForTeacher,
    planName: req.body.planName,
    memorizationDirection: req.body.memorizationDirection,
    memorizationRange: {
      fromSurah: req.body.fromSurah,
      fromAyah: req.body.fromAyah,
      toSurah: req.body.toSurah,
      toAyah: req.body.toAyah,
    },
    facesLabel: req.body.facesLabel,
    facesPerSession: req.body.facesPerSession,
    totalFaces: req.body.totalFaces || 0,
    completedFaces: req.body.completedFaces || 0,
    teacher: req.body.teacher,
    packageDuration: req.body.packageDuration,
    allowTrial: req.body.allowTrial !== undefined ? req.body.allowTrial : true,
  };

  const newProgram = await ChildProgram.create(payload);

  // Optional: create a trial session if requested and a teacher chosen
  let populatedTrial = null;
  //const programData = await ChildProgram.findById(program._id);
 if (req.body.trialSession && req.body.teacher) {
    const trial = await createTrialSession({
      programId: newProgram._id,
      programModel: 'ChildMemorizationProgram',
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
    //   const teacherId = req.body.teacher || req.body.assignedTeacher;
    //   // trial = await createTrialSession(newProgram, teacherId, req.user._id, 'MemorizationProgram');
  }

  const populated = await ChildProgram.findById(newProgram._id)
    .populate('parent', 'name email')
    .populate('teacher', 'name email');

  res.status(201).json({
    status: 'success',
    message: 'Child memorization program created',
    data: {
      program: populated,
      trialSession: populatedTrial
      //  ? await Session.findById(trial._id).populate('teacher student', 'name email')
      //  : null,
    },
  });
});

exports.getMyChildPrograms = asyncHandler(async (req, res, next) => {
  const { _id, role } = req.user;

  // Determine filter & population based on role
  let filter = {};
  let populateField = '';

  if (role === 'teacher') {
    filter = { assignedTeacher: _id };
    populateField = 'parent';
  } else if (role === 'student') {
    filter = { parent: _id };
    populateField = 'teacher';
  } else {
    return next(new ApiError('Only teachers and students can access their programs', 403));
  }

  // Fetch assigned programs
  const programs = await ChildProgram.find(filter)
    .populate(populateField, 'name email')
    .select('-__v');

  if (!programs || programs.length === 0) {
    return next(
      new ApiError(
        role === 'teacher'
          ? 'No child memorization programs assigned to you yet'
          : "You don't have any child memorization programs yet",
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
exports.getAllChildPrograms = factory.getAll(ChildProgram);
