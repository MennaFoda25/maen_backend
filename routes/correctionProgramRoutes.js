const express = require('express');
const router = express.Router();
const { verifyFirebaseToken } = require('../middlewares/firebaseAuth');
const { allowedTo } = require('../controllers/authServices');
const { uploadAndAttachAudio } = require('../middlewares/uploadAudioMiddleware');
const {
  createCorrectionProgram,
  getMyCorrectionProgram,
  getAllCorrectionPrograms,
  getAllFreeTrials,
} = require('../controllers/correctionProgramServices');
const {
  createCorrectionProgramValidator,
} = require('../utils/validators/correctionProgramValidation');

router.use(verifyFirebaseToken);
router
  .route('/')
  .post(
    allowedTo('student'),
    uploadAndAttachAudio('audioReferences'),
    createCorrectionProgramValidator,
    createCorrectionProgram
  )
  .get(allowedTo('student'), getMyCorrectionProgram);
// Admin / teacher view all
router.get('/all', allowedTo('admin'), getAllCorrectionPrograms);
router.get('/trials', allowedTo('admin'), getAllFreeTrials);
module.exports = router;
