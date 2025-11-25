const ApiError = require('../utils/apiError');
const User= require('../models/userModel')

exports.firebaseAuth = async(req, res, next) => {
  const firebaseUid = req.headers['x-firebase-uid']|| req.body.firebaseUid || req.query.firebaseUid;
   console.log('🔥 Incoming UID header:', firebaseUid);
  if (!firebaseUid) return next(new ApiError('Missing firebaseUid', 401));

const user = await User.findOne({ firebaseUid });

  if (user) {
req.user = user;       // ← IMPORTANT
  }


  req.firebase = { uid: firebaseUid };
  next();
};
