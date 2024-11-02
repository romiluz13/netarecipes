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
    <div className="space-y-6 p-4 md:p-6">
      {/* Profile Header Section */}
      <div className="bg-white rounded-xl shadow-sm p-6 mb-6">
        <div className="flex flex-col sm:flex-row items-center gap-6">
          {/* Profile Photo */}
          <div className="relative">
            <div className="w-32 h-32 rounded-full overflow-hidden">
              <img
                src={user?.photoURL || '/placeholder-avatar.jpg'}
                alt="תמונת פרופיל"
                className="w-full h-full object-cover"
              />
            </div>
            <label className="absolute bottom-0 right-0 bg-primary-500 text-white p-2 rounded-full cursor-pointer hover:bg-primary-600 transition-colors">
              <input
                type="file"
                accept="image/*"
                onChange={handlePhotoUpload}
                className="hidden"
              />
              <Camera className="w-4 h-4" />
            </label>
          </div>

          {/* Profile Info */}
          <div className="flex-1 text-center sm:text-right">
            <div className="flex items-center justify-center sm:justify-start gap-2 mb-2">
              {isEditingName ? (
                <div className="flex gap-2">
                  <input
                    type="text"
                    value={displayName}
                    onChange={(e) => setDisplayName(e.target.value)}
                    className="rounded-md border-gray-300"
                  />
                  <button
                    onClick={handleNameUpdate}
                    className="btn btn-primary btn-sm"
                  >
                    שמור
                  </button>
                </div>
              ) : (
                <>
                  <h2 className="text-2xl font-bold">{user?.displayName}</h2>
                  <button
                    onClick={() => setIsEditingName(true)}
                    className="text-gray-500 hover:text-primary-500"
                  >
                    <Edit className="w-4 h-4" />
                  </button>
                </>
              )}
            </div>
            <p className="text-gray-600 mb-4">{user?.email}</p>

            {/* Stats */}
            <div className="grid grid-cols-2 gap-4 text-center">
              <div className="bg-gray-50 rounded-lg p-3">
                <div className="text-2xl font-bold text-primary-500">
                  {stats.totalRecipes}
                </div>
                <div className="text-sm text-gray-600">מתכונים</div>
              </div>
              <div className="bg-gray-50 rounded-lg p-3">
                <div className="text-2xl font-bold text-primary-500">
                  {stats.totalLikes}
                </div>
                <div className="text-sm text-gray-600">לייקים</div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Existing Recipes Section */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <h1 className="text-2xl md:text-3xl font-bold">המתכונים שלי</h1>
        <Link to="/recipes/new" className="btn btn-primary w-full sm:w-auto">
          מתכון חדש
        </Link>
      </div>

      {/* Rest of the component stays the same */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {recipes.map(recipe => (
          <div key={recipe.id} className="bg-white rounded-xl shadow-sm hover:shadow-md transition-shadow">
            <div className="relative h-48">
              <img
                src={recipe.imageUrl || '/placeholder-recipe.jpg'}
                alt={recipe.title}
                className="w-full h-full object-cover rounded-t-xl"
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
                  <span>{recipe.prepTime} דקות</span>
                </div>
                <div className="flex items-center gap-1">
                  <Users className="w-4 h-4" />
                  <span>{recipe.servings} מנות</span>
                </div>
              </div>
              
              <div className="flex justify-between items-center">
                <Link
                  to={`/recipe/${recipe.id}`}
                  className="btn btn-secondary btn-sm"
                >
                  צפה במתכון
                </Link>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

export default Profile;
