import { initializeApp, getApps } from "firebase/app";

if (!process.env.FIREBASE_API_KEY ||
  !process.env.FIREBASE_AUTH_DOMAIN ||
  !process.env.FIREBASE_PROJECT_ID ||
  !process.env.FIREBASE_STORAGE_BUCKET ||
  !process.env.FIREBASE_MESSAGING_SENDER_ID ||
  !process.env.FIREBASE_APP_ID ||
  !process.env.FIREBASE_MEASUREMENT_ID) {
  throw new Error("FIREBASE Keys are not set correctly");
}

const firebaseConfig = {
  apiKey: process.env.FIREBASE_API_KEY,
  authDomain: process.env.FIREBASE_AUTH_DOMAIN,
  projectId: process.env.FIREBASE_PROJECT_ID,
  storageBucket: process.env.FIREBASE_STORAGE_BUCKET,
  messagingSenderId: process.env.FIREBASE_MESSAGING_SENDER_ID,
  appId: process.env.FIREBASE_APP_ID,
  measurementId: process.env.FIREBASE_MEASUREMENT_ID
};

// Initialize Firebase
let firebase_app = getApps().length === 0 ? initializeApp(firebaseConfig) : getApps()[0];
export default firebase_app;