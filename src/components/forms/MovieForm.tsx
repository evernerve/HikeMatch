/**
 * Form for adding movies
 */

import { MovieData } from '../../types/categories';
import { FormField, MultiInputField } from './FormFields';

interface MovieFormProps {
  name: string;
  image: string;
  description: string;
  categoryData: Partial<MovieData>;
  fieldErrors: Record<string, string>;
  warnings: Record<string, string>;
  loading: boolean;
  onNameChange: (value: string) => void;
  onImageChange: (value: string) => void;
  onDescriptionChange: (value: string) => void;
  onCategoryDataChange: (data: Partial<MovieData>) => void;
}

export default function MovieForm({
  name,
  image,
  description,
  categoryData,
  fieldErrors,
  warnings,
  loading,
  onNameChange,
  onImageChange,
  onDescriptionChange,
  onCategoryDataChange,
}: MovieFormProps) {
  const updateField = (field: keyof MovieData, value: any) => {
    onCategoryDataChange({ ...categoryData, [field]: value });
  };

  return (
    <div className="space-y-4">
      {/* Common Fields */}
      <FormField
        label="Movie Title"
        name="name"
        value={name}
        onChange={onNameChange}
        placeholder="e.g., The Shawshank Redemption"
        error={fieldErrors.name}
        required
        disabled={loading}
      />

      <FormField
        label="Poster Image URL"
        name="image"
        type="url"
        value={image}
        onChange={onImageChange}
        placeholder="https://image.tmdb.org/t/p/w500/..."
        error={fieldErrors.image}
        helpText="Use TMDb or IMDb poster URL for best quality"
        required
        disabled={loading}
      />

      <FormField
        label="Short Description"
        name="description"
        type="textarea"
        value={description}
        onChange={onDescriptionChange}
        placeholder="A captivating one-sentence summary..."
        error={fieldErrors.description}
        required
        disabled={loading}
      />

      {/* Movie-Specific Fields */}
      <div className="pt-4 border-t border-gray-200">
        <h3 className="text-sm font-medium text-gray-700 mb-3">
          Optional Details <span className="text-gray-500 font-normal">(Add what you know)</span>
        </h3>
        
        <div className="grid grid-cols-2 gap-4">
          <FormField
            label="Release Year"
            name="year"
            type="number"
            value={categoryData.year || ''}
            onChange={(value) => updateField('year', value)}
            placeholder="1994"
            error={fieldErrors.year}
            min={1888}
            max={new Date().getFullYear() + 2}
            disabled={loading}
          />

          <FormField
            label="Runtime (minutes)"
            name="runtime"
            type="number"
            value={categoryData.runtime || ''}
            onChange={(value) => updateField('runtime', value)}
            placeholder="142"
            error={fieldErrors.runtime}
            warning={warnings.runtime}
            min={1}
            disabled={loading}
          />
        </div>

        <MultiInputField
          label="Genres"
          name="genres"
          values={categoryData.genres || []}
          onChange={(values) => updateField('genres', values)}
          placeholder="Drama, Crime, Thriller..."
          error={fieldErrors.genres}
          helpText="Press Enter or click Add after typing each genre"
          disabled={loading}
        />

        <FormField
          label="Director"
          name="director"
          value={categoryData.director || ''}
          onChange={(value) => updateField('director', value)}
          placeholder="e.g., Frank Darabont"
          error={fieldErrors.director}
          disabled={loading}
        />

        <MultiInputField
          label="Main Cast"
          name="cast"
          values={categoryData.cast || []}
          onChange={(values) => updateField('cast', values)}
          placeholder="Add actor names..."
          helpText="Add main cast members"
          disabled={loading}
        />

        <FormField
          label="Plot Summary"
          name="plot"
          type="textarea"
          value={categoryData.plot || ''}
          onChange={(value) => updateField('plot', value)}
          placeholder="A detailed plot summary of the movie..."
          error={fieldErrors.plot}
          disabled={loading}
        />

        <div className="grid grid-cols-2 gap-4">
          <FormField
            label="Language"
            name="language"
            value={categoryData.language || ''}
            onChange={(value) => updateField('language', value)}
            placeholder="e.g., English"
            error={fieldErrors.language}
            disabled={loading}
          />

          <FormField
            label="Country"
            name="country"
            value={categoryData.country || ''}
            onChange={(value) => updateField('country', value)}
            placeholder="e.g., United States"
            error={fieldErrors.country}
            disabled={loading}
          />
        </div>
      </div>

      {/* More Optional Fields */}
      <div className="pt-4 border-t border-gray-200">
        <h3 className="text-sm font-medium text-gray-700 mb-3">Additional Info</h3>
        
        <FormField
          label="Rating (0-10)"
          name="rating"
          type="number"
          value={categoryData.rating || ''}
          onChange={(value) => updateField('rating', value)}
          placeholder="8.5"
          error={fieldErrors.rating}
          helpText="IMDb or TMDb rating"
          min={0}
          max={10}
          step={0.1}
          disabled={loading}
        />

        <FormField
          label="Vote Count"
          name="voteCount"
          type="number"
          value={categoryData.voteCount || ''}
          onChange={(value) => updateField('voteCount', value)}
          placeholder="2500000"
          min={0}
          disabled={loading}
        />

        <FormField
          label="Awards"
          name="awards"
          value={categoryData.awards || ''}
          onChange={(value) => updateField('awards', value)}
          placeholder="e.g., 7 Oscar nominations"
          disabled={loading}
        />

        <MultiInputField
          label="Streaming Platforms"
          name="streamingPlatforms"
          values={categoryData.streamingPlatforms || []}
          onChange={(values) => updateField('streamingPlatforms', values)}
          placeholder="Netflix, Amazon Prime, Disney+..."
          helpText="Where can people watch this movie?"
          disabled={loading}
        />

        <FormField
          label="TMDb ID"
          name="tmdbId"
          type="number"
          value={categoryData.tmdbId || ''}
          onChange={(value) => updateField('tmdbId', value)}
          placeholder="278"
          helpText="The Movie Database ID (optional)"
          min={0}
          disabled={loading}
        />
      </div>
    </div>
  );
}
