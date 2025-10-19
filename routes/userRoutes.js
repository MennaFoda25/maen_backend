const express = require('express');
const {
  createUserValidator,
  getUserValidator,
  updateUserValidator,
  deleteUserValidator,
  changePasswordValidator,
} = require('../utils/validators/userValidator');
const {
  createUser,
  updateUser,
  getUser,
  getAllUsers,
  deleteUser,
  uploadUserImg,
  changePassword,
} = require('../controllers/userService');

const {allowedTo} = require('../controllers/authServices');

const protectFirebase = require('../middlewares/firebaseAuth');

const router = express.Router();

router.use(protectFirebase);
router.put('/changeMyPassword/:id', changePasswordValidator, changePassword);

router
  .route('/')
  //.post(allowedTo('student', 'teacher'), uploadUserImg, createUserValidator, createUser)
  .get(allowedTo('admin'), getAllUsers);
router
  .route('/:id')
  .get(allowedTo('admin'), getUserValidator, getUser)
  .patch(allowedTo('admin'), uploadUserImg, updateUserValidator, updateUser)
  .delete(allowedTo('admin'), deleteUserValidator, deleteUser);

module.exports = router;
