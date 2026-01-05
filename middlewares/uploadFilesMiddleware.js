const multer = require('multer');
const cloudinary = require('../config/cloudinary');
const { CloudinaryStorage } = require('multer-storage-cloudinary');
const ApiError = require('../utils/apiError');

// Cloudinary storage settings
const storage = new CloudinaryStorage({
  cloudinary,
  params: async (req, file) => {
    const baseFolder = 'maeen';
    const now = Date.now();

    if (file.fieldname === 'profile_picture') {
      return {
        folder: `${baseFolder}/users`,
        allowed_formats: ['jpg', 'jpeg', 'png', 'webp'],
        public_id: `${req.body.name?.replace(/\s+/g, '_').toLowerCase() || 'user'}_profile_${now}`,
        transformation: [{ width: 400, height: 400, crop: 'fill', quality: 'auto' }],
      };
    }

    if (file.fieldname === 'certificates') {
      return {
        folder: `${baseFolder}/certificates`,
        resource_type: 'auto',
        allowed_formats: ['pdf', 'jpg', 'jpeg', 'png'],
        public_id: `${now}-${file.originalname}`,
      };
    }

    if (file.fieldname === 'eventImage') {
      return {
        folder: `${baseFolder}/events`,
        allowed_formats: ['jpg', 'jpeg', 'png', 'webp'],
        public_id: `${req.body.title?.replace(/\s+/g, '_').toLowerCase() || 'event'}_${now}`,
        transformation: [{ width: 1200, height: 600, crop: 'fill', quality: 'auto' }],
      };
    }

    if (file.fieldname === 'bannerImage') {
      return {
        folder: `${baseFolder}/banners`,
        allowed_formats: ['jpg', 'jpeg', 'png', 'webp'],
        public_id: `${req.body.title?.replace(/\s+/g, '_').toLowerCase() || 'banner'}_${now}`,
        transformation: [{ width: 1920, height: 400, crop: 'fill', quality: 'auto' }],
      };
    }

    return { folder: `${baseFolder}/uploads`, resource_type: 'auto' };
  },
});

const upload = multer({
  storage,
  limits: { fileSize: 10 * 1024 * 1024 }, // 10MB max
}).fields([
  { name: 'profile_picture', maxCount: 1 },
  { name: 'certificates', maxCount: 10 },
  { name: 'eventImage', maxCount: 1 },
  { name: 'bannerImage', maxCount: 1 },
]);

exports.uploadFiles = (req, res, next) => {
  upload(req, res, (err) => {
    if (err) return next(new ApiError(err.message, 400));

    console.log('=== UPLOAD MIDDLEWARE DEBUG ===');
    console.log('req.files:', req.files);
    console.log('profile_picture files:', req.files?.profile_picture);

    // ✅ Build a uniform object for controller use
    req.uploadedFiles = {
      profile_picture: req.files?.profile_picture
        ? req.files.profile_picture.map((f) => {
            console.log('File object:', f);
            console.log('f.path:', f.path);
            return {
              fileUrl: f.path,
              fileName: f.originalname,
            };
          })
        : [],

      certificates: req.files?.certificates
        ? req.files.certificates.map((f) => ({
            fileUrl: f.path,
            fileName: f.originalname,
          }))
        : [],

      eventImage: req.files?.eventImage
        ? req.files.eventImage.map((f) => ({
            fileUrl: f.path,
            fileName: f.originalname,
          }))
        : [],

      bannerImage: req.files?.bannerImage
        ? req.files.bannerImage.map((f) => ({
            fileUrl: f.path,
            fileName: f.originalname,
          }))
        : [],
    };

    console.log('Final req.uploadedFiles:', req.uploadedFiles);
    next();
  });
};
