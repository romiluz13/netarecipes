import { initializeApp } from 'firebase/app';
import { getFirestore } from 'firebase/firestore';
import { getStorage } from 'firebase/storage';
import { getAuth, GoogleAuthProvider } from 'firebase/auth';

const firebaseConfig = {
  apiKey: "AIzaSyCE_P_ry3W9V2aHAFVWo3iK0Np8yEtFdZg",
  authDomain: "neta-recipes.firebaseapp.com",
  projectId: "neta-recipes",
  storageBucket: "neta-recipes.appspot.com",
  messagingSenderId: "802923641287",
  appId: "1:802923641287:web:2cbc4d3211eca8188301e2"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);

// Initialize Firestore
const db = getFirestore(app);

// Initialize Storage
const storage = getStorage(app);

// Initialize Authentication
const auth = getAuth(app);
const googleProvider = new GoogleAuthProvider();

export { db, storage, auth, googleProvider };
