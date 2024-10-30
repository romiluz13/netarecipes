import React, { useState, useEffect } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { useAuth0 } from '@auth0/auth0-react';
import { ChefHat, Book, Grid, User, Search, Plus, Menu, X } from 'lucide-react';

function Navbar() {
  const { loginWithRedirect, logout, isAuthenticated, user } = useAuth0();
  const location = useLocation();
  const [isScrolled, setIsScrolled] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 10);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const isActive = (path: string) => location.pathname === path;

  const navLinks = [
    { path: '/recipes', icon: Book, label: 'מתכונים' },
    { path: '/categories', icon: Grid, label: 'קטגוריות' },
    { path: '/profile', icon: User, label: 'פרופיל' },
  ];

  return (
    <nav className={`fixed top-0 left-0 right-0 z-50 transition-all duration-200 ${
      isScrolled ? 'glass-effect shadow-md' : 'bg-transparent'
    }`}>
      <div className="container mx-auto px-4">
        <div className="flex items-center justify-between h-16">
          <Link to="/" className="flex items-center space-x-2 hover:opacity-80 transition-opacity">
            <ChefHat className="w-8 h-8 text-primary-500" />
            <span className="text-xl font-bold bg-gradient-to-r from-primary-500 to-primary-700 text-transparent bg-clip-text">
              המתכונים שלי
            </span>
          </Link>

          {/* Desktop Navigation */}
          <div className="hidden md:flex items-center space-x-4">
            {isAuthenticated && (
              <>
                <div className="relative ml-4">
                  <input
                    type="text"
                    placeholder="חיפוש מתכונים..."
                    className="w-64 px-4 py-2 pr-10 rounded-full bg-gray-100 focus:bg-white focus:ring-2 focus:ring-primary-500 transition-all"
                  />
                  <Search className="w-5 h-5 text-gray-400 absolute right-3 top-1/2 transform -translate-y-1/2" />
                </div>
                
                {navLinks.map(({ path, icon: Icon, label }) => (
                  <Link
                    key={path}
                    to={path}
                    className={`flex items-center space-x-2 px-4 py-2 rounded-lg transition-all ${
                      isActive(path)
                        ? 'bg-primary-500 text-white shadow-md'
                        : 'text-gray-700 hover:bg-gray-100'
                    }`}
                  >
                    <Icon className="w-5 h-5" />
                    <span>{label}</span>
                  </Link>
                ))}

                <Link
                  to="/recipes/new"
                  className="btn btn-primary flex items-center space-x-2"
                >
                  <Plus className="w-5 h-5" />
                  <span>מתכון חדש</span>
                </Link>

                <button
                  onClick={() => logout({ logoutParams: { returnTo: window.location.origin } })}
                  className="btn btn-secondary text-red-500 hover:bg-red-50"
                >
                  התנתק
                </button>
              </>
            )}

            {!isAuthenticated && (
              <button
                onClick={() => loginWithRedirect()}
                className="btn btn-primary"
              >
                התחבר
              </button>
            )}
          </div>

          {/* Mobile Menu Button */}
          <button
            onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
            className="md:hidden p-2 rounded-lg hover:bg-gray-100"
          >
            {isMobileMenuOpen ? (
              <X className="w-6 h-6 text-gray-600" />
            ) : (
              <Menu className="w-6 h-6 text-gray-600" />
            )}
          </button>
        </div>
      </div>

      {/* Mobile Menu */}
      {isMobileMenuOpen && (
        <div className="md:hidden glass-effect border-t animate-slide-down">
          <div className="px-4 py-2 space-y-2">
            {isAuthenticated && (
              <>
                <div className="relative">
                  <input
                    type="text"
                    placeholder="חיפוש מתכונים..."
                    className="w-full px-4 py-2 pr-10 rounded-lg bg-gray-100 focus:bg-white focus:ring-2 focus:ring-primary-500 transition-all"
                  />
                  <Search className="w-5 h-5 text-gray-400 absolute right-3 top-1/2 transform -translate-y-1/2" />
                </div>

                {navLinks.map(({ path, icon: Icon, label }) => (
                  <Link
                    key={path}
                    to={path}
                    className={`flex items-center space-x-2 px-4 py-2 rounded-lg transition-all ${
                      isActive(path)
                        ? 'bg-primary-500 text-white'
                        : 'text-gray-700 hover:bg-gray-100'
                    }`}
                    onClick={() => setIsMobileMenuOpen(false)}
                  >
                    <Icon className="w-5 h-5" />
                    <span>{label}</span>
                  </Link>
                ))}

                <Link
                  to="/recipes/new"
                  className="btn btn-primary flex items-center space-x-2 w-full justify-center"
                  onClick={() => setIsMobileMenuOpen(false)}
                >
                  <Plus className="w-5 h-5" />
                  <span>מתכון חדש</span>
                </Link>

                <button
                  onClick={() => {
                    setIsMobileMenuOpen(false);
                    logout({ logoutParams: { returnTo: window.location.origin } });
                  }}
                  className="btn btn-secondary text-red-500 hover:bg-red-50 w-full"
                >
                  התנתק
                </button>
              </>
            )}

            {!isAuthenticated && (
              <button
                onClick={() => {
                  setIsMobileMenuOpen(false);
                  loginWithRedirect();
                }}
                className="btn btn-primary w-full"
              >
                התחבר
              </button>
            )}
          </div>
        </div>
      )}
    </nav>
  );
}

export default Navbar;