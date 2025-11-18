const express = require('express');
const router = express.Router();
const {
  getAllTeachersShortly,
  assignTeacherSpecilaization,
  getSpecificTeacherData,
  getAllActiveTeachers
} = require('../controllers/teacherRequestService');
const {
  getAssignedTeacherTrials,
  trialSessionAccept,
  getTeachersByProgramType
} = require('../controllers/correctionProgramServices');
const { allowedTo } = require('../controllers/authServices');
const {
  getAllFreeTrials,
  getTopTeachers,
  getProgramTeachers
} = require('../controllers/programServices');
const { firebaseAuth } = require('../middlewares/firebaseAuth');

router.use(firebaseAuth);

router.get('/Mytrials', allowedTo('teacher'), getAssignedTeacherTrials);
router.route('/brief').get(getAllTeachersShortly);
router.get('/trials', allowedTo('admin'), getAllFreeTrials);
router.get('/top', getTopTeachers);
router.get('/program', getProgramTeachers);
router.get('/all', getAllActiveTeachers);
router.patch(
  '/assign-program/:teacherId',
  firebaseAuth,
  allowedTo('admin'),
  assignTeacherSpecilaization
);
router.route('/:id').patch(allowedTo('teacher'), trialSessionAccept).get(getSpecificTeacherData);

module.exports = router;
