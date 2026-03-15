import { initializeApp, getApps } from 'firebase/app';
import { getFunctions } from 'firebase/functions';
import firebaseConfig from '../config/firebase.config';

// Initialize Firebase app (singleton)
const app = getApps().length === 0 ? initializeApp(firebaseConfig) : getApps()[0];
const firebaseFunctions = getFunctions(app);

export { app, firebaseFunctions };
