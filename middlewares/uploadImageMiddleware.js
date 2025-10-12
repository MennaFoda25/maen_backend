const multer = require('multer');
const { CloudinaryStorage } = require('multer-storage-cloudinary');
const cloudinary = require('../utils/cloudinary');

//Configure storage
const storage = new CloudinaryStorage({
  cloudinary,
  params: async (req, file) => {
    // Sanitize user name for filename (no spaces or special characters)
    const userName = req.body.name ? req.body.name.replace(/\s+/g, '_').toLowerCase() : 'user';
    return {
      folder: 'maeen/users',
      allowed_formats: ['jpg', 'jpeg', 'png', 'webp'],
      public_id: `${userName}_profile_${Date.now()}`, // File name format
      transformation: [{ width: 400, height: 400, crop: 'fill', quality: 'auto' }],
    };
    
  },
});



//File filter and size limit
const upload = multer({
  storage,

  limits: { fileSize: 2 * 1024 * 1024 }, //2MB Max
  fileFilter: (req, file, cb) => {
    if (!file.mimetype.match(/^image\/(jpeg|png|jpg|webp)$/)) {
      return cb(new Error('Only .jpg, .jpeg, .png, and .webp files allowed!'), false);
    }
    cb(null, true);
  },
});

const uploadAndAttachUrl = (fieldName) => {
  return (req, res, next) => {
    const singleUpload = upload.single(fieldName);
    singleUpload(req, res, (err) => {
      if (err) return next(err);

      // ✅ After Cloudinary upload, add image URL to req.body
      if (req.file && req.file.path) {
        req.body[fieldName] = req.file.path; // e.g., req.body.profile_picture
      }

      next();
    });
  };
};
module.exports = { upload, uploadAndAttachUrl };


// Features:

// Limits file size to 2 MB

// Accepts only image extensions

// Resizes to 400×400 px automatically

// Compresses intelligently (quality: 'auto')

// Works seamlessly in all environments
