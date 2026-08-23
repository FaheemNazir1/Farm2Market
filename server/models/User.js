const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

const userSchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, 'Name is required'],
    trim: true,
    maxlength: [100, 'Name cannot exceed 100 characters']
  },
  email: {
    type: String,
    required: [true, 'Email is required'],
    unique: true,
    lowercase: true,
    trim: true
  },
  password: {
    type: String,
    required: [true, 'Password is required'],
    minlength: [6, 'Password must be at least 6 characters']
  },
  phone: {
    type: String,
    required: [true, 'Phone number is required'],
    // Allow standard 10-digit numbers AND placeholder for Google/OAuth users
    match: [/^[0-9]{10,11}$/, 'Please enter a valid phone number']
  },
  userType: {
    type: String,
    enum: ['farmer', 'buyer', 'admin'],
    default: 'buyer'
  },
  address: {
    street: { type: String, default: '' },
    city: { type: String, default: '' },
    state: { type: String, default: '' },
    pincode: { type: String, default: '000000' },
    country: { type: String, default: 'India' },
    coordinates: {
      latitude: Number,
      longitude: Number
    }
  },
  profileImage: {
    type: String,
    default: ''
  },
  isVerified: {
    type: Boolean,
    default: false
  },
  isActive: {
    type: Boolean,
    default: true
  },
  verificationToken: String,
  resetPasswordToken: String,
  resetPasswordExpire: Date,
  // OAuth fields
  authProvider: {
    type: String,
    enum: ['local', 'google'],
    default: 'local'
  },
  firebaseUid: {
    type: String,
    default: null
  },
  // Farmer-specific fields
  farmDetails: {
    farmName: String,
    farmSize: String,
    farmingExperience: Number,
    certifications: [String],
    organicCertified: { type: Boolean, default: false }
  },
  // Buyer-specific fields
  businessDetails: {
    businessName: String,
    businessType: String,
    gstNumber: String,
    licenseNumber: String
  },
  rating: {
    average: { type: Number, default: 0 },
    count: { type: Number, default: 0 }
  }
}, {
  timestamps: true
});

// Hash password before saving — ONLY when password field is modified
userSchema.pre('save', async function(next) {
  if (!this.isModified('password')) return next();
  this.password = await bcrypt.hash(this.password, 12);
  next();
});

// Compare password method
userSchema.methods.comparePassword = async function(enteredPassword) {
  return await bcrypt.compare(enteredPassword, this.password);
};

// Generate JWT token
userSchema.methods.getJwtToken = function() {
  const jwt = require('jsonwebtoken');
  return jwt.sign({ id: this._id }, process.env.JWT_SECRET, {
    expiresIn: process.env.JWT_EXPIRE || '7d'
  });
};

module.exports = mongoose.model('User', userSchema);
