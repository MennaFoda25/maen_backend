const express = require('express');
const router = express.Router();
const { firebaseAuth } = require('../middlewares/firebaseAuth');
const { allowedTo } = require('../controllers/authServices');
const { uploadAndAttachAudio } = require('../middlewares/uploadAudioMiddleware');
const {
  createCorrectionProgram,
  getMyCorrectionProgram,
  getAllCorrectionPrograms,
} = require('../controllers/correctionProgramServices');
const {
  createCorrectionProgramValidator,
} = require('../utils/validators/correctionProgramValidation');

router.use(firebaseAuth);
router
  .route('/')
  .post(
    allowedTo('student'),
    uploadAndAttachAudio('audioReferences'),
    createCorrectionProgramValidator,
    createCorrectionProgram
  )
  .get(allowedTo('student', 'teacher'), getMyCorrectionProgram);
// Admin / teacher view all
router.get('/all', allowedTo('admin'), getAllCorrectionPrograms);
module.exports = router;
