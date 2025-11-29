const { check } = require('express-validator');
const validatorMiddleware = require('../../middlewares/validatorMiddleware');
const Event = require('../../models/eventModel');

exports.createEventValidator = [
  check('title')
    .notEmpty()
    .withMessage('Event title is required')
    .trim()
    .isLength({ min: 3 })
    .withMessage('Event title must be at least 3 characters')
    .isLength({ max: 100 })
    .withMessage('Event title must not exceed 100 characters')
    .custom((val) =>
          Event.findOne({ title: val }).then((event) => {
            if (event) return Promise.reject(new Error('Event name already exists'));
          })
       ),

  check('description')
    .optional({ checkFalsy: true })
    .trim()
    .isLength({ max: 500 })
    .withMessage('Description must not exceed 500 characters'),

  check('startDate')
    .notEmpty()
    .withMessage('Start date is required')
    .isISO8601()
    .withMessage('Invalid start date format (use ISO8601)')
    .custom((val) => {
      const startDate = new Date(val);
      const now = new Date();
      now.setHours(0, 0, 0, 0);

      if (startDate < now) {
        throw new Error('Start date cannot be in the past');
      }
      return true;
    }),

  check('endDate')
    .notEmpty()
    .withMessage('End date is required')
    .isISO8601()
    .withMessage('Invalid end date format (use ISO8601)')
    .custom((val, { req }) => {
      const endDate = new Date(val);
      const startDate = new Date(req.body.startDate);

      if (isNaN(endDate.getTime())) {
        throw new Error('Invalid end date');
      }

      if (endDate <= startDate) {
        throw new Error('End date must be after start date');
      }
      return true;
    }),

  // Custom validation to check for duplicates
  check('title').custom(async (title, { req }) => {
    if (!title || !req.body.startDate || !req.body.endDate) return true;

    const startDate = new Date(req.body.startDate);
    const endDate = new Date(req.body.endDate);

    console.log(`🔍 Checking for duplicate events:`);
    console.log(`   Title: "${title}"`);
    console.log(`   Dates: ${startDate.toISOString()} to ${endDate.toISOString()}`);

    // Check for event with exact same title (case-insensitive)
    const eventWithSameTitle = await Event.findOne({
      title: { $regex: `^${title}$`, $options: 'i' },
    }).lean();

    if (eventWithSameTitle) {
      console.log(`   ❌ Found duplicate with same title`);
      throw new Error(
        `Event with title "${title}" already exists (${eventWithSameTitle.startDate.toDateString()} to ${eventWithSameTitle.endDate.toDateString()})`
      );
    }

    // Check for overlapping events with same title
    const overlappingEvent = await Event.findOne({
      title: { $regex: `^${title}$`, $options: 'i' },
      $or: [
        {
          startDate: { $lt: endDate },
          endDate: { $gt: startDate },
        },
      ],
    }).lean();

    if (overlappingEvent) {
      console.log(`   ❌ Found overlapping event with same title`);
      throw new Error(
        `An event with title "${title}" already exists during this period (${overlappingEvent.startDate.toDateString()} to ${overlappingEvent.endDate.toDateString()})`
      );
    }

    console.log(`   ✅ No duplicates found`);
    return true;
  }),

  validatorMiddleware,
];

exports.getEventByIdValidator = [
  check('id')
    .isMongoId()
    .withMessage('Invalid event ID format')
    .custom(async (val) => {
      const event = await Event.findById(val).lean();
      if (!event) {
        throw new Error('Event not found');
      }
      return true;
    }),

  validatorMiddleware,
];

exports.deleteEventValidator = [
  check('id')
    .isMongoId()
    .withMessage('Invalid event ID format')
    .custom(async (val) => {
      const event = await Event.findById(val).lean();
      if (!event) {
        throw new Error('Event not found');
      }
      return true;
    }),

  validatorMiddleware,
];

exports.updateEventValidator = [
  check('title')
    .optional({ checkFalsy: true })
    .trim()
    .isLength({ min: 3 })
    .withMessage('Event title must be at least 3 characters')
    .isLength({ max: 100 })
    .withMessage('Event title must not exceed 100 characters')
    .custom(async (val, { req }) => {
      if (!val) return true; // Skip if title is not provided

      // Check if another event with same title exists (excluding current event)
      const existingEvent = await Event.findOne({
        _id: { $ne: req.params.id },
        title: { $regex: `^${val}$`, $options: 'i' },
      }).lean();

      if (existingEvent) {
        throw new Error(
          `An event with title "${val}" already exists (${existingEvent.startDate.toDateString()} to ${existingEvent.endDate.toDateString()})`
        );
      }
      return true;
    }),

  check('description')
    .optional({ checkFalsy: true })
    .trim()
    .isLength({ max: 500 })
    .withMessage('Description must not exceed 500 characters'),

  check('startDate')
    .optional({ checkFalsy: true })
    .isISO8601()
    .withMessage('Invalid start date format'),

  check('endDate')
    .optional({ checkFalsy: true })
    .isISO8601()
    .withMessage('Invalid end date format')
    .custom((val, { req }) => {
      if (!req.body.startDate || !val) return true;

      const startDate = new Date(req.body.startDate);
      const endDate = new Date(val);

      if (endDate <= startDate) {
        throw new Error('End date must be after start date');
      }
      return true;
    }),

  validatorMiddleware,
];
