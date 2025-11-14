const express = require('express');
const { firebaseAuth } = require('../middlewares/firebaseAuth');
const { createMemoProgramValidator } = require('../utils/validators/memorizationPogramValidator');
const { allowedTo } = require('../controllers/authServices');
const {
  createMemorizationProgram,
  // getLoggedTeacherMemoPrograms,
  getMyMemoPrograms,
  getAllMemorizationPrograms
} = require('../controllers/memorizationProgramServices');
const router = express.Router();

router.use(firebaseAuth);
router.post('/', allowedTo('student'), createMemoProgramValidator, createMemorizationProgram);
router.get('/', allowedTo('teacher', 'student'), getMyMemoPrograms);
router.get('/all', allowedTo('admin'),getAllMemorizationPrograms)
module.exports = router;
