import { Timestamp } from 'firebase/firestore';

export type DifficultyLevel = 'קל' | 'בינוני' | 'מאתגר';

export interface Ingredient {
  item: string;
  amount: number;
  unit: string;
}

export interface Comment {
  id: string;
  userId: string;
  text: string;
  createdAt: Timestamp;
  updatedAt?: Timestamp;
}

export interface Recipe {
  id: string;
  title: string;
  description: string;
  imageUrl: string;
  prepTime: number;
  cookTime: number;
  servings: number;
  difficulty: DifficultyLevel;
  categories: string[];
  ingredients: Ingredient[];
  instructions: string[];
  notes?: string;
  userId: string;
  createdAt: Timestamp;
  updatedAt: Timestamp;
  isPublic: boolean;
  likes: number;
  comments?: Comment[];
}

export const DIFFICULTY_LEVELS: DifficultyLevel[] = ['קל', 'בינוני', 'מאתגר'];

export const COMMON_UNITS = [
  'יחידה',
  'כפית',
  'כף',
  'כוס',
  'גרם',
  'קילו',
  'מ"ל',
  'ליטר',
  'חבילה',
  'קופסה',
  'שן',
  'פרוסה',
  'חתיכה'
];

export function validateRecipe(recipe: Partial<Recipe>): string[] {
  const errors: string[] = [];

  if (!recipe.title?.trim()) {
    errors.push('שם המתכון הוא שדה חובה');
  } else if (recipe.title.length > 100) {
    errors.push('שם המתכון ארוך מדי (מקסימום 100 תווים)');
  }

  if (!recipe.description?.trim()) {
    errors.push('תיאור המתכון הוא שדה חובה');
  }

  if (!recipe.ingredients?.length) {
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

  if (!recipe.instructions?.length) {
    errors.push('יש להוסיף לפחות הוראת הכנה אחת');
  } else {
    recipe.instructions.forEach((instruction, index) => {
      if (!instruction.trim()) {
        errors.push(`הוראת הכנה ${index + 1} היא שדה חובה`);
      }
    });
  }

  if (!recipe.categories?.length) {
    errors.push('יש לבחור לפחות קטגוריה אחת');
  }

  if (recipe.prepTime === undefined || recipe.prepTime < 0) {
    errors.push('זמן ההכנה הוא שדה חובה ולא יכול להיות שלילי');
  }

  if (recipe.cookTime === undefined || recipe.cookTime < 0) {
    errors.push('זמן הבישול הוא שדה חובה ולא יכול להיות שלילי');
  }

  if (recipe.servings === undefined || recipe.servings <= 0) {
    errors.push('מספר המנות חייב להיות גדול מ-0');
  }

  if (!recipe.difficulty || !DIFFICULTY_LEVELS.includes(recipe.difficulty)) {
    errors.push('יש לבחור רמת קושי תקינה');
  }

  return errors;
}

export function formatDuration(minutes: number): string {
  if (minutes < 60) {
    return `${minutes} דקות`;
  }
  
  const hours = Math.floor(minutes / 60);
  const remainingMinutes = minutes % 60;
  
  if (remainingMinutes === 0) {
    return `${hours} ${hours === 1 ? 'שעה' : 'שעות'}`;
  }
  
  return `${hours} ${hours === 1 ? 'שעה' : 'שעות'} ו-${remainingMinutes} דקות`;
}

export function getTotalTime(recipe: Recipe): string {
  return formatDuration(recipe.prepTime + recipe.cookTime);
}
