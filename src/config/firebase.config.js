// Firebase Configuration
// To set up Firebase:
// 1. Go to https://console.firebase.google.com
// 2. Create a new project or select existing one
// 3. Go to Project Settings > General
// 4. Scroll down to "Your apps" and click the web icon (</>)
// 5. Register your app and copy the configuration
// 6. Replace the values below with your Firebase config

const firebaseConfig = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY || "AIzaSyCVZI28Chg7CL9z4hC-1Lg10Sdm_cbmfE4",
  authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN || "thecustomhub-efb8a.firebaseapp.com",
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID || "thecustomhub-efb8a",
  storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET || "thecustomhub-efb8a.firebasestorage.app",
  messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID || "876408539530",
  appId: import.meta.env.VITE_FIREBASE_APP_ID || "1:876408539530:web:23bf2008e1b49729fc6073",
  measurementId: import.meta.env.VITE_FIREBASE_MEASUREMENT_ID || "G-B1K7WTNFXE"
};

export default firebaseConfig;

// Usage example (when you need Firebase in the future):
// import { initializeApp } from 'firebase/app';
// import firebaseConfig from './config/firebase.config';
// const app = initializeApp(firebaseConfig);

