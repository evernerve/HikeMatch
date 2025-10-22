/**
 * ImageSearchModal Component
 * 
 * Unified interface for finding images:
 * - Google Images search (opens in new tab)
 * - Direct URL input with live preview
 */

import { useState, useEffect } from 'react';
import type { CategoryType } from '../types/categories';

interface ImageSearchModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSelectImage: (url: string) => void;
  category: CategoryType;
  searchQuery?: string;
}

export function ImageSearchModal({ 
  isOpen, 
  onClose, 
  onSelectImage, 
  category: _category,
  searchQuery = '' 
}: ImageSearchModalProps) {
  const [query, setQuery] = useState(searchQuery);
  const [directUrl, setDirectUrl] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [previewLoading, setPreviewLoading] = useState(false);
  const [previewError, setPreviewError] = useState(false);
  const [googleSearchOpened, setGoogleSearchOpened] = useState(false);

  useEffect(() => {
    if (searchQuery) {
      setQuery(searchQuery);
    }
  }, [searchQuery]);

  // Auto-preview when valid URL is entered
  useEffect(() => {
    if (!directUrl.trim()) {
      setPreviewUrl(null);
      setPreviewError(false);
      setPreviewLoading(false);
      setError(null);
      return;
    }

    try {
      new URL(directUrl);
      setPreviewError(false);
      setPreviewLoading(true);
      setPreviewUrl(directUrl);
      setError(null);
    } catch {
      setPreviewUrl(null);
      setPreviewError(false);
      setError(null);
    }
  }, [directUrl]);

  if (!isOpen) return null;

  const handleGoogleImagesSearch = () => {
    if (!query.trim()) return;
    
    const searchUrl = `https://www.google.com/search?tbm=isch&q=${encodeURIComponent(query)}`;
    window.open(searchUrl, '_blank', 'noopener,noreferrer');
    setGoogleSearchOpened(true);
  };

  const handleConfirmPreview = () => {
    if (previewUrl && !previewError) {
      onSelectImage(previewUrl);
      onClose();
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-gray-800 rounded-lg max-w-4xl w-full max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="sticky top-0 bg-gray-800 border-b border-gray-700 p-6 z-10">
          <div className="flex justify-between items-center mb-6">
            <div>
              <h2 className="text-2xl font-bold text-white">Find Image</h2>
              <p className="text-sm text-gray-400 mt-1">Search on Google, then paste the image URL below</p>
            </div>
            <button
              onClick={onClose}
              className="text-gray-400 hover:text-white transition-colors"
            >
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>

          {/* Step 1: Google Images Search */}
          <div className="mb-6">
            <div className="flex items-center gap-2 mb-2">
              <span className="flex items-center justify-center w-6 h-6 rounded-full bg-blue-600 text-white text-sm font-bold">1</span>
              <h3 className="text-lg font-semibold text-white">Search Google Images</h3>
            </div>
            <div className="flex gap-2 ml-8">
              <input
                type="text"
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                onKeyPress={(e) => e.key === 'Enter' && handleGoogleImagesSearch()}
                placeholder={`e.g., "Inception movie poster" or "Osteria Francescana"`}
                className="flex-1 px-4 py-2 bg-gray-700 text-white rounded-lg border border-gray-600 focus:outline-none focus:border-blue-500"
              />
              <button
                onClick={handleGoogleImagesSearch}
                disabled={!query.trim()}
                className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors font-medium whitespace-nowrap"
              >
                🔍 Search on Google
              </button>
            </div>
          </div>

          {/* Step 2: Paste URL */}
          <div>
            <div className="flex items-center gap-2 mb-2">
              <span className="flex items-center justify-center w-6 h-6 rounded-full bg-blue-600 text-white text-sm font-bold">2</span>
              <h3 className="text-lg font-semibold text-white">Paste Image URL</h3>
            </div>
            <div className="ml-8">
              <input
                type="url"
                value={directUrl}
                onChange={(e) => setDirectUrl(e.target.value)}
                placeholder="https://example.com/image.jpg"
                className="w-full px-4 py-2 bg-gray-700 text-white rounded-lg border border-gray-600 focus:outline-none focus:border-blue-500"
              />
              <p className="text-xs text-gray-400 mt-1">
                Right-click an image → "Copy image address" → paste here
              </p>
            </div>
          </div>
        </div>

        {/* Error */}
        {error && (
          <div className="mx-6 mt-4 p-4 bg-red-900/50 border border-red-700 rounded-lg text-red-200">
            {error}
          </div>
        )}

        {/* Content Area */}
        <div className="p-6">
          {previewUrl ? (
            /* Image Preview */
            <div className="max-w-2xl mx-auto">
              <div className="bg-gray-700 rounded-lg overflow-hidden">
                <div className="p-4 border-b border-gray-600 flex items-center justify-between">
                  <div>
                    <h3 className="text-lg font-semibold text-white mb-1">Image Preview</h3>
                    <p className="text-sm text-gray-400">Review before confirming</p>
                  </div>
                  <span className="flex items-center justify-center w-6 h-6 rounded-full bg-blue-600 text-white text-sm font-bold">3</span>
                </div>
                
                <div className="relative bg-gray-900 flex items-center justify-center min-h-[300px] max-h-[500px]">
                  {previewLoading && !previewError && (
                    <div className="absolute inset-0 flex items-center justify-center">
                      <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500"></div>
                    </div>
                  )}
                  
                  {previewError ? (
                    <div className="text-center p-8">
                      <svg className="w-16 h-16 text-red-500 mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                      </svg>
                      <p className="text-red-400 font-medium mb-2">Failed to load image</p>
                      <p className="text-gray-400 text-sm">The URL might be invalid or the image is not accessible.</p>
                      <p className="text-gray-400 text-sm mt-2">Try a different image or check if it requires authentication.</p>
                    </div>
                  ) : (
                    <img
                      src={previewUrl}
                      alt="Preview"
                      className={`max-w-full max-h-[500px] object-contain ${previewLoading ? 'opacity-0' : 'opacity-100'} transition-opacity duration-300`}
                      onLoad={() => setPreviewLoading(false)}
                      onError={() => {
                        setPreviewLoading(false);
                        setPreviewError(true);
                      }}
                    />
                  )}
                </div>

                <div className="p-4 bg-gray-800">
                  <p className="text-xs text-gray-400 mb-3 break-all">
                    <strong>URL:</strong> {previewUrl}
                  </p>
                  <div className="flex gap-3">
                    <button
                      onClick={handleConfirmPreview}
                      disabled={previewError || previewLoading}
                      className="flex-1 px-6 py-3 bg-green-600 text-white rounded-lg hover:bg-green-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors font-medium"
                    >
                      ✓ Confirm & Use This Image
                    </button>
                    <button
                      onClick={() => {
                        setDirectUrl('');
                        setPreviewUrl(null);
                        setPreviewError(false);
                        setPreviewLoading(false);
                      }}
                      className="px-6 py-3 bg-gray-700 text-white rounded-lg hover:bg-gray-600 transition-colors font-medium"
                    >
                      Clear
                    </button>
                  </div>
                </div>
              </div>
            </div>
          ) : googleSearchOpened ? (
            /* Instructions after Google search opened */
            <div className="text-center py-8 px-4">
              <div className="bg-blue-900/30 border border-blue-700 rounded-lg p-6 max-w-2xl mx-auto">
                <div className="flex items-center justify-center gap-3 mb-3">
                  <svg className="w-8 h-8 text-green-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                  <h3 className="text-xl font-semibold text-white">Google Images opened in new tab</h3>
                </div>
                <div className="text-gray-300 space-y-3 text-left">
                  <p className="font-medium text-center">Next steps:</p>
                  <ol className="list-decimal list-inside space-y-2 ml-2">
                    <li>Find the image you want in the Google Images tab</li>
                    <li>Right-click the image and select <strong>"Copy image address"</strong></li>
                    <li>Come back here and paste the URL in the field above</li>
                    <li>Preview will appear automatically - then click confirm!</li>
                  </ol>
                  <div className="mt-4 pt-4 border-t border-blue-700">
                    <p className="text-sm text-gray-400">💡 Tip: Click "View Image" on Google Images first to get the full-size image URL</p>
                  </div>
                </div>
              </div>
            </div>
          ) : (
            /* Initial state */
            <div className="text-center py-12 text-gray-400">
              <svg className="w-16 h-16 mx-auto mb-4 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
              </svg>
              <p className="text-lg mb-2">Start by searching Google Images above</p>
              <p className="text-sm">Or paste an image URL directly if you already have one</p>
            </div>
          )}
        </div>

        {/* Tips Footer */}
        <div className="border-t border-gray-700 p-6 bg-gray-900">
          <h3 className="text-sm font-semibold text-gray-300 mb-2">💡 Quick Tips:</h3>
          <ul className="text-sm text-gray-400 space-y-1">
            <li>• <strong>For movies:</strong> Search "movie title poster" or "movie title year"</li>
            <li>• <strong>For restaurants:</strong> Search the restaurant name + location</li>
            <li>• <strong>For hikes/trails:</strong> Search the trail name + "photo" or "trailhead"</li>
            <li>• <strong>For TV shows:</strong> Search "show title poster" or "show title promotional"</li>
          </ul>
        </div>
      </div>
    </div>
  );
}
