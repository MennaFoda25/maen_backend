const express = require('express');
const {
  createUserValidator,
  getUserValidator,
  updateUserValidator,
  deleteUserValidator,
  changePasswordValidator,
} = require('../utils/validators/userValidator');
const {
  createAdmin,
  updateUser,
  getUser,
  getAllUsers,
  deleteUser,
  changePassword,
  suspendUser,
} = require('../controllers/userService');
const {getLoggedInStudentPlans}= require('../controllers/studentServices')
const { uploadFiles } = require('../middlewares/uploadFilesMiddleware');
const { allowedTo } = require('../controllers/authServices');

const { firebaseAuth  } = require('../middlewares/firebaseAuth');

const router = express.Router();

router.use(firebaseAuth );
router.put('/changeMyPassword', changePassword);
router.get('/myPlans',allowedTo('student'),getLoggedInStudentPlans)

router
  .route('/')
  .post(uploadFiles, createUserValidator, createAdmin)
  .get(allowedTo('admin'), getAllUsers)
  .patch(allowedTo('student', 'teacher'), uploadFiles, updateUserValidator, updateUser);
router
  .route('/:id')
  .get(allowedTo('admin'), getUserValidator, getUser)
  .delete(allowedTo('admin'), deleteUserValidator, deleteUser);
router.put('/:id/suspend', allowedTo('admin'), suspendUser);
module.exports = router;
