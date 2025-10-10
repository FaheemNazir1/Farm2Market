import React from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import LoadingSpinner from './UI/LoadingSpinner';

const ProtectedRoute = ({ children, requiredUserType = null }) => {
  const { user, loading, isAuthenticated } = useAuth();
  const location = useLocation();

  if (loading) {
    return <LoadingSpinner />;
  }

  if (!isAuthenticated) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  if (requiredUserType && user?.userType !== requiredUserType) {
    return <Navigate to="/" replace />;
  }

  return children;
};

export default ProtectedRoute;
