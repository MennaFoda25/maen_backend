const asyncHandler = require('express-async-handler');
const ApiError = require('../utils/apiError');
const User = require('../models/userModel');
const { sendNotification } = require('../utils/sendNotification');

/**
 * Send notification to a single user
 * Body:
 * {
 *   userId,
 *   title,
 *   body,
 *   data (optional)
 * }
 */
exports.sendNotificationToUser = asyncHandler(async (req, res, next) => {
  const { userId, title, body, data } = req.body;

  if (!userId || !title || !body) {
    return next(new ApiError('userId, title and body are required', 400));
  }

  const user = await User.findById(userId);
  if (!user) return next(new ApiError('User not found', 404));

  if (!user.notificationToken) {
    return next(new ApiError('User does not have a notification token', 400));
  }

  await sendNotification({
    token: user.notificationToken,
    title,
    body,
    data,
  });

  res.status(200).json({
    status: 'success',
    message: 'Notification sent successfully',
  });
});

exports.sendNotificationToAllUsersByAdmin = asyncHandler(async(req,res,next)=>{
    const { title, body, data } = req.body;
    const users = await User.find({ status:'active', notificationToken: { $ne: null } })

     // 🔔 SEND NOTIFICATIONS
     await Promise.all(
       users.map((user) =>
         sendNotification({
           token: user.notificationToken,
           title,
           body,
           data
         })
       )
     );
   
     res.status(200).json({
         status: 'success',
            message: 'Notifications sent successfully',
     })
})