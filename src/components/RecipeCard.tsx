import { Link } from 'react-router-dom';
import { Clock, Users } from 'lucide-react';

function RecipeCard({ recipe }) {
  return (
    <Link to={`/recipes/${recipe.id}`} className="block">
      <div className="bg-white rounded-xl shadow-sm hover:shadow-md transition-shadow">
        <div className="relative h-48">
          <img
            src={recipe.imageUrl || '/placeholder-recipe.jpg'}
            alt={recipe.title}
            className="w-full h-full object-cover rounded-t-xl"
            loading="lazy"
          />
          {recipe.isPublic && (
            <div className="absolute top-2 right-2 bg-primary-500 text-white px-2 py-1 rounded-full text-xs">
              פורסם למשפחה
            </div>
          )}
        </div>
        
        <div className="p-4">
          <h3 className="text-lg font-semibold mb-2">{recipe.title}</h3>
          <div className="flex items-center gap-4 text-gray-600 text-sm">
            <div className="flex items-center gap-1">
              <Clock className="w-4 h-4" />
              <span>{recipe.prepTime} דקות</span>
            </div>
            <div className="flex items-center gap-1">
              <Users className="w-4 h-4" />
              <span>{recipe.servings} מנות</span>
            </div>
          </div>
        </div>
      </div>
    </Link>
  );
} 