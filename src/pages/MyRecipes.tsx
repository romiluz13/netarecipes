import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { collection, query, where, getDocs } from 'firebase/firestore';
import { db } from '../firebase';
import { Recipe } from '../types/recipe';
import { Edit, Trash2, Clock, Users, ChefHat } from 'lucide-react';
import { RecipeCardSkeleton } from '../components/Skeleton';

function MyRecipes() {
  const { user } = useAuth();
  const [recipes, setRecipes] = useState<Recipe[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchMyRecipes = async () => {
      if (!user?.uid) {
        setLoading(false);
        return;
      }

      try {
        const q = query(
          collection(db, 'recipes'),
          where('userId', '==', user.uid)
        );
        
        const querySnapshot = await getDocs(q);
        const recipeData = querySnapshot.docs.map(doc => ({
          id: doc.id,
          ...doc.data()
        })) as Recipe[];
        
        setRecipes(recipeData);
      } catch (error) {
        console.error('Error fetching recipes:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchMyRecipes();
  }, [user?.uid]);

  if (loading) {
    return (
      <div className="space-y-6 p-4 md:p-6">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          <h1 className="text-2xl md:text-3xl font-bold">המתכונים שלי</h1>
          <Link to="/recipes/new" className="btn btn-primary w-full sm:w-auto">
            מתכון חדש
          </Link>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 md:gap-6">
          {[1, 2, 3].map((i) => (
            <RecipeCardSkeleton key={i} />
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6 p-4 md:p-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <h1 className="text-2xl md:text-3xl font-bold">המתכונים שלי</h1>
        <Link to="/recipes/new" className="btn btn-primary w-full sm:w-auto">
          מתכון חדש
        </Link>
      </div>

      {recipes.length === 0 ? (
        <div className="text-center py-12">
          <ChefHat className="w-16 h-16 text-gray-400 mx-auto mb-4" />
          <h3 className="text-xl font-semibold text-gray-700 mb-2">אין לך עדיין מתכונים</h3>
          <p className="text-gray-500 mb-4">
            התחל ליצור ולשתף את המתכונים האהובים עליך
          </p>
          <Link to="/recipes/new" className="btn btn-primary">
            צור מתכון חדש
          </Link>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 md:gap-6">
          {recipes.map(recipe => (
            <div
              key={recipe.id}
              className="bg-white rounded-xl shadow-sm hover:shadow-md transition-shadow"
            >
              <div className="relative h-48">
                <img
                  src={recipe.imageUrl || '/placeholder-recipe.jpg'}
                  alt={recipe.title}
                  className="w-full h-full object-cover rounded-t-xl"
                />
                {recipe.isPublic && (
                  <div className="absolute top-2 right-2 bg-primary-500 text-white px-2 py-1 rounded-full text-xs">
                    פורסם לקהילה
                  </div>
                )}
              </div>
              
              <div className="p-4">
                <h3 className="text-lg font-semibold mb-2">{recipe.title}</h3>
                <div className="flex items-center gap-4 text-gray-600 text-sm mb-4">
                  <div className="flex items-center gap-1">
                    <Clock className="w-4 h-4" />
                    <span>{recipe.prepTime + recipe.cookTime} דקות</span>
                  </div>
                  <div className="flex items-center gap-1">
                    <Users className="w-4 h-4" />
                    <span>{recipe.servings} מנות</span>
                  </div>
                </div>
                
                <div className="flex justify-between items-center">
                  <Link
                    to={`/recipes/${recipe.id}`}
                    className="btn btn-secondary btn-sm"
                  >
                    צפה במתכון
                  </Link>
                  <div className="flex gap-2">
                    <Link
                      to={`/recipes/edit/${recipe.id}`}
                      className="btn btn-ghost btn-sm"
                    >
                      <Edit className="w-4 h-4" />
                    </Link>
                    <button className="btn btn-ghost btn-sm text-error">
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

export default MyRecipes;
