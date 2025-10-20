/**
 * My Contributions Page
 * View, edit, and delete user's contributed items
 */

import { useState, useEffect } from 'react';
import { auth } from '../lib/firebase';
import { getUserContributions, deleteUserContribution } from '../lib/firestoreHelpers';
import { SwipeItem, CategoryType } from '../types/categories';
import ContributionCard from '../components/ContributionCard';
import AddItemModal from '../components/AddItemModal';
import ConfirmModal from '../components/ConfirmModal';
import Toast from '../components/Toast';

type FilterType = 'all' | CategoryType;

export default function MyContributions() {
  const user = auth.currentUser;
  const [contributions, setContributions] = useState<SwipeItem[]>([]);
  const [filteredContributions, setFilteredContributions] = useState<SwipeItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<FilterType>('all');
  
  // Edit modal state
  const [showEditModal, setShowEditModal] = useState(false);
  const [editingItem, setEditingItem] = useState<SwipeItem | null>(null);
  
  // Add modal state
  const [showAddModal, setShowAddModal] = useState(false);
  const [addCategory, setAddCategory] = useState<CategoryType>('hikes');
  
  // Delete confirmation state
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [deletingItem, setDeletingItem] = useState<SwipeItem | null>(null);
  
  // Toast state
  const [showToast, setShowToast] = useState(false);
  const [toastMessage, setToastMessage] = useState('');
  const [toastType, setToastType] = useState<'success' | 'error'>('success');

  // Load contributions
  useEffect(() => {
    loadContributions();
  }, [user]);

  // Filter contributions
  useEffect(() => {
    if (filter === 'all') {
      setFilteredContributions(contributions);
    } else {
      setFilteredContributions(contributions.filter(item => item.category === filter));
    }
  }, [filter, contributions]);

  const loadContributions = async () => {
    if (!user) return;
    
    setLoading(true);
    try {
      const items = await getUserContributions(user.uid);
      setContributions(items);
    } catch (error) {
      console.error('Error loading contributions:', error);
      showToastMessage('Failed to load contributions', 'error');
    } finally {
      setLoading(false);
    }
  };

  const handleEdit = (item: SwipeItem) => {
    setEditingItem(item);
    setShowEditModal(true);
  };

  const handleDeleteClick = (item: SwipeItem) => {
    setDeletingItem(item);
    setShowDeleteConfirm(true);
  };

  const handleDeleteConfirm = async () => {
    if (!deletingItem) return;
    
    try {
      await deleteUserContribution(deletingItem.id, deletingItem.category);
      showToastMessage('Item deleted successfully!', 'success');
      setShowDeleteConfirm(false);
      setDeletingItem(null);
      // Refresh list
      loadContributions();
    } catch (error: any) {
      console.error('Error deleting contribution:', error);
      showToastMessage(error.message || 'Failed to delete item', 'error');
    }
  };

  const showToastMessage = (message: string, type: 'success' | 'error') => {
    setToastMessage(message);
    setToastType(type);
    setShowToast(true);
  };

  const getCategoryStats = () => {
    const stats = {
      all: contributions.length,
      hikes: contributions.filter(i => i.category === 'hikes').length,
      movies: contributions.filter(i => i.category === 'movies').length,
      tv: contributions.filter(i => i.category === 'tv').length,
      restaurants: contributions.filter(i => i.category === 'restaurants').length,
    };
    return stats;
  };

  const stats = getCategoryStats();

  if (!user) {
    return (
      <div className="min-h-[calc(100vh-64px)] flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <span className="text-6xl mb-4 block">🔒</span>
          <h2 className="text-2xl font-bold text-gray-900 mb-2">Please log in</h2>
          <p className="text-gray-600">You need to be logged in to view your contributions.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-[calc(100vh-64px)] bg-gray-50">
      {/* Header */}
      <div className="bg-white border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">My Contributions</h1>
              <p className="text-gray-600 mt-1">Manage your shared items</p>
            </div>
            <div className="flex items-center gap-4">
              <div className="text-right">
                <p className="text-3xl font-bold text-primary-600">{stats.all}</p>
                <p className="text-sm text-gray-600">Total Items</p>
              </div>
              <button
                onClick={() => {
                  setAddCategory(filter !== 'all' ? filter : 'hikes');
                  setShowAddModal(true);
                }}
                className="px-4 py-2 bg-gradient-to-r from-blue-500 to-purple-600 text-white font-medium rounded-lg hover:from-blue-600 hover:to-purple-700 transition-all shadow-md hover:shadow-lg flex items-center gap-2"
              >
                <span className="text-lg">+</span>
                <span>Add Card</span>
              </button>
            </div>
          </div>

          {/* Filter Tabs */}
          <div className="flex gap-2 overflow-x-auto pb-2">
            <button
              onClick={() => setFilter('all')}
              className={`px-4 py-2 rounded-lg font-medium text-sm whitespace-nowrap transition-colors ${
                filter === 'all'
                  ? 'bg-primary-600 text-white'
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
            >
              All ({stats.all})
            </button>
            <button
              onClick={() => setFilter('hikes')}
              className={`px-4 py-2 rounded-lg font-medium text-sm whitespace-nowrap transition-colors flex items-center gap-1.5 ${
                filter === 'hikes'
                  ? 'bg-green-600 text-white'
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
            >
              <span>🏔️</span> Hikes ({stats.hikes})
            </button>
            <button
              onClick={() => setFilter('movies')}
              className={`px-4 py-2 rounded-lg font-medium text-sm whitespace-nowrap transition-colors flex items-center gap-1.5 ${
                filter === 'movies'
                  ? 'bg-red-600 text-white'
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
            >
              <span>🎬</span> Movies ({stats.movies})
            </button>
            <button
              onClick={() => setFilter('tv')}
              className={`px-4 py-2 rounded-lg font-medium text-sm whitespace-nowrap transition-colors flex items-center gap-1.5 ${
                filter === 'tv'
                  ? 'bg-purple-600 text-white'
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
            >
              <span>📺</span> TV Shows ({stats.tv})
            </button>
            <button
              onClick={() => setFilter('restaurants')}
              className={`px-4 py-2 rounded-lg font-medium text-sm whitespace-nowrap transition-colors flex items-center gap-1.5 ${
                filter === 'restaurants'
                  ? 'bg-orange-600 text-white'
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
            >
              <span>🍽️</span> Restaurants ({stats.restaurants})
            </button>
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {loading ? (
          <div className="flex justify-center items-center py-20">
            <div className="text-center">
              <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600 mb-4"></div>
              <p className="text-gray-600">Loading your contributions...</p>
            </div>
          </div>
        ) : filteredContributions.length === 0 ? (
          <div className="text-center py-20">
            <span className="text-6xl mb-4 block">
              {filter === 'all' ? '📝' : '🔍'}
            </span>
            <h2 className="text-2xl font-bold text-gray-900 mb-2">
              {filter === 'all' ? 'No contributions yet' : `No ${filter} found`}
            </h2>
            <p className="text-gray-600 mb-6">
              {filter === 'all' 
                ? 'Start sharing your favorite items with the community!'
                : 'Try selecting a different category or add a new item.'}
            </p>
            {filter === 'all' && (
              <button
                onClick={() => {
                  setAddCategory('hikes');
                  setShowAddModal(true);
                }}
                className="px-6 py-3 bg-gradient-to-r from-blue-500 to-purple-600 text-white font-medium rounded-lg hover:from-blue-600 hover:to-purple-700 transition-all shadow-md hover:shadow-lg inline-flex items-center gap-2"
              >
                <span className="text-xl">+</span>
                <span>Add Your First Card</span>
              </button>
            )}
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {filteredContributions.map((item) => (
              <ContributionCard
                key={item.id}
                item={item}
                onEdit={handleEdit}
                onDelete={handleDeleteClick}
              />
            ))}
          </div>
        )}
      </div>

      {/* Edit Modal */}
      <AddItemModal
        isOpen={showEditModal}
        onClose={() => {
          setShowEditModal(false);
          setEditingItem(null);
        }}
        activeCategory={editingItem?.category || 'hikes'}
        onSuccess={() => {
          showToastMessage('Item updated successfully!', 'success');
          loadContributions();
        }}
        editMode={true}
        editItem={editingItem || undefined}
      />

      {/* Add Modal */}
      <AddItemModal
        isOpen={showAddModal}
        onClose={() => {
          setShowAddModal(false);
        }}
        activeCategory={addCategory}
        onSuccess={() => {
          showToastMessage('Item added successfully!', 'success');
          loadContributions();
          setShowAddModal(false);
        }}
        editMode={false}
      />

      {/* Delete Confirmation */}
      <ConfirmModal
        isOpen={showDeleteConfirm}
        title="Delete Contribution"
        message={`Are you sure you want to delete "${deletingItem?.name}"? This action cannot be undone.`}
        confirmText="Delete"
        onConfirm={handleDeleteConfirm}
        onCancel={() => {
          setShowDeleteConfirm(false);
          setDeletingItem(null);
        }}
        type="warning"
      />

      {/* Toast */}
      <Toast
        isOpen={showToast}
        message={toastMessage}
        type={toastType}
        onClose={() => setShowToast(false)}
      />
    </div>
  );
}
