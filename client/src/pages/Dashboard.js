import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { useQuery } from 'react-query';
import { useTranslation } from 'react-i18next';
import { usersAPI } from '../services/api';
import { useAuth } from '../contexts/AuthContext';
import { 
  BarChart3, 
  Package, 
  ShoppingBag, 
  DollarSign,
  Plus,
  CheckCircle
} from 'lucide-react';
import LoadingSpinner from '../components/UI/LoadingSpinner';

const Dashboard = () => {
  const { t } = useTranslation();
  const [activeTab, setActiveTab] = useState('overview');
  const { user, isFarmer } = useAuth();

  const { data: dashboardData, isLoading, error } = useQuery(
    'dashboard',
    usersAPI.getDashboard,
    {
      staleTime: 5 * 60 * 1000,
    }
  );

  if (isLoading) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center">
        <LoadingSpinner size="large" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center">
        <div className="card text-center p-8 max-w-md shadow-lg">
          <h2 className="text-xl font-bold text-slate-900 mb-2">{t('common.error', 'Error')}</h2>
          <p className="text-slate-600 mb-4">Failed to load dashboard data. Please try again.</p>
        </div>
      </div>
    );
  }

  const dashboard = dashboardData?.dashboard;
  const stats = dashboard?.stats || {};

  const formatPrice = (price) => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      maximumFractionDigits: 0
    }).format(price || 0);
  };

  return (
    <div className="min-h-screen bg-slate-50/70 pb-20">
      
      {/* Top Header */}
      <div className="bg-white border-b border-slate-200/80 sticky top-20 z-30">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-5">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <div>
              <h1 className="text-2xl sm:text-3xl font-black text-slate-900 font-heading">
                {t('dashboard.welcome', 'Welcome back')}, {user?.name}!
              </h1>
              <p className="text-xs sm:text-sm text-slate-500 mt-1">
                {isFarmer
                  ? t('dashboard.farmerSubtitle', 'Manage your active produce listings, incoming orders, and earnings')
                  : t('dashboard.buyerSubtitle', 'Track your active crop purchases, favorites, and deliveries')}
              </p>
            </div>

            <div className="flex items-center space-x-3">
              {isFarmer && (
                <Link to="/crops/new" className="btn-primary text-xs py-2.5 px-4 font-bold flex items-center">
                  <Plus className="w-4 h-4 mr-1.5" />
                  <span>{t('dashboard.addCropCTA', 'Add New Produce')}</span>
                </Link>
              )}
              <Link to="/marketplace" className="btn-secondary text-xs py-2.5 px-4 font-bold flex items-center">
                <ShoppingBag className="w-4 h-4 mr-1.5 text-emerald-600" />
                <span>{t('nav.marketplace', 'Marketplace')}</span>
              </Link>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-8 space-y-8">
        
        {/* Metric Cards Grid */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
          {isFarmer ? (
            <>
              <div className="card p-5 bg-white border border-slate-200/80 shadow-sm space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-slate-500 uppercase">{t('dashboard.totalCrops', 'Total Listed Crops')}</span>
                  <Package className="w-5 h-5 text-emerald-600" />
                </div>
                <p className="text-2xl sm:text-3xl font-black text-slate-900 font-heading">{stats.totalCrops || 0}</p>
              </div>

              <div className="card p-5 bg-white border border-slate-200/80 shadow-sm space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-slate-500 uppercase">{t('dashboard.activeCrops', 'Active in Market')}</span>
                  <CheckCircle className="w-5 h-5 text-emerald-600" />
                </div>
                <p className="text-2xl sm:text-3xl font-black text-emerald-700 font-heading">{stats.activeCrops || 0}</p>
              </div>

              <div className="card p-5 bg-white border border-slate-200/80 shadow-sm space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-slate-500 uppercase">{t('dashboard.totalOrders', 'Total Orders')}</span>
                  <BarChart3 className="w-5 h-5 text-sky-600" />
                </div>
                <p className="text-2xl sm:text-3xl font-black text-slate-900 font-heading">{stats.totalOrders || 0}</p>
              </div>

              <div className="card p-5 bg-white border border-slate-200/80 shadow-sm space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-slate-500 uppercase">{t('dashboard.totalEarnings', 'Total Revenue')}</span>
                  <DollarSign className="w-5 h-5 text-amber-600" />
                </div>
                <p className="text-2xl sm:text-3xl font-black text-slate-900 font-heading">{formatPrice(stats.totalEarnings || 0)}</p>
              </div>
            </>
          ) : (
            <>
              <div className="card p-5 bg-white border border-slate-200/80 shadow-sm space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-slate-500 uppercase">{t('dashboard.totalOrders', 'Total Orders')}</span>
                  <ShoppingBag className="w-5 h-5 text-emerald-600" />
                </div>
                <p className="text-2xl sm:text-3xl font-black text-slate-900 font-heading">{stats.totalOrders || 0}</p>
              </div>

              <div className="card p-5 bg-white border border-slate-200/80 shadow-sm space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-slate-500 uppercase">{t('dashboard.totalSpent', 'Total Purchases')}</span>
                  <DollarSign className="w-5 h-5 text-emerald-600" />
                </div>
                <p className="text-2xl sm:text-3xl font-black text-slate-900 font-heading">{formatPrice(stats.totalSpent || 0)}</p>
              </div>
            </>
          )}
        </div>

        {/* Tab Selection */}
        <div className="flex space-x-2 border-b border-slate-200 pb-2">
          <button
            onClick={() => setActiveTab('overview')}
            className={`px-4 py-2 rounded-xl text-xs font-bold transition-all ${
              activeTab === 'overview'
                ? 'bg-emerald-700 text-white shadow-sm'
                : 'text-slate-600 hover:bg-slate-100'
            }`}
          >
            {t('dashboard.welcome', 'Overview')}
          </button>
          
          {isFarmer && (
            <button
              onClick={() => setActiveTab('crops')}
              className={`px-4 py-2 rounded-xl text-xs font-bold transition-all ${
                activeTab === 'crops'
                  ? 'bg-emerald-700 text-white shadow-sm'
                  : 'text-slate-600 hover:bg-slate-100'
              }`}
            >
              {t('dashboard.myCrops', 'My Crop Listings')}
            </button>
          )}

          <button
            onClick={() => setActiveTab('orders')}
            className={`px-4 py-2 rounded-xl text-xs font-bold transition-all ${
              activeTab === 'orders'
                ? 'bg-emerald-700 text-white shadow-sm'
                : 'text-slate-600 hover:bg-slate-100'
            }`}
          >
            {t('dashboard.orders', 'Order History')}
          </button>
        </div>

        {/* Crops List (Farmer View) */}
        {isFarmer && (activeTab === 'overview' || activeTab === 'crops') && (
          <div className="card p-6 bg-white border border-slate-200/80 shadow-md space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="text-lg font-bold text-slate-900 font-heading">{t('dashboard.myCrops', 'My Crop Listings')}</h3>
              <Link to="/crops/new" className="text-xs font-bold text-emerald-700 hover:text-emerald-800">
                + {t('dashboard.addCropCTA', 'Add New Produce')}
              </Link>
            </div>

            {dashboard?.crops?.length === 0 ? (
              <p className="text-xs text-slate-500 py-4">No produce listed yet.</p>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs">
                  <thead className="bg-slate-50 border-b border-slate-200 text-slate-500 font-bold uppercase">
                    <tr>
                      <th className="p-3">Produce</th>
                      <th className="p-3">Category</th>
                      <th className="p-3">Price</th>
                      <th className="p-3">Stock</th>
                      <th className="p-3">Status</th>
                      <th className="p-3 text-right">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100 font-medium">
                    {dashboard?.crops?.map((crop) => (
                      <tr key={crop._id} className="hover:bg-slate-50">
                        <td className="p-3 font-bold text-slate-900">{crop.name}</td>
                        <td className="p-3 text-slate-600">{crop.category}</td>
                        <td className="p-3 text-emerald-700 font-bold">{formatPrice(crop.price?.perUnit)}/{crop.quantity?.unit}</td>
                        <td className="p-3">{crop.quantity?.value} {crop.quantity?.unit}</td>
                        <td className="p-3">
                          <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${crop.status === 'available' ? 'bg-emerald-100 text-emerald-800' : 'bg-slate-100 text-slate-600'}`}>
                            {crop.status === 'available' ? t('dashboard.statusAvailable', 'Active') : t('dashboard.statusSold', 'Sold Out')}
                          </span>
                        </td>
                        <td className="p-3 text-right">
                          <Link to={`/crop/${crop._id}`} className="text-emerald-700 hover:text-emerald-900 font-bold">
                            {t('dashboard.viewDetails', 'View')}
                          </Link>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        )}

      </div>
    </div>
  );
};

export default Dashboard;
