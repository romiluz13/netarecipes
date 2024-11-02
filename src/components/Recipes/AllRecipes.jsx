import { collection, query, getDocs } from 'firebase/firestore';
import { db } from '../../firebase/config';

function AllRecipes() {
  const [recipes, setRecipes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchRecipes = async () => {
      try {
        const recipesRef = collection(db, 'recipes');
        const q = query(recipesRef);
        const querySnapshot = await getDocs(q);
        
        const recipesData = querySnapshot.docs.map(doc => ({
          id: doc.id,
          ...doc.data()
        }));
        
        setRecipes(recipesData);
      } catch (err) {
        console.error('Error fetching recipes:', err);
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchRecipes();
  }, []);

  if (loading) return <div>טוען מתכונים...</div>;
  if (error) return <div>שגיאה בטעינת המתכונים: {error}</div>;
  if (!recipes.length) return <div>אין מתכונים להצגה</div>;

  return (
    <div className="recipes-grid">
      {recipes.map(recipe => (
        <RecipeCard key={recipe.id} recipe={recipe} />
      ))}
    </div>
  );
} 