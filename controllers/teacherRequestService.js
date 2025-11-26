const asyncHandler = require('express-async-handler');
const ApiError = require('../utils/apiError');
const TeacherRequest = require('../models/teacherRequestModel');
const User = require('../models/userModel');
const factory = require('../controllers/handlerFactory');

const safeJsonParse = (data, fallback = {}) => {
  return typeof data === 'string' ? JSON.parse(data) : data || fallback;
};

function parseAvailabilitySchedule(raw) {
  if (!raw) return [];
  // If already an object (Postman JSON)
  if (typeof raw === 'object') return raw;

  // If string (Swagger sends strings)
  if (typeof raw === 'string') {
    try {
      return JSON.parse(raw);
    } catch (err) {
      throw new ApiError('Invalid availability_schedule format. Must be valid JSON.', 400);
    }
  }

  return [];
}

exports.teacherSignUp = asyncHandler(async (req, res, next) => {
  const firebaseUid = req.firebase?.uid; // ← FIXED

  if (!firebaseUid) {
    return next(new ApiError('Missing Firebase UID from header', 401));
  }
  const existingReq = await TeacherRequest.exists({ firebaseUid });
  if (existingReq) {
    return next(new ApiError('A teacher request for this user already exists.', 400));
  }
  // 2️⃣ Extract uploaded files from middleware
  const uploaded = req.uploadedFiles || { profile_picture: [], certificates: [] };

  const profile_picture =
    uploaded.profile_picture?.[0]?.fileUrl || req.body.profile_picture || null;
  const teacherProfileData = safeJsonParse(req.body.teacherProfile, {});

  let bodyCertificates = [];

  if (req.body.certificates) {
    // handle both ["Cert1","Cert2"] or single string "Cert1"
    try {
      const parsed = JSON.parse(req.body.certificates);
      bodyCertificates = Array.isArray(parsed)
        ? parsed.map((c) => ({ fileName: c }))
        : [{ fileName: parsed }];
    } catch {
      bodyCertificates = [{ fileName: req.body.certificates }];
    }
  }

  // ✅ Merge all certificate sources (uploaded + body + teacherProfile)
  teacherProfileData.certificates = [
    ...(teacherProfileData.certificates || []),
    ...(uploaded.certificates || []),
    ...(bodyCertificates || []),
  ];

  teacherProfileData.availabilitySchedule = parseAvailabilitySchedule(
    req.body.availabilitySchedule
  );

  // 5️⃣ Create teacher request in one DB operation
  const teacherReq = await TeacherRequest.create({
    firebaseUid,
    email: req.body.email,
    name: req.body.name,
    phone: req.body.phone,
    gender: req.body.gender,
    birthDate: req.body.birthDate,
    nationality: req.body.nationality,
    countryOfResidence: req.body.countryOfResidence,
    profile_picture,
    teacherProfile: teacherProfileData,
    declarationAccuracy: req.body.declarationAccuracy === 'true',
    acceptTerms: req.body.acceptTerms === 'true',
    acceptPrivacy: req.body.acceptPrivacy === 'true',
    status: 'pending',
  });

  return res.status(201).json({
    message: 'Teacher request created successfully, pending admin approval.',
    request: teacherReq,
  });
});

// exports.teacherSignUp = asyncHandler(async (req, res, next) => {
//   const decoded = req.firebase;
// console.timeEnd('⚙️ Controller Execution');
//   const existingReq = await TeacherRequest.exists({ firebaseUid: decoded.uid });
//   if (existingReq) {
//     return next(new ApiError('A teacher request for this user already exists.', 400));
//   }

//   // Parallel extraction
//   const [teacherProfileData, certificates, profile_picture] = await Promise.all([
//     Promise.resolve(safeJsonParse(req.body.teacherProfile)),
//     Promise.resolve(extractCertificates(req.files)),
//     Promise.resolve(extractProfileImg(req.files, req.body, decoded)),
//   ]);

//   teacherProfileData.certificates = [
//     ...(teacherProfileData.certificates || []),
//     ...(certificates || []),
//   ];

//   // Normalize arrays (avoid type errors)
//   ['qiraat', 'teachingTracks', 'languages', 'ageGroups'].forEach((key) => {
//     const val = teacherProfileData[key];
//     if (!val) return;
//     teacherProfileData[key] = Array.isArray(val) ? val : [val];
//   });

//   const teacherReq = await TeacherRequest.create({
//     firebaseUid: decoded.uid,
//     email: decoded.email || req.body.email,
//     name: decoded.name || req.body.name || decoded.email?.split('@')[0],
//     phone: req.body.phone || decoded.phone,
//     gender: req.body.gender,
//     birthDate: req.body.birthDate,
//     nationality: req.body.nationality,
//     countryOfResidence: req.body.countryOfResidence,
//     profile_picture,
//     teacherProfile: teacherProfileData,
//     declarationAccuracy: req.body.declarationAccuracy === 'true',
//     acceptTerms: req.body.acceptTerms === 'true',
//     acceptPrivacy: req.body.acceptPrivacy === 'true',
//     status: 'pending',
//   });
// console.timeEnd('🔥 Total time');
//   return res.status(201).json({
//     message: 'Teacher request created successfully, pending admin approval.',
//     request: teacherReq,
//   });
// });

// @desc    Student requests to become a teacher
// @route   POST /api/v1/teacher-requests
// @access  Private (Student)
exports.requestTobeTeacher = asyncHandler(async (req, res, next) => {
  const decoded = req.firebase;
  const teacherProfile = req.body.teacherProfile;
  if (!teacherProfile || !Array.isArray(teacherProfile.certificates)) {
    return next(new ApiError('Teacher profile with bio and certificates required', 400));
  }

  const user = await User.findOne({ firebaseUid: decoded.uid });
  if (!user) return next(new ApiError('User not found. Please sign up first.', 404));

  if (user.role === 'teacher' && user.status === 'pending') {
    return res.json({ message: 'Your teacher request is already pending approval.' });
  }

  const teacher = await TeacherRequest.create({
    email: decoded.email || req.body.email,
    name: decoded.name || req.body.name || (decoded.email ? decoded.email.split('@')[0] : 'NoName'),
    firebaseUid: decoded.uid,
    teacherProfile,
    userId: decoded.userId,
    status: 'pending',
  });

  const userRecord = await User.findOne({ firebaseUid: decoded.uid });
  if (userRecord) {
    userRecord.teacherProfile = teacherProfile;
    await userRecord.save();
  }
  res.json({ message: 'Teacher upgrade requested. Pending admin approval.' });
});

// @desc    Admin updates (approves/rejects) a request
// @route   PATCH /api/v1/teacherRequest/:id
// @access  Private (Admin)

exports.reviewteacherReq = asyncHandler(async (req, res, next) => {
  // (!req.firebase || !req.firebase.uid) return next(new ApiError('Missing Firebase token', 401));
  const decoded = req.firebase;
  // Validate requester is admin (load from DB)
  const requester = await User.findOne({ firebaseUid: req.firebase.uid });
  //if (!requester || requester.role !== 'admin')
  // return next(new ApiError('Admin privileges required', 403));

  // Validate body
  const { status } = req.body;
  if (!['approved', 'rejected'].includes(status)) {
    return next(new ApiError('Status must be either "approved" or "rejected"', 400));
  }

  const id = req.params.id;
  const teacherReq = await TeacherRequest.findById(id);

  if (!teacherReq) return next(new ApiError('Request not found', 404));

  if (status === 'approved') {
    let user = await User.findOne({ email: teacherReq.email });
    if (user) {
      ((user.role = 'teacher'),
        (user.status = 'active'),
        (user.teacherProfile = teacherReq.teacherProfile),
        await user.save());
    } else {
      user = await User.create({
        firebaseUid: teacherReq.firebaseUid,
        email: teacherReq.email,
        name: teacherReq.name,
        role: 'teacher',
        status: 'active',
        profile_picture: teacherReq.profile_picture,
        teacherProfile: teacherReq.teacherProfile,
      });
    }
  }
  teacherReq.status = status;
  await teacherReq.save();
  res.json({ message: `Teacher request ${status}`, teacherReq });
});

//@desc   Get all teacher requests
//@route GET /api/v1/teacherRequest
// @access  Private (Admin)

exports.getAllTeacherRequests = factory.getAll(TeacherRequest);

exports.getAllTeachersShortly = asyncHandler(async (req, res, next) => {
  const filter = { role: 'teacher', status: 'active' };

  // Optional filters from query parameters
  if (req.query.gender) filter.gender = req.query.gender;

  if (req.query.qiraat) {
    filter['teacherProfile.qiraat'] = req.query.qiraat;
  }

  if (req.query.language) {
    filter['teacherProfile.languages'] = req.query.language;
  }

  const teachers = await User.find(filter)
    .select('name email gender profile_picture teacherProfile')
    .lean();

  return res.status(200).json({
    status: 'success',
    results: teachers.length,
    data: teachers,
  });
});

exports.assignTeacherSpecilaization = asyncHandler(async (req, res, next) => {
  const { teacherId } = req.params;
  const { programPreference } = req.body;

  if (!Array.isArray(programPreference)) {
    return next(new ApiError('specializations must be an array', 400));
  }

  const teacher = await User.findOne({ _id: teacherId, role: 'teacher' });

  if (!teacher) return next(new ApiError('Teacher not found', 404));

  teacher.teacherProfile.programPreference = programPreference;
  await teacher.save();
  res.status(200).json({
    status: 'success',
    message: 'Teacher program specialization updated',
    teacher,
  });
});

exports.getSpecificTeacherData = factory.getOne(User);

exports.getAllActiveTeachers = asyncHandler(async (req, res, next) => {
  const teachers = await User.find({ role: 'teacher', status: 'active' }).select('-__v').lean();

  if (!teachers || teachers.length === 0) {
    return next(new ApiError('No active teachers found', 404));
  }

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

// @desc    Get all sessions for logged-in teacher (all statuses)
// @route   GET /api/v1/teacher-sessions
// @access  Private (Teacher)
exports.getTeacherSessions = asyncHandler(async (req, res, next) => {
  const Session = require('../models/sessionModel');

  const teacherId = req.user._id;

  if (!teacherId) {
    return next(new ApiError('Teacher ID not found in authenticated user', 401));
  }

  // Fetch all sessions where this teacher is assigned
  const sessions = await Session.find({ teacher: teacherId })
    .populate({
      path: 'student',
      select: 'name email profile_picture',
    })
    .populate({
      path: 'program',
      select: 'name sessionDuration weeklySessions packageDuration',
    })
    .sort({ scheduledAtDate: -1 })
    .lean();

  if (!sessions || sessions.length === 0) {
    return res.status(200).json({
      status: 'success',
      count: 0,
      message: 'No sessions found for this teacher',
      data: [],
    });
  }

  // Group sessions by status
  const groupedByStatus = {
    pending: sessions.filter((s) => s.status === 'pending'),
    scheduled: sessions.filter((s) => s.status === 'scheduled'),
    started: sessions.filter((s) => s.status === 'started'),
    completed: sessions.filter((s) => s.status === 'completed'),
    cancelled: sessions.filter((s) => s.status === 'cancelled'),
  };

  res.status(200).json({
    status: 'success',
    count: sessions.length,
    summary: {
      pending: groupedByStatus.pending.length,
      scheduled: groupedByStatus.scheduled.length,
      started: groupedByStatus.started.length,
      completed: groupedByStatus.completed.length,
      cancelled: groupedByStatus.cancelled.length,
    },
    data: sessions,
    groupedByStatus,
  });
});
