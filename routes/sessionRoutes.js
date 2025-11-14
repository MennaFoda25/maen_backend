const express = require('express');
const router = express.Router();
const { firebaseAuth } = require('../middlewares/firebaseAuth');
const { allowedTo } = require('../controllers/authServices');
const{bookSession}= require('../controllers/sessionServices')

router.use(firebaseAuth);

router.post('/book',firebaseAuth,bookSession)

module.exports = router;