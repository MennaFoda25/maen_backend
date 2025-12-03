const express = require("express");
const router = express.Router();

const { firebaseAuth } = require("../middlewares/firebaseAuth");
//const upload = require("../middlewares/uploadAudioMiddleware");
const upload = require("../middlewares/multer")

const { uploadMp3File,deleteFile,getAllMp3 ,getMp3ById} = require("../controllers/mp3Services");
const { allowedTo } = require('../controllers/authServices');

router.use(firebaseAuth)
router.post(
  "/",
  allowedTo('admin'),
  upload,
  uploadMp3File
);
router.get('/',getAllMp3)
router.delete('/:id',allowedTo('admin'),deleteFile)
router.get('/:id', getMp3ById)

module.exports = router;