export interface Recipe {
  id: string;
  title: string;
  description: string;
  imageUrl: string;
  prepTime: number;
  cookTime: number;
  servings: number;
  difficulty: 'קל' | 'בינוני' | 'מאתגר';
  categories: string[];
  ingredients: {
    item: string;
    amount: number;
    unit: string;
  }[];
  instructions: string[];
  notes: string;
  userId: string;
  createdAt: Date;
  updatedAt: Date;
  likes: number;
  isPublic: boolean;
}