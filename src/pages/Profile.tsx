import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { collection, query, where, getDocs, doc, updateDoc } from 'firebase/firestore';
import { db, storage } from '../firebase';
import { Recipe } from '../types/recipe';
import { Edit, Trash2, Clock, Users, ChefHat, Camera, Loader2 } from 'lucide-react';
import { getDownloadURL, ref, uploadBytes } from 'firebase/storage';

function Profile() {
  const { user } = useAuth();
  const [recipes, setRecipes] = useState<Recipe[]>([]);
  const [loading, setLoading] = useState(true);
  const [uploadingPhoto, setUploadingPhoto] = useState(false);
  const [displayName, setDisplayName] = useState(user?.displayName || '');
  const [isEditingName, setIsEditingName] = useState(false);
  const [stats, setStats] = useState({
    totalRecipes: 0,
    totalLikes: 0,
    mostPopularRecipe: null as Recipe | null
  });

  useEffect(() => {
    const fetchUserData = async () => {
      if (!user?.uid) return;

      try {
        const q = query(
          collection(db, 'recipes'),
          where('userId', '==', user.uid)
        );
        
        const querySnapshot = await getDocs(q);
        const recipeData = querySnapshot.docs.map(doc => ({
          id: doc.id,
          ...doc.data()
        })) as Recipe[];
        
        setRecipes(recipeData);

        // Calculate stats
        const totalLikes = recipeData.reduce((sum, recipe) => sum + (recipe.likes || 0), 0);
        const mostPopular = recipeData.reduce((max, recipe) => 
          (recipe.likes || 0) > (max?.likes || 0) ? recipe : max, 
          recipeData[0]
        );

        setStats({
          totalRecipes: recipeData.length,
          totalLikes: totalLikes,
          mostPopularRecipe: mostPopular
        });
      } catch (error) {
        console.error('Error fetching recipes:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchUserData();
  }, [user?.uid]);

  const handlePhotoUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file || !user) return;

    setUploadingPhoto(true);
    try {
      const storageRef = ref(storage, `profiles/${user.uid}/photo.${file.name.split('.').pop()}`);
      await uploadBytes(storageRef, file);
      const photoURL = await getDownloadURL(storageRef);
      
      // Update user profile
      await updateDoc(doc(db, 'users', user.uid), {
        photoURL
      });

      // Reload page to show new photo
      window.location.reload();
    } catch (error) {
      console.error('Error uploading photo:', error);
      alert('אירעה שגיאה בהעלאת התמונה. אנא נסה שוב.');
    } finally {
      setUploadingPhoto(false);
    }
  };

  const handleNameUpdate = async () => {
    if (!user || !displayName.trim()) return;

    try {
      await updateDoc(doc(db, 'users', user.uid), {
        displayName: displayName.trim()
      });
      setIsEditingName(false);
      // Reload page to show new name
      window.location.reload();
    } catch (error) {
      console.error('Error updating name:', error);
      alert('אירעה שגיאה בעדכון השם. אנא נסה שוב.');
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <Loader2 className="w-8 h-8 animate-spin text-primary-500" />
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto p-4 md:p-6 space-y-6">
      <div className="bg-white rounded-xl shadow-sm p-6">
        <div className="flex flex-col md:flex-row items-center gap-6">
          <div className="relative">
            <img
              src={user?.photoURL || '/placeholder-avatar.jpg'}
              alt={user?.displayName || 'תמונת פרופיל'}
              className="w-32 h-32 rounded-full object-cover"
            />
            <label className="absolute bottom-0 right-0 bg-primary-500 text-white p-2 rounded-full cursor-pointer">
              <input
                type="file"
                accept="image/*"
                className="hidden"
                onChange={handlePhotoUpload}
                disabled={uploadingPhoto}
              />
              {uploadingPhoto ? (
                <Loader2 className="w-5 h-5 animate-spin" />
              ) : (
                <Camera className="w-5 h-5" />
              )}
            </label>
          </div>

          <div className="flex-1 text-center md:text-right">
            {isEditingName ? (
              <div className="flex items-center gap-2">
                <input
                  type="text"
                  value={displayName}
                  onChange={(e) => setDisplayName(e.target.value)}
                  className="input"
                  placeholder="השם שלך"
                />
                <button
                  onClick={handleNameUpdate}
                  className="btn btn-primary"
                >
                  שמור
                </button>
                <button
                  onClick={() => setIsEditingName(false)}
                  className="btn btn-ghost"
                >
                  ביטול
                </button>
              </div>
            ) : (
              <div className="flex items-center gap-2 justify-center md:justify-start">
                <h1 className="text-2xl font-bold">{user?.displayName}</h1>
                <button
                  onClick={() => setIsEditingName(true)}
                  className="btn btn-ghost btn-sm"
                >
                  <Edit className="w-4 h-4" />
                </button>
              </div>
            )}
            <p className="text-gray-600">{user?.email}</p>
          </div>

          <div className="flex gap-4">
            <div className="text-center">
              <div className="text-2xl font-bold text-primary-500">{stats.totalRecipes}</div>
              <div className="text-sm text-gray-600">מתכונים</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-primary-500">{stats.totalLikes}</div>
              <div className="text-sm text-gray-600">לייקים</div>
            </div>
          </div>
        </div>
      </div>

      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold">המתכונים שלי</h2>
        <Link to="/recipes/new" className="btn btn-primary">
          מתכון חדש
        </Link>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {recipes.map(recipe => (
          <div
            key={recipe.id}
            className="bg-white rounded-xl shadow-sm hover:shadow-md transition-shadow"
          >
            <div className="relative h-48">
              <img
                src={recipe.imageUrl || '/placeholder-recipe.jpg'}
                alt={recipe.title}
                className="w-full h-full object-cover rounded-t-xl"
                loading="lazy"
              />
              {recipe.isPublic && (
                <div className="absolute top-2 right-2 bg-primary-500 text-white px-2 py-1 rounded-full text-xs">
                  פורסם למשפחה
                </div>
              )}
            </div>
            
            <div className="p-4">
              <h3 className="text-lg font-semibold mb-2">{recipe.title}</h3>
              <div className="flex items-center gap-4 text-gray-600 text-sm mb-4">
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
              
              <div className="flex justify-between items-center">
                <Link
                  to={`/recipes/${recipe.id}`}
                  className="btn btn-secondary btn-sm"
                >
                  צפה במתכון
                </Link>
                <div className="flex gap-2">
                  <Link
                    to={`/recipes/edit/${recipe.id}`}
                    className="btn btn-ghost btn-sm"
                  >
                    <Edit className="w-4 h-4" />
                  </Link>
                  <button className="btn btn-ghost btn-sm text-error">
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>

      {recipes.length === 0 && (
        <div className="text-center py-12">
          <ChefHat className="w-16 h-16 text-gray-400 mx-auto mb-4" />
          <h3 className="text-xl font-semibold text-gray-700 mb-2">אין לך עדיין מתכונים</h3>
          <p className="text-gray-500 mb-4">
            התחל ליצור ולשתף את המתכונים האהובים עליך
          </p>
          <Link to="/recipes/new" className="btn btn-primary">
            צור מתכון חדש
          </Link>
        </div>
      )}
    </div>
  );
}

export default Profile;
