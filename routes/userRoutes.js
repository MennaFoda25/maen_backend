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
  uploadUserImg,
  changePassword,
  suspendUser,
} = require('../controllers/userService');

const { allowedTo } = require('../controllers/authServices');

const { verifyFirebaseToken } = require('../middlewares/firebaseAuth');

const router = express.Router();

router.use(verifyFirebaseToken);
router.put('/changeMyPassword/:id', changePasswordValidator, changePassword);

router
  .route('/')
  .post( uploadUserImg, createUserValidator, createAdmin)
  .get(allowedTo('admin'), getAllUsers);
router
  .route('/:id')
  .get(allowedTo('admin'), getUserValidator, getUser)
  .patch(allowedTo('admin'), uploadUserImg, updateUserValidator, updateUser)
  .delete(allowedTo('admin'), deleteUserValidator, deleteUser);
router.put('/:id/suspend', verifyFirebaseToken, suspendUser);
module.exports = router;
