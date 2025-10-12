const express = require('express');
const {
  createUser,
  updateUser,
  getUser,
  getAllUsers,
  deleteUser,
  uploadUserImg,
} = require('../controllers/userService');

const router = express.Router();

router.route('/').post(uploadUserImg, createUser).get(getAllUsers);
router.route('/:id').get(getUser).patch(uploadUserImg, updateUser).delete(deleteUser);

module.exports = router;
