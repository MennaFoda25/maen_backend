const express = require('express');
const router = express.Router();
const {createConversation,sendMessage,getMessages,getMyConversations} = require('../controllers/chatServices');
const { allowedTo } = require('../controllers/authServices'); // adjust path
const { firebaseAuth } = require('../middlewares/firebaseAuth');
const {ensureAssigned} = require('../middlewares/chatMiddlewre')

router.use(firebaseAuth);

router.route('/')
.post(ensureAssigned({ receiverField: 'receiverId'}),createConversation)
.get(allowedTo('teacher', 'student'),getMyConversations)

router.route('/messages').post(sendMessage)
router.get('/messages/:conversationId', getMessages)

module.exports = router

