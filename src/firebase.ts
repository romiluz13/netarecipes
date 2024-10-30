import { initializeApp } from 'firebase/app';
import { getFirestore, enableIndexedDbPersistence } from 'firebase/firestore';
import { getStorage } from 'firebase/storage';
import { getAuth } from 'firebase/auth';

const firebaseConfig = {
  apiKey: "AIzaSyCE_P_ry3W9V2aHAFVWo3iK0Np8yEtFdZg",
  authDomain: "neta-recipes.firebaseapp.com",
  projectId: "neta-recipes",
  storageBucket: "neta-recipes.appspot.com",
  messagingSenderId: "802923641287",
  appId: "1:802923641287:web:2cbc4d3211eca8188301e2"
};

// אתחול Firebase
const app = initializeApp(firebaseConfig);

// אתחול Firestore עם תמיכה במצב לא מקוון
const db = getFirestore(app);
enableIndexedDbPersistence(db).catch((err) => {
  if (err.code == 'failed-precondition') {
    console.warn('Multiple tabs open, persistence can only be enabled in one tab at a a time.');
  } else if (err.code == 'unimplemented') {
    console.warn('The current browser does not support persistence.');
  }
});

// אתחול Storage
const storage = getStorage(app);

// אתחול Authentication
const auth = getAuth(app);

export { db, storage, auth };