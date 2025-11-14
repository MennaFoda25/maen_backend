const express = require('express');
const {
  createChildMemProgram,
  getMyChildPrograms,
  getAllChildPrograms,
  bookSessionForChildProgram,
} = require('../controllers/childMemProgramController');
const { firebaseAuth } = require('../middlewares/firebaseAuth');
const { allowedTo } = require('../controllers/authServices');
const { createChildMemProgramValidator } = require('../utils/validators/childMemoProgramValidator');

const router = express.Router();
router.use(firebaseAuth);

router
  .route('/')
  .post(allowedTo('student'),createChildMemProgramValidator, createChildMemProgram)
  .get(allowedTo('student', 'teacher'), getMyChildPrograms);
router.route('/all').get(allowedTo('admin'),getAllChildPrograms)
module.exports = router