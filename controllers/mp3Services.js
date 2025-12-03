const Mp3File = require('../models/Mp3Model');
const ApiError = require('../utils/apiError');
const asyncHandler = require('express-async-handler');
const factory = require('./handlerFactory');
const cloudinaryUploader = require("../middlewares/uploadAudioMiddleware")

exports.uploadMp3File =asyncHandler(async (req, res,next) => {
       const { name, description } = req.body;
const file = await Mp3File.findOne({name})
  if (!name) return next(new ApiError('Name is required', 400));
  if (file) return next(new ApiError("file is already uploaded",400))
   //if (!req.file || !req.file.buffer) return next(new ApiError('MP3 file is required', 400));

   
  // check for any file validation errors from multer
  if (req.fileValidationError) {
    return res
      .status(400)
      .json({ message: `File validation error: ${req.fileValidationError}` });
  }

  //   invoke the uplader function to handle the upload to cloudinary

  //   we are passing the req, and res to cloudinaryUploader function
  const audioResponse = await cloudinaryUploader(req, res);
const Mp3 = await Mp3File.create({
    name,
    description:req.body.description || "",
    fileUrl:audioResponse.secure_url
   })
  //   send response with audio response from cloudinary

  return res.status(200).json({ message: "file is added successfully", data:Mp3 });
})

exports.deleteFile = factory.deleteOne(Mp3File);

exports.getAllMp3 = factory.getAll(Mp3File)
