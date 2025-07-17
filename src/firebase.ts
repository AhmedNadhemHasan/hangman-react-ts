// src/firebase.ts
import { getAnalytics } from "firebase/analytics";
import { initializeApp } from "firebase/app"
import { getAuth } from "firebase/auth"
import { getFirestore } from "firebase/firestore"

const firebaseConfig = {
  apiKey: "AIzaSyBX5_2YLvIIqJkQBvJ7u6txVkn1yUyoX4w",
  authDomain: "hangman-react-530ef.firebaseapp.com",
  projectId: "hangman-react-530ef",
  storageBucket: "hangman-react-530ef.firebasestorage.app",
  messagingSenderId: "328264353484",
  appId: "1:328264353484:web:d01ee3d7303d213a0ca469",
  measurementId: "G-8SW3FSKN7B"
}

const app = initializeApp(firebaseConfig);
const analytics = getAnalytics(app);

export const auth = getAuth(app)
export const db = getFirestore(app)