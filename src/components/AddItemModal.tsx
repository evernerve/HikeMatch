/**
 * Modal for adding new user-contributed items
 */

import { useState, FormEvent, useEffect } from 'react';
import { CategoryType, getCategoryIcon, SwipeItem } from '../types/categories';
import { createUserContribution, updateUserContribution } from '../lib/firestoreHelpers';
import { validateContribution, checkRateLimit, updateRateLimit } from '../lib/contributionValidation';
import { getAuthErrorMessage, logError } from '../lib/errorHandling';
import { isQuickAddAvailable } from '../lib/aiPromptTemplates';
import HikeForm from './forms/HikeForm';
import MovieForm from './forms/MovieForm';
import TVShowForm from './forms/TVShowForm';
import RestaurantForm from './forms/RestaurantForm';
import { QuickAddForm } from './QuickAddForm';
import { ImageSearchModal } from './ImageSearchModal';

type AddMethod = 'manual' | 'quick';

interface AddItemModalProps {
  isOpen: boolean;
  onClose: () => void;
  activeCategory: CategoryType;
  onSuccess: () => void;
  editMode?: boolean;
  editItem?: SwipeItem;
}

export default function AddItemModal({ isOpen, onClose, activeCategory, onSuccess, editMode = false, editItem }: AddItemModalProps) {
  const [category, setCategory] = useState<CategoryType>(activeCategory);
  const [addMethod, setAddMethod] = useState<AddMethod>('manual');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);
  const [showImageSearch, setShowImageSearch] = useState(false);

  // Common fields
  const [name, setName] = useState('');
  const [image, setImage] = useState('');
  const [description, setDescription] = useState('');
  
  // Category-specific data
  const [categoryData, setCategoryData] = useState<any>({});

  // Validation errors
  const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({});
  const [warnings, setWarnings] = useState<Record<string, string>>({});

  // Check if quick add is available for this category
  const quickAddSupported = isQuickAddAvailable(category);

  // Pre-populate form in edit mode
  useEffect(() => {
    if (editMode && editItem) {
      setCategory(editItem.category);
      setName(editItem.name);
      setImage(editItem.image);
      setDescription(editItem.description);
      setCategoryData(editItem.categoryData);
      setAddMethod('manual'); // Always use manual form for editing
    }
  }, [editMode, editItem]);

  if (!isOpen) return null;

  const handleClose = () => {
    if (!loading) {
      // Reset form
      setName('');
      setImage('');
      setDescription('');
      setCategoryData({});
      setFieldErrors({});
      setWarnings({});
      setError('');
      setSuccess(false);
      onClose();
    }
  };

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setError('');
    setFieldErrors({});
    setWarnings({});

    // Check rate limit (only for new contributions, not edits)
    if (!editMode) {
      const rateLimitCheck = checkRateLimit(category);
      if (!rateLimitCheck.allowed) {
        setError(`⏱️ Please wait ${rateLimitCheck.waitTime} more minute(s) before adding another ${category} item.`);
        return;
      }
    }

    // Validate form
    const validation = validateContribution(category, name, image, description, categoryData);
    
    if (!validation.valid) {
      setFieldErrors(validation.errors);
      setError('Please fix the errors below before submitting.');
      return;
    }

    if (validation.warnings) {
      setWarnings(validation.warnings);
    }

    setLoading(true);

    try {
      if (editMode && editItem) {
        // Update existing item
        await updateUserContribution(
          editItem.id,
          category,
          {
            name: name.trim(),
            image: image.trim(),
            description: description.trim(),
            categoryData,
          }
        );
        console.log('✅ Item updated successfully:', editItem.id);
      } else {
        // Create new item
        const itemId = await createUserContribution(
          category,
          name,
          image,
          description,
          categoryData
        );
        console.log('✅ Item created successfully:', itemId);
        
        // Update rate limit only for new items
        updateRateLimit(category);
      }
      
      // Show success message
      setSuccess(true);
      
      // Wait a moment then close and refresh
      setTimeout(() => {
        handleClose();
        onSuccess();
      }, 2000);

    } catch (err: any) {
      logError(editMode ? 'Update Contribution' : 'User Contribution', err);
      const userMessage = getAuthErrorMessage(err);
      setError(userMessage || `Failed to ${editMode ? 'update' : 'create'} item. Please try again.`);
    } finally {
      setLoading(false);
    }
  };

  // Handle quick add submission (from AI-parsed data)
  const handleQuickAddSubmit = async (data: any, imageUrl: string, desc: string) => {
    setError('');
    
    console.log('🔍 handleQuickAddSubmit Debug:', {
      data,
      imageUrl,
      desc,
      category
    });
    
    // Check rate limit
    const rateLimitCheck = checkRateLimit(category);
    if (!rateLimitCheck.allowed) {
      setError(`⏱️ Please wait ${rateLimitCheck.waitTime} more minute(s) before adding another ${category} item.`);
      throw new Error('Rate limit exceeded');
    }

    setLoading(true);

    try {
      // For quick add, we use the parsed title as name
      const itemName = data.title || data.restaurantName || data.name || 'Untitled';
      
      console.log('🚀 Calling createUserContribution with:', {
        category,
        itemName,
        imageUrl,
        desc,
        data
      });
      
      const itemId = await createUserContribution(
        category,
        itemName,
        imageUrl,
        desc,
        data
      );

      console.log('✅ Item created successfully via Quick Add:', itemId);
      
      // Update rate limit
      updateRateLimit(category);
      
      // Show success message
      setSuccess(true);
      
      // Wait a moment then close and refresh
      setTimeout(() => {
        handleClose();
        onSuccess();
      }, 2000);

    } catch (err: any) {
      logError('Quick Add Contribution', err);
      const userMessage = getAuthErrorMessage(err);
      setError(userMessage || 'Failed to create item. Please try again.');
      throw err; // Re-throw so QuickAddForm can handle it
    } finally {
      setLoading(false);
    }
  };

  const categoryOptions = [
    { id: 'hikes' as CategoryType, name: 'Hiking Trail', icon: '🏔️' },
    { id: 'movies' as CategoryType, name: 'Movie', icon: '🎬' },
    { id: 'tv' as CategoryType, name: 'TV Show', icon: '📺' },
    { id: 'restaurants' as CategoryType, name: 'Restaurant', icon: '🍽️' },
  ];

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto">
      {/* Backdrop */}
      <div 
        className="fixed inset-0 bg-black bg-opacity-50 transition-opacity"
        onClick={handleClose}
      />

      {/* Modal */}
      <div className="flex min-h-screen items-center justify-center p-4">
        <div className="relative bg-white rounded-2xl shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
          {/* Header */}
          <div className="sticky top-0 bg-gradient-to-r from-primary-600 to-primary-700 text-white px-6 py-4 rounded-t-2xl flex items-center justify-between z-10 shadow-md">
            <div className="flex items-center space-x-3 flex-1 pr-4">
              <span className="text-3xl">{getCategoryIcon(category)}</span>
              <div className="flex-1 min-w-0">
                <h2 className="text-xl font-bold">{editMode ? 'Edit Item' : 'Add New Item'}</h2>
                <p className="text-sm text-primary-100">{editMode ? 'Update your contribution' : 'Share with the community'}</p>
              </div>
            </div>
            <button
              onClick={handleClose}
              disabled={loading}
              className="flex-shrink-0 text-white hover:text-primary-100 transition-colors disabled:opacity-50 p-1 hover:bg-white/10 rounded-lg"
              aria-label="Close modal"
            >
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>

          {/* Success Message */}
          {success && (
            <div className="p-6">
              <div className="bg-green-50 border border-green-300 rounded-lg p-4 text-center">
                <span className="text-4xl mb-2 block">🎉</span>
                <h3 className="text-lg font-bold text-green-800 mb-1">Success!</h3>
                <p className="text-green-700">Your contribution has been added.</p>
              </div>
            </div>
          )}

          {/* Form Content */}
          {!success && (
            <div className="p-6">
              {/* Category Selector */}
              <div className="mb-6">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Category {editMode && <span className="text-xs text-gray-500">(cannot be changed)</span>}
                </label>
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                  {categoryOptions.map((cat) => (
                    <button
                      key={cat.id}
                      type="button"
                      onClick={() => {
                        if (!editMode) {
                          setCategory(cat.id);
                          setCategoryData({});
                          setFieldErrors({});
                          // Reset to manual if quick add not available for new category
                          if (!isQuickAddAvailable(cat.id)) {
                            setAddMethod('manual');
                          }
                        }
                      }}
                      disabled={loading || editMode}
                      className={`p-3 rounded-lg border-2 transition-all ${
                        category === cat.id
                          ? 'border-primary-500 bg-primary-50 text-primary-700'
                          : 'border-gray-200 hover:border-gray-300 text-gray-700'
                      } ${editMode ? 'cursor-not-allowed opacity-60' : ''} disabled:opacity-50`}
                    >
                      <div className="text-2xl mb-1">{cat.icon}</div>
                      <div className="text-xs font-medium">{cat.name}</div>
                    </button>
                  ))}
                </div>
              </div>

              {/* Method Selector (only show if quick add is available and NOT in edit mode) */}
              {quickAddSupported && !editMode && (
                <div className="mb-6">
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Add Method
                  </label>
                  <div className="flex gap-2 p-1 bg-gray-100 rounded-lg">
                    <button
                      type="button"
                      onClick={() => setAddMethod('manual')}
                      disabled={loading}
                      className={`flex-1 px-4 py-2 text-sm font-medium rounded-md transition-all ${
                        addMethod === 'manual'
                          ? 'bg-white text-gray-900 shadow-sm'
                          : 'text-gray-600 hover:text-gray-900'
                      } disabled:opacity-50`}
                    >
                      📝 Manual Form
                    </button>
                    <button
                      type="button"
                      onClick={() => setAddMethod('quick')}
                      disabled={loading}
                      className={`flex-1 px-4 py-2 text-sm font-medium rounded-md transition-all ${
                        addMethod === 'quick'
                          ? 'bg-white text-gray-900 shadow-sm'
                          : 'text-gray-600 hover:text-gray-900'
                      } disabled:opacity-50`}
                    >
                      🤖 AI Helper
                    </button>
                  </div>
                </div>
              )}

              {/* Error Message */}
              {error && (
                <div className="mb-4 p-3 bg-red-50 border border-red-300 text-red-800 rounded-lg text-sm flex items-start">
                  <span className="mr-2 flex-shrink-0">⚠️</span>
                  <span className="flex-1">{error}</span>
                </div>
              )}

              {/* Render Quick Add or Manual Form */}
              {addMethod === 'quick' ? (
                <QuickAddForm
                  category={category}
                  onSubmit={handleQuickAddSubmit}
                  onCancel={handleClose}
                  loading={loading}
                />
              ) : (
                <form onSubmit={handleSubmit}>
                  {/* Category-Specific Form */}
                  {category === 'hikes' && (
                <HikeForm
                  name={name}
                  image={image}
                  description={description}
                  categoryData={categoryData}
                  fieldErrors={fieldErrors}
                  warnings={warnings}
                  loading={loading}
                  onNameChange={setName}
                  onImageChange={setImage}
                  onDescriptionChange={setDescription}
                  onCategoryDataChange={setCategoryData}
                  onImageSearch={() => setShowImageSearch(true)}
                />
              )}

              {category === 'movies' && (
                <MovieForm
                  name={name}
                  image={image}
                  description={description}
                  categoryData={categoryData}
                  fieldErrors={fieldErrors}
                  warnings={warnings}
                  loading={loading}
                  onNameChange={setName}
                  onImageChange={setImage}
                  onDescriptionChange={setDescription}
                  onCategoryDataChange={setCategoryData}
                  onImageSearch={() => setShowImageSearch(true)}
                />
              )}

              {category === 'tv' && (
                <TVShowForm
                  name={name}
                  image={image}
                  description={description}
                  categoryData={categoryData}
                  fieldErrors={fieldErrors}
                  warnings={warnings}
                  loading={loading}
                  onNameChange={setName}
                  onImageChange={setImage}
                  onDescriptionChange={setDescription}
                  onCategoryDataChange={setCategoryData}
                  onImageSearch={() => setShowImageSearch(true)}
                />
              )}

              {category === 'restaurants' && (
                <RestaurantForm
                  name={name}
                  image={image}
                  description={description}
                  categoryData={categoryData}
                  fieldErrors={fieldErrors}
                  warnings={warnings}
                  loading={loading}
                  onNameChange={setName}
                  onImageChange={setImage}
                  onDescriptionChange={setDescription}
                  onCategoryDataChange={setCategoryData}
                  onImageSearch={() => setShowImageSearch(true)}
                />
              )}

              {/* Submit Button */}
              <div className="mt-6 flex space-x-3">
                <button
                  type="button"
                  onClick={handleClose}
                  disabled={loading}
                  className="flex-1 px-4 py-3 border border-gray-300 rounded-lg text-gray-700 font-medium hover:bg-gray-50 transition-colors disabled:opacity-50"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={loading}
                  className="flex-1 px-4 py-3 bg-gradient-to-r from-primary-600 to-primary-700 text-white rounded-lg font-medium hover:from-primary-700 hover:to-primary-800 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {loading ? (
                    <span className="flex items-center justify-center">
                      <svg className="animate-spin -ml-1 mr-2 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                      </svg>
                      Adding...
                    </span>
                  ) : (
                    editMode ? 'Update Item' : 'Add Item'
                  )}
                </button>
              </div>
                </form>
              )}
            </div>
          )}
        </div>
      </div>

      {/* Image Search Modal */}
      <ImageSearchModal
        isOpen={showImageSearch}
        onClose={() => setShowImageSearch(false)}
        onSelectImage={(url) => {
          setImage(url);
          setShowImageSearch(false);
        }}
        category={category}
        searchQuery={name}
      />
    </div>
  );
}
