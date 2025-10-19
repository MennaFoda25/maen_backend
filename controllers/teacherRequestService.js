const asyncHandler = require('express-async-handler');
const ApiError = require('../utils/apiError');
const TeacherRequest = require('../models/teacherRequestModel');
const User = require('../models/userModel');
const factory = require('./handlerFactory')

// @desc    Student requests to become a teacher
// @route   POST /api/v1/teacher-requests
// @access  Private (Student)
exports.requestTobeTeacher = asyncHandler(async (req, res, next) => {
  const user = req.user;

// If the user is already a teacher with active status, block
  if (user.role === 'teacher' && user.status === 'active') {
    return next(new ApiError('You are already an active teacher', 400));
  }


  //check if there is a pending request for this user
  const existingReq = await TeacherRequest.findOne({ userId: req.user._id, status: 'pending' });

  if (existingReq) {
    return next(new ApiError('You already have a pending request', 400));
  }

  const newRequest = await TeacherRequest.create({
    userId: req.user._id,
    reason: req.body.reason || 'No reason provided',
  });
  res
    .status(201)
    .json({ status: 'success', message: 'Request submitted successfully', data: newRequest });
});

// @desc    Admin updates (approves/rejects) a request
// @route   PATCH /api/v1/teacherRequest/:id
// @access  Private (Admin)

exports.reviewStudentReq = asyncHandler(async (req, res, next) => {
  const { status } = req.body;

  const studentReq = await TeacherRequest.findById(req.params.id);

  if (!studentReq) {
    return next(new ApiError('Request not found', 404));
  }

  studentReq.status = status;
  await studentReq.save();

  // if (status === 'approved') {
  //   const user = await User.findByIdAndUpdate(
  //     {
  //       id: studentReq.userId,
  //       role: 'teacher',
  //     },
  //     { new: true }
  //   );
  // }

  if (status === 'approved') {
    await User.findByIdAndUpdate(
      studentReq.userId,
      { role: 'teacher', status: 'active' },
      { new: true }
    );
  }

  res
    .status(200)
    .json({ status: 'success', message: 'Request reviewd successfully', data: studentReq });
});

//@desc   Get all teacher requests
//@route GET /api/v1/teacherRequest
// @access  Private (Admin)

exports.getAllTeacherRequests = factory.getAll(TeacherRequest);
