// const admin = require('firebase-admin');
// const dotenv = require('dotenv');
// dotenv.config();

// //Intialize firebase admin SDK
// const serviceAccount = require('../service_account/firebaseAdminConfig.json');

// admin.initializeApp({
//   credential: admin.credential.cert(serviceAccount),
// });

// module.exports = admin;

const admin = require('firebase-admin');

// Remove: const serviceAccount = require('../service_account/firebaseAdminConfig.json');

// Instead, initialize using environment variables
if (!admin.apps.length) {
  admin.initializeApp({
    credential: admin.credential.cert({
      type: 'service_account',
      project_id: process.env.FIREBASE_PROJECT_ID,
      private_key_id: process.env.FIREBASE_PRIVATE_KEY_ID,
      private_key: process.env.FIREBASE_PRIVATE_KEY.replace(/\\n/g, '\n'), // Handle newlines
      client_email: process.env.FIREBASE_CLIENT_EMAIL,
      client_id: process.env.FIREBASE_CLIENT_ID,
      auth_uri: 'https://accounts.google.com/o/oauth2/auth',
      token_uri: 'https://oauth2.googleapis.com/token',
      auth_provider_x509_cert_url: 'https://www.googleapis.com/oauth2/v1/certs',
      client_x509_cert_url: process.env.FIREBASE_CLIENT_X509_CERT_URL,
    }),
    databaseURL: process.env.FIREBASE_DATABASE_URL, // If using Realtime DB
  });
}

module.exports = admin;
