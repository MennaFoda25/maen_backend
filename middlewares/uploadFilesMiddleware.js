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

    // ✅ Build a uniform object for controller use
    req.uploadedFiles = {
      profile_picture: req.files?.profile_picture
        ? req.files.profile_picture.map((f) => ({
            fileUrl: f.path,
            fileName: f.originalname,
          }))
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

    next();
  });
};

// const multer = require('multer');
// const { CloudinaryStorage } = require('multer-storage-cloudinary');
// const cloudinary = require('../config/cloudinary');
// const ApiError = require('../utils/apiError');
// const sharp = require('sharp');

// // middlewares/uploadFilesMiddleware.js

// const memoryStorage = multer.memoryStorage();
// const uploadParser = multer({
//   storage: memoryStorage,
//   limits: { fileSize: 10 * 1024 * 1024 }, // 10MB per file
// }).any(); // accept any fields, we'll handle names

// // helper: upload buffer to Cloudinary via upload_stream, returns promise
// const uploadBufferToCloudinary = (buffer, options = {}) =>
//   new Promise((resolve, reject) => {
//     const stream = cloudinary.uploader.upload_stream(options, (err, result) => {
//       if (err) return reject(err);
//       resolve(result);
//     });
//     stream.end(buffer);
//   });

// // main middleware
// const uploadFiles = async (req, res, next) => {
//   console.time('🧾 Upload middleware total');
//   // first parse multipart body into req.files & req.body
//   uploadParser(req, res, async (err) => {
//     if (err) {
//       console.timeEnd('🧾 Upload middleware total');
//       return next(new ApiError(err.message || 'Upload parse error', 400));
//     }

//     if (!req.files || req.files.length === 0) {
//       console.timeEnd('🧾 Upload middleware total');
//       // nothing uploaded, set empty structure to keep controller simple
//       req.uploadedFiles = { profile_picture: [], certificates: [] };
//       return next();
//     }

//     try {
//       // map files to upload promises (parallel)
//       const uploadPromises = req.files.map(async (file) => {
//         // choose behavior by fieldname
//         const field = file.fieldname; // expected: 'profile_picture' or 'certificates'
//         const originalname = file.originalname;

//         // Preprocess profile image only (resize & compress)
//         let bufferToUpload = file.buffer;
//         let uploadOptions = { folder: 'maeen/uploads', resource_type: 'auto' };

//         if (field === 'profile_picture') {
//           // resize & compress to reduce upload time/size
//           try {
//             bufferToUpload = await sharp(file.buffer)
//               .resize(400, 400, { fit: 'cover' })
//               .jpeg({ quality: 80 })
//               .toBuffer();
//             uploadOptions = {
//               folder: 'maeen/users',
//               resource_type: 'image',
//               public_id: `${(req.body.name || 'user').replace(/\s+/g, '_').toLowerCase()}_profile_${Date.now()}`,
//             };
//           } catch (sharpErr) {
//             // if sharp fails, fallback to original buffer
//             bufferToUpload = file.buffer;
//             uploadOptions = { folder: 'maeen/users', resource_type: 'image' };
//           }
//         } else if (field === 'certificates') {
//           uploadOptions = {
//             folder: 'maeen/certificates',
//             resource_type: 'auto',
//             public_id: `${Date.now()}-${originalname}`,
//           };
//         } else {
//           // other fields: generic folder
//           uploadOptions = { folder: 'maeen/uploads', resource_type: 'auto' };
//         }

//         console.time(`📤 Upload ${field}:${originalname}`);
//         const result = await uploadBufferToCloudinary(bufferToUpload, uploadOptions);
//         console.timeEnd(`📤 Upload ${field}:${originalname}`);

//         // return normalized info
//         return {
//           field,
//           originalname,
//           result, // cloudinary response
//         };
//       });

//       const uploaded = await Promise.all(uploadPromises);

//       // Normalize into lookup by field
//       req.uploadedFiles = { profile_picture: [], certificates: [] };
//       uploaded.forEach((u) => {
//         const url = u.result?.secure_url || u.result?.url || null;
//         const entry = { fileUrl: url, fileName: u.originalname, raw: u.result };
//         if (u.field === 'profile_picture') req.uploadedFiles.profile_picture.push(entry);
//         else if (u.field === 'certificates') req.uploadedFiles.certificates.push(entry);
//         else {
//           // keep others in certificates array as default
//           req.uploadedFiles.certificates.push(entry);
//         }
//       });

//       console.timeEnd('🧾 Upload middleware total');
//       return next();
//     } catch (uploadErr) {
//       console.timeEnd('🧾 Upload middleware total');
//       return next(new ApiError(uploadErr.message || 'Upload to Cloudinary failed', 500));
//     }
//   });
// };

// module.exports = { uploadFiles };

// // Unified Cloudinary storage (handles both profile pictures & certificates)
// const storage = new CloudinaryStorage({
//   cloudinary,
//   params: async (req, file) => {
//     const baseFolder = 'maeen';
//     const now = Date.now();

//     switch (file.fieldname) {
//       case 'profile_picture':
//         return {
//           folder: `${baseFolder}/users`,
//           allowed_formats: ['jpg', 'jpeg', 'png', 'webp'],
//           public_id: `${req.body.name?.replace(/\s+/g, '_').toLowerCase() || 'user'}_profile_${now}`,
//           transformation: [{ width: 400, height: 400, crop: 'fill', quality: 'auto' }],
//         };
//       case 'certificates':
//         return {
//           folder: `${baseFolder}/certificates`,
//           resource_type: 'auto',
//           allowed_formats: ['pdf', 'jpg', 'jpeg', 'png'],
//           public_id: `${now}-${file.originalname}`,
//         };
//       default:
//         return { folder: `${baseFolder} /uploads`, resource_type: 'auto' };
//     }
//   },
// });

// // Initialize multer with combined storage
// const upload = multer({
//   storage,
//   limits: {
//     fileSize: 10 * 1024 * 1024, // 10 MB per file
//   },
// }).fields([
//   { name: 'profile_picture', maxCount: 1 },
//   { name: 'certificates', maxCount: 10 },
// ]);

// // Wrapper to handle errors gracefully
// const uploadFiles = (req, res, next) => {
//   upload(req, res, (err) => {
//     if (err) return next(new ApiError(err.message, 400));
//     next();
//   });
// };

// module.exports = { uploadFiles };
