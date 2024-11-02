import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { collection, query, getDocs, doc, getDoc, orderBy } from 'firebase/firestore';
import { db } from '../firebase';
import { Recipe } from '../types/Recipe';
import { Clock, Users, ChefHat, Filter, Search } from 'lucide-react';
import { RecipeCardSkeleton } from './Skeleton';

function RecipeList() {
  const { user } = useAuth();
  const [recipes, setRecipes] = useState<Recipe[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [selectedDifficulty, setSelectedDifficulty] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [authors, setAuthors] = useState<Record<string, any>>({});

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

  useEffect(() => {
    const fetchRecipes = async () => {
      setLoading(true);
      try {
        const q = query(
          collection(db, 'recipes'),
          orderBy('createdAt', 'desc')
        );
        
        const querySnapshot = await getDocs(q);
        const recipeData = querySnapshot.docs
          .map(doc => ({
            id: doc.id,
            ...doc.data(),
            createdAt: doc.data().createdAt?.toDate(),
            updatedAt: doc.data().updatedAt?.toDate()
          })) as Recipe[];
        
        setRecipes(recipeData);
        await fetchAuthors(recipeData);
      } catch (error) {
        console.error('Error fetching recipes:', error);
        setError('אירעה שגיאה בטעינת המתכונים');
      } finally {
        setLoading(false);
      }
    };

    fetchRecipes();
  }, []);

  const filteredRecipes = recipes.filter((recipe: Recipe) => {
    const categoryMatch = selectedCategory === 'all' || recipe.categories.includes(selectedCategory);
    const difficultyMatch = selectedDifficulty === 'all' || recipe.difficulty === selectedDifficulty;
    const searchMatch = searchQuery === '' || 
      recipe.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      recipe.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
      recipe.categories.some(cat => cat.toLowerCase().includes(searchQuery.toLowerCase())) ||
      recipe.ingredients.some(ing => ing.item.toLowerCase().includes(searchQuery.toLowerCase()));
    const publicOrOwned = recipe.isPublic || (user && recipe.userId === user.uid);
    
    return categoryMatch && difficultyMatch && searchMatch && publicOrOwned;
  });

  if (loading) {
    return (
      <div className="space-y-6 p-4 md:p-6">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 md:gap-6">
          {[1, 2, 3, 4, 5, 6].map((i) => (
            <RecipeCardSkeleton key={i} />
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6 p-4 md:p-6">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-6">
        <h1 className="text-2xl md:text-3xl font-bold">מתכוני המשפחה</h1>
        {user && (
          <Link to="/recipe/new" className="btn btn-primary w-full md:w-auto">
            מתכון חדש
          </Link>
        )}
      </div>

      <div className="bg-white rounded-lg shadow-sm p-4 md:p-6 space-y-4">
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

        <div className="flex flex-col md:flex-row items-start md:items-center gap-4">
          <div className="flex items-center gap-2 whitespace-nowrap">
            <Filter className="w-5 h-5 text-gray-500" />
            <span className="text-gray-700 font-medium">סינון לפי:</span>
          </div>
          
          <div className="flex flex-wrap md:flex-nowrap gap-4 w-full">
            <select
              value={selectedCategory}
              onChange={(e) => setSelectedCategory(e.target.value)}
              className="input flex-1"
            >
              <option value="all">כל הקטגוריות</option>
              {Array.from(new Set(recipes.flatMap(recipe => recipe.categories))).map(category => (
                <option key={category} value={category}>{category}</option>
              ))}
            </select>

            <select
              value={selectedDifficulty}
              onChange={(e) => setSelectedDifficulty(e.target.value)}
              className="input flex-1"
            >
              <option value="all">כל רמות הקושי</option>
              {['קל', 'בינוני', 'מאתגר'].map(difficulty => (
                <option key={difficulty} value={difficulty}>{difficulty}</option>
              ))}
            </select>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 md:gap-6">
        {filteredRecipes.map(recipe => (
          <Link
            key={recipe.id}
            to={`/recipe/${recipe.id}`}
            className="bg-white rounded-xl shadow-sm hover:shadow-md transition-shadow"
          >
            <div className="relative h-48">
              <img
                src={recipe.imageUrl || '/assets/placeholder-recipe.svg'}
                alt={recipe.title}
                className="w-full h-full object-cover rounded-t-xl"
                loading="lazy"
                onError={(e) => {
                  const target = e.target as HTMLImageElement;
                  target.src = '/assets/placeholder-recipe.svg';
                }}
              />
            </div>
            <div className="p-4">
              <div className="flex items-center gap-2 mb-2">
                {authors[recipe.userId]?.photoURL && (
                  <img
                    src={authors[recipe.userId].photoURL}
                    alt={authors[recipe.userId].displayName}
                    className="w-6 h-6 rounded-full"
                    loading="lazy"
                    onError={(e) => {
                      const target = e.target as HTMLImageElement;
                      target.src = '/assets/placeholder-avatar.svg';
                    }}
                  />
                )}
                <span className="text-sm text-gray-600">
                  {authors[recipe.userId]?.displayName || 'משתמש לא ידוע'}
                </span>
              </div>
              <h3 className="text-lg font-semibold mb-2">{recipe.title}</h3>
              <div className="flex flex-wrap items-center gap-4 text-gray-600 text-sm">
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
              <p className="text-gray-600 line-clamp-2 mt-2">{recipe.description}</p>
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
