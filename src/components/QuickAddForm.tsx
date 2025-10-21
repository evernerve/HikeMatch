/**
 * QuickAddForm Component
 * 
 * AI-assisted form that allows users to:
 * 1. Copy a prompt to paste into any AI (ChatGPT, Claude, etc.)
 * 2. Paste the AI's response
 * 3. Preview and edit extracted data
 * 4. Submit the contribution
 */

import { useState } from 'react';
import type { CategoryType } from '../types/categories';
import { generateTVShowPrompt, generateRestaurantPrompt, generateHikePrompt, generateMoviePrompt } from '../lib/aiPromptTemplates';
import { parseText, type ParseResult } from '../lib/textParser';
import { ImageSearchModal } from './ImageSearchModal';

interface QuickAddFormProps {
  category: CategoryType;
  onSubmit: (data: any, imageUrl: string, description: string) => Promise<void>;
  onCancel: () => void;
  loading: boolean;
}

type ViewMode = 'prompt' | 'preview';

export function QuickAddForm({ category, onSubmit, onCancel, loading }: QuickAddFormProps) {
  const [viewMode, setViewMode] = useState<ViewMode>('prompt');
  const [pastedText, setPastedText] = useState('');
  const [parseResult, setParseResult] = useState<ParseResult<any> | null>(null);
  const [editedData, setEditedData] = useState<any>(null);
  const [editingField, setEditingField] = useState<string | null>(null);
  const [showRawText, setShowRawText] = useState(false);
  const [showImageSearch, setShowImageSearch] = useState(false);
  const [imageSearchQuery, setImageSearchQuery] = useState('');

  // Generate the prompt
  const prompt = category === 'tv' 
    ? generateTVShowPrompt() 
    : category === 'restaurants' 
    ? generateRestaurantPrompt()
    : category === 'hikes'
    ? generateHikePrompt()
    : category === 'movies'
    ? generateMoviePrompt()
    : '';

  // Copy prompt to clipboard
  const handleCopyPrompt = async () => {
    try {
      await navigator.clipboard.writeText(prompt);
      // TODO: Show toast notification
    } catch (error) {
      console.error('Failed to copy:', error);
    }
  };

  // Parse the pasted text
  const handleParse = () => {
    if (!pastedText.trim()) return;

    const result = parseText(pastedText, category);
    setParseResult(result);
    setEditedData(result.data);
    
    if (result.success) {
      setViewMode('preview');
    }
  };

  // Update a field value
  const updateField = (field: string, value: any) => {
    setEditedData((prev: any) => ({
      ...prev,
      [field]: value
    }));
  };

  // Handle form submission
  const handleSubmit = async () => {
    if (!editedData || !parseResult) return;

    try {
      // Extract image URL and description based on category
      const imageUrl = (editedData as any).imageUrl || '';
      let description = '';
      let name = '';
      
      if (category === 'tv') {
        description = editedData.plot || '';
        name = editedData.title || '';
      } else if (category === 'restaurants') {
        description = (editedData as any).description || '';
        name = editedData.restaurantName || '';
      } else if (category === 'hikes') {
        description = (editedData as any).description || '';
        name = (editedData as any).name || '';
      } else if (category === 'movies') {
        description = editedData.plot || '';
        name = editedData.title || '';
      }
      
      console.log('🔍 QuickAddForm Debug:', {
        category,
        imageUrl,
        description,
        name,
        editedDataKeys: Object.keys(editedData),
        editedData
      });
      
      // Remove imageUrl, description, and name from data as they're not part of categoryData
      const { imageUrl: _, description: __, name: ___, ...categoryData } = editedData as any;

      await onSubmit(categoryData, imageUrl, description);
    } catch (error) {
      console.error('Failed to submit:', error);
    }
  };

  // Render a field editor
  const renderFieldEditor = (field: string, value: any, label: string) => {
    const isEditing = editingField === field;
    const isEmpty = value === null || value === undefined || value === '' || (Array.isArray(value) && value.length === 0);
    const isImageField = field === 'imageUrl';

    return (
      <div key={field} className="group flex items-start justify-between px-4 py-3 hover:bg-gray-50 transition-colors">
        <div className="flex-1">
          <div className="flex items-center gap-2 mb-1">
            <div className="text-xs font-medium text-gray-600">{label}</div>
            {isImageField && (
              <button
                onClick={() => {
                  setImageSearchQuery(
                    category === 'tv' || category === 'movies' 
                      ? editedData?.title || ''
                      : category === 'restaurants'
                      ? editedData?.restaurantName || ''
                      : editedData?.name || ''
                  );
                  setShowImageSearch(true);
                }}
                className="text-xs px-2 py-0.5 bg-purple-100 text-purple-700 hover:bg-purple-200 rounded transition-colors"
                disabled={loading}
              >
                🔍 Search Images
              </button>
            )}
          </div>
          {isEditing ? (
            <div className="space-y-2">
              {Array.isArray(value) ? (
                <input
                  type="text"
                  value={value.join(', ')}
                  onChange={(e) => updateField(field, e.target.value.split(',').map((s: string) => s.trim()))}
                  className="w-full px-2 py-1 text-sm border border-blue-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="Comma-separated values"
                  autoFocus
                />
              ) : field === 'plot' || field === 'description' || field === 'detailedDescription' ? (
                <textarea
                  value={value || ''}
                  onChange={(e) => updateField(field, e.target.value)}
                  className="w-full px-2 py-1 text-sm border border-blue-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
                  rows={3}
                  autoFocus
                />
              ) : (
                <input
                  type={typeof value === 'number' ? 'number' : 'text'}
                  value={value || ''}
                  onChange={(e) => updateField(field, typeof value === 'number' ? Number(e.target.value) : e.target.value)}
                  className="w-full px-2 py-1 text-sm border border-blue-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
                  autoFocus
                />
              )}
              <button
                onClick={() => setEditingField(null)}
                className="text-xs text-blue-600 hover:text-blue-700"
              >
                Done
              </button>
            </div>
          ) : (
            <div className={`text-sm ${isEmpty ? 'text-gray-400 italic' : 'text-gray-900'}`}>
              {isEmpty ? 'Not provided' : (
                Array.isArray(value) ? value.join(', ') : String(value)
              )}
            </div>
          )}
        </div>
        <button
          onClick={() => setEditingField(isEditing ? null : field)}
          className="ml-3 opacity-0 group-hover:opacity-100 text-sm text-blue-600 hover:text-blue-700 transition-opacity"
          disabled={loading}
        >
          {isEditing ? '✓' : '✏️'}
        </button>
      </div>
    );
  };  // Prompt view
  if (viewMode === 'prompt') {
    return (
      <div className="space-y-4">
        {/* Header */}
        <div className="border-b border-gray-200 pb-4">
          <h3 className="text-lg font-semibold text-gray-900 flex items-center gap-2">
            🤖 AI-Assisted Quick Add
          </h3>
          <p className="text-sm text-gray-600 mt-1">
            Use any AI assistant to help you add items quickly
          </p>
        </div>

        {/* Step 1: Copy Prompt */}
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <h4 className="text-sm font-semibold text-gray-800">
              Step 1: Copy this prompt
            </h4>
            <button
              onClick={handleCopyPrompt}
              className="px-3 py-1.5 text-sm font-medium text-white bg-blue-600 rounded-lg hover:bg-blue-700 transition-colors flex items-center gap-2"
            >
              📋 Copy Prompt
            </button>
          </div>

          <div className="relative">
            <pre className="text-xs bg-gray-50 border border-gray-200 rounded-lg p-4 overflow-x-auto whitespace-pre-wrap font-mono">
              {prompt}
            </pre>
          </div>

          <div className="bg-blue-50 border border-blue-200 rounded-lg p-3">
            <p className="text-sm text-blue-800">
              💡 <strong>Tip:</strong> Paste this into ChatGPT, Claude, Gemini, or any AI assistant. 
              You can add the show name to the prompt before pasting.
            </p>
          </div>
        </div>

        {/* Step 2: Paste Response */}
        <div className="space-y-3">
          <h4 className="text-sm font-semibold text-gray-800">
            Step 2: Paste AI response here
          </h4>

          <textarea
            value={pastedText}
            onChange={(e) => setPastedText(e.target.value)}
            placeholder="Paste the AI's response here..."
            className="w-full h-48 px-3 py-2 text-sm text-white bg-gray-900 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent font-mono placeholder-gray-400"
            disabled={loading}
          />

          {parseResult && !parseResult.success && (
            <div className="bg-red-50 border border-red-200 rounded-lg p-3">
              <p className="text-sm font-medium text-red-800">⚠️ Parsing Issues:</p>
              <ul className="mt-2 space-y-1">
                {parseResult.errors.map((error, i) => (
                  <li key={i} className="text-sm text-red-700">• {error}</li>
                ))}
              </ul>
            </div>
          )}
        </div>

        {/* Actions */}
        <div className="flex items-center justify-end gap-3 pt-4 border-t border-gray-200">
          <button
            onClick={onCancel}
            className="px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-100 rounded-lg transition-colors"
            disabled={loading}
          >
            Cancel
          </button>
          <button
            onClick={handleParse}
            disabled={!pastedText.trim() || loading}
            className="px-4 py-2 text-sm font-medium text-white bg-blue-600 rounded-lg hover:bg-blue-700 disabled:bg-gray-300 disabled:cursor-not-allowed transition-colors"
          >
            Parse & Preview →
          </button>
        </div>
      </div>
    );
  }

  // Preview view
  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="border-b border-gray-200 pb-4">
        <h3 className="text-lg font-semibold text-gray-900 flex items-center gap-2">
          ✨ Preview Extracted Data
        </h3>
        <p className="text-sm text-gray-600 mt-1">
          Review and edit the information before submitting
        </p>
      </div>

      {/* Image Preview */}
      {editedData && (editedData as any).imageUrl && (
        <div className="border border-gray-200 rounded-lg overflow-hidden bg-gray-50">
          <div className="bg-gray-100 px-4 py-2 border-b border-gray-200">
            <h4 className="text-sm font-semibold text-gray-800">Image Preview</h4>
          </div>
          <div className="p-4 flex justify-center">
            <img
              src={(editedData as any).imageUrl}
              alt="Preview"
              className="max-w-full max-h-64 rounded-lg object-cover shadow-md"
              onError={(e) => {
                (e.target as HTMLImageElement).src = 'https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?w=800&auto=format&fit=crop';
              }}
            />
          </div>
        </div>
      )}

      {/* Status Messages */}
      {parseResult && (
        <div className="space-y-2">
          {parseResult.success && (
            <div className="bg-green-50 border border-green-200 rounded-lg p-3">
              <p className="text-sm text-green-800">
                ✓ Successfully extracted {Object.keys(editedData).length} fields
              </p>
            </div>
          )}

          {parseResult.warnings.length > 0 && (
            <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-3">
              <p className="text-sm font-medium text-yellow-800">⚠️ Warnings:</p>
              <ul className="mt-1 space-y-1">
                {parseResult.warnings.map((warning, i) => (
                  <li key={i} className="text-sm text-yellow-700">• {warning}</li>
                ))}
              </ul>
            </div>
          )}

          {parseResult.missing.length > 0 && (
            <details className="bg-gray-50 border border-gray-200 rounded-lg p-3">
              <summary className="text-sm font-medium text-gray-700 cursor-pointer">
                ℹ️ Missing optional fields ({parseResult.missing.length})
              </summary>
              <ul className="mt-2 space-y-1">
                {parseResult.missing.map((field, i) => (
                  <li key={i} className="text-sm text-gray-600">• {field}</li>
                ))}
              </ul>
            </details>
          )}
        </div>
      )}

      {/* Editable Fields */}
      <div className="border border-gray-200 rounded-lg overflow-hidden">
        <div className="bg-gray-50 px-4 py-2 border-b border-gray-200">
          <h4 className="text-sm font-semibold text-gray-800">Extracted Information</h4>
          <p className="text-xs text-gray-600">Click any field to edit</p>
        </div>

        <div className="divide-y divide-gray-100 max-h-96 overflow-y-auto">
          {editedData && category === 'tv' && (
            <>
              {renderFieldEditor('title', editedData.title, 'Title')}
              {renderFieldEditor('startYear', editedData.startYear, 'Start Year')}
              {renderFieldEditor('endYear', editedData.endYear, 'End Year')}
              {renderFieldEditor('status', editedData.status, 'Status')}
              {renderFieldEditor('seasons', editedData.seasons, 'Seasons')}
              {renderFieldEditor('episodes', editedData.episodes, 'Episodes')}
              {renderFieldEditor('genres', editedData.genres, 'Genres')}
              {renderFieldEditor('creator', editedData.creator, 'Creator')}
              {renderFieldEditor('cast', editedData.cast, 'Cast')}
              {renderFieldEditor('plot', editedData.plot, 'Plot')}
              {renderFieldEditor('network', editedData.network, 'Network')}
              {renderFieldEditor('imageUrl', (editedData as any).imageUrl, 'Image URL')}
            </>
          )}
          
          {editedData && category === 'restaurants' && (
            <>
              {renderFieldEditor('restaurantName', editedData.restaurantName, 'Restaurant Name')}
              {renderFieldEditor('cuisine', editedData.cuisine, 'Cuisine')}
              {renderFieldEditor('priceRange', editedData.priceRange, 'Price Range')}
              {renderFieldEditor('location', editedData.location, 'Location')}
              {renderFieldEditor('address', editedData.address, 'Address')}
              {renderFieldEditor('rating', editedData.rating, 'Rating')}
              {renderFieldEditor('reviewCount', editedData.reviewCount, 'Review Count')}
              {renderFieldEditor('phone', editedData.phone, 'Phone')}
              {renderFieldEditor('website', editedData.website, 'Website')}
              {renderFieldEditor('hours', editedData.hours, 'Hours')}
              {renderFieldEditor('specialties', editedData.specialties, 'Specialties')}
              {renderFieldEditor('dietaryOptions', editedData.dietaryOptions, 'Dietary Options')}
              {renderFieldEditor('ambiance', editedData.ambiance, 'Ambiance')}
              {renderFieldEditor('description', (editedData as any).description, 'Description')}
              {renderFieldEditor('imageUrl', (editedData as any).imageUrl, 'Image URL')}
            </>
          )}
          
          {editedData && category === 'hikes' && (
            <>
              {renderFieldEditor('name', (editedData as any).name, 'Trail Name')}
              {renderFieldEditor('lengthKm', editedData.lengthKm, 'Length (km)')}
              {renderFieldEditor('durationHours', editedData.durationHours, 'Duration (hours)')}
              {renderFieldEditor('difficulty', editedData.difficulty, 'Difficulty')}
              {renderFieldEditor('elevationGainM', editedData.elevationGainM, 'Elevation Gain (m)')}
              {renderFieldEditor('location', editedData.location, 'Location')}
              {renderFieldEditor('distanceFromMunichKm', editedData.distanceFromMunichKm, 'Distance from Munich (km)')}
              {renderFieldEditor('publicTransportTime', editedData.publicTransportTime, 'Public Transport Time (min)')}
              {renderFieldEditor('scenery', editedData.scenery, 'Scenery')}
              {renderFieldEditor('pathType', editedData.pathType, 'Path Type')}
              {renderFieldEditor('specialFeature', editedData.specialFeature, 'Special Feature')}
              {renderFieldEditor('detailedDescription', editedData.detailedDescription, 'Detailed Description')}
              {renderFieldEditor('highlights', editedData.highlights, 'Highlights')}
              {renderFieldEditor('description', (editedData as any).description, 'Description')}
              {renderFieldEditor('imageUrl', (editedData as any).imageUrl, 'Image URL')}
            </>
          )}
          
          {editedData && category === 'movies' && (
            <>
              {renderFieldEditor('title', editedData.title, 'Title')}
              {renderFieldEditor('year', editedData.year, 'Year')}
              {renderFieldEditor('runtime', editedData.runtime, 'Runtime (min)')}
              {renderFieldEditor('genres', editedData.genres, 'Genres')}
              {renderFieldEditor('director', editedData.director, 'Director')}
              {renderFieldEditor('cast', editedData.cast, 'Cast')}
              {renderFieldEditor('rating', editedData.rating, 'Rating')}
              {renderFieldEditor('voteCount', editedData.voteCount, 'Vote Count')}
              {renderFieldEditor('plot', editedData.plot, 'Plot')}
              {renderFieldEditor('language', editedData.language, 'Language')}
              {renderFieldEditor('country', editedData.country, 'Country')}
              {renderFieldEditor('awards', editedData.awards, 'Awards')}
              {renderFieldEditor('streamingPlatforms', editedData.streamingPlatforms, 'Streaming Platforms')}
              {renderFieldEditor('tmdbId', editedData.tmdbId, 'TMDB ID')}
              {renderFieldEditor('imageUrl', (editedData as any).imageUrl, 'Image URL')}
            </>
          )}
        </div>
      </div>

      {/* Raw Text Toggle */}
      <div className="flex items-center justify-between text-sm">
        <button
          onClick={() => setShowRawText(!showRawText)}
          className="text-blue-600 hover:text-blue-700"
        >
          {showRawText ? '▼' : '▶'} {showRawText ? 'Hide' : 'Show'} raw text
        </button>
        <button
          onClick={() => {
            setViewMode('prompt');
            setEditingField(null);
          }}
          className="text-gray-600 hover:text-gray-700"
          disabled={loading}
        >
          ← Edit Text & Re-parse
        </button>
      </div>

      {showRawText && (
        <textarea
          value={pastedText}
          onChange={(e) => setPastedText(e.target.value)}
          className="w-full h-32 px-3 py-2 text-xs border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 font-mono"
          disabled={loading}
        />
      )}

      {/* Actions */}
      <div className="flex items-center justify-end gap-3 pt-4 border-t border-gray-200">
        <button
          onClick={onCancel}
          className="px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-100 rounded-lg transition-colors"
          disabled={loading}
        >
          Cancel
        </button>
        <button
          onClick={handleSubmit}
          disabled={!editedData || !(
            category === 'tv' ? editedData.title : 
            category === 'restaurants' ? editedData.restaurantName :
            category === 'hikes' ? (editedData as any).name :
            category === 'movies' ? editedData.title :
            false
          ) || loading}
          className="px-4 py-2 text-sm font-medium text-white bg-gradient-to-r from-blue-500 to-purple-600 rounded-lg hover:from-blue-600 hover:to-purple-700 disabled:from-gray-300 disabled:to-gray-300 disabled:cursor-not-allowed transition-all"
        >
          {loading ? 'Creating...' : '✓ Create Card'}
        </button>
      </div>

      {/* Image Search Modal */}
      <ImageSearchModal
        isOpen={showImageSearch}
        onClose={() => setShowImageSearch(false)}
        onSelectImage={(url) => {
          updateField('imageUrl', url);
          setShowImageSearch(false);
        }}
        category={category}
        searchQuery={imageSearchQuery}
      />
    </div>
  );
}
