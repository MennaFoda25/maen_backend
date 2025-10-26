const express = require('express');
const { firstLogin, getFirebaseUser } = require('../controllers/authServices');
const { uploadUserImg, suspendUser } = require('../controllers/userService');
const { createUserValidator } = require('../utils/validators/userValidator');

const { verifyFirebaseToken } = require('../middlewares/firebaseAuth');
const router = express.Router();

router.post('/register', verifyFirebaseToken, uploadUserImg, createUserValidator, firstLogin);
//router.post('/login', loginUser);
router.get('/me', verifyFirebaseToken, getFirebaseUser);
//router.post('/providerlogin', verifyFirebaseToken, providerLogin);

module.exports = router;

/**
 * @swagger
 * /auth/register:
 *   post:
 *     summary: Register a new user (student or teacher)
 *     tags: [Auth]
 *     requestBody:
 *       required: true
 *       content:
 *         multipart/form-data:
 *           schema:
 *             type: object
 *             properties:
 *               name:
 *                 type: string
 *               email:
 *                 type: string
 *               password:
 *                 type: string
 *               passwordConfirm:
 *                 type: string
 *               role:
 *                 type: string
 *                 enum: [student, teacher]
 *               studentProfile:
 *                 type: string
 *                 description: JSON string — {"learning_goals":["Hifz"],"current_level":"beginner"}
 *               teacherProfile:
 *                 type: string
 *                 description: JSON string — {"bio":"..","certificates":[".."],"specialties":[".."]}
 *               profileImg:
 *                 type: string
 *                 format: binary
 *     responses:
 *       200:
 *         description: User created or teacher request submitted
 *
 * /auth/me:
 *   post:
 *     summary: get logged in user
 *     tags: [Auth]
 *     responses:
 *       200:
 *         description: user
 */
