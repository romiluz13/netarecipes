import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { doc, getDoc, setDoc, updateDoc, collection, serverTimestamp, addDoc } from 'firebase/firestore';
import { ref, uploadBytes, getDownloadURL } from 'firebase/storage';
import { db, storage } from '../firebase';
import { Recipe, validateRecipe } from '../types/Recipe';
import { Loader2, Plus, Trash2, X } from 'lucide-react';

function RecipeForm() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { user } = useAuth();
  const [recipe, setRecipe] = useState<Partial<Recipe>>({
    title: '',
    description: '',
    ingredients: [{ item: '', amount: '', unit: '' }],
    instructions: [''],
    prepTime: '',
    cookTime: '',
    servings: '',
    difficulty: 'קל',
    categories: [],
    isPublic: true,
    likes: 0,
    notes: ''
  });
  const [loading, setLoading] = useState(false);
  const [fetchingRecipe, setFetchingRecipe] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [newCategory, setNewCategory] = useState('');

  useEffect(() => {
    if (id) {
      setFetchingRecipe(true);
      const fetchRecipe = async () => {
        try {
          const docRef = doc(db, 'recipes', id);
          const docSnap = await getDoc(docRef);
          if (docSnap.exists()) {
            const recipeData = { id: docSnap.id, ...docSnap.data() } as Recipe;
            setRecipe(recipeData);
            setImagePreview(recipeData.imageUrl || null);
          } else {
            setError('המתכון לא נמצא');
            navigate('/');
          }
        } catch (error) {
          console.error('Error fetching recipe:', error);
          setError('אירעה שגיאה בטעינת המתכון');
        } finally {
          setFetchingRecipe(false);
        }
      };
      fetchRecipe();
    }
  }, [id, navigate]);

  const handleIngredientChange = (index: number, field: keyof Recipe['ingredients'][0], value: string) => {
    const newIngredients = [...(recipe.ingredients || [])];
    newIngredients[index] = { ...newIngredients[index], [field]: value };
    setRecipe({ ...recipe, ingredients: newIngredients });
  };

  const handleInstructionChange = (index: number, value: string) => {
    const newInstructions = [...(recipe.instructions || [])];
    newInstructions[index] = value;
    setRecipe({ ...recipe, instructions: newInstructions });
  };

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setImageFile(file);
      const reader = new FileReader();
      reader.onloadend = () => {
        setImagePreview(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleAddCategory = () => {
    if (newCategory.trim() && !recipe.categories?.includes(newCategory.trim())) {
      setRecipe({
        ...recipe,
        categories: [...(recipe.categories || []), newCategory.trim()]
      });
      setNewCategory('');
    }
  };

  const handleRemoveCategory = (category: string) => {
    setRecipe({
      ...recipe,
      categories: recipe.categories?.filter(c => c !== category)
    });
  };

  const uploadImage = async (file: File): Promise<string> => {
    const storageRef = ref(storage, `recipe-images/${id || 'new'}/${file.name}`);
    const snapshot = await uploadBytes(storageRef, file);
    return getDownloadURL(snapshot.ref);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      const recipeData = {
        ...recipe,
        imageUrl: recipe.imageUrl || null,
        userId: user!.uid,
        createdAt: serverTimestamp(),
      };

      if (imageFile) {
        const imageUrl = await uploadImage(imageFile);
        recipeData.imageUrl = imageUrl;
      }

      if (id) {
        await updateDoc(doc(db, 'recipes', id), recipeData);
      } else {
        await addDoc(collection(db, 'recipes'), recipeData);
      }

      navigate('/recipes');
    } catch (err) {
      console.error('Error saving recipe:', err);
      setError('אירעה שגיאה בשמירת המתכון. אנא נסה שוב.');
    } finally {
      setLoading(false);
    }
  };

  if (fetchingRecipe) {
    return (
      <div className="flex justify-center items-center h-screen">
        <Loader2 className="w-8 h-8 animate-spin text-blue-500" />
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="max-w-4xl mx-auto p-4 md:p-6 space-y-8 bg-white shadow-md rounded-lg">
      <h1 className="text-3xl font-bold mb-6 text-center">{id ? 'עריכת מתכון' : 'מתכון חדש'}</h1>
      
      <div className="grid gap-6">
        <div className="space-y-4">
          <label className="block">
            <span className="text-gray-700 font-semibold">שם המתכון</span>
            <input
              type="text"
              value={recipe.title}
              onChange={(e) => setRecipe({ ...recipe, title: e.target.value })}
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-primary-300 focus:ring focus:ring-primary-200 focus:ring-opacity-50"
              required
            />
          </label>

          <label className="block">
            <span className="text-gray-700 font-semibold">תיאור</span>
            <textarea
              value={recipe.description}
              onChange={(e) => setRecipe({ ...recipe, description: e.target.value })}
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-primary-300 focus:ring focus:ring-primary-200 focus:ring-opacity-50"
              rows={3}
            />
          </label>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <label className="block">
            <span className="text-gray-700 font-semibold">זמן הכנה</span>
            <input
              type="text"
              value={recipe.prepTime}
              onChange={(e) => setRecipe({ ...recipe, prepTime: e.target.value })}
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-primary-300 focus:ring focus:ring-primary-200 focus:ring-opacity-50"
              placeholder="לדוגמה: 20 דקות"
            />
          </label>

          <label className="block">
            <span className="text-gray-700 font-semibold">זמן בישול</span>
            <input
              type="text"
              value={recipe.cookTime}
              onChange={(e) => setRecipe({ ...recipe, cookTime: e.target.value })}
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-primary-300 focus:ring focus:ring-primary-200 focus:ring-opacity-50"
              placeholder="לדוגמה: שעה"
            />
          </label>

          <label className="block">
            <span className="text-gray-700 font-semibold">מספר מנות</span>
            <input
              type="text"
              value={recipe.servings}
              onChange={(e) => setRecipe({ ...recipe, servings: e.target.value })}
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-primary-300 focus:ring focus:ring-primary-200 focus:ring-opacity-50"
              placeholder="לדוגמה: 4-6 מנות"
            />
          </label>
        </div>

        <label className="block">
          <span className="text-gray-700 font-semibold">רמת קושי</span>
          <select
            value={recipe.difficulty}
            onChange={(e) => setRecipe({ ...recipe, difficulty: e.target.value })}
            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-primary-300 focus:ring focus:ring-primary-200 focus:ring-opacity-50"
          >
            <option value="קל">קל</option>
            <option value="בינוני">בינוני</option>
            <option value="מאתגר">מאתגר</option>
          </select>
        </label>

        <div className="space-y-2">
          <span className="text-gray-700 font-semibold block">קטגוריות</span>
          <div className="flex flex-wrap gap-2 mb-2">
            {recipe.categories?.map((category) => (
              <span key={category} className="bg-gray-100 px-3 py-1 rounded-full flex items-center gap-1">
                {category}
                <button
                  type="button"
                  onClick={() => handleRemoveCategory(category)}
                  className="text-gray-500 hover:text-red-500"
                >
                  <X className="w-4 h-4" />
                </button>
              </span>
            ))}
          </div>
          <div className="flex gap-2">
            <input
              type="text"
              value={newCategory}
              onChange={(e) => setNewCategory(e.target.value)}
              className="flex-grow rounded-md border-gray-300 shadow-sm focus:border-primary-300 focus:ring focus:ring-primary-200 focus:ring-opacity-50"
              placeholder="הוסף קטגוריה חדשה"
            />
            <button
              type="button"
              onClick={handleAddCategory}
              className="px-4 py-2 bg-gray-100 text-gray-700 rounded-md hover:bg-gray-200"
            >
              הוסף
            </button>
          </div>
        </div>

        <div className="space-y-4">
          <span className="text-gray-700 font-semibold block">הוראות הכנה</span>
          {recipe.instructions?.map((instruction, index) => (
            <div key={index} className="flex gap-2">
              <textarea
                value={instruction}
                onChange={(e) => handleInstructionChange(index, e.target.value)}
                className="flex-grow rounded-md border-gray-300 shadow-sm focus:border-primary-300 focus:ring focus:ring-primary-200 focus:ring-opacity-50"
                rows={2}
                placeholder={`שלב ${index + 1}`}
                required
              />
              <button
                type="button"
                onClick={() => {
                  const newInstructions = recipe.instructions?.filter((_, i) => i !== index);
                  setRecipe({ ...recipe, instructions: newInstructions });
                }}
                className="text-red-500 hover:text-red-700 p-2"
              >
                <Trash2 className="w-5 h-5" />
              </button>
            </div>
          ))}
          <button
            type="button"
            onClick={() => setRecipe({
              ...recipe,
              instructions: [...(recipe.instructions || []), '']
            })}
            className="btn btn-secondary btn-sm w-full"
          >
            <Plus className="w-4 h-4 ml-2" />
            הוסף שלב
          </button>
        </div>

        <div className="space-y-4">
          <div>
            <span className="text-gray-700 font-semibold block">תמונת מתכון</span>
            {imagePreview && (
              <div className="mt-2">
                <img src={imagePreview} alt="תצוגה מקדימה" className="max-w-xs rounded-md" />
              </div>
            )}
            <input
              type="file"
              accept="image/*"
              onChange={handleImageChange}
              className="mt-1 block w-full"
            />
          </div>

          <label className="block">
            <span className="text-gray-700 font-semibold">הערות נוספות</span>
            <textarea
              value={recipe.notes}
              onChange={(e) => setRecipe({ ...recipe, notes: e.target.value })}
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-primary-300 focus:ring focus:ring-primary-200 focus:ring-opacity-50"
              rows={3}
            />
          </label>

          <div className="flex items-center">
            <input
              type="checkbox"
              id="isPublic"
              checked={recipe.isPublic}
              onChange={(e) => setRecipe({ ...recipe, isPublic: e.target.checked })}
              className="rounded border-gray-300 text-primary-600 shadow-sm focus:border-primary-300 focus:ring focus:ring-primary-200 focus:ring-opacity-50"
            />
            <label htmlFor="isPublic" className="mr-2 block text-sm text-gray-900">
              פרסם מתכון למשפחה
            </label>
          </div>
        </div>
      </div>

      {error && <div className="text-red-500 p-4 bg-red-50 rounded-lg">{error}</div>}
      
      <div className="flex justify-end gap-4">
        <button 
          type="button" 
          onClick={() => navigate(-1)}
          className="px-4 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50"
        >
          ביטול
        </button>
        <button 
          type="submit" 
          className="px-4 py-2 bg-primary-600 text-white rounded-md hover:bg-primary-700"
          disabled={loading}
        >
          {loading ? <Loader2 className="w-5 h-5 animate-spin" /> : (id ? 'עדכן מתכון' : 'צור מתכון')}
        </button>
      </div>
    </form>
  );
}

export default RecipeForm;
