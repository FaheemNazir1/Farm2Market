import React from 'react';
import { Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { useCart } from '../contexts/CartContext';
import { 
  ShoppingCart, 
  Trash2, 
  Plus, 
  Minus, 
  ArrowRight
} from 'lucide-react';
import toast from 'react-hot-toast';

const Cart = () => {
  const { t } = useTranslation();
  const { 
    cartItems, 
    removeFromCart, 
    updateQuantity, 
    getCartTotal, 
    getCartItemsByFarmer,
    clearCart 
  } = useCart();

  const formatPrice = (price) => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      maximumFractionDigits: 0
    }).format(price || 0);
  };

  const handleQuantityChange = (cropId, newQuantity) => {
    if (newQuantity <= 0) {
      removeFromCart(cropId);
    } else {
      updateQuantity(cropId, newQuantity);
    }
  };

  const handleRemoveItem = (cropId) => {
    removeFromCart(cropId);
    toast.success('Item removed from cart');
  };

  const handleClearCart = () => {
    clearCart();
    toast.success('Cart cleared');
  };

  const cartItemsByFarmer = getCartItemsByFarmer();

  if (cartItems.length === 0) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center p-4">
        <div className="card text-center max-w-md p-8 shadow-xl space-y-4">
          <div className="w-16 h-16 bg-emerald-50 rounded-2xl flex items-center justify-center mx-auto text-emerald-600">
            <ShoppingCart className="w-8 h-8" />
          </div>
          <h2 className="text-2xl font-black text-slate-900 font-heading">
            {t('cart.emptyTitle', 'Your cart is empty')}
          </h2>
          <p className="text-xs text-slate-500">
            {t('cart.emptySubtitle', 'Explore our fresh agricultural produce marketplace to add items.')}
          </p>
          <Link to="/marketplace" className="btn-primary w-full justify-center py-3 text-sm font-bold">
            {t('cart.exploreMarketplace', 'Browse Marketplace')}
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50/70 pb-20">
      
      {/* Header */}
      <div className="bg-white border-b border-slate-200/80 sticky top-20 z-30">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-5 flex items-center justify-between">
          <div>
            <h1 className="text-2xl sm:text-3xl font-black text-slate-900 font-heading">
              {t('cart.title', 'Shopping Cart')}
            </h1>
            <p className="text-xs text-slate-500 mt-0.5">
              {cartItems.length} {t('cart.item', 'Product')}(s)
            </p>
          </div>

          <button
            onClick={handleClearCart}
            className="text-xs font-bold text-rose-600 hover:text-rose-700 flex items-center space-x-1"
          >
            <Trash2 className="w-3.5 h-3.5" />
            <span>{t('cart.clearCart', 'Clear Cart')}</span>
          </button>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-8">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
          
          {/* Cart Items List */}
          <div className="lg:col-span-8 space-y-6">
            {cartItemsByFarmer.map(({ farmerId, farmer, farmerName, items }) => (
              <div key={farmerId} className="card p-6 bg-white border border-slate-200/80 shadow-sm space-y-4">
                <div className="text-xs font-bold text-emerald-800 uppercase tracking-wider pb-2 border-b border-slate-100 flex items-center space-x-1.5">
                  <span>🌾</span>
                  <span>{farmerName || farmer?.name || 'Verified Farmer'}</span>
                </div>

                <div className="divide-y divide-slate-100">
                  {items.map((item) => (
                    <div key={item.crop._id} className="py-4 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                      <div className="flex items-center space-x-4">
                        <img
                          src={item.crop.images?.[0]?.url || 'https://images.unsplash.com/photo-1592924357228-91a4daadcfea?w=200&auto=format&fit=crop&q=80'}
                          alt={item.crop.name}
                          className="w-16 h-16 rounded-2xl object-cover bg-slate-100 border border-slate-200"
                        />
                        <div>
                          <h4 className="font-bold text-slate-900 text-sm font-heading">{item.crop.name}</h4>
                          <p className="text-xs text-emerald-700 font-bold">
                            {formatPrice(item.crop.price?.perUnit)} / {item.crop.quantity?.unit}
                          </p>
                        </div>
                      </div>

                      <div className="flex items-center justify-between sm:justify-end space-x-4">
                        <div className="flex items-center space-x-2 bg-slate-50 p-1.5 rounded-xl border border-slate-200">
                          <button
                            onClick={() => handleQuantityChange(item.crop._id, item.quantity - 1)}
                            className="w-7 h-7 rounded-lg bg-white text-slate-700 font-bold hover:bg-slate-100 flex items-center justify-center"
                          >
                            <Minus className="w-3 h-3" />
                          </button>
                          <span className="w-8 text-center text-xs font-bold text-slate-900">{item.quantity}</span>
                          <button
                            onClick={() => handleQuantityChange(item.crop._id, item.quantity + 1)}
                            className="w-7 h-7 rounded-lg bg-white text-slate-700 font-bold hover:bg-slate-100 flex items-center justify-center"
                          >
                            <Plus className="w-3 h-3" />
                          </button>
                        </div>

                        <div className="text-right min-w-[80px]">
                          <p className="font-black text-slate-900 text-sm">
                            {formatPrice((item.crop.price?.perUnit || 0) * item.quantity)}
                          </p>
                        </div>

                        <button
                          onClick={() => handleRemoveItem(item.crop._id)}
                          className="p-2 text-slate-400 hover:text-rose-600 rounded-lg hover:bg-rose-50 transition-colors"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>

          {/* Order Summary */}
          <div className="lg:col-span-4">
            <div className="card p-6 bg-white border border-slate-200/80 shadow-md space-y-4 sticky top-36">
              <h3 className="text-base font-bold text-slate-900 uppercase tracking-wider font-heading pb-2 border-b border-slate-100">
                {t('cart.orderSummary', 'Order Summary')}
              </h3>

              <div className="space-y-2.5 text-xs">
                <div className="flex justify-between text-slate-600">
                  <span>{t('cart.subtotal', 'Items Subtotal')}</span>
                  <span className="font-bold text-slate-900">{formatPrice(getCartTotal())}</span>
                </div>
                <div className="flex justify-between text-slate-600">
                  <span>{t('cart.shipping', 'Estimated Delivery')}</span>
                  <span className="text-emerald-700 font-bold">{t('cart.freeShipping', 'Calculated at checkout')}</span>
                </div>
              </div>

              <div className="pt-3 border-t border-slate-100 flex justify-between items-baseline">
                <span className="text-sm font-bold text-slate-900">{t('cart.grandTotal', 'Grand Total')}</span>
                <span className="text-2xl font-black text-emerald-800 font-heading">{formatPrice(getCartTotal())}</span>
              </div>

              <Link
                to="/checkout"
                className="w-full btn-primary py-3.5 text-sm font-bold justify-center shadow-lg flex items-center space-x-2"
              >
                <span>{t('cart.proceedToCheckout', 'Proceed to Checkout')}</span>
                <ArrowRight className="w-4 h-4" />
              </Link>
            </div>
          </div>

        </div>
      </div>

    </div>
  );
};

export default Cart;
