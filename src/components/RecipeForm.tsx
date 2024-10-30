import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { useAuth0 } from '@auth0/auth0-react';
import { doc, getDoc, setDoc, updateDoc, collection } from 'firebase/firestore';
import { ref, uploadBytes, getDownloadURL } from 'firebase/storage';
import { db, storage } from '../firebase';
import { Recipe } from '../types/recipe';
import { Plus, Minus, Upload, Loader2 } from 'lucide-react';

function RecipeForm() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth0();
  const [loading, setLoading] = useState(false);
  const [imagePreview, setImagePreview] = useState<string>('');
  
  const [formData, setFormData] = useState<Partial<Recipe>>({
    title: '',
    description: '',
    imageUrl: '',
    prepTime: 30,
    cookTime: 30,
    servings: 4,
    difficulty: 'קל',
    categories: [],
    ingredients: [{ item: '', amount: 1, unit: 'כוס' }],
    instructions: [''],
    notes: '',
    isPublic: false
  });

  useEffect(() => {
    if (id) {
      const fetchRecipe = async () => {
        const docRef = doc(db, 'recipes', id);
        const docSnap = await getDoc(docRef);
        if (docSnap.exists()) {
          setFormData(docSnap.data() as Recipe);
          setImagePreview(docSnap.data().imageUrl);
        }
      };
      fetchRecipe();
    }
  }, [id]);

  const handleImageChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setLoading(true);
      try {
        const storageRef = ref(storage, `recipes/${user?.sub}/${Date.now()}_${file.name}`);
        const snapshot = await uploadBytes(storageRef, file);
        const url = await getDownloadURL(snapshot.ref);
        setFormData(prev => ({ ...prev, imageUrl: url }));
        setImagePreview(url);
      } catch (error) {
        console.error('Error uploading image:', error);
      } finally {
        setLoading(false);
      }
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.title?.trim()) {
      alert('אנא הזן כותרת למתכון');
      return;
    }
    
    if (!formData.description?.trim()) {
      alert('אנא הזן תיאור למתכון');
      return;
    }
    
    if (!formData.ingredients?.length || formData.ingredients.some(ing => !ing.item.trim())) {
      alert('אנא הזן לפחות מצרך אחד עם שם');
      return;
    }
    
    if (!formData.instructions?.length || formData.instructions.some(inst => !inst.trim())) {
      alert('אנא הזן לפחות הוראת הכנה אחת');
      return;
    }

    setLoading(true);

    try {
      const recipeData = {
        ...formData,
        prepTime: Math.max(0, formData.prepTime || 0),
        cookTime: Math.max(0, formData.cookTime || 0),
        servings: Math.max(1, formData.servings || 1),
        userId: user?.sub,
        updatedAt: new Date(),
        createdAt: id ? formData.createdAt : new Date(),
        likes: id ? formData.likes : 0,
        categories: formData.categories?.map(cat => cat.trim()).filter(Boolean) || [],
        ingredients: formData.ingredients?.map(ing => ({
          ...ing,
          item: ing.item.trim(),
          unit: ing.unit.trim()
        })) || [],
        instructions: formData.instructions?.map(inst => inst.trim()).filter(Boolean) || []
      };

      if (id) {
        await updateDoc(doc(db, 'recipes', id), recipeData);
      } else {
        const newDocRef = doc(collection(db, 'recipes'));
        await setDoc(newDocRef, recipeData);
      }

      navigate('/recipes');
    } catch (error) {
      console.error('Error saving recipe:', error);
      alert('אירעה שגיאה בשמירת המתכון. אנא נסה שוב.');
    } finally {
      setLoading(false);
    }
  };

  const handleNumberInput = (
    e: React.ChangeEvent<HTMLInputElement>,
    field: 'prepTime' | 'cookTime' | 'servings'
  ) => {
    const value = parseInt(e.target.value) || 0;
    const minValue = field === 'servings' ? 1 : 0;
    setFormData(prev => ({ ...prev, [field]: Math.max(minValue, value) }));
  };

  const addIngredient = () => {
    setFormData(prev => ({
      ...prev,
      ingredients: [...prev.ingredients!, { item: '', amount: 1, unit: 'כוס' }]
    }));
  };

  const removeIngredient = (index: number) => {
    setFormData(prev => ({
      ...prev,
      ingredients: prev.ingredients!.filter((_, i) => i !== index)
    }));
  };

  const addInstruction = () => {
    setFormData(prev => ({
      ...prev,
      instructions: [...prev.instructions!, '']
    }));
  };

  const removeInstruction = (index: number) => {
    setFormData(prev => ({
      ...prev,
      instructions: prev.instructions!.filter((_, i) => i !== index)
    }));
  };

  return (
    <form onSubmit={handleSubmit} className="max-w-3xl mx-auto space-y-8">
      <div className="card p-6">
        <h2 className="text-2xl font-bold mb-6">{id ? 'עריכת מתכון' : 'מתכון חדש'}</h2>

        <div className="space-y-6">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              כותרת המתכון
            </label>
            <input
              type="text"
              value={formData.title}
              onChange={e => setFormData(prev => ({ ...prev, title: e.target.value }))}
              className="input"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              תיאור
            </label>
            <textarea
              value={formData.description}
              onChange={e => setFormData(prev => ({ ...prev, description: e.target.value }))}
              className="input min-h-[100px]"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              תמונה
            </label>
            <div className="flex items-center gap-4">
              <label className="btn btn-secondary cursor-pointer">
                <Upload className="w-5 h-5 mr-2" />
                העלאת תמונה
                <input
                  type="file"
                  accept="image/*"
                  onChange={handleImageChange}
                  className="hidden"
                />
              </label>
              {imagePreview && (
                <img
                  src={imagePreview}
                  alt="תצוגה מקדימה"
                  className="w-20 h-20 object-cover rounded-lg"
                />
              )}
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                זמן הכנה (דקות)
              </label>
              <input
                type="number"
                value={formData.prepTime}
                onChange={e => handleNumberInput(e, 'prepTime')}
                className="input"
                min="0"
                placeholder="30"
                required
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                זמן בישול (דקות)
              </label>
              <input
                type="number"
                value={formData.cookTime}
                onChange={e => handleNumberInput(e, 'cookTime')}
                className="input"
                min="0"
                placeholder="30"
                required
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                מספר מנות
              </label>
              <input
                type="number"
                value={formData.servings}
                onChange={e => handleNumberInput(e, 'servings')}
                className="input"
                min="1"
                placeholder="4"
                required
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              רמת קושי
            </label>
            <select
              value={formData.difficulty}
              onChange={e => setFormData(prev => ({ ...prev, difficulty: e.target.value as Recipe['difficulty'] }))}
              className="input"
              required
            >
              <option value="קל">קל</option>
              <option value="בינוני">בינוני</option>
              <option value="מאתגר">מאתגר</option>
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              קטגוריות (מופרדות בפסיק)
            </label>
            <input
              type="text"
              value={formData.categories?.join(', ')}
              onChange={e => setFormData(prev => ({
                ...prev,
                categories: e.target.value.split(',').map(cat => cat.trim()).filter(Boolean)
              }))}
              className="input"
              placeholder="ארוחת ערב, צמחוני, מהיר..."
            />
          </div>
        </div>
      </div>

      <div className="card p-6">
        <h3 className="text-xl font-bold mb-4">מצרכים</h3>
        <div className="space-y-4">
          {formData.ingredients?.map((ingredient, index) => (
            <div key={index} className="flex gap-4">
              <input
                type="text"
                value={ingredient.item}
                onChange={e => {
                  const newIngredients = [...formData.ingredients!];
                  newIngredients[index].item = e.target.value;
                  setFormData(prev => ({ ...prev, ingredients: newIngredients }));
                }}
                className="input flex-1"
                placeholder="שם המצרך"
                required
              />
              <input
                type="number"
                value={ingredient.amount}
                onChange={e => {
                  const newIngredients = [...formData.ingredients!];
                  newIngredients[index].amount = Number(e.target.value);
                  setFormData(prev => ({ ...prev, ingredients: newIngredients }));
                }}
                className="input w-24"
                min="0"
                step="0.1"
                required
              />
              <input
                type="text"
                value={ingredient.unit}
                onChange={e => {
                  const newIngredients = [...formData.ingredients!];
                  newIngredients[index].unit = e.target.value;
                  setFormData(prev => ({ ...prev, ingredients: newIngredients }));
                }}
                className="input w-24"
                placeholder="יחידה"
                required
              />
              <button
                type="button"
                onClick={() => removeIngredient(index)}
                className="btn btn-secondary text-red-500"
              >
                <Minus className="w-5 h-5" />
              </button>
            </div>
          ))}
          <button
            type="button"
            onClick={addIngredient}
            className="btn btn-secondary w-full"
          >
            <Plus className="w-5 h-5 mr-2" />
            הוסף מצרך
          </button>
        </div>
      </div>

      <div className="card p-6">
        <h3 className="text-xl font-bold mb-4">הוראות הכנה</h3>
        <div className="space-y-4">
          {formData.instructions?.map((instruction, index) => (
            <div key={index} className="flex gap-4">
              <span className="w-8 h-8 rounded-full bg-primary-50 text-primary-600 flex items-center justify-center font-medium">
                {index + 1}
              </span>
              <textarea
                value={instruction}
                onChange={e => {
                  const newInstructions = [...formData.instructions!];
                  newInstructions[index] = e.target.value;
                  setFormData(prev => ({ ...prev, instructions: newInstructions }));
                }}
                className="input flex-1 min-h-[80px]"
                placeholder="תיאור השלב..."
                required
              />
              <button
                type="button"
                onClick={() => removeInstruction(index)}
                className="btn btn-secondary text-red-500"
              >
                <Minus className="w-5 h-5" />
              </button>
            </div>
          ))}
          <button
            type="button"
            onClick={addInstruction}
            className="btn btn-secondary w-full"
          >
            <Plus className="w-5 h-5 mr-2" />
            הוסף שלב
          </button>
        </div>
      </div>

      <div className="card p-6">
        <h3 className="text-xl font-bold mb-4">הערות נוספות</h3>
        <textarea
          value={formData.notes}
          onChange={e => setFormData(prev => ({ ...prev, notes: e.target.value }))}
          className="input min-h-[100px]"
          placeholder="טיפים, וריאציות, או כל מידע נוסף..."
        />
      </div>

      <div className="flex justify-between items-center">
        <label className="flex items-center gap-2">
          <input
            type="checkbox"
            checked={formData.isPublic}
            onChange={e => setFormData(prev => ({ ...prev, isPublic: e.target.checked }))}
            className="w-4 h-4 text-primary-600 rounded border-gray-300 focus:ring-primary-500"
          />
          <span className="text-sm text-gray-700">שתף מתכון זה עם הקהילה</span>
        </label>

        <div className="flex gap-4">
          <button
            type="button"
            onClick={() => navigate('/recipes')}
            className="btn btn-secondary"
          >
            ביטול
          </button>
          <button
            type="submit"
            className="btn btn-primary min-w-[120px]"
            disabled={loading}
          >
            {loading ? (
              <Loader2 className="w-5 h-5 animate-spin" />
            ) : (
              <span>{id ? 'שמור שינויים' : 'צור מתכון'}</span>
            )}
          </button>
        </div>
      </div>
    </form>
  );
}

export default RecipeForm;