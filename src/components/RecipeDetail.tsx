import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { doc, getDoc, deleteDoc, updateDoc, increment, setDoc, collection, getDocs } from 'firebase/firestore';
import { db } from '../firebase';
import { Recipe } from '../types/Recipe';
import { Clock, Users, ChefHat, Edit, Trash2, Heart, Share2, Loader2, Printer } from 'lucide-react';
import { RecipeDetailSkeleton } from './Skeleton';
import Comments from './Comments';
import MetaTags from '../components/MetaTags';

function RecipeDetail() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { user } = useAuth();
  const [recipe, setRecipe] = useState<Recipe | null>(null);
  const [authorData, setAuthorData] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [deleting, setDeleting] = useState(false);
  const [liking, setLiking] = useState(false);
  const [hasLiked, setHasLiked] = useState(false);
  const [sharing, setSharing] = useState(false);

  useEffect(() => {
    const fetchRecipeAndAuthor = async () => {
      if (!id) {
        navigate('/');
        return;
      }
      
      setLoading(true);
      try {
        const recipeRef = doc(db, 'recipes', id);
        const recipeSnap = await getDoc(recipeRef);
        
        if (!recipeSnap.exists()) {
          navigate('/');
          return;
        }

        const recipeData = {
          id: recipeSnap.id,
          ...recipeSnap.data()
        } as Recipe;
        
        setRecipe(recipeData);

        // Fetch author data
        const authorRef = doc(db, 'users', recipeData.userId);
        const authorSnap = await getDoc(authorRef);
        if (authorSnap.exists()) {
          setAuthorData(authorSnap.data());
        }

        // Check if user has liked
        if (user?.uid) {
          const likeRef = doc(db, 'recipes', id, 'likes', user.uid);
          const likeSnap = await getDoc(likeRef);
          setHasLiked(likeSnap.exists());
        }
      } catch (error) {
        console.error('Error fetching recipe:', error);
        // Handle error (e.g., show error message)
      } finally {
        setLoading(false);
      }
    };

    fetchRecipeAndAuthor();
  }, [id, navigate, user?.uid]);

  const handleDelete = async () => {
    if (!id || !window.confirm('האם אתה בטוח שברצונך למחוק מתכון ז?')) return;
    
    setDeleting(true);
    try {
      // Delete likes
      const likesRef = collection(db, 'recipes', id, 'likes');
      const likesSnapshot = await getDocs(likesRef);
      const likesPromises = likesSnapshot.docs.map(doc => 
        deleteDoc(doc.ref)
      );
      await Promise.all(likesPromises);

      // Delete comments
      const commentsRef = collection(db, 'recipes', id, 'comments');
      const commentsSnapshot = await getDocs(commentsRef);
      const commentsPromises = commentsSnapshot.docs.map(doc => 
        deleteDoc(doc.ref)
      );
      await Promise.all(commentsPromises);

      // Delete the recipe itself
      await deleteDoc(doc(db, 'recipes', id));
      
      navigate('/');
    } catch (error) {
      console.error('Error deleting recipe:', error);
      alert('אירעה שגיאה במחיקת המתכון');
    } finally {
      setDeleting(false);
    }
  };

  const handleEdit = () => {
    if (id) {
      navigate(`/recipe/edit/${id}`);
    }
  };

  const handleLike = async () => {
    if (!recipe || !user?.uid || liking) return;
    
    setLiking(true);
    try {
      const recipeRef = doc(db, 'recipes', recipe.id);
      const likeRef = doc(db, 'recipes', recipe.id, 'likes', user.uid);

      if (hasLiked) {
        await deleteDoc(likeRef);
        await updateDoc(recipeRef, {
          likes: increment(-1)
        });
        setHasLiked(false);
        setRecipe(prev => prev ? { ...prev, likes: (prev.likes || 1) - 1 } : null);
      } else {
        await setDoc(likeRef, {
          userId: user.uid,
          createdAt: new Date()
        });
        await updateDoc(recipeRef, {
          likes: increment(1)
        });
        setHasLiked(true);
        setRecipe(prev => prev ? { ...prev, likes: (prev.likes || 0) + 1 } : null);
      }
    } catch (error) {
      console.error('Error liking recipe:', error);
    } finally {
      setLiking(false);
    }
  };

  const handleShare = async () => {
    if (!recipe || sharing) return;
    
    setSharing(true);
    try {
      if (navigator.share) {
        await navigator.share({
          title: recipe.title,
          text: recipe.description,
          url: window.location.href
        });
      } else {
        await navigator.clipboard.writeText(window.location.href);
        alert('הקישור הועתק ללוח');
      }
    } catch (error) {
      console.error('Error sharing recipe:', error);
      // Fallback to copying link
      try {
        await navigator.clipboard.writeText(window.location.href);
        alert('הקישור הועתק ללוח');
      } catch (clipboardError) {
        console.error('Error copying to clipboard:', clipboardError);
        alert('לא ניתן לשתף את המתכון כרגע. נסה שוב מאוחר יותר.');
      }
    } finally {
      setSharing(false);
    }
  };

  const handlePrint = () => {
    window.print();
  };

  const RecipePlaceholder = () => (
    <div className="w-full h-full bg-gradient-to-br from-primary-100 to-primary-200 flex items-center justify-center">
      <div className="text-center">
        <ChefHat className="w-16 h-16 text-primary-500 mx-auto mb-4" />
        <p className="text-primary-700 font-semibold">תמונת מתכון לא זמינה</p>
      </div>
    </div>
  );

  if (loading) {
    return <RecipeDetailSkeleton />;
  }

  if (!recipe) return null;

  const recipeDescription = `${recipe.title} - ${recipe.description || ''} 
    ${recipe.prepTime ? `זמן הכנה: ${recipe.prepTime} דקות` : ''} 
    ${recipe.servings ? `מתאים ל-${recipe.servings} סועדים` : ''}`;

  return (
    <>
      <MetaTags
        title={`${recipe.title} - מתכוני המשפחה`}
        description={recipeDescription}
        image={recipe.imageUrl || '/placeholder-recipe.jpg'}
      />
      
      <div className="max-w-4xl mx-auto space-y-6 p-4 md:p-6">
        <div className="relative h-[300px] md:h-[400px] rounded-xl overflow-hidden">
          {recipe.imageUrl ? (
            <img
              src={recipe.imageUrl}
              alt={recipe.title}
              className="w-full h-full object-cover"
              loading="lazy"
            />
          ) : (
            <RecipePlaceholder />
          )}
          <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-black/20 to-transparent"></div>
          <div className="absolute bottom-0 right-0 left-0 p-4 md:p-8">
            <div className="flex items-center gap-4 text-white">
              {authorData?.photoURL && (
                <img
                  src={authorData.photoURL}
                  alt={authorData.displayName || ''}
                  className="w-10 h-10 md:w-12 md:h-12 rounded-full border-2 border-white"
                  loading="lazy"
                />
              )}
              <div>
                <h1 className="text-2xl md:text-3xl font-bold mb-2">{recipe.title}</h1>
                <p className="text-sm opacity-90">
                  פורסם על ידי {authorData?.displayName || 'משתמש לא ידוע'}
                </p>
              </div>
            </div>
          </div>
        </div>

        <div className="flex flex-col sm:flex-row justify-between items-stretch sm:items-center gap-4">
          <div className="flex flex-wrap gap-2">
            {user?.uid === recipe.userId && (
              <>
                <button
                  onClick={handleEdit}
                  className="btn btn-secondary flex-1 sm:flex-none"
                >
                  <Edit className="w-4 h-4 ml-2" />
                  ערוך
                </button>
                <button
                  onClick={handleDelete}
                  className="btn btn-error flex-1 sm:flex-none"
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
          
          <div className="flex flex-wrap gap-2">
            {user && (
              <button
                onClick={handleLike}
                className={`btn ${hasLiked ? 'btn-primary' : 'btn-secondary'} flex-1 sm:flex-none`}
                disabled={liking}
              >
                <Heart className={`w-4 h-4 ml-2 ${hasLiked ? 'fill-current' : ''}`} />
                {recipe.likes || 0}
              </button>
            )}
            <button 
              onClick={handleShare} 
              className="btn btn-secondary flex-1 sm:flex-none"
              disabled={sharing}
            >
              {sharing ? (
                <Loader2 className="w-4 h-4 animate-spin ml-2" />
              ) : (
                <Share2 className="w-4 h-4 ml-2" />
              )}
              שתף
            </button>
            <button 
              onClick={handlePrint} 
              className="btn btn-secondary flex-1 sm:flex-none print:hidden"
            >
              <Printer className="w-4 h-4 ml-2" />
              הדפס
            </button>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2 space-y-6">
            <div className="card p-4 md:p-6">
              <h2 className="text-xl md:text-2xl font-bold mb-4">תיאור</h2>
              <p className="text-gray-700 whitespace-pre-line">{recipe.description}</p>
            </div>

            <div className="card p-4 md:p-6">
              <h2 className="text-xl md:text-2xl font-bold mb-6">הוראות הכנה</h2>
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
              <div className="card p-4 md:p-6">
                <h2 className="text-xl md:text-2xl font-bold mb-4">הערות נוספות</h2>
                <p className="text-gray-700 whitespace-pre-line">{recipe.notes}</p>
              </div>
            )}

            <div className="card p-4 md:p-6 print:hidden">
              <Comments recipeId={recipe.id} recipeOwnerId={recipe.userId} />
            </div>
          </div>

          <div className="space-y-6">
            <div className="card p-4 md:p-6">
              <h2 className="text-xl md:text-2xl font-bold mb-6">מצרכים</h2>
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

            <div className="card p-4 md:p-6">
              <h2 className="text-xl md:text-2xl font-bold mb-4">קטגוריות</h2>
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
    </>
  );
}

export default RecipeDetail;
