import { Timestamp } from 'firebase/firestore';

export interface Recipe {
  id: string;
  title: string;
  description: string;
  ingredients: {
    item: string;
    amount: number;
    unit: string;
  }[];
  instructions: string[];
  prepTime: number;
  cookTime: number;
  servings: number;
  difficulty: string;
  categories: string[];
  imageUrl?: string;
  userId: string;
  createdAt: Date;
  updatedAt: Date;
  isPublic: boolean;
  likes: number;
  notes?: string;
}

export function validateRecipe(recipe: Partial<Recipe>): string[] {
  const errors: string[] = [];

  if (!recipe.title?.trim()) {
    errors.push('שם המתכון הוא שדה חובה');
  }

  if (!recipe.description?.trim()) {
    errors.push('תיאור המתכון הוא שדה חובה');
  }

  if (!recipe.ingredients || recipe.ingredients.length === 0) {
    errors.push('יש להוסיף לפחות מצרך אחד');
  } else {
    recipe.ingredients.forEach((ing, index) => {
      if (!ing.item.trim()) {
        errors.push(`שם המצרך ${index + 1} הוא שדה חובה`);
      }
      if (ing.amount <= 0) {
        errors.push(`כמות המצרך ${index + 1} חייבת להיות גדולה מ-0`);
      }
      if (!ing.unit.trim()) {
        errors.push(`יחידת המידה למצרך ${index + 1} היא שדה חובה`);
      }
    });
  }

  if (!recipe.instructions || recipe.instructions.length === 0) {
    errors.push('יש להוסיף לפחות הוראת הכנה אחת');
  } else {
    recipe.instructions.forEach((instruction, index) => {
      if (!instruction.trim()) {
        errors.push(`הוראת הכנה ${index + 1} היא שדה חובה`);
      }
    });
  }

  if (!recipe.prepTime || recipe.prepTime < 0) {
    errors.push('זמן ההכנה הוא שדה חובה ולא יכול להיות שלילי');
  }

  if (!recipe.cookTime || recipe.cookTime < 0) {
    errors.push('זמן הבישול הוא שדה חובה ולא יכול להיות שלילי');
  }

  if (!recipe.servings || recipe.servings <= 0) {
    errors.push('מספר המנות חייב להיות גדול מ-0');
  }

  if (!recipe.difficulty) {
    errors.push('רמת הקושי היא שדה חובה');
  }

  if (!recipe.categories || recipe.categories.length === 0) {
    errors.push('יש לבחור לפחות קטגוריה אחת');
  }

  return errors;
}
