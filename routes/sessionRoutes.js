const express = require('express');
const router = express.Router();
const { firebaseAuth } = require('../middlewares/firebaseAuth');
const { allowedTo } = require('../controllers/authServices');
const {
  bookProgramSession,
  trialSessionAccept,
  sessionCompleted,
  sessionStart,
  generatePlanSessions
} = require('../controllers/sessionServices');

router.use(firebaseAuth);

router.post('/book',allowedTo('student'), bookProgramSession);
router.post('/:id/generate-plan',allowedTo('student'), generatePlanSessions);
router.route('/:id/accept').patch(allowedTo('teacher'), trialSessionAccept);
router.patch('/:id/complete', allowedTo('teacher', 'student'), sessionCompleted);
router.patch('/:id/start', allowedTo('teacher', 'student'), sessionStart);

module.exports = router;
