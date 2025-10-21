/**
 * Form for adding hiking trails
 */

import { HikeData } from '../../types/categories';
import { FormField, SelectField } from './FormFields';

interface HikeFormProps {
  name: string;
  image: string;
  description: string;
  categoryData: Partial<HikeData>;
  fieldErrors: Record<string, string>;
  warnings: Record<string, string>;
  loading: boolean;
  onNameChange: (value: string) => void;
  onImageChange: (value: string) => void;
  onDescriptionChange: (value: string) => void;
  onCategoryDataChange: (data: Partial<HikeData>) => void;
  onImageSearch?: () => void;
}

export default function HikeForm({
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
}: HikeFormProps) {
  const updateField = (field: keyof HikeData, value: any) => {
    onCategoryDataChange({ ...categoryData, [field]: value });
  };

  return (
    <div className="space-y-4">
      {/* Common Fields */}
      <FormField
        label="Trail Name"
        name="name"
        value={name}
        onChange={onNameChange}
        placeholder="e.g., Herzogstand Summit Trail"
        error={fieldErrors.name}
        required
        disabled={loading}
      />

      <FormField
        label="Image URL"
        name="image"
        type="url"
        value={image}
        onChange={onImageChange}
        placeholder="https://example.com/image.jpg"
        error={fieldErrors.image}
        helpText="Direct link to an image (JPG, PNG, etc.) or from a trusted host"
        required
        disabled={loading}
        onImageSearch={onImageSearch}
      />

      <FormField
        label="Description"
        name="description"
        type="textarea"
        value={description}
        onChange={onDescriptionChange}
        placeholder="A brief, engaging description of this hiking trail..."
        error={fieldErrors.description}
        required
        disabled={loading}
      />

      {/* Hiking-Specific Fields */}
      <div className="pt-4 border-t border-gray-200">
        <h3 className="text-sm font-medium text-gray-700 mb-3">
          Optional Details <span className="text-gray-500 font-normal">(Add what you know)</span>
        </h3>
        
        <div className="grid grid-cols-2 gap-4">
          <FormField
            label="Length (km)"
            name="lengthKm"
            type="number"
            value={categoryData.lengthKm || ''}
            onChange={(value) => updateField('lengthKm', value)}
            placeholder="10.5"
            error={fieldErrors.lengthKm}
            warning={warnings.lengthKm}
            min={0}
            step={0.1}
            disabled={loading}
          />

          <FormField
            label="Duration (hours)"
            name="durationHours"
            type="number"
            value={categoryData.durationHours || ''}
            onChange={(value) => updateField('durationHours', value)}
            placeholder="4.5"
            error={fieldErrors.durationHours}
            warning={warnings.durationHours}
            min={0}
            step={0.5}
            disabled={loading}
          />
        </div>

        <SelectField
          label="Difficulty"
          name="difficulty"
          value={categoryData.difficulty || ''}
          onChange={(value) => updateField('difficulty', value)}
          options={[
            { value: 'easy', label: 'Easy - Suitable for beginners' },
            { value: 'moderate', label: 'Moderate - Some experience needed' },
            { value: 'difficult', label: 'Difficult - For experienced hikers' },
          ]}
          error={fieldErrors.difficulty}
          disabled={loading}
        />

        <FormField
          label="Elevation Gain (meters)"
          name="elevationGainM"
          type="number"
          value={categoryData.elevationGainM || ''}
          onChange={(value) => updateField('elevationGainM', value)}
          placeholder="850"
          error={fieldErrors.elevationGainM}
          warning={warnings.elevationGainM}
          helpText="Use 0 for flat trails"
          min={0}
          disabled={loading}
        />

        <FormField
          label="Location"
          name="location"
          value={categoryData.location || ''}
          onChange={(value) => updateField('location', value)}
          placeholder="e.g., Bavarian Alps, Germany"
          error={fieldErrors.location}
          disabled={loading}
        />

        <div className="grid grid-cols-2 gap-4">
          <FormField
            label="Scenery Type"
            name="scenery"
            value={categoryData.scenery || ''}
            onChange={(value) => updateField('scenery', value)}
            placeholder="e.g., Mountain, Lake, Forest"
            error={fieldErrors.scenery}
            disabled={loading}
          />

          <FormField
            label="Path Type"
            name="pathType"
            value={categoryData.pathType || ''}
            onChange={(value) => updateField('pathType', value)}
            placeholder="e.g., Trail, Gravel, Rock"
            error={fieldErrors.pathType}
            disabled={loading}
          />
        </div>
      </div>

      {/* More Optional Fields */}
      <div className="pt-4 border-t border-gray-200">
        <h3 className="text-sm font-medium text-gray-700 mb-3">Additional Info</h3>
        
        <div className="grid grid-cols-2 gap-4">
          <FormField
            label="Distance from Munich (km)"
            name="distanceFromMunichKm"
            type="number"
            value={categoryData.distanceFromMunichKm || ''}
            onChange={(value) => updateField('distanceFromMunichKm', value)}
            placeholder="75"
            min={0}
            disabled={loading}
          />

          <FormField
            label="Public Transport Time (min)"
            name="publicTransportTime"
            type="number"
            value={categoryData.publicTransportTime || ''}
            onChange={(value) => updateField('publicTransportTime', value)}
            placeholder="90"
            min={0}
            disabled={loading}
          />
        </div>

        <FormField
          label="Special Feature"
          name="specialFeature"
          value={categoryData.specialFeature || ''}
          onChange={(value) => updateField('specialFeature', value)}
          placeholder="e.g., Panoramic summit views, Alpine hut"
          disabled={loading}
        />
      </div>
    </div>
  );
}
