import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useQuery } from 'react-query';
import { cropsAPI } from '../services/api';
import { useCart } from '../contexts/CartContext';
import { useAuth } from '../contexts/AuthContext';
import { 
  Search, 
  Filter, 
  Heart, 
  ShoppingCart, 
  Star, 
  MapPin, 
  Calendar,
  Leaf,
  Award,
  Truck
} from 'lucide-react';
import LoadingSpinner from '../components/UI/LoadingSpinner';
import toast from 'react-hot-toast';

const Marketplace = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [filters, setFilters] = useState({
    category: '',
    state: '',
    minPrice: '',
    maxPrice: '',
    organic: false,
    sortBy: 'createdAt',
    sortOrder: 'desc'
  });
  const [showFilters, setShowFilters] = useState(false);
  const [page, setPage] = useState(1);

  const { addToCart, canAddToCart } = useCart();
  const { isAuthenticated, isBuyer } = useAuth();

  const { data: cropsData, isLoading, error } = useQuery(
    ['crops', { ...filters, search: searchTerm, page }],
    () => cropsAPI.getCrops({ ...filters, search: searchTerm, page }),
    {
      keepPreviousData: true,
      staleTime: 5 * 60 * 1000, // 5 minutes
    }
  );

  const categories = [
    'Cereals', 'Pulses', 'Oilseeds', 'Vegetables', 'Fruits', 
    'Spices', 'Medicinal Plants', 'Flowers', 'Others'
  ];

  const states = [
    'Andhra Pradesh', 'Arunachal Pradesh', 'Assam', 'Bihar', 'Chhattisgarh',
    'Goa', 'Gujarat', 'Haryana', 'Himachal Pradesh', 'Jharkhand',
    'Karnataka', 'Kerala', 'Madhya Pradesh', 'Maharashtra', 'Manipur',
    'Meghalaya', 'Mizoram', 'Nagaland', 'Odisha', 'Punjab',
    'Rajasthan', 'Sikkim', 'Tamil Nadu', 'Telangana', 'Tripura',
    'Uttar Pradesh', 'Uttarakhand', 'West Bengal', 'Delhi', 'Chandigarh'
  ];

  const handleFilterChange = (key, value) => {
    setFilters(prev => ({ ...prev, [key]: value }));
    setPage(1);
  };

  const handleSearch = (e) => {
    e.preventDefault();
    setPage(1);
  };

  const handleAddToCart = (crop) => {
    if (!isAuthenticated) {
      toast.error('Please login to add items to cart');
      return;
    }
    if (!isBuyer) {
      toast.error('Only buyers can add items to cart');
      return;
    }
    if (!canAddToCart(crop)) {
      toast.error('Cannot add more items than available');
      return;
    }
    addToCart(crop, 1);
  };

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

  if (error) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-gray-900 mb-4">Error loading crops</h2>
          <p className="text-gray-600">Please try again later</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="text-center space-y-4">
            <h1 className="text-3xl md:text-4xl font-bold text-gray-900">
              Fresh Produce Marketplace
            </h1>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto">
              Discover fresh crops directly from farmers across India. 
              No middlemen, better prices, guaranteed quality.
            </p>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="flex flex-col lg:flex-row gap-8">
          {/* Filters Sidebar */}
          <div className="lg:w-64 flex-shrink-0">
            <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 sticky top-24">
              <div className="flex items-center justify-between mb-6">
                <h3 className="text-lg font-semibold text-gray-900">Filters</h3>
                <button
                  onClick={() => setShowFilters(!showFilters)}
                  className="lg:hidden p-2 text-gray-400 hover:text-gray-600"
                >
                  <Filter className="w-5 h-5" />
                </button>
              </div>

              <div className={`space-y-6 ${showFilters ? 'block' : 'hidden lg:block'}`}>
                {/* Search */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Search
                  </label>
                  <form onSubmit={handleSearch} className="relative">
                    <input
                      type="text"
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                      className="input-field pr-10"
                      placeholder="Search crops..."
                    />
                    <Search className="absolute right-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
                  </form>
                </div>

                {/* Category */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Category
                  </label>
                  <select
                    value={filters.category}
                    onChange={(e) => handleFilterChange('category', e.target.value)}
                    className="input-field"
                  >
                    <option value="">All Categories</option>
                    {categories.map(category => (
                      <option key={category} value={category}>{category}</option>
                    ))}
                  </select>
                </div>

                {/* State */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    State
                  </label>
                  <select
                    value={filters.state}
                    onChange={(e) => handleFilterChange('state', e.target.value)}
                    className="input-field"
                  >
                    <option value="">All States</option>
                    {states.map(state => (
                      <option key={state} value={state}>{state}</option>
                    ))}
                  </select>
                </div>

                {/* Price Range */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Price Range (₹)
                  </label>
                  <div className="grid grid-cols-2 gap-2">
                    <input
                      type="number"
                      value={filters.minPrice}
                      onChange={(e) => handleFilterChange('minPrice', e.target.value)}
                      className="input-field text-sm"
                      placeholder="Min"
                    />
                    <input
                      type="number"
                      value={filters.maxPrice}
                      onChange={(e) => handleFilterChange('maxPrice', e.target.value)}
                      className="input-field text-sm"
                      placeholder="Max"
                    />
                  </div>
                </div>

                {/* Organic */}
                <div>
                  <label className="flex items-center">
                    <input
                      type="checkbox"
                      checked={filters.organic}
                      onChange={(e) => handleFilterChange('organic', e.target.checked)}
                      className="h-4 w-4 text-primary-600 focus:ring-primary-500 border-gray-300 rounded"
                    />
                    <span className="ml-2 text-sm text-gray-700">Organic Only</span>
                  </label>
                </div>

                {/* Sort */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Sort By
                  </label>
                  <select
                    value={`${filters.sortBy}-${filters.sortOrder}`}
                    onChange={(e) => {
                      const [sortBy, sortOrder] = e.target.value.split('-');
                      handleFilterChange('sortBy', sortBy);
                      handleFilterChange('sortOrder', sortOrder);
                    }}
                    className="input-field"
                  >
                    <option value="createdAt-desc">Newest First</option>
                    <option value="createdAt-asc">Oldest First</option>
                    <option value="price.perUnit-asc">Price: Low to High</option>
                    <option value="price.perUnit-desc">Price: High to Low</option>
                    <option value="views-desc">Most Popular</option>
                  </select>
                </div>

                {/* Clear Filters */}
                <button
                  onClick={() => {
                    setFilters({
                      category: '',
                      state: '',
                      minPrice: '',
                      maxPrice: '',
                      organic: false,
                      sortBy: 'createdAt',
                      sortOrder: 'desc'
                    });
                    setSearchTerm('');
                    setPage(1);
                  }}
                  className="w-full btn-outline text-sm"
                >
                  Clear Filters
                </button>
              </div>
            </div>
          </div>

          {/* Main Content */}
          <div className="flex-1">
            {/* Results Header */}
            <div className="flex items-center justify-between mb-6">
              <div>
                <h2 className="text-xl font-semibold text-gray-900">
                  {cropsData?.pagination?.total || 0} crops found
                </h2>
                <p className="text-gray-600">
                  Showing {((page - 1) * 12) + 1}-{Math.min(page * 12, cropsData?.pagination?.total || 0)} results
                </p>
              </div>
            </div>

            {/* Loading State */}
            {isLoading ? (
              <div className="flex justify-center py-12">
                <LoadingSpinner size="large" />
              </div>
            ) : (
              <>
                {/* Crops Grid */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {cropsData?.crops?.map((crop) => (
                    <div key={crop._id} className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden hover:shadow-md transition-shadow">
                      {/* Image */}
                      <div className="aspect-w-16 aspect-h-9 bg-gray-200">
                        {crop.images && crop.images.length > 0 ? (
                          <img
                            src={crop.images[0].url}
                            alt={crop.images[0].alt || crop.name}
                            className="w-full h-48 object-cover"
                          />
                        ) : (
                          <div className="w-full h-48 bg-gray-200 flex items-center justify-center">
                            <span className="text-gray-400">No Image</span>
                          </div>
                        )}
                      </div>

                      {/* Content */}
                      <div className="p-4">
                        <div className="flex items-start justify-between mb-2">
                          <h3 className="text-lg font-semibold text-gray-900 line-clamp-1">
                            {crop.name}
                          </h3>
                          <button className="text-gray-400 hover:text-red-500 transition-colors">
                            <Heart className="w-5 h-5" />
                          </button>
                        </div>

                        <p className="text-sm text-gray-600 mb-2 line-clamp-2">
                          {crop.description}
                        </p>

                        <div className="flex items-center space-x-4 text-sm text-gray-500 mb-3">
                          <div className="flex items-center space-x-1">
                            <MapPin className="w-4 h-4" />
                            <span>{crop.location.state}</span>
                          </div>
                          <div className="flex items-center space-x-1">
                            <Calendar className="w-4 h-4" />
                            <span>{formatDate(crop.harvestDate)}</span>
                          </div>
                        </div>

                        {/* Quality Badges */}
                        <div className="flex items-center space-x-2 mb-3">
                          {crop.quality?.organic && (
                            <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-green-100 text-green-800">
                              <Leaf className="w-3 h-3 mr-1" />
                              Organic
                            </span>
                          )}
                          {crop.quality?.certified && (
                            <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                              <Award className="w-3 h-3 mr-1" />
                              Certified
                            </span>
                          )}
                        </div>

                        {/* Price and Quantity */}
                        <div className="flex items-center justify-between mb-4">
                          <div>
                            <div className="text-xl font-bold text-primary-600">
                              {formatPrice(crop.price.perUnit)}
                            </div>
                            <div className="text-sm text-gray-500">
                              per {crop.quantity.unit}
                            </div>
                          </div>
                          <div className="text-right">
                            <div className="text-sm text-gray-900 font-medium">
                              {crop.quantity.value} {crop.quantity.unit}
                            </div>
                            <div className="text-sm text-gray-500">available</div>
                          </div>
                        </div>

                        {/* Farmer Info */}
                        <div className="flex items-center justify-between mb-4">
                          <div className="flex items-center space-x-2">
                            <div className="w-8 h-8 bg-primary-100 rounded-full flex items-center justify-center">
                              <span className="text-primary-600 font-semibold text-sm">
                                {crop.farmer.name?.charAt(0)}
                              </span>
                            </div>
                            <div>
                              <div className="text-sm font-medium text-gray-900">
                                {crop.farmer.name}
                              </div>
                              <div className="flex items-center space-x-1">
                                <Star className="w-3 h-3 text-yellow-400 fill-current" />
                                <span className="text-xs text-gray-500">
                                  {crop.farmer.rating?.average?.toFixed(1) || 'New'}
                                </span>
                              </div>
                            </div>
                          </div>
                        </div>

                        {/* Actions */}
                        <div className="flex space-x-2">
                          <Link
                            to={`/crop/${crop._id}`}
                            className="flex-1 btn-outline text-center text-sm py-2"
                          >
                            View Details
                          </Link>
                          {isBuyer && (
                            <button
                              onClick={() => handleAddToCart(crop)}
                              disabled={!canAddToCart(crop)}
                              className="flex-1 btn-primary text-sm py-2 flex items-center justify-center disabled:opacity-50 disabled:cursor-not-allowed"
                            >
                              <ShoppingCart className="w-4 h-4 mr-1" />
                              Add to Cart
                            </button>
                          )}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>

                {/* Empty State */}
                {cropsData?.crops?.length === 0 && (
                  <div className="text-center py-12">
                    <div className="w-24 h-24 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                      <Search className="w-12 h-12 text-gray-400" />
                    </div>
                    <h3 className="text-lg font-semibold text-gray-900 mb-2">No crops found</h3>
                    <p className="text-gray-600 mb-4">
                      Try adjusting your search criteria or browse all crops
                    </p>
                    <button
                      onClick={() => {
                        setFilters({
                          category: '',
                          state: '',
                          minPrice: '',
                          maxPrice: '',
                          organic: false,
                          sortBy: 'createdAt',
                          sortOrder: 'desc'
                        });
                        setSearchTerm('');
                      }}
                      className="btn-primary"
                    >
                      Clear Filters
                    </button>
                  </div>
                )}

                {/* Pagination */}
                {cropsData?.pagination?.pages > 1 && (
                  <div className="flex items-center justify-center space-x-2 mt-8">
                    <button
                      onClick={() => setPage(page - 1)}
                      disabled={page === 1}
                      className="btn-outline disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      Previous
                    </button>
                    
                    {Array.from({ length: Math.min(5, cropsData.pagination.pages) }, (_, i) => {
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
                      disabled={page === cropsData.pagination.pages}
                      className="btn-outline disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      Next
                    </button>
                  </div>
                )}
              </>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Marketplace;
