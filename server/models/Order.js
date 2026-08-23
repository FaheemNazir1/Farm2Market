const mongoose = require('mongoose');

const orderSchema = new mongoose.Schema({
  orderNumber: {
    type: String,
    unique: true,
    sparse: true,
    default: null
  },
  buyer: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  farmer: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  items: [{
    crop: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Crop',
      required: true
    },
    quantity: {
      type: Number,
      required: true
    },
    unitPrice: {
      type: Number,
      required: true
    },
    totalPrice: {
      type: Number,
      required: true
    }
  }],
  totalAmount: {
    type: Number,
    required: true
  },
  deliveryCharges: {
    type: Number,
    default: 0
  },
  taxAmount: {
    type: Number,
    default: 0
  },
  finalAmount: {
    type: Number,
    required: true
  },
  status: {
    type: String,
    enum: [
      'pending', 'confirmed', 'processing', 'shipped', 
      'delivered', 'cancelled', 'refunded'
    ],
    default: 'pending'
  },
  paymentStatus: {
    type: String,
    enum: ['pending', 'paid', 'failed', 'refunded'],
    default: 'pending'
  },
  paymentMethod: {
    type: String,
    enum: ['card', 'upi', 'netbanking', 'wallet', 'cod', 'razorpay'],
    required: true
  },
  paymentId: String,
  shippingAddress: {
    name: { type: String, required: true },
    phone: { type: String, required: true },
    street: { type: String, required: true },
    city: { type: String, required: true },
    state: { type: String, required: true },
    pincode: { type: String, required: true },
    landmark: String
  },
  deliveryDate: Date,
  estimatedDelivery: Date,
  trackingInfo: {
    trackingNumber: String,
    carrier: String,
    status: String,
    updates: [{
      status: String,
      location: String,
      timestamp: Date,
      description: String
    }]
  },
  notes: {
    buyer: String,
    farmer: String,
    admin: String
  },
  ratings: {
    farmer: {
      rating: { type: Number, min: 1, max: 5 },
      review: String,
      date: Date
    },
    buyer: {
      rating: { type: Number, min: 1, max: 5 },
      review: String,
      date: Date
    }
  },
  isActive: {
    type: Boolean,
    default: true
  }
}, {
  timestamps: true
});

// Generate order number before saving
orderSchema.pre('save', async function(next) {
  if (!this.orderNumber) {
    try {
      const count = await this.constructor.countDocuments();
      this.orderNumber = `F2M${Date.now()}${String(count + 1).padStart(4, '0')}`;
    } catch (e) {
      this.orderNumber = `F2M${Date.now()}${String(Math.floor(Math.random() * 9999)).padStart(4, '0')}`;
    }
  }
  next();
});

// Index for efficient queries
orderSchema.index({ buyer: 1, createdAt: -1 });
orderSchema.index({ farmer: 1, createdAt: -1 });
// orderNumber index is already created by unique: true in schema
orderSchema.index({ status: 1, createdAt: -1 });

// Virtual for order status timeline
orderSchema.virtual('timeline').get(function() {
  return [
    { status: 'Order Placed', date: this.createdAt, completed: true },
    { status: 'Confirmed', date: this.status === 'confirmed' ? this.updatedAt : null, completed: this.status !== 'pending' },
    { status: 'Processing', date: this.status === 'processing' ? this.updatedAt : null, completed: ['processing', 'shipped', 'delivered'].includes(this.status) },
    { status: 'Shipped', date: this.status === 'shipped' ? this.updatedAt : null, completed: ['shipped', 'delivered'].includes(this.status) },
    { status: 'Delivered', date: this.status === 'delivered' ? this.updatedAt : null, completed: this.status === 'delivered' }
  ];
});

module.exports = mongoose.model('Order', orderSchema);
