const express = require('express');
const router = express.Router();
const {
  getAssignedTeacherTrials,
  trialSessionAccept,
} = require('../controllers/correctionProgramServices');
const { allowedTo } = require('../controllers/authServices');
const { firebaseAuth } = require('../middlewares/firebaseAuth');

router.use(firebaseAuth);

router.get('/Mytrials', allowedTo('teacher'), getAssignedTeacherTrials);
router.patch('/:id', allowedTo('teacher'), trialSessionAccept);

module.exports = router;
