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
/**
 * @swagger
 * /teacher/request:
 *   get:
 *     summary: Get all teacher requests (Admin only)
 *     tags: [Teacher Requests]
 *
 * /teacher/request/{id}:
 *   patch:
 *     summary: Approve or Reject teacher request
 *     tags: [Teacher Requests]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               status:
 *                 type: string
 *                 enum: [approved, rejected]
 *     responses:
 *       200:
 *         description: Request reviewed
 */
