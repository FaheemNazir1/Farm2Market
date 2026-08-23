import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { useQuery } from 'react-query';
import { useTranslation } from 'react-i18next';
import { ordersAPI } from '../services/api';
import { useAuth } from '../contexts/AuthContext';
import { downloadInvoice } from '../utils/invoiceGenerator';
import { 
  Eye, 
  Download,
  ShoppingBag,
  Package
} from 'lucide-react';
import LoadingSpinner from '../components/UI/LoadingSpinner';
import toast from 'react-hot-toast';

const Orders = () => {
  const { t } = useTranslation();
  const { user, isFarmer } = useAuth();
  const [orderType, setOrderType] = useState('all'); // 'all', 'buying', 'selling'
  const [filters] = useState({
    status: '',
    search: ''
  });
  const [page] = useState(1);

  const queryFilters = {
    ...filters,
    page,
    type: orderType !== 'all' ? orderType : undefined
  };

  const { data: ordersData, isLoading, error } = useQuery(
    ['orders', queryFilters, orderType, page],
    () => ordersAPI.getOrders(queryFilters),
    {
      keepPreviousData: true,
      staleTime: 2 * 60 * 1000,
    }
  );

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
      month: 'short',
      day: 'numeric'
    });
  };

  const getStatusBadge = (status) => {
    switch (status) {
      case 'delivered':
        return { label: t('orders.statusDelivered', 'Delivered'), color: 'text-emerald-700 bg-emerald-100' };
      case 'shipped':
        return { label: t('orders.statusShipped', 'In Transit'), color: 'text-sky-700 bg-sky-100' };
      case 'confirmed':
        return { label: t('orders.statusConfirmed', 'Confirmed'), color: 'text-purple-700 bg-purple-100' };
      case 'cancelled':
        return { label: t('orders.statusCancelled', 'Cancelled'), color: 'text-rose-700 bg-rose-100' };
      case 'pending':
      default:
        return { label: t('orders.statusPending', 'Pending Confirmation'), color: 'text-amber-700 bg-amber-100' };
    }
  };

  const handleDownloadInvoice = (order) => {
    try {
      downloadInvoice(order);
      toast.success('Invoice downloaded successfully');
    } catch (err) {
      toast.error('Failed to generate invoice');
    }
  };

  const orders = ordersData?.orders || [];

  return (
    <div className="min-h-screen bg-slate-50/70 pb-20">
      
      {/* Header */}
      <div className="bg-white border-b border-slate-200/80 sticky top-20 z-30">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-5 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h1 className="text-2xl sm:text-3xl font-black text-slate-900 font-heading">
              {t('orders.title', 'My Orders')}
            </h1>
            <p className="text-xs sm:text-sm text-slate-500 mt-1">
              {t('orders.subtitle', 'Track your produce orders, delivery timelines, and invoices')}
            </p>
          </div>

          {/* If user is Farmer, provide tabs for Purchases vs Sales */}
          {isFarmer && (
            <div className="flex items-center space-x-1.5 bg-slate-100 p-1 rounded-2xl border border-slate-200 self-start sm:self-auto">
              <button
                type="button"
                onClick={() => setOrderType('all')}
                className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all ${
                  orderType === 'all'
                    ? 'bg-white text-slate-900 shadow-sm'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                All Orders
              </button>
              <button
                type="button"
                onClick={() => setOrderType('buying')}
                className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all flex items-center space-x-1 ${
                  orderType === 'buying'
                    ? 'bg-white text-emerald-700 shadow-sm font-extrabold'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                <ShoppingBag className="w-3.5 h-3.5" />
                <span>My Purchases</span>
              </button>
              <button
                type="button"
                onClick={() => setOrderType('selling')}
                className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all flex items-center space-x-1 ${
                  orderType === 'selling'
                    ? 'bg-white text-emerald-700 shadow-sm font-extrabold'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                <Package className="w-3.5 h-3.5" />
                <span>Selling Orders</span>
              </button>
            </div>
          )}
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-8">
        {isLoading ? (
          <div className="flex justify-center py-16">
            <LoadingSpinner size="large" />
          </div>
        ) : error ? (
          <div className="card text-center p-8 max-w-md mx-auto shadow-md">
            <p className="text-slate-600">Failed to load orders. Please try again.</p>
          </div>
        ) : orders.length === 0 ? (
          <div className="card text-center py-16 p-8 bg-white border border-slate-200/80 shadow-md max-w-md mx-auto space-y-4">
            <div className="w-16 h-16 rounded-3xl bg-emerald-50 text-emerald-600 flex items-center justify-center mx-auto text-2xl">
              📦
            </div>
            <h3 className="text-lg font-bold text-slate-900 font-heading">
              {t('orders.noOrders', 'No orders placed yet')}
            </h3>
            <p className="text-xs text-slate-500">
              {t('orders.noOrdersSub', 'Explore the marketplace to discover fresh produce directly from farmers.')}
            </p>
            <Link to="/marketplace" className="btn-primary text-xs py-2.5 px-5 font-bold">
              {t('nav.marketplace', 'Marketplace')}
            </Link>
          </div>
        ) : (
          <div className="space-y-4">
            {orders.map((order) => {
              const statusInfo = getStatusBadge(order.status);
              const isBuyerOrder = order.buyer === user?.id || order.buyer?.id === user?.id;

              return (
                <div key={order._id} className="card p-6 bg-white border border-slate-200/80 shadow-sm hover:shadow-md transition-all space-y-4">
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-4 border-b border-slate-100">
                    <div className="space-y-1">
                      <div className="flex items-center space-x-2">
                        <span className="font-bold text-slate-900 text-sm font-heading">
                          {t('orders.orderNumber', 'Order #')}{order._id.substring(order._id.length - 8).toUpperCase()}
                        </span>
                        <span className={`px-2.5 py-0.5 rounded-full text-[11px] font-bold ${statusInfo.color}`}>
                          {statusInfo.label}
                        </span>
                        {isFarmer && (
                          <span className={`px-2 py-0.5 rounded-md text-[10px] font-bold uppercase tracking-wider ${
                            isBuyerOrder 
                              ? 'bg-blue-50 text-blue-700 border border-blue-200' 
                              : 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                          }`}>
                            {isBuyerOrder ? '🛒 Purchase' : '🌾 Sale'}
                          </span>
                        )}
                      </div>
                      <p className="text-xs text-slate-400">
                        {t('orders.date', 'Date')}: {formatDate(order.createdAt)}
                      </p>
                    </div>

                    <div className="flex items-center space-x-2">
                      <button
                        type="button"
                        onClick={() => handleDownloadInvoice(order)}
                        className="btn-secondary text-xs py-2 px-3 flex items-center space-x-1"
                        title="Download Invoice PDF"
                      >
                        <Download className="w-3.5 h-3.5" />
                        <span>Invoice</span>
                      </button>

                      <Link
                        to={`/orders/${order._id}`}
                        className="btn-primary text-xs py-2 px-3.5 font-bold flex items-center space-x-1"
                      >
                        <Eye className="w-3.5 h-3.5" />
                        <span>{t('orders.viewDetails', 'View Order Details')}</span>
                      </Link>
                    </div>
                  </div>

                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                    <div className="flex items-center space-x-4">
                      {order.items?.[0]?.crop?.images?.[0]?.url && (
                        <img
                          src={order.items[0].crop.images[0].url}
                          alt={order.items[0].crop.name}
                          className="w-14 h-14 rounded-2xl object-cover bg-slate-100 border border-slate-200"
                        />
                      )}
                      <div>
                        <h4 className="font-bold text-slate-900 text-sm">
                          {order.items?.map(i => i.crop?.name || 'Produce').join(', ')}
                        </h4>
                        <p className="text-xs text-slate-500">
                          {order.items?.reduce((sum, item) => sum + item.quantity, 0)} units
                        </p>
                      </div>
                    </div>

                    <div className="sm:text-right">
                      <span className="text-xs text-slate-400 font-medium">{t('orders.totalAmount', 'Total Amount')}</span>
                      <p className="text-xl font-black text-emerald-700 font-heading">
                        {formatPrice(order.totalAmount)}
                      </p>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

    </div>
  );
};

export default Orders;
