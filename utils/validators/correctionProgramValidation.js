const slugify = require('slugify');
const { check } = require('express-validator');
const validatorMiddleware = require('../../middlewares/validatorMiddleware');
const User = require('../../models/userModel');
const bcrypt = require('bcryptjs');
const CorrectionProgram = require('../../models/correctionProgramModel');

exports.createCorrectionProgramValidator = [
  check('teacher').isMongoId().withMessage('Invalid teacher Id'),
  check('goal')
    .isIn(['general_mistakes', 'hidden_mistakes', 'ijazah_preparation', 'performance_development'])
    .withMessage('Invalid option'),

  check('currentLevel').isIn(['beginner', 'intermediate', 'advanced']).withMessage('Invalid level'),

  check('weeklySessions')
    .isInt({ min: 1, max: 5 })
    .withMessage('Sessions per week must be between 1 and 5'),

  check('sessionDuration')
    .isIn([15, 30, 45, 60])
    .withMessage('Session duration must be 15, 30, 45, or 60 minutes'),

  //   check('preferredDays')
  //     .isArray({ min: 1, max: 5 })
  //     .withMessage('Preferred days must be an array of up to 5 items'),

  check('planName')
    .notEmpty()
    .withMessage('Plan name is required')
    .custom((val) =>
      CorrectionProgram.find({ planName: val }).then((program) => {
        if (program) return Promise.reject(new Error('Program name already exists'));
      })
   ),
,
  check('fromSurah').notEmpty().withMessage('Starting surah is required'),
  check('toSurah').notEmpty().withMessage('Ending surah is required'),

  validatorMiddleware,
];
