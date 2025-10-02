// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
import { getFirestore } from "firebase/firestore"
// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries

// Your web app's Firebase configuration
// For Firebase JS SDK v7.20.0 and later, measurementId is optional
const firebaseConfig = {
  apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY,
  authDomain: "aimultimodel.firebaseapp.com",
  projectId: "aimultimodel",
  storageBucket: "aimultimodel.firebasestorage.app",
  messagingSenderId: "735692449479",
  appId: "1:735692449479:web:4794465b734f05fec080e2",
  measurementId: "G-NEHCTYJC04"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const db = getFirestore(app)
