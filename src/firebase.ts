// src/firebase.ts
import { initializeApp } from "firebase/app";
import { getFirestore } from "firebase/firestore";

const firebaseConfig = {
  apiKey: "AIzaSyAeuwRNIBZvieeK114sRnxwk8XXWIst0Qk",
  authDomain: "storyflow-lite.firebaseapp.com",
  projectId: "storyflow-lite",
  storageBucket: "storyflow-lite.firebasestorage.app",
  messagingSenderId: "472140196741",
  appId: "1:472140196741:web:a29d539bf45fd9a20a32ec",
   measurementId: "G-1GF1XL2F6C"
};

const app = initializeApp(firebaseConfig);
export const db = getFirestore(app);
