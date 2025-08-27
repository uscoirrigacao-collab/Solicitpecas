// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
import { getFirestore } from "firebase/firestore";

// Your web app's Firebase configuration
const firebaseConfig = {
  "projectId": "peas-express",
  "appId": "1:217191336683:web:d920c8a33cab9cfb800cae",
  "storageBucket": "peas-express.firebasestorage.app",
  "apiKey": "AIzaSyBCt6qTAfhW1qoiHFTNGaDrywZyRMsXpDQ",
  "authDomain": "peas-express.firebaseapp.com",
  "measurementId": "",
  "messagingSenderId": "217191336683"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);

// Initialize Cloud Firestore and get a reference to the service
export const db = getFirestore(app);
