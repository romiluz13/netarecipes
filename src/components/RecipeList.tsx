import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { collection, query, where, getDocs, doc, getDoc } from 'firebase/firestore';
import { db } from '../firebase';
import { Recipe } from '../types/recipe';
import { Clock, Users, ChefHat, Filter, Search } from 'lucide-react';
import { RecipeCardSkeleton } from './Skeleton';

function RecipeList() {
  const { user } = useAuth();
  const [recipes, setRecipes] = useState<Recipe[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [selectedDifficulty, setSelectedDifficulty] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [viewMode, setViewMode] = useState<'all' | 'personal' | 'public'>('all');
  const [authors, setAuthors] = useState<Record<string, any>>({});

  useEffect(() => {
    const fetchRecipes = async () => {
      if (!user?.uid) {
        setLoading(false);
        return;
      }

      try {
        const q = query(
          collection(db, 'recipes'),
          where('or', 'array-contains-any', [
            { userId: user.uid },
            { isPublic: true }
          ])
        );
        
        const [userRecipesQuery, publicRecipesQuery] = await Promise.all([
          getDocs(query(collection(db, 'recipes'), where('userId', '==', user.uid))),
          getDocs(query(collection(db, 'recipes'), where('isPublic', '==', true)))
        ]);

        const recipeMap = new Map();
        
        userRecipesQuery.docs.forEach(doc => {
          recipeMap.set(doc.id, { id: doc.id, ...doc.data() });
        });
        
        publicRecipesQuery.docs.forEach(doc => {
          if (!recipeMap.has(doc.id)) {
            recipeMap.set(doc.id, { id: doc.id, ...doc.data() });
          }
        });

        setRecipes(Array.from(recipeMap.values()) as Recipe[]);
        await fetchAuthors(Array.from(recipeMap.values()) as Recipe[]);
      } catch (error) {
        console.error('Error fetching recipes:', error);
        alert('אירעה שגיאה בטעינת המתכונים. אנא נסה שוב.');
      } finally {
        setLoading(false);
      }
    };

    fetchRecipes();
  }, [user?.uid]);

  const filteredRecipes = recipes.filter(recipe => {
    const categoryMatch = selectedCategory === 'all' || recipe.categories.includes(selectedCategory);
    const difficultyMatch = selectedDifficulty === 'all' || recipe.difficulty === selectedDifficulty;
    const viewModeMatch = viewMode === 'all' || 
      (viewMode === 'personal' && recipe.userId === user?.uid) ||
      (viewMode === 'public' && recipe.isPublic);
    const searchMatch = searchQuery === '' || 
      recipe.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      recipe.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
      recipe.categories.some(cat => cat.toLowerCase().includes(searchQuery.toLowerCase())) ||
      recipe.ingredients.some(ing => ing.item.toLowerCase().includes(searchQuery.toLowerCase()));
    
    return categoryMatch && difficultyMatch && viewModeMatch && searchMatch;
  });

  const categories = Array.from(new Set(recipes.flatMap(recipe => recipe.categories)));
  const difficulties = ['קל', 'בינוני', 'מאתגר'];

  const fetchAuthors = async (recipes: Recipe[]) => {
    const uniqueAuthorIds = [...new Set(recipes.map(recipe => recipe.userId))];
    const authorsData: Record<string, any> = {};
    
    await Promise.all(
      uniqueAuthorIds.map(async (authorId) => {
        try {
          const authorRef = doc(db, 'users', authorId);
          const authorSnap = await getDoc(authorRef);
          if (authorSnap.exists()) {
            authorsData[authorId] = authorSnap.data();
          }
        } catch (error) {
          console.error(`Error fetching author ${authorId}:`, error);
        }
      })
    );
    
    setAuthors(authorsData);
  };

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          <h1 className="text-3xl font-bold">המתכונים שלי</h1>
          <Link to="/recipes/new" className="btn btn-primary">
            מתכון חדש
          </Link>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {[1, 2, 3, 4, 5, 6].map((i) => (
            <RecipeCardSkeleton key={i} />
          ))}
        </div>
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

      <div className="bg-white p-6 rounded-lg shadow-sm space-y-4">
        <div className="flex items-center gap-4 pb-4 border-b border-gray-100">
          <span className="text-gray-700 font-medium">הצג:</span>
          <select
            value={viewMode}
            onChange={(e) => setViewMode(e.target.value as 'all' | 'personal' | 'public')}
            className="input max-w-xs"
          >
            <option value="all">כל המתכונים</option>
            <option value="personal">המתכונים שלי</option>
            <option value="public">מתכוני הקהילה</option>
          </select>
        </div>

        <div className="relative">
          <Search className="absolute right-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="חיפוש לפי שם, תיאור, קטגוריה או מצרכים..."
            className="input w-full pr-12"
          />
        </div>

        <div className="flex flex-wrap items-center gap-4 pt-4 border-t border-gray-100">
          <div className="flex items-center gap-2">
            <Filter className="w-5 h-5 text-gray-500" />
            <span className="text-gray-700 font-medium">סינון לפי:</span>
          </div>
          
          <div className="flex flex-wrap gap-4">
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
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredRecipes.map(recipe => (
          <Link
            key={recipe.id}
            to={`/recipes/${recipe.id}`}
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
              <div className="flex items-center gap-2 mb-2">
                {authors[recipe.userId]?.photoURL && (
                  <img
                    src={authors[recipe.userId].photoURL}
                    alt={authors[recipe.userId].displayName}
                    className="w-6 h-6 rounded-full"
                  />
                )}
                <span className="text-sm text-gray-600">
                  {authors[recipe.userId]?.displayName || 'משתמש לא ידוע'}
                </span>
              </div>
              <h3 className="text-lg font-semibold mb-2">{recipe.title}</h3>
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
            {searchQuery
              ? 'לא נמצאו מתכונים התואמים את החיפוש'
              : 'לא נמצאו מתכונים שתואמים את הסינון הנוכחי'}
          </p>
        </div>
      )}
    </div>
  );
}

export default RecipeList;
