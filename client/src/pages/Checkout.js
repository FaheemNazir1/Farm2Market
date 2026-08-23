import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { useCart } from '../contexts/CartContext';
import { useAuth } from '../contexts/AuthContext';
import { ordersAPI, paymentsAPI } from '../services/api';
import { 
  ArrowLeft, 
  CreditCard, 
  Banknote,
  ShieldCheck,
  Lock,
  Sparkles
} from 'lucide-react';
import LoadingSpinner from '../components/UI/LoadingSpinner';
import toast from 'react-hot-toast';

// Dynamic script loader for Razorpay Standard Checkout
const loadRazorpayScript = () => {
  return new Promise((resolve) => {
    if (window.Razorpay) {
      resolve(true);
      return;
    }
    const script = document.createElement('script');
    script.src = 'https://checkout.razorpay.com/v1/checkout.js';
    script.async = true;
    script.onload = () => resolve(true);
    script.onerror = () => resolve(false);
    document.body.appendChild(script);
  });
};

const Checkout = () => {
  const { t } = useTranslation();
  const { user } = useAuth();
  const [isLoading, setIsLoading] = useState(false);
  const [paymentMethod, setPaymentMethod] = useState('razorpay');
  const [shippingAddress, setShippingAddress] = useState({
    name: user?.name || '',
    phone: user?.phone || '',
    street: user?.address?.street || '',
    city: user?.address?.city || '',
    state: user?.address?.state || '',
    pincode: user?.address?.pincode || '',
    landmark: ''
  });

  const { cartItems, getCartTotal, getCartItemsByFarmer, clearCart } = useCart();
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
    }).format(price || 0);
  };

  const handleAddressChange = (e) => {
    setShippingAddress({
      ...shippingAddress,
      [e.target.name]: e.target.value
    });
  };

  const validateShippingAddress = () => {
    const required = ['name', 'phone', 'street', 'city', 'state', 'pincode'];
    for (const field of required) {
      if (!shippingAddress[field] || !String(shippingAddress[field]).trim()) {
        toast.error(`Please fill in ${field}`);
        return false;
      }
    }
    const cleanPhone = String(shippingAddress.phone).replace(/\D/g, '');
    if (cleanPhone.length < 10 || cleanPhone.length > 11) {
      toast.error('Please enter a valid 10-11 digit phone number');
      return false;
    }
    if (!/^\d{6}$/.test(String(shippingAddress.pincode).trim())) {
      toast.error('Please enter a valid 6-digit pincode');
      return false;
    }
    return true;
  };

  const handlePlaceOrder = async () => {
    if (!validateShippingAddress()) return;

    if (cartItemsByFarmer.length === 0) {
      toast.error('Your cart is empty');
      navigate('/cart');
      return;
    }

    // -------------------------------------------------------------
    // FLOW A: RAZORPAY STANDARD WEB CHECKOUT
    // -------------------------------------------------------------
    if (paymentMethod === 'razorpay') {
      const isScriptLoaded = await loadRazorpayScript();
      if (!isScriptLoaded) {
        toast.error('Failed to load Razorpay SDK. Please check your internet connection.');
        return;
      }

      setIsLoading(true);
      try {
        // Process the first farmer group or multiple groups
        for (const group of cartItemsByFarmer) {
          const { farmerId, items } = group;
          const farmerSubtotal = items.reduce((sum, item) => sum + ((Number(item.crop.price?.perUnit) || 0) * item.quantity), 0);
          const farmerTax = farmerSubtotal * 0.05;
          const farmerTotal = farmerSubtotal + farmerTax;

          // 1. Create order on Farm2Market backend with paymentStatus: 'pending'
          const orderRes = await ordersAPI.createOrder({
            farmer: farmerId,
            items: items.map(item => ({
              cropId: item.crop._id || item.crop.id,
              crop: item.crop._id || item.crop.id,
              quantity: item.quantity,
              price: item.crop.price?.perUnit
            })),
            shippingAddress,
            paymentMethod: 'razorpay',
            subtotal: farmerSubtotal,
            tax: farmerTax,
            totalAmount: farmerTotal
          });

          const createdOrder = orderRes.order;

          // 2. Initialize Razorpay order on backend
          const rzpOrderRes = await paymentsAPI.createRazorpayOrder({
            orderId: createdOrder._id
          });

          if (!rzpOrderRes.success || !rzpOrderRes.razorpayOrderId) {
            throw new Error(rzpOrderRes.message || 'Failed to initialize payment gateway');
          }

          // 3. Open Razorpay standard checkout popup
          const options = {
            key: rzpOrderRes.key, // Razorpay Key ID from server
            amount: rzpOrderRes.amount, // in paise
            currency: rzpOrderRes.currency || 'INR',
            name: 'Farm2Market',
            description: `Produce Order #${createdOrder.orderNumber || createdOrder._id.slice(-8).toUpperCase()}`,
            image: 'https://images.unsplash.com/photo-1592924357228-91a4daadcfea?w=200&auto=format&fit=crop&q=80',
            order_id: rzpOrderRes.razorpayOrderId,
            prefill: {
              name: shippingAddress.name || user?.name || '',
              email: user?.email || '',
              contact: shippingAddress.phone || user?.phone || ''
            },
            theme: {
              color: '#059669' // Emerald-600 theme
            },
            handler: async (response) => {
              try {
                setIsLoading(true);
                // 4. Verify cryptographic signature on backend
                const verifyRes = await paymentsAPI.verifyRazorpayPayment({
                  razorpay_order_id: response.razorpay_order_id,
                  razorpay_payment_id: response.razorpay_payment_id,
                  razorpay_signature: response.razorpay_signature,
                  orderId: createdOrder._id
                });

                if (verifyRes.success) {
                  clearCart();
                  toast.success('Payment verified & order placed successfully!');
                  navigate('/orders');
                } else {
                  toast.error(verifyRes.message || 'Payment signature verification failed');
                }
              } catch (verifyErr) {
                console.error('Razorpay payment verification error:', verifyErr);
                const errMsg = verifyErr.response?.data?.message || verifyErr.message || 'Payment verification failed';
                toast.error(errMsg);
              } finally {
                setIsLoading(false);
              }
            },
            modal: {
              ondismiss: () => {
                setIsLoading(false);
                toast('Payment window closed. Your cart remains saved.', { icon: 'ℹ️' });
              }
            }
          };

          const razorpayInstance = new window.Razorpay(options);
          razorpayInstance.on('payment.failed', (failResponse) => {
            setIsLoading(false);
            toast.error(`Payment failed: ${failResponse.error?.description || 'Transaction declined'}`);
          });
          razorpayInstance.open();
        }
      } catch (error) {
        console.error('Razorpay checkout error:', error);
        const errMsg = error.response?.data?.message || error.message || 'Failed to initiate Razorpay checkout';
        toast.error(errMsg);
        setIsLoading(false);
      }
      return;
    }

    // -------------------------------------------------------------
    // FLOW B: CASH ON DELIVERY (COD)
    // -------------------------------------------------------------
    setIsLoading(true);
    try {
      for (const group of cartItemsByFarmer) {
        const { farmerId, items } = group;
        const farmerSubtotal = items.reduce((sum, item) => sum + ((Number(item.crop.price?.perUnit) || 0) * item.quantity), 0);
        const farmerTax = farmerSubtotal * 0.05;
        const farmerTotal = farmerSubtotal + farmerTax;

        await ordersAPI.createOrder({
          farmer: farmerId,
          items: items.map(item => ({
            cropId: item.crop._id || item.crop.id,
            crop: item.crop._id || item.crop.id,
            quantity: item.quantity,
            price: item.crop.price?.perUnit
          })),
          shippingAddress,
          paymentMethod: 'cod',
          subtotal: farmerSubtotal,
          tax: farmerTax,
          totalAmount: farmerTotal
        });
      }

      clearCart();
      toast.success(t('common.success', 'Orders placed successfully!'));
      navigate('/orders');
    } catch (error) {
      console.error('Error placing COD order:', error);
      const errMsg = error.response?.data?.message || error.message || 'Failed to place order';
      toast.error(errMsg);
    } finally {
      setIsLoading(false);
    }
  };

  const paymentMethods = [
    {
      id: 'razorpay',
      name: 'Pay Online (Razorpay)',
      description: 'UPI, Credit/Debit Cards, Net Banking, Wallets',
      badge: 'Fast & Secure',
      icon: <CreditCard className="w-5 h-5 text-emerald-600" />
    },
    {
      id: 'cod',
      name: t('checkout.cod', 'Cash on Delivery (COD)'),
      description: 'Pay cash upon delivery inspection',
      badge: 'Available',
      icon: <Banknote className="w-5 h-5 text-emerald-600" />
    }
  ];

  const states = [
    'Maharashtra', 'Andhra Pradesh', 'Arunachal Pradesh', 'Assam', 'Bihar', 'Chhattisgarh',
    'Goa', 'Gujarat', 'Haryana', 'Himachal Pradesh', 'Jharkhand',
    'Karnataka', 'Kerala', 'Madhya Pradesh', 'Manipur', 'Meghalaya', 
    'Mizoram', 'Nagaland', 'Odisha', 'Punjab', 'Rajasthan', 'Sikkim', 
    'Tamil Nadu', 'Telangana', 'Tripura', 'Uttar Pradesh', 'Uttarakhand', 
    'West Bengal', 'Delhi'
  ];

  if (cartItems.length === 0) {
    navigate('/cart');
    return null;
  }

  return (
    <div className="min-h-screen bg-slate-50/70 pb-20">
      
      {/* Header */}
      <div className="bg-white border-b border-slate-200/80 sticky top-20 z-30">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-5 flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <button
              onClick={() => navigate('/cart')}
              className="p-2 text-slate-500 hover:text-slate-800 transition-colors rounded-xl hover:bg-slate-100"
            >
              <ArrowLeft className="w-5 h-5" />
            </button>
            <h1 className="text-2xl font-black text-slate-900 font-heading">
              {t('checkout.title', 'Order Checkout')}
            </h1>
          </div>

          <div className="flex items-center space-x-2 text-xs font-bold text-emerald-700 bg-emerald-50 px-3 py-1.5 rounded-xl">
            <ShieldCheck className="w-4 h-4" />
            <span>256-Bit SSL Secured</span>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-8">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
          
          {/* Main Checkout Steps */}
          <div className="lg:col-span-8 space-y-6">
            
            {/* Step 1: Delivery Address */}
            <div className="card p-6 sm:p-8 bg-white border border-slate-200/80 shadow-md space-y-4">
              <h2 className="text-base font-bold text-slate-900 uppercase tracking-wider font-heading pb-2 border-b border-slate-100">
                1. {t('checkout.deliveryAddress', 'Delivery Address')}
              </h2>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                    {t('checkout.fullName', 'Full Name')} *
                  </label>
                  <input
                    type="text"
                    name="name"
                    value={shippingAddress.name}
                    onChange={handleAddressChange}
                    placeholder="Recipient's Name"
                    className="input-field text-sm"
                    required
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                    {t('checkout.phone', 'Phone Number')} *
                  </label>
                  <input
                    type="tel"
                    name="phone"
                    value={shippingAddress.phone}
                    onChange={handleAddressChange}
                    placeholder="10-digit mobile number"
                    className="input-field text-sm"
                    required
                  />
                </div>

                <div className="sm:col-span-2">
                  <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                    {t('checkout.streetAddress', 'Street Address / Village / Farm')} *
                  </label>
                  <input
                    type="text"
                    name="street"
                    value={shippingAddress.street}
                    onChange={handleAddressChange}
                    placeholder="House/Plot No., Road, Landmark"
                    className="input-field text-sm"
                    required
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                    City / Town *
                  </label>
                  <input
                    type="text"
                    name="city"
                    value={shippingAddress.city}
                    onChange={handleAddressChange}
                    placeholder="City name"
                    className="input-field text-sm"
                    required
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                    {t('addCrop.state', 'State')} *
                  </label>
                  <select
                    name="state"
                    value={shippingAddress.state}
                    onChange={handleAddressChange}
                    className="input-field text-sm"
                    required
                  >
                    <option value="">{t('addCrop.selectState', 'Select State')}</option>
                    {states.map(s => <option key={s} value={s}>{s}</option>)}
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                    {t('addCrop.pincode', 'Pincode')} *
                  </label>
                  <input
                    type="text"
                    maxLength="6"
                    name="pincode"
                    value={shippingAddress.pincode}
                    onChange={handleAddressChange}
                    placeholder="411001"
                    className="input-field text-sm"
                    required
                  />
                </div>
              </div>
            </div>

            {/* Step 2: Payment Method */}
            <div className="card p-6 sm:p-8 bg-white border border-slate-200/80 shadow-md space-y-4">
              <div className="flex items-center justify-between pb-2 border-b border-slate-100">
                <h2 className="text-base font-bold text-slate-900 uppercase tracking-wider font-heading">
                  2. {t('checkout.paymentMethod', 'Payment Method')}
                </h2>
                <span className="text-[11px] font-bold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-md flex items-center">
                  <Sparkles className="w-3 h-3 mr-1" />
                  Razorpay Test Mode
                </span>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {paymentMethods.map((method) => (
                  <div
                    key={method.id}
                    onClick={() => setPaymentMethod(method.id)}
                    className={`p-4 rounded-2xl border-2 cursor-pointer transition-all ${
                      paymentMethod === method.id
                        ? 'border-emerald-600 bg-emerald-50/70 ring-2 ring-emerald-500/20'
                        : 'border-slate-200 hover:border-slate-300 bg-white'
                    }`}
                  >
                    <div className="flex items-center space-x-3">
                      <div className="p-2 bg-white rounded-xl shadow-sm">
                        {method.icon}
                      </div>
                      <div className="flex-1">
                        <div className="flex items-center justify-between">
                          <h4 className="font-bold text-slate-900 text-sm">{method.name}</h4>
                          <span className="text-[10px] font-bold px-1.5 py-0.5 rounded bg-slate-100 text-slate-600">
                            {method.badge}
                          </span>
                        </div>
                        <p className="text-[11px] text-slate-500 mt-0.5">{method.description}</p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Place Order CTA */}
            <button
              type="button"
              onClick={handlePlaceOrder}
              disabled={isLoading}
              className="w-full btn-primary py-4 text-sm font-bold justify-center shadow-lg flex items-center space-x-2"
            >
              {isLoading ? (
                <LoadingSpinner size="small" color="white" />
              ) : (
                <>
                  <Lock className="w-4 h-4 mr-1.5" />
                  <span>
                    {paymentMethod === 'razorpay' ? 'Proceed to Pay' : t('checkout.placeOrder', 'Place Order')} ({formatPrice(total)})
                  </span>
                </>
              )}
            </button>

          </div>

          {/* Order Summary Sidebar */}
          <div className="lg:col-span-4">
            <div className="card p-6 bg-white border border-slate-200/80 shadow-md space-y-4 sticky top-36">
              <h3 className="text-base font-bold text-slate-900 uppercase tracking-wider font-heading pb-2 border-b border-slate-100">
                {t('cart.orderSummary', 'Order Summary')}
              </h3>

              <div className="space-y-3 divide-y divide-slate-100 max-h-60 overflow-y-auto">
                {cartItems.map((item) => (
                  <div key={item.crop._id || item.crop.id} className="pt-2 flex justify-between items-center text-xs">
                    <div>
                      <p className="font-bold text-slate-900">{item.crop.name}</p>
                      <p className="text-slate-500">{item.quantity} x {formatPrice(item.crop.price?.perUnit)}</p>
                    </div>
                    <span className="font-bold text-slate-800">
                      {formatPrice((item.crop.price?.perUnit || 0) * item.quantity)}
                    </span>
                  </div>
                ))}
              </div>

              <div className="pt-3 border-t border-slate-100 space-y-2 text-xs">
                <div className="flex justify-between text-slate-600">
                  <span>{t('cart.subtotal', 'Items Subtotal')}</span>
                  <span className="font-bold text-slate-900">{formatPrice(subtotal)}</span>
                </div>
                <div className="flex justify-between text-slate-600">
                  <span>GST / APMC Cess (5%)</span>
                  <span className="font-bold text-slate-900">{formatPrice(tax)}</span>
                </div>
                <div className="flex justify-between text-slate-600">
                  <span>{t('cart.shipping', 'Estimated Delivery')}</span>
                  <span className="text-emerald-700 font-bold">Free Direct Pickup / Delivery</span>
                </div>
              </div>

              <div className="pt-3 border-t border-slate-100 flex justify-between items-baseline">
                <span className="text-sm font-bold text-slate-900">{t('cart.grandTotal', 'Grand Total')}</span>
                <span className="text-2xl font-black text-emerald-800 font-heading">{formatPrice(total)}</span>
              </div>
            </div>
          </div>

        </div>
      </div>

    </div>
  );
};

export default Checkout;
