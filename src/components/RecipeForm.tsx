import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { doc, getDoc, setDoc, updateDoc, collection, serverTimestamp, addDoc } from 'firebase/firestore';
import { ref, uploadBytes, getDownloadURL } from 'firebase/storage';
import { db, storage } from '../firebase';
import { Recipe, validateRecipe } from '../types/Recipe';
import { Loader2, Plus, Trash2, X } from 'lucide-react';

// יחידות מידה נפוצות במתכונים
const commonUnits = [
  'כוס',
  'כפית',
  'כף',
  'גרם',
  'מ"ל',
  'יחידה',
  'חבילה',
  'קופסה',
  'שקית',
  'לטעם'
];

function RecipeForm() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { user } = useAuth();
  const [recipe, setRecipe] = useState<Partial<Recipe>>({
    title: '',
    description: '',
    ingredients: [{ item: '', amount: '', unit: 'יחידה' }],
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
    newIngredients[index] = { 
      ...newIngredients[index], 
      [field]: value,
      ...(field === 'amount' && { amount: value.replace(/[^0-9.]/g, '') })
    };
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
      const previewUrl = URL.createObjectURL(file);
      setImagePreview(previewUrl);
    }
  };

  const handleCategoryChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    
    if (value.endsWith(' ')) {
      const newCategory = value.trim();
      if (newCategory && !recipe.categories.includes(newCategory)) {
        setRecipe({
          ...recipe,
          categories: [...recipe.categories, newCategory]
        });
        setNewCategory('');
      }
    } else {
      setNewCategory(value);
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
    <form onSubmit={handleSubmit} className="max-w-4xl mx-auto p-4 space-y-6">
      <h1 className="text-2xl font-bold mb-4">{id ? 'עריכת מתכון' : 'מתכון חדש'}</h1>
      
      {/* שם המתכון ותיאור */}
      <div className="card p-4 md:p-6">
        <label className="block">
          <span className="text-gray-700 font-semibold">שם המתכון</span>
          <input
            type="text"
            value={recipe.title}
            onChange={(e) => setRecipe({ ...recipe, title: e.target.value })}
            className="mt-1 block w-full rounded-lg border-gray-300 shadow-sm bg-gray-50 focus:bg-white"
            required
            placeholder="הכנס את שם המתכון"
          />
        </label>

        <label className="block mt-4">
          <span className="text-gray-700 font-semibold">תיאור</span>
          <textarea
            value={recipe.description}
            onChange={(e) => setRecipe({ ...recipe, description: e.target.value })}
            className="mt-1 block w-full rounded-lg border-gray-300 shadow-sm bg-gray-50 focus:bg-white"
            rows={3}
            required
            placeholder="תאר את המתכון בקצרה"
          />
        </label>
      </div>

      {/* פרטים טכניים */}
      <div className="card p-4 md:p-6">
        <h2 className="text-xl font-bold mb-4">פרטים טכניים</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <label className="block">
            <span className="text-gray-700 font-semibold">זמן הכנה (דקות)</span>
            <input
              type="number"
              value={recipe.prepTime}
              onChange={(e) => setRecipe({ ...recipe, prepTime: Number(e.target.value) })}
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm bg-gray-50 focus:bg-white"
              min="0"
              placeholder="לדוגמה: 30"
              required
            />
          </label>

          <label className="block">
            <span className="text-gray-700 font-semibold">זמן בישול (דקות)</span>
            <input
              type="number"
              value={recipe.cookTime}
              onChange={(e) => setRecipe({ ...recipe, cookTime: Number(e.target.value) })}
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm bg-gray-50 focus:bg-white"
              min="0"
              placeholder="לדוגמה: 45"
              required
            />
          </label>

          <label className="block">
            <span className="text-gray-700 font-semibold">מספר מנות</span>
            <input
              type="number"
              value={recipe.servings}
              onChange={(e) => setRecipe({ ...recipe, servings: Number(e.target.value) })}
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm bg-gray-50 focus:bg-white"
              min="1"
              placeholder="לדוגמה: 4"
              required
            />
          </label>
        </div>
      </div>

      {/* קטגוריות */}
      <div className="card p-4 md:p-6">
        <h2 className="text-xl font-bold mb-4">קטגוריות</h2>
        <div className="space-y-4">
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
          <input
            type="text"
            value={newCategory}
            onChange={handleCategoryChange}
            className="w-full rounded-md border-gray-300 shadow-sm focus:border-primary-300 focus:ring focus:ring-primary-200 focus:ring-opacity-50"
            placeholder="הקלד קטגוריה ולחץ רווח להוספה"
          />
        </div>
      </div>

      {/* מצרכים */}
      <div className="card p-4 md:p-6">
        <h2 className="text-xl font-bold mb-4">מצרכים</h2>
        <div className="space-y-4">
          {recipe.ingredients.map((ingredient, idx) => (
            <div key={idx} className="flex gap-2 items-start">
              <input
                type="text"
                value={ingredient.item}
                onChange={(e) => handleIngredientChange(idx, 'item', e.target.value)}
                placeholder="שם המצרך"
                className="flex-grow rounded-lg border-gray-300"
                required
              />
              <input
                type="number"
                value={ingredient.amount}
                onChange={(e) => handleIngredientChange(idx, 'amount', e.target.value)}
                placeholder="כמות"
                className="w-24 rounded-lg border-gray-300"
                required
              />
              <select
                value={ingredient.unit}
                onChange={(e) => handleIngredientChange(idx, 'unit', e.target.value)}
                className="w-28 rounded-lg border-gray-300"
              >
                {commonUnits.map(unit => (
                  <option key={unit} value={unit}>{unit}</option>
                ))}
              </select>
              {recipe.ingredients.length > 1 && (
                <button
                  type="button"
                  onClick={() => {
                    const newIngredients = recipe.ingredients.filter((_, i) => i !== idx);
                    setRecipe({ ...recipe, ingredients: newIngredients });
                  }}
                  className="text-red-500 hover:text-red-600 transition-colors p-2 rounded-lg"
                >
                  <Trash2 className="w-5 h-5" />
                </button>
              )}
            </div>
          ))}
          
          {/* כפתור הוסף מצרך - עוצב מחדש */}
          <button
            type="button"
            onClick={() => setRecipe({
              ...recipe,
              ingredients: [...recipe.ingredients, { item: '', amount: '', unit: 'יחידה' }]
            })}
            className="w-full px-4 py-2 text-sm bg-primary-50 text-primary-600 rounded-lg hover:bg-primary-100 transition-colors flex items-center justify-center gap-2"
          >
            <Plus className="w-4 h-4" />
            הוסף מצרך
          </button>
        </div>
      </div>

      {/* הוראות הכנה */}
      <div className="card p-4 md:p-6">
        <h2 className="text-xl font-bold mb-4">הוראות הכנה</h2>
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

      {/* תמונת מתכון */}
      <div className="card p-4 md:p-6">
        <h2 className="text-xl font-bold mb-4">תמונת מתכון</h2>
        <div className="space-y-4">
          {imagePreview && (
            <div className="mt-2">
              <img 
                src={imagePreview} 
                alt="תצוגה מקדימה" 
                className="max-w-xs rounded-lg shadow-sm"
              />
            </div>
          )}
          
          {/* Desktop File Input */}
          <div className="md:block hidden">
            <input
              type="file"
              accept="image/*"
              onChange={handleImageChange}
              className="w-full file:mr-4 file:py-2 file:px-4 
                       file:rounded-full file:border-0 
                       file:text-sm file:font-semibold
                       file:bg-primary-50 file:text-primary-700
                       hover:file:bg-primary-100
                       cursor-pointer"
            />
          </div>

          {/* Mobile Camera and Gallery Options */}
          <div className="md:hidden flex gap-2">
            <input
              type="file"
              accept="image/*"
              capture="environment"
              onChange={handleImageChange}
              className="hidden"
              id="camera-input"
            />
            <label 
              htmlFor="camera-input"
              className="flex-1 px-4 py-2 bg-primary-50 text-primary-600 rounded-lg 
                       hover:bg-primary-100 transition-colors text-center cursor-pointer"
            >
              צלם תמונה
            </label>

            <input
              type="file"
              accept="image/*"
              onChange={handleImageChange}
              className="hidden"
              id="gallery-input"
            />
            <label 
              htmlFor="gallery-input"
              className="flex-1 px-4 py-2 bg-primary-50 text-primary-600 rounded-lg 
                       hover:bg-primary-100 transition-colors text-center cursor-pointer"
            >
              בחר מגלריה
            </label>
          </div>
        </div>
      </div>

      {/* כפתורים */}
      <div className="flex justify-end gap-4">
        <button 
          type="button" 
          onClick={() => navigate(-1)}
          className="px-4 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50"
        >
          ביטול
        </button>
        <button 
          type="submit" 
          className="px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700"
          disabled={loading}
        >
          {loading ? <Loader2 className="w-5 h-5 animate-spin" /> : (id ? 'עדכן מתכון' : 'צור מתכון')}
        </button>
      </div>
    </form>
  );
}

export default RecipeForm;
