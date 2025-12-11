const asyncHandler = require('express-async-handler');
const admin = require('../config/firebase'); // your initialized firebase admin

// Helper: build payload
function buildNotificationPayload(title, body, data = {}) {
  return {
    notification: { title, body },
    data: Object.fromEntries(
      Object.entries(data).map(([k, v]) => [k, String(v)]) // FCM requires strings
    ),
  };
}

// 🔔 Notify Student
exports.notifyStudent = asyncHandler(async (student, title, body, data = {}) => {
  if (!student?.notificationToken) {
    console.log(`⚠️ No FCM token for student: ${student?.name}`);
    return;
  }

  const payload = buildNotificationPayload(title, body, data);

  await admin.messaging().sendToDevice(student.notificationToken, payload);
  console.log(`📨 Notification sent to student: ${student.name}`);
});

// 🔔 Notify Teacher
exports.notifyTeacher = asyncHandler(async (teacher, title, body, data = {}) => {
  if (!teacher?.notificationToken) {
    console.log(`⚠️ No FCM token for teacher: ${teacher?.name}`);
    return;
  }

  const payload = buildNotificationPayload(title, body, data);

  await admin.messaging().sendToDevice(teacher.notificationToken, payload);
  console.log(`📨 Notification sent to teacher: ${teacher.name}`);
});
