import React from 'react';
import { Link } from 'react-router-dom';
import { useCart } from '../contexts/CartContext';
import { useAuth } from '../contexts/AuthContext';
import { 
  ShoppingCart, 
  Trash2, 
  Plus, 
  Minus, 
  ArrowRight,
  Package,
  Heart
} from 'lucide-react';
import toast from 'react-hot-toast';

const Cart = () => {
  const { 
    cartItems, 
    removeFromCart, 
    updateQuantity, 
    getCartTotal, 
    getCartItemsByFarmer,
    clearCart 
  } = useCart();
  const { isBuyer } = useAuth();

  const formatPrice = (price) => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      maximumFractionDigits: 0
    }).format(price);
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

  if (!isBuyer) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-gray-900 mb-4">Access Denied</h2>
          <p className="text-gray-600 mb-4">Only buyers can access the cart.</p>
          <Link to="/marketplace" className="btn-primary">
            Browse Marketplace
          </Link>
        </div>
      </div>
    );
  }

  if (cartItems.length === 0) {
    return (
      <div className="min-h-screen bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
          <div className="text-center py-20">
            <div className="w-24 h-24 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-6">
              <ShoppingCart className="w-12 h-12 text-gray-400" />
            </div>
            <h2 className="text-3xl font-bold text-gray-900 mb-4">Your cart is empty</h2>
            <p className="text-xl text-gray-600 mb-8">
              Looks like you haven't added any crops to your cart yet.
            </p>
            <Link to="/marketplace" className="btn-primary text-lg px-8 py-3">
              Start Shopping
            </Link>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-bold text-gray-900">Shopping Cart</h1>
              <p className="text-gray-600">
                {cartItems.length} item{cartItems.length !== 1 ? 's' : ''} in your cart
              </p>
            </div>
            <button
              onClick={handleClearCart}
              className="text-red-600 hover:text-red-700 font-medium flex items-center"
            >
              <Trash2 className="w-5 h-5 mr-2" />
              Clear Cart
            </button>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Cart Items */}
          <div className="lg:col-span-2 space-y-6">
            {cartItemsByFarmer.map((farmerGroup, farmerIndex) => (
              <div key={farmerIndex} className="bg-white rounded-lg shadow-sm border border-gray-200">
                {/* Farmer Header */}
                <div className="p-4 border-b border-gray-200 bg-gray-50">
                  <div className="flex items-center space-x-3">
                    <div className="w-10 h-10 bg-primary-100 rounded-full flex items-center justify-center">
                      <span className="text-primary-600 font-semibold">
                        {farmerGroup.farmer.name?.charAt(0)}
                      </span>
                    </div>
                    <div>
                      <h3 className="font-semibold text-gray-900">{farmerGroup.farmer.name}</h3>
                      <p className="text-sm text-gray-600">Farmer • {farmerGroup.items.length} item{farmerGroup.items.length !== 1 ? 's' : ''}</p>
                    </div>
                  </div>
                </div>

                {/* Items from this farmer */}
                <div className="divide-y divide-gray-200">
                  {farmerGroup.items.map((item) => (
                    <div key={item.crop._id} className="p-6">
                      <div className="flex items-start space-x-4">
                        {/* Product Image */}
                        <div className="w-20 h-20 bg-gray-200 rounded-lg overflow-hidden flex-shrink-0">
                          {item.crop.images && item.crop.images.length > 0 ? (
                            <img
                              src={item.crop.images[0].url}
                              alt={item.crop.name}
                              className="w-full h-full object-cover"
                            />
                          ) : (
                            <div className="w-full h-full flex items-center justify-center">
                              <Package className="w-8 h-8 text-gray-400" />
                            </div>
                          )}
                        </div>

                        {/* Product Info */}
                        <div className="flex-1 min-w-0">
                          <div className="flex items-start justify-between">
                            <div className="flex-1">
                              <Link
                                to={`/crop/${item.crop._id}`}
                                className="text-lg font-semibold text-gray-900 hover:text-primary-600 transition-colors"
                              >
                                {item.crop.name}
                              </Link>
                              <p className="text-sm text-gray-600 mt-1 line-clamp-2">
                                {item.crop.description}
                              </p>
                              <div className="flex items-center space-x-4 mt-2 text-sm text-gray-500">
                                <span>{item.crop.variety}</span>
                                <span>•</span>
                                <span>{item.crop.location.state}</span>
                              </div>
                            </div>
                            <button
                              onClick={() => handleRemoveItem(item.crop._id)}
                              className="text-gray-400 hover:text-red-500 transition-colors ml-4"
                            >
                              <Trash2 className="w-5 h-5" />
                            </button>
                          </div>

                          {/* Price and Quantity */}
                          <div className="flex items-center justify-between mt-4">
                            <div className="flex items-center space-x-4">
                              <div>
                                <div className="text-lg font-bold text-primary-600">
                                  {formatPrice(item.crop.price.perUnit)}
                                </div>
                                <div className="text-sm text-gray-500">
                                  per {item.crop.quantity.unit}
                                </div>
                              </div>
                            </div>

                            {/* Quantity Controls */}
                            <div className="flex items-center space-x-3">
                              <button
                                onClick={() => handleQuantityChange(item.crop._id, item.quantity - 1)}
                                className="w-8 h-8 rounded-full border border-gray-300 flex items-center justify-center hover:bg-gray-50 transition-colors"
                              >
                                <Minus className="w-4 h-4" />
                              </button>
                              <span className="w-12 text-center font-medium">
                                {item.quantity}
                              </span>
                              <button
                                onClick={() => handleQuantityChange(item.crop._id, item.quantity + 1)}
                                disabled={item.quantity >= item.crop.quantity.value}
                                className="w-8 h-8 rounded-full border border-gray-300 flex items-center justify-center hover:bg-gray-50 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                              >
                                <Plus className="w-4 h-4" />
                              </button>
                            </div>

                            {/* Total Price */}
                            <div className="text-right">
                              <div className="text-lg font-bold text-gray-900">
                                {formatPrice(item.crop.price.perUnit * item.quantity)}
                              </div>
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>

                {/* Farmer Total */}
                <div className="p-4 bg-gray-50 border-t border-gray-200">
                  <div className="flex items-center justify-between">
                    <span className="font-medium text-gray-900">
                      Subtotal for {farmerGroup.farmer.name}
                    </span>
                    <span className="font-bold text-lg text-gray-900">
                      {formatPrice(
                        farmerGroup.items.reduce(
                          (total, item) => total + (item.crop.price.perUnit * item.quantity),
                          0
                        )
                      )}
                    </span>
                  </div>
                </div>
              </div>
            ))}
          </div>

          {/* Order Summary */}
          <div className="lg:col-span-1">
            <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 sticky top-24">
              <h3 className="text-lg font-semibold text-gray-900 mb-6">Order Summary</h3>
              
              <div className="space-y-4">
                <div className="flex justify-between">
                  <span className="text-gray-600">Subtotal</span>
                  <span className="font-medium">{formatPrice(getCartTotal())}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Delivery Charges</span>
                  <span className="font-medium">To be calculated</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Tax (5%)</span>
                  <span className="font-medium">{formatPrice(getCartTotal() * 0.05)}</span>
                </div>
                <div className="border-t border-gray-200 pt-4">
                  <div className="flex justify-between">
                    <span className="text-lg font-semibold text-gray-900">Total</span>
                    <span className="text-lg font-bold text-primary-600">
                      {formatPrice(getCartTotal() * 1.05)}
                    </span>
                  </div>
                </div>
              </div>

              <div className="mt-6 space-y-3">
                <Link
                  to="/checkout"
                  className="w-full btn-primary text-center py-3 flex items-center justify-center"
                >
                  Proceed to Checkout
                  <ArrowRight className="w-5 h-5 ml-2" />
                </Link>
                <Link
                  to="/marketplace"
                  className="w-full btn-outline text-center py-3"
                >
                  Continue Shopping
                </Link>
              </div>

              {/* Security Badge */}
              <div className="mt-6 p-4 bg-green-50 rounded-lg border border-green-200">
                <div className="flex items-center space-x-2">
                  <div className="w-6 h-6 bg-green-100 rounded-full flex items-center justify-center">
                    <span className="text-green-600 text-xs font-bold">✓</span>
                  </div>
                  <div>
                    <div className="text-sm font-medium text-green-800">Secure Checkout</div>
                    <div className="text-xs text-green-600">Your payment information is safe</div>
                  </div>
                </div>
              </div>

              {/* Help Text */}
              <div className="mt-6 text-center">
                <p className="text-sm text-gray-600">
                  Need help? <a href="#" className="text-primary-600 hover:text-primary-700">Contact Support</a>
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Cart;
