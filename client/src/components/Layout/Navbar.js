import React, { useState } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import { useCart } from '../../contexts/CartContext';
import LanguageSwitcher from '../LanguageSwitcher';
import { 
  ShoppingCart, 
  Menu, 
  X, 
  LogOut, 
  Package,
  UserCheck,
  BarChart3,
  Sprout,
  PlusCircle,
  Sparkles
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
    setIsMenuOpen(false);
  };

  const isActive = (path) => {
    return location.pathname === path;
  };

  const cartItemsCount = getCartItemsCount();

  const navLinks = [
    { name: 'Home', path: '/' },
    { name: 'Marketplace', path: '/marketplace' },
    { name: 'About', path: '/about' },
    { name: 'Contact', path: '/contact' },
  ];

  return (
    <nav className="sticky top-0 z-50 backdrop-blur-xl bg-white/90 border-b border-slate-200/80 shadow-[0_4px_20px_-4px_rgba(0,0,0,0.05)] transition-all duration-300">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-20">
          
          {/* Logo */}
          <Link to="/" className="flex items-center space-x-3 group">
            <div className="w-11 h-11 rounded-2xl bg-gradient-to-br from-emerald-500 to-teal-700 flex items-center justify-center shadow-md shadow-emerald-500/20 group-hover:scale-105 transition-transform duration-300">
              <Sprout className="w-6 h-6 text-white transform group-hover:rotate-12 transition-transform duration-300" />
            </div>
            <div>
              <div className="flex items-center space-x-1.5">
                <span className="text-2xl font-black tracking-tight text-slate-900 font-heading">
                  Farm<span className="text-emerald-600">2</span>Market
                </span>
                <span className="hidden sm:inline-block px-2 py-0.5 text-[10px] font-extrabold uppercase tracking-wider text-emerald-800 bg-emerald-100/80 rounded-full border border-emerald-300/60">
                  SIH '25
                </span>
              </div>
              <p className="text-[11px] text-slate-500 font-medium hidden sm:block">Direct Farmer-to-Buyer</p>
            </div>
          </Link>

          {/* Desktop Navigation Links */}
          <div className="hidden md:flex items-center space-x-1 lg:space-x-2 bg-slate-100/70 p-1.5 rounded-2xl border border-slate-200/60">
            {navLinks.map((link) => {
              const active = isActive(link.path);
              return (
                <Link
                  key={link.path}
                  to={link.path}
                  className={`px-4 py-2 rounded-xl text-sm font-semibold transition-all duration-200 ${
                    active
                      ? 'bg-white text-emerald-700 shadow-sm'
                      : 'text-slate-600 hover:text-slate-900 hover:bg-white/60'
                  }`}
                >
                  {link.name}
                </Link>
              );
            })}
          </div>

          {/* Right Side Actions */}
          <div className="flex items-center space-x-3 sm:space-x-4">
            {/* Language Switcher */}
            <div className="hidden sm:block">
              <LanguageSwitcher />
            </div>

            {/* Farmer Quick Action: Add Crop */}
            {isAuthenticated && isFarmer && (
              <Link
                to="/crops/new"
                className="hidden lg:inline-flex items-center space-x-1.5 px-3.5 py-2 rounded-xl text-xs font-bold text-emerald-800 bg-emerald-50 hover:bg-emerald-100 border border-emerald-300/80 transition-all duration-200 shadow-sm"
              >
                <PlusCircle className="w-4 h-4 text-emerald-600" />
                <span>List Produce</span>
              </Link>
            )}

            {/* Shopping Cart (Buyers) */}
            {isAuthenticated && isBuyer && (
              <Link
                to="/cart"
                className="relative p-2.5 rounded-xl bg-slate-100/80 hover:bg-emerald-50 text-slate-700 hover:text-emerald-700 transition-all duration-200"
                aria-label="View shopping cart"
              >
                <ShoppingCart className="w-5 h-5" />
                {cartItemsCount > 0 && (
                  <span className="absolute -top-1.5 -right-1.5 bg-gradient-to-r from-emerald-500 to-teal-600 text-white text-[11px] font-black rounded-full w-5 h-5 flex items-center justify-center shadow-sm animate-bounce-slow">
                    {cartItemsCount}
                  </span>
                )}
              </Link>
            )}

            {/* Auth Buttons or Profile Dropdown */}
            {isAuthenticated ? (
              <div className="relative">
                <button
                  onClick={() => setIsProfileMenuOpen(!isProfileMenuOpen)}
                  className="flex items-center space-x-2 p-1.5 sm:px-3 sm:py-2 rounded-xl bg-slate-100/80 hover:bg-slate-200/80 border border-slate-200/60 transition-all duration-200"
                >
                  <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-emerald-600 to-teal-700 text-white flex items-center justify-center font-bold text-sm shadow-sm">
                    {user?.name?.charAt(0) || 'U'}
                  </div>
                  <div className="hidden lg:block text-left">
                    <p className="text-xs font-bold text-slate-800 leading-tight truncate max-w-[100px]">{user?.name}</p>
                    <span className="text-[10px] uppercase tracking-wider font-semibold text-emerald-700">
                      {user?.userType || 'User'}
                    </span>
                  </div>
                </button>

                {isProfileMenuOpen && (
                  <div className="absolute right-0 mt-3 w-56 bg-white rounded-2xl shadow-xl border border-slate-100 py-2 z-50 animate-fade-in divide-y divide-slate-100">
                    <div className="px-4 py-3">
                      <p className="text-sm font-bold text-slate-900">{user?.name}</p>
                      <p className="text-xs text-slate-500 truncate">{user?.email}</p>
                      <div className="mt-2 inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider bg-emerald-100 text-emerald-800">
                        {user?.userType === 'farmer' ? '🌾 Farmer' : user?.userType === 'buyer' ? '🛒 Buyer' : '🛡️ Admin'}
                      </div>
                    </div>

                    <div className="py-1">
                      <Link
                        to="/dashboard"
                        className="flex items-center space-x-2.5 px-4 py-2.5 text-sm font-medium text-slate-700 hover:bg-emerald-50 hover:text-emerald-700 transition-colors"
                        onClick={() => setIsProfileMenuOpen(false)}
                      >
                        <BarChart3 className="w-4 h-4 text-emerald-600" />
                        <span>Dashboard</span>
                      </Link>
                      <Link
                        to="/profile"
                        className="flex items-center space-x-2.5 px-4 py-2.5 text-sm font-medium text-slate-700 hover:bg-emerald-50 hover:text-emerald-700 transition-colors"
                        onClick={() => setIsProfileMenuOpen(false)}
                      >
                        <UserCheck className="w-4 h-4 text-emerald-600" />
                        <span>Profile Settings</span>
                      </Link>
                      <Link
                        to="/orders"
                        className="flex items-center space-x-2.5 px-4 py-2.5 text-sm font-medium text-slate-700 hover:bg-emerald-50 hover:text-emerald-700 transition-colors"
                        onClick={() => setIsProfileMenuOpen(false)}
                      >
                        <Package className="w-4 h-4 text-emerald-600" />
                        <span>My Orders</span>
                      </Link>
                      {isFarmer && (
                        <Link
                          to="/crops/new"
                          className="flex items-center space-x-2.5 px-4 py-2.5 text-sm font-medium text-emerald-700 hover:bg-emerald-50 transition-colors"
                          onClick={() => setIsProfileMenuOpen(false)}
                        >
                          <PlusCircle className="w-4 h-4 text-emerald-600" />
                          <span>Add New Crop</span>
                        </Link>
                      )}
                    </div>

                    <div className="py-1">
                      <button
                        onClick={handleLogout}
                        className="flex items-center space-x-2.5 px-4 py-2.5 text-sm font-semibold text-rose-600 hover:bg-rose-50 w-full text-left transition-colors"
                      >
                        <LogOut className="w-4 h-4 text-rose-500" />
                        <span>Log Out</span>
                      </button>
                    </div>
                  </div>
                )}
              </div>
            ) : (
              <div className="flex items-center space-x-2">
                <Link
                  to="/login"
                  className="btn-ghost text-sm hidden sm:inline-flex"
                >
                  Log In
                </Link>
                <Link
                  to="/register"
                  className="btn-primary text-xs sm:text-sm py-2 px-4 sm:px-5"
                >
                  <Sparkles className="w-3.5 h-3.5 mr-1.5" />
                  Get Started
                </Link>
              </div>
            )}

            {/* Mobile Menu Button */}
            <button
              onClick={() => setIsMenuOpen(!isMenuOpen)}
              className="md:hidden p-2.5 rounded-xl bg-slate-100 text-slate-700 hover:bg-slate-200 transition-colors"
              aria-label="Toggle navigation menu"
            >
              {isMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
            </button>
          </div>
        </div>

        {/* Mobile Navigation Drawer */}
        {isMenuOpen && (
          <div className="md:hidden border-t border-slate-100 py-4 px-2 bg-white/95 backdrop-blur-lg rounded-b-2xl shadow-xl animate-slide-up space-y-3">
            <div className="flex flex-col space-y-1">
              {navLinks.map((link) => (
                <Link
                  key={link.path}
                  to={link.path}
                  className={`px-4 py-2.5 rounded-xl text-sm font-semibold transition-colors ${
                    isActive(link.path)
                      ? 'bg-emerald-50 text-emerald-700'
                      : 'text-slate-700 hover:bg-slate-50'
                  }`}
                  onClick={() => setIsMenuOpen(false)}
                >
                  {link.name}
                </Link>
              ))}
            </div>

            <div className="pt-2 border-t border-slate-100 flex items-center justify-between px-3">
              <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Language</span>
              <LanguageSwitcher />
            </div>

            {!isAuthenticated && (
              <div className="pt-3 border-t border-slate-100 grid grid-cols-2 gap-2">
                <Link
                  to="/login"
                  className="btn-secondary text-sm py-2.5 justify-center"
                  onClick={() => setIsMenuOpen(false)}
                >
                  Log In
                </Link>
                <Link
                  to="/register"
                  className="btn-primary text-sm py-2.5 justify-center"
                  onClick={() => setIsMenuOpen(false)}
                >
                  Sign Up
                </Link>
              </div>
            )}
          </div>
        )}
      </div>

      {/* Click outside to close profile dropdown */}
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
