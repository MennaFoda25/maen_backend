const asyncHandler = require('express-async-handler');
const ApiError = require('../utils/apiError');
const TeacherRequest = require('../models/teacherRequestModel');
const User = require('../models/userModel');
const factory = require('../controllers/handlerFactory');

const safeJsonParse = (data, fallback = {}) => {
  return typeof data === 'string' ? JSON.parse(data) : data || fallback;
};

// const extractCertificates = (files) =>
//   Array.isArray(files?.certificates)
//     ? files.certificates.map((f) => ({ fileUrl: f.path, fileName: f.originalname }))
//     : [];

// const extractProfileImg = (files, body, decoded) => {
//   if (!files) return body.profile_picture || decoded?.picture || null;

//   const file = files.profileImg?.[0] || files.profile_picture?.[0]; // fallback if frontend used different name

//   return file?.path || body.profile_picture || decoded?.picture || null;
// };

exports.teacherSignUp = asyncHandler(async (req, res, next) => {
  const decoded = req.firebase;
  const existingReq = await TeacherRequest.exists({ firebaseUid: decoded.uid });
  if (existingReq) {
    // console.timeEnd('⚙️ Controller Execution');
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

  // 5️⃣ Create teacher request in one DB operation
  const teacherReq = await TeacherRequest.create({
    firebaseUid: decoded.uid,
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

  console.timeEnd('⚙️ Controller Execution');

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
  if (!requester || requester.role !== 'admin')
    return next(new ApiError('Admin privileges required', 403));

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
        (user.status = 'approved'),
        (user.teacherProfile = teacherReq.teacherProfile),
        await user.save());
    } else {
      user = await User.create({
        firebaseUid: teacherReq.firebaseUid,
        email: teacherReq.email,
        name: teacherReq.name,
        role: 'teacher',
        status: 'approved',
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
