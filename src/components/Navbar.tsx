import React from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { ChefHat } from 'lucide-react';

function Navbar() {
  const { user, signInWithGoogle, logout } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  const isActive = (path: string) => location.pathname === path;

  const handleLogin = async () => {
    try {
      await signInWithGoogle();
      navigate('/');
    } catch (error) {
      console.error('Error signing in:', error);
    }
  };

  const handleLogout = async () => {
    try {
      await logout();
      navigate('/');
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
              <img
                src="/assets/chef-hat.svg"
                alt="Logo"
                className="w-8 h-8 text-primary-500"
                onError={(e) => {
                  const target = e.target as HTMLImageElement;
                  target.style.display = 'none';
                  const fallback = document.createElement('span');
                  fallback.innerHTML = '<ChefHat className="w-8 h-8 text-primary-500" />';
                  target.parentNode?.appendChild(fallback);
                }}
              />
              <span className="font-bold text-xl">מתכוני המשפחה</span>
            </Link>

            {user && (
              <div className="hidden md:flex items-center gap-6">
                <Link 
                  to="/" 
                  className={`nav-link ${isActive('/') ? 'text-primary-600 font-medium' : ''}`}
                >
                  מתכוני המשפחה
                </Link>
                <Link 
                  to="/profile" 
                  className={`nav-link ${isActive('/profile') ? 'text-primary-600 font-medium' : ''}`}
                >
                  המתכונים שלי
                </Link>
                <Link 
                  to="/recipe/new" 
                  className="btn btn-primary btn-sm"
                >
                  מתכון חדש
                </Link>
              </div>
            )}
          </div>

          <div className="flex items-center gap-4">
            {user ? (
              <div className="flex items-center gap-4">
                <Link to="/profile" className="flex items-center gap-2">
                  <img
                    src={user.photoURL || '/assets/placeholder-avatar.svg'}
                    alt={user.displayName || 'תמונת פרופיל'}
                    className="w-8 h-8 rounded-full border border-gray-200"
                    onError={(e) => {
                      const target = e.target as HTMLImageElement;
                      target.src = '/assets/placeholder-avatar.svg';
                    }}
                  />
                  <span className="hidden md:inline text-sm text-gray-700">
                    {user.displayName}
                  </span>
                </Link>
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
