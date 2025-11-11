
const multer = require('multer');
const { CloudinaryStorage } = require('multer-storage-cloudinary');
const cloudinary = require('../config/cloudinary');
const ApiError = require('../utils/apiError');

// Configure Cloudinary storage for audio
const storage = new CloudinaryStorage({
  cloudinary,
  params: async (req, file) => {
    const programName = req.body.planName
      ? req.body.planName.replace(/\s+/g, '_').toLowerCase()
      : 'quran_audio';

    return {
      folder: 'maeen/quran_audio',
      allowed_formats: ['mp3', 'wav', 'm4a'],
      resource_type: 'video', // Cloudinary treats audio under 'video'
      public_id: `${programName}_${Date.now()}`,
    };
  },
});

// File filter
const fileFilter = (req, file, cb) => {
  const validTypes = ['audio/mpeg', 'audio/wav', 'audio/mp4', 'audio/mp3', 'audio/x-m4a'];
  if (!validTypes.includes(file.mimetype)) {
    return cb(new ApiError('Invalid audio type. Only mp3, wav, or m4a allowed', 400), false);
  }
  cb(null, true);
};

// Multer config
const upload = multer({
  storage,
  fileFilter,
  limits: { fileSize: 20 * 1024 * 1024 }, // 20MB max
});

// Attach uploaded audio URL
const uploadAndAttachAudio = (fieldName) => {
  return (req, res, next) => {
    const singleUpload = upload.single(fieldName);

    singleUpload(req, res, (err) => {
      if (err instanceof multer.MulterError) {
        return next(new ApiError(`Upload error: ${err.message}`, 400));
      } else if (err) {
        return next(err);
      }

      if (req.file && req.file.path) {
        req.body[fieldName] = req.file.path; // Save Cloudinary URL to body
      }

      next();
    });
  };
};

module.exports = { upload, uploadAndAttachAudio };
