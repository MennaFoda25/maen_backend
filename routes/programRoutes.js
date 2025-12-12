const express = require('express');
const router = express.Router();
const { firebaseAuth } = require('../middlewares/firebaseAuth');
const { allowedTo } = require('../controllers/authServices');
const {
  getProgramTypes,
  getTeachersByProgramType,
  assignTeacherToProgram,
  getAllLoggedStudentPrograms,
  deleteProgram,
  getAvailableTeachersByPreferredTimes,
} = require('../controllers/programServices');

router.use(firebaseAuth);
router.get('/', getProgramTypes);
router.get('/:id', getTeachersByProgramType);
router.get('/student/myPrograms', allowedTo('student'), getAllLoggedStudentPrograms);
router.delete('/student/:id', allowedTo('student'), deleteProgram);
router.get('/available/:id', allowedTo('student'), getAvailableTeachersByPreferredTimes);
router.patch('/assignTeacher/:id', allowedTo('student'), assignTeacherToProgram);
//router.post("/",allowedTo('admin'), addPrograms)
module.exports = router;
