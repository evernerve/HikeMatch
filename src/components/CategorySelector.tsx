import { useCategory } from '../context/CategoryContext';
import { CATEGORIES, CategoryType } from '../types/categories';

export default function CategorySelector() {
  const { activeCategory, setActiveCategory } = useCategory();

  return (
    <div className="bg-white/80 backdrop-blur-xl border-b border-gray-100/50 sticky top-16 z-40">
      <div className="max-w-4xl mx-auto px-4 py-4">
        {/* Modern pill-style tabs */}
        <div className="flex justify-center items-center gap-2">
          {CATEGORIES.map((category) => {
            const isActive = activeCategory === category.id;
            return (
              <button
                key={category.id}
                onClick={() => setActiveCategory(category.id as CategoryType)}
                className={`
                  group relative flex items-center justify-center 
                  min-w-[64px] h-16 px-4 rounded-2xl
                  transition-all duration-300 ease-out
                  ${
                    isActive
                      ? 'bg-gradient-to-br from-primary-500 to-primary-600 text-white shadow-lg shadow-primary-500/30 scale-105'
                      : 'bg-white text-gray-500 hover:text-gray-700 hover:bg-gray-50 shadow-sm hover:shadow-md border border-gray-100'
                  }
                `}
              >
                {/* Icon with subtle animation */}
                <span 
                  className={`
                    text-3xl transition-transform duration-300
                    ${isActive ? 'scale-110' : 'group-hover:scale-110'}
                  `}
                >
                  {category.icon}
                </span>
                
                {/* Active indicator dot */}
                {isActive && (
                  <div className="absolute -bottom-1 left-1/2 -translate-x-1/2 w-1.5 h-1.5 bg-white rounded-full shadow-sm" />
                )}
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );
}
