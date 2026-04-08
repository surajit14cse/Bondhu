const admin = require('firebase-admin');

// Note: You need to provide your serviceAccountKey.json
// try {
//   const serviceAccount = require('../config/serviceAccountKey.json');
//   admin.initializeApp({
//     credential: admin.credential.cert(serviceAccount)
//   });
// } catch (err) {
//   console.warn('Firebase Admin SDK could not be initialized. Push notifications will be disabled.');
// }

const sendPushNotification = async (fcmToken, title, body, data = {}) => {
  if (!fcmToken) return;

  const message = {
    notification: { title, body },
    data,
    token: fcmToken,
  };

  try {
    // await admin.messaging().send(message);
    console.log(`[Push Notification] To: ${fcmToken}, Title: ${title}, Body: ${body}`);
  } catch (err) {
    console.error('Error sending push notification:', err);
  }
};

module.exports = { sendPushNotification };
