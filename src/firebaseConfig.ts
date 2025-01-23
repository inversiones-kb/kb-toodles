// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
import { getAnalytics } from "firebase/analytics";
// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries

// Your web app's Firebase configuration
// For Firebase JS SDK v7.20.0 and later, measurementId is optional
const firebaseConfig = {
  apiKey: "AIzaSyDFu8GTQHOv3_xV8vP45byZ9vPSA7JEPMg",
  authDomain: "kb-toodles.firebaseapp.com",
  projectId: "kb-toodles",
  storageBucket: "kb-toodles.firebasestorage.app",
  messagingSenderId: "575582339633",
  appId: "1:575582339633:web:7d6ff74c7d3ed18d760b10",
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const analytics = getAnalytics(app);
