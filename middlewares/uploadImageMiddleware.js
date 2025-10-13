const multer = require('multer');
const { CloudinaryStorage } = require('multer-storage-cloudinary');
const cloudinary = require('../utils/cloudinary');
const ApiError = require('../utils/apiError');

// Configure Cloudinary storage
const storage = new CloudinaryStorage({
  cloudinary,
  params: async (req, file) => {
    const userName = req.body.name
      ? req.body.name.replace(/\s+/g, '_').toLowerCase()
      : 'user';
    return {
      folder: 'maeen/users',
      allowed_formats: ['jpg', 'jpeg', 'png', 'webp'],
      public_id: `${userName}_profile_${Date.now()}`,
      transformation: [
        { width: 400, height: 400, crop: 'fill', quality: 'auto' },
      ],
    };
  },
});

// ✅ STRONGER FILE FILTER
const fileFilter = (req, file, cb) => {
  const validMimeTypes = ['image/jpeg', 'image/png', 'image/jpg', 'image/webp'];

  if (!file) return cb(null, true); // optional upload

  if (!validMimeTypes.includes(file.mimetype)) {
    // ❌ Reject invalid type explicitly
    return cb(
      new ApiError(
        'Invalid file type. Only .jpg, .jpeg, .png, and .webp images are allowed!',
        400
      ),
      false
    );
  }

  cb(null, true);
};

// Configure multer
const upload = multer({
  storage,
  fileFilter,
  limits: { fileSize: 2 * 1024 * 1024 }, // 2MB
});

// ✅ Wrapper: attach image URL if uploaded, error if rejected
const uploadAndAttachUrl = (fieldName) => {
  return (req, res, next) => {
    const singleUpload = upload.single(fieldName);

    singleUpload(req, res, (err) => {
      if (err instanceof multer.MulterError) {
        return next(new ApiError(`Upload error: ${err.message}`, 400));
      } else if (err) {
        // Handles our custom ApiError (invalid type, etc.)
        return next(err);
      }

      // ✅ If upload succeeded, attach Cloudinary URL
      if (req.file && req.file.path) {
        req.body[fieldName] = req.file.path;
      }

      // ✅ If no file uploaded (optional field)
      return next();
    });
  };
};

module.exports = { upload, uploadAndAttachUrl };
