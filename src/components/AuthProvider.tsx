import { useEffect } from 'react';
import { useAuth0 } from '@auth0/auth0-react';
import { getAuth, signInWithCustomToken } from 'firebase/auth';
import { doc, setDoc, getFirestore } from 'firebase/firestore';
import { db } from '../firebase'; // Use the initialized instance from firebase.ts

function AuthProvider({ children }: { children: React.ReactNode }) {
  const { user, isAuthenticated, getIdTokenClaims } = useAuth0();

  useEffect(() => {
    const syncAuth = async () => {
      if (isAuthenticated && user) {
        try {
          // Save user data to Firestore
          const userDoc = {
            email: user.email,
            name: user.name,
            picture: user.picture,
            sub: user.sub,
            lastLogin: new Date().toISOString()
          };

          await setDoc(doc(db, 'users', user.sub), userDoc, { merge: true });
        } catch (error) {
          console.error('Error syncing auth:', error);
        }
      }
    };

    syncAuth();
  }, [isAuthenticated, user]);

  return <>{children}</>;
}

export default AuthProvider;