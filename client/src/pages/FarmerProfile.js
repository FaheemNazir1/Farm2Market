import React, { useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { useQuery } from 'react-query';
import { useTranslation } from 'react-i18next';
import { usersAPI, cropsAPI } from '../services/api';
import { getFarmerWhatsAppLink } from '../utils/whatsapp';
import { 
  Star, 
  Phone, 
  ArrowLeft,
  MessageCircle,
  Leaf,
  ChevronRight
} from 'lucide-react';
import LoadingSpinner from '../components/UI/LoadingSpinner';

const FarmerProfile = () => {
  const { id } = useParams();
  const { t } = useTranslation();
  const [cropFilters] = useState({
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
    }).format(price || 0);
  };

  const formatDate = (date) => {
    return new Date(date).toLocaleDateString('en-IN', {
      year: 'numeric',
      month: 'long'
    });
  };

  if (userLoading) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center">
        <LoadingSpinner size="large" />
      </div>
    );
  }

  if (userError || !farmer || farmer.userType !== 'farmer') {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center p-4">
        <div className="card text-center max-w-md p-8 shadow-xl">
          <h2 className="text-2xl font-bold text-slate-900 mb-4">Farmer Not Found</h2>
          <p className="text-slate-600 mb-6">The farmer profile you're looking for doesn't exist.</p>
          <Link to="/marketplace" className="btn-primary w-full">
            {t('crop.backToListings', 'Back to Marketplace')}
          </Link>
        </div>
      </div>
    );
  }

  const handleWhatsAppContact = () => {
    const link = getFarmerWhatsAppLink({
      farmerPhone: farmer.phone,
      farmerName: farmer.name,
      cropName: 'Farm Produce'
    });
    window.open(link, '_blank');
  };

  return (
    <div className="min-h-screen bg-slate-50/70 pb-20">
      
      {/* Header */}
      <div className="bg-white border-b border-slate-200/80 sticky top-20 z-30">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-3.5">
          <Link
            to="/marketplace"
            className="inline-flex items-center space-x-2 text-sm font-bold text-slate-600 hover:text-emerald-700 transition-colors"
          >
            <ArrowLeft className="w-4 h-4" />
            <span>{t('crop.backToListings', 'Back to Marketplace')}</span>
          </Link>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-8">
        
        {/* Farmer Main Card */}
        <div className="card p-6 sm:p-8 bg-white border border-slate-200/80 rounded-3xl shadow-md mb-8">
          <div className="flex flex-col md:flex-row items-start space-y-6 md:space-y-0 md:space-x-8">
            <div className="w-28 h-28 sm:w-32 sm:h-32 rounded-3xl bg-gradient-to-br from-emerald-500 to-teal-700 text-white flex items-center justify-center font-black text-4xl shadow-lg flex-shrink-0">
              {farmer.name?.charAt(0) || '👨‍🌾'}
            </div>
            
            <div className="flex-1 space-y-4 w-full">
              <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                <div>
                  <div className="flex items-center space-x-2">
                    <h1 className="text-2xl sm:text-3xl font-black text-slate-900 font-heading">{farmer.name}</h1>
                    <span className="px-2.5 py-0.5 rounded-full text-xs font-bold bg-emerald-100 text-emerald-800">
                      {t('farmerProfile.verified', 'Verified Farmer')}
                    </span>
                  </div>

                  <div className="flex items-center space-x-1.5 mt-1.5">
                    <Star className="w-4 h-4 text-amber-500 fill-current" />
                    <span className="text-sm font-bold text-slate-900">
                      {farmer.rating?.average?.toFixed(1) || '4.8'}
                    </span>
                    <span className="text-xs text-slate-400">
                      ({farmer.rating?.count || 12} reviews)
                    </span>
                  </div>
                </div>
                
                {/* Contact Actions */}
                <div className="flex flex-wrap gap-2.5">
                  <button
                    type="button"
                    onClick={handleWhatsAppContact}
                    className="px-4 py-2.5 rounded-xl bg-[#25D366] hover:bg-[#20bd5a] text-white font-bold text-xs flex items-center space-x-1.5 shadow-md shadow-emerald-600/20 transition-transform transform hover:scale-105"
                  >
                    <MessageCircle className="w-4 h-4 fill-current" />
                    <span>{t('farmerProfile.chatWhatsApp', '📱 Contact on WhatsApp')}</span>
                  </button>

                  <a
                    href={`tel:${farmer.phone || '9876543210'}`}
                    className="btn-secondary flex items-center text-xs py-2.5 px-4"
                  >
                    <Phone className="w-3.5 h-3.5 mr-1.5" />
                    <span>{t('farmerProfile.callFarmer', '📞 Call Farmer')}</span>
                  </a>
                </div>
              </div>

              <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 pt-2 border-t border-slate-100">
                <div className="p-3 bg-slate-50 rounded-2xl">
                  <div className="text-[11px] font-bold text-slate-400 uppercase">Location</div>
                  <div className="text-xs font-bold text-slate-800 mt-0.5">
                    {farmer.address?.city || 'Pune'}, {farmer.address?.state || 'Maharashtra'}
                  </div>
                </div>

                <div className="p-3 bg-slate-50 rounded-2xl">
                  <div className="text-[11px] font-bold text-slate-400 uppercase">{t('farmerProfile.memberSince', 'Member Since')}</div>
                  <div className="text-xs font-bold text-slate-800 mt-0.5">
                    {formatDate(farmer.createdAt || new Date())}
                  </div>
                </div>

                <div className="p-3 bg-slate-50 rounded-2xl">
                  <div className="text-[11px] font-bold text-slate-400 uppercase">{t('farmerProfile.totalCrops', 'Listed Produce')}</div>
                  <div className="text-xs font-bold text-emerald-700 mt-0.5">
                    {crops.length || farmer.stats?.totalCrops || 5} active
                  </div>
                </div>

                <div className="p-3 bg-slate-50 rounded-2xl">
                  <div className="text-[11px] font-bold text-slate-400 uppercase">{t('farmerProfile.completedOrders', 'Completed Orders')}</div>
                  <div className="text-xs font-bold text-slate-800 mt-0.5">
                    {farmer.stats?.totalOrders || 18} orders
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Crops Section */}
        <div className="space-y-6">
          <div className="flex items-center justify-between">
            <h2 className="text-xl font-bold text-slate-900 font-heading">
              {t('farmerProfile.cropsTitle', 'Available Produce from this Farmer')}
            </h2>
            <span className="text-xs font-semibold text-slate-500">
              {crops.length} {t('marketplace.cropsAvailable', 'Crops Available')}
            </span>
          </div>

          {cropsLoading ? (
            <div className="flex justify-center py-12">
              <LoadingSpinner size="large" />
            </div>
          ) : crops.length === 0 ? (
            <div className="card text-center py-12 p-6">
              <p className="text-sm text-slate-500">No active produce listed by this farmer right now.</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {crops.map((crop) => (
                <div key={crop._id} className="card-hover p-0 overflow-hidden bg-white border border-slate-200/80 shadow-md flex flex-col justify-between">
                  <div className="relative h-44 bg-slate-100 overflow-hidden">
                    <img
                      src={crop.images?.[0]?.url || 'https://images.unsplash.com/photo-1592924357228-91a4daadcfea?auto=format&fit=crop&w=600&q=80'}
                      alt={crop.name}
                      className="w-full h-full object-cover"
                    />
                    {crop.quality?.organic && (
                      <span className="absolute top-3 left-3 px-2.5 py-1 rounded-lg text-xs font-bold bg-emerald-700/90 text-white backdrop-blur-md flex items-center space-x-1">
                        <Leaf className="w-3 h-3" />
                        <span>Organic</span>
                      </span>
                    )}
                  </div>

                  <div className="p-4 space-y-3">
                    <div>
                      <h3 className="font-bold text-slate-900 text-base font-heading">{crop.name}</h3>
                      <p className="text-xs text-slate-500 line-clamp-1">{crop.description}</p>
                    </div>

                    <div className="flex items-baseline justify-between pt-2 border-t border-slate-100">
                      <div>
                        <span className="text-xl font-black text-emerald-700 font-heading">
                          {formatPrice(crop.price?.perUnit)}
                        </span>
                        <span className="text-xs text-slate-500 ml-1">/ {crop.quantity?.unit}</span>
                      </div>

                      <Link
                        to={`/crop/${crop._id}`}
                        className="btn-primary text-xs py-1.5 px-3 flex items-center space-x-1"
                      >
                        <span>{t('dashboard.viewDetails', 'View Details')}</span>
                        <ChevronRight className="w-3.5 h-3.5" />
                      </Link>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

      </div>
    </div>
  );
};

export default FarmerProfile;
