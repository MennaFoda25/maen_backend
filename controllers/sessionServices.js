const asyncHandler = require('express-async-handler');
const TrialSession = require('../models/trialSessionModel');
const User = require('../models/userModel');
const ApiError = require('../utils/apiError');
const MemorizationProgram = require('../models/memorizationProgramModel');
const CorrectionProgram = require('../models/correctionProgramModel');
const ChildMemorizationProgram = require('../models/childMemoProgramModel');

exports.bookSession = asyncHandler(async (req, res, next) => {
  const { programId, programType, teacherId, scheduledAt, duration  } = req.body;

  if (!programId || !programType || !teacherId || !scheduledAt) {
    return next(new ApiError("Missing required fields.", 400));
  }

  const validTypes = [
    "CorrectionProgram",
    "MemorizationProgram",
    "ChildMemorizationProgram",
  ];

  if (!validTypes.includes(programType)) {
    return next(new ApiError("Invalid programType", 400));
  }

  const ProgramModel = {
    CorrectionProgram,
    MemorizationProgram,
    ChildMemorizationProgram,
  }[programType];

  const program = await ProgramModel.findById(programId);
  if (!program) return next(new ApiError("Program not found", 404));

  // Logged-in user
  const student =await User.find({ firebaseUid: req.firebase.uid });

  if (!student) return next(new ApiError("Unauthorized", 401));
console.log("🔍 req.user =", req.user);

  const teacher = await User.findById(teacherId);
  if (!teacher || teacher.role !== "teacher" || teacher.status !== "active") {
    return next(new ApiError("Invalid teacher", 400));
  }

  const conflict = await TrialSession.findOne({
    teacher: teacherId,
    scheduledAt: new Date(scheduledAt),
    status: { $in: ["pending", "scheduled"] },
  });

  if (conflict) {
    return next(new ApiError("Teacher already booked at this time", 400));
  }

  const session = await TrialSession.create({
    program: programId,
    programModel: programType,
    student: req.user._id,
    teacher: teacherId,
    duration,
    scheduledAt,
    days: program.days || [],  // make sure program has days
    preferredTimes: program.preferredTimes || [],
    status: "scheduled",
  });

  res.status(201).json({
    status: "success",
    message: "Session booked successfully",
    meetingId: session.meetingId,
    session,
  });
});


