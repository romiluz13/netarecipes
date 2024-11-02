import React from 'react';
import { Link } from 'react-router-dom';
import { ChefHat, Home } from 'lucide-react';

function NotFound() {
  return (
    <div className="min-h-[calc(100vh-4rem)] flex items-center justify-center p-4">
      <div className="text-center max-w-md">
        <ChefHat className="w-24 h-24 text-primary-500 mx-auto mb-6" />
        <h1 className="text-4xl font-bold mb-4">404</h1>
        <h2 className="text-2xl font-semibold mb-4">העמוד לא נמצא</h2>
        <p className="text-gray-600 mb-8">
          מצטערים, אבל העמוד שחיפשת לא קיים. אולי המתכון הזה עדיין לא הומצא? 😉
        </p>
        <Link to="/" className="btn btn-primary inline-flex items-center gap-2">
          <Home className="w-5 h-5" />
          חזרה לדף הבית
        </Link>
      </div>
    </div>
  );
}

export default NotFound;
