const { check } = require('express-validator');
const validatorMiddleware = require('../../middlewares/validatorMiddleware');
const ChildMemorizationProgram = require('../../models/childMemoProgramModel');

exports.createChildMemProgramValidator = [
  check('childName').notEmpty().withMessage('Child name is required'),
  check('childGender').isIn(['male', 'female']).withMessage('Invalid child gender'),
  check('childAge').isInt({ min: 3, max: 11 }).withMessage('Age must be 3..11'),

  check('mainGoal')
    .isIn(['start_from_zero', 'stabilize_memorization', 'improve_pronunciation'])
    .withMessage('Invalid goal'),

  check('weeklySessions').isInt({ min: 2, max: 5 }).withMessage('Weekly sessions must be 2..5'),
  check('sessionDuration').isIn([15, 30, 45, 60]).withMessage('Invalid session duration'),

  check('days')
    .optional()
    .isArray()
    .custom((arr) => {
      const allowed = [
        'sunday',
        'monday',
        'tuesday',
        'wednesday',
        'thursday',
        'friday',
        'saturday',
      ];
      const invalid = arr.filter((d) => !allowed.includes(d));
      if (invalid.length) throw new Error('Invalid days: ' + invalid.join(', '));
      if (arr.length > 5) throw new Error('Days cannot exceed 5');
      return true;
    }),

  // check('preferredTimes')
  //   .optional()
  //   .isArray()
  //   .custom((arr) => {
  //     const allowed = ['morning_9_11', 'noon_12_3', 'afternoon_4_7', 'evening_8_10'];
  //     const invalid = arr.filter((t) => !allowed.includes(t));
  //     if (invalid.length) throw new Error('Invalid preferredTimes: ' + invalid.join(', '));
  //     return true;
  //   }),

  check('planName')
    .notEmpty()
    .withMessage('Plan name is required')
    // .custom((val) =>
    //   ChildMemorizationProgram.findOne({ planName: val }).then((program) => {
    //     if (program) return Promise.reject(new Error('Program name already exists'));
    //   })
    //),
  ,
  check('memorizationDirection').optional().isIn(['fatihah_to_nas', 'nas_to_fatihah']),
  check('facesLabel').optional().isIn(['quarter', 'half', 'one', 'custom']),
  check('facesPerSession').optional().isFloat({ min: 0.25 }),

  check('allowTrial').optional().isBoolean(),

  validatorMiddleware,
];
