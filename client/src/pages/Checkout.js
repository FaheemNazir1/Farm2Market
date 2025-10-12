import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useCart } from '../contexts/CartContext';
import { useAuth } from '../contexts/AuthContext';
import { ordersAPI, paymentsAPI } from '../services/api';
import { 
  ArrowLeft, 
  CreditCard, 
  Smartphone, 
  Building, 
  Wallet,
  Banknote,
  Shield,
  CheckCircle,
  Lock
} from 'lucide-react';
import LoadingSpinner from '../components/UI/LoadingSpinner';
import UPIPayment from '../components/Payment/UPIPayment';
import toast from 'react-hot-toast';

const Checkout = () => {
  const [currentStep, setCurrentStep] = useState(1);
  const [isLoading, setIsLoading] = useState(false);
  const [paymentMethod, setPaymentMethod] = useState('card');
  const [showUPIPayment, setShowUPIPayment] = useState(false);
  const [orderData, setOrderData] = useState(null);
  const [shippingAddress, setShippingAddress] = useState({
    name: '',
    phone: '',
    street: '',
    city: '',
    state: '',
    pincode: '',
    landmark: ''
  });

  const { cartItems, getCartTotal, getCartItemsByFarmer, clearCart } = useCart();
  const { user } = useAuth();
  const navigate = useNavigate();

  const cartItemsByFarmer = getCartItemsByFarmer();
  const subtotal = getCartTotal();
  const tax = subtotal * 0.05;
  const total = subtotal + tax;

  const formatPrice = (price) => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      maximumFractionDigits: 0
    }).format(price);
  };

  const paymentMethods = [
    {
      id: 'card',
      name: 'Credit/Debit Card',
      icon: <CreditCard className="w-6 h-6" />,
      description: 'Pay securely with your card'
    },
    {
      id: 'upi',
      name: 'UPI',
      icon: <Smartphone className="w-6 h-6" />,
      description: 'Pay using UPI apps like Google Pay, PhonePe'
    },
    {
      id: 'netbanking',
      name: 'Net Banking',
      icon: <Building className="w-6 h-6" />,
      description: 'Pay using your bank account'
    },
    {
      id: 'cod',
      name: 'Cash on Delivery',
      icon: <Banknote className="w-6 h-6" />,
      description: 'Pay when your order is delivered'
    }
  ];

  const states = [
    'Andhra Pradesh', 'Arunachal Pradesh', 'Assam', 'Bihar', 'Chhattisgarh',
    'Goa', 'Gujarat', 'Haryana', 'Himachal Pradesh', 'Jharkhand',
    'Karnataka', 'Kerala', 'Madhya Pradesh', 'Maharashtra', 'Manipur',
    'Meghalaya', 'Mizoram', 'Nagaland', 'Odisha', 'Punjab',
    'Rajasthan', 'Sikkim', 'Tamil Nadu', 'Telangana', 'Tripura',
    'Uttar Pradesh', 'Uttarakhand', 'West Bengal', 'Delhi', 'Chandigarh'
  ];

  const handleAddressChange = (e) => {
    setShippingAddress({
      ...shippingAddress,
      [e.target.name]: e.target.value
    });
  };

  const handlePlaceOrder = async () => {
    if (!shippingAddress.name || !shippingAddress.phone || !shippingAddress.street || 
        !shippingAddress.city || !shippingAddress.state || !shippingAddress.pincode) {
      toast.error('Please fill in all required shipping address fields');
      return;
    }

    console.log('Placing order with data:', {
      cartItemsByFarmer,
      shippingAddress,
      paymentMethod,
      user
    });

    setIsLoading(true);

    try {
      // Create orders for each farmer
      const orderPromises = cartItemsByFarmer.map(async (farmerGroup) => {
        const orderData = {
          items: farmerGroup.items.map(item => ({
            cropId: item.crop._id,
            quantity: item.quantity
          })),
          shippingAddress,
          paymentMethod,
          notes: ''
        };

        console.log('Creating order for farmer:', farmerGroup.farmer.name, 'with data:', orderData);
        return await ordersAPI.createOrder(orderData);
      });

      const orders = await Promise.all(orderPromises);
      console.log('Orders created successfully:', orders);

      // Handle payment based on method
      if (paymentMethod === 'cod') {
        // For COD, just process the order
        toast.success('Order placed successfully! You will pay on delivery.');
        // Clear cart and redirect
        clearCart();
        navigate('/orders');
      } else if (paymentMethod === 'upi') {
        // For UPI, show UPI payment component
        setOrderData({
          orderId: orders[0].order._id,
          amount: total,
          orders: orders
        });
        setShowUPIPayment(true);
        setCurrentStep(3);
      } else {
        // For other payment methods, redirect to payment
        toast.success('Order created! Redirecting to payment...');
        // In a real app, you would integrate with payment gateway here
        clearCart();
        navigate('/orders');
      }

    } catch (error) {
      console.error('Order placement error:', error);
      console.error('Error details:', {
        message: error.message,
        response: error.response,
        status: error.status
      });
      const errorMessage = error.response?.message || error.message || 'Failed to place order. Please try again.';
      toast.error(errorMessage);
    } finally {
      setIsLoading(false);
    }
  };

  const handleUPISuccess = (paymentResult) => {
    toast.success('Payment successful! Order confirmed.');
    clearCart();
    navigate('/orders');
  };

  const handleUPIError = (error) => {
    toast.error('Payment failed. Please try again.');
    setShowUPIPayment(false);
    setCurrentStep(2);
  };

  if (cartItems.length === 0) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-gray-900 mb-4">Your cart is empty</h2>
          <p className="text-gray-600 mb-4">Add some items to your cart before checkout</p>
          <button onClick={() => navigate('/marketplace')} className="btn-primary">
            Browse Marketplace
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <button
            onClick={() => navigate('/cart')}
            className="flex items-center space-x-2 text-gray-600 hover:text-primary-600 transition-colors"
          >
            <ArrowLeft className="w-5 h-5" />
            <span>Back to Cart</span>
          </button>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Progress Steps */}
        <div className="mb-8">
          <div className="flex items-center justify-center space-x-8">
            {[1, 2, 3].map((step) => (
              <div key={step} className="flex items-center">
                <div className={`w-10 h-10 rounded-full flex items-center justify-center text-sm font-medium ${
                  currentStep >= step
                    ? 'bg-primary-600 text-white'
                    : 'bg-gray-200 text-gray-600'
                }`}>
                  {step}
                </div>
                <div className="ml-3 text-sm font-medium text-gray-900">
                  {step === 1 && 'Shipping'}
                  {step === 2 && 'Payment'}
                  {step === 3 && 'Review'}
                </div>
                {step < 3 && (
                  <div className={`ml-8 w-16 h-0.5 ${
                    currentStep > step ? 'bg-primary-600' : 'bg-gray-200'
                  }`} />
                )}
              </div>
            ))}
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Main Content */}
          <div className="lg:col-span-2 space-y-8">
            {/* Step 1: Shipping Address */}
            {currentStep === 1 && (
              <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
                <h2 className="text-xl font-semibold text-gray-900 mb-6">Shipping Address</h2>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Full Name *
                    </label>
                    <input
                      type="text"
                      name="name"
                      value={shippingAddress.name}
                      onChange={handleAddressChange}
                      className="input-field"
                      placeholder="Enter your full name"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Phone Number *
                    </label>
                    <input
                      type="tel"
                      name="phone"
                      value={shippingAddress.phone}
                      onChange={handleAddressChange}
                      className="input-field"
                      placeholder="Enter your phone number"
                    />
                  </div>
                  <div className="md:col-span-2">
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Street Address *
                    </label>
                    <input
                      type="text"
                      name="street"
                      value={shippingAddress.street}
                      onChange={handleAddressChange}
                      className="input-field"
                      placeholder="Enter your street address"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      City *
                    </label>
                    <input
                      type="text"
                      name="city"
                      value={shippingAddress.city}
                      onChange={handleAddressChange}
                      className="input-field"
                      placeholder="Enter your city"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      State *
                    </label>
                    <select
                      name="state"
                      value={shippingAddress.state}
                      onChange={handleAddressChange}
                      className="input-field"
                    >
                      <option value="">Select State</option>
                      {states.map(state => (
                        <option key={state} value={state}>{state}</option>
                      ))}
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Pincode *
                    </label>
                    <input
                      type="text"
                      name="pincode"
                      value={shippingAddress.pincode}
                      onChange={handleAddressChange}
                      className="input-field"
                      placeholder="Enter pincode"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Landmark (Optional)
                    </label>
                    <input
                      type="text"
                      name="landmark"
                      value={shippingAddress.landmark}
                      onChange={handleAddressChange}
                      className="input-field"
                      placeholder="Enter landmark"
                    />
                  </div>
                </div>
                <div className="mt-6 flex justify-end">
                  <button
                    onClick={() => setCurrentStep(2)}
                    className="btn-primary"
                  >
                    Continue to Payment
                  </button>
                </div>
              </div>
            )}

            {/* Step 2: Payment Method */}
            {currentStep === 2 && (
              <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
                <h2 className="text-xl font-semibold text-gray-900 mb-6">Payment Method</h2>
                <div className="space-y-4">
                  {paymentMethods.map((method) => (
                    <div
                      key={method.id}
                      onClick={() => setPaymentMethod(method.id)}
                      className={`p-4 border-2 rounded-lg cursor-pointer transition-colors ${
                        paymentMethod === method.id
                          ? 'border-primary-500 bg-primary-50'
                          : 'border-gray-200 hover:border-gray-300'
                      }`}
                    >
                      <div className="flex items-center space-x-4">
                        <div className={`p-2 rounded-lg ${
                          paymentMethod === method.id ? 'bg-primary-600 text-white' : 'bg-gray-100 text-gray-600'
                        }`}>
                          {method.icon}
                        </div>
                        <div className="flex-1">
                          <h3 className="font-medium text-gray-900">{method.name}</h3>
                          <p className="text-sm text-gray-600">{method.description}</p>
                        </div>
                        <div className={`w-5 h-5 rounded-full border-2 ${
                          paymentMethod === method.id
                            ? 'border-primary-600 bg-primary-600'
                            : 'border-gray-300'
                        }`}>
                          {paymentMethod === method.id && (
                            <div className="w-full h-full rounded-full bg-white scale-50"></div>
                          )}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
                <div className="mt-6 flex justify-between">
                  <button
                    onClick={() => setCurrentStep(1)}
                    className="btn-outline"
                  >
                    Back to Shipping
                  </button>
                  <button
                    onClick={() => setCurrentStep(3)}
                    className="btn-primary"
                  >
                    Continue to Review
                  </button>
                </div>
              </div>
            )}

            {/* Step 3: Review Order or UPI Payment */}
            {currentStep === 3 && !showUPIPayment && (
              <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
                <h2 className="text-xl font-semibold text-gray-900 mb-6">Review Your Order</h2>
                
                {/* Order Items */}
                <div className="space-y-6">
                  {cartItemsByFarmer.map((farmerGroup, index) => (
                    <div key={index} className="border border-gray-200 rounded-lg p-4">
                      <div className="flex items-center space-x-3 mb-4">
                        <div className="w-8 h-8 bg-primary-100 rounded-full flex items-center justify-center">
                          <span className="text-primary-600 font-semibold text-sm">
                            {farmerGroup.farmer.name?.charAt(0)}
                          </span>
                        </div>
                        <h3 className="font-semibold text-gray-900">{farmerGroup.farmer.name}</h3>
                      </div>
                      <div className="space-y-3">
                        {farmerGroup.items.map((item, itemIndex) => (
                          <div key={itemIndex} className="flex items-center space-x-4">
                            <div className="w-12 h-12 bg-gray-200 rounded-lg overflow-hidden flex-shrink-0">
                              {item.crop.images && item.crop.images.length > 0 ? (
                                <img
                                  src={item.crop.images[0].url}
                                  alt={item.crop.name}
                                  className="w-full h-full object-cover"
                                />
                              ) : (
                                <div className="w-full h-full flex items-center justify-center">
                                  <span className="text-gray-400 text-xs">No Image</span>
                                </div>
                              )}
                            </div>
                            <div className="flex-1">
                              <h4 className="font-medium text-gray-900">{item.crop.name}</h4>
                              <p className="text-sm text-gray-600">{item.crop.variety}</p>
                            </div>
                            <div className="text-right">
                              <p className="text-sm text-gray-600">Qty: {item.quantity}</p>
                              <p className="font-medium text-gray-900">
                                {formatPrice(item.crop.price.perUnit * item.quantity)}
                              </p>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  ))}
                </div>

                {/* Shipping Address */}
                <div className="mt-6 p-4 bg-gray-50 rounded-lg">
                  <h3 className="font-medium text-gray-900 mb-2">Shipping Address</h3>
                  <div className="text-sm text-gray-600">
                    <p className="font-medium">{shippingAddress.name}</p>
                    <p>{shippingAddress.street}</p>
                    <p>{shippingAddress.city}, {shippingAddress.state} {shippingAddress.pincode}</p>
                    {shippingAddress.landmark && <p>Landmark: {shippingAddress.landmark}</p>}
                  </div>
                </div>

                <div className="mt-6 flex justify-between">
                  <button
                    onClick={() => setCurrentStep(2)}
                    className="btn-outline"
                  >
                    Back to Payment
                  </button>
                  <button
                    onClick={handlePlaceOrder}
                    disabled={isLoading}
                    className="btn-primary flex items-center"
                  >
                    {isLoading ? (
                      <>
                        <LoadingSpinner size="small" />
                        <span className="ml-2">Placing Order...</span>
                      </>
                    ) : (
                      <>
                        <Lock className="w-5 h-5 mr-2" />
                        Place Order
                      </>
                    )}
                  </button>
                </div>
              </div>
            )}

            {/* UPI Payment Component */}
            {showUPIPayment && orderData && (
              <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
                <h2 className="text-xl font-semibold text-gray-900 mb-6">Complete Payment</h2>
                <UPIPayment
                  orderData={orderData}
                  onSuccess={handleUPISuccess}
                  onError={handleUPIError}
                />
              </div>
            )}
          </div>

          {/* Order Summary Sidebar */}
          <div className="lg:col-span-1">
            <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 sticky top-24">
              <h3 className="text-lg font-semibold text-gray-900 mb-6">Order Summary</h3>
              
              <div className="space-y-4">
                <div className="flex justify-between">
                  <span className="text-gray-600">Subtotal</span>
                  <span className="font-medium">{formatPrice(subtotal)}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Delivery Charges</span>
                  <span className="font-medium text-green-600">Free</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Tax (5%)</span>
                  <span className="font-medium">{formatPrice(tax)}</span>
                </div>
                <div className="border-t border-gray-200 pt-4">
                  <div className="flex justify-between">
                    <span className="text-lg font-semibold text-gray-900">Total</span>
                    <span className="text-lg font-bold text-primary-600">
                      {formatPrice(total)}
                    </span>
                  </div>
                </div>
              </div>

              {/* Security Badge */}
              <div className="mt-6 p-4 bg-green-50 rounded-lg border border-green-200">
                <div className="flex items-center space-x-2">
                  <Shield className="w-5 h-5 text-green-600" />
                  <div>
                    <div className="text-sm font-medium text-green-800">Secure Checkout</div>
                    <div className="text-xs text-green-600">Your payment information is safe</div>
                  </div>
                </div>
              </div>

              {/* Payment Method Display */}
              <div className="mt-6 p-4 bg-gray-50 rounded-lg">
                <div className="text-sm font-medium text-gray-900 mb-2">Payment Method</div>
                <div className="flex items-center space-x-2 text-sm text-gray-600">
                  {paymentMethods.find(m => m.id === paymentMethod)?.icon}
                  <span>{paymentMethods.find(m => m.id === paymentMethod)?.name}</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Checkout;
