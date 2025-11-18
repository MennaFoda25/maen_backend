const express = require('express');
const router = express.Router();
const { firebaseAuth } = require('../middlewares/firebaseAuth');
const { allowedTo } = require('../controllers/authServices');
const {getProgramTypes,getTeachersByProgramType}= require('../controllers/programServices')

router.use(firebaseAuth);
router.get("/", getProgramTypes);
router.get('/:id',getTeachersByProgramType)

//router.post("/",allowedTo('admin'), addPrograms)
module.exports = router;