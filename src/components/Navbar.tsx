import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { ChefHat, Menu } from 'lucide-react';

function Navbar() {
  const { user, signInWithGoogle, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogin = async () => {
    try {
      await signInWithGoogle();
      navigate('/recipes'); // ניווט לעמוד המתכונים אחרי התחברות מוצלחת
    } catch (error) {
      console.error('Error signing in:', error);
    }
  };

  const handleLogout = async () => {
    try {
      await logout();
      navigate('/login'); // ניווט לעמוד ההתחברות אחרי התנתקות
    } catch (error) {
      console.error('Error logging out:', error);
    }
  };

  return (
    <nav className="fixed top-0 right-0 left-0 bg-white shadow-sm z-50">
      <div className="max-w-7xl mx-auto px-4">
        <div className="flex justify-between items-center h-16">
          <div className="flex items-center gap-8">
            <Link to="/" className="flex items-center gap-2">
              <ChefHat className="w-8 h-8 text-primary-500" />
              <span className="font-bold text-xl">המתכונים שלי</span>
            </Link>
            
            {user && (
              <div className="hidden md:flex items-center gap-6">
                <Link to="/recipes" className="nav-link">מתכונים</Link>
                <Link to="/categories" className="nav-link">קטגוריות</Link>
              </div>
            )}
          </div>

          <div className="flex items-center gap-4">
            {user ? (
              <div className="flex items-center gap-4">
                <img
                  src={user.photoURL || ''}
                  alt={user.displayName || 'תמונת פרופיל'}
                  className="w-8 h-8 rounded-full"
                />
                <button onClick={handleLogout} className="btn btn-ghost">
                  התנתק
                </button>
              </div>
            ) : (
              <button onClick={handleLogin} className="btn btn-primary">
                התחבר עם Google
              </button>
            )}
          </div>
        </div>
      </div>
    </nav>
  );
}

export default Navbar;