import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { doc, getDoc, deleteDoc, updateDoc, increment } from 'firebase/firestore';
import { db } from '../firebase';
import { Recipe } from '../types/recipe';
import { Clock, Users, ChefHat, Edit, Trash2, Heart, Share2, Loader2, Printer } from 'lucide-react';
import { RecipeDetailSkeleton } from './Skeleton';

function RecipeDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();
  const [recipe, setRecipe] = useState<Recipe | null>(null);
  const [authorData, setAuthorData] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [deleting, setDeleting] = useState(false);
  const [liking, setLiking] = useState(false);

  useEffect(() => {
    const fetchRecipeAndAuthor = async () => {
      if (!id) return;
      
      try {
        const docRef = doc(db, 'recipes', id);
        const docSnap = await getDoc(docRef);
        
        if (docSnap.exists()) {
          const recipeData = { id: docSnap.id, ...docSnap.data() } as Recipe;
          setRecipe(recipeData);
          
          // Fetch author data
          const authorRef = doc(db, 'users', recipeData.userId);
          const authorSnap = await getDoc(authorRef);
          if (authorSnap.exists()) {
            setAuthorData(authorSnap.data());
          }
        } else {
          navigate('/recipes');
        }
      } catch (error) {
        console.error('Error fetching recipe:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchRecipeAndAuthor();
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

  const handleLike = async () => {
    if (!recipe || liking) return;
    
    setLiking(true);
    try {
      const recipeRef = doc(db, 'recipes', recipe.id);
      await updateDoc(recipeRef, {
        likes: increment(1)
      });
      setRecipe(prev => prev ? { ...prev, likes: prev.likes + 1 } : null);
    } catch (error) {
      console.error('Error liking recipe:', error);
    } finally {
      setLiking(false);
    }
  };

  const handleShare = async () => {
    if (!recipe) return;
    
    try {
      await navigator.share({
        title: recipe.title,
        text: recipe.description,
        url: window.location.href
      });
    } catch (error) {
      if (error instanceof Error && error.name !== 'AbortError') {
        console.error('Error sharing recipe:', error);
        // Fallback to copying link
        await navigator.clipboard.writeText(window.location.href);
        alert('הקישור הועתק ללוח');
      }
    }
  };

  const handlePrint = () => {
    window.print();
  };

  if (loading) {
    return <RecipeDetailSkeleton />;
  }

  if (!recipe) return null;

  return (
    <div className="max-w-4xl mx-auto space-y-8">
      <div className="relative h-[400px] rounded-xl overflow-hidden">
        <img
          src={recipe.imageUrl}
          alt={recipe.title}
          className="w-full h-full object-cover"
          loading="lazy"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-black/20 to-transparent"></div>
        <div className="absolute bottom-0 right-0 left-0 p-8">
          <div className="flex items-center gap-4 text-white">
            {authorData?.photoURL && (
              <img
                src={authorData.photoURL}
                alt={authorData.displayName}
                className="w-12 h-12 rounded-full border-2 border-white"
              />
            )}
            <div>
              <h1 className="text-3xl font-bold mb-2">{recipe.title}</h1>
              <p className="text-sm opacity-90">
                פורסם על ידי {authorData?.displayName || 'משתמש לא ידוע'}
              </p>
            </div>
          </div>
        </div>
      </div>

      <div className="flex justify-between items-center">
        <div className="flex gap-2">
          {user?.uid === recipe.userId && (
            <>
              <button
                onClick={() => navigate(`/recipes/edit/${recipe.id}`)}
                className="btn btn-secondary"
              >
                <Edit className="w-4 h-4 ml-2" />
                ערוך
              </button>
              <button
                onClick={handleDelete}
                className="btn btn-error"
                disabled={deleting}
              >
                {deleting ? (
                  <Loader2 className="w-4 h-4 animate-spin" />
                ) : (
                  <Trash2 className="w-4 h-4 ml-2" />
                )}
                מחק
              </button>
            </>
          )}
        </div>
        
        <div className="flex gap-2">
          <button
            onClick={handleLike}
            className="btn btn-secondary"
            disabled={liking}
          >
            <Heart className={`w-4 h-4 ml-2 ${recipe.likes > 0 ? 'fill-current' : ''}`} />
            {recipe.likes || 0}
          </button>
          <button onClick={handleShare} className="btn btn-secondary">
            <Share2 className="w-4 h-4 ml-2" />
            שתף
          </button>
          <button onClick={handlePrint} className="btn btn-secondary">
            <Printer className="w-4 h-4 ml-2" />
            הדפס
          </button>
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
        </div>
      </div>
    </div>
  );
}

export default RecipeDetail;
