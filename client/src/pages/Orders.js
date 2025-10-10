import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { useQuery } from 'react-query';
import { ordersAPI } from '../services/api';
import { useAuth } from '../contexts/AuthContext';
import { 
  Package, 
  Eye, 
  Star, 
  Filter,
  Search,
  Clock,
  CheckCircle,
  AlertCircle,
  Truck,
  X
} from 'lucide-react';
import LoadingSpinner from '../components/UI/LoadingSpinner';

const Orders = () => {
  const [filters, setFilters] = useState({
    status: '',
    search: ''
  });
  const [page, setPage] = useState(1);

  const { user, isFarmer, isBuyer } = useAuth();

  const { data: ordersData, isLoading, error } = useQuery(
    ['orders', filters, page],
    () => ordersAPI.getOrders({ ...filters, page }),
    {
      keepPreviousData: true,
      staleTime: 2 * 60 * 1000, // 2 minutes
    }
  );

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
      case 'cancelled':
        return 'text-red-600 bg-red-100';
      default:
        return 'text-gray-600 bg-gray-100';
    }
  };

  const getStatusIcon = (status) => {
    switch (status) {
      case 'delivered':
        return <CheckCircle className="w-4 h-4" />;
      case 'shipped':
        return <Truck className="w-4 h-4" />;
      case 'processing':
        return <Package className="w-4 h-4" />;
      case 'confirmed':
        return <CheckCircle className="w-4 h-4" />;
      case 'pending':
        return <Clock className="w-4 h-4" />;
      case 'cancelled':
        return <X className="w-4 h-4" />;
      default:
        return <AlertCircle className="w-4 h-4" />;
    }
  };

  const handleFilterChange = (key, value) => {
    setFilters(prev => ({ ...prev, [key]: value }));
    setPage(1);
  };

  const clearFilters = () => {
    setFilters({ status: '', search: '' });
    setPage(1);
  };

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
          <h2 className="text-2xl font-bold text-gray-900 mb-4">Error loading orders</h2>
          <p className="text-gray-600">Please try again later</p>
        </div>
      </div>
    );
  }

  const orders = ordersData?.orders || [];
  const pagination = ordersData?.pagination;

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-bold text-gray-900">Orders</h1>
              <p className="text-gray-600">
                {isFarmer ? 'Manage your crop orders' : 'Track your purchases'}
              </p>
            </div>
            <Link to="/marketplace" className="btn-primary">
              {isFarmer ? 'Add Crops' : 'Browse Marketplace'}
            </Link>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Filters */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 mb-6">
          <div className="flex flex-col md:flex-row gap-4">
            <div className="flex-1">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
                <input
                  type="text"
                  placeholder="Search orders..."
                  value={filters.search}
                  onChange={(e) => handleFilterChange('search', e.target.value)}
                  className="input-field pl-10"
                />
              </div>
            </div>
            <div className="flex space-x-3">
              <select
                value={filters.status}
                onChange={(e) => handleFilterChange('status', e.target.value)}
                className="input-field"
              >
                <option value="">All Status</option>
                <option value="pending">Pending</option>
                <option value="confirmed">Confirmed</option>
                <option value="processing">Processing</option>
                <option value="shipped">Shipped</option>
                <option value="delivered">Delivered</option>
                <option value="cancelled">Cancelled</option>
              </select>
              {(filters.status || filters.search) && (
                <button
                  onClick={clearFilters}
                  className="btn-outline flex items-center"
                >
                  <Filter className="w-4 h-4 mr-2" />
                  Clear
                </button>
              )}
            </div>
          </div>
        </div>

        {/* Orders List */}
        {orders.length > 0 ? (
          <div className="space-y-6">
            {orders.map((order) => (
              <div key={order._id} className="bg-white rounded-lg shadow-sm border border-gray-200">
                {/* Order Header */}
                <div className="p-6 border-b border-gray-200">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-4">
                      <div className="w-12 h-12 bg-primary-100 rounded-lg flex items-center justify-center">
                        <Package className="w-6 h-6 text-primary-600" />
                      </div>
                      <div>
                        <h3 className="text-lg font-semibold text-gray-900">
                          Order #{order.orderNumber}
                        </h3>
                        <p className="text-sm text-gray-600">
                          Placed on {formatDate(order.createdAt)}
                        </p>
                      </div>
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
                </div>

                {/* Order Items */}
                <div className="p-6">
                  <div className="space-y-4">
                    {order.items.map((item, index) => (
                      <div key={index} className="flex items-center space-x-4">
                        <div className="w-16 h-16 bg-gray-200 rounded-lg overflow-hidden flex-shrink-0">
                          {item.crop.images && item.crop.images.length > 0 ? (
                            <img
                              src={item.crop.images[0].url}
                              alt={item.crop.name}
                              className="w-full h-full object-cover"
                            />
                          ) : (
                            <div className="w-full h-full flex items-center justify-center">
                              <Package className="w-6 h-6 text-gray-400" />
                            </div>
                          )}
                        </div>
                        <div className="flex-1 min-w-0">
                          <h4 className="font-medium text-gray-900">{item.crop.name}</h4>
                          <p className="text-sm text-gray-600">{item.crop.variety}</p>
                          <div className="flex items-center space-x-4 mt-1 text-sm text-gray-500">
                            <span>Qty: {item.quantity} {item.crop.quantity.unit}</span>
                            <span>•</span>
                            <span>{formatPrice(item.unitPrice)} each</span>
                          </div>
                        </div>
                        <div className="text-right">
                          <p className="font-medium text-gray-900">
                            {formatPrice(item.totalPrice)}
                          </p>
                        </div>
                      </div>
                    ))}
                  </div>

                  {/* Order Details */}
                  <div className="mt-6 pt-6 border-t border-gray-200">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <div>
                        <h5 className="font-medium text-gray-900 mb-2">
                          {isFarmer ? 'Buyer Information' : 'Farmer Information'}
                        </h5>
                        <div className="space-y-1 text-sm text-gray-600">
                          <p className="font-medium">{isFarmer ? order.buyer?.name : order.farmer?.name}</p>
                          <p>{isFarmer ? order.buyer?.email : order.farmer?.email}</p>
                          <p>{isFarmer ? order.buyer?.phone : order.farmer?.phone}</p>
                        </div>
                      </div>
                      <div>
                        <h5 className="font-medium text-gray-900 mb-2">Shipping Address</h5>
                        <div className="text-sm text-gray-600">
                          <p className="font-medium">{order.shippingAddress.name}</p>
                          <p>{order.shippingAddress.street}</p>
                          <p>{order.shippingAddress.city}, {order.shippingAddress.state}</p>
                          <p>{order.shippingAddress.pincode}</p>
                        </div>
                      </div>
                    </div>

                    {/* Order Summary */}
                    <div className="mt-6 bg-gray-50 rounded-lg p-4">
                      <div className="flex justify-between text-sm mb-2">
                        <span className="text-gray-600">Subtotal</span>
                        <span className="font-medium">{formatPrice(order.totalAmount)}</span>
                      </div>
                      <div className="flex justify-between text-sm mb-2">
                        <span className="text-gray-600">Delivery Charges</span>
                        <span className="font-medium">
                          {order.deliveryCharges > 0 ? formatPrice(order.deliveryCharges) : 'Free'}
                        </span>
                      </div>
                      <div className="flex justify-between text-sm mb-2">
                        <span className="text-gray-600">Tax (5%)</span>
                        <span className="font-medium">{formatPrice(order.taxAmount)}</span>
                      </div>
                      <div className="border-t border-gray-200 pt-2 mt-2">
                        <div className="flex justify-between">
                          <span className="font-medium text-gray-900">Total</span>
                          <span className="font-bold text-lg text-gray-900">
                            {formatPrice(order.finalAmount)}
                          </span>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Actions */}
                  <div className="mt-6 flex space-x-3">
                    <Link
                      to={`/orders/${order._id}`}
                      className="btn-outline flex items-center"
                    >
                      <Eye className="w-4 h-4 mr-2" />
                      View Details
                    </Link>
                    {order.status === 'delivered' && !order.ratings?.[isFarmer ? 'farmer' : 'buyer'] && (
                      <button className="btn-secondary flex items-center">
                        <Star className="w-4 h-4 mr-2" />
                        Rate & Review
                      </button>
                    )}
                    {order.status === 'pending' && isFarmer && (
                      <button className="btn-primary">
                        Confirm Order
                      </button>
                    )}
                    {order.status === 'confirmed' && isFarmer && (
                      <button className="btn-primary">
                        Start Processing
                      </button>
                    )}
                    {order.status === 'processing' && isFarmer && (
                      <button className="btn-primary">
                        Mark as Shipped
                      </button>
                    )}
                    {order.status === 'shipped' && isFarmer && (
                      <button className="btn-primary">
                        Mark as Delivered
                      </button>
                    )}
                  </div>
                </div>
              </div>
            ))}

            {/* Pagination */}
            {pagination && pagination.pages > 1 && (
              <div className="flex items-center justify-center space-x-2 mt-8">
                <button
                  onClick={() => setPage(page - 1)}
                  disabled={page === 1}
                  className="btn-outline disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  Previous
                </button>
                
                {Array.from({ length: Math.min(5, pagination.pages) }, (_, i) => {
                  const pageNum = i + 1;
                  return (
                    <button
                      key={pageNum}
                      onClick={() => setPage(pageNum)}
                      className={`px-3 py-2 rounded-lg text-sm font-medium ${
                        page === pageNum
                          ? 'bg-primary-600 text-white'
                          : 'bg-white text-gray-700 border border-gray-300 hover:bg-gray-50'
                      }`}
                    >
                      {pageNum}
                    </button>
                  );
                })}
                
                <button
                  onClick={() => setPage(page + 1)}
                  disabled={page === pagination.pages}
                  className="btn-outline disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  Next
                </button>
              </div>
            )}
          </div>
        ) : (
          <div className="text-center py-20">
            <div className="w-24 h-24 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-6">
              <Package className="w-12 h-12 text-gray-400" />
            </div>
            <h2 className="text-2xl font-bold text-gray-900 mb-4">No orders found</h2>
            <p className="text-gray-600 mb-8">
              {isFarmer 
                ? 'Your orders will appear here when customers buy your crops'
                : 'Your orders will appear here once you make a purchase'
              }
            </p>
            <Link to="/marketplace" className="btn-primary">
              {isFarmer ? 'Add Crops' : 'Browse Marketplace'}
            </Link>
          </div>
        )}
      </div>
    </div>
  );
};

export default Orders;
