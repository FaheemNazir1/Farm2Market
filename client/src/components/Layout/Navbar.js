import React, { useState } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import { useCart } from '../../contexts/CartContext';
import { 
  ShoppingCart, 
  User, 
  Menu, 
  X, 
  LogOut, 
  Package,
  ShoppingBag,
  UserCheck,
  BarChart3
} from 'lucide-react';

const Navbar = () => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isProfileMenuOpen, setIsProfileMenuOpen] = useState(false);
  const { user, logout, isAuthenticated, isFarmer, isBuyer } = useAuth();
  const { getCartItemsCount } = useCart();
  const navigate = useNavigate();
  const location = useLocation();

  const handleLogout = () => {
    logout();
    navigate('/');
    setIsProfileMenuOpen(false);
  };

  const isActive = (path) => {
    return location.pathname === path;
  };

  const cartItemsCount = getCartItemsCount();

  return (
    <nav className="bg-white shadow-sm border-b border-gray-200 sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          {/* Logo */}
          <Link to="/" className="flex items-center space-x-2">
            <div className="w-8 h-8 bg-green-400 rounded-lg flex items-center justify-center">
              <span className="text-white font-bold text-lg">F</span>
            </div>
            <span className="text-xl font-bold text-gray-900">Farm2Market</span>
          </Link>

          {/* Desktop Navigation */}
          <div className="hidden md:flex items-center space-x-8">
            <Link
              to="/"
              className={`text-sm font-medium transition-colors ${
                isActive('/') ? 'text-green-600' : 'text-gray-700 hover:text-green-600'
              }`}
            >
              Home
            </Link>
            <Link
              to="/marketplace"
              className={`text-sm font-medium transition-colors ${
                isActive('/marketplace') ? 'text-green-600' : 'text-gray-700 hover:text-green-600'
              }`}
            >
              Marketplace
            </Link>
            <Link
              to="/about"
              className={`text-sm font-medium transition-colors ${
                isActive('/about') ? 'text-green-600' : 'text-gray-700 hover:text-green-600'
              }`}
            >
              About
            </Link>
            <Link
              to="/contact"
              className={`text-sm font-medium transition-colors ${
                isActive('/contact') ? 'text-green-600' : 'text-gray-700 hover:text-green-600'
              }`}
            >
              Contact
            </Link>
          </div>

          {/* Right side */}
          <div className="flex items-center space-x-4">
            {/* Cart (for buyers) */}
            {isAuthenticated && isBuyer && (
              <Link
                to="/cart"
                className="relative p-2 text-gray-600 hover:text-primary-600 transition-colors"
              >
                <ShoppingCart className="w-6 h-6" />
                {cartItemsCount > 0 && (
                  <span className="absolute -top-1 -right-1 bg-green-400 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center">
                    {cartItemsCount}
                  </span>
                )}
              </Link>
            )}

            {/* Profile Menu */}
            {isAuthenticated ? (
              <div className="relative">
                <button
                  onClick={() => setIsProfileMenuOpen(!isProfileMenuOpen)}
                  className="flex items-center space-x-2 p-2 rounded-lg hover:bg-gray-100 transition-colors"
                >
                  <div className="w-8 h-8 bg-green-100 rounded-full flex items-center justify-center">
                    <User className="w-5 h-5 text-green-600" />
                  </div>
                  <span className="hidden md:block text-sm font-medium text-gray-700">
                    {user?.name}
                  </span>
                </button>

                {isProfileMenuOpen && (
                  <div className="absolute right-0 mt-2 w-48 bg-white rounded-lg shadow-lg border border-gray-200 py-1 z-50">
                    <Link
                      to="/dashboard"
                      className="flex items-center space-x-2 px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                      onClick={() => setIsProfileMenuOpen(false)}
                    >
                      <BarChart3 className="w-4 h-4" />
                      <span>Dashboard</span>
                    </Link>
                    <Link
                      to="/profile"
                      className="flex items-center space-x-2 px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                      onClick={() => setIsProfileMenuOpen(false)}
                    >
                      <UserCheck className="w-4 h-4" />
                      <span>Profile</span>
                    </Link>
                    <Link
                      to="/orders"
                      className="flex items-center space-x-2 px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                      onClick={() => setIsProfileMenuOpen(false)}
                    >
                      <Package className="w-4 h-4" />
                      <span>Orders</span>
                    </Link>
                    {isFarmer && (
                      <Link
                        to="/dashboard?tab=crops"
                        className="flex items-center space-x-2 px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                        onClick={() => setIsProfileMenuOpen(false)}
                      >
                        <ShoppingBag className="w-4 h-4" />
                        <span>My Crops</span>
                      </Link>
                    )}
                    <hr className="my-1" />
                    <button
                      onClick={handleLogout}
                      className="flex items-center space-x-2 px-4 py-2 text-sm text-red-600 hover:bg-red-50 w-full text-left"
                    >
                      <LogOut className="w-4 h-4" />
                      <span>Logout</span>
                    </button>
                  </div>
                )}
              </div>
            ) : (
              <div className="flex items-center space-x-2">
                <Link
                  to="/login"
                  className="text-sm font-medium text-gray-700 hover:text-primary-600 transition-colors"
                >
                  Login
                </Link>
                <Link
                  to="/register"
                  className="btn-primary text-sm"
                >
                  Sign Up
                </Link>
              </div>
            )}

            {/* Mobile menu button */}
            <button
              onClick={() => setIsMenuOpen(!isMenuOpen)}
              className="md:hidden p-2 text-gray-600 hover:text-primary-600 transition-colors"
            >
              {isMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </button>
          </div>
        </div>

        {/* Mobile Navigation */}
        {isMenuOpen && (
          <div className="md:hidden border-t border-gray-200 py-4">
            <div className="flex flex-col space-y-4">
              <Link
                to="/"
                className={`text-sm font-medium transition-colors ${
                  isActive('/') ? 'text-primary-600' : 'text-gray-700 hover:text-primary-600'
                }`}
                onClick={() => setIsMenuOpen(false)}
              >
                Home
              </Link>
              <Link
                to="/marketplace"
                className={`text-sm font-medium transition-colors ${
                  isActive('/marketplace') ? 'text-primary-600' : 'text-gray-700 hover:text-primary-600'
                }`}
                onClick={() => setIsMenuOpen(false)}
              >
                Marketplace
              </Link>
              <Link
                to="/about"
                className={`text-sm font-medium transition-colors ${
                  isActive('/about') ? 'text-primary-600' : 'text-gray-700 hover:text-primary-600'
                }`}
                onClick={() => setIsMenuOpen(false)}
              >
                About
              </Link>
              <Link
                to="/contact"
                className={`text-sm font-medium transition-colors ${
                  isActive('/contact') ? 'text-primary-600' : 'text-gray-700 hover:text-primary-600'
                }`}
                onClick={() => setIsMenuOpen(false)}
              >
                Contact
              </Link>
              
              {!isAuthenticated && (
                <>
                  <hr className="border-gray-200" />
                  <Link
                    to="/login"
                    className="text-sm font-medium text-gray-700 hover:text-primary-600 transition-colors"
                    onClick={() => setIsMenuOpen(false)}
                  >
                    Login
                  </Link>
                  <Link
                    to="/register"
                    className="btn-primary text-sm"
                    onClick={() => setIsMenuOpen(false)}
                  >
                    Sign Up
                  </Link>
                </>
              )}
            </div>
          </div>
        )}
      </div>

      {/* Click outside to close profile menu */}
      {isProfileMenuOpen && (
        <div
          className="fixed inset-0 z-40"
          onClick={() => setIsProfileMenuOpen(false)}
        />
      )}
    </nav>
  );
};

export default Navbar;
