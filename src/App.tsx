import React, { Suspense, lazy, useState, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { ChefHat } from 'lucide-react';
import Navbar from './components/Navbar';
import Footer from './components/Footer';
import { AuthProvider, useAuth } from './contexts/AuthContext';
import ErrorBoundary from './components/ErrorBoundary';
import { onAuthStateChanged } from 'firebase/auth';
import { doc, getDoc, setDoc } from 'firebase/firestore';
import { auth, db } from './firebase';
import { HelmetProvider } from 'react-helmet-async';
import MetaTags from './components/MetaTags';
import RecipeForm from './components/RecipeForm';

const RecipeList = lazy(() => import('./components/RecipeList'));
const Profile = lazy(() => import('./pages/Profile'));
const NotFound = lazy(() => import('./pages/NotFound'));
const RecipeDetail = lazy(() => import('./components/RecipeDetail'));

function LoginPrompt() {
  const { signInWithGoogle } = useAuth();

  const handleLogin = async () => {
    try {
      await signInWithGoogle();
    } catch (error) {
      console.error('Error signing in:', error);
    }
  };

  return (
    <div className="text-center p-6 bg-white rounded-lg shadow-sm">
      <ChefHat className="w-16 h-16 text-primary-500 mx-auto mb-4" />
      <h2 className="text-xl font-semibold mb-2">התחבר כדי להוסיף מתכונים</h2>
      <p className="text-gray-600 mb-4">
        התחבר כדי לשתף את המתכונים שלך עם המשפחה
      </p>
      <button onClick={handleLogin} className="btn btn-primary">
        התחבר עם Google
      </button>
    </div>
  );
}

function ProtectedRoute({ children }: { children: React.ReactNode }) {
  const { user } = useAuth();
  
  if (!user) {
    return <LoginPrompt />;
  }
  
  return <>{children}</>;
}

function App() {
  const [globalError, setGlobalError] = useState<string | null>(null);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      if (user) {
        try {
          const userRef = doc(db, 'users', user.uid);
          const userSnap = await getDoc(userRef);
          
          if (!userSnap.exists()) {
            await setDoc(userRef, {
              displayName: user.displayName,
              email: user.email,
              photoURL: user.photoURL,
              createdAt: new Date()
            });
          }
        } catch (error) {
          console.error('Error syncing user data:', error);
          setGlobalError('אירעה שגיאה בסנכרון נתוני המשתמש');
        }
      }
    });

    return () => unsubscribe();
  }, []);

  if (globalError) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-red-50">
        <div className="text-center p-6">
          <h1 className="text-2xl font-bold text-red-600 mb-4">שגיאה</h1>
          <p className="text-red-700">{globalError}</p>
          <button 
            onClick={() => window.location.reload()} 
            className="btn btn-error mt-4"
          >
            טען מחדש
          </button>
        </div>
      </div>
    );
  }

  return (
    <HelmetProvider>
      <MetaTags
        title="מתכוני המשפחה"
        description="האתר המשפחתי שלנו לשיתוף מתכונים, מסורת וטעמים משפחתיים"
        image="/chef-logo.png"
      />
      <ErrorBoundary>
        <AuthProvider>
          <Router>
            <div className="min-h-screen bg-gray-50 flex flex-col" dir="rtl">
              <Navbar />
              <main className="flex-1 pt-16">
                <Suspense fallback={<div className="text-center py-8">טוען...</div>}>
                  <Routes>
                    <Route path="/" element={<RecipeList />} />
                    <Route path="/recipe/:id" element={<RecipeDetail />} />
                    <Route path="/recipe/new" element={<RecipeForm />} />
                    <Route path="/recipe/edit/:id" element={<RecipeForm />} />
                    <Route path="/profile" element={
                      <ProtectedRoute>
                        <Profile />
                      </ProtectedRoute>
                    } />
                    {/* Redirects for old routes */}
                    <Route path="/recipes" element={<Navigate to="/" replace />} />
                    <Route path="/recipes/:id" element={<Navigate to="/recipe/:id" replace />} />
                    <Route path="/recipes/new" element={<Navigate to="/recipe/new" replace />} />
                    <Route path="/recipes/edit/:id" element={<Navigate to="/recipe/edit/:id" replace />} />
                    <Route path="/my-recipes" element={<Navigate to="/profile" replace />} />
                    {/* 404 page */}
                    <Route path="*" element={<NotFound />} />
                  </Routes>
                </Suspense>
              </main>
              <Footer />
            </div>
          </Router>
        </AuthProvider>
      </ErrorBoundary>
    </HelmetProvider>
  );
}

export default App;
