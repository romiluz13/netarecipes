import React, { createContext, useContext, useEffect, useState } from 'react';
import { 
  signInWithPopup,
  signOut,
  onAuthStateChanged,
  User,
  updateProfile
} from 'firebase/auth';
import { auth, googleProvider } from '../firebase';
import { doc, setDoc } from 'firebase/firestore';
import { db } from '../firebase';

interface AuthContextType {
  user: User | null;
  loading: boolean;
  signInWithGoogle: () => Promise<void>;
  logout: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType>({} as AuthContextType);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  const syncUserData = async (user: User) => {
    if (!user) return;

    try {
      const userDoc = {
        uid: user.uid,
        email: user.email,
        displayName: user.displayName,
        photoURL: user.photoURL,
        lastLogin: new Date().toISOString()
      };

      await setDoc(doc(db, 'users', user.uid), userDoc, { merge: true });
    } catch (error) {
      console.error('Error syncing user data:', error);
    }
  };

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      if (user) {
        // Update the user's profile with Google photo if it's missing
        if (!user.photoURL && auth.currentUser) {
          try {
            const result = await signInWithPopup(auth, googleProvider);
            if (result.user.photoURL) {
              await updateProfile(auth.currentUser, {
                photoURL: result.user.photoURL
              });
              user = auth.currentUser; // Get updated user
            }
          } catch (error) {
            console.error('Error updating profile photo:', error);
          }
        }
        await syncUserData(user);
      }
      setUser(user);
      setLoading(false);
    });

    return unsubscribe;
  }, []);

  const signInWithGoogle = async () => {
    try {
      const result = await signInWithPopup(auth, googleProvider);
      await syncUserData(result.user);
    } catch (error) {
      console.error('Error signing in with Google:', error);
    }
  };

  const logout = async () => {
    try {
      await signOut(auth);
    } catch (error) {
      console.error('Error signing out:', error);
    }
  };

  return (
    <AuthContext.Provider value={{ user, loading, signInWithGoogle, logout }}>
      {!loading && children}
    </AuthContext.Provider>
  );
}

export const useAuth = () => useContext(AuthContext); 