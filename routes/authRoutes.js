const express = require('express');
const { firstLogin, getFirebaseUser, } = require('../controllers/authServices');
const {uploadUserImg, suspendUser} = require('../controllers/userService');
const {
  createUserValidator
} = require('../utils/validators/userValidator');

const {verifyFirebaseToken} = require('../middlewares/firebaseAuth');
const router = express.Router();

router.post('/register',verifyFirebaseToken,uploadUserImg, createUserValidator, firstLogin);
//router.post('/login', loginUser);
router.get('/me', verifyFirebaseToken, getFirebaseUser);
//router.post('/providerlogin', verifyFirebaseToken, providerLogin);

module.exports = router;
