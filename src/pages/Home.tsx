import React from 'react';
import { useNavigate } from 'react-router-dom';
import { ChefHat, TrendingUp, Clock, Users } from 'lucide-react';

function Home() {
  const navigate = useNavigate();

  const features = [
    {
      icon: ChefHat,
      title: 'שמירת מתכונים',
      description: 'ארגון כל המתכונים האהובים במקום אחד',
    },
    {
      icon: TrendingUp,
      title: 'גילוי מתכונים',
      description: 'חיפוש והשראה ממתכונים של משתמשים אחרים',
    },
    {
      icon: Clock,
      title: 'תזמון וארגון',
      description: 'מעקב אחר זמני הכנה ובישול',
    },
    {
      icon: Users,
      title: 'שיתוף קהילתי',
      description: 'שיתוף מתכונים עם משפחה וחברים',
    },
  ];

  return (
    <div className="space-y-12">
      <section className="text-center">
        <h1 className="text-4xl font-bold mb-4">המתכונים שלי</h1>
        <p className="text-gray-600 max-w-2xl mx-auto mb-8">
          המקום המושלם לארגון וניהול המתכונים האהובים עליכם
        </p>
        <button
          onClick={() => navigate('/recipes/new')}
          className="btn btn-primary"
        >
          הוסף מתכון חדש
        </button>
      </section>

      <section className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {features.map(({ icon: Icon, title, description }) => (
          <div key={title} className="card p-6">
            <div className="w-12 h-12 bg-primary-50 rounded-lg flex items-center justify-center mb-4">
              <Icon className="w-6 h-6 text-primary-500" />
            </div>
            <h3 className="text-lg font-semibold mb-2">{title}</h3>
            <p className="text-gray-600">{description}</p>
          </div>
        ))}
      </section>
    </div>
  );
}

export default Home;