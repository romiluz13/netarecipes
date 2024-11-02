import { initializeApp } from 'firebase/app';
import { getAuth } from 'firebase/auth';
import { getFirestore } from 'firebase/firestore';
import { getStorage } from 'firebase/storage';

const firebaseConfig = {
  apiKey: "AIzaSyCE_P_ry3W9V2aHAFVWo3iK0Np8yEtFdZg",
  authDomain: "neta-recipes.firebaseapp.com",
  projectId: "neta-recipes",
  storageBucket: "neta-recipes.appspot.com",
  messagingSenderId: "802923641287",
  appId: "1:802923641287:web:2cbc4d3211eca8188301e2"
};

const app = initializeApp(firebaseConfig);
export const auth = getAuth(app);
export const db = getFirestore(app);
export const storage = getStorage(app);

export default app;
