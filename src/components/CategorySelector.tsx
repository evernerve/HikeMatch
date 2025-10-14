import { useCategory } from '../context/CategoryContext';
import { CATEGORIES, CategoryType } from '../types/categories';

export default function CategorySelector() {
  const { activeCategory, setActiveCategory } = useCategory();

  return (
    <div className="bg-white shadow-md sticky top-16 z-40">
      <div className="max-w-7xl mx-auto px-4 py-4">
        <div className="flex gap-2 overflow-x-auto scrollbar-thin scrollbar-thumb-gray-300 scrollbar-track-transparent pb-2">
          {CATEGORIES.map((category) => {
            const isActive = activeCategory === category.id;
            return (
              <button
                key={category.id}
                onClick={() => setActiveCategory(category.id as CategoryType)}
                className={`
                  flex items-center gap-2 px-4 py-2 rounded-full font-medium whitespace-nowrap
                  transition-all duration-200 transform hover:scale-105
                  ${
                    isActive
                      ? `${category.color} text-white shadow-lg`
                      : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                  }
                `}
              >
                <span className="text-xl">{category.icon}</span>
                <span className="text-sm font-semibold">{category.name}</span>
              </button>
            );
          })}
        </div>
        
        {/* Category Description */}
        <div className="mt-3 text-center">
          <p className="text-sm text-gray-600">
            {CATEGORIES.find(c => c.id === activeCategory)?.description}
          </p>
        </div>
      </div>
    </div>
  );
}
