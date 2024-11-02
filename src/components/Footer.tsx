import React from 'react';
import { Heart, UtensilsCrossed } from 'lucide-react';

const Footer: React.FC = () => {
  return (
    <footer className="bg-white border-t mt-12">
      <div className="max-w-7xl mx-auto py-8 px-4 text-center">
        <div className="flex items-center justify-center gap-2 mb-4">
          <UtensilsCrossed className="w-6 h-6 text-primary-500" />
          <span className="text-xl font-semibold">מתכוני המשפחה</span>
        </div>
        
        <p className="text-gray-600 mb-4">
          כי אין כמו לשמור את המתכונים המשפחתיים במקום אחד,
          <br />
          ולהעביר את הטעמים והזכרונות מדור לדור
          <br />
          (וגם להתווכח על המתכון המקורי של עוגת השמרים של סבתא 😉)
        </p>

        <div className="flex items-center justify-center gap-2 text-sm text-gray-500">
          <span>נבנה באהבה</span>
          <Heart className="w-4 h-4 text-red-500 fill-current" />
          <span>על ידי</span>
          <a 
            href="https://github.com/romiluz13" 
            target="_blank" 
            rel="noopener noreferrer"
            className="text-primary-600 hover:text-primary-700 font-medium"
          >
            רום אילוז
          </a>
        </div>

        <p className="text-xs text-gray-400 mt-4">
          גרסה 1.0 | כל הזכויות שמורות למשפחה המורחבת © {new Date().getFullYear()}
        </p>
      </div>
    </footer>
  );
};

export default Footer;
