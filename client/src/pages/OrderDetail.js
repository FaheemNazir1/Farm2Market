import React, { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useQuery } from 'react-query';
import { ordersAPI } from '../services/api';
import { useAuth } from '../contexts/AuthContext';
import { downloadInvoice, testPDFGeneration } from '../utils/invoiceGenerator';
import { 
  ArrowLeft, 
  Package, 
  Star, 
  MapPin, 
  Calendar,
  Clock,
  CheckCircle,
  AlertCircle,
  Truck,
  X,
  User,
  Phone,
  Mail,
  Download
} from 'lucide-react';
import LoadingSpinner from '../components/UI/LoadingSpinner';
import toast from 'react-hot-toast';

const OrderDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [showRatingModal, setShowRatingModal] = useState(false);
  const [rating, setRating] = useState(5);
  const [review, setReview] = useState('');

  const { user, isFarmer, isBuyer } = useAuth();

  const { data: orderData, isLoading, error } = useQuery(
    ['order', id],
    () => ordersAPI.getOrder(id),
    {
      enabled: !!id,
    }
  );

  const order = orderData?.order;

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <LoadingSpinner size="large" />
      </div>
    );
  }

  if (error || !order) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-gray-900 mb-4">Order not found</h2>
          <p className="text-gray-600 mb-4">The order you're looking for doesn't exist or you don't have access to it.</p>
          <button onClick={() => navigate('/orders')} className="btn-primary">
            Back to Orders
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

  const formatDateTime = (date) => {
    return new Date(date).toLocaleString('en-IN', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'delivered':
        return 'text-green-600 bg-green-100';
      case 'shipped':
        return 'text-blue-600 bg-blue-100';
      case 'processing':
        return 'text-yellow-600 bg-yellow-100';
      case 'confirmed':
        return 'text-purple-600 bg-purple-100';
      case 'pending':
        return 'text-gray-600 bg-gray-100';
      case 'cancelled':
        return 'text-red-600 bg-red-100';
      default:
        return 'text-gray-600 bg-gray-100';
    }
  };

  const getStatusIcon = (status) => {
    switch (status) {
      case 'delivered':
        return <CheckCircle className="w-4 h-4" />;
      case 'shipped':
        return <Truck className="w-4 h-4" />;
      case 'processing':
        return <Package className="w-4 h-4" />;
      case 'confirmed':
        return <CheckCircle className="w-4 h-4" />;
      case 'pending':
        return <Clock className="w-4 h-4" />;
      case 'cancelled':
        return <X className="w-4 h-4" />;
      default:
        return <AlertCircle className="w-4 h-4" />;
    }
  };

  const getTimelineSteps = () => {
    const steps = [
      { status: 'Order Placed', date: order.createdAt, completed: true },
      { status: 'Confirmed', date: order.status === 'confirmed' ? order.updatedAt : null, completed: ['confirmed', 'processing', 'shipped', 'delivered'].includes(order.status) },
      { status: 'Processing', date: order.status === 'processing' ? order.updatedAt : null, completed: ['processing', 'shipped', 'delivered'].includes(order.status) },
      { status: 'Shipped', date: order.status === 'shipped' ? order.updatedAt : null, completed: ['shipped', 'delivered'].includes(order.status) },
      { status: 'Delivered', date: order.status === 'delivered' ? order.updatedAt : null, completed: order.status === 'delivered' }
    ];

    return steps;
  };

  const handleRatingSubmit = async () => {
    try {
      const ratingData = {
        rating,
        review
      };

      await ordersAPI.addRating(id, ratingData);
      toast.success('Rating submitted successfully!');
      setShowRatingModal(false);
      setRating(5);
      setReview('');
    } catch (error) {
      console.error('Rating submission error:', error);
      toast.error('Failed to submit rating. Please try again.');
    }
  };

  const handleStatusUpdate = async (newStatus) => {
    try {
      console.log('Updating order status to:', newStatus);
      const response = await ordersAPI.updateOrderStatus(id, { status: newStatus });
      console.log('Status update response:', response);
      toast.success('Order status updated successfully!');
      
      // Refetch the order to get updated data
      window.location.reload();
    } catch (error) {
      console.error('Status update error:', error);
      const errorMessage = error.response?.data?.message || error.message || 'Failed to update order status. Please try again.';
      toast.error(errorMessage);
    }
  };

  const handleDownloadInvoice = () => {
    try {
      console.log('Attempting to download invoice for order:', order);
      
      if (!order) {
        toast.error('Order data not available. Please refresh the page.');
        return;
      }
      
      if (!order.items || order.items.length === 0) {
        toast.error('Order has no items. Cannot generate invoice.');
        return;
      }
      
      const result = downloadInvoice(order);
      if (result.success) {
        toast.success('Invoice downloaded successfully!');
      } else {
        console.error('Invoice generation failed:', result.error);
        toast.error(result.error || 'Failed to generate invoice. Please check your browser settings or try again.');
      }
    } catch (error) {
      console.error('Download error:', error);
      toast.error(`Failed to download invoice: ${error.message}`);
    }
  };

  const handleTestPDF = () => {
    console.log('Testing PDF generation...');
    const testResult = testPDFGeneration();
    if (testResult) {
      toast.success('PDF library test passed!');
    } else {
      toast.error('PDF library test failed! Check console for details.');
    }
  };

  const timelineSteps = getTimelineSteps();
  const canRate = order.status === 'delivered' && !order.ratings?.[isFarmer ? 'farmer' : 'buyer'];

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <button
            onClick={() => navigate('/orders')}
            className="flex items-center space-x-2 text-gray-600 hover:text-primary-600 transition-colors"
          >
            <ArrowLeft className="w-5 h-5" />
            <span>Back to Orders</span>
          </button>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Main Content */}
          <div className="lg:col-span-2 space-y-8">
            {/* Order Header */}
            <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
              <div className="flex items-center justify-between mb-4">
                <div>
                  <h1 className="text-2xl font-bold text-gray-900">
                    Order #{order.orderNumber}
                  </h1>
                  <p className="text-gray-600">
                    Placed on {formatDateTime(order.createdAt)}
                  </p>
                </div>
                <div className="text-right">
                  <div className="flex items-center space-x-2 mb-2">
                    <span className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium ${getStatusColor(order.status)}`}>
                      {getStatusIcon(order.status)}
                      <span className="ml-1 capitalize">{order.status}</span>
                    </span>
                  </div>
                  <p className="text-2xl font-bold text-gray-900">
                    {formatPrice(order.finalAmount)}
                  </p>
                </div>
              </div>

              {/* Order Timeline */}
              <div className="mt-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">Order Timeline</h3>
                <div className="space-y-4">
                  {timelineSteps.map((step, index) => (
                    <div key={index} className="flex items-center space-x-4">
                      <div className={`w-8 h-8 rounded-full flex items-center justify-center ${
                        step.completed ? 'bg-primary-600 text-white' : 'bg-gray-200 text-gray-600'
                      }`}>
                        {step.completed ? (
                          <CheckCircle className="w-4 h-4" />
                        ) : (
                          <span className="text-sm font-medium">{index + 1}</span>
                        )}
                      </div>
                      <div className="flex-1">
                        <div className={`font-medium ${
                          step.completed ? 'text-gray-900' : 'text-gray-500'
                        }`}>
                          {step.status}
                        </div>
                        {step.date && (
                          <div className="text-sm text-gray-600">
                            {formatDateTime(step.date)}
                          </div>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* Order Items */}
            <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-6">Order Items</h3>
              <div className="space-y-4">
                {order.items.map((item, index) => (
                  <div key={index} className="flex items-center space-x-4 p-4 bg-gray-50 rounded-lg">
                    <div className="w-16 h-16 bg-gray-200 rounded-lg overflow-hidden flex-shrink-0">
                      {item.crop.images && item.crop.images.length > 0 ? (
                        <img
                          src={item.crop.images[0].url}
                          alt={item.crop.name}
                          className="w-full h-full object-cover"
                        />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center">
                          <Package className="w-6 h-6 text-gray-400" />
                        </div>
                      )}
                    </div>
                    <div className="flex-1 min-w-0">
                      <h4 className="font-medium text-gray-900">{item.crop.name}</h4>
                      <p className="text-sm text-gray-600">{item.crop.variety}</p>
                      <div className="flex items-center space-x-4 mt-1 text-sm text-gray-500">
                        <span>Qty: {item.quantity} {item.crop.quantity.unit}</span>
                        <span>•</span>
                        <span>{formatPrice(item.unitPrice)} each</span>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="font-medium text-gray-900">
                        {formatPrice(item.totalPrice)}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Customer/Farmer Information */}
            <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-6">
                {isFarmer ? 'Customer Information' : 'Farmer Information'}
              </h3>
              <div className="flex items-start space-x-6">
                <div className="w-16 h-16 bg-primary-100 rounded-full flex items-center justify-center">
                  <User className="w-8 h-8 text-primary-600" />
                </div>
                <div className="flex-1">
                  <h4 className="text-lg font-semibold text-gray-900">
                    {isFarmer ? order.buyer?.name : order.farmer?.name}
                  </h4>
                  <div className="space-y-2 mt-2">
                    <div className="flex items-center space-x-3 text-gray-600">
                      <Mail className="w-4 h-4" />
                      <span>{isFarmer ? order.buyer?.email : order.farmer?.email}</span>
                    </div>
                    <div className="flex items-center space-x-3 text-gray-600">
                      <Phone className="w-4 h-4" />
                      <span>{isFarmer ? order.buyer?.phone : order.farmer?.phone}</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Shipping Address */}
            <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-6 flex items-center">
                <MapPin className="w-5 h-5 mr-2 text-primary-600" />
                Shipping Address
              </h3>
              <div className="bg-gray-50 rounded-lg p-4">
                <div className="text-gray-900">
                  <p className="font-medium">{order.shippingAddress.name}</p>
                  <p>{order.shippingAddress.street}</p>
                  <p>{order.shippingAddress.city}, {order.shippingAddress.state}</p>
                  <p>{order.shippingAddress.pincode}</p>
                  {order.shippingAddress.landmark && (
                    <p className="text-sm text-gray-600 mt-1">
                      Landmark: {order.shippingAddress.landmark}
                    </p>
                  )}
                </div>
              </div>
            </div>
          </div>

          {/* Sidebar */}
          <div className="lg:col-span-1 space-y-6">
            {/* Order Summary */}
            <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-6">Order Summary</h3>
              <div className="space-y-4">
                <div className="flex justify-between">
                  <span className="text-gray-600">Subtotal</span>
                  <span className="font-medium">{formatPrice(order.totalAmount)}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Delivery Charges</span>
                  <span className="font-medium">
                    {order.deliveryCharges > 0 ? formatPrice(order.deliveryCharges) : 'Free'}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Tax (5%)</span>
                  <span className="font-medium">{formatPrice(order.taxAmount)}</span>
                </div>
                <div className="border-t border-gray-200 pt-4">
                  <div className="flex justify-between">
                    <span className="text-lg font-semibold text-gray-900">Total</span>
                    <span className="text-lg font-bold text-primary-600">
                      {formatPrice(order.finalAmount)}
                    </span>
                  </div>
                </div>
              </div>
            </div>

            {/* Payment Information */}
            <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-6">Payment Information</h3>
              <div className="space-y-3">
                <div className="flex justify-between">
                  <span className="text-gray-600">Payment Method</span>
                  <span className="font-medium capitalize">{order.paymentMethod}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Payment Status</span>
                  <span className={`font-medium capitalize ${
                    order.paymentStatus === 'paid' ? 'text-green-600' : 
                    order.paymentStatus === 'pending' ? 'text-yellow-600' : 'text-red-600'
                  }`}>
                    {order.paymentStatus}
                  </span>
                </div>
                {order.paymentId && (
                  <div className="flex justify-between">
                    <span className="text-gray-600">Transaction ID</span>
                    <span className="font-medium text-sm">{order.paymentId}</span>
                  </div>
                )}
              </div>
            </div>

            {/* Actions */}
            <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-6">Actions</h3>
              <div className="space-y-3">
                {canRate && (
                  <button
                    onClick={() => setShowRatingModal(true)}
                    className="w-full btn-primary flex items-center justify-center"
                  >
                    <Star className="w-5 h-5 mr-2" />
                    Rate & Review
                  </button>
                )}
                
                {isFarmer && order.status === 'pending' && (
                  <button
                    onClick={() => handleStatusUpdate('confirmed')}
                    className="w-full btn-primary"
                  >
                    Confirm Order
                  </button>
                )}
                
                {isFarmer && order.status === 'confirmed' && (
                  <button
                    onClick={() => handleStatusUpdate('processing')}
                    className="w-full btn-primary"
                  >
                    Start Processing
                  </button>
                )}
                
                {isFarmer && order.status === 'processing' && (
                  <button
                    onClick={() => handleStatusUpdate('shipped')}
                    className="w-full btn-primary"
                  >
                    Mark as Shipped
                  </button>
                )}
                
                {isFarmer && order.status === 'shipped' && (
                  <button
                    onClick={() => handleStatusUpdate('delivered')}
                    className="w-full btn-primary"
                  >
                    Mark as Delivered
                  </button>
                )}

                <button 
                  onClick={handleDownloadInvoice}
                  className="w-full btn-outline flex items-center justify-center"
                >
                  <Download className="w-5 h-5 mr-2" />
                  Download Invoice
                </button>
                
                <button 
                  onClick={handleTestPDF}
                  className="w-full btn-secondary flex items-center justify-center mt-2"
                >
                  Test PDF Library
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Rating Modal */}
      {showRatingModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg p-6 w-full max-w-md">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">
              Rate {isFarmer ? order.buyer?.name : order.farmer?.name}
            </h3>
            
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Rating
                </label>
                <div className="flex space-x-1">
                  {[1, 2, 3, 4, 5].map((star) => (
                    <button
                      key={star}
                      onClick={() => setRating(star)}
                      className={`w-8 h-8 ${
                        star <= rating ? 'text-yellow-400' : 'text-gray-300'
                      }`}
                    >
                      <Star className="w-full h-full fill-current" />
                    </button>
                  ))}
                </div>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Review (Optional)
                </label>
                <textarea
                  value={review}
                  onChange={(e) => setReview(e.target.value)}
                  rows={4}
                  className="input-field resize-none"
                  placeholder="Share your experience..."
                />
              </div>
            </div>

            <div className="flex space-x-3 mt-6">
              <button
                onClick={() => setShowRatingModal(false)}
                className="flex-1 btn-outline"
              >
                Cancel
              </button>
              <button
                onClick={handleRatingSubmit}
                className="flex-1 btn-primary"
              >
                Submit Rating
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default OrderDetail;
