const asyncHandler = require('express-async-handler');
const ApiError = require('../utils/apiError');
const TeacherRequest = require('../models/teacherRequestModel');
const User = require('../models/userModel');
const factory = require('./handlerFactory');

// @desc    Student requests to become a teacher
// @route   POST /api/v1/teacher-requests
// @access  Private (Student)
exports.requestTobeTeacher = asyncHandler(async (req, res, next) => {
  if (!req.firebase || !req.firebase.uid) return next(new ApiError('Missing Firebase token', 401));
  const decoded = req.firebase;
  const teacherProfile = req.body.teacherProfile;
  if (!teacherProfile || !teacherProfile.bio || !Array.isArray(teacherProfile.certificates)) {
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
  if (!req.firebase || !req.firebase.uid) return next(new ApiError('Missing Firebase token', 401));
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
