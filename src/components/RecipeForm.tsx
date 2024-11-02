import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { doc, getDoc, setDoc, updateDoc, collection } from 'firebase/firestore';
import { db } from '../firebase';
import { Recipe, validateRecipe } from '../types/recipe';

function RecipeForm() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();
  const [recipe, setRecipe] = useState<Partial<Recipe>>({
    title: '',
    description: '',
    ingredients: [{ item: '', amount: 0, unit: '' }],
    instructions: [''],
    prepTime: 0,
    cookTime: 0,
    servings: 1,
    difficulty: 'קל',
    categories: [],
    isPublic: true,
    likes: 0,
    notes: ''
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (id) {
      const fetchRecipe = async () => {
        try {
          const docRef = doc(db, 'recipes', id);
          const docSnap = await getDoc(docRef);
          if (docSnap.exists()) {
            setRecipe({ id: docSnap.id, ...docSnap.data() } as Recipe);
          } else {
            setError('המתכון לא נמצא');
          }
        } catch (error) {
          console.error('Error fetching recipe:', error);
          setError('אירעה שגיאה בטעינת המתכון');
        }
      };
      fetchRecipe();
    }
  }, [id]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    const errors = validateRecipe(recipe);
    if (errors.length > 0) {
      setError(errors.join('\n'));
      setLoading(false);
      return;
    }

    try {
      if (!user) {
        throw new Error('משתמש לא מחובר');
      }

      const recipeData = {
        ...recipe,
        userId: user.uid,
        updatedAt: new Date(),
        isPublic: recipe.isPublic ?? true,
        likes: recipe.likes || 0,
        createdAt: recipe.createdAt || new Date(),
      };

      if (id) {
        await updateDoc(doc(db, 'recipes', id), recipeData);
        navigate(`/recipe/${id}`);
      } else {
        const newRecipeRef = doc(collection(db, 'recipes'));
        await setDoc(newRecipeRef, {
          ...recipeData,
          createdAt: new Date(),
          likes: 0
        });
        navigate(`/recipe/${newRecipeRef.id}`);
      }
    } catch (error) {
      console.error('Error saving recipe:', error);
      setError(error instanceof Error ? error.message : 'אירעה שגיאה בשמירת המתכון');
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="max-w-2xl mx-auto p-4 space-y-6">
      <h1 className="text-2xl font-bold mb-4">{id ? 'עריכת מתכון' : 'מתכון חדש'}</h1>
      
      {/* שדות הטופס הקיימים */}
      
      {/* הוספת אפשרות פרסום */}
      <div className="card p-4">
        <h3 className="text-lg font-semibold mb-4">הגדרות פרסום</h3>
        <div className="flex items-center gap-2">
          <input
            type="checkbox"
            id="isPublic"
            checked={recipe.isPublic}
            onChange={(e) => setRecipe(prev => ({ ...prev, isPublic: e.target.checked }))}
            className="checkbox"
          />
          <label htmlFor="isPublic" className="flex flex-col">
            <span className="font-medium">פרסם מתכון למשפחה</span>
            <span className="text-sm text-gray-600">
              המתכון יופיע בעמוד הראשי ויהיה זמין לכל בני המשפחה
            </span>
          </label>
        </div>
      </div>

      {error && <div className="text-red-500 p-4 bg-red-50 rounded-lg">{error}</div>}
      
      <div className="flex justify-end gap-4">
        <button 
          type="button" 
          onClick={() => navigate(-1)}
          className="btn btn-secondary"
        >
          ביטול
        </button>
        <button 
          type="submit" 
          className="btn btn-primary" 
          disabled={loading}
        >
          {loading ? 'שומר...' : id ? 'עדכן מתכון' : 'צור מתכון'}
        </button>
      </div>
    </form>
  );
}

export default RecipeForm;
