
import { getApp, getApps, initializeApp } from 'firebase/app';
import { getAuth } from 'firebase/auth';

const firebaseConfig = {
  apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY,
  authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN,
  projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
  storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID,
  appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID
};

// Initialize Firebase
import { FirebaseApp } from 'firebase/app';
import { Auth } from 'firebase/auth';

let app: FirebaseApp | undefined;
let auth: Auth | undefined;

try {
  // Check if config is valid (basic check)
  if (!firebaseConfig.apiKey) {
      console.warn('Firebase API Key is missing. Auth will not work.');
  } else {
      app = !getApps().length ? initializeApp(firebaseConfig) : getApp();
      auth = getAuth(app);
  }
} catch (e) {
  console.error('Firebase Initialization Error:', e);
}

export { app, auth };

