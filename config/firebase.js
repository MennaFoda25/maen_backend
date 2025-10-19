const admin = require('firebase-admin');
const dotenv = require('dotenv');
dotenv.config();

//Intialize firebase admin SDK
const serviceAccount = require('../service_account/firebaseAdminConfig.json');

admin.initializeApp({
  credential: admin.credential.cert(serviceAccount),
});

module.exports = admin;
