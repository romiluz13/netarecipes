import React from 'react';

const RecipeView: React.FC = () => {
  return (
    <div className="max-w-7xl mx-auto px-4 py-6">
      {/* כותרת ותמונה ראשית - תמיד בראש */}
      <div className="bg-white rounded-xl shadow-sm p-4 md:p-6 mb-6">
        <h1 className="text-2xl md:text-3xl font-bold mb-4">{recipe.title}</h1>
        {recipe.imageUrl && (
          <img 
            src={recipe.imageUrl} 
            alt={recipe.title}
            className="w-full h-64 md:h-96 object-cover rounded-lg"
          />
        )}
        
        {/* פרטים מהירים - מתחת לתמונה במובייל */}
        <div className="mt-4 lg:hidden grid grid-cols-2 gap-4 text-sm border-t pt-4">
          <div>
            <span className="text-gray-600">זמן הכנה:</span>
            <p className="font-medium">{recipe.prepTime} דקות</p>
          </div>
          <div>
            <span className="text-gray-600">זמן בישול:</span>
            <p className="font-medium">{recipe.cookTime} דקות</p>
          </div>
          <div>
            <span className="text-gray-600">מספר מנות:</span>
            <p className="font-medium">{recipe.servings}</p>
          </div>
          <div>
            <span className="text-gray-600">רמת קושי:</span>
            <p className="font-medium">{recipe.difficulty}</p>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* מצרכים - ראשון במובייל, ימני בדסקטופ */}
        <div className="lg:order-1 order-first">
          <div className="bg-white rounded-xl shadow-sm p-4 md:p-6 lg:sticky lg:top-4">
            <h2 className="text-xl font-bold mb-4">מצרכים</h2>
            <ul className="space-y-2">
              {recipe.ingredients.map((ing, idx) => (
                <li key={idx} className="flex justify-between items-center py-1 border-b last:border-0">
                  <span className="font-medium">{ing.item}</span>
                  <span className="text-gray-600">{ing.amount} {ing.unit}</span>
                </li>
              ))}
            </ul>
            
            {/* פרטים טכניים - מוצגים רק בדסקטופ */}
            <div className="mt-6 pt-4 border-t hidden lg:block">
              <div className="grid grid-cols-2 gap-4 text-sm">
                <div>
                  <span className="text-gray-600">זמן הכנה:</span>
                  <p className="font-medium">{recipe.prepTime} דקות</p>
                </div>
                <div>
                  <span className="text-gray-600">זמן בישול:</span>
                  <p className="font-medium">{recipe.cookTime} דקות</p>
                </div>
                <div>
                  <span className="text-gray-600">מספר מנות:</span>
                  <p className="font-medium">{recipe.servings}</p>
                </div>
                <div>
                  <span className="text-gray-600">רמת קושי:</span>
                  <p className="font-medium">{recipe.difficulty}</p>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* תוכן מרכזי */}
        <div className="lg:col-span-2 space-y-6 lg:order-2">
          {/* תיאור */}
          <div className="bg-white rounded-xl shadow-sm p-4 md:p-6">
            <h2 className="text-xl font-bold mb-4">תיאור</h2>
            <p className="text-gray-700 leading-relaxed">{recipe.description}</p>
          </div>

          {/* הוראות הכנה */}
          <div className="bg-white rounded-xl shadow-sm p-4 md:p-6">
            <h2 className="text-xl font-bold mb-4">הוראות הכנה</h2>
            <ol className="space-y-4">
              {recipe.instructions.map((instruction, idx) => (
                <li key={idx} className="flex gap-4">
                  <span className="flex-shrink-0 w-8 h-8 bg-primary-50 text-primary-600 rounded-full flex items-center justify-center font-bold">
                    {idx + 1}
                  </span>
                  <p className="flex-1 leading-relaxed">{instruction}</p>
                </li>
              ))}
            </ol>
          </div>

          {/* הערות נוספות */}
          {recipe.notes && (
            <div className="bg-white rounded-xl shadow-sm p-4 md:p-6">
              <h2 className="text-xl font-bold mb-4">טיפים והערות</h2>
              <p className="text-gray-700 leading-relaxed">{recipe.notes}</p>
            </div>
          )}
        </div>
      </div>

      {/* תגובות - תמיד בסוף */}
      <div className="mt-6">
        <div className="bg-white rounded-xl shadow-sm p-4 md:p-6">
          <h2 className="text-xl font-bold mb-4">תגובות</h2>
          <Comments recipeId={recipe.id} />
        </div>
      </div>
    </div>
  );
};

export default RecipeView; 