import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useQuery } from 'react-query';
import { cropsAPI } from '../services/api';
import { useAuth } from '../contexts/AuthContext';
import {
  ArrowLeft,
  Upload,
  X,
  Plus,
  Save,
  Loader
} from 'lucide-react';
import toast from 'react-hot-toast';

const AddCrop = () => {
  const navigate = useNavigate();
  const { user } = useAuth();

  const [formData, setFormData] = useState({
    name: '',
    category: '',
    variety: '',
    description: '',
    quantity: {
      value: '',
      unit: 'kg'
    },
    price: {
      perUnit: ''
    },
    harvestDate: '',
    expiryDate: '',
    location: {
      state: '',
      district: '',
      pincode: ''
    },
    quality: {
      grade: 'Grade A',
      organic: false,
      certified: false,
      moistureContent: '',
      purity: ''
    },
    packaging: {
      type: 'Standard',
      weight: '',
      description: ''
    },
    availability: {
      minimumOrder: 1,
      maximumOrder: ''
    },
    delivery: {
      available: false,
      radius: '',
      charges: '',
      estimatedDays: ''
    },
    tags: []
  });

  const [images, setImages] = useState([]);
  const [tagInput, setTagInput] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Get categories
  const { data: categoriesData } = useQuery('categories', cropsAPI.getCategories);

  const categories = categoriesData?.categories || [
    'Cereals', 'Pulses', 'Oilseeds', 'Vegetables', 'Fruits',
    'Spices', 'Medicinal Plants', 'Flowers', 'Others'
  ];

  const units = ['kg', 'quintal', 'tonne', 'piece', 'dozen', 'bunch'];
  const states = [
    'Andhra Pradesh', 'Arunachal Pradesh', 'Assam', 'Bihar', 'Chhattisgarh',
    'Goa', 'Gujarat', 'Haryana', 'Himachal Pradesh', 'Jharkhand',
    'Karnataka', 'Kerala', 'Madhya Pradesh', 'Maharashtra', 'Manipur',
    'Meghalaya', 'Mizoram', 'Nagaland', 'Odisha', 'Punjab',
    'Rajasthan', 'Sikkim', 'Tamil Nadu', 'Telangana', 'Tripura',
    'Uttar Pradesh', 'Uttarakhand', 'West Bengal', 'Delhi', 'Chandigarh'
  ];

  const handleInputChange = (field, value) => {
    if (field.includes('.')) {
      const [parent, child] = field.split('.');
      setFormData(prev => ({
        ...prev,
        [parent]: {
          ...prev[parent],
          [child]: value
        }
      }));
    } else {
      setFormData(prev => ({
        ...prev,
        [field]: value
      }));
    }
  };

  const handleImageUpload = (e) => {
    const files = Array.from(e.target.files);
    const newImages = files.map(file => ({
      file,
      preview: URL.createObjectURL(file)
    }));
    setImages(prev => [...prev, ...newImages].slice(0, 5)); // Max 5 images
  };

  const removeImage = (index) => {
    setImages(prev => prev.filter((_, i) => i !== index));
  };

  const addTag = () => {
    if (tagInput.trim() && !formData.tags.includes(tagInput.trim())) {
      setFormData(prev => ({
        ...prev,
        tags: [...prev.tags, tagInput.trim()]
      }));
      setTagInput('');
    }
  };

  const removeTag = (tagToRemove) => {
    setFormData(prev => ({
      ...prev,
      tags: prev.tags.filter(tag => tag !== tagToRemove)
    }));
  };

  const validateForm = () => {
    const errors = [];

    if (!formData.name.trim()) {
      errors.push('Crop name is required');
    }
    if (!formData.category) {
      errors.push('Category is required');
    }
    if (!formData.variety.trim()) {
      errors.push('Variety is required');
    }
    if (!formData.description.trim() || formData.description.length < 10) {
      errors.push('Description must be at least 10 characters');
    }
    if (!formData.quantity.value || formData.quantity.value <= 0) {
      errors.push('Quantity must be a positive number');
    }
    if (!formData.price.perUnit || formData.price.perUnit <= 0) {
      errors.push('Price must be a positive number');
    }
    if (!formData.harvestDate) {
      errors.push('Harvest date is required');
    }
    if (!formData.expiryDate) {
      errors.push('Expiry date is required');
    }
    if (!formData.location.state) {
      errors.push('State is required');
    }
    if (!formData.location.district || !formData.location.district.trim()) {
      errors.push('District is required');
    }
    if (!formData.location.pincode || !/^\d{6}$/.test(formData.location.pincode.toString())) {
      errors.push('Valid 6-digit pincode is required');
    }

    // Check if expiry date is after harvest date
    if (formData.harvestDate && formData.expiryDate) {
      const harvestDate = new Date(formData.harvestDate);
      const expiryDate = new Date(formData.expiryDate);
      if (expiryDate <= harvestDate) {
        errors.push('Expiry date must be after harvest date');
      }
    }

    return errors;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    // Client-side validation
    const validationErrors = validateForm();
    if (validationErrors.length > 0) {
      validationErrors.forEach(error => {
        toast.error(error);
      });
      return;
    }

    setIsSubmitting(true);

    try {
      const submitData = new FormData();

      // Add basic form fields
      submitData.append('name', formData.name);
      submitData.append('category', formData.category);
      submitData.append('variety', formData.variety);
      submitData.append('description', formData.description);
      submitData.append('harvestDate', formData.harvestDate);
      submitData.append('expiryDate', formData.expiryDate);

      // Add nested objects as JSON strings
      submitData.append('quantity', JSON.stringify(formData.quantity));
      submitData.append('price', JSON.stringify(formData.price));
      submitData.append('location', JSON.stringify(formData.location));
      submitData.append('quality', JSON.stringify(formData.quality));
      submitData.append('packaging', JSON.stringify(formData.packaging));
      submitData.append('availability', JSON.stringify(formData.availability));
      submitData.append('delivery', JSON.stringify(formData.delivery));
      submitData.append('tags', JSON.stringify(formData.tags));

      // Add images
      images.forEach((image, index) => {
        submitData.append('images', image.file);
      });

      const response = await cropsAPI.createCrop(submitData);

      if (response.success) {
        toast.success('Crop added successfully!');
        navigate('/dashboard');
      }

    } catch (error) {
      console.error('Error adding crop:', error);
      
      // Handle validation errors from server
      if (error.errors) {
        const errors = error.errors;
        if (Array.isArray(errors)) {
          errors.forEach(err => {
            toast.error(`${err.field || 'Field'}: ${err.message || err.msg}`);
          });
        } else {
          toast.error(error.message || 'Validation failed');
        }
      } else {
        toast.error(error.message || 'Failed to add crop');
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white shadow-sm">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <button
                onClick={() => navigate(-1)}
                className="p-2 text-gray-400 hover:text-gray-600 transition-colors"
              >
                <ArrowLeft className="w-5 h-5" />
              </button>
              <div>
                <h1 className="text-2xl font-bold text-gray-900">Add New Crop</h1>
                <p className="text-gray-600">List your fresh produce for sale</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <form onSubmit={handleSubmit} className="space-y-8">
          {/* Basic Information */}
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
            <h2 className="text-xl font-semibold text-gray-900 mb-6">Basic Information</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Crop Name *
                </label>
                <input
                  type="text"
                  value={formData.name}
                  onChange={(e) => handleInputChange('name', e.target.value)}
                  className="input-field"
                  placeholder="e.g., Tomatoes"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Category *
                </label>
                <select
                  value={formData.category}
                  onChange={(e) => handleInputChange('category', e.target.value)}
                  className="input-field"
                  required
                >
                  <option value="">Select Category</option>
                  {categories.map(category => (
                    <option key={category} value={category}>{category}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Variety *
                </label>
                <input
                  type="text"
                  value={formData.variety}
                  onChange={(e) => handleInputChange('variety', e.target.value)}
                  className="input-field"
                  placeholder="e.g., Cherry Tomatoes"
                  required
                />
              </div>

              <div className="md:col-span-2">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Description *
                </label>
                <textarea
                  value={formData.description}
                  onChange={(e) => handleInputChange('description', e.target.value)}
                  className="input-field"
                  rows={4}
                  placeholder="Describe your crop, quality, freshness, etc."
                  required
                />
              </div>
            </div>
          </div>

          {/* Quantity and Price */}
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
            <h2 className="text-xl font-semibold text-gray-900 mb-6">Quantity & Pricing</h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Quantity *
                </label>
                <input
                  type="number"
                  value={formData.quantity.value}
                  onChange={(e) => handleInputChange('quantity.value', e.target.value)}
                  className="input-field"
                  placeholder="100"
                  min="1"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Unit *
                </label>
                <select
                  value={formData.quantity.unit}
                  onChange={(e) => handleInputChange('quantity.unit', e.target.value)}
                  className="input-field"
                  required
                >
                  {units.map(unit => (
                    <option key={unit} value={unit}>{unit}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Price per Unit (₹) *
                </label>
                <input
                  type="number"
                  value={formData.price.perUnit}
                  onChange={(e) => handleInputChange('price.perUnit', e.target.value)}
                  className="input-field"
                  placeholder="50"
                  min="1"
                  required
                />
              </div>
            </div>
          </div>

          {/* Dates */}
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
            <h2 className="text-xl font-semibold text-gray-900 mb-6">Harvest & Expiry</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Harvest Date *
                </label>
                <input
                  type="date"
                  value={formData.harvestDate}
                  onChange={(e) => handleInputChange('harvestDate', e.target.value)}
                  className="input-field"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Expiry Date *
                </label>
                <input
                  type="date"
                  value={formData.expiryDate}
                  onChange={(e) => handleInputChange('expiryDate', e.target.value)}
                  className="input-field"
                  required
                />
              </div>
            </div>
          </div>

          {/* Location */}
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
            <h2 className="text-xl font-semibold text-gray-900 mb-6">Location</h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  State *
                </label>
                <select
                  value={formData.location.state}
                  onChange={(e) => handleInputChange('location.state', e.target.value)}
                  className="input-field"
                  required
                >
                  <option value="">Select State</option>
                  {states.map(state => (
                    <option key={state} value={state}>{state}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  District *
                </label>
                <input
                  type="text"
                  value={formData.location.district}
                  onChange={(e) => handleInputChange('location.district', e.target.value)}
                  className="input-field"
                  placeholder="District name"
                  required
                />
                {formData.location.district && formData.location.district.trim().length < 2 && (
                  <p className="mt-1 text-sm text-red-600">District name must be at least 2 characters</p>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Pincode *
                </label>
                <input
                  type="text"
                  value={formData.location.pincode}
                  onChange={(e) => {
                    // Only allow digits and limit to 6 characters
                    const value = e.target.value.replace(/\D/g, '').slice(0, 6);
                    handleInputChange('location.pincode', value);
                  }}
                  className="input-field"
                  placeholder="123456"
                  maxLength="6"
                  required
                />
                {formData.location.pincode && !/^\d{6}$/.test(formData.location.pincode) && (
                  <p className="mt-1 text-sm text-red-600">Please enter exactly 6 digits</p>
                )}
              </div>
            </div>
          </div>

          {/* Quality */}
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
            <h2 className="text-xl font-semibold text-gray-900 mb-6">Quality Information</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Grade
                </label>
                <select
                  value={formData.quality.grade}
                  onChange={(e) => handleInputChange('quality.grade', e.target.value)}
                  className="input-field"
                >
                  <option value="Premium">Premium</option>
                  <option value="Grade A">Grade A</option>
                  <option value="Grade B">Grade B</option>
                  <option value="Grade C">Grade C</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Moisture Content (%)
                </label>
                <input
                  type="number"
                  value={formData.quality.moistureContent}
                  onChange={(e) => handleInputChange('quality.moistureContent', e.target.value)}
                  className="input-field"
                  placeholder="12"
                  min="0"
                  max="100"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Purity (%)
                </label>
                <input
                  type="number"
                  value={formData.quality.purity}
                  onChange={(e) => handleInputChange('quality.purity', e.target.value)}
                  className="input-field"
                  placeholder="98"
                  min="0"
                  max="100"
                />
              </div>

              <div className="flex items-center space-x-4">
                <label className="flex items-center">
                  <input
                    type="checkbox"
                    checked={formData.quality.organic}
                    onChange={(e) => handleInputChange('quality.organic', e.target.checked)}
                    className="h-4 w-4 text-primary-600 focus:ring-primary-500 border-gray-300 rounded"
                  />
                  <span className="ml-2 text-sm text-gray-700">Organic</span>
                </label>

                <label className="flex items-center">
                  <input
                    type="checkbox"
                    checked={formData.quality.certified}
                    onChange={(e) => handleInputChange('quality.certified', e.target.checked)}
                    className="h-4 w-4 text-primary-600 focus:ring-primary-500 border-gray-300 rounded"
                  />
                  <span className="ml-2 text-sm text-gray-700">Certified</span>
                </label>
              </div>
            </div>
          </div>

          {/* Images */}
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
            <h2 className="text-xl font-semibold text-gray-900 mb-6">Images</h2>
            <div className="space-y-4">
              <div className="flex items-center justify-center w-full">
                <label className="flex flex-col items-center justify-center w-full h-32 border-2 border-gray-300 border-dashed rounded-lg cursor-pointer bg-gray-50 hover:bg-gray-100">
                  <div className="flex flex-col items-center justify-center pt-5 pb-6">
                    <Upload className="w-8 h-8 mb-4 text-gray-500" />
                    <p className="mb-2 text-sm text-gray-500">
                      <span className="font-semibold">Click to upload</span> or drag and drop
                    </p>
                    <p className="text-xs text-gray-500">PNG, JPG, GIF up to 5MB (max 5 images)</p>
                  </div>
                  <input
                    type="file"
                    className="hidden"
                    multiple
                    accept="image/*"
                    onChange={handleImageUpload}
                  />
                </label>
              </div>

              {images.length > 0 && (
                <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
                  {images.map((image, index) => (
                    <div key={index} className="relative">
                      <img
                        src={image.preview}
                        alt={`Upload ${index + 1}`}
                        className="w-full h-24 object-cover rounded-lg"
                      />
                      <button
                        type="button"
                        onClick={() => removeImage(index)}
                        className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full p-1 hover:bg-red-600"
                      >
                        <X className="w-4 h-4" />
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>

          {/* Tags */}
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
            <h2 className="text-xl font-semibold text-gray-900 mb-6">Tags</h2>
            <div className="space-y-4">
              <div className="flex space-x-2">
                <input
                  type="text"
                  value={tagInput}
                  onChange={(e) => setTagInput(e.target.value)}
                  onKeyPress={(e) => e.key === 'Enter' && (e.preventDefault(), addTag())}
                  className="input-field flex-1"
                  placeholder="Add tags (e.g., fresh, local, premium)"
                />
                <button
                  type="button"
                  onClick={addTag}
                  className="btn-primary px-4"
                >
                  <Plus className="w-4 h-4" />
                </button>
              </div>

              {formData.tags.length > 0 && (
                <div className="flex flex-wrap gap-2">
                  {formData.tags.map((tag, index) => (
                    <span
                      key={index}
                      className="inline-flex items-center px-3 py-1 rounded-full text-sm bg-primary-100 text-primary-800"
                    >
                      {tag}
                      <button
                        type="button"
                        onClick={() => removeTag(tag)}
                        className="ml-2 text-primary-600 hover:text-primary-800"
                      >
                        <X className="w-3 h-3" />
                      </button>
                    </span>
                  ))}
                </div>
              )}
            </div>
          </div>

          {/* Submit */}
          <div className="flex justify-end space-x-4">
            <button
              type="button"
              onClick={() => navigate(-1)}
              className="btn-outline"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isSubmitting}
              className="btn-primary flex items-center"
            >
              {isSubmitting ? (
                <Loader className="w-4 h-4 mr-2 animate-spin" />
              ) : (
                <Save className="w-4 h-4 mr-2" />
              )}
              {isSubmitting ? 'Adding Crop...' : 'Add Crop'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default AddCrop;
