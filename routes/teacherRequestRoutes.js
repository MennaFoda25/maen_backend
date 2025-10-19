const express = require('express');

const {
  requestTobeTeacher,
  reviewStudentReq,
  getAllTeacherRequests,
} = require('../controllers/teacherRequestService');

const { allowedTo } = require('../controllers/authServices');

const authMiddleware = require('../middlewares/firebaseAuth');

const router = express.Router();
router.use(authMiddleware);

// Student creates request
router.post('/', allowedTo('student', 'teacher'), requestTobeTeacher);

router.get('/', allowedTo('admin'), getAllTeacherRequests);

// Admin approves or rejects request
router.patch('/:id', allowedTo('admin'), reviewStudentReq);

module.exports = router;
