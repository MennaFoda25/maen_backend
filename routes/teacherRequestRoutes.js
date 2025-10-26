const express = require('express');

const {
  requestTobeTeacher,
  reviewteacherReq,
  getAllTeacherRequests,
} = require('../controllers/teacherRequestService');

const  {allowedTo}  = require('../controllers/authServices');

const {verifyFirebaseToken} = require('../middlewares/firebaseAuth');

const router = express.Router();
router.use(verifyFirebaseToken);

// Student creates request
router.post('/', allowedTo('student', 'teacher'), requestTobeTeacher);

router.get('/', allowedTo('admin'), getAllTeacherRequests);

// Admin approves or rejects request
router.patch('/:id', allowedTo('admin'), reviewteacherReq);

module.exports = router;
