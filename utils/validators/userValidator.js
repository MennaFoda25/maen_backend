const slugify = require('slugify');
const { check } = require('express-validator');
const validatorMiddleware = require('../../middlewares/validatorMiddleware');
const User = require('../../models/userModel');
const bcrypt = require('bcryptjs');

exports.createUserValidator = [
  check('name')
    .notEmpty()
    .withMessage('User name is required')
    .isLength({ min: 3 })
    .withMessage('Too short name')
    .custom((val, { req }) => {
      req.body.slug = slugify(val);
      return true;
    }),
  check('email')
    .notEmpty()
    .withMessage('Eail is required')
    .isEmail()
    .withMessage('Invalid email addres')
    .custom((val) =>
      User.findOne({ email: val }).then((user) => {
        if (user) {
          return Promise.reject(new Error('Email is already exist'));
        }
      })
    ),
  check('password').custom((value, { req }) => {
    const isFirebaseUser = !!req.body.firebase_uid;

    if (!isFirebaseUser && !value) {
      throw new Error('Password is required for non-Firebase users');
    }

    if (!isFirebaseUser && value.length < 6) {
      throw new Error('Password must be at least 6 characters');
    }

    if (!isFirebaseUser && value !== req.body.passwordConfirm) {
      throw new Error('Password confirmation does not match');
    }

    return true;
  }),

  // ✅ Conditionally skip passwordConfirm for Firebase users
  check('passwordConfirm').custom((value, { req }) => {
    if (!req.body.firebase_uid && !value) {
      throw new Error('Password confirmation is required');
    }
    return true;
  }),

  check('phone').optional().isMobilePhone('any').withMessage('Invalid phone number'),
  validatorMiddleware,
];

exports.getUserValidator = [
  check('id').isMongoId().withMessage('Invalid user id format'),
  validatorMiddleware,
];
exports.updateUserValidator = [
  check('id').isMongoId().withMessage('Invalid user id format'),
  check('name')
    .optional()
    .custom((val, { req }) => {
      req.body.slug = slugify(val);
      return true;
    }),

  check('email')
    .optional()
    .isEmail()
    .withMessage('Invalid email addres format')
    .custom((val) =>
      User.findOne({ email: val }).then((user) => {
        if (user) {
          return Promise.reject(new Error('Email is already exist'));
        }
      })
    ),
  check('phone').optional().isMobilePhone(['any']).withMessage('Invalid phone number'),
  validatorMiddleware,
];

exports.changePasswordValidator = [
  check('id').isMongoId().withMessage('Invalid User id format'),

  check('oldPassword').notEmpty().withMessage('You must enter your current password'),

  check('passwordConfirm').notEmpty().withMessage('You must enter your password confirmation'),

  check('password')
    .notEmpty()
    .withMessage('You must enter your new password')
    .isLength({ min: 6 })
    .withMessage('Password must be at least 6 characters')
    .custom(async (val, { req }) => {
      const user = await User.findById(req.params.id);
      if (!user) {
        return Promise.reject(new Error('There is no user for this id'));
      }

      const isPasswordCorrect = await bcrypt.compare(req.body.oldPassword, user.password);

      if (!isPasswordCorrect) {
        return Promise.reject(new Error('Your password is wrong'));
      }
      if (password !== req.body.passwordConfirm) {
        throw new Error('Password Confirmation does not match');
      }
      return true;
    }),

  validatorMiddleware,
];

exports.deleteUserValidator = [
  check('id').isMongoId().withMessage('Invalid User id format'),
  validatorMiddleware,
];
