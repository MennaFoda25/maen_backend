const express = require('express');
const router = express.Router();
const {createOrSendMessage,chatWithUser,getMessages,getMyConversations} = require('../controllers/chatServices');
const { allowedTo } = require('../controllers/authServices'); // adjust path
const { firebaseAuth } = require('../middlewares/firebaseAuth');

router.use(firebaseAuth);

router.route('/')
.post(chatWithUser)
.get(allowedTo('teacher', 'student'),getMyConversations)

//router.route('/messages').post(sendMessage)
router.get('/messages/:receiverId', getMessages)

module.exports = router

