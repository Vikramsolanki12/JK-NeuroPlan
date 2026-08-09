// src/services/firebase.js

import { initializeApp, getApps, getApp } from "firebase/app";
import { 
  getAuth, 
  GoogleAuthProvider 
} from "firebase/auth";
import { 
  getFirestore 
} from "firebase/firestore";
import { 
  getStorage 
} from "firebase/storage";

// 🔐 Firebase Config
const firebaseConfig = {
  apiKey: "AIzaSyAZABh0mlGutw6STm51whCkJT9uc5fnlg4",
  authDomain: "jk-neuroplan.firebaseapp.com",
  projectId: "jk-neuroplan",
  storageBucket: "jk-neuroplan.appspot.com",
  messagingSenderId: "718338454298",
  appId: "1:718338454298:web:0dd0cd6e6add002ae4f2a3"
};

// ✅ Prevent multiple initialization (important for React hot reload)
const app = !getApps().length ? initializeApp(firebaseConfig) : getApp();

// 🔐 Firebase Authentication
export const auth = getAuth(app);

// 🔑 Google Auth Provider
export const googleProvider = new GoogleAuthProvider();

// 📦 Firestore Database
export const db = getFirestore(app);

// 🗂 Firebase Storage (for images/files)
export const storage = getStorage(app);

// 🚀 Export app
export default app;