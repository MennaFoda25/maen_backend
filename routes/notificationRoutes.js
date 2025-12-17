const express = require('express');
const router = express.Router();

const { sendNotificationToUser, sendNotificationToAllUsersByAdmin } = require('../controllers/notificationService');
const { firebaseAuth } = require('../middlewares/firebaseAuth');
const { allowedTo } = require('../controllers/authServices'); // adjust path

router.post('/', firebaseAuth, sendNotificationToUser);
router.post('/sendToAll', firebaseAuth, allowedTo('admin'), sendNotificationToAllUsersByAdmin);
module.exports = router;
