// src/firebase.js (hoặc tạo một tệp tương tự)
import { initializeApp } from "firebase/app";
import { getFirestore } from "firebase/firestore";
// Your web app's Firebase configuration

const firebaseConfig = {
  apiKey: "AIzaSyAgZnN0ffGONOKBAdS3bmSqy3LSKCEZB5k",
  authDomain: "linkproject57.firebaseapp.com",
  projectId: "linkproject57",
  storageBucket: "linkproject57.firebasestorage.app",
  messagingSenderId: "362773984317",
  appId: "1:362773984317:web:b7553d5d39a983fb872654"
};

const app = initializeApp(firebaseConfig);
const db = getFirestore(app);

export { db };
