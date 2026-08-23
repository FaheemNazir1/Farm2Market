import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { useQuery } from 'react-query';
import { useTranslation } from 'react-i18next';
import { cropsAPI } from '../services/api';
import { useCart } from '../contexts/CartContext';
import { useAuth } from '../contexts/AuthContext';
import { calculateDistance } from '../utils/geolocation';
import { getFarmerWhatsAppLink, getCropShareWhatsAppLink } from '../utils/whatsapp';
import { 
  ArrowLeft, 
  ShoppingCart, 
  Star, 
  MapPin, 
  Leaf,
  User,
  Share2,
  Compass,
  MessageCircle
} from 'lucide-react';
import LoadingSpinner from '../components/UI/LoadingSpinner';
import toast from 'react-hot-toast';

const CropDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { t } = useTranslation();
  const [quantity, setQuantity] = useState(1);
  const [selectedImageIndex, setSelectedImageIndex] = useState(0);
  const [userDistance, setUserDistance] = useState(null);

  const { addToCart, canAddToCart } = useCart();
  const { isAuthenticated, user } = useAuth();

  const { data: cropData, isLoading, error } = useQuery(
    ['crop', id],
    () => cropsAPI.getCrop(id),
    {
      enabled: !!id,
    }
  );

  const crop = cropData?.crop;

  // Optional: check GPS distance if crop has coordinates
  useEffect(() => {
    if (crop?.location?.coordinates?.latitude && crop?.location?.coordinates?.longitude) {
      if (navigator.geolocation) {
        navigator.geolocation.getCurrentPosition(
          (pos) => {
            const dist = calculateDistance(
              pos.coords.latitude,
              pos.coords.longitude,
              crop.location.coordinates.latitude,
              crop.location.coordinates.longitude
            );
            setUserDistance(dist);
          },
          () => {} // Quietly ignore if permission not granted
        );
      }
    }
  }, [crop]);

  if (isLoading) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center">
        <LoadingSpinner size="large" />
      </div>
    );
  }

  if (error || !crop) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center p-4">
        <div className="card text-center max-w-md p-8 shadow-xl">
          <h2 className="text-2xl font-bold text-slate-900 mb-4">Crop Not Found</h2>
          <p className="text-slate-600 mb-6">The crop listing you're looking for doesn't exist or has been removed.</p>
          <button onClick={() => navigate('/marketplace')} className="btn-primary w-full">
            {t('crop.backToListings', 'Back to Listings')}
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
    }).format(price || 0);
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
      navigate('/login');
      return;
    }
    if (crop.farmer?._id === user?.id || crop.farmer === user?.id) {
      toast.error('Cannot add your own produce listing to cart');
      return;
    }
    if (!canAddToCart(crop)) {
      toast.error('Cannot add more items than available');
      return;
    }
    addToCart(crop, quantity);
    toast.success(`Added ${quantity} ${crop.quantity?.unit} of ${crop.name} to cart!`);
  };

  const handleBuyNow = () => {
    handleAddToCart();
    if (canAddToCart(crop)) {
      navigate('/checkout');
    }
  };

  // WhatsApp Farmer Chat Link
  const handleWhatsAppChat = () => {
    const link = getFarmerWhatsAppLink({
      farmerPhone: crop.farmer?.phone,
      farmerName: crop.farmer?.name,
      cropName: crop.name,
      quantity: quantity,
      unit: crop.quantity?.unit || 'kg',
      price: crop.price?.perUnit || 0,
      cropId: crop._id
    });
    window.open(link, '_blank');
  };

  // WhatsApp Share Listing Link
  const handleWhatsAppShare = () => {
    const link = getCropShareWhatsAppLink(crop);
    window.open(link, '_blank');
  };

  const isOwner = crop.farmer?._id === user?.id;
  const availableQuantity = crop.quantity?.value || 0;
  const maxQuantity = Math.min(availableQuantity, crop.availability?.maximumOrder || availableQuantity);

  return (
    <div className="min-h-screen bg-slate-50/70 pb-20">
      
      {/* Top Breadcrumb & Share Header */}
      <div className="bg-white border-b border-slate-200/80 sticky top-20 z-30">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-3.5 flex items-center justify-between">
          <button
            onClick={() => navigate(-1)}
            className="inline-flex items-center space-x-2 text-sm font-bold text-slate-600 hover:text-emerald-700 transition-colors"
          >
            <ArrowLeft className="w-4 h-4" />
            <span>{t('crop.backToListings', 'Back to Listings')}</span>
          </button>

          <div className="flex items-center space-x-2">
            <button
              onClick={handleWhatsAppShare}
              className="inline-flex items-center space-x-1.5 px-3.5 py-2 rounded-xl text-xs font-bold text-white bg-[#25D366] hover:bg-[#20bd5a] shadow-sm transition-all"
              title="Share listing on WhatsApp"
            >
              <Share2 className="w-3.5 h-3.5" />
              <span>{t('crop.shareWhatsApp', 'Share on WhatsApp')}</span>
            </button>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-8">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-10">
          
          {/* Images Section */}
          <div className="space-y-4">
            <div className="card p-0 overflow-hidden bg-slate-100 rounded-3xl border border-slate-200/80 shadow-lg relative aspect-w-16 aspect-h-12 max-h-[420px]">
              <img
                src={crop.images?.[selectedImageIndex]?.url || 'https://images.unsplash.com/photo-1592924357228-91a4daadcfea?auto=format&fit=crop&w=800&q=80'}
                alt={crop.images?.[selectedImageIndex]?.alt || crop.name}
                className="w-full h-full object-cover"
                onError={(e) => {
                  e.target.onerror = null;
                  e.target.src = 'https://images.unsplash.com/photo-1592924357228-91a4daadcfea?auto=format&fit=crop&w=800&q=80';
                }}
              />

              {crop.quality?.organic && (
                <div className="absolute top-4 left-4 px-3 py-1 rounded-xl text-xs font-black bg-emerald-700/90 text-white backdrop-blur-md shadow-md flex items-center space-x-1.5">
                  <Leaf className="w-3.5 h-3.5" />
                  <span>100% Organic Certified</span>
                </div>
              )}

              {userDistance !== null && (
                <div className="absolute bottom-4 left-4 px-3 py-1.5 rounded-xl bg-slate-900/85 text-white text-xs font-bold backdrop-blur-md shadow-md flex items-center space-x-1.5">
                  <Compass className="w-3.5 h-3.5 text-emerald-400" />
                  <span>📍 {userDistance} {t('crop.distanceAway', 'km away from your location')}</span>
                </div>
              )}
            </div>

            {/* Thumbnail Gallery */}
            {crop.images && crop.images.length > 1 && (
              <div className="flex space-x-3 overflow-x-auto pb-1">
                {crop.images.map((image, index) => (
                  <button
                    key={index}
                    onClick={() => setSelectedImageIndex(index)}
                    className={`flex-shrink-0 w-20 h-20 rounded-2xl overflow-hidden border-2 transition-all ${
                      selectedImageIndex === index ? 'border-emerald-600 ring-2 ring-emerald-500/30' : 'border-slate-200'
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

          {/* Product Info Section */}
          <div className="space-y-6">
            
            <div>
              <div className="flex items-center space-x-2 mb-2">
                <span className="px-3 py-1 rounded-full text-xs font-bold bg-emerald-100 text-emerald-800">
                  {crop.category}
                </span>
                {crop.variety && (
                  <span className="px-3 py-1 rounded-full text-xs font-semibold bg-slate-100 text-slate-700">
                    {crop.variety}
                  </span>
                )}
              </div>
              <h1 className="text-3xl sm:text-4xl font-black text-slate-900 font-heading">
                {crop.name}
              </h1>
              <div className="flex items-center space-x-3 text-xs text-slate-500 mt-2">
                <span className="flex items-center space-x-1">
                  <MapPin className="w-3.5 h-3.5 text-emerald-600" />
                  <span>{crop.location?.district || crop.location?.city}, {crop.location?.state}</span>
                </span>
                <span>•</span>
                <span>Pincode: {crop.location?.pincode}</span>
              </div>
            </div>

            {/* Price & Order Card */}
            <div className="card bg-gradient-to-br from-emerald-50/90 to-teal-50/70 border border-emerald-200/80 p-6 rounded-3xl space-y-4">
              <div className="flex items-baseline justify-between">
                <div>
                  <span className="text-3xl sm:text-4xl font-black text-emerald-800 font-heading">
                    {formatPrice(crop.price?.perUnit)}
                  </span>
                  <span className="text-sm font-semibold text-slate-600 ml-1.5">
                    / {crop.quantity?.unit}
                  </span>
                </div>
                <div className="text-right">
                  <div className="text-base font-bold text-slate-900">
                    {crop.quantity?.value} {crop.quantity?.unit}
                  </div>
                  <div className="text-xs text-emerald-700 font-medium">{t('crop.inStock', 'In Stock for Immediate Delivery')}</div>
                </div>
              </div>

              {!isOwner && (
                <div className="space-y-3 pt-2">
                  {/* Quantity Counter */}
                  <div className="flex items-center justify-between bg-white p-3 rounded-2xl border border-emerald-100">
                    <label className="text-xs font-bold text-slate-700 uppercase">
                      {t('crop.selectQuantity', 'Select Quantity')} ({crop.quantity?.unit}):
                    </label>
                    <div className="flex items-center space-x-3">
                      <button
                        onClick={() => setQuantity(Math.max(1, quantity - 1))}
                        disabled={quantity <= 1}
                        className="w-8 h-8 rounded-xl bg-slate-100 text-slate-700 font-bold hover:bg-slate-200 disabled:opacity-40"
                      >
                        -
                      </button>
                      <span className="w-10 text-center font-bold text-slate-900 text-base">
                        {quantity}
                      </span>
                      <button
                        onClick={() => setQuantity(Math.min(maxQuantity, quantity + 1))}
                        disabled={quantity >= maxQuantity}
                        className="w-8 h-8 rounded-xl bg-slate-100 text-slate-700 font-bold hover:bg-slate-200 disabled:opacity-40"
                      >
                        +
                      </button>
                    </div>
                  </div>

                  {/* Primary Order Buttons */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <button
                      onClick={handleAddToCart}
                      disabled={!canAddToCart(crop)}
                      className="btn-secondary py-3 text-sm font-bold justify-center"
                    >
                      <ShoppingCart className="w-4 h-4 mr-2 text-emerald-600" />
                      <span>{t('crop.addToCart', 'Add to Cart')}</span>
                    </button>

                    <button
                      onClick={handleBuyNow}
                      disabled={!canAddToCart(crop)}
                      className="btn-primary py-3 text-sm font-bold justify-center shadow-lg"
                    >
                      <span>{t('crop.buyNow', 'Buy Now')} ({formatPrice((crop.price?.perUnit || 0) * quantity)})</span>
                    </button>
                  </div>

                  {/* WhatsApp Direct Chat Button */}
                  <button
                    type="button"
                    onClick={handleWhatsAppChat}
                    className="w-full py-3.5 px-4 rounded-2xl bg-[#25D366] hover:bg-[#20bd5a] text-white font-bold text-sm shadow-md shadow-emerald-600/20 flex items-center justify-center space-x-2 transition-all transform hover:scale-[1.01]"
                  >
                    <MessageCircle className="w-5 h-5 fill-current" />
                    <span>{t('whatsapp.chatWithFarmer', '📱 Chat with Farmer on WhatsApp')}</span>
                  </button>
                </div>
              )}
            </div>

            {/* Description */}
            <div className="space-y-2">
              <h3 className="text-sm font-bold text-slate-900 uppercase tracking-wider">
                {t('crop.description', 'Produce Description')}
              </h3>
              <p className="text-sm text-slate-600 leading-relaxed bg-white p-4 rounded-2xl border border-slate-200/80">
                {crop.description || 'Fresh produce directly harvested from local agricultural fields.'}
              </p>
            </div>

            {/* Details Grid */}
            <div className="grid grid-cols-2 gap-3 text-xs">
              <div className="p-3.5 bg-white rounded-2xl border border-slate-200/80 space-y-1">
                <span className="text-slate-400 font-medium">{t('crop.harvestDate', 'Harvest Date')}</span>
                <p className="font-bold text-slate-800">{formatDate(crop.harvestDate)}</p>
              </div>

              <div className="p-3.5 bg-white rounded-2xl border border-slate-200/80 space-y-1">
                <span className="text-slate-400 font-medium">{t('crop.expiryDate', 'Best Before')}</span>
                <p className="font-bold text-slate-800">{formatDate(crop.expiryDate)}</p>
              </div>

              <div className="p-3.5 bg-white rounded-2xl border border-slate-200/80 space-y-1">
                <span className="text-slate-400 font-medium">{t('crop.qualityGrade', 'Quality Grade')}</span>
                <p className="font-bold text-slate-800">{crop.quality?.grade || 'Grade A'}</p>
              </div>

              <div className="p-3.5 bg-white rounded-2xl border border-slate-200/80 space-y-1">
                <span className="text-slate-400 font-medium">{t('crop.packaging', 'Packaging')}</span>
                <p className="font-bold text-slate-800">{crop.packaging?.type || 'Standard Crates'}</p>
              </div>
            </div>

          </div>

        </div>

        {/* Farmer Profile Card with Direct WhatsApp Contact */}
        <div className="mt-10 card p-6 sm:p-8 bg-white border border-slate-200/80 rounded-3xl shadow-md">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-6">
            <div className="flex items-start space-x-4">
              <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-emerald-500 to-teal-700 text-white flex items-center justify-center font-black text-2xl shadow-md">
                {crop.farmer?.name?.charAt(0) || '👨‍🌾'}
              </div>
              <div className="space-y-1">
                <div className="flex items-center space-x-2">
                  <h3 className="text-xl font-bold text-slate-900 font-heading">
                    {crop.farmer?.name || 'Verified Farmer'}
                  </h3>
                  <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-100 text-emerald-800">
                    {t('crop.verifiedSeller', 'Verified Seller')}
                  </span>
                </div>
                <p className="text-xs text-slate-500">
                  {crop.farmer?.farmDetails?.farmName || 'Green Field Farm'} • {crop.farmer?.address?.city || 'Pune'}, {crop.farmer?.address?.state || 'Maharashtra'}
                </p>
                <div className="flex items-center space-x-1 text-xs text-amber-500 font-bold pt-1">
                  <Star className="w-4 h-4 fill-current" />
                  <span>{crop.farmer?.rating?.average || '4.8'}</span>
                  <span className="text-slate-400 font-normal">({crop.farmer?.rating?.count || 12} reviews)</span>
                </div>
              </div>
            </div>

            <div className="flex flex-wrap gap-2.5 sm:self-center">
              <button
                type="button"
                onClick={handleWhatsAppChat}
                className="px-4 py-2.5 rounded-xl bg-[#25D366] hover:bg-[#20bd5a] text-white font-bold text-xs flex items-center space-x-1.5 shadow-sm"
              >
                <MessageCircle className="w-4 h-4 fill-current" />
                <span>{t('whatsapp.chatWithFarmer', '📱 Chat with Farmer on WhatsApp')}</span>
              </button>

              <Link
                to={`/farmer/${crop.farmer?._id || crop.farmer}`}
                className="btn-secondary text-xs py-2.5 px-4"
              >
                <User className="w-3.5 h-3.5 mr-1" />
                <span>{t('crop.viewFarmerProfile', 'View Full Profile')}</span>
              </Link>
            </div>
          </div>
        </div>

      </div>

    </div>
  );
};

export default CropDetail;
