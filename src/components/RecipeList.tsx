import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useAuth0 } from '@auth0/auth0-react';
import { collection, query, where, getDocs } from 'firebase/firestore';
import { db } from '../firebase';
import { Recipe } from '../types/recipe';
import { Clock, Users, ChefHat, Filter } from 'lucide-react';

function RecipeList() {
  const { user } = useAuth0();
  const [recipes, setRecipes] = useState<Recipe[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [selectedDifficulty, setSelectedDifficulty] = useState<string>('all');

  useEffect(() => {
    const fetchRecipes = async () => {
      try {
        const q = query(
          collection(db, 'recipes'),
          where('userId', '==', user?.sub)
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

    if (user?.sub) {
      fetchRecipes();
    }
  }, [user?.sub]);

  const filteredRecipes = recipes.filter(recipe => {
    const categoryMatch = selectedCategory === 'all' || recipe.categories.includes(selectedCategory);
    const difficultyMatch = selectedDifficulty === 'all' || recipe.difficulty === selectedDifficulty;
    return categoryMatch && difficultyMatch;
  });

  const categories = Array.from(new Set(recipes.flatMap(recipe => recipe.categories)));
  const difficulties = ['קל', 'בינוני', 'מאתגר'];

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-500"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <h1 className="text-3xl font-bold">המתכונים שלי</h1>
        <Link to="/recipes/new" className="btn btn-primary">
          מתכון חדש
        </Link>
      </div>

      <div className="flex flex-wrap gap-4 bg-white p-4 rounded-lg shadow-sm">
        <div className="flex items-center gap-2">
          <Filter className="w-5 h-5 text-gray-500" />
          <span className="text-gray-700">סינון לפי:</span>
        </div>
        
        <select
          value={selectedCategory}
          onChange={(e) => setSelectedCategory(e.target.value)}
          className="input max-w-xs"
        >
          <option value="all">כל הקטגוריות</option>
          {categories.map(category => (
            <option key={category} value={category}>{category}</option>
          ))}
        </select>

        <select
          value={selectedDifficulty}
          onChange={(e) => setSelectedDifficulty(e.target.value)}
          className="input max-w-xs"
        >
          <option value="all">כל רמות הקושי</option>
          {difficulties.map(difficulty => (
            <option key={difficulty} value={difficulty}>{difficulty}</option>
          ))}
        </select>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredRecipes.map(recipe => (
          <Link
            key={recipe.id}
            to={`/recipes/${recipe.id}`}
            className="card group"
          >
            <div className="aspect-video relative overflow-hidden">
              <img
                src={recipe.imageUrl}
                alt={recipe.title}
                className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent"></div>
              <div className="absolute bottom-4 right-4 left-4">
                <h3 className="text-white text-xl font-bold mb-2">{recipe.title}</h3>
                <div className="flex items-center gap-4 text-white/90 text-sm">
                  <div className="flex items-center gap-1">
                    <Clock className="w-4 h-4" />
                    <span>{recipe.prepTime + recipe.cookTime} דקות</span>
                  </div>
                  <div className="flex items-center gap-1">
                    <Users className="w-4 h-4" />
                    <span>{recipe.servings} מנות</span>
                  </div>
                  <div className="flex items-center gap-1">
                    <ChefHat className="w-4 h-4" />
                    <span>{recipe.difficulty}</span>
                  </div>
                </div>
              </div>
            </div>
            <div className="p-4">
              <p className="text-gray-600 line-clamp-2">{recipe.description}</p>
              <div className="mt-4 flex flex-wrap gap-2">
                {recipe.categories.slice(0, 3).map(category => (
                  <span
                    key={category}
                    className="px-2 py-1 bg-primary-50 text-primary-700 rounded-full text-sm"
                  >
                    {category}
                  </span>
                ))}
              </div>
            </div>
          </Link>
        ))}
      </div>

      {filteredRecipes.length === 0 && (
        <div className="text-center py-12">
          <ChefHat className="w-16 h-16 text-gray-400 mx-auto mb-4" />
          <h3 className="text-xl font-semibold text-gray-700 mb-2">אין מתכונים</h3>
          <p className="text-gray-500">
            לא נמצאו מתכונים שתואמים את הסינון הנוכחי
          </p>
        </div>
      )}
    </div>
  );
}

export default RecipeList;