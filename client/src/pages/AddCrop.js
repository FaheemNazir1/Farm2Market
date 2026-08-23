import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { cropsAPI } from '../services/api';
import { getCurrentGPSLocation, reverseGeocode } from '../utils/geolocation';
import {
  ArrowLeft,
  Upload,
  X,
  Loader,
  Compass,
  Leaf
} from 'lucide-react';
import toast from 'react-hot-toast';

const AddCrop = () => {
  const navigate = useNavigate();
  const { t } = useTranslation();

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
      type: 'Standard Crates',
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
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isDetectingGPS, setIsDetectingGPS] = useState(false);

  const handleAutoDetectGPS = async () => {
    setIsDetectingGPS(true);
    try {
      const position = await getCurrentGPSLocation();
      const geoData = await reverseGeocode(position.latitude, position.longitude);
      
      setFormData(prev => ({
        ...prev,
        location: {
          ...prev.location,
          state: geoData.state || prev.location.state || 'Maharashtra',
          district: geoData.district || prev.location.district || '',
          pincode: geoData.pincode || prev.location.pincode || '',
          coordinates: {
            latitude: position.latitude,
            longitude: position.longitude
          }
        }
      }));

      toast.success(
        `GPS Auto-detected: ${geoData.district || 'Location'}, ${geoData.state || ''} (${position.latitude.toFixed(4)}, ${position.longitude.toFixed(4)})`,
        { icon: '📍', duration: 4000 }
      );
    } catch (err) {
      console.warn('GPS detection warning:', err.message);
      toast.error(err.message || 'Could not auto-detect location. Please fill manually.');
    } finally {
      setIsDetectingGPS(false);
    }
  };

  const categories = [
    'Vegetables', 'Fruits', 'Cereals', 'Pulses', 'Oilseeds', 
    'Spices', 'Medicinal Plants', 'Flowers', 'Others'
  ];

  const units = ['kg', 'quintal', 'ton', 'box', 'crate', 'piece', 'dozen'];
  const grades = ['Grade A', 'Grade B', 'Grade C', 'Premium', 'Export Quality'];

  const states = [
    'Maharashtra', 'Andhra Pradesh', 'Arunachal Pradesh', 'Assam', 'Bihar', 'Chhattisgarh',
    'Goa', 'Gujarat', 'Haryana', 'Himachal Pradesh', 'Jharkhand',
    'Karnataka', 'Kerala', 'Madhya Pradesh', 'Manipur', 'Meghalaya', 
    'Mizoram', 'Nagaland', 'Odisha', 'Punjab', 'Rajasthan', 'Sikkim', 
    'Tamil Nadu', 'Telangana', 'Tripura', 'Uttar Pradesh', 'Uttarakhand', 
    'West Bengal', 'Delhi'
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
    if (images.length + files.length > 5) {
      toast.error('Maximum 5 images allowed');
      return;
    }

    const newImages = files.map(file => ({
      file,
      preview: URL.createObjectURL(file),
      alt: file.name
    }));

    setImages(prev => [...prev, ...newImages]);
  };

  const removeImage = (index) => {
    setImages(prev => {
      const updated = [...prev];
      URL.revokeObjectURL(updated[index].preview);
      updated.splice(index, 1);
      return updated;
    });
  };

  const validateForm = () => {
    const errors = [];
    if (!formData.name.trim()) errors.push('Crop name is required');
    if (!formData.category) errors.push('Category is required');
    if (!formData.variety.trim()) errors.push('Variety is required');
    if (!formData.quantity.value || Number(formData.quantity.value) <= 0) errors.push('Valid quantity is required');
    if (!formData.price.perUnit || Number(formData.price.perUnit) <= 0) errors.push('Valid price per unit is required');
    if (!formData.harvestDate) errors.push('Harvest date is required');
    if (!formData.expiryDate) errors.push('Expiry date is required');
    if (!formData.location.state) errors.push('State is required');
    if (!formData.location.district.trim()) errors.push('District is required');
    if (!formData.location.pincode || !/^\d{6}$/.test(formData.location.pincode.toString())) {
      errors.push('Valid 6-digit pincode is required');
    }
    return errors;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const validationErrors = validateForm();
    if (validationErrors.length > 0) {
      validationErrors.forEach(error => toast.error(error));
      return;
    }

    setIsSubmitting(true);

    try {
      const submitData = new FormData();
      submitData.append('name', formData.name);
      submitData.append('category', formData.category);
      submitData.append('variety', formData.variety);
      submitData.append('description', formData.description);
      submitData.append('harvestDate', formData.harvestDate);
      submitData.append('expiryDate', formData.expiryDate);

      submitData.append('quantity', JSON.stringify(formData.quantity));
      submitData.append('price', JSON.stringify(formData.price));
      submitData.append('location', JSON.stringify(formData.location));
      submitData.append('quality', JSON.stringify(formData.quality));
      submitData.append('packaging', JSON.stringify(formData.packaging));
      submitData.append('availability', JSON.stringify(formData.availability));
      submitData.append('delivery', JSON.stringify(formData.delivery));
      submitData.append('tags', JSON.stringify(formData.tags));

      images.forEach((image) => {
        submitData.append('images', image.file);
      });

      const response = await cropsAPI.createCrop(submitData);

      if (response.success) {
        toast.success(t('common.success', 'Crop listed successfully!'));
        navigate('/dashboard');
      }
    } catch (error) {
      console.error('Error adding crop:', error);
      toast.error(error.message || 'Failed to publish crop');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-50/70 pb-20">
      
      {/* Header */}
      <div className="bg-white border-b border-slate-200/80 sticky top-20 z-30">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex items-center space-x-3">
            <button
              onClick={() => navigate(-1)}
              className="p-2 text-slate-500 hover:text-slate-800 transition-colors rounded-xl hover:bg-slate-100"
            >
              <ArrowLeft className="w-5 h-5" />
            </button>
            <div>
              <h1 className="text-xl sm:text-2xl font-black text-slate-900 font-heading">
                {t('addCrop.title', 'List Your Fresh Harvest')}
              </h1>
              <p className="text-xs text-slate-500">
                {t('addCrop.subtitle', 'Publish your agricultural produce to thousands of active buyers across India')}
              </p>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 pt-8">
        <form onSubmit={handleSubmit} className="space-y-6">
          
          {/* Basic Info */}
          <div className="card p-6 bg-white border border-slate-200/80 shadow-md space-y-4">
            <h2 className="text-base font-bold text-slate-900 uppercase tracking-wider font-heading pb-2 border-b border-slate-100">
              Basic Crop Details
            </h2>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                  {t('addCrop.cropName', 'Crop Name')} *
                </label>
                <input
                  type="text"
                  value={formData.name}
                  onChange={(e) => handleInputChange('name', e.target.value)}
                  placeholder={t('addCrop.cropNamePlaceholder', 'e.g., Organic Tomatoes, Basmati Rice')}
                  className="input-field text-sm"
                  required
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                  {t('addCrop.category', 'Category')} *
                </label>
                <select
                  value={formData.category}
                  onChange={(e) => handleInputChange('category', e.target.value)}
                  className="input-field text-sm"
                  required
                >
                  <option value="">{t('addCrop.selectCategory', 'Select Category')}</option>
                  {categories.map(c => <option key={c} value={c}>{c}</option>)}
                </select>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                  {t('addCrop.variety', 'Variety / Strain')} *
                </label>
                <input
                  type="text"
                  value={formData.variety}
                  onChange={(e) => handleInputChange('variety', e.target.value)}
                  placeholder={t('addCrop.varietyPlaceholder', 'e.g., Cherry Tomatoes, Pusa 1121')}
                  className="input-field text-sm"
                  required
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                  {t('addCrop.qualityDetails', 'Quality Grade')}
                </label>
                <select
                  value={formData.quality.grade}
                  onChange={(e) => handleInputChange('quality.grade', e.target.value)}
                  className="input-field text-sm"
                >
                  {grades.map(g => <option key={g} value={g}>{g}</option>)}
                </select>
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                {t('addCrop.description', 'Detailed Description')}
              </label>
              <textarea
                rows="3"
                value={formData.description}
                onChange={(e) => handleInputChange('description', e.target.value)}
                placeholder={t('addCrop.descriptionPlaceholder', 'Describe produce freshness, soil conditions, farming practices...')}
                className="input-field text-sm"
              ></textarea>
            </div>
          </div>

          {/* Quantity & Pricing */}
          <div className="card p-6 bg-white border border-slate-200/80 shadow-md space-y-4">
            <h2 className="text-base font-bold text-slate-900 uppercase tracking-wider font-heading pb-2 border-b border-slate-100">
              Quantity & Pricing
            </h2>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                  {t('addCrop.quantityValue', 'Quantity Available')} *
                </label>
                <input
                  type="number"
                  min="1"
                  value={formData.quantity.value}
                  onChange={(e) => handleInputChange('quantity.value', e.target.value)}
                  placeholder="100"
                  className="input-field text-sm"
                  required
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                  {t('addCrop.unit', 'Unit')}
                </label>
                <select
                  value={formData.quantity.unit}
                  onChange={(e) => handleInputChange('quantity.unit', e.target.value)}
                  className="input-field text-sm"
                >
                  {units.map(u => <option key={u} value={u}>{u}</option>)}
                </select>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                  {t('addCrop.pricePerUnit', 'Price per Unit (₹)')} *
                </label>
                <input
                  type="number"
                  min="1"
                  value={formData.price.perUnit}
                  onChange={(e) => handleInputChange('price.perUnit', e.target.value)}
                  placeholder="50"
                  className="input-field text-sm"
                  required
                />
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2">
              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                  {t('addCrop.harvestDate', 'Harvest Date')} *
                </label>
                <input
                  type="date"
                  value={formData.harvestDate}
                  onChange={(e) => handleInputChange('harvestDate', e.target.value)}
                  className="input-field text-sm"
                  required
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                  {t('addCrop.expiryDate', 'Best Before / Expiry')} *
                </label>
                <input
                  type="date"
                  value={formData.expiryDate}
                  onChange={(e) => handleInputChange('expiryDate', e.target.value)}
                  className="input-field text-sm"
                  required
                />
              </div>
            </div>
          </div>

          {/* Farm Location & GPS */}
          <div className="card p-6 bg-white border border-slate-200/80 shadow-md space-y-4">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-2 border-b border-slate-100">
              <div>
                <h2 className="text-base font-bold text-slate-900 uppercase tracking-wider font-heading">
                  {t('addCrop.farmLocation', 'Farm Location')}
                </h2>
                <p className="text-xs text-slate-500">
                  {t('addCrop.farmLocationSub', 'Provide harvest location for buyers to calculate delivery distances')}
                </p>
              </div>

              <button
                type="button"
                onClick={handleAutoDetectGPS}
                disabled={isDetectingGPS}
                className="inline-flex items-center space-x-1.5 px-3.5 py-2 rounded-xl text-xs font-bold text-emerald-800 bg-emerald-100 hover:bg-emerald-200 transition-colors shadow-sm self-start sm:self-auto"
              >
                {isDetectingGPS ? (
                  <>
                    <Loader className="w-3.5 h-3.5 animate-spin" />
                    <span>{t('addCrop.detectingGPS', 'Detecting GPS...')}</span>
                  </>
                ) : (
                  <>
                    <Compass className="w-3.5 h-3.5" />
                    <span>{t('addCrop.autoDetectGPS', '📍 Auto-Detect Farm GPS')}</span>
                  </>
                )}
              </button>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                  {t('addCrop.state', 'State')} *
                </label>
                <select
                  value={formData.location.state}
                  onChange={(e) => handleInputChange('location.state', e.target.value)}
                  className="input-field text-sm"
                  required
                >
                  <option value="">{t('addCrop.selectState', 'Select State')}</option>
                  {states.map(s => <option key={s} value={s}>{s}</option>)}
                </select>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                  {t('addCrop.district', 'District')} *
                </label>
                <input
                  type="text"
                  value={formData.location.district}
                  onChange={(e) => handleInputChange('location.district', e.target.value)}
                  placeholder={t('addCrop.districtPlaceholder', 'Enter district name')}
                  className="input-field text-sm"
                  required
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                  {t('addCrop.pincode', '6-Digit Pincode')} *
                </label>
                <input
                  type="text"
                  maxLength="6"
                  value={formData.location.pincode}
                  onChange={(e) => handleInputChange('location.pincode', e.target.value)}
                  placeholder="411001"
                  className="input-field text-sm"
                  required
                />
              </div>
            </div>
          </div>

          {/* Produce Photos Upload */}
          <div className="card p-6 bg-white border border-slate-200/80 shadow-md space-y-4">
            <h2 className="text-base font-bold text-slate-900 uppercase tracking-wider font-heading pb-2 border-b border-slate-100">
              {t('addCrop.photos', 'Produce Photos (Max 5)')}
            </h2>

            <div className="flex items-center space-x-3">
              <label className="cursor-pointer inline-flex items-center space-x-2 px-4 py-2.5 rounded-xl bg-emerald-50 text-emerald-800 font-bold text-xs hover:bg-emerald-100 border border-emerald-300">
                <Upload className="w-4 h-4 text-emerald-600" />
                <span>{t('addCrop.uploadPhotos', 'Upload Image Files')}</span>
                <input
                  type="file"
                  multiple
                  accept="image/*"
                  onChange={handleImageUpload}
                  className="hidden"
                />
              </label>
              <span className="text-xs text-slate-400">{images.length} / 5 uploaded</span>
            </div>

            {images.length > 0 && (
              <div className="flex flex-wrap gap-3 pt-2">
                {images.map((img, idx) => (
                  <div key={idx} className="relative w-20 h-20 rounded-2xl overflow-hidden border border-slate-200 shadow-sm">
                    <img src={img.preview} alt="Crop preview" className="w-full h-full object-cover" />
                    <button
                      type="button"
                      onClick={() => removeImage(idx)}
                      className="absolute top-1 right-1 w-5 h-5 bg-rose-600 text-white rounded-full flex items-center justify-center text-xs"
                    >
                      <X className="w-3 h-3" />
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Organic checkbox */}
          <div className="p-4 bg-emerald-50/70 border border-emerald-200/80 rounded-2xl flex items-center space-x-3">
            <input
              type="checkbox"
              id="isOrganic"
              checked={formData.quality.organic}
              onChange={(e) => handleInputChange('quality.organic', e.target.checked)}
              className="w-5 h-5 text-emerald-600 rounded focus:ring-emerald-500 border-slate-300"
            />
            <label htmlFor="isOrganic" className="text-xs sm:text-sm font-bold text-emerald-900 cursor-pointer flex items-center space-x-1.5">
              <Leaf className="w-4 h-4 text-emerald-700" />
              <span>{t('addCrop.isOrganic', '100% Certified Organic Produce')}</span>
            </label>
          </div>

          {/* Submit */}
          <button
            type="submit"
            disabled={isSubmitting}
            className="w-full btn-primary py-4 text-sm font-bold justify-center shadow-lg"
          >
            {isSubmitting ? (
              <span>{t('addCrop.submitting', 'Publishing Crop...')}</span>
            ) : (
              <span>{t('addCrop.submitListing', 'Publish Crop Listing')}</span>
            )}
          </button>

        </form>
      </div>

    </div>
  );
};

export default AddCrop;
