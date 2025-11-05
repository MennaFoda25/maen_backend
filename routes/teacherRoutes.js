const express = require('express');
const router = express.Router();
const {
  getAssignedTeacherTrials,
  trialSessionAccept,
} = require('../controllers/correctionProgramServices');
const { allowedTo } = require('../controllers/authServices');
const { verifyFirebaseToken } = require('../middlewares/firebaseAuth');

router.use(verifyFirebaseToken);

router.get('/Mytrials', allowedTo('teacher'), getAssignedTeacherTrials);
router.patch('/:id', verifyFirebaseToken, allowedTo('teacher'), trialSessionAccept);

module.exports = router;
