const express = require('express');
const { registerUser, loginUser, getFirebaseUser } = require('../controllers/authServices');
const {uploadUserImg} = require('../controllers/userService');
const {
  createUserValidator
} = require('../utils/validators/userValidator');

const authMiddleware = require('../middlewares/firebaseAuth');
const router = express.Router();

router.post('/register',uploadUserImg,createUserValidator, registerUser);
router.post('/login', loginUser);
router.get('/me', authMiddleware, getFirebaseUser);

module.exports = router;
