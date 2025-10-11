const express = require('express');
const {
  createUser,
  updateUser,
  getUser,
  getAllUsers,
  deleteUser,
} = require('../controllers/userService');

const router = express.Router();

router.route('/').post(createUser).get(getAllUsers);
router.route('/:id').get(getUser).patch(updateUser).delete(deleteUser);

module.exports = router;
