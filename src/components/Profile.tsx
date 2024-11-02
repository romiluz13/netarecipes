import React, { useState } from 'react';
import RecipeCard from './RecipeCard';

function Profile() {
  const [recipes, setRecipes] = useState([]);

  return (
    <div>
      <h1 className="text-2xl font-bold">המתכונים שלי</h1>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {recipes.map((recipe) => (
          <RecipeCard key={recipe.id} recipe={recipe} />
        ))}
      </div>
    </div>
  );
}

export default Profile; 