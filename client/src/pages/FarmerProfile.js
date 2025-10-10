import React, { useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { useQuery } from 'react-query';
import { usersAPI, cropsAPI } from '../services/api';
import { 
  User, 
  Star, 
  MapPin, 
  Calendar,
  Package,
  Award,
  Leaf,
  Shield,
  Phone,
  Mail,
  ArrowLeft,
  Filter
} from 'lucide-react';
import LoadingSpinner from '../components/UI/LoadingSpinner';

const FarmerProfile = () => {
  const { id } = useParams();
  const [cropFilters, setCropFilters] = useState({
    category: '',
    status: 'available'
  });

  const { data: userData, isLoading: userLoading, error: userError } = useQuery(
    ['user', id],
    () => usersAPI.getPublicProfile(id),
    {
      enabled: !!id,
    }
  );

  const { data: cropsData, isLoading: cropsLoading } = useQuery(
    ['farmer-crops', id, cropFilters],
    () => cropsAPI.getCrops({ 
      farmer: id, 
      ...cropFilters,
      limit: 12 
    }),
    {
      enabled: !!id,
    }
  );

  const farmer = userData?.user;
  const crops = cropsData?.crops || [];

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
      month: 'long'
    });
  };

  const categories = [
    'Cereals', 'Pulses', 'Oilseeds', 'Vegetables', 'Fruits', 
    'Spices', 'Medicinal Plants', 'Flowers', 'Others'
  ];

  if (userLoading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <LoadingSpinner size="large" />
      </div>
    );
  }

  if (userError || !farmer || farmer.userType !== 'farmer') {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-gray-900 mb-4">Farmer not found</h2>
          <p className="text-gray-600 mb-4">The farmer profile you're looking for doesn't exist.</p>
          <Link to="/marketplace" className="btn-primary">
            Back to Marketplace
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <Link
            to="/marketplace"
            className="flex items-center space-x-2 text-gray-600 hover:text-primary-600 transition-colors"
          >
            <ArrowLeft className="w-5 h-5" />
            <span>Back to Marketplace</span>
          </Link>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Farmer Info */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-8 mb-8">
          <div className="flex flex-col md:flex-row items-start space-y-6 md:space-y-0 md:space-x-8">
            <div className="w-32 h-32 bg-primary-100 rounded-full flex items-center justify-center flex-shrink-0">
              <User className="w-16 h-16 text-primary-600" />
            </div>
            
            <div className="flex-1">
              <div className="flex flex-col md:flex-row md:items-center md:justify-between mb-4">
                <div>
                  <h1 className="text-3xl font-bold text-gray-900">{farmer.name}</h1>
                  <div className="flex items-center space-x-1 mt-2">
                    <Star className="w-5 h-5 text-yellow-400 fill-current" />
                    <span className="text-lg font-medium text-gray-900">
                      {farmer.rating?.average?.toFixed(1) || 'New'}
                    </span>
                    <span className="text-gray-600">
                      ({farmer.rating?.count || 0} reviews)
                    </span>
                  </div>
                </div>
                
                <div className="flex space-x-3 mt-4 md:mt-0">
                  <button className="btn-outline flex items-center">
                    <Phone className="w-5 h-5 mr-2" />
                    Contact
                  </button>
                  <button className="btn-outline flex items-center">
                    <Mail className="w-5 h-5 mr-2" />
                    Message
                  </button>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                <div className="flex items-center space-x-3">
                  <MapPin className="w-5 h-5 text-gray-400" />
                  <div>
                    <div className="text-sm font-medium text-gray-900">Location</div>
                    <div className="text-sm text-gray-600">
                      {farmer.address?.city}, {farmer.address?.state}
                    </div>
                  </div>
                </div>

                <div className="flex items-center space-x-3">
                  <Calendar className="w-5 h-5 text-gray-400" />
                  <div>
                    <div className="text-sm font-medium text-gray-900">Member Since</div>
                    <div className="text-sm text-gray-600">
                      {formatDate(farmer.createdAt)}
                    </div>
                  </div>
                </div>

                <div className="flex items-center space-x-3">
                  <Package className="w-5 h-5 text-gray-400" />
                  <div>
                    <div className="text-sm font-medium text-gray-900">Total Crops</div>
                    <div className="text-sm text-gray-600">
                      {farmer.stats?.totalCrops || 0} listed
                    </div>
                  </div>
                </div>

                <div className="flex items-center space-x-3">
                  <Shield className="w-5 h-5 text-gray-400" />
                  <div>
                    <div className="text-sm font-medium text-gray-900">Orders</div>
                    <div className="text-sm text-gray-600">
                      {farmer.stats?.totalOrders || 0} completed
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Farm Details */}
        {farmer.farmDetails && (
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 mb-8">
            <h2 className="text-xl font-semibold text-gray-900 mb-6 flex items-center">
              <Leaf className="w-6 h-6 mr-2 text-primary-600" />
              Farm Information
            </h2>
            
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              {farmer.farmDetails.farmName && (
                <div>
                  <div className="text-sm font-medium text-gray-700">Farm Name</div>
                  <div className="text-sm text-gray-900">{farmer.farmDetails.farmName}</div>
                </div>
              )}
              
              {farmer.farmDetails.farmSize && (
                <div>
                  <div className="text-sm font-medium text-gray-700">Farm Size</div>
                  <div className="text-sm text-gray-900">{farmer.farmDetails.farmSize}</div>
                </div>
              )}
              
              {farmer.farmDetails.farmingExperience && (
                <div>
                  <div className="text-sm font-medium text-gray-700">Experience</div>
                  <div className="text-sm text-gray-900">
                    {farmer.farmDetails.farmingExperience} years
                  </div>
                </div>
              )}
              
              <div>
                <div className="text-sm font-medium text-gray-700">Certifications</div>
                <div className="flex items-center space-x-2 mt-1">
                  {farmer.farmDetails.organicCertified && (
                    <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-green-100 text-green-800">
                      <Leaf className="w-3 h-3 mr-1" />
                      Organic
                    </span>
                  )}
                  <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                    <Award className="w-3 h-3 mr-1" />
                    Verified
                  </span>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Crops Section */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200">
          <div className="p-6 border-b border-gray-200">
            <div className="flex flex-col md:flex-row md:items-center md:justify-between">
              <h2 className="text-xl font-semibold text-gray-900 mb-4 md:mb-0">
                Available Crops
              </h2>
              
              <div className="flex space-x-3">
                <select
                  value={cropFilters.category}
                  onChange={(e) => setCropFilters(prev => ({ ...prev, category: e.target.value }))}
                  className="input-field text-sm"
                >
                  <option value="">All Categories</option>
                  {categories.map(category => (
                    <option key={category} value={category}>{category}</option>
                  ))}
                </select>
                
                <select
                  value={cropFilters.status}
                  onChange={(e) => setCropFilters(prev => ({ ...prev, status: e.target.value }))}
                  className="input-field text-sm"
                >
                  <option value="available">Available</option>
                  <option value="sold">Sold</option>
                  <option value="">All Status</option>
                </select>
              </div>
            </div>
          </div>

          <div className="p-6">
            {cropsLoading ? (
              <div className="flex justify-center py-8">
                <LoadingSpinner size="medium" />
              </div>
            ) : crops.length > 0 ? (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {crops.map((crop) => (
                  <div key={crop._id} className="border border-gray-200 rounded-lg overflow-hidden hover:shadow-md transition-shadow">
                    <div className="aspect-w-16 aspect-h-9 bg-gray-200">
                      {crop.images && crop.images.length > 0 ? (
                        <img
                          src={crop.images[0].url}
                          alt={crop.name}
                          className="w-full h-48 object-cover"
                        />
                      ) : (
                        <div className="w-full h-48 bg-gray-200 flex items-center justify-center">
                          <Package className="w-12 h-12 text-gray-400" />
                        </div>
                      )}
                    </div>

                    <div className="p-4">
                      <h3 className="font-semibold text-gray-900 mb-2">{crop.name}</h3>
                      <p className="text-sm text-gray-600 mb-2 line-clamp-2">{crop.description}</p>
                      
                      <div className="flex items-center justify-between mb-3">
                        <span className="text-lg font-bold text-primary-600">
                          {formatPrice(crop.price.perUnit)}
                        </span>
                        <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${
                          crop.availability.status === 'available' 
                            ? 'bg-green-100 text-green-800' 
                            : 'bg-gray-100 text-gray-800'
                        }`}>
                          {crop.availability.status}
                        </span>
                      </div>

                      <div className="flex items-center justify-between text-sm text-gray-500 mb-3">
                        <span>{crop.quantity.value} {crop.quantity.unit}</span>
                        <span>{crop.category}</span>
                      </div>

                      {/* Quality Badges */}
                      <div className="flex items-center space-x-2 mb-4">
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

                      <Link
                        to={`/crop/${crop._id}`}
                        className="w-full btn-outline text-center text-sm py-2"
                      >
                        View Details
                      </Link>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-12">
                <Package className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                <h3 className="text-lg font-semibold text-gray-900 mb-2">No crops found</h3>
                <p className="text-gray-600">
                  {cropFilters.category || cropFilters.status !== 'available' 
                    ? 'Try adjusting your filters to see more crops'
                    : 'This farmer hasn\'t listed any crops yet'
                  }
                </p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default FarmerProfile;
