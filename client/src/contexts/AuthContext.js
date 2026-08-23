import React, { createContext, useContext, useState, useEffect } from 'react';
import { authAPI } from '../services/api';
import toast from 'react-hot-toast';

import { auth, googleProvider, signInWithPopup } from '../firebase';

const AuthContext = createContext();

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [token, setToken] = useState(localStorage.getItem('token'));

  useEffect(() => {
    if (token) {
      getUserProfile();
    } else {
      setLoading(false);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [token]);

  const getUserProfile = async () => {
    try {
      const response = await authAPI.getProfile();
      if (response.success) {
        setUser(response.user);
      } else {
        logout();
      }
    } catch (error) {
      console.error('Get profile error:', error);
      logout();
    } finally {
      setLoading(false);
    }
  };

  const login = async (email, password) => {
    try {
      setLoading(true);
      const response = await authAPI.login(email, password);
      
      if (response.success) {
        setToken(response.token);
        setUser(response.user);
        localStorage.setItem('token', response.token);
        toast.success('Login successful!');
        return { success: true };
      } else {
        toast.error(response.message || 'Login failed');
        return { success: false, message: response.message };
      }
    } catch (error) {
      console.error('Login error:', error);
      toast.error('Login failed. Please try again.');
      return { success: false, message: 'Login failed' };
    } finally {
      setLoading(false);
    }
  };

  const loginWithGoogle = async (userType = null, existingIdToken = null) => {
    let idToken = existingIdToken;
    try {
      setLoading(true);
      // 1. If no existing ID token provided, open Firebase Google popup sign-in
      if (!idToken) {
        const result = await signInWithPopup(auth, googleProvider);
        idToken = await result.user.getIdToken();
      }
      
      // 2. Send token securely to Farm2Market backend
      const response = await authAPI.googleLogin(idToken, userType);
      
      if (response.success && response.token) {
        setToken(response.token);
        setUser(response.user);
        localStorage.setItem('token', response.token);
        toast.success(response.message || 'Signed in with Google!');
        return { success: true, user: response.user };
      } else {
        return { 
          success: false, 
          requiresRoleSelection: response.requiresRoleSelection || false, 
          idToken,
          message: response.message 
        };
      }
    } catch (error) {
      console.error('Google sign-in error:', error);
      if (error.code === 'auth/popup-closed-by-user' || error.code === 'auth/cancelled-popup-request') {
        toast('Google sign-in was cancelled', { icon: 'ℹ️' });
        return { success: false, cancelled: true };
      }
      if (error.code === 'auth/popup-blocked') {
        toast.error('The sign-in popup was blocked by your browser. Please allow popups for this site.');
        return { success: false, message: 'Popup blocked' };
      }
      if (error.code === 'auth/unauthorized-domain') {
        toast.error('Domain not authorized! Add "localhost" in Firebase Console -> Authentication -> Settings -> Authorized Domains.', { duration: 6000 });
        return { success: false, message: 'Unauthorized domain' };
      }
      if (error.code === 'auth/operation-not-allowed') {
        toast.error('Google provider is disabled in Firebase Console -> Authentication -> Sign-in method.', { duration: 6000 });
        return { success: false, message: 'Google provider disabled' };
      }
      if (error.code === 'auth/configuration-not-found' || error.code === 'auth/invalid-api-key') {
        toast.error('Firebase configuration is missing or invalid in client/.env');
        return { success: false, message: 'Firebase configuration error' };
      }

      const requiresRole = error.response?.data?.requiresRoleSelection;
      if (requiresRole) {
        return {
          success: false,
          requiresRoleSelection: true,
          idToken,
          message: error.response?.data?.message
        };
      }

      const errorMessage = error.response?.data?.message || error.message || 'Google sign-in failed';
      toast.error(errorMessage);
      return { 
        success: false, 
        requiresRoleSelection: false,
        message: errorMessage 
      };
    } finally {
      setLoading(false);
    }
  };

  const register = async (userData) => {
    try {
      setLoading(true);
      console.log('Registration attempt with data:', userData);
      const response = await authAPI.register(userData);
      console.log('Registration response:', response);
      
      if (response.success) {
        setToken(response.token);
        setUser(response.user);
        localStorage.setItem('token', response.token);
        toast.success('Registration successful!');
        return { success: true };
      } else {
        console.error('Registration failed:', response);
        toast.error(response.message || 'Registration failed');
        return { success: false, message: response.message };
      }
    } catch (error) {
      console.error('Registration error:', error);
      console.error('Registration error details:', {
        message: error.message,
        response: error.response?.data,
        status: error.response?.status
      });
      const errorMessage = error.response?.data?.message || error.message || 'Registration failed';
      toast.error(errorMessage);
      return { success: false, message: errorMessage };
    } finally {
      setLoading(false);
    }
  };

  const logout = () => {
    setToken(null);
    setUser(null);
    localStorage.removeItem('token');
    toast.success('Logged out successfully');
  };

  const updateProfile = async (profileData) => {
    try {
      const response = await authAPI.updateProfile(profileData);
      
      if (response.success) {
        setUser(response.user);
        toast.success('Profile updated successfully!');
        return { success: true };
      } else {
        toast.error(response.message || 'Profile update failed');
        return { success: false, message: response.message };
      }
    } catch (error) {
      console.error('Update profile error:', error);
      toast.error('Profile update failed. Please try again.');
      return { success: false, message: 'Profile update failed' };
    }
  };

  const changePassword = async (currentPassword, newPassword) => {
    try {
      const response = await authAPI.changePassword(currentPassword, newPassword);
      
      if (response.success) {
        toast.success('Password changed successfully!');
        return { success: true };
      } else {
        toast.error(response.message || 'Password change failed');
        return { success: false, message: response.message };
      }
    } catch (error) {
      console.error('Change password error:', error);
      toast.error('Password change failed. Please try again.');
      return { success: false, message: 'Password change failed' };
    }
  };

  const value = {
    user,
    token,
    loading,
    login,
    loginWithGoogle,
    register,
    logout,
    updateProfile,
    changePassword,
    isAuthenticated: !!user,
    isFarmer: user?.userType === 'farmer',
    isBuyer: user?.userType === 'buyer',
    canBuy: !!user && (user?.userType === 'buyer' || user?.userType === 'farmer'),
    canSell: !!user && user?.userType === 'farmer',
    isAdmin: user?.userType === 'admin'
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};
