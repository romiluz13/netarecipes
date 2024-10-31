import React from 'react';
import { BrowserRouter, Routes, Route, Navigate, useNavigate } from 'react-router-dom';
import { ChefHat } from 'lucide-react';
import Navbar from './components/Navbar';
import Home from './pages/Home';
import Recipes from './pages/Recipes';
import Categories from './pages/Categories';
import Profile from './pages/Profile';
import { AuthProvider, useAuth } from './contexts/AuthContext';

function LoginPage() {
  const { signInWithGoogle } = useAuth();
  const navigate = useNavigate();

  const handleLogin = async () => {
    try {
      await signInWithGoogle();
      navigate('/recipes');
    } catch (error) {
      console.error('Error signing in:', error);
    }
  };

  return (
    <div className="min-h-[calc(100vh-4rem)] flex items-center justify-center p-4 bg-gradient-to-br from-primary-50 to-secondary-50">
      <div className="text-center max-w-2xl mx-auto">
        <div className="relative mb-8">
          <div className="absolute inset-0 bg-gradient-to-r from-primary-500 to-secondary-500 rounded-full blur-3xl opacity-20"></div>
          <ChefHat className="w-32 h-32 mx-auto text-primary-500 relative" />
        </div>
        <h1 className="text-5xl font-bold mb-6 bg-gradient-to-r from-primary-500 to-secondary-500 text-transparent bg-clip-text">
          ברוכים הבאים לספר המתכונים שלי
        </h1>
        <p className="text-gray-600 text-xl mb-12 leading-relaxed">
          המקום המושלם לשמור, לארגן ולשתף את המתכונים האהובים עליכם.
          הצטרפו לקהילת הבישול שלנו וגלו מתכונים חדשים!
        </p>
        <div className="space-y-4">
          <button
            onClick={handleLogin}
            className="btn btn-primary btn-lg text-lg px-12 py-4"
          >
            התחברות עם Google
          </button>
          <p className="text-sm text-gray-500 mt-4">
            ההתחברות מאפשרת לך לשמור מתכונים, לשתף עם הקהילה ולקבל גישה לכל התכונות
          </p>
        </div>
      </div>
    </div>
  );
}

function ProtectedRoute({ children }: { children: React.ReactNode }) {
  const { user } = useAuth();
  
  if (!user) {
    return <Navigate to="/login" replace />;
  }
  
  return <>{children}</>;
}

function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <div className="min-h-screen bg-gray-50 flex flex-col" dir="rtl">
          <Navbar />
          <main className="flex-1 pt-16">
            <Routes>
              <Route path="/login" element={<LoginPage />} />
              <Route path="/" element={
                <ProtectedRoute>
                  <Home />
                </ProtectedRoute>
              } />
              <Route path="/recipes/*" element={
                <ProtectedRoute>
                  <Recipes />
                </ProtectedRoute>
              } />
              <Route path="/categories" element={
                <ProtectedRoute>
                  <Categories />
                </ProtectedRoute>
              } />
              <Route path="/profile" element={
                <ProtectedRoute>
                  <Profile />
                </ProtectedRoute>
              } />
            </Routes>
          </main>
        </div>
      </BrowserRouter>
    </AuthProvider>
  );
}

export default App;
