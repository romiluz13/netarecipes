import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useAuth0 } from '@auth0/auth0-react';
import { doc, getDoc, deleteDoc } from 'firebase/firestore';
import { db } from '../firebase';
import { Recipe } from '../types/recipe';
import { Clock, Users, ChefHat, Edit, Trash2, Heart, Share2, Loader2 } from 'lucide-react';

function RecipeDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth0();
  const [recipe, setRecipe] = useState<Recipe | null>(null);
  const [loading, setLoading] = useState(true);
  const [deleting, setDeleting] = useState(false);

  useEffect(() => {
    const fetchRecipe = async () => {
      if (!id) return;
      
      try {
        const docRef = doc(db, 'recipes', id);
        const docSnap = await getDoc(docRef);
        
        if (docSnap.exists()) {
          setRecipe({ id: docSnap.id, ...docSnap.data() } as Recipe);
        } else {
          navigate('/recipes');
        }
      } catch (error) {
        console.error('Error fetching recipe:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchRecipe();
  }, [id, navigate]);

  const handleDelete = async () => {
    if (!window.confirm('האם אתה בטוח שברצונך למחוק מתכון זה?')) return;
    
    setDeleting(true);
    try {
      await deleteDoc(doc(db, 'recipes', id!));
      navigate('/recipes');
    } catch (error) {
      console.error('Error deleting recipe:', error);
      setDeleting(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <Loader2 className="w-12 h-12 animate-spin text-primary-500" />
      </div>
    );
  }

  if (!recipe) return null;

  return (
    <div className="max-w-4xl mx-auto space-y-8">
      <div className="relative h-[400px] rounded-xl overflow-hidden">
        <img
          src={recipe.imageUrl}
          alt={recipe.title}
          className="w-full h-full object-cover"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-black/20 to-transparent"></div>
        <div className="absolute bottom-0 right-0 left-0 p-8">
          <div className="flex justify-between items-end">
            <div>
              <h1 className="text-4xl font-bold text-white mb-4">{recipe.title}</h1>
              <div className="flex items-center gap-6 text-white/90">
                <div className="flex items-center gap-2">
                  <Clock className="w-5 h-5" />
                  <span>{recipe.prepTime + recipe.cookTime} דקות</span>
                </div>
                <div className="flex items-center gap-2">
                  <Users className="w-5 h-5" />
                  <span>{recipe.servings} מנות</span>
                </div>
                <div className="flex items-center gap-2">
                  <ChefHat className="w-5 h-5" />
                  <span>{recipe.difficulty}</span>
                </div>
              </div>
            </div>
            {recipe.userId === user?.sub && (
              <div className="flex gap-2">
                <button
                  onClick={() => navigate(`/recipes/${id}/edit`)}
                  className="btn btn-secondary"
                >
                  <Edit className="w-5 h-5" />
                </button>
                <button
                  onClick={handleDelete}
                  className="btn btn-secondary text-red-500"
                  disabled={deleting}
                >
                  {deleting ? (
                    <Loader2 className="w-5 h-5 animate-spin" />
                  ) : (
                    <Trash2 className="w-5 h-5" />
                  )}
                </button>
              </div>
            )}
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2 space-y-8">
          <div className="card p-6">
            <h2 className="text-2xl font-bold mb-4">תיאור</h2>
            <p className="text-gray-700 whitespace-pre-line">{recipe.description}</p>
          </div>

          <div className="card p-6">
            <h2 className="text-2xl font-bold mb-6">הוראות הכנה</h2>
            <div className="space-y-6">
              {recipe.instructions.map((instruction, index) => (
                <div key={index} className="flex gap-4">
                  <span className="w-8 h-8 rounded-full bg-primary-50 text-primary-600 flex items-center justify-center font-medium flex-shrink-0">
                    {index + 1}
                  </span>
                  <p className="text-gray-700">{instruction}</p>
                </div>
              ))}
            </div>
          </div>

          {recipe.notes && (
            <div className="card p-6">
              <h2 className="text-2xl font-bold mb-4">הערות נוספות</h2>
              <p className="text-gray-700 whitespace-pre-line">{recipe.notes}</p>
            </div>
          )}
        </div>

        <div className="space-y-8">
          <div className="card p-6">
            <h2 className="text-2xl font-bold mb-6">מצרכים</h2>
            <ul className="space-y-4">
              {recipe.ingredients.map((ingredient, index) => (
                <li key={index} className="flex justify-between items-center">
                  <span className="text-gray-700">{ingredient.item}</span>
                  <span className="text-gray-500">
                    {ingredient.amount} {ingredient.unit}
                  </span>
                </li>
              ))}
            </ul>
          </div>

          <div className="card p-6">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-2xl font-bold">קטגוריות</h2>
            </div>
            <div className="flex flex-wrap gap-2">
              {recipe.categories.map(category => (
                <span
                  key={category}
                  className="px-3 py-1 bg-primary-50 text-primary-700 rounded-full text-sm"
                >
                  {category}
                </span>
              ))}
            </div>
          </div>

          <div className="flex gap-4">
            <button className="btn btn-secondary flex-1">
              <Heart className="w-5 h-5 mr-2" />
              {recipe.likes} לייקים
            </button>
            <button className="btn btn-secondary flex-1">
              <Share2 className="w-5 h-5 mr-2" />
              שתף
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

export default RecipeDetail;