import React, { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useQuery } from 'react-query';
import { cropsAPI } from '../services/api';
import { useCart } from '../contexts/CartContext';
import { useAuth } from '../contexts/AuthContext';
import { 
  ArrowLeft, 
  Heart, 
  ShoppingCart, 
  Star, 
  MapPin, 
  Calendar,
  Leaf,
  Award,
  Truck,
  Clock,
  Shield,
  User,
  Phone,
  Mail
} from 'lucide-react';
import LoadingSpinner from '../components/UI/LoadingSpinner';
import toast from 'react-hot-toast';

const CropDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [quantity, setQuantity] = useState(1);
  const [selectedImageIndex, setSelectedImageIndex] = useState(0);
  const [isFavorite, setIsFavorite] = useState(false);

  const { addToCart, canAddToCart } = useCart();
  const { isAuthenticated, isBuyer, user } = useAuth();

  const { data: cropData, isLoading, error } = useQuery(
    ['crop', id],
    () => cropsAPI.getCrop(id),
    {
      enabled: !!id,
    }
  );

  const crop = cropData?.crop;

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <LoadingSpinner size="large" />
      </div>
    );
  }

  if (error || !crop) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-gray-900 mb-4">Crop not found</h2>
          <p className="text-gray-600 mb-4">The crop you're looking for doesn't exist or has been removed.</p>
          <button onClick={() => navigate('/marketplace')} className="btn-primary">
            Back to Marketplace
          </button>
        </div>
      </div>
    );
  }

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
      month: 'long',
      day: 'numeric'
    });
  };

  const handleAddToCart = () => {
    if (!isAuthenticated) {
      toast.error('Please login to add items to cart');
      return;
    }
    if (!isBuyer) {
      toast.error('Only buyers can add items to cart');
      return;
    }
    if (crop.farmer._id === user?.id) {
      toast.error('Cannot add your own crops to cart');
      return;
    }
    if (!canAddToCart(crop)) {
      toast.error('Cannot add more items than available');
      return;
    }
    addToCart(crop, quantity);
  };

  const handleBuyNow = () => {
    handleAddToCart();
    if (canAddToCart(crop)) {
      navigate('/checkout');
    }
  };

  const handleToggleFavorite = () => {
    if (!isAuthenticated) {
      toast.error('Please login to add to favorites');
      return;
    }
    setIsFavorite(!isFavorite);
    toast.success(isFavorite ? 'Removed from favorites' : 'Added to favorites');
  };

  const isOwner = crop.farmer._id === user?.id;
  const availableQuantity = crop.quantity.value;
  const maxQuantity = Math.min(availableQuantity, crop.availability.maximumOrder || availableQuantity);

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <button
            onClick={() => navigate(-1)}
            className="flex items-center space-x-2 text-gray-600 hover:text-primary-600 transition-colors"
          >
            <ArrowLeft className="w-5 h-5" />
            <span>Back</span>
          </button>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
          {/* Images */}
          <div className="space-y-4">
            {/* Main Image */}
            <div className="aspect-w-16 aspect-h-12 bg-gray-200 rounded-lg overflow-hidden">
              {crop.images && crop.images.length > 0 ? (
                <img
                  src={crop.images[selectedImageIndex].url}
                  alt={crop.images[selectedImageIndex].alt || crop.name}
                  className="w-full h-96 object-cover"
                />
              ) : (
                <div className="w-full h-96 bg-gray-200 flex items-center justify-center">
                  <span className="text-gray-400 text-lg">No Image Available</span>
                </div>
              )}
            </div>

            {/* Thumbnail Images */}
            {crop.images && crop.images.length > 1 && (
              <div className="flex space-x-2 overflow-x-auto">
                {crop.images.map((image, index) => (
                  <button
                    key={index}
                    onClick={() => setSelectedImageIndex(index)}
                    className={`flex-shrink-0 w-20 h-20 rounded-lg overflow-hidden border-2 ${
                      selectedImageIndex === index ? 'border-primary-500' : 'border-gray-200'
                    }`}
                  >
                    <img
                      src={image.url}
                      alt={image.alt || `${crop.name} ${index + 1}`}
                      className="w-full h-full object-cover"
                    />
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Product Info */}
          <div className="space-y-6">
            {/* Title and Category */}
            <div>
              <div className="flex items-center space-x-2 mb-2">
                <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-primary-100 text-primary-800">
                  {crop.category}
                </span>
                {crop.quality?.organic && (
                  <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
                    <Leaf className="w-3 h-3 mr-1" />
                    Organic
                  </span>
                )}
                {crop.quality?.certified && (
                  <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                    <Award className="w-3 h-3 mr-1" />
                    Certified
                  </span>
                )}
              </div>
              <h1 className="text-3xl font-bold text-gray-900">{crop.name}</h1>
              <p className="text-lg text-gray-600 mt-2">{crop.variety}</p>
            </div>

            {/* Description */}
            <div>
              <h3 className="text-lg font-semibold text-gray-900 mb-2">Description</h3>
              <p className="text-gray-700 leading-relaxed">{crop.description}</p>
            </div>

            {/* Quality Details */}
            <div>
              <h3 className="text-lg font-semibold text-gray-900 mb-3">Quality Details</h3>
              <div className="grid grid-cols-2 gap-4">
                <div className="bg-gray-50 rounded-lg p-4">
                  <div className="text-sm text-gray-600">Grade</div>
                  <div className="font-semibold text-gray-900">{crop.quality?.grade || 'Grade A'}</div>
                </div>
                <div className="bg-gray-50 rounded-lg p-4">
                  <div className="text-sm text-gray-600">Moisture Content</div>
                  <div className="font-semibold text-gray-900">{crop.quality?.moistureContent || 'N/A'}</div>
                </div>
                <div className="bg-gray-50 rounded-lg p-4">
                  <div className="text-sm text-gray-600">Purity</div>
                  <div className="font-semibold text-gray-900">{crop.quality?.purity ? `${crop.quality.purity}%` : 'N/A'}</div>
                </div>
                <div className="bg-gray-50 rounded-lg p-4">
                  <div className="text-sm text-gray-600">Packaging</div>
                  <div className="font-semibold text-gray-900">{crop.packaging?.type || 'Standard'}</div>
                </div>
              </div>
            </div>

            {/* Price and Quantity */}
            <div className="bg-primary-50 rounded-lg p-6">
              <div className="flex items-center justify-between mb-4">
                <div>
                  <div className="text-3xl font-bold text-primary-600">
                    {formatPrice(crop.price.perUnit)}
                  </div>
                  <div className="text-sm text-gray-600">
                    per {crop.quantity.unit}
                  </div>
                </div>
                <div className="text-right">
                  <div className="text-lg font-semibold text-gray-900">
                    {crop.quantity.value} {crop.quantity.unit}
                  </div>
                  <div className="text-sm text-gray-600">available</div>
                </div>
              </div>

              {!isOwner && (
                <div className="space-y-4">
                  {/* Quantity Selector */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Quantity ({crop.quantity.unit})
                    </label>
                    <div className="flex items-center space-x-3">
                      <button
                        onClick={() => setQuantity(Math.max(1, quantity - 1))}
                        disabled={quantity <= 1}
                        className="w-10 h-10 rounded-lg border border-gray-300 flex items-center justify-center disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50"
                      >
                        -
                      </button>
                      <input
                        type="number"
                        min="1"
                        max={maxQuantity}
                        value={quantity}
                        onChange={(e) => setQuantity(Math.max(1, Math.min(maxQuantity, parseInt(e.target.value) || 1)))}
                        className="w-20 text-center border border-gray-300 rounded-lg py-2"
                      />
                      <button
                        onClick={() => setQuantity(Math.min(maxQuantity, quantity + 1))}
                        disabled={quantity >= maxQuantity}
                        className="w-10 h-10 rounded-lg border border-gray-300 flex items-center justify-center disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50"
                      >
                        +
                      </button>
                    </div>
                    <div className="text-sm text-gray-600 mt-1">
                      Total: {formatPrice(crop.price.perUnit * quantity)}
                    </div>
                  </div>

                  {/* Action Buttons */}
                  <div className="flex space-x-3">
                    <button
                      onClick={handleToggleFavorite}
                      className={`flex-1 py-3 px-4 rounded-lg border transition-colors ${
                        isFavorite
                          ? 'border-red-300 bg-red-50 text-red-600'
                          : 'border-gray-300 bg-white text-gray-700 hover:bg-gray-50'
                      }`}
                    >
                      <Heart className={`w-5 h-5 mx-auto ${isFavorite ? 'fill-current' : ''}`} />
                    </button>
                    <button
                      onClick={handleAddToCart}
                      disabled={!canAddToCart(crop)}
                      className="flex-1 btn-primary disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      <ShoppingCart className="w-5 h-5 mr-2" />
                      Add to Cart
                    </button>
                    <button
                      onClick={handleBuyNow}
                      disabled={!canAddToCart(crop)}
                      className="flex-1 bg-primary-700 hover:bg-primary-800 text-white font-medium py-3 px-4 rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      Buy Now
                    </button>
                  </div>
                </div>
              )}

              {isOwner && (
                <div className="text-center py-4">
                  <p className="text-gray-600 mb-4">This is your own crop listing</p>
                  <div className="flex space-x-3 justify-center">
                    <button className="btn-outline">
                      Edit Crop
                    </button>
                    <button className="btn-secondary">
                      View Analytics
                    </button>
                  </div>
                </div>
              )}
            </div>

            {/* Key Information */}
            <div className="space-y-4">
              <div className="flex items-center space-x-3 text-gray-600">
                <MapPin className="w-5 h-5" />
                <span>{crop.location.district}, {crop.location.state}</span>
              </div>
              <div className="flex items-center space-x-3 text-gray-600">
                <Calendar className="w-5 h-5" />
                <span>Harvested on {formatDate(crop.harvestDate)}</span>
              </div>
              <div className="flex items-center space-x-3 text-gray-600">
                <Clock className="w-5 h-5" />
                <span>Expires on {formatDate(crop.expiryDate)}</span>
              </div>
              {crop.delivery.available && (
                <div className="flex items-center space-x-3 text-gray-600">
                  <Truck className="w-5 h-5" />
                  <span>Delivery available within {crop.delivery.radius}km</span>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Farmer Information */}
        <div className="mt-12 bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <h3 className="text-xl font-semibold text-gray-900 mb-6">About the Farmer</h3>
          <div className="flex items-start space-x-6">
            <div className="w-16 h-16 bg-primary-100 rounded-full flex items-center justify-center">
              <User className="w-8 h-8 text-primary-600" />
            </div>
            <div className="flex-1">
              <div className="flex items-center space-x-3 mb-2">
                <h4 className="text-lg font-semibold text-gray-900">{crop.farmer.name}</h4>
                <div className="flex items-center space-x-1">
                  <Star className="w-4 h-4 text-yellow-400 fill-current" />
                  <span className="text-sm text-gray-600">
                    {crop.farmer.rating?.average?.toFixed(1) || 'New'}
                  </span>
                </div>
              </div>
              <p className="text-gray-600 mb-4">
                {crop.farmer.farmDetails?.farmName && `Farm: ${crop.farmer.farmDetails.farmName}`}
                {crop.farmer.farmDetails?.farmingExperience && 
                  ` • ${crop.farmer.farmDetails.farmingExperience} years experience`}
              </p>
              <div className="flex items-center space-x-4">
                <button className="btn-outline text-sm py-2 px-4">
                  <User className="w-4 h-4 mr-2" />
                  View Profile
                </button>
                <button className="btn-outline text-sm py-2 px-4">
                  <Phone className="w-4 h-4 mr-2" />
                  Contact
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Additional Information */}
        <div className="mt-8 grid grid-cols-1 md:grid-cols-2 gap-8">
          {/* Delivery Information */}
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Delivery Information</h3>
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-gray-600">Delivery Available</span>
                <span className={`font-medium ${crop.delivery.available ? 'text-green-600' : 'text-red-600'}`}>
                  {crop.delivery.available ? 'Yes' : 'No'}
                </span>
              </div>
              {crop.delivery.available && (
                <>
                  <div className="flex items-center justify-between">
                    <span className="text-gray-600">Delivery Radius</span>
                    <span className="font-medium">{crop.delivery.radius}km</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-gray-600">Delivery Charges</span>
                    <span className="font-medium">
                      {crop.delivery.charges > 0 ? formatPrice(crop.delivery.charges) : 'Free'}
                    </span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-gray-600">Estimated Delivery</span>
                    <span className="font-medium">
                      {crop.delivery.estimatedDays} days
                    </span>
                  </div>
                </>
              )}
            </div>
          </div>

          {/* Order Information */}
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Order Information</h3>
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-gray-600">Minimum Order</span>
                <span className="font-medium">{crop.availability.minimumOrder} {crop.quantity.unit}</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-gray-600">Maximum Order</span>
                <span className="font-medium">
                  {crop.availability.maximumOrder || 'No limit'} {crop.quantity.unit}
                </span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-gray-600">Availability</span>
                <span className={`font-medium capitalize ${
                  crop.availability.status === 'available' ? 'text-green-600' : 'text-red-600'
                }`}>
                  {crop.availability.status}
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CropDetail;
