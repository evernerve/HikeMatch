/**
 * Floating Action Button for adding new items
 */

interface AddItemButtonProps {
  onClick: () => void;
}

export default function AddItemButton({ onClick }: AddItemButtonProps) {
  return (
    <button
      onClick={onClick}
      className="fixed bottom-6 right-6 z-40 w-14 h-14 sm:w-16 sm:h-16 bg-gradient-to-r from-primary-600 to-primary-700 text-white rounded-full shadow-2xl hover:shadow-3xl hover:scale-110 active:scale-95 transition-all duration-200 flex items-center justify-center group"
      title="Add new item"
      aria-label="Add new item to this category"
    >
      <svg 
        className="w-7 h-7 sm:w-8 sm:h-8 group-hover:rotate-90 transition-transform duration-200" 
        fill="none" 
        stroke="currentColor" 
        viewBox="0 0 24 24"
      >
        <path 
          strokeLinecap="round" 
          strokeLinejoin="round" 
          strokeWidth={2.5} 
          d="M12 4v16m8-8H4" 
        />
      </svg>
    </button>
  );
}
