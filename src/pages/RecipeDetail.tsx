import MetaTags from '../components/MetaTags';

function RecipeDetail() {
  // ... existing code ...

  return (
    <>
      <MetaTags
        title={recipe.title}
        description={recipe.description || `מתכון ל${recipe.title} - ${recipe.prepTime} דקות הכנה, ${recipe.servings} מנות`}
        image={recipe.imageUrl}
      />
      
      {/* ... rest of the component ... */}
    </>
  );
} 