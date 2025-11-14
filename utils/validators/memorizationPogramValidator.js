const slugify = require('slugify');
const { check } = require('express-validator');
const validatorMiddleware = require('../../middlewares/validatorMiddleware');
const MemorizationProgram = require('../../models/memorizationProgramModel');

exports.createMemoProgramValidator = [
  check('planName')
    .notEmpty()
    .withMessage('Program name is required')
    .custom((val) =>
      MemorizationProgram.findOne({ planName: val }).then((program) => {
        if (program) return Promise.reject(new Error('Program name already exists'));
      })
    ),
  check('teacher').isMongoId().withMessage('Invalid teacher Id'),

  check('programType')
    .notEmpty()
    .withMessage('Program type is required')
    .isIn(['new_memorization', 'memorization_revision', 'revision_consolidation'])
    .withMessage('Invalid program type'),
  check('weeklySessions')
    .notEmpty()
    .withMessage('Weekly sessions are required')
    .isInt({ min: 1, max: 5 })
    .withMessage('Weekly sessions must be between 1 and 5'),

  check('sessionDuration')
    .notEmpty()
    .withMessage('Session duration is required')
    .isInt({ min: 15, max: 60 })
    .withMessage('Session duration must be between 15 and 60 minutes'),

  // 🕒 Preferred times and days
  check('preferredTimes')
    .optional()
    .isArray()
    .withMessage('Preferred times must be an array')
    .custom((arr) => {
      const allowed = ['6-9_am', '10-1_pm', '2-5_pm', '6-9_pm', '10-1_am'];
      const invalid = arr.filter((t) => !allowed.includes(t));
      if (invalid.length) throw new Error(`Invalid preferred time(s): ${invalid.join(', ')}`);
      return true;
    }),
  validatorMiddleware,
];
