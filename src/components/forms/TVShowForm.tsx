/**
 * Form for adding TV shows
 */

import { TVData } from '../../types/categories';
import { FormField, SelectField, MultiInputField } from './FormFields';

interface TVShowFormProps {
  name: string;
  image: string;
  description: string;
  categoryData: Partial<TVData>;
  fieldErrors: Record<string, string>;
  warnings: Record<string, string>;
  loading: boolean;
  onNameChange: (value: string) => void;
  onImageChange: (value: string) => void;
  onDescriptionChange: (value: string) => void;
  onCategoryDataChange: (data: Partial<TVData>) => void;
  onImageSearch?: () => void;
}

export default function TVShowForm({
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
  onImageSearch,
}: TVShowFormProps) {
  const updateField = (field: keyof TVData, value: any) => {
    onCategoryDataChange({ ...categoryData, [field]: value });
  };

  return (
    <div className="space-y-4">
      {/* Common Fields */}
      <FormField
        label="TV Show Title"
        name="name"
        value={name}
        onChange={onNameChange}
        placeholder="e.g., Breaking Bad"
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
        helpText="Use TMDb or TVDb poster URL for best quality"
        required
        disabled={loading}
        onImageSearch={onImageSearch}
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

      {/* TV-Specific Fields */}
      <div className="pt-4 border-t border-gray-200">
        <h3 className="text-sm font-medium text-gray-700 mb-3">
          Optional Details <span className="text-gray-500 font-normal">(Add what you know)</span>
        </h3>
        
        <div className="grid grid-cols-2 gap-4">
          <FormField
            label="Start Year"
            name="startYear"
            type="number"
            value={categoryData.startYear || ''}
            onChange={(value) => updateField('startYear', value)}
            placeholder="2008"
            error={fieldErrors.startYear}
            min={1928}
            max={new Date().getFullYear() + 1}
            disabled={loading}
          />

          <FormField
            label="End Year (if ended)"
            name="endYear"
            type="number"
            value={categoryData.endYear || ''}
            onChange={(value) => updateField('endYear', value)}
            placeholder="2013"
            error={fieldErrors.endYear}
            helpText="Leave empty if ongoing"
            min={categoryData.startYear || 1928}
            disabled={loading}
          />
        </div>

        <SelectField
          label="Status"
          name="status"
          value={categoryData.status || ''}
          onChange={(value) => updateField('status', value as 'ongoing' | 'ended' | 'cancelled')}
          options={[
            { value: 'ongoing', label: 'Ongoing - Currently airing' },
            { value: 'ended', label: 'Ended - Completed normally' },
            { value: 'cancelled', label: 'Cancelled - Did not complete' },
          ]}
          error={fieldErrors.status}
          disabled={loading}
        />

        <div className="grid grid-cols-2 gap-4">
          <FormField
            label="Number of Seasons"
            name="seasons"
            type="number"
            value={categoryData.seasons || ''}
            onChange={(value) => updateField('seasons', value)}
            placeholder="5"
            error={fieldErrors.seasons}
            warning={warnings.seasons}
            min={1}
            disabled={loading}
          />

          <FormField
            label="Total Episodes"
            name="episodes"
            type="number"
            value={categoryData.episodes || ''}
            onChange={(value) => updateField('episodes', value)}
            placeholder="62"
            error={fieldErrors.episodes}
            warning={warnings.episodes}
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
          label="Creator"
          name="creator"
          value={categoryData.creator || ''}
          onChange={(value) => updateField('creator', value)}
          placeholder="e.g., Vince Gilligan"
          error={fieldErrors.creator}
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
          placeholder="A detailed plot summary of the TV show..."
          error={fieldErrors.plot}
          disabled={loading}
        />

        <FormField
          label="Network/Platform"
          name="network"
          value={categoryData.network || ''}
          onChange={(value) => updateField('network', value)}
          placeholder="e.g., AMC, Netflix, HBO"
          error={fieldErrors.network}
          disabled={loading}
        />
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
          placeholder="9.5"
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
          placeholder="1800000"
          min={0}
          disabled={loading}
        />

        <MultiInputField
          label="Streaming Platforms"
          name="streamingPlatforms"
          values={categoryData.streamingPlatforms || []}
          onChange={(values) => updateField('streamingPlatforms', values)}
          placeholder="Netflix, Amazon Prime, Hulu..."
          helpText="Where can people watch this show?"
          disabled={loading}
        />

        <FormField
          label="TMDb ID"
          name="tmdbId"
          type="number"
          value={categoryData.tmdbId || ''}
          onChange={(value) => updateField('tmdbId', value)}
          placeholder="1396"
          helpText="The Movie Database ID (optional)"
          min={0}
          disabled={loading}
        />
      </div>
    </div>
  );
}
