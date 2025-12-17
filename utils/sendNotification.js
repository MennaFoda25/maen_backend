const admin = require('../config/firebase');

module.exports.sendNotification = async ({ token, title, body, data = {} }) => {
  if (!token) return;

  const response1 = await admin.messaging().send({
    token,
    notification: {
      title,
      body,
    },
    data, // optional custom payload
  });

  console.log('FCM message Id', response1);

};

