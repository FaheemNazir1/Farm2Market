import React, { useState, useEffect } from 'react';
import { Link, useNavigate, useSearchParams } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import { Eye, EyeOff, User, Mail, Phone, MapPin, ArrowRight } from 'lucide-react';
import LoadingSpinner from '../../components/UI/LoadingSpinner';

const Register = () => {
  const [searchParams] = useSearchParams();
  const userType = searchParams.get('type') || 'farmer';

  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    confirmPassword: '',
    phone: '',
    userType: userType,
    address: {
      street: '',
      city: '',
      state: '',
      pincode: ''
    },
    farmDetails: {
      farmName: '',
      farmSize: '',
      farmingExperience: '',
      organicCertified: false
    },
    businessDetails: {
      businessName: '',
      businessType: '',
      gstNumber: '',
      licenseNumber: ''
    }
  });

  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [errors, setErrors] = useState({});

  const { register, isAuthenticated } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    if (isAuthenticated) {
      navigate('/dashboard');
    }
  }, [isAuthenticated, navigate]);

  const states = [
    'Andhra Pradesh', 'Arunachal Pradesh', 'Assam', 'Bihar', 'Chhattisgarh',
    'Goa', 'Gujarat', 'Haryana', 'Himachal Pradesh', 'Jharkhand',
    'Karnataka', 'Kerala', 'Madhya Pradesh', 'Maharashtra', 'Manipur',
    'Meghalaya', 'Mizoram', 'Nagaland', 'Odisha', 'Punjab',
    'Rajasthan', 'Sikkim', 'Tamil Nadu', 'Telangana', 'Tripura',
    'Uttar Pradesh', 'Uttarakhand', 'West Bengal', 'Delhi', 'Chandigarh'
  ];

  const businessTypes = [
    'Restaurant', 'Hotel', 'Catering', 'Retail Store', 'Supermarket',
    'Food Processing', 'Export', 'Wholesale', 'Other'
  ];

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    
    if (name.startsWith('address.')) {
      const field = name.split('.')[1];
      setFormData(prev => ({
        ...prev,
        address: {
          ...prev.address,
          [field]: value
        }
      }));
    } else if (name.startsWith('farmDetails.')) {
      const field = name.split('.')[1];
      setFormData(prev => ({
        ...prev,
        farmDetails: {
          ...prev.farmDetails,
          [field]: type === 'checkbox' ? checked : value
        }
      }));
    } else if (name.startsWith('businessDetails.')) {
      const field = name.split('.')[1];
      setFormData(prev => ({
        ...prev,
        businessDetails: {
          ...prev.businessDetails,
          [field]: value
        }
      }));
    } else {
      setFormData(prev => ({
        ...prev,
        [name]: value
      }));
    }

    // Clear error when user starts typing
    if (errors[name]) {
      setErrors(prev => ({
        ...prev,
        [name]: ''
      }));
    }
  };

  const validateForm = () => {
    const newErrors = {};

    if (!formData.name.trim()) {
      newErrors.name = 'Name is required';
    }

    if (!formData.email.trim()) {
      newErrors.email = 'Email is required';
    } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
      newErrors.email = 'Email is invalid';
    }

    if (!formData.password) {
      newErrors.password = 'Password is required';
    } else if (formData.password.length < 6) {
      newErrors.password = 'Password must be at least 6 characters';
    }

    if (formData.password !== formData.confirmPassword) {
      newErrors.confirmPassword = 'Passwords do not match';
    }

    if (!formData.phone.trim()) {
      newErrors.phone = 'Phone number is required';
    } else if (!/^[0-9]{10,11}$/.test(formData.phone)) {
      newErrors.phone = 'Invalid phone number';
    }

    if (!formData.address.street.trim()) {
      newErrors['address.street'] = 'Street address is required';
    }

    if (!formData.address.city.trim()) {
      newErrors['address.city'] = 'City is required';
    }

    if (!formData.address.state) {
      newErrors['address.state'] = 'State is required';
    }

    if (!formData.address.pincode.trim()) {
      newErrors['address.pincode'] = 'Pincode is required';
    } else if (!/^\d{6}$/.test(formData.address.pincode)) {
      newErrors['address.pincode'] = 'Invalid pincode';
    }

    if (formData.userType === 'farmer') {
      if (!formData.farmDetails.farmName.trim()) {
        newErrors['farmDetails.farmName'] = 'Farm name is required';
      }
    }

    if (formData.userType === 'buyer') {
      if (!formData.businessDetails.businessName.trim()) {
        newErrors['businessDetails.businessName'] = 'Business name is required';
      }
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!validateForm()) {
      console.log('Form validation failed:', errors);
      return;
    }

    console.log('Form data being submitted:', formData);
    setIsLoading(true);

    try {
      const result = await register(formData);
      console.log('Registration result:', result);
      if (result.success) {
        navigate('/dashboard');
      }
    } catch (error) {
      console.error('Registration error:', error);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 py-12 sm:px-6 lg:px-8">
      <div className="sm:mx-auto sm:w-full sm:max-w-2xl">
        <div className="flex justify-center">
          <div className="w-12 h-12 bg-primary-600 rounded-lg flex items-center justify-center">
            <span className="text-white font-bold text-xl">F</span>
          </div>
        </div>
        <h2 className="mt-6 text-center text-3xl font-bold text-gray-900">
          Join Farm2Market
        </h2>
        <p className="mt-2 text-center text-sm text-gray-600">
          Create your account to start trading
        </p>
      </div>

      <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-2xl">
        <div className="bg-white py-8 px-4 shadow sm:rounded-lg sm:px-10">
          {/* User Type Selection */}
          <div className="mb-8">
            <label className="block text-sm font-medium text-gray-700 mb-4">
              I want to join as:
            </label>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <button
                type="button"
                onClick={() => setFormData(prev => ({ ...prev, userType: 'farmer' }))}
                className={`p-4 border-2 rounded-lg text-center transition-colors ${
                  formData.userType === 'farmer'
                    ? 'border-primary-600 bg-primary-50 text-primary-700'
                    : 'border-gray-200 hover:border-gray-300'
                }`}
              >
                <div className="font-semibold">Farmer</div>
                <div className="text-sm text-gray-600">Sell your crops directly</div>
              </button>
              <button
                type="button"
                onClick={() => setFormData(prev => ({ ...prev, userType: 'buyer' }))}
                className={`p-4 border-2 rounded-lg text-center transition-colors ${
                  formData.userType === 'buyer'
                    ? 'border-primary-600 bg-primary-50 text-primary-700'
                    : 'border-gray-200 hover:border-gray-300'
                }`}
              >
                <div className="font-semibold">Buyer</div>
                <div className="text-sm text-gray-600">Buy fresh produce</div>
              </button>
            </div>
          </div>

          <form className="space-y-6" onSubmit={handleSubmit}>
            {/* Basic Information */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label htmlFor="name" className="block text-sm font-medium text-gray-700">
                  Full Name *
                </label>
                <div className="mt-1 relative">
                  <input
                    id="name"
                    name="name"
                    type="text"
                    required
                    value={formData.name}
                    onChange={handleChange}
                    className={`input-field pl-10 ${errors.name ? 'border-red-500' : ''}`}
                    placeholder="Enter your full name"
                  />
                  <User className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
                </div>
                {errors.name && <p className="mt-1 text-sm text-red-600">{errors.name}</p>}
              </div>

              <div>
                <label htmlFor="email" className="block text-sm font-medium text-gray-700">
                  Email Address *
                </label>
                <div className="mt-1 relative">
                  <input
                    id="email"
                    name="email"
                    type="email"
                    required
                    value={formData.email}
                    onChange={handleChange}
                    className={`input-field pl-10 ${errors.email ? 'border-red-500' : ''}`}
                    placeholder="Enter your email"
                  />
                  <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
                </div>
                {errors.email && <p className="mt-1 text-sm text-red-600">{errors.email}</p>}
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label htmlFor="password" className="block text-sm font-medium text-gray-700">
                  Password *
                </label>
                <div className="mt-1 relative">
                  <input
                    id="password"
                    name="password"
                    type={showPassword ? 'text' : 'password'}
                    required
                    value={formData.password}
                    onChange={handleChange}
                    className={`input-field pl-10 pr-10 ${errors.password ? 'border-red-500' : ''}`}
                    placeholder="Create a password"
                  />
                  <button
                    type="button"
                    className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
                    onClick={() => setShowPassword(!showPassword)}
                  >
                    {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                  </button>
                </div>
                {errors.password && <p className="mt-1 text-sm text-red-600">{errors.password}</p>}
              </div>

              <div>
                <label htmlFor="confirmPassword" className="block text-sm font-medium text-gray-700">
                  Confirm Password *
                </label>
                <div className="mt-1 relative">
                  <input
                    id="confirmPassword"
                    name="confirmPassword"
                    type={showConfirmPassword ? 'text' : 'password'}
                    required
                    value={formData.confirmPassword}
                    onChange={handleChange}
                    className={`input-field pl-10 pr-10 ${errors.confirmPassword ? 'border-red-500' : ''}`}
                    placeholder="Confirm your password"
                  />
                  <button
                    type="button"
                    className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
                    onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                  >
                    {showConfirmPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                  </button>
                </div>
                {errors.confirmPassword && <p className="mt-1 text-sm text-red-600">{errors.confirmPassword}</p>}
              </div>
            </div>

            <div>
              <label htmlFor="phone" className="block text-sm font-medium text-gray-700">
                Phone Number *
              </label>
              <div className="mt-1 relative">
                <input
                  id="phone"
                  name="phone"
                  type="tel"
                  required
                  value={formData.phone}
                  onChange={handleChange}
                  className={`input-field pl-10 ${errors.phone ? 'border-red-500' : ''}`}
                  placeholder="Enter your 10-11 digit phone number"
                />
                <Phone className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
              </div>
              {errors.phone && <p className="mt-1 text-sm text-red-600">{errors.phone}</p>}
            </div>

            {/* Address */}
            <div className="border-t pt-6">
              <h3 className="text-lg font-medium text-gray-900 mb-4">Address Information</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="md:col-span-2">
                  <label htmlFor="address.street" className="block text-sm font-medium text-gray-700">
                    Street Address *
                  </label>
                  <div className="mt-1 relative">
                    <input
                      id="address.street"
                      name="address.street"
                      type="text"
                      required
                      value={formData.address.street}
                      onChange={handleChange}
                      className={`input-field pl-10 ${errors['address.street'] ? 'border-red-500' : ''}`}
                      placeholder="Enter your street address"
                    />
                    <MapPin className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
                  </div>
                  {errors['address.street'] && <p className="mt-1 text-sm text-red-600">{errors['address.street']}</p>}
                </div>

                <div>
                  <label htmlFor="address.city" className="block text-sm font-medium text-gray-700">
                    City *
                  </label>
                  <input
                    id="address.city"
                    name="address.city"
                    type="text"
                    required
                    value={formData.address.city}
                    onChange={handleChange}
                    className={`input-field ${errors['address.city'] ? 'border-red-500' : ''}`}
                    placeholder="Enter your city"
                  />
                  {errors['address.city'] && <p className="mt-1 text-sm text-red-600">{errors['address.city']}</p>}
                </div>

                <div>
                  <label htmlFor="address.state" className="block text-sm font-medium text-gray-700">
                    State *
                  </label>
                  <select
                    id="address.state"
                    name="address.state"
                    required
                    value={formData.address.state}
                    onChange={handleChange}
                    className={`input-field ${errors['address.state'] ? 'border-red-500' : ''}`}
                  >
                    <option value="">Select your state</option>
                    {states.map(state => (
                      <option key={state} value={state}>{state}</option>
                    ))}
                  </select>
                  {errors['address.state'] && <p className="mt-1 text-sm text-red-600">{errors['address.state']}</p>}
                </div>

                <div>
                  <label htmlFor="address.pincode" className="block text-sm font-medium text-gray-700">
                    Pincode *
                  </label>
                  <input
                    id="address.pincode"
                    name="address.pincode"
                    type="text"
                    required
                    value={formData.address.pincode}
                    onChange={handleChange}
                    className={`input-field ${errors['address.pincode'] ? 'border-red-500' : ''}`}
                    placeholder="Enter 6-digit pincode"
                  />
                  {errors['address.pincode'] && <p className="mt-1 text-sm text-red-600">{errors['address.pincode']}</p>}
                </div>
              </div>
            </div>

            {/* Farmer Specific Fields */}
            {formData.userType === 'farmer' && (
              <div className="border-t pt-6">
                <h3 className="text-lg font-medium text-gray-900 mb-4">Farm Information</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label htmlFor="farmDetails.farmName" className="block text-sm font-medium text-gray-700">
                      Farm Name *
                    </label>
                    <input
                      id="farmDetails.farmName"
                      name="farmDetails.farmName"
                      type="text"
                      required
                      value={formData.farmDetails.farmName}
                      onChange={handleChange}
                      className={`input-field ${errors['farmDetails.farmName'] ? 'border-red-500' : ''}`}
                      placeholder="Enter your farm name"
                    />
                    {errors['farmDetails.farmName'] && <p className="mt-1 text-sm text-red-600">{errors['farmDetails.farmName']}</p>}
                  </div>

                  <div>
                    <label htmlFor="farmDetails.farmSize" className="block text-sm font-medium text-gray-700">
                      Farm Size
                    </label>
                    <input
                      id="farmDetails.farmSize"
                      name="farmDetails.farmSize"
                      type="text"
                      value={formData.farmDetails.farmSize}
                      onChange={handleChange}
                      className="input-field"
                      placeholder="e.g., 5 acres, 2 hectares"
                    />
                  </div>

                  <div>
                    <label htmlFor="farmDetails.farmingExperience" className="block text-sm font-medium text-gray-700">
                      Years of Experience
                    </label>
                    <input
                      id="farmDetails.farmingExperience"
                      name="farmDetails.farmingExperience"
                      type="number"
                      value={formData.farmDetails.farmingExperience}
                      onChange={handleChange}
                      className="input-field"
                      placeholder="Enter years of experience"
                      min="0"
                    />
                  </div>

                  <div className="flex items-center">
                    <input
                      id="farmDetails.organicCertified"
                      name="farmDetails.organicCertified"
                      type="checkbox"
                      checked={formData.farmDetails.organicCertified}
                      onChange={handleChange}
                      className="h-4 w-4 text-primary-600 focus:ring-primary-500 border-gray-300 rounded"
                    />
                    <label htmlFor="farmDetails.organicCertified" className="ml-2 block text-sm text-gray-900">
                      Organic Certified
                    </label>
                  </div>
                </div>
              </div>
            )}

            {/* Buyer Specific Fields */}
            {formData.userType === 'buyer' && (
              <div className="border-t pt-6">
                <h3 className="text-lg font-medium text-gray-900 mb-4">Business Information</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label htmlFor="businessDetails.businessName" className="block text-sm font-medium text-gray-700">
                      Business Name *
                    </label>
                    <input
                      id="businessDetails.businessName"
                      name="businessDetails.businessName"
                      type="text"
                      required
                      value={formData.businessDetails.businessName}
                      onChange={handleChange}
                      className={`input-field ${errors['businessDetails.businessName'] ? 'border-red-500' : ''}`}
                      placeholder="Enter your business name"
                    />
                    {errors['businessDetails.businessName'] && <p className="mt-1 text-sm text-red-600">{errors['businessDetails.businessName']}</p>}
                  </div>

                  <div>
                    <label htmlFor="businessDetails.businessType" className="block text-sm font-medium text-gray-700">
                      Business Type
                    </label>
                    <select
                      id="businessDetails.businessType"
                      name="businessDetails.businessType"
                      value={formData.businessDetails.businessType}
                      onChange={handleChange}
                      className="input-field"
                    >
                      <option value="">Select business type</option>
                      {businessTypes.map(type => (
                        <option key={type} value={type}>{type}</option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label htmlFor="businessDetails.gstNumber" className="block text-sm font-medium text-gray-700">
                      GST Number
                    </label>
                    <input
                      id="businessDetails.gstNumber"
                      name="businessDetails.gstNumber"
                      type="text"
                      value={formData.businessDetails.gstNumber}
                      onChange={handleChange}
                      className="input-field"
                      placeholder="Enter GST number (optional)"
                    />
                  </div>

                  <div>
                    <label htmlFor="businessDetails.licenseNumber" className="block text-sm font-medium text-gray-700">
                      License Number
                    </label>
                    <input
                      id="businessDetails.licenseNumber"
                      name="businessDetails.licenseNumber"
                      type="text"
                      value={formData.businessDetails.licenseNumber}
                      onChange={handleChange}
                      className="input-field"
                      placeholder="Enter license number (optional)"
                    />
                  </div>
                </div>
              </div>
            )}

            <div>
              <button
                type="submit"
                disabled={isLoading}
                className="w-full btn-primary flex justify-center items-center py-3"
              >
                {isLoading ? (
                  <LoadingSpinner size="small" />
                ) : (
                  <>
                    Create Account
                    <ArrowRight className="ml-2 w-5 h-5" />
                  </>
                )}
              </button>
            </div>

            <div className="text-center">
              <p className="text-sm text-gray-600">
                Already have an account?{' '}
                <Link to="/login" className="font-medium text-primary-600 hover:text-primary-500">
                  Sign in here
                </Link>
              </p>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default Register;
