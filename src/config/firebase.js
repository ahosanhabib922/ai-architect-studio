import { initializeApp } from 'firebase/app';
import { getAuth, GoogleAuthProvider } from 'firebase/auth';
import { getFirestore } from 'firebase/firestore';


const firebaseConfig = {
  apiKey: "AIzaSyAHS0Z_kNgWoWBudKppFI3c4oYaiPsPJ7g",
  authDomain: "expritor.firebaseapp.com",
  projectId: "expritor",
  storageBucket: "expritor.firebasestorage.app",
  messagingSenderId: "568392034411",
  appId: "1:568392034411:web:f35a6364ef0a2d05b3692e",
  measurementId: "G-8C1415TYWP"
};

const app = initializeApp(firebaseConfig);
export const auth = getAuth(app);
export const googleProvider = new GoogleAuthProvider();
export const db = getFirestore(app);
