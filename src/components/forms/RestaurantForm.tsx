/**
 * Form for adding restaurants
 */

import { RestaurantData } from '../../types/categories';
import { FormField, SelectField, MultiInputField } from './FormFields';

interface RestaurantFormProps {
  name: string;
  image: string;
  description: string;
  categoryData: Partial<RestaurantData>;
  fieldErrors: Record<string, string>;
  warnings: Record<string, string>;
  loading: boolean;
  onNameChange: (value: string) => void;
  onImageChange: (value: string) => void;
  onDescriptionChange: (value: string) => void;
  onCategoryDataChange: (data: Partial<RestaurantData>) => void;
  onImageSearch?: () => void;
}

export default function RestaurantForm({
  name,
  image,
  description,
  categoryData,
  fieldErrors,
  warnings: _warnings,
  loading,
  onNameChange,
  onImageChange,
  onDescriptionChange,
  onCategoryDataChange,
  onImageSearch,
}: RestaurantFormProps) {
  const updateField = (field: keyof RestaurantData, value: any) => {
    onCategoryDataChange({ ...categoryData, [field]: value });
  };

  return (
    <div className="space-y-4">
      {/* Common Fields */}
      <FormField
        label="Restaurant Name"
        name="name"
        value={name}
        onChange={onNameChange}
        placeholder="e.g., Hofbräuhaus München"
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
        placeholder="https://example.com/restaurant-photo.jpg"
        error={fieldErrors.image}
        helpText="A high-quality photo of the restaurant or its signature dish"
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
        placeholder="A brief, enticing description of what makes this place special..."
        error={fieldErrors.description}
        required
        disabled={loading}
      />

      {/* Restaurant-Specific Fields */}
      <div className="pt-4 border-t border-gray-200">
        <h3 className="text-sm font-medium text-gray-700 mb-3">
          Optional Details <span className="text-gray-500 font-normal">(Add what you know)</span>
        </h3>
        
        <FormField
          label="Full Restaurant Name"
          name="restaurantName"
          value={categoryData.restaurantName || ''}
          onChange={(value) => updateField('restaurantName', value)}
          placeholder="Official restaurant name"
          error={fieldErrors.restaurantName}
          helpText="Use the official name (can be same as above)"
          disabled={loading}
        />

        <MultiInputField
          label="Cuisine Types"
          name="cuisine"
          values={categoryData.cuisine || []}
          onChange={(values) => updateField('cuisine', values)}
          placeholder="Bavarian, German, Italian, Asian..."
          error={fieldErrors.cuisine}
          helpText="Add cuisine types if known"
          disabled={loading}
        />

        <SelectField
          label="Price Range"
          name="priceRange"
          value={categoryData.priceRange || ''}
          onChange={(value) => updateField('priceRange', value as '€' | '€€' | '€€€' | '€€€€')}
          options={[
            { value: '€', label: '€ - Budget-friendly (under €15 per person)' },
            { value: '€€', label: '€€ - Moderate (€15-30 per person)' },
            { value: '€€€', label: '€€€ - Upscale (€30-60 per person)' },
            { value: '€€€€', label: '€€€€ - Fine dining (€60+ per person)' },
          ]}
          error={fieldErrors.priceRange}
          disabled={loading}
        />

        <FormField
          label="Location/Neighborhood"
          name="location"
          value={categoryData.location || ''}
          onChange={(value) => updateField('location', value)}
          placeholder="e.g., Altstadt-Lehel, Munich"
          error={fieldErrors.location}
          disabled={loading}
        />

        <FormField
          label="Full Address"
          name="address"
          value={categoryData.address || ''}
          onChange={(value) => updateField('address', value)}
          placeholder="Street, Number, Postal Code, City"
          error={fieldErrors.address}
          disabled={loading}
        />

        <MultiInputField
          label="Specialty Dishes"
          name="specialties"
          values={categoryData.specialties || []}
          onChange={(values) => updateField('specialties', values)}
          placeholder="Schweinshaxe, Weisswurst, Apfelstrudel..."
          error={fieldErrors.specialties}
          helpText="What are they famous for?"
          disabled={loading}
        />
      </div>

      {/* More Optional Fields */}
      <div className="pt-4 border-t border-gray-200">
        <h3 className="text-sm font-medium text-gray-700 mb-3">Additional Info</h3>
        
        <MultiInputField
          label="Dietary Options"
          name="dietaryOptions"
          values={categoryData.dietaryOptions || []}
          onChange={(values) => updateField('dietaryOptions', values)}
          placeholder="Vegetarian, Vegan, Gluten-free..."
          helpText="Available dietary accommodations"
          disabled={loading}
        />

        <MultiInputField
          label="Ambiance/Atmosphere"
          name="ambiance"
          values={categoryData.ambiance || []}
          onChange={(values) => updateField('ambiance', values)}
          placeholder="Casual, Family-friendly, Romantic, Traditional..."
          helpText="Describe the restaurant's vibe"
          disabled={loading}
        />
      </div>

      {/* Contact & Links */}
      <div className="pt-4 border-t border-gray-200">
        <h3 className="text-sm font-medium text-gray-700 mb-3">Contact & Links</h3>
        <h3 className="text-sm font-medium text-gray-700 mb-3">Optional Details</h3>
        
        <FormField
          label="Rating (0-5)"
          name="rating"
          type="number"
          value={categoryData.rating || ''}
          onChange={(value) => updateField('rating', value)}
          placeholder="4.5"
          error={fieldErrors.rating}
          helpText="Average customer rating"
          min={0}
          max={5}
          step={0.1}
          disabled={loading}
        />

        <FormField
          label="Number of Reviews"
          name="reviewCount"
          type="number"
          value={categoryData.reviewCount || ''}
          onChange={(value) => updateField('reviewCount', value)}
          placeholder="1250"
          min={0}
          disabled={loading}
        />

        <FormField
          label="Phone Number"
          name="phone"
          value={categoryData.phone || ''}
          onChange={(value) => updateField('phone', value)}
          placeholder="+49 89 123 4567"
          error={fieldErrors.phone}
          disabled={loading}
        />

        <FormField
          label="Website"
          name="website"
          type="url"
          value={categoryData.website || ''}
          onChange={(value) => updateField('website', value)}
          placeholder="https://restaurant-website.com"
          error={fieldErrors.website}
          disabled={loading}
        />

        <FormField
          label="Opening Hours"
          name="hours"
          value={categoryData.hours || ''}
          onChange={(value) => updateField('hours', value)}
          placeholder="Mon-Sun: 11:00-23:00"
          disabled={loading}
        />

        <FormField
          label="Yelp ID"
          name="yelpId"
          value={categoryData.yelpId || ''}
          onChange={(value) => updateField('yelpId', value)}
          placeholder="hofbrauhaus-munchen-munich"
          helpText="Yelp business ID (optional)"
          disabled={loading}
        />
      </div>
    </div>
  );
}
