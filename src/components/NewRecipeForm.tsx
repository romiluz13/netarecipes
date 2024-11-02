import React, { useState } from 'react';
import { db, storage } from '../firebase';
import { collection, addDoc, doc, updateDoc } from 'firebase/firestore';
import { ref, uploadBytes, getDownloadURL } from 'firebase/storage';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { Loader2, Plus, Trash2 } from 'lucide-react';

interface Ingredient {
  item: string;
  amount: number;
  unit: string;
}

interface Recipe {
  title: string;
  description: string;
  ingredients: Ingredient[];
  instructions: string[];
  categories: string[];
  imageUrl?: string;
  userId: string;
  createdAt: Date;
  updatedAt: Date;
  prepTime: number;
  cookTime: number;
  servings: number;
  difficulty: string;
  isPublic: boolean;
  likes: number;
}

const CATEGORIES = [
  'ארוחת בוקר',
  'ארוחת צהריים',
  'ארוחת ערב',
  'קינוחים',
  'מתכוני בשר',
  'מתכוני עוף',
  'מתכונים צמחוניים',
  'מתכונים טבעוניים'
];

const NewRecipeForm: React.FC = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [error, setError] = useState<string>('');
  const [loading, setLoading] = useState(false);
  
  const [recipe, setRecipe] = useState<Recipe>({
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
    userId: '',
    createdAt: new Date(),
    updatedAt: new Date(),
    imageUrl: ''
  });

  const [imageFile, setImageFile] = useState<File | null>(null);

  const handleIngredientChange = (index: number, field: keyof Ingredient, value: string | number) => {
    const newIngredients = [...recipe.ingredients];
    newIngredients[index] = {
      ...newIngredients[index],
      [field]: value
    };
    setRecipe({ ...recipe, ingredients: newIngredients });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) {
      setError('יש להתחבר כדי ליצור מתכון');
      return;
    }

    setLoading(true);
    setError('');

    try {
      // First create the recipe document to get its ID
      const newRecipe = {
        title: recipe.title,
        description: recipe.description,
        ingredients: recipe.ingredients,
        instructions: recipe.instructions,
        categories: recipe.categories,
        userId: user.uid,
        createdAt: new Date(),
        updatedAt: new Date(),
        prepTime: recipe.prepTime,
        cookTime: recipe.cookTime,
        servings: recipe.servings,
        difficulty: recipe.difficulty,
        isPublic: true,
        likes: 0
      };

      const docRef = await addDoc(collection(db, 'recipes'), newRecipe);
      
      // Then handle image upload if exists
      if (imageFile) {
        if (imageFile.size > 5 * 1024 * 1024) {
          setError('גודל התמונה חייב להיות קטן מ-5MB');
          setLoading(false);
          return;
        }

        if (!imageFile.type.startsWith('image/')) {
          setError('הקובץ חייב להיות תמונה');
          setLoading(false);
          return;
        }

        try {
          const storageRef = ref(storage, `recipe-images/${docRef.id}/${imageFile.name}`);
          
          const metadata = {
            contentType: imageFile.type,
            customMetadata: {
              userId: user.uid,
              recipeId: docRef.id
            }
          };
          
          const snapshot = await uploadBytes(storageRef, imageFile, metadata);
          const imageUrl = await getDownloadURL(snapshot.ref);
          
          // Update recipe with image URL
          await updateDoc(doc(db, 'recipes', docRef.id), { imageUrl });
        } catch (uploadError: any) {
          console.error('Error uploading image:', uploadError);
          if (uploadError.code === 'storage/unauthorized') {
            setError('אין הרשאה להעלות תמונות');
          } else {
            setError('אירעה שגיאה בהעלאת התמונה');
          }
        }
      }

      navigate(`/recipe/${docRef.id}`);
    } catch (err) {
      console.error('Error creating recipe:', err);
      setError('אירעה שגיאה ביצירת המתכון. אנא נסה שוב.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto p-4 md:p-6">
      <div className="bg-white rounded-xl shadow-sm p-6 md:p-8">
        <h2 className="text-2xl md:text-3xl font-bold text-center mb-8">מתכון חדש</h2>
        
        {error && (
          <div className="bg-red-50 border border-red-200 text-red-600 px-4 py-3 rounded-lg mb-6">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-8">
          {/* שם המתכון */}
          <div className="space-y-2">
            <label className="block text-gray-700 font-semibold">שם המתכון</label>
            <input
              type="text"
              value={recipe.title}
              onChange={(e) => setRecipe({ ...recipe, title: e.target.value })}
              className="input w-full"
              placeholder="הכנס את שם המתכון"
              required
            />
          </div>

          {/* תיאור */}
          <div className="space-y-2">
            <label className="block text-gray-700 font-semibold">תיאור המתכון</label>
            <textarea
              value={recipe.description}
              onChange={(e) => setRecipe({ ...recipe, description: e.target.value })}
              className="input w-full h-24 resize-none"
              placeholder="תאר את המתכון בקצרה"
              required
            />
          </div>

          {/* מצרכים */}
          <div className="space-y-4">
            <label className="block text-gray-700 font-semibold">מצרכים</label>
            <div className="space-y-3">
              {recipe.ingredients.map((ing, idx) => (
                <div key={idx} className="flex gap-3 items-center">
                  <input
                    type="text"
                    placeholder="שם המצרך"
                    value={ing.item}
                    onChange={(e) => handleIngredientChange(idx, 'item', e.target.value)}
                    className="input flex-1"
                    required
                  />
                  <input
                    type="number"
                    placeholder="כמות"
                    value={ing.amount}
                    onChange={(e) => handleIngredientChange(idx, 'amount', Number(e.target.value))}
                    className="input w-24"
                    required
                    min="0"
                    step="0.1"
                  />
                  <input
                    type="text"
                    placeholder="יחידה"
                    value={ing.unit}
                    onChange={(e) => handleIngredientChange(idx, 'unit', e.target.value)}
                    className="input w-24"
                    required
                  />
                  {recipe.ingredients.length > 1 && (
                    <button
                      type="button"
                      onClick={() => {
                        const newIngredients = recipe.ingredients.filter((_, i) => i !== idx);
                        setRecipe({ ...recipe, ingredients: newIngredients });
                      }}
                      className="text-red-500 hover:text-red-600 transition-colors p-2"
                    >
                      <Trash2 className="w-5 h-5" />
                    </button>
                  )}
                </div>
              ))}
            </div>
            <button
              type="button"
              onClick={() => setRecipe({
                ...recipe,
                ingredients: [...recipe.ingredients, { item: '', amount: 0, unit: '' }]
              })}
              className="btn btn-secondary btn-sm w-full"
            >
              <Plus className="w-4 h-4 ml-2" />
              הוסף מצרך
            </button>
          </div>

          {/* הוראות הכנה */}
          <div className="space-y-4">
            <label className="block text-gray-700 font-semibold">הוראות הכנה</label>
            <div className="space-y-3">
              {recipe.instructions.map((instruction, idx) => (
                <div key={idx} className="flex gap-3 items-start">
                  <span className="text-gray-400 mt-3">{idx + 1}.</span>
                  <textarea
                    value={instruction}
                    onChange={(e) => {
                      const newInstructions = [...recipe.instructions];
                      newInstructions[idx] = e.target.value;
                      setRecipe({ ...recipe, instructions: newInstructions });
                    }}
                    className="input flex-1 h-20 resize-none"
                    placeholder={`שלב ${idx + 1}`}
                    required
                  />
                  {recipe.instructions.length > 1 && (
                    <button
                      type="button"
                      onClick={() => {
                        const newInstructions = recipe.instructions.filter((_, i) => i !== idx);
                        setRecipe({ ...recipe, instructions: newInstructions });
                      }}
                      className="text-red-500 hover:text-red-600 transition-colors p-2"
                    >
                      <Trash2 className="w-5 h-5" />
                    </button>
                  )}
                </div>
              ))}
            </div>
            <button
              type="button"
              onClick={() => setRecipe({
                ...recipe,
                instructions: [...recipe.instructions, '']
              })}
              className="btn btn-secondary btn-sm w-full"
            >
              <Plus className="w-4 h-4 ml-2" />
              הוסף שלב
            </button>
          </div>

          {/* קטגוריות */}
          <div className="space-y-4">
            <label className="block text-gray-700 font-semibold">קטגוריות</label>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
              {CATEGORIES.map((category) => (
                <label key={category} className="flex items-center gap-2 p-3 border rounded-lg hover:bg-gray-50 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={recipe.categories.includes(category)}
                    onChange={(e) => {
                      const newCategories = e.target.checked
                        ? [...recipe.categories, category]
                        : recipe.categories.filter(c => c !== category);
                      setRecipe({ ...recipe, categories: newCategories });
                    }}
                    className="form-checkbox text-primary-500 rounded"
                  />
                  <span className="text-sm">{category}</span>
                </label>
              ))}
            </div>
          </div>

          {/* תמונה */}
          <div className="space-y-2">
            <label className="block text-gray-700 font-semibold">תמונת המתכון</label>
            <input
              type="file"
              accept="image/*"
              onChange={(e) => setImageFile(e.target.files?.[0] || null)}
              className="w-full file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-primary-50 file:text-primary-700 hover:file:bg-primary-100"
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            className="btn btn-primary w-full"
          >
            {loading ? (
              <>
                <Loader2 className="w-5 h-5 animate-spin ml-2" />
                שומר מתכון...
              </>
            ) : (
              'שמור מתכון'
            )}
          </button>
        </form>
      </div>
    </div>
  );
};

export default NewRecipeForm;
