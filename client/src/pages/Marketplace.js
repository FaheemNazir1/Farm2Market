import React, { useState, useEffect } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import { useQuery } from 'react-query';
import { useTranslation } from 'react-i18next';
import { cropsAPI } from '../services/api';
import { useCart } from '../contexts/CartContext';
import { useAuth } from '../contexts/AuthContext';
import { getCurrentGPSLocation, reverseGeocode } from '../utils/geolocation';
import { getCropShareWhatsAppLink } from '../utils/whatsapp';
import { ScrollReveal } from '../components/UI/ScrollReveal';
import CropsMapView from '../components/CropsMapView';
import { 
  Search, 
  Filter, 
  ShoppingCart, 
  MapPin, 
  Leaf,
  Sparkles,
  RotateCcw,
  SlidersHorizontal,
  ChevronRight,
  Compass,
  Map,
  Share2
} from 'lucide-react';
import LoadingSpinner from '../components/UI/LoadingSpinner';
import toast from 'react-hot-toast';

const Marketplace = () => {
  const { t } = useTranslation();
  const [searchParams] = useSearchParams();
  
  const [searchTerm, setSearchTerm] = useState(searchParams.get('search') || '');
  const [filters, setFilters] = useState({
    category: searchParams.get('category') || '',
    state: '',
    minPrice: '',
    maxPrice: '',
    organic: false,
    sortBy: 'createdAt',
    sortOrder: 'desc',
    latitude: null,
    longitude: null,
    radius: '50' // Default 50 km when GPS is active
  });

  const [showFilters, setShowFilters] = useState(false);
  const [page, setPage] = useState(1);
  const [userLocation, setUserLocation] = useState(null);
  const [isDetectingLocation, setIsDetectingLocation] = useState(false);
  const [showMapModal, setShowMapModal] = useState(false);

  const { addToCart, canAddToCart } = useCart();
  const { isAuthenticated, user } = useAuth();

  // If URL query has search or category, sync state
  useEffect(() => {
    if (searchParams.get('category')) {
      setFilters(prev => ({ ...prev, category: searchParams.get('category') }));
    }
    if (searchParams.get('search')) {
      setSearchTerm(searchParams.get('search'));
    }
    if (searchParams.get('nearMe') === 'true') {
      handleDetectLocation();
    }
  }, [searchParams]);

  const { data: cropsData, isLoading, error } = useQuery(
    ['crops', { ...filters, search: searchTerm, page }],
    () => cropsAPI.getCrops({ ...filters, search: searchTerm, page }),
    {
      keepPreviousData: true,
      staleTime: 5 * 60 * 1000,
    }
  );

  const categories = [
    { name: 'All', value: '', icon: '🌾' },
    { name: 'Vegetables', value: 'Vegetables', icon: '🥦' },
    { name: 'Cereals', value: 'Cereals', icon: '🌾' },
    { name: 'Fruits', value: 'Fruits', icon: '🍎' },
    { name: 'Pulses', value: 'Pulses', icon: '🫘' },
    { name: 'Spices', value: 'Spices', icon: '🌶️' },
    { name: 'Oilseeds', value: 'Oilseeds', icon: '🌻' },
  ];

  const states = [
    'All States', 'Andhra Pradesh', 'Assam', 'Bihar', 'Delhi', 'Gujarat', 
    'Haryana', 'Karnataka', 'Madhya Pradesh', 'Maharashtra', 'Punjab', 
    'Rajasthan', 'Tamil Nadu', 'Uttar Pradesh', 'West Bengal'
  ];

  const handleFilterChange = (key, value) => {
    setFilters(prev => ({ ...prev, [key]: value }));
    setPage(1);
  };

  const handleSearch = (e) => {
    e.preventDefault();
    setPage(1);
  };

  // User-initiated GPS Location detection
  const handleDetectLocation = async () => {
    setIsDetectingLocation(true);
    try {
      const position = await getCurrentGPSLocation();
      setUserLocation(position);

      const address = await reverseGeocode(position.latitude, position.longitude);
      setUserLocation(prev => ({ ...prev, ...address }));

      setFilters(prev => ({
        ...prev,
        latitude: position.latitude,
        longitude: position.longitude,
        sortBy: 'distance'
      }));
      toast.success(`Location detected: ${address.district || address.city}, ${address.state}`);
    } catch (err) {
      console.warn('GPS location request:', err.message);
      toast.error(err.message || 'Unable to retrieve your current location');
    } finally {
      setIsDetectingLocation(false);
    }
  };

  const handleClearLocation = () => {
    setUserLocation(null);
    setFilters(prev => ({
      ...prev,
      latitude: null,
      longitude: null,
      sortBy: 'createdAt'
    }));
    toast('Location filter removed', { icon: '📍' });
  };

  const handleAddToCart = (crop) => {
    if (!isAuthenticated) {
      toast.error('Please login to add items to cart');
      return;
    }
    if (user && (crop.farmer === user.id || crop.farmer?._id === user.id)) {
      toast.error('You cannot add your own crop listing to cart');
      return;
    }
    if (!canAddToCart(crop)) {
      toast.error('Cannot add more items than available');
      return;
    }
    addToCart(crop, 1);
    toast.success(`Added ${crop.name} to cart!`);
  };

  const handleShareWhatsApp = (crop, e) => {
    if (e) {
      e.preventDefault();
      e.stopPropagation();
    }
    const link = getCropShareWhatsAppLink(crop);
    window.open(link, '_blank');
  };

  const formatPrice = (price) => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      maximumFractionDigits: 0
    }).format(price || 0);
  };

  if (error) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center p-4">
        <div className="card text-center max-w-md p-8 shadow-xl">
          <div className="w-16 h-16 rounded-full bg-rose-100 text-rose-600 flex items-center justify-center mx-auto mb-4 font-bold text-2xl">
            !
          </div>
          <h2 className="text-2xl font-bold text-slate-900 mb-2">Error Loading Produce</h2>
          <p className="text-slate-600 text-sm mb-6">Unable to retrieve crop listings from server.</p>
          <button onClick={() => window.location.reload()} className="btn-primary w-full">
            Retry Connection
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50/70 pb-20">
      
      {/* Header Banner */}
      <section className="bg-gradient-to-r from-emerald-900 via-emerald-800 to-teal-950 text-white py-12 relative overflow-hidden">
        <div className="absolute inset-0 bg-grid-pattern opacity-20"></div>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10 space-y-4">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
            <div className="space-y-2">
              <span className="inline-flex items-center space-x-1.5 px-3 py-1 rounded-full text-xs font-bold bg-emerald-500/20 text-emerald-300 border border-emerald-400/30">
                <Sparkles className="w-3.5 h-3.5" />
                <span>Live Produce Catalog</span>
              </span>
              <h1 className="text-3xl sm:text-4xl font-black font-heading tracking-tight">
                {t('marketplace.title', 'Fresh Produce Marketplace')}
              </h1>
              <p className="text-emerald-100/80 text-sm sm:text-base max-w-2xl">
                {t('marketplace.subtitle', 'Browse freshly harvested crops directly from verified Indian farmers.')}
              </p>
            </div>

            {/* Quick Search & Actions */}
            <div className="flex flex-col sm:flex-row items-center gap-3">
              <form onSubmit={handleSearch} className="w-full sm:w-72 relative">
                <input
                  type="text"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  placeholder={t('marketplace.search', 'Search crops, farmers...')}
                  className="w-full pl-10 pr-4 py-3 bg-white/10 backdrop-blur-md border border-white/20 rounded-2xl text-white placeholder-emerald-200/60 focus:outline-none focus:ring-2 focus:ring-emerald-400 text-sm shadow-inner"
                />
                <Search className="absolute left-3.5 top-1/2 transform -translate-y-1/2 w-4 h-4 text-emerald-300" />
              </form>

              {/* Map View Toggle Button */}
              <button
                type="button"
                onClick={() => setShowMapModal(true)}
                className="w-full sm:w-auto px-4 py-3 bg-emerald-700/80 hover:bg-emerald-600/90 text-white rounded-2xl font-bold text-sm border border-emerald-500/40 shadow-md flex items-center justify-center space-x-2 transition-colors"
                title="View on Map"
              >
                <Map className="w-4 h-4" />
                <span>{t('marketplace.mapView', 'Map View')}</span>
              </button>
            </div>
          </div>

          {/* Quick Category Chips */}
          <div className="flex items-center space-x-2 overflow-x-auto pt-4 pb-1 scrollbar-hide">
            {categories.map((cat) => {
              const isSelected = filters.category === cat.value;
              return (
                <button
                  key={cat.name}
                  onClick={() => handleFilterChange('category', cat.value)}
                  className={`flex-shrink-0 inline-flex items-center space-x-1.5 px-4 py-2 rounded-xl text-xs font-bold transition-all duration-200 ${
                    isSelected
                      ? 'bg-amber-400 text-slate-900 shadow-md shadow-amber-400/20 scale-105'
                      : 'bg-white/10 hover:bg-white/20 text-white border border-white/10'
                  }`}
                >
                  <span>{cat.icon}</span>
                  <span>{cat.name}</span>
                </button>
              );
            })}
          </div>
        </div>
      </section>

      {/* Main Content Area */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-8">
        
        <div className="flex flex-col lg:flex-row gap-8">
          
          {/* Filters Sidebar */}
          <aside className="lg:w-72 flex-shrink-0">
            <div className="card sticky top-24 space-y-6">
              
              <div className="flex items-center justify-between pb-4 border-b border-slate-100">
                <div className="flex items-center space-x-2">
                  <SlidersHorizontal className="w-5 h-5 text-emerald-600" />
                  <h3 className="font-bold text-slate-900 font-heading text-lg">
                    {t('marketplace.filters', 'Filter Listings')}
                  </h3>
                </div>
                <button
                  onClick={() => setShowFilters(!showFilters)}
                  className="lg:hidden p-2 text-slate-500 hover:text-slate-800"
                >
                  <Filter className="w-5 h-5" />
                </button>
              </div>

              <div className={`space-y-6 ${showFilters ? 'block' : 'hidden lg:block'}`}>
                
                {/* GPS / Geolocation "Near Me" Filter */}
                <div className="p-4 bg-emerald-50/80 border border-emerald-200/80 rounded-2xl space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-black text-emerald-900 uppercase tracking-wider flex items-center space-x-1.5">
                      <Compass className="w-4 h-4 text-emerald-700" />
                      <span>{t('marketplace.nearMe', 'GPS Near Me')}</span>
                    </span>
                    {userLocation && (
                      <button
                        onClick={handleClearLocation}
                        className="text-[10px] font-bold text-rose-600 hover:underline"
                      >
                        Clear GPS
                      </button>
                    )}
                  </div>

                  {userLocation ? (
                    <div className="space-y-2">
                      <div className="p-2 bg-white rounded-xl border border-emerald-200 text-xs text-slate-700">
                        <p className="font-bold text-emerald-800">
                          📍 {userLocation.district || userLocation.city || 'Nearby'}, {userLocation.state || ''}
                        </p>
                        <p className="text-[10px] text-slate-500 mt-0.5">Sorted by nearest distance</p>
                      </div>

                      <div>
                        <label className="block text-[10px] font-bold text-slate-600 uppercase mb-1">
                          {t('marketplace.distance', 'Radius')}
                        </label>
                        <select
                          value={filters.radius}
                          onChange={(e) => handleFilterChange('radius', e.target.value)}
                          className="input-field text-xs py-1.5"
                        >
                          <option value="25">{t('marketplace.within25', 'Within 25 km')}</option>
                          <option value="50">{t('marketplace.within50', 'Within 50 km')}</option>
                          <option value="100">{t('marketplace.within100', 'Within 100 km')}</option>
                          <option value="all">{t('marketplace.allIndia', 'All India')}</option>
                        </select>
                      </div>
                    </div>
                  ) : (
                    <button
                      type="button"
                      onClick={handleDetectLocation}
                      disabled={isDetectingLocation}
                      className="w-full btn-primary text-xs py-2.5 justify-center shadow-sm"
                    >
                      {isDetectingLocation ? (
                        <>
                          <LoadingSpinner size="small" />
                          <span className="ml-1.5">Detecting GPS...</span>
                        </>
                      ) : (
                        <>
                          <MapPin className="w-3.5 h-3.5 mr-1" />
                          <span>Find Crops Near Me</span>
                        </>
                      )}
                    </button>
                  )}
                </div>

                {/* State Location */}
                <div>
                  <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-2">
                    {t('marketplace.location', 'Region / State')}
                  </label>
                  <select
                    value={filters.state}
                    onChange={(e) => handleFilterChange('state', e.target.value === 'All States' ? '' : e.target.value)}
                    className="input-field text-sm"
                  >
                    {states.map(state => (
                      <option key={state} value={state === 'All States' ? '' : state}>{state}</option>
                    ))}
                  </select>
                </div>

                {/* Price Range */}
                <div>
                  <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-2">
                    {t('marketplace.priceRange', 'Price Range (₹/unit)')}
                  </label>
                  <div className="grid grid-cols-2 gap-2">
                    <input
                      type="number"
                      value={filters.minPrice}
                      onChange={(e) => handleFilterChange('minPrice', e.target.value)}
                      className="input-field text-sm"
                      placeholder="Min ₹"
                    />
                    <input
                      type="number"
                      value={filters.maxPrice}
                      onChange={(e) => handleFilterChange('maxPrice', e.target.value)}
                      className="input-field text-sm"
                      placeholder="Max ₹"
                    />
                  </div>
                </div>

                {/* Organic Checkbox */}
                <div className="p-3 bg-emerald-50/70 border border-emerald-100 rounded-xl">
                  <label className="flex items-center space-x-2.5 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={filters.organic}
                      onChange={(e) => handleFilterChange('organic', e.target.checked)}
                      className="w-4 h-4 text-emerald-600 rounded border-slate-300 focus:ring-emerald-500"
                    />
                    <div className="flex items-center space-x-1 text-sm font-semibold text-emerald-900">
                      <Leaf className="w-4 h-4 text-emerald-600" />
                      <span>{t('marketplace.organic', 'Certified Organic Only')}</span>
                    </div>
                  </label>
                </div>

                {/* Sorting */}
                <div>
                  <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-2">
                    {t('marketplace.sortBy', 'Sort Order')}
                  </label>
                  <select
                    value={filters.sortBy === 'distance' ? 'distance' : `${filters.sortBy}-${filters.sortOrder}`}
                    onChange={(e) => {
                      if (e.target.value === 'distance') {
                        handleFilterChange('sortBy', 'distance');
                      } else {
                        const [sortBy, sortOrder] = e.target.value.split('-');
                        handleFilterChange('sortBy', sortBy);
                        handleFilterChange('sortOrder', sortOrder);
                      }
                    }}
                    className="input-field text-sm"
                  >
                    {userLocation && <option value="distance">📍 Nearest Distance (GPS)</option>}
                    <option value="createdAt-desc">{t('marketplace.newest', 'Newest Listings First')}</option>
                    <option value="price.perUnit-asc">{t('marketplace.priceLow', 'Price: Low to High')}</option>
                    <option value="price.perUnit-desc">{t('marketplace.priceHigh', 'Price: High to Low')}</option>
                    <option value="views-desc">Most Viewed</option>
                  </select>
                </div>

                {/* Reset Filters */}
                <button
                  onClick={() => {
                    setFilters({
                      category: '',
                      state: '',
                      minPrice: '',
                      maxPrice: '',
                      organic: false,
                      sortBy: 'createdAt',
                      sortOrder: 'desc',
                      latitude: null,
                      longitude: null,
                      radius: '50'
                    });
                    setUserLocation(null);
                    setSearchTerm('');
                    setPage(1);
                  }}
                  className="w-full btn-secondary text-xs py-2.5 flex items-center justify-center space-x-1.5"
                >
                  <RotateCcw className="w-3.5 h-3.5 text-slate-500" />
                  <span>Reset All Filters</span>
                </button>

              </div>

            </div>
          </aside>

          {/* Listings Grid */}
          <main className="flex-1">
            
            {/* Results Header */}
            <div className="flex flex-wrap items-center justify-between gap-3 mb-6 bg-white p-4 rounded-2xl border border-slate-200/80 shadow-sm">
              <div>
                <p className="text-sm font-bold text-slate-900">
                  {cropsData?.pagination?.total || cropsData?.crops?.length || 0} Crops Available
                </p>
                <p className="text-xs text-slate-500">
                  {userLocation 
                    ? `Showing produce near ${userLocation.district || 'your location'} (Within ${filters.radius === 'all' ? 'All India' : `${filters.radius} km`})`
                    : 'Showing verified direct farm listings'
                  }
                </p>
              </div>

              <div className="flex items-center space-x-2">
                <button
                  onClick={() => setShowMapModal(true)}
                  className="btn-secondary text-xs py-1.5 px-3 flex items-center space-x-1"
                >
                  <Map className="w-3.5 h-3.5 text-emerald-600" />
                  <span>{t('marketplace.mapView', 'Map View')}</span>
                </button>

                {filters.organic && (
                  <span className="px-2.5 py-1 rounded-full text-xs font-bold bg-emerald-100 text-emerald-800 flex items-center space-x-1">
                    <Leaf className="w-3 h-3" />
                    <span>Organic</span>
                  </span>
                )}
              </div>
            </div>

            {/* Loading Skeleton or Cards */}
            {isLoading ? (
              <div className="flex justify-center py-20">
                <LoadingSpinner size="large" />
              </div>
            ) : cropsData?.crops?.length === 0 ? (
              <div className="card text-center py-16 px-4 space-y-4">
                <div className="w-16 h-16 rounded-3xl bg-amber-100 text-amber-700 flex items-center justify-center mx-auto text-2xl font-bold">
                  🌾
                </div>
                <h3 className="text-xl font-bold text-slate-900 font-heading">
                  {t('marketplace.noResults', 'No crops found matching criteria')}
                </h3>
                <p className="text-sm text-slate-500 max-w-md mx-auto">
                  Try adjusting your distance radius, removing filters, or searching for other fresh produce varieties.
                </p>
                <button
                  onClick={() => {
                    handleClearLocation();
                    setFilters(prev => ({ ...prev, category: '', state: '', minPrice: '', maxPrice: '', organic: false }));
                  }}
                  className="btn-secondary text-xs py-2 px-4 inline-flex items-center space-x-1.5"
                >
                  <RotateCcw className="w-3.5 h-3.5" />
                  <span>Clear All Filters</span>
                </button>
              </div>
            ) : (
              <>
                {/* Cards Grid */}
                <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
                  {cropsData?.crops?.map((crop, index) => (
                    <ScrollReveal key={crop._id} animation="fade-up" delay={index * 50}>
                      <div className="card-hover p-0 overflow-hidden bg-white flex flex-col justify-between h-full group border border-slate-200/80 shadow-md">
                        
                        {/* Image Header with Badges */}
                        <div className="relative h-48 bg-slate-100 overflow-hidden">
                          <img
                            src={crop.images?.[0]?.url || 'https://images.unsplash.com/photo-1592924357228-91a4daadcfea?auto=format&fit=crop&w=600&q=80'}
                            alt={crop.name}
                            className="w-full h-full object-cover transform group-hover:scale-105 transition-transform duration-500"
                            onError={(e) => {
                              e.target.onerror = null;
                              e.target.src = 'https://images.unsplash.com/photo-1592924357228-91a4daadcfea?auto=format&fit=crop&w=600&q=80';
                            }}
                          />
                          
                          {/* Quality Badge */}
                          <div className="absolute top-3 left-3 flex flex-col gap-1">
                            {crop.quality?.organic && (
                              <span className="px-2.5 py-1 rounded-lg text-xs font-bold bg-emerald-700/90 text-white backdrop-blur-md shadow-md flex items-center space-x-1">
                                <Leaf className="w-3 h-3" />
                                <span>Organic</span>
                              </span>
                            )}
                          </div>

                          {/* Quick WhatsApp Share Icon */}
                          <button
                            type="button"
                            onClick={(e) => handleShareWhatsApp(crop, e)}
                            className="absolute top-3 right-3 w-8 h-8 rounded-full bg-white/90 text-emerald-600 hover:bg-emerald-600 hover:text-white shadow-md flex items-center justify-center transition-colors"
                            title="Share on WhatsApp"
                          >
                            <Share2 className="w-4 h-4" />
                          </button>

                          {/* Distance or Location Badge */}
                          <div className="absolute bottom-3 left-3 px-2.5 py-1 rounded-lg bg-slate-900/80 text-white text-[11px] font-semibold backdrop-blur-md flex items-center space-x-1">
                            <MapPin className="w-3 h-3 text-emerald-400" />
                            {crop.distance !== undefined && crop.distance !== null ? (
                              <span className="font-bold text-emerald-300">{crop.distance} km away</span>
                            ) : (
                              <span>{crop.location?.district || crop.location?.state}, {crop.location?.state}</span>
                            )}
                          </div>

                          {/* Quantity Available */}
                          <div className="absolute bottom-3 right-3 px-2.5 py-1 rounded-lg bg-white/95 text-slate-900 text-xs font-black shadow-md border border-slate-200">
                            {crop.quantity?.value} {crop.quantity?.unit}
                          </div>
                        </div>

                        {/* Card Body */}
                        <div className="p-5 flex-1 flex flex-col justify-between space-y-4">
                          
                          <div>
                            <div className="flex justify-between items-start mb-1">
                              <h3 className="font-bold text-slate-900 text-lg font-heading group-hover:text-emerald-700 transition-colors line-clamp-1">
                                {crop.name}
                              </h3>
                            </div>

                            <p className="text-xs text-slate-600 line-clamp-2 mb-3">
                              {crop.description}
                            </p>

                            {/* Location & Farmer Info */}
                            <div className="flex items-center justify-between text-xs text-slate-500 py-2 border-y border-slate-100">
                              <div className="flex items-center space-x-1 text-slate-600">
                                <span>📍 {crop.location?.district || 'Farm Location'}</span>
                              </div>
                              <div className="flex items-center space-x-1 font-semibold text-slate-700">
                                <span>👨‍🌾 {crop.farmer?.name || 'Local Farmer'}</span>
                              </div>
                            </div>
                          </div>

                          {/* Price and Cart Buttons */}
                          <div className="pt-2">
                            <div className="flex items-baseline justify-between mb-3">
                              <div>
                                <span className="text-2xl font-black text-emerald-700 font-heading">
                                  {formatPrice(crop.price?.perUnit)}
                                </span>
                                <span className="text-xs font-medium text-slate-500 ml-1">
                                  / {crop.quantity?.unit}
                                </span>
                              </div>
                            </div>

                            <div className="grid grid-cols-2 gap-2">
                              <Link
                                to={`/crop/${crop._id}`}
                                className="btn-secondary text-xs py-2 justify-center font-bold"
                              >
                                <span>Details</span>
                                <ChevronRight className="w-3.5 h-3.5 ml-0.5" />
                              </Link>

                                <button
                                  onClick={() => handleAddToCart(crop)}
                                  disabled={!canAddToCart(crop)}
                                  className="btn-primary text-xs py-2 justify-center font-bold disabled:opacity-50"
                                >
                                  <ShoppingCart className="w-3.5 h-3.5 mr-1" />
                                  <span>{t('crop.addToCart', 'Add')}</span>
                                </button>
                              </div>
                            </div>

                        </div>

                      </div>
                    </ScrollReveal>
                  ))}
                </div>
              </>
            )}

          </main>

        </div>

      </div>

      {/* Interactive OpenStreetMap Modal */}
      {showMapModal && (
        <CropsMapView
          crops={cropsData?.crops || []}
          userLocation={userLocation}
          onClose={() => setShowMapModal(false)}
        />
      )}

    </div>
  );
};

export default Marketplace;
