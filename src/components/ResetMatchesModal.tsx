import { useState } from 'react';
import { CategoryType } from '../types/categories';
import ConfirmModal from './ConfirmModal';

interface ResetMatchesModalProps {
  isOpen: boolean;
  friendName: string;
  friendUserId: string;
  onClose: () => void;
  onSendRequest: (userId: string, category: CategoryType) => Promise<void>;
}

const categoryEmojis: Record<CategoryType, string> = {
  hikes: '🥾',
  movies: '🎬',
  tv: '📺',
  restaurants: '🍽️'
};

const categoryLabels: Record<CategoryType, string> = {
  hikes: 'Hikes',
  movies: 'Movies',
  tv: 'TV Shows',
  restaurants: 'Restaurants'
};

export default function ResetMatchesModal({
  isOpen,
  friendName,
  friendUserId,
  onClose,
  onSendRequest
}: ResetMatchesModalProps) {
  const [selectedCategory, setSelectedCategory] = useState<CategoryType | null>(null);
  const [showConfirm, setShowConfirm] = useState(false);
  const [sending, setSending] = useState(false);

  const handleCategorySelect = (category: CategoryType) => {
    setSelectedCategory(category);
    setShowConfirm(true);
  };

  const handleConfirm = async () => {
    if (!selectedCategory) return;

    setSending(true);
    try {
      await onSendRequest(friendUserId, selectedCategory);
      setShowConfirm(false);
      setSelectedCategory(null);
      onClose();
    } catch (error) {
      console.error('Error sending reset request:', error);
    } finally {
      setSending(false);
    }
  };

  const handleCancel = () => {
    setShowConfirm(false);
    setSelectedCategory(null);
  };

  if (!isOpen) return null;

  return (
    <>
      {/* Category Selection Modal */}
      <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
        <div className="bg-white rounded-2xl shadow-2xl max-w-md w-full p-6 max-h-[90vh] overflow-y-auto">
          <div className="text-center mb-6">
            <div className="text-4xl mb-3">🔄</div>
            <h2 className="text-2xl font-bold text-gray-800 mb-2">
              Reset Matches
            </h2>
            <p className="text-gray-600">
              Choose a category to reset with <span className="font-semibold">{friendName}</span>
            </p>
          </div>

          <div className="space-y-3 mb-6">
            <p className="text-sm text-gray-500 text-center mb-4">
              This will clear all mutual matches and swipes for the selected category, allowing you both to swipe fresh!
            </p>

            {(['hikes', 'movies', 'tv', 'restaurants'] as CategoryType[]).map((category) => (
              <button
                key={category}
                onClick={() => handleCategorySelect(category)}
                className="w-full flex items-center gap-4 p-4 bg-gradient-to-r from-primary-50 to-forest-50 hover:from-primary-100 hover:to-forest-100 active:from-primary-200 active:to-forest-200 rounded-xl transition-all duration-200 border-2 border-transparent hover:border-primary focus:outline-none focus:border-primary"
              >
                <div className="text-3xl">{categoryEmojis[category]}</div>
                <div className="flex-1 text-left">
                  <div className="font-semibold text-gray-800">
                    {categoryLabels[category]}
                  </div>
                  <div className="text-sm text-gray-600">
                    Reset all {categoryLabels[category].toLowerCase()} matches
                  </div>
                </div>
                <div className="text-primary text-xl">→</div>
              </button>
            ))}
          </div>

          <button
            onClick={onClose}
            className="w-full py-3 px-4 bg-gray-100 hover:bg-gray-200 active:bg-gray-300 text-gray-800 font-semibold rounded-lg transition"
          >
            Cancel
          </button>
        </div>
      </div>

      {/* Confirmation Modal */}
      {showConfirm && selectedCategory && (
        <ConfirmModal
          isOpen={showConfirm}
          title={`Reset ${categoryLabels[selectedCategory]}?`}
          message={`${friendName} will receive a request to reset all ${categoryLabels[selectedCategory].toLowerCase()} matches with you. If they accept, all mutual matches and swipes will be cleared so you can swipe together again.`}
          confirmText={sending ? 'Sending...' : 'Send Request'}
          cancelText="Back"
          onConfirm={handleConfirm}
          onCancel={handleCancel}
          type="warning"
        />
      )}
    </>
  );
}
