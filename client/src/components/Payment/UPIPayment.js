import React, { useState } from 'react';
import { Smartphone, CheckCircle, XCircle, Loader } from 'lucide-react';
import { paymentsAPI } from '../../services/api';
import toast from 'react-hot-toast';

const UPIPayment = ({ orderData, onSuccess, onError }) => {
  const [upiId, setUpiId] = useState('');
  const [isProcessing, setIsProcessing] = useState(false);
  const [paymentStep, setPaymentStep] = useState('input'); // input, processing, success, error
  const [paymentResult, setPaymentResult] = useState(null);

  const formatPrice = (price) => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      maximumFractionDigits: 0
    }).format(price);
  };

  const validateUPIId = (id) => {
    // Basic UPI ID validation
    const upiRegex = /^[a-zA-Z0-9._-]+@[a-zA-Z0-9.-]+$/;
    return upiRegex.test(id);
  };

  const handleUPIPayment = async () => {
    if (!validateUPIId(upiId)) {
      toast.error('Please enter a valid UPI ID');
      return;
    }

    setIsProcessing(true);
    setPaymentStep('processing');

    try {
      // Simulate UPI payment for demo
      const response = await paymentsAPI.simulateUPIPayment({
        orderId: orderData.orderId,
        upiId: upiId,
        amount: orderData.amount
      });

      if (response.data.success) {
        setPaymentResult(response.data);
        setPaymentStep('success');
        toast.success('UPI payment successful!');
        
        // Call success callback
        if (onSuccess) {
          onSuccess(response.data);
        }
      } else {
        throw new Error(response.data.message || 'Payment failed');
      }

    } catch (error) {
      console.error('UPI payment error:', error);
      setPaymentStep('error');
      const errorMessage = error.response?.data?.message || 'UPI payment failed';
      toast.error(errorMessage);
      
      if (onError) {
        onError(error);
      }
    } finally {
      setIsProcessing(false);
    }
  };

  const resetPayment = () => {
    setPaymentStep('input');
    setUpiId('');
    setPaymentResult(null);
  };

  return (
    <div className="max-w-md mx-auto bg-white rounded-lg shadow-lg border border-gray-200 p-6">
      {/* Header */}
      <div className="text-center mb-6">
        <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
          <Smartphone className="w-8 h-8 text-blue-600" />
        </div>
        <h3 className="text-xl font-semibold text-gray-900">UPI Payment</h3>
        <p className="text-gray-600 mt-2">
          Pay {formatPrice(orderData.amount)} using your UPI app
        </p>
      </div>

      {/* Input Step */}
      {paymentStep === 'input' && (
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Enter your UPI ID
            </label>
            <input
              type="text"
              value={upiId}
              onChange={(e) => setUpiId(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              placeholder="yourname@paytm / yourname@gpay"
              disabled={isProcessing}
            />
            <p className="text-xs text-gray-500 mt-1">
              Enter your UPI ID (e.g., 9876543210@paytm, name@gpay)
            </p>
          </div>

          {/* Popular UPI Apps */}
          <div>
            <p className="text-sm font-medium text-gray-700 mb-3">Popular UPI Apps:</p>
            <div className="grid grid-cols-2 gap-2">
              {[
                { name: 'Google Pay', suffix: '@oksbi' },
                { name: 'PhonePe', suffix: '@ybl' },
                { name: 'Paytm', suffix: '@paytm' },
                { name: 'BHIM', suffix: '@upi' }
              ].map((app) => (
                <button
                  key={app.name}
                  onClick={() => setUpiId(upiId.split('@')[0] + app.suffix)}
                  className="text-xs py-2 px-3 bg-gray-100 hover:bg-gray-200 rounded-lg text-gray-700 transition-colors"
                  disabled={isProcessing}
                >
                  {app.name}
                </button>
              ))}
            </div>
          </div>

          <button
            onClick={handleUPIPayment}
            disabled={!upiId || isProcessing}
            className="w-full bg-blue-600 hover:bg-blue-700 disabled:bg-gray-400 text-white font-medium py-3 rounded-lg transition-colors flex items-center justify-center"
          >
            {isProcessing ? (
              <>
                <Loader className="w-5 h-5 mr-2 animate-spin" />
                Processing...
              </>
            ) : (
              'Pay with UPI'
            )}
          </button>
        </div>
      )}

      {/* Processing Step */}
      {paymentStep === 'processing' && (
        <div className="text-center py-8">
          <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <Loader className="w-8 h-8 text-blue-600 animate-spin" />
          </div>
          <h4 className="text-lg font-semibold text-gray-900 mb-2">Processing Payment</h4>
          <p className="text-gray-600">
            Please check your UPI app and approve the payment
          </p>
          <div className="mt-4 p-3 bg-yellow-50 rounded-lg border border-yellow-200">
            <p className="text-sm text-yellow-800">
              Open your UPI app and approve the payment request for {formatPrice(orderData.amount)}
            </p>
          </div>
        </div>
      )}

      {/* Success Step */}
      {paymentStep === 'success' && paymentResult && (
        <div className="text-center py-8">
          <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <CheckCircle className="w-8 h-8 text-green-600" />
          </div>
          <h4 className="text-lg font-semibold text-gray-900 mb-2">Payment Successful!</h4>
          <p className="text-gray-600 mb-4">
            Your payment of {formatPrice(orderData.amount)} has been processed
          </p>
          
          <div className="bg-green-50 rounded-lg p-4 mb-4">
            <div className="text-sm space-y-2">
              <div className="flex justify-between">
                <span className="text-gray-600">Transaction ID:</span>
                <span className="font-medium text-gray-900">{paymentResult.upiTransactionId}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Payment ID:</span>
                <span className="font-medium text-gray-900">{paymentResult.paymentId}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Amount:</span>
                <span className="font-medium text-gray-900">{formatPrice(orderData.amount)}</span>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Error Step */}
      {paymentStep === 'error' && (
        <div className="text-center py-8">
          <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <XCircle className="w-8 h-8 text-red-600" />
          </div>
          <h4 className="text-lg font-semibold text-gray-900 mb-2">Payment Failed</h4>
          <p className="text-gray-600 mb-4">
            Your UPI payment could not be processed. Please try again.
          </p>
          
          <div className="space-y-3">
            <button
              onClick={resetPayment}
              className="w-full bg-blue-600 hover:bg-blue-700 text-white font-medium py-2 rounded-lg transition-colors"
            >
              Try Again
            </button>
            <button
              onClick={() => window.history.back()}
              className="w-full bg-gray-100 hover:bg-gray-200 text-gray-700 font-medium py-2 rounded-lg transition-colors"
            >
              Choose Different Payment Method
            </button>
          </div>
        </div>
      )}

      {/* Demo Notice */}
      <div className="mt-6 p-3 bg-blue-50 rounded-lg border border-blue-200">
        <p className="text-xs text-blue-700 text-center">
          <strong>Demo Mode:</strong> This is a simulated UPI payment. No real money will be charged.
        </p>
      </div>
    </div>
  );
};

export default UPIPayment;