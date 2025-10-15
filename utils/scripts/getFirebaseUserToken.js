//const { auth } = require('firebase-admin');

const { initializeApp } = require('firebase/app');
const { getAuth, signInWithEmailAndPassword } = require('firebase/auth');

const firebaseConfig = {
  apiKey: 'AIzaSyB0ibdsxEzqILoGh3xZmv-1HJlRjBvkKQ8',
  authDomain: 'maen-8d57e.firebaseapp.com',
  projectId: process.env.FIREBASE_PROJECT_ID,
};

const app = initializeApp(firebaseConfig);
const auth = getAuth(app);

async function getUserToken() {
  try {
    // ⚠️ Replace this with an existing Firebase Authentication user email & password
    const userCredential = await signInWithEmailAndPassword(auth, 'menna@gmail.com', '111222');

    const token = await userCredential.user.getIdToken();
    console.log('\n✅ Your Firebase ID Token:\n');
    console.log(token);
  } catch (error) {
    console.error('❌ Error:', error.message);
  }
}

getUserToken();
