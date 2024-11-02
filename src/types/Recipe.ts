export interface Recipe {
  id?: string;
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
} 