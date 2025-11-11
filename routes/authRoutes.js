const express = require('express');
const { firstLogin, getFirebaseUser } = require('../controllers/authServices');
const { createUserValidator } = require('../utils/validators/userValidator');
const { uploadFiles   } = require('../middlewares/uploadFilesMiddleware');


const { firebaseAuth  } = require('../middlewares/firebaseAuth');
const router = express.Router();

router.post('/register', firebaseAuth , uploadFiles ,createUserValidator, firstLogin);
router.get('/me', firebaseAuth , getFirebaseUser);

module.exports = router;
