import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { collection, query, getDocs } from 'firebase/firestore';
import { db } from '../firebase';
import { Recipe } from '../types/recipe';
import { ChefHat, ArrowRight } from 'lucide-react';

interface CategoryStats {
  name: string;
  count: number;
  recipes: Recipe[];
}

function Categories() {
  const [loading, setLoading] = useState(true);
  const [categories, setCategories] = useState<CategoryStats[]>([]);
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);

  useEffect(() => {
    const fetchCategories = async () => {
      try {
        const recipesQuery = query(collection(db, 'recipes'));
        const querySnapshot = await getDocs(recipesQuery);
        
        const categoryMap = new Map<string, CategoryStats>();
        
        querySnapshot.docs.forEach(doc => {
          const recipe = { id: doc.id, ...doc.data() } as Recipe;
          if (recipe.isPublic) {
            recipe.categories.forEach(category => {
              if (!categoryMap.has(category)) {
                categoryMap.set(category, {
                  name: category,
                  count: 0,
                  recipes: []
                });
              }
              const stats = categoryMap.get(category)!;
              stats.count++;
              stats.recipes.push(recipe);
            });
          }
        });

        setCategories(Array.from(categoryMap.values())
          .sort((a, b) => b.count - a.count));
      } catch (error) {
        console.error('Error fetching categories:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchCategories();
  }, []);

  if (loading) {
    return (
      <div className="max-w-7xl mx-auto p-4 md:p-6">
        <div className="animate-pulse">
          <div className="h-8 bg-gray-200 rounded w-48 mb-6"></div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {[1, 2, 3, 4, 5, 6].map(i => (
              <div key={i} className="h-32 bg-gray-200 rounded"></div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  if (categories.length === 0) {
    return (
      <div className="max-w-7xl mx-auto p-4 md:p-6">
        <div className="text-center py-12">
          <ChefHat className="w-16 h-16 text-gray-400 mx-auto mb-4" />
          <h3 className="text-xl font-semibold text-gray-700 mb-2">אין קטגוריות</h3>
          <p className="text-gray-500">
            עדיין אין מתכונים בקהילה. היה הראשון להוסיף מתכון!
          </p>
          <Link to="/recipes/new" className="btn btn-primary mt-4">
            הוסף מתכון חדש
          </Link>
        </div>
      </div>
    );
  }

  const selectedCategoryData = selectedCategory 
    ? categories.find(cat => cat.name === selectedCategory)
    : null;

  return (
    <div className="max-w-7xl mx-auto p-4 md:p-6 space-y-6">
      {selectedCategory ? (
        <>
          <div className="flex items-center gap-2 mb-6">
            <button
              onClick={() => setSelectedCategory(null)}
              className="btn btn-ghost"
            >
              <ArrowRight className="w-5 h-5" />
              חזרה לכל הקטגוריות
            </button>
          </div>
          <div className="flex items-center justify-between mb-6">
            <h1 className="text-2xl md:text-3xl font-bold">
              {selectedCategory}
              <span className="text-gray-500 text-lg font-normal mr-2">
                ({selectedCategoryData?.count} מתכונים)
              </span>
            </h1>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {selectedCategoryData?.recipes.map(recipe => (
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
                    loading="lazy"
                  />
                </div>
                <div className="p-4">
                  <h3 className="text-lg font-semibold mb-2">{recipe.title}</h3>
                  <p className="text-gray-600 line-clamp-2">{recipe.description}</p>
                </div>
              </Link>
            ))}
          </div>
        </>
      ) : (
        <>
          <h1 className="text-2xl md:text-3xl font-bold mb-6">קטגוריות</h1>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {categories.map(category => (
              <button
                key={category.name}
                onClick={() => setSelectedCategory(category.name)}
                className="bg-white rounded-xl shadow-sm hover:shadow-md transition-all p-6 text-right"
              >
                <h3 className="text-xl font-semibold mb-2">{category.name}</h3>
                <p className="text-gray-500">
                  {category.count} {category.count === 1 ? 'מתכון' : 'מתכונים'}
                </p>
              </button>
            ))}
          </div>
        </>
      )}
    </div>
  );
}

export default Categories;
