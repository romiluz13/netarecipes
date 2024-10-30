import React from 'react';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { useAuth0 } from '@auth0/auth0-react';
import { ChefHat, Loader2 } from 'lucide-react';
import Navbar from './components/Navbar';
import Home from './pages/Home';
import Recipes from './pages/Recipes';
import Categories from './pages/Categories';
import Profile from './pages/Profile';

function App() {
  const { isLoading, error, isAuthenticated } = useAuth0();

  if (error) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
        <div className="card p-8 max-w-md w-full text-center animate-enter">
          <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <ChefHat className="w-8 h-8 text-red-500" />
          </div>
          <h1 className="text-2xl font-bold text-gray-900 mb-2">שגיאה בהתחברות</h1>
          <p className="text-gray-600 mb-6">{error.message}</p>
          <button
            onClick={() => window.location.reload()}
            className="btn btn-primary w-full"
          >
            נסה שוב
          </button>
        </div>
      </div>
    );
  }

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="w-12 h-12 animate-spin text-primary-500 mx-auto mb-4" />
          <p className="text-gray-600 animate-pulse">טוען...</p>
        </div>
      </div>
    );
  }

  return (
    <BrowserRouter>
      <div className="min-h-screen bg-gray-50 flex flex-col" dir="rtl">
        <Navbar />
        <main className="flex-1 pt-16">
          {!isAuthenticated ? (
            <div className="min-h-[calc(100vh-4rem)] flex items-center justify-center p-4">
              <div className="text-center max-w-2xl mx-auto animate-enter">
                <div className="relative mb-8">
                  <div className="absolute inset-0 bg-gradient-to-r from-primary-500 to-secondary-500 rounded-full blur-3xl opacity-20"></div>
                  <ChefHat className="w-24 h-24 mx-auto text-primary-500 relative" />
                </div>
                <h1 className="text-4xl font-bold mb-4 bg-gradient-to-r from-primary-500 to-secondary-500 text-transparent bg-clip-text">
                  ברוכים הבאים לספר המתכונים שלי
                </h1>
                <p className="text-gray-600 mb-8 text-lg">
                  המקום המושלם לשמור, לארגן ולשתף את המתכונים האהובים עליכם
                </p>
                <div className="space-y-4">
                  <button
                    onClick={() => useAuth0().loginWithRedirect()}
                    className="btn btn-primary text-lg px-8 py-3"
                  >
                    התחל עכשיו
                  </button>
                  <p className="text-sm text-gray-500">
                    הצטרפו למאות משתמשים שכבר נהנים מהפלטפורמה שלנו
                  </p>
                </div>
              </div>
            </div>
          ) : (
            <div className="page-container">
              <Routes>
                <Route path="/" element={<Home />} />
                <Route path="/recipes/*" element={<Recipes />} />
                <Route path="/categories" element={<Categories />} />
                <Route path="/profile" element={<Profile />} />
              </Routes>
            </div>
          )}
        </main>
      </div>
    </BrowserRouter>
  );
}

export default App;