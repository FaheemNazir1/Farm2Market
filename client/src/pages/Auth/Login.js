import React, { useState, useEffect } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { useAuth } from '../../contexts/AuthContext';
import { Eye, EyeOff, Mail, Lock, ArrowRight, Sprout } from 'lucide-react';
import LoadingSpinner from '../../components/UI/LoadingSpinner';
import toast from 'react-hot-toast';

const Login = () => {
  const { t } = useTranslation();
  const [formData, setFormData] = useState({
    email: '',
    password: ''
  });
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [isGoogleLoading, setIsGoogleLoading] = useState(false);

  // Modal state for brand new Google users needing role selection
  const [showRoleModal, setShowRoleModal] = useState(false);
  const [pendingIdToken, setPendingIdToken] = useState(null);
  const [selectedRole, setSelectedRole] = useState('buyer');

  const { login, loginWithGoogle, isAuthenticated } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  const from = location.state?.from?.pathname || '/dashboard';

  useEffect(() => {
    if (isAuthenticated) {
      navigate(from, { replace: true });
    }
  }, [isAuthenticated, navigate, from]);

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      const result = await login(formData.email, formData.password);
      if (result.success) {
        navigate(from, { replace: true });
      }
    } catch (error) {
      console.error('Login error:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleGoogleSignIn = async () => {
    setIsGoogleLoading(true);
    try {
      // Attempt login without forcing a role (preserves existing user role)
      const result = await loginWithGoogle(null);
      
      if (result.success) {
        navigate(from, { replace: true });
      } else if (result.requiresRoleSelection && result.idToken) {
        // Brand new Google user detected: Show role selector modal
        setPendingIdToken(result.idToken);
        setShowRoleModal(true);
      }
    } catch (error) {
      console.error('Google login trigger error:', error);
    } finally {
      setIsGoogleLoading(false);
    }
  };

  const handleCompleteGoogleRegistration = async () => {
    if (!pendingIdToken || !selectedRole) {
      toast.error('Please select your role (Farmer or Buyer).');
      return;
    }

    setIsGoogleLoading(true);
    try {
      const result = await loginWithGoogle(selectedRole, pendingIdToken);
      if (result.success) {
        setShowRoleModal(false);
        navigate(from, { replace: true });
      }
    } catch (error) {
      const errorMsg = error.response?.data?.message || 'Failed to complete registration';
      toast.error(errorMsg);
    } finally {
      setIsGoogleLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col justify-center py-12 sm:px-6 lg:px-8">
      <div className="sm:mx-auto sm:w-full sm:max-w-md">
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
          {t('auth.login', 'Log In')}
        </h2>
        <p className="mt-2 text-center text-sm text-slate-600">
          {t('auth.loginSubtitle', 'Access your Farm2Market account')}
        </p>
      </div>

      <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-md">
        <div className="card bg-white py-8 px-6 shadow-xl sm:rounded-3xl sm:px-10 border border-slate-200/80">
          <form className="space-y-5" onSubmit={handleSubmit}>
            <div>
              <label htmlFor="email" className="block text-xs font-bold text-slate-700 uppercase tracking-wider">
                {t('auth.email', 'Email Address')}
              </label>
              <div className="mt-1 relative rounded-xl shadow-sm">
                <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none">
                  <Mail className="h-5 w-5 text-slate-400" />
                </div>
                <input
                  id="email"
                  name="email"
                  type="email"
                  autoComplete="email"
                  required
                  value={formData.email}
                  onChange={handleChange}
                  className="input-field pl-11 text-sm"
                  placeholder={t('auth.emailPlaceholder', 'you@example.com')}
                />
              </div>
            </div>

            <div>
              <label htmlFor="password" className="block text-xs font-bold text-slate-700 uppercase tracking-wider">
                {t('auth.password', 'Password')}
              </label>
              <div className="mt-1 relative rounded-xl shadow-sm">
                <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none">
                  <Lock className="h-5 w-5 text-slate-400" />
                </div>
                <input
                  id="password"
                  name="password"
                  type={showPassword ? 'text' : 'password'}
                  autoComplete="current-password"
                  required
                  value={formData.password}
                  onChange={handleChange}
                  className="input-field pl-11 pr-10 text-sm"
                  placeholder="••••••••"
                />
                <button
                  type="button"
                  className="absolute inset-y-0 right-0 pr-3.5 flex items-center"
                  onClick={() => setShowPassword(!showPassword)}
                >
                  {showPassword ? (
                    <EyeOff className="h-5 w-5 text-slate-400 hover:text-slate-600" />
                  ) : (
                    <Eye className="h-5 w-5 text-slate-400 hover:text-slate-600" />
                  )}
                </button>
              </div>
            </div>

            <div>
              <button
                type="submit"
                disabled={isLoading}
                className="w-full btn-primary py-3 text-sm font-bold justify-center shadow-lg"
              >
                {isLoading ? (
                  <LoadingSpinner size="small" color="white" />
                ) : (
                  <>
                    <span>{t('auth.login', 'Log In')}</span>
                    <ArrowRight className="ml-2 h-4 w-4" />
                  </>
                )}
              </button>
            </div>
          </form>

          <div className="mt-6">
            <div className="relative">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t border-slate-200" />
              </div>
              <div className="relative flex justify-center text-xs uppercase">
                <span className="bg-white px-3 text-slate-400 font-bold tracking-wider">Or</span>
              </div>
            </div>

            <div className="mt-6">
              <button
                type="button"
                onClick={handleGoogleSignIn}
                disabled={isGoogleLoading || isLoading}
                className="w-full flex justify-center items-center px-4 py-3 border border-slate-300 rounded-2xl shadow-sm bg-white text-sm font-bold text-slate-700 hover:bg-slate-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-emerald-500 transition-all duration-200"
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
                    <span>{t('auth.continueGoogle', 'Continue with Google')}</span>
                  </>
                )}
              </button>
            </div>
          </div>

          <div className="mt-6 text-center text-xs">
            <span className="text-slate-500">{t('auth.dontHaveAccount', "Don't have an account?")} </span>
            <Link to="/register" className="font-bold text-emerald-700 hover:text-emerald-800 underline">
              {t('auth.register', 'Create Account')}
            </Link>
          </div>
        </div>
      </div>

      {/* Role Selection Modal for New Google Sign-in Users */}
      {showRoleModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-fade-in">
          <div className="bg-white rounded-3xl shadow-2xl max-w-md w-full p-6 sm:p-8 border border-slate-100 space-y-6 animate-scale-up">
            <div className="text-center space-y-2">
              <div className="w-12 h-12 rounded-2xl bg-emerald-100 text-emerald-700 flex items-center justify-center mx-auto mb-3 font-bold text-xl">
                🌾
              </div>
              <h3 className="text-2xl font-black text-slate-900 font-heading">
                {t('auth.roleSelectModalTitle', 'Choose Your Account Role')}
              </h3>
              <p className="text-xs text-slate-500">
                {t('auth.roleSelectModalSub', 'Please select your role to finish signing up with Google:')}
              </p>
            </div>

            <div className="grid grid-cols-1 gap-3">
              <div
                onClick={() => setSelectedRole('farmer')}
                className={`p-4 rounded-2xl border-2 cursor-pointer transition-all ${
                  selectedRole === 'farmer'
                    ? 'border-emerald-600 bg-emerald-50/70 ring-2 ring-emerald-500/20'
                    : 'border-slate-200 hover:border-slate-300 bg-white'
                }`}
              >
                <div className="flex items-center space-x-3">
                  <span className="text-2xl">🌾</span>
                  <div>
                    <h4 className="font-bold text-slate-900 text-sm">
                      {t('auth.farmer', '🌾 Farmer (Sell Produce)')}
                    </h4>
                    <p className="text-xs text-slate-500 mt-0.5">
                      {t('auth.farmerDesc', 'List crops, receive fair pricing, and connect with direct buyers')}
                    </p>
                  </div>
                </div>
              </div>

              <div
                onClick={() => setSelectedRole('buyer')}
                className={`p-4 rounded-2xl border-2 cursor-pointer transition-all ${
                  selectedRole === 'buyer'
                    ? 'border-emerald-600 bg-emerald-50/70 ring-2 ring-emerald-500/20'
                    : 'border-slate-200 hover:border-slate-300 bg-white'
                }`}
              >
                <div className="flex items-center space-x-3">
                  <span className="text-2xl">🛒</span>
                  <div>
                    <h4 className="font-bold text-slate-900 text-sm">
                      {t('auth.buyer', '🛒 Buyer (Purchase Produce)')}
                    </h4>
                    <p className="text-xs text-slate-500 mt-0.5">
                      {t('auth.buyerDesc', 'Source fresh crops directly from farmers with transparent pricing')}
                    </p>
                  </div>
                </div>
              </div>
            </div>

            <div className="flex space-x-3 pt-2">
              <button
                type="button"
                onClick={() => setShowRoleModal(false)}
                className="btn-secondary w-1/3 text-xs justify-center py-3"
              >
                {t('common.cancel', 'Cancel')}
              </button>
              <button
                type="button"
                onClick={handleCompleteGoogleRegistration}
                disabled={isGoogleLoading}
                className="btn-primary w-2/3 text-xs justify-center py-3 font-bold"
              >
                {isGoogleLoading ? <LoadingSpinner size="small" color="white" /> : t('auth.confirmRole', 'Confirm & Complete Sign-Up')}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Login;
