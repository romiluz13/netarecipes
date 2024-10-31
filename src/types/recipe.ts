export interface Recipe {
  id: string;
  title: string;
  description: string;
  imageUrl: string;
  prepTime: number;
  cookTime: number;
  servings: number;
  difficulty: string;
  categories: string[];
  ingredients: {
    item: string;
    amount: number;
    unit: string;
  }[];
  instructions: string[];
  notes: string;
  userId: string;
  createdAt: string;
  updatedAt: string;
  isPublic: boolean;
  likes: number;
  likedBy?: string[];
}