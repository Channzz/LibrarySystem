
import { initializeApp } from "https://www.gstatic.com/firebasejs/10.7.1/firebase-app.js";
import { getFirestore } from "https://www.gstatic.com/firebasejs/10.7.1/firebase-firestore.js";
import { getAuth } from "https://www.gstatic.com/firebasejs/10.7.1/firebase-auth.js";

const firebaseConfig = {
  apiKey: "AIzaSyDfc7MLTrpLHVciObB02CdnNIdIEzk2Jvk",
  authDomain: "librarysystem-9f6cd.firebaseapp.com",
  projectId: "librarysystem-9f6cd",
  storageBucket: "librarysystem-9f6cd.firebasestorage.app",
  messagingSenderId: "617348451553",
  appId: "1:617348451553:web:dfd4c28c04a7ddac32bba0",
  measurementId: "G-J51H7101CW"
};


const app = initializeApp(firebaseConfig);
const db = getFirestore(app);
const auth = getAuth(app);

export { db, auth };