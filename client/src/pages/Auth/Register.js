import React, { useState, useEffect } from 'react';
import { Link, useNavigate, useSearchParams } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { useAuth } from '../../contexts/AuthContext';
import { Eye, EyeOff, User, Mail, Phone, ArrowRight, Sprout } from 'lucide-react';
import LoadingSpinner from '../../components/UI/LoadingSpinner';

const Register = () => {
  const { t } = useTranslation();
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
  const [isGoogleLoading, setIsGoogleLoading] = useState(false);
  const [errors, setErrors] = useState({});

  const { register, loginWithGoogle, isAuthenticated } = useAuth();
  const navigate = useNavigate();

  const handleGoogleSignUp = async () => {
    setIsGoogleLoading(true);
    try {
      const result = await loginWithGoogle(formData.userType);
      if (result.success) {
        navigate('/dashboard');
      }
    } catch (error) {
      console.error('Google sign-up error:', error);
    } finally {
      setIsGoogleLoading(false);
    }
  };

  useEffect(() => {
    if (isAuthenticated) {
      navigate('/dashboard');
    }
  }, [isAuthenticated, navigate]);

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

    if (errors[name]) {
      setErrors(prev => ({
        ...prev,
        [name]: ''
      }));
    }
  };

  const validateForm = () => {
    const newErrors = {};

    if (!formData.name.trim()) newErrors.name = 'Name is required';
    if (!formData.email.trim()) newErrors.email = 'Email is required';
    else if (!/\S+@\S+\.\S+/.test(formData.email)) newErrors.email = 'Invalid email address';
    
    if (!formData.password) newErrors.password = 'Password is required';
    else if (formData.password.length < 6) newErrors.password = 'Password must be at least 6 characters';
    
    if (formData.password !== formData.confirmPassword) {
      newErrors.confirmPassword = 'Passwords do not match';
    }
    
    if (!formData.phone.trim()) newErrors.phone = 'Phone number is required';
    else if (!/^\d{10}$/.test(formData.phone.replace(/\D/g, ''))) {
      newErrors.phone = 'Invalid 10-digit phone number';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!validateForm()) return;
    
    setIsLoading(true);

    try {
      const result = await register(formData);
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
    <div className="min-h-screen bg-slate-50 flex flex-col justify-center py-12 sm:px-6 lg:px-8">
      <div className="sm:mx-auto sm:w-full sm:max-w-2xl">
        <div className="flex justify-center">
          <Link to="/" className="flex items-center space-x-2 group">
            <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-emerald-500 to-teal-700 flex items-center justify-center shadow-lg group-hover:scale-105 transition-transform">
              <Sprout className="w-7 h-7 text-white" />
            </div>
            <span className="text-3xl font-black text-slate-900 font-heading">
              Farm<span className="text-emerald-600">2</span>Market
            </span>
          </Link>
        </div>
        <h2 className="mt-6 text-center text-3xl font-black text-slate-900 font-heading">
          {t('auth.register', 'Create Account')}
        </h2>
        <p className="mt-2 text-center text-sm text-slate-600">
          {t('auth.registerSubtitle', "Join India's fastest growing agricultural network")}
        </p>
      </div>

      <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-2xl">
        <div className="card bg-white py-8 px-6 shadow-xl sm:rounded-3xl sm:px-10 border border-slate-200/80">
          
          {/* User Type Selection Cards */}
          <div className="mb-6 p-4 rounded-2xl bg-slate-50 border border-slate-200/80">
            <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-3">
              {t('auth.userType', 'I want to join as:')}
            </label>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <button
                type="button"
                onClick={() => setFormData(prev => ({ ...prev, userType: 'farmer' }))}
                className={`p-4 rounded-2xl border-2 text-left transition-all ${
                  formData.userType === 'farmer'
                    ? 'border-emerald-600 bg-emerald-50/70 ring-2 ring-emerald-500/20'
                    : 'border-slate-200 bg-white hover:border-slate-300'
                }`}
              >
                <div className="flex items-center justify-between">
                  <span className="text-2xl">🌾</span>
                  {formData.userType === 'farmer' && (
                    <span className="w-5 h-5 rounded-full bg-emerald-600 text-white flex items-center justify-center text-xs font-black">✓</span>
                  )}
                </div>
                <div className="font-bold text-slate-900 text-sm mt-2">{t('nav.roleFarmer', 'Farmer')}</div>
                <div className="text-xs text-slate-500 mt-0.5">{t('auth.farmerDesc', 'List crops, receive fair pricing, and connect with direct buyers')}</div>
              </button>

              <button
                type="button"
                onClick={() => setFormData(prev => ({ ...prev, userType: 'buyer' }))}
                className={`p-4 rounded-2xl border-2 text-left transition-all ${
                  formData.userType === 'buyer'
                    ? 'border-emerald-600 bg-emerald-50/70 ring-2 ring-emerald-500/20'
                    : 'border-slate-200 bg-white hover:border-slate-300'
                }`}
              >
                <div className="flex items-center justify-between">
                  <span className="text-2xl">🛒</span>
                  {formData.userType === 'buyer' && (
                    <span className="w-5 h-5 rounded-full bg-emerald-600 text-white flex items-center justify-center text-xs font-black">✓</span>
                  )}
                </div>
                <div className="font-bold text-slate-900 text-sm mt-2">{t('nav.roleBuyer', 'Buyer')}</div>
                <div className="text-xs text-slate-500 mt-0.5">{t('auth.buyerDesc', 'Source fresh crops directly from farmers with transparent pricing')}</div>
              </button>
            </div>

            {/* Google Fast Sign Up with Selected Role */}
            <div className="mt-4 pt-3 border-t border-slate-200">
              <button
                type="button"
                onClick={handleGoogleSignUp}
                disabled={isLoading || isGoogleLoading}
                className="w-full flex items-center justify-center px-4 py-3 border border-slate-300 rounded-xl shadow-sm bg-white text-sm font-bold text-slate-700 hover:bg-slate-50 transition-all"
              >
                {isGoogleLoading ? (
                  <LoadingSpinner size="small" />
                ) : (
                  <>
                    <svg className="w-5 h-5 mr-3" viewBox="0 0 24 24">
                      <path
                        fill="#4285F4"
                        d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                      />
                      <path
                        fill="#34A853"
                        d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                      />
                      <path
                        fill="#FBBC05"
                        d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z"
                      />
                      <path
                        fill="#EA4335"
                        d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z"
                      />
                    </svg>
                    <span>
                      {t('auth.signUpGoogle', 'Sign up with Google')} ({formData.userType === 'farmer' ? t('nav.roleFarmer', 'Farmer') : t('nav.roleBuyer', 'Buyer')})
                    </span>
                  </>
                )}
              </button>
            </div>
          </div>

          {/* Form */}
          <form className="space-y-4" onSubmit={handleSubmit}>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                  {t('auth.name', 'Full Name')} *
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <User className="h-4 w-4 text-slate-400" />
                  </div>
                  <input
                    name="name"
                    type="text"
                    required
                    value={formData.name}
                    onChange={handleChange}
                    className="input-field pl-9 text-sm"
                    placeholder="Your Name"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                  {t('auth.email', 'Email Address')} *
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <Mail className="h-4 w-4 text-slate-400" />
                  </div>
                  <input
                    name="email"
                    type="email"
                    required
                    value={formData.email}
                    onChange={handleChange}
                    className="input-field pl-9 text-sm"
                    placeholder="you@example.com"
                  />
                </div>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                  {t('auth.password', 'Password')} *
                </label>
                <div className="relative">
                  <input
                    name="password"
                    type={showPassword ? 'text' : 'password'}
                    required
                    value={formData.password}
                    onChange={handleChange}
                    className="input-field pr-10 text-sm"
                    placeholder="••••••••"
                  />
                  <button
                    type="button"
                    className="absolute inset-y-0 right-0 pr-3 flex items-center"
                    onClick={() => setShowPassword(!showPassword)}
                  >
                    {showPassword ? <EyeOff className="h-4 w-4 text-slate-400" /> : <Eye className="h-4 w-4 text-slate-400" />}
                  </button>
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                  {t('auth.confirmPassword', 'Confirm Password')} *
                </label>
                <div className="relative">
                  <input
                    name="confirmPassword"
                    type={showConfirmPassword ? 'text' : 'password'}
                    required
                    value={formData.confirmPassword}
                    onChange={handleChange}
                    className="input-field pr-10 text-sm"
                    placeholder="••••••••"
                  />
                  <button
                    type="button"
                    className="absolute inset-y-0 right-0 pr-3 flex items-center"
                    onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                  >
                    {showConfirmPassword ? <EyeOff className="h-4 w-4 text-slate-400" /> : <Eye className="h-4 w-4 text-slate-400" />}
                  </button>
                </div>
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                {t('auth.phone', 'Phone Number')} *
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <Phone className="h-4 w-4 text-slate-400" />
                </div>
                <input
                  name="phone"
                  type="tel"
                  required
                  value={formData.phone}
                  onChange={handleChange}
                  className="input-field pl-9 text-sm"
                  placeholder="9876543210"
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={isLoading}
              className="w-full btn-primary py-3 text-sm font-bold justify-center shadow-lg mt-4"
            >
              {isLoading ? (
                <LoadingSpinner size="small" color="white" />
              ) : (
                <>
                  <span>{t('auth.register', 'Create Account')}</span>
                  <ArrowRight className="ml-2 h-4 w-4" />
                </>
              )}
            </button>
          </form>

          <div className="mt-6 text-center text-xs">
            <span className="text-slate-500">{t('auth.alreadyHaveAccount', 'Already have an account?')} </span>
            <Link to="/login" className="font-bold text-emerald-700 hover:text-emerald-800 underline">
              {t('auth.login', 'Log In')}
            </Link>
          </div>

        </div>
      </div>
    </div>
  );
};

export default Register;
