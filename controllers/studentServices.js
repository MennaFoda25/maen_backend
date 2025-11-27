const asyncHandler = require('express-async-handler');
const ApiError = require('../utils/apiError');
const User = require('../models/userModel');
const MemorizationProgram = require('../models/memorizationProgramModel');
const CorrectionProgram = require('../models/correctionProgramModel');
const ChildMemorizationProgram = require('../models/childMemoProgramModel');
const ProgramType = require('../models/programTypeModel');
const Session = require('../models/sessionModel');
const safeJsonParse = (data, fallback = {}) => {
  return typeof data === 'string' ? JSON.parse(data) : data || fallback;
};

const extractProfileImg = (files, body, decoded) =>
  files?.profileImg?.[0]?.path || body.profile_picture || null;

exports.studentSignUp = asyncHandler(async (req, res, next) => {
  const decoded = req.firebase;

  const update = {
    email: req.body.email,
    name: req.body.name,
    profile_picture: extractProfileImg(req.files, req.body, decoded),
    role: 'student',
    phone: req.body.phone,
    gender: req.body.gender,
    status: 'active',
    studentProfile: safeJsonParse(req.body.studentProfile),
  };

  const user = await User.findOneAndUpdate(
    { firebaseUid: decoded.uid },
    { $set: update },
    { new: true, upsert: true }
  ).lean();

  res.status(201).json({
    message: 'Student profile initialized successfully.',
    user,
  });
});

exports.getLoggedInStudentPlans = asyncHandler(async (req, res, next) => {
  const studentId = req.user._id;

  if (!studentId) {
    return next(new ApiError('Student ID not found in authenticated user', 401));
  }

  // Fetch all three types of programs for this student
  const memorizationPrograms = await MemorizationProgram.find({ student: studentId })
    .populate({
      path: 'teacher',
      select: 'name email profile_picture',
    })
    .lean();

  const correctionPrograms = await CorrectionProgram.find({ student: studentId })
    .populate({
      path: 'teacher',
      select: 'name email profile_picture',
    })
    .lean();

  const childMemorizationPrograms = await ChildMemorizationProgram.find({ student: studentId })
    .populate({
      path: 'teacher',
      select: 'name email profile_picture',
    })
    .lean();

  // Fetch all sessions for this student
  const sessions = await Session.find({ student: studentId })
    .populate({
      path: 'teacher',
      select: 'name email profile_picture',
    })
    .sort({ scheduledAtDate: -1 })
    .lean();

  // Group sessions by program and program type
  const sessionsByProgram = {};
  sessions.forEach((session) => {
    const key = `${session.programModel}_${session.program}`;
    if (!sessionsByProgram[key]) {
      sessionsByProgram[key] = [];
    }
    sessionsByProgram[key].push(session);
  });

  // Attach sessions to each program
  const enhancedMemorization = memorizationPrograms.map((prog) => {
    const key = `MemorizationProgram_${prog._id}`;
    return {
      ...prog,
      programType: 'MemorizationProgram',
      sessions: sessionsByProgram[key] || [],
    };
  });

  const enhancedCorrection = correctionPrograms.map((prog) => {
    const key = `CorrectionProgram_${prog._id}`;
    return {
      ...prog,
      programType: 'CorrectionProgram',
      sessions: sessionsByProgram[key] || [],
    };
  });

  const enhancedChildMemorization = childMemorizationPrograms.map((prog) => {
    const key = `ChildMemorizationProgram_${prog._id}`;
    return {
      ...prog,
      programType: 'ChildMemorizationProgram',
      sessions: sessionsByProgram[key] || [],
    };
  });

  // Combine all programs
  const allPlans = [...enhancedMemorization, ...enhancedCorrection, ...enhancedChildMemorization];

  // Group sessions by status for summary
  const sessionsSummary = {
    total: sessions.length,
    pending: sessions.filter((s) => s.status === 'pending').length,
    scheduled: sessions.filter((s) => s.status === 'scheduled').length,
    started: sessions.filter((s) => s.status === 'started').length,
    completed: sessions.filter((s) => s.status === 'completed').length,
    cancelled: sessions.filter((s) => s.status === 'cancelled').length,
  };

  return res.status(200).json({
    status: 'success',
    totalPlans: allPlans.length,
    totalSessions: sessions.length,
    sessionsSummary,
    data: {
      memorizationPrograms: enhancedMemorization,
      correctionPrograms: enhancedCorrection,
      childMemorizationPrograms: enhancedChildMemorization,
      allPlans: allPlans.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt)),
    },
  });
});
