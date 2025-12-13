// utils/sendNotification.js
const admin = require("../config/firebase");

// sendToUser(user, { title, body })
exports.sendToUser = async (user, notification = {}) => {
  if (!user?.notificationToken) return;

  const message = {
    token: user.notificationToken,
    notification: {
      title: notification.title || "Notification",
      body: notification.body || "",
    },
  };

  await admin.messaging().send(message);
};
