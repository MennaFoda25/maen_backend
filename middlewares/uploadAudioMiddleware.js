const cloudinary = require("../config/cloudinary")

const cloudinaryUploader = async(req,res)=>{
  const file = req.file
  if(!file){
 return res.status(400).json({ message: "File not found" });  }

  const fName = file.originalname.split(".")[0];
  try {
    const uploadAudio = await cloudinary.uploader.upload(file.path, {
      resource_type: "raw",
      public_id: `audioTutorial/${fName}`,
    });

    // we are retuning the object response from the cloudinary
    return uploadAudio;
  } catch (error) {
    console.log(error);
    // incase the error we are return statu == 400 and error message
    return res.status(400).json({ message: error.message });
  }}

module.exports=  cloudinaryUploader;
// keep file in memory (buffer)
// const storage = multer.memoryStorage();
// const upload = multer({
//   storage,
//   limits: { fileSize: 50 * 1024 * 1024 }, // 50MB
//   fileFilter: (req, file, cb) => {
//     const valid = ['audio/mpeg','audio/mp3','audio/wav','audio/x-m4a','audio/mp4'].includes(file.mimetype);
//     cb(valid ? null : new Error('Invalid audio type'), valid);
//   }
// });

// module.exports = upload;
