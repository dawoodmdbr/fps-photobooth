import { initializeApp } from "firebase/app";
import { getAnalytics } from "firebase/analytics";
import { getAuth, GoogleAuthProvider } from "firebase/auth";
import { getFirestore } from "firebase/firestore";
import { getStorage } from "firebase/storage";

// Replace with your Firebase project config
const firebaseConfig = {
  apiKey: "AIzaSyCsQmrGr2oVm0txuAJhNXAYY4B6B8CkUkE",
  authDomain: "fps-photobooth.firebaseapp.com",
  projectId: "fps-photobooth",
  storageBucket: "fps-photobooth.firebasestorage.app",
  messagingSenderId: "1022941141529",
  appId: "1:1022941141529:web:4a77eddb01e5f142d16888",
  measurementId: "G-72SHTCSYYF"
};

const app = initializeApp(firebaseConfig);
const analytics = getAnalytics(app);

export const auth = getAuth(app);
export const db = getFirestore(app);
export const storage = getStorage(app);
export const googleProvider = new GoogleAuthProvider();

googleProvider.setCustomParameters({
  hd: "cfd.nu.edu.pk", // Restrict to university domain
});
