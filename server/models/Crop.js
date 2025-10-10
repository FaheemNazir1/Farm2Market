const mongoose = require('mongoose');

const cropSchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, 'Crop name is required'],
    trim: true
  },
  category: {
    type: String,
    required: [true, 'Crop category is required'],
    enum: [
      'Cereals', 'Pulses', 'Oilseeds', 'Vegetables', 'Fruits', 
      'Spices', 'Medicinal Plants', 'Flowers', 'Others'
    ]
  },
  variety: {
    type: String,
    required: [true, 'Crop variety is required']
  },
  description: {
    type: String,
    required: [true, 'Description is required'],
    maxlength: [1000, 'Description cannot exceed 1000 characters']
  },
  farmer: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  images: [{
    url: { type: String, required: true },
    alt: { type: String, default: '' }
  }],
  quantity: {
    value: { type: Number, required: [true, 'Quantity is required'] },
    unit: { 
      type: String, 
      required: true,
      enum: ['kg', 'quintal', 'tonne', 'piece', 'dozen', 'bunch']
    }
  },
  price: {
    perUnit: { type: Number, required: [true, 'Price per unit is required'] },
    currency: { type: String, default: 'INR' }
  },
  location: {
    state: { type: String, required: true },
    district: { type: String, required: true },
    pincode: { type: String, required: true }
  },
  harvestDate: {
    type: Date,
    required: [true, 'Harvest date is required']
  },
  expiryDate: {
    type: Date,
    required: [true, 'Expiry date is required']
  },
  quality: {
    grade: { 
      type: String, 
      enum: ['Premium', 'Grade A', 'Grade B', 'Grade C'],
      default: 'Grade A'
    },
    organic: { type: Boolean, default: false },
    certified: { type: Boolean, default: false },
    moistureContent: Number,
    purity: Number
  },
  packaging: {
    type: { type: String, default: 'Standard' },
    weight: Number,
    description: String
  },
  availability: {
    status: { 
      type: String, 
      enum: ['available', 'sold', 'reserved'],
      default: 'available'
    },
    minimumOrder: { type: Number, default: 1 },
    maximumOrder: Number
  },
  delivery: {
    available: { type: Boolean, default: false },
    radius: Number, // in km
    charges: { type: Number, default: 0 },
    estimatedDays: Number
  },
  tags: [String],
  views: { type: Number, default: 0 },
  favorites: [{ type: mongoose.Schema.Types.ObjectId, ref: 'User' }],
  isActive: { type: Boolean, default: true },
  featured: { type: Boolean, default: false }
}, {
  timestamps: true
});

// Index for search functionality
cropSchema.index({ name: 'text', description: 'text', category: 'text' });
cropSchema.index({ location: 1, category: 1 });
cropSchema.index({ farmer: 1, isActive: 1 });

// Virtual for total price
cropSchema.virtual('totalPrice').get(function() {
  return this.price.perUnit * this.quantity.value;
});

// Method to check if crop is available
cropSchema.methods.isAvailable = function() {
  return this.availability.status === 'available' && 
         this.isActive && 
         new Date() < this.expiryDate;
};

module.exports = mongoose.model('Crop', cropSchema);
