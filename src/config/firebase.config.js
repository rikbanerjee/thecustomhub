// Firebase Configuration
// To set up Firebase:
// 1. Go to https://console.firebase.google.com
// 2. Create a new project or select existing one
// 3. Go to Project Settings > General
// 4. Scroll down to "Your apps" and click the web icon (</>)
// 5. Register your app and copy the configuration
// 6. Replace the values below with your Firebase config

const firebaseConfig = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY || "your_api_key_here",
  authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN || "thecustomhub.firebaseapp.com",
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID || "thecustomhub",
  storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET || "thecustomhub.appspot.com",
  messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID || "your_messaging_sender_id",
  appId: import.meta.env.VITE_FIREBASE_APP_ID || "your_app_id",
  measurementId: import.meta.env.VITE_FIREBASE_MEASUREMENT_ID || "your_measurement_id"
};

export default firebaseConfig;

// Usage example (when you need Firebase in the future):
// import { initializeApp } from 'firebase/app';
// import firebaseConfig from './config/firebase.config';
// const app = initializeApp(firebaseConfig);

