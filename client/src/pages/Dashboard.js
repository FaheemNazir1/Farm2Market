import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { useQuery } from 'react-query';
import { usersAPI } from '../services/api';
import { useAuth } from '../contexts/AuthContext';
import { 
  BarChart3, 
  Package, 
  ShoppingBag, 
  TrendingUp, 
  Users, 
  DollarSign,
  Plus,
  Eye,
  Edit,
  Trash2,
  Star,
  Clock,
  CheckCircle,
  AlertCircle,
  Heart
} from 'lucide-react';
import LoadingSpinner from '../components/UI/LoadingSpinner';

const Dashboard = () => {
  const [activeTab, setActiveTab] = useState('overview');
  const { user, isFarmer, isBuyer } = useAuth();

  const { data: dashboardData, isLoading, error } = useQuery(
    'dashboard',
    usersAPI.getDashboard,
    {
      staleTime: 5 * 60 * 1000, // 5 minutes
    }
  );

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <LoadingSpinner size="large" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-gray-900 mb-4">Error loading dashboard</h2>
          <p className="text-gray-600">Please try again later</p>
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
    }).format(price);
  };

  const formatDate = (date) => {
    return new Date(date).toLocaleDateString('en-IN', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'delivered':
        return 'text-green-600 bg-green-100';
      case 'shipped':
        return 'text-blue-600 bg-blue-100';
      case 'processing':
        return 'text-yellow-600 bg-yellow-100';
      case 'confirmed':
        return 'text-purple-600 bg-purple-100';
      case 'pending':
        return 'text-gray-600 bg-gray-100';
      default:
        return 'text-gray-600 bg-gray-100';
    }
  };

  const getStatusIcon = (status) => {
    switch (status) {
      case 'delivered':
        return <CheckCircle className="w-4 h-4" />;
      case 'shipped':
        return <Package className="w-4 h-4" />;
      case 'processing':
        return <Clock className="w-4 h-4" />;
      case 'confirmed':
        return <CheckCircle className="w-4 h-4" />;
      case 'pending':
        return <AlertCircle className="w-4 h-4" />;
      default:
        return <AlertCircle className="w-4 h-4" />;
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-bold text-gray-900">
                Welcome back, {user?.name}!
              </h1>
              <p className="text-gray-600">
                {isFarmer ? 'Manage your crops and orders' : 'Track your orders and discover fresh produce'}
              </p>
            </div>
            <div className="flex space-x-3">
              {isFarmer && (
                <Link to="/crops/new" className="btn-primary flex items-center">
                  <Plus className="w-5 h-5 mr-2" />
                  Add Crop
                </Link>
              )}
              <Link to="/marketplace" className="btn-outline flex items-center">
                <ShoppingBag className="w-5 h-5 mr-2" />
                Browse Marketplace
              </Link>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          {isFarmer ? (
            <>
              <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
                <div className="flex items-center">
                  <div className="p-2 bg-primary-100 rounded-lg">
                    <Package className="w-6 h-6 text-primary-600" />
                  </div>
                  <div className="ml-4">
                    <p className="text-sm font-medium text-gray-600">Total Crops</p>
                    <p className="text-2xl font-bold text-gray-900">{stats.totalCrops || 0}</p>
                  </div>
                </div>
              </div>

              <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
                <div className="flex items-center">
                  <div className="p-2 bg-green-100 rounded-lg">
                    <CheckCircle className="w-6 h-6 text-green-600" />
                  </div>
                  <div className="ml-4">
                    <p className="text-sm font-medium text-gray-600">Active Crops</p>
                    <p className="text-2xl font-bold text-gray-900">{stats.activeCrops || 0}</p>
                  </div>
                </div>
              </div>

              <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
                <div className="flex items-center">
                  <div className="p-2 bg-blue-100 rounded-lg">
                    <BarChart3 className="w-6 h-6 text-blue-600" />
                  </div>
                  <div className="ml-4">
                    <p className="text-sm font-medium text-gray-600">Total Orders</p>
                    <p className="text-2xl font-bold text-gray-900">{stats.totalOrders || 0}</p>
                  </div>
                </div>
              </div>

              <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
                <div className="flex items-center">
                  <div className="p-2 bg-yellow-100 rounded-lg">
                    <DollarSign className="w-6 h-6 text-yellow-600" />
                  </div>
                  <div className="ml-4">
                    <p className="text-sm font-medium text-gray-600">Total Earnings</p>
                    <p className="text-2xl font-bold text-gray-900">{formatPrice(stats.totalEarnings || 0)}</p>
                  </div>
                </div>
              </div>
            </>
          ) : (
            <>
              <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
                <div className="flex items-center">
                  <div className="p-2 bg-primary-100 rounded-lg">
                    <ShoppingBag className="w-6 h-6 text-primary-600" />
                  </div>
                  <div className="ml-4">
                    <p className="text-sm font-medium text-gray-600">Total Orders</p>
                    <p className="text-2xl font-bold text-gray-900">{stats.totalOrders || 0}</p>
                  </div>
                </div>
              </div>

              <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
                <div className="flex items-center">
                  <div className="p-2 bg-blue-100 rounded-lg">
                    <Clock className="w-6 h-6 text-blue-600" />
                  </div>
                  <div className="ml-4">
                    <p className="text-sm font-medium text-gray-600">Pending Orders</p>
                    <p className="text-2xl font-bold text-gray-900">{stats.pendingOrders || 0}</p>
                  </div>
                </div>
              </div>

              <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
                <div className="flex items-center">
                  <div className="p-2 bg-green-100 rounded-lg">
                    <TrendingUp className="w-6 h-6 text-green-600" />
                  </div>
                  <div className="ml-4">
                    <p className="text-sm font-medium text-gray-600">Total Spent</p>
                    <p className="text-2xl font-bold text-gray-900">{formatPrice(stats.totalSpent || 0)}</p>
                  </div>
                </div>
              </div>

              <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
                <div className="flex items-center">
                  <div className="p-2 bg-purple-100 rounded-lg">
                    <Heart className="w-6 h-6 text-purple-600" />
                  </div>
                  <div className="ml-4">
                    <p className="text-sm font-medium text-gray-600">Favorites</p>
                    <p className="text-2xl font-bold text-gray-900">{dashboard?.favoriteCrops?.length || 0}</p>
                  </div>
                </div>
              </div>
            </>
          )}
        </div>

        {/* Tabs */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200">
          <div className="border-b border-gray-200">
            <nav className="-mb-px flex space-x-8 px-6">
              <button
                onClick={() => setActiveTab('overview')}
                className={`py-4 px-1 border-b-2 font-medium text-sm ${
                  activeTab === 'overview'
                    ? 'border-primary-500 text-primary-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                }`}
              >
                Overview
              </button>
              {isFarmer && (
                <button
                  onClick={() => setActiveTab('crops')}
                  className={`py-4 px-1 border-b-2 font-medium text-sm ${
                    activeTab === 'crops'
                      ? 'border-primary-500 text-primary-600'
                      : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                  }`}
                >
                  My Crops
                </button>
              )}
              <button
                onClick={() => setActiveTab('orders')}
                className={`py-4 px-1 border-b-2 font-medium text-sm ${
                  activeTab === 'orders'
                    ? 'border-primary-500 text-primary-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                }`}
              >
                Orders
              </button>
              {isBuyer && (
                <button
                  onClick={() => setActiveTab('favorites')}
                  className={`py-4 px-1 border-b-2 font-medium text-sm ${
                    activeTab === 'favorites'
                      ? 'border-primary-500 text-primary-600'
                      : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                  }`}
                >
                  Favorites
                </button>
              )}
            </nav>
          </div>

          <div className="p-6">
            {/* Overview Tab */}
            {activeTab === 'overview' && (
              <div className="space-y-6">
                <div>
                  <h3 className="text-lg font-semibold text-gray-900 mb-4">
                    Recent Activity
                  </h3>
                  <div className="space-y-4">
                    {dashboard?.recentOrders?.slice(0, 5).map((order) => (
                      <div key={order._id} className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                        <div className="flex items-center space-x-4">
                          <div className="w-10 h-10 bg-primary-100 rounded-full flex items-center justify-center">
                            <Package className="w-5 h-5 text-primary-600" />
                          </div>
                          <div>
                            <p className="font-medium text-gray-900">
                              Order #{order.orderNumber}
                            </p>
                            <p className="text-sm text-gray-600">
                              {isFarmer ? `Buyer: ${order.buyer?.name}` : `Farmer: ${order.farmer?.name}`}
                            </p>
                          </div>
                        </div>
                        <div className="text-right">
                          <div className="flex items-center space-x-2">
                            <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getStatusColor(order.status)}`}>
                              {getStatusIcon(order.status)}
                              <span className="ml-1 capitalize">{order.status}</span>
                            </span>
                          </div>
                          <p className="text-sm text-gray-600 mt-1">
                            {formatPrice(order.finalAmount)}
                          </p>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            )}

            {/* Crops Tab (Farmer only) */}
            {activeTab === 'crops' && isFarmer && (
              <div className="space-y-6">
                <div className="flex items-center justify-between">
                  <h3 className="text-lg font-semibold text-gray-900">
                    My Crops
                  </h3>
                  <Link to="/crops/new" className="btn-primary">
                    Add New Crop
                  </Link>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {dashboard?.recentCrops?.map((crop) => (
                    <div key={crop._id} className="bg-white border border-gray-200 rounded-lg p-4">
                      <div className="aspect-w-16 aspect-h-9 bg-gray-200 rounded-lg mb-4">
                        {crop.images && crop.images.length > 0 ? (
                          <img
                            src={crop.images[0].url}
                            alt={crop.name}
                            className="w-full h-32 object-cover rounded-lg"
                          />
                        ) : (
                          <div className="w-full h-32 bg-gray-200 rounded-lg flex items-center justify-center">
                            <span className="text-gray-400">No Image</span>
                          </div>
                        )}
                      </div>

                      <h4 className="font-semibold text-gray-900 mb-2">{crop.name}</h4>
                      <p className="text-sm text-gray-600 mb-2 line-clamp-2">{crop.description}</p>
                      
                      <div className="flex items-center justify-between mb-4">
                        <span className="text-lg font-bold text-primary-600">
                          {formatPrice(crop.price.perUnit)}
                        </span>
                        <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                          crop.availability.status === 'available' 
                            ? 'bg-green-100 text-green-800' 
                            : 'bg-gray-100 text-gray-800'
                        }`}>
                          {crop.availability.status}
                        </span>
                      </div>

                      <div className="flex space-x-2">
                        <Link
                          to={`/crop/${crop._id}`}
                          className="flex-1 btn-outline text-center text-sm py-2"
                        >
                          <Eye className="w-4 h-4 inline mr-1" />
                          View
                        </Link>
                        <Link
                          to={`/crops/${crop._id}/edit`}
                          className="flex-1 btn-primary text-center text-sm py-2"
                        >
                          <Edit className="w-4 h-4 inline mr-1" />
                          Edit
                        </Link>
                      </div>
                    </div>
                  ))}
                </div>

                {dashboard?.recentCrops?.length === 0 && (
                  <div className="text-center py-12">
                    <Package className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                    <h3 className="text-lg font-semibold text-gray-900 mb-2">No crops yet</h3>
                    <p className="text-gray-600 mb-4">Start by adding your first crop to the marketplace</p>
                    <Link to="/crops/new" className="btn-primary">
                      Add Your First Crop
                    </Link>
                  </div>
                )}
              </div>
            )}

            {/* Orders Tab */}
            {activeTab === 'orders' && (
              <div className="space-y-6">
                <h3 className="text-lg font-semibold text-gray-900">
                  Recent Orders
                </h3>

                <div className="space-y-4">
                  {dashboard?.recentOrders?.map((order) => (
                    <div key={order._id} className="bg-white border border-gray-200 rounded-lg p-6">
                      <div className="flex items-center justify-between mb-4">
                        <div>
                          <h4 className="font-semibold text-gray-900">
                            Order #{order.orderNumber}
                          </h4>
                          <p className="text-sm text-gray-600">
                            {formatDate(order.createdAt)}
                          </p>
                        </div>
                        <div className="text-right">
                          <div className="flex items-center space-x-2 mb-2">
                            <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getStatusColor(order.status)}`}>
                              {getStatusIcon(order.status)}
                              <span className="ml-1 capitalize">{order.status}</span>
                            </span>
                          </div>
                          <p className="text-lg font-bold text-gray-900">
                            {formatPrice(order.finalAmount)}
                          </p>
                        </div>
                      </div>

                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                          <p className="text-sm font-medium text-gray-700">
                            {isFarmer ? 'Buyer:' : 'Farmer:'}
                          </p>
                          <p className="text-sm text-gray-900">
                            {isFarmer ? order.buyer?.name : order.farmer?.name}
                          </p>
                        </div>
                        <div>
                          <p className="text-sm font-medium text-gray-700">Items:</p>
                          <p className="text-sm text-gray-900">
                            {order.items?.length} item{order.items?.length !== 1 ? 's' : ''}
                          </p>
                        </div>
                      </div>

                      <div className="mt-4 flex space-x-2">
                        <Link
                          to={`/orders/${order._id}`}
                          className="btn-outline text-sm py-2"
                        >
                          View Details
                        </Link>
                        {order.status === 'delivered' && (
                          <button className="btn-secondary text-sm py-2">
                            <Star className="w-4 h-4 inline mr-1" />
                            Rate & Review
                          </button>
                        )}
                      </div>
                    </div>
                  ))}
                </div>

                {dashboard?.recentOrders?.length === 0 && (
                  <div className="text-center py-12">
                    <ShoppingBag className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                    <h3 className="text-lg font-semibold text-gray-900 mb-2">No orders yet</h3>
                    <p className="text-gray-600 mb-4">
                      {isFarmer ? 'Your orders will appear here when customers buy your crops' : 'Your orders will appear here once you make a purchase'}
                    </p>
                    <Link to="/marketplace" className="btn-primary">
                      {isFarmer ? 'Add Crops' : 'Browse Marketplace'}
                    </Link>
                  </div>
                )}
              </div>
            )}

            {/* Favorites Tab (Buyer only) */}
            {activeTab === 'favorites' && isBuyer && (
              <div className="space-y-6">
                <h3 className="text-lg font-semibold text-gray-900">
                  Favorite Crops
                </h3>

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {dashboard?.favoriteCrops?.map((crop) => (
                    <div key={crop._id} className="bg-white border border-gray-200 rounded-lg p-4">
                      <div className="aspect-w-16 aspect-h-9 bg-gray-200 rounded-lg mb-4">
                        {crop.images && crop.images.length > 0 ? (
                          <img
                            src={crop.images[0].url}
                            alt={crop.name}
                            className="w-full h-32 object-cover rounded-lg"
                          />
                        ) : (
                          <div className="w-full h-32 bg-gray-200 rounded-lg flex items-center justify-center">
                            <span className="text-gray-400">No Image</span>
                          </div>
                        )}
                      </div>

                      <h4 className="font-semibold text-gray-900 mb-2">{crop.name}</h4>
                      <p className="text-sm text-gray-600 mb-2 line-clamp-2">{crop.description}</p>
                      
                      <div className="flex items-center justify-between mb-4">
                        <span className="text-lg font-bold text-primary-600">
                          {formatPrice(crop.price.perUnit)}
                        </span>
                        <div className="flex items-center space-x-1">
                          <Star className="w-4 h-4 text-yellow-400 fill-current" />
                          <span className="text-sm text-gray-600">
                            {crop.farmer.rating?.average?.toFixed(1) || 'New'}
                          </span>
                        </div>
                      </div>

                      <div className="flex space-x-2">
                        <Link
                          to={`/crop/${crop._id}`}
                          className="flex-1 btn-outline text-center text-sm py-2"
                        >
                          View Details
                        </Link>
                        <button className="flex-1 btn-primary text-center text-sm py-2">
                          Add to Cart
                        </button>
                      </div>
                    </div>
                  ))}
                </div>

                {dashboard?.favoriteCrops?.length === 0 && (
                  <div className="text-center py-12">
                    <Heart className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                    <h3 className="text-lg font-semibold text-gray-900 mb-2">No favorites yet</h3>
                    <p className="text-gray-600 mb-4">Start browsing and add crops to your favorites</p>
                    <Link to="/marketplace" className="btn-primary">
                      Browse Marketplace
                    </Link>
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
