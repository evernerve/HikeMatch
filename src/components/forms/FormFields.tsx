/**
 * Shared form field components
 */

import { useState } from 'react';

interface FormFieldProps {
  label: string;
  name: string;
  value: string | number;
  onChange: (value: any) => void;
  type?: 'text' | 'number' | 'url' | 'textarea';
  placeholder?: string;
  error?: string;
  warning?: string;
  required?: boolean;
  disabled?: boolean;
  min?: number;
  max?: number;
  step?: number;
  helpText?: string;
  onImageSearch?: () => void;
}

export function FormField({
  label,
  name,
  value,
  onChange,
  type = 'text',
  placeholder,
  error,
  warning,
  required = false,
  disabled = false,
  min,
  max,
  step,
  helpText,
  onImageSearch,
}: FormFieldProps) {
  const inputClasses = `input-field text-sm ${
    error ? 'border-red-400 focus:ring-red-500' : warning ? 'border-yellow-400 focus:ring-yellow-500' : ''
  }`;
  
  const isImageField = type === 'url' && name === 'image';

  return (
    <div className="mb-4">
      <label htmlFor={name} className="block text-sm font-medium text-gray-700 mb-1">
        {label} {required && <span className="text-red-500">*</span>}
        {isImageField && onImageSearch && (
          <button
            type="button"
            onClick={onImageSearch}
            disabled={disabled}
            className="ml-2 text-xs px-2 py-1 bg-purple-100 text-purple-700 hover:bg-purple-200 rounded transition-colors disabled:opacity-50"
          >
            🔍 Search Images
          </button>
        )}
      </label>
      
      {type === 'textarea' ? (
        <textarea
          id={name}
          name={name}
          value={value}
          onChange={(e) => onChange(e.target.value)}
          placeholder={placeholder}
          required={required}
          disabled={disabled}
          className={`${inputClasses} min-h-[80px]`}
          rows={3}
        />
      ) : (
        <input
          id={name}
          name={name}
          type={type}
          value={value}
          onChange={(e) => onChange(type === 'number' ? parseFloat(e.target.value) || 0 : e.target.value)}
          placeholder={placeholder}
          required={required}
          disabled={disabled}
          min={min}
          max={max}
          step={step}
          className={inputClasses}
        />
      )}
      
      {helpText && !error && !warning && (
        <p className="mt-1 text-xs text-gray-500">{helpText}</p>
      )}
      
      {error && (
        <p className="mt-1 text-xs text-red-600">{error}</p>
      )}
      
      {warning && !error && (
        <p className="mt-1 text-xs text-yellow-600">⚠️ {warning}</p>
      )}
    </div>
  );
}

interface SelectFieldProps {
  label: string;
  name: string;
  value: string;
  onChange: (value: string) => void;
  options: { value: string; label: string }[];
  error?: string;
  required?: boolean;
  disabled?: boolean;
}

export function SelectField({
  label,
  name,
  value,
  onChange,
  options,
  error,
  required = false,
  disabled = false,
}: SelectFieldProps) {
  return (
    <div className="mb-4">
      <label htmlFor={name} className="block text-sm font-medium text-gray-700 mb-1">
        {label} {required && <span className="text-red-500">*</span>}
      </label>
      <select
        id={name}
        name={name}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        required={required}
        disabled={disabled}
        className={`input-field text-sm ${error ? 'border-red-400 focus:ring-red-500' : ''}`}
      >
        <option value="">Select {label}</option>
        {options.map((option) => (
          <option key={option.value} value={option.value}>
            {option.label}
          </option>
        ))}
      </select>
      {error && (
        <p className="mt-1 text-xs text-red-600">{error}</p>
      )}
    </div>
  );
}

interface MultiInputFieldProps {
  label: string;
  name: string;
  values: string[];
  onChange: (values: string[]) => void;
  placeholder?: string;
  error?: string;
  required?: boolean;
  disabled?: boolean;
  helpText?: string;
}

export function MultiInputField({
  label,
  name,
  values,
  onChange,
  placeholder,
  error,
  required = false,
  disabled = false,
  helpText,
}: MultiInputFieldProps) {
  const [inputValue, setInputValue] = useState('');

  const addItem = () => {
    if (inputValue.trim() && !values.includes(inputValue.trim())) {
      onChange([...values, inputValue.trim()]);
      setInputValue('');
    }
  };

  const removeItem = (index: number) => {
    onChange(values.filter((_, i) => i !== index));
  };

  return (
    <div className="mb-4">
      <label htmlFor={name} className="block text-sm font-medium text-gray-700 mb-1">
        {label} {required && <span className="text-red-500">*</span>}
      </label>
      
      <div className="flex space-x-2">
        <input
          id={name}
          type="text"
          value={inputValue}
          onChange={(e) => setInputValue(e.target.value)}
          onKeyPress={(e) => {
            if (e.key === 'Enter') {
              e.preventDefault();
              addItem();
            }
          }}
          placeholder={placeholder}
          disabled={disabled}
          className={`input-field text-sm flex-1 ${error ? 'border-red-400' : ''}`}
        />
        <button
          type="button"
          onClick={addItem}
          disabled={disabled || !inputValue.trim()}
          className="px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed text-sm font-medium"
        >
          Add
        </button>
      </div>
      
      {helpText && !error && (
        <p className="mt-1 text-xs text-gray-500">{helpText}</p>
      )}
      
      {values.length > 0 && (
        <div className="mt-2 flex flex-wrap gap-2">
          {values.map((item, index) => (
            <span
              key={index}
              className="inline-flex items-center px-3 py-1 rounded-full text-sm bg-primary-100 text-primary-700"
            >
              {item}
              <button
                type="button"
                onClick={() => removeItem(index)}
                disabled={disabled}
                className="ml-2 text-primary-600 hover:text-primary-800 disabled:opacity-50"
              >
                ×
              </button>
            </span>
          ))}
        </div>
      )}
      
      {error && (
        <p className="mt-1 text-xs text-red-600">{error}</p>
      )}
    </div>
  );
}
