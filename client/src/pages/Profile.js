import React, { useState } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { 
  User, 
  Mail, 
  Phone, 
  MapPin, 
  Camera, 
  Save, 
  Edit3,
  Key,
  Award,
  Building,
  Leaf
} from 'lucide-react';
import LoadingSpinner from '../components/UI/LoadingSpinner';
import toast from 'react-hot-toast';

const Profile = () => {
  const { user, updateProfile, changePassword, isFarmer, isBuyer } = useAuth();
  const [activeTab, setActiveTab] = useState('profile');
  const [isEditing, setIsEditing] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  const [profileData, setProfileData] = useState({
    name: user?.name || '',
    phone: user?.phone || '',
    address: {
      street: user?.address?.street || '',
      city: user?.address?.city || '',
      state: user?.address?.state || '',
      pincode: user?.address?.pincode || ''
    },
    farmDetails: {
      farmName: user?.farmDetails?.farmName || '',
      farmSize: user?.farmDetails?.farmSize || '',
      farmingExperience: user?.farmDetails?.farmingExperience || '',
      organicCertified: user?.farmDetails?.organicCertified || false
    },
    businessDetails: {
      businessName: user?.businessDetails?.businessName || '',
      businessType: user?.businessDetails?.businessType || '',
      gstNumber: user?.businessDetails?.gstNumber || '',
      licenseNumber: user?.businessDetails?.licenseNumber || ''
    }
  });

  const [passwordData, setPasswordData] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: ''
  });

  const states = [
    'Andhra Pradesh', 'Arunachal Pradesh', 'Assam', 'Bihar', 'Chhattisgarh',
    'Goa', 'Gujarat', 'Haryana', 'Himachal Pradesh', 'Jharkhand',
    'Karnataka', 'Kerala', 'Madhya Pradesh', 'Maharashtra', 'Manipur',
    'Meghalaya', 'Mizoram', 'Nagaland', 'Odisha', 'Punjab',
    'Rajasthan', 'Sikkim', 'Tamil Nadu', 'Telangana', 'Tripura',
    'Uttar Pradesh', 'Uttarakhand', 'West Bengal', 'Delhi', 'Chandigarh'
  ];

  const businessTypes = [
    'Restaurant', 'Hotel', 'Catering', 'Retail Store', 'Supermarket',
    'Food Processing', 'Export', 'Wholesale', 'Other'
  ];

  const handleProfileChange = (e) => {
    const { name, value, type, checked } = e.target;
    
    if (name.startsWith('address.')) {
      const field = name.split('.')[1];
      setProfileData(prev => ({
        ...prev,
        address: {
          ...prev.address,
          [field]: value
        }
      }));
    } else if (name.startsWith('farmDetails.')) {
      const field = name.split('.')[1];
      setProfileData(prev => ({
        ...prev,
        farmDetails: {
          ...prev.farmDetails,
          [field]: type === 'checkbox' ? checked : value
        }
      }));
    } else if (name.startsWith('businessDetails.')) {
      const field = name.split('.')[1];
      setProfileData(prev => ({
        ...prev,
        businessDetails: {
          ...prev.businessDetails,
          [field]: value
        }
      }));
    } else {
      setProfileData(prev => ({
        ...prev,
        [name]: value
      }));
    }
  };

  const handlePasswordChange = (e) => {
    setPasswordData({
      ...passwordData,
      [e.target.name]: e.target.value
    });
  };

  const handleProfileSave = async () => {
    setIsLoading(true);
    try {
      const result = await updateProfile(profileData);
      if (result.success) {
        setIsEditing(false);
      }
    } catch (error) {
      console.error('Profile update error:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handlePasswordSave = async (e) => {
    e.preventDefault();
    
    if (passwordData.newPassword !== passwordData.confirmPassword) {
      toast.error('New passwords do not match');
      return;
    }

    if (passwordData.newPassword.length < 6) {
      toast.error('New password must be at least 6 characters');
      return;
    }

    setIsLoading(true);
    try {
      const result = await changePassword(passwordData.currentPassword, passwordData.newPassword);
      if (result.success) {
        setPasswordData({
          currentPassword: '',
          newPassword: '',
          confirmPassword: ''
        });
      }
    } catch (error) {
      console.error('Password change error:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const formatDate = (date) => {
    return new Date(date).toLocaleDateString('en-IN', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-bold text-gray-900">Profile Settings</h1>
              <p className="text-gray-600">Manage your account information and preferences</p>
            </div>
            {isEditing && (
              <div className="flex space-x-3">
                <button
                  onClick={() => setIsEditing(false)}
                  className="btn-secondary"
                >
                  Cancel
                </button>
                <button
                  onClick={handleProfileSave}
                  disabled={isLoading}
                  className="btn-primary flex items-center"
                >
                  {isLoading ? <LoadingSpinner size="small" /> : <Save className="w-5 h-5 mr-2" />}
                  Save Changes
                </button>
              </div>
            )}
          </div>
        </div>
      </div>

      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
          {/* Sidebar */}
          <div className="lg:col-span-1">
            <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 sticky top-24">
              <nav className="space-y-2">
                <button
                  onClick={() => setActiveTab('profile')}
                  className={`w-full text-left px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
                    activeTab === 'profile'
                      ? 'bg-primary-100 text-primary-700'
                      : 'text-gray-700 hover:bg-gray-100'
                  }`}
                >
                  Profile Information
                </button>
                <button
                  onClick={() => setActiveTab('password')}
                  className={`w-full text-left px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
                    activeTab === 'password'
                      ? 'bg-primary-100 text-primary-700'
                      : 'text-gray-700 hover:bg-gray-100'
                  }`}
                >
                  Change Password
                </button>
              </nav>
            </div>
          </div>

          {/* Main Content */}
          <div className="lg:col-span-3">
            {/* Profile Tab */}
            {activeTab === 'profile' && (
              <div className="space-y-6">
                {/* Profile Header */}
                <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
                  <div className="flex items-center space-x-6">
                    <div className="relative">
                      <div className="w-24 h-24 bg-primary-100 rounded-full flex items-center justify-center">
                        <User className="w-12 h-12 text-primary-600" />
                      </div>
                      <button className="absolute bottom-0 right-0 w-8 h-8 bg-primary-600 rounded-full flex items-center justify-center hover:bg-primary-700 transition-colors">
                        <Camera className="w-4 h-4 text-white" />
                      </button>
                    </div>
                    <div className="flex-1">
                      <h2 className="text-2xl font-bold text-gray-900">{user?.name}</h2>
                      <p className="text-gray-600 capitalize">{user?.userType}</p>
                      <div className="flex items-center space-x-4 mt-2 text-sm text-gray-500">
                        <div className="flex items-center space-x-1">
                          <Mail className="w-4 h-4" />
                          <span>{user?.email}</span>
                        </div>
                        <div className="flex items-center space-x-1">
                          <Phone className="w-4 h-4" />
                          <span>{user?.phone}</span>
                        </div>
                      </div>
                    </div>
                    {!isEditing && (
                      <button
                        onClick={() => setIsEditing(true)}
                        className="btn-outline flex items-center"
                      >
                        <Edit3 className="w-5 h-5 mr-2" />
                        Edit Profile
                      </button>
                    )}
                  </div>
                </div>

                {/* Basic Information */}
                <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
                  <h3 className="text-lg font-semibold text-gray-900 mb-6">Basic Information</h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Full Name
                      </label>
                      <input
                        type="text"
                        name="name"
                        value={profileData.name}
                        onChange={handleProfileChange}
                        disabled={!isEditing}
                        className={`input-field ${!isEditing ? 'bg-gray-50' : ''}`}
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Email Address
                      </label>
                      <input
                        type="email"
                        value={user?.email}
                        disabled
                        className="input-field bg-gray-50"
                      />
                      <p className="text-xs text-gray-500 mt-1">Email cannot be changed</p>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Phone Number
                      </label>
                      <input
                        type="tel"
                        name="phone"
                        value={profileData.phone}
                        onChange={handleProfileChange}
                        disabled={!isEditing}
                        className={`input-field ${!isEditing ? 'bg-gray-50' : ''}`}
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Account Type
                      </label>
                      <input
                        type="text"
                        value={user?.userType?.charAt(0).toUpperCase() + user?.userType?.slice(1)}
                        disabled
                        className="input-field bg-gray-50"
                      />
                    </div>
                  </div>
                </div>

                {/* Address Information */}
                <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
                  <h3 className="text-lg font-semibold text-gray-900 mb-6">Address Information</h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="md:col-span-2">
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Street Address
                      </label>
                      <input
                        type="text"
                        name="address.street"
                        value={profileData.address.street}
                        onChange={handleProfileChange}
                        disabled={!isEditing}
                        className={`input-field ${!isEditing ? 'bg-gray-50' : ''}`}
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        City
                      </label>
                      <input
                        type="text"
                        name="address.city"
                        value={profileData.address.city}
                        onChange={handleProfileChange}
                        disabled={!isEditing}
                        className={`input-field ${!isEditing ? 'bg-gray-50' : ''}`}
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        State
                      </label>
                      <select
                        name="address.state"
                        value={profileData.address.state}
                        onChange={handleProfileChange}
                        disabled={!isEditing}
                        className={`input-field ${!isEditing ? 'bg-gray-50' : ''}`}
                      >
                        <option value="">Select State</option>
                        {states.map(state => (
                          <option key={state} value={state}>{state}</option>
                        ))}
                      </select>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Pincode
                      </label>
                      <input
                        type="text"
                        name="address.pincode"
                        value={profileData.address.pincode}
                        onChange={handleProfileChange}
                        disabled={!isEditing}
                        className={`input-field ${!isEditing ? 'bg-gray-50' : ''}`}
                      />
                    </div>
                  </div>
                </div>

                {/* Farmer Specific Information */}
                {isFarmer && (
                  <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
                    <h3 className="text-lg font-semibold text-gray-900 mb-6 flex items-center">
                      <Leaf className="w-5 h-5 mr-2 text-primary-600" />
                      Farm Information
                    </h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Farm Name
                        </label>
                        <input
                          type="text"
                          name="farmDetails.farmName"
                          value={profileData.farmDetails.farmName}
                          onChange={handleProfileChange}
                          disabled={!isEditing}
                          className={`input-field ${!isEditing ? 'bg-gray-50' : ''}`}
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Farm Size
                        </label>
                        <input
                          type="text"
                          name="farmDetails.farmSize"
                          value={profileData.farmDetails.farmSize}
                          onChange={handleProfileChange}
                          disabled={!isEditing}
                          className={`input-field ${!isEditing ? 'bg-gray-50' : ''}`}
                          placeholder="e.g., 5 acres, 2 hectares"
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Years of Experience
                        </label>
                        <input
                          type="number"
                          name="farmDetails.farmingExperience"
                          value={profileData.farmDetails.farmingExperience}
                          onChange={handleProfileChange}
                          disabled={!isEditing}
                          className={`input-field ${!isEditing ? 'bg-gray-50' : ''}`}
                          min="0"
                        />
                      </div>
                      <div className="flex items-center">
                        <input
                          type="checkbox"
                          name="farmDetails.organicCertified"
                          checked={profileData.farmDetails.organicCertified}
                          onChange={handleProfileChange}
                          disabled={!isEditing}
                          className="h-4 w-4 text-primary-600 focus:ring-primary-500 border-gray-300 rounded"
                        />
                        <label className="ml-2 block text-sm text-gray-900">
                          Organic Certified
                        </label>
                      </div>
                    </div>
                  </div>
                )}

                {/* Buyer Specific Information */}
                {isBuyer && (
                  <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
                    <h3 className="text-lg font-semibold text-gray-900 mb-6 flex items-center">
                      <Building className="w-5 h-5 mr-2 text-primary-600" />
                      Business Information
                    </h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Business Name
                        </label>
                        <input
                          type="text"
                          name="businessDetails.businessName"
                          value={profileData.businessDetails.businessName}
                          onChange={handleProfileChange}
                          disabled={!isEditing}
                          className={`input-field ${!isEditing ? 'bg-gray-50' : ''}`}
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Business Type
                        </label>
                        <select
                          name="businessDetails.businessType"
                          value={profileData.businessDetails.businessType}
                          onChange={handleProfileChange}
                          disabled={!isEditing}
                          className={`input-field ${!isEditing ? 'bg-gray-50' : ''}`}
                        >
                          <option value="">Select Business Type</option>
                          {businessTypes.map(type => (
                            <option key={type} value={type}>{type}</option>
                          ))}
                        </select>
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          GST Number
                        </label>
                        <input
                          type="text"
                          name="businessDetails.gstNumber"
                          value={profileData.businessDetails.gstNumber}
                          onChange={handleProfileChange}
                          disabled={!isEditing}
                          className={`input-field ${!isEditing ? 'bg-gray-50' : ''}`}
                          placeholder="Optional"
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          License Number
                        </label>
                        <input
                          type="text"
                          name="businessDetails.licenseNumber"
                          value={profileData.businessDetails.licenseNumber}
                          onChange={handleProfileChange}
                          disabled={!isEditing}
                          className={`input-field ${!isEditing ? 'bg-gray-50' : ''}`}
                          placeholder="Optional"
                        />
                      </div>
                    </div>
                  </div>
                )}

                {/* Account Information */}
                <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
                  <h3 className="text-lg font-semibold text-gray-900 mb-6 flex items-center">
                    <Award className="w-5 h-5 mr-2 text-primary-600" />
                    Account Information
                  </h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Member Since
                      </label>
                      <input
                        type="text"
                        value={formatDate(user?.createdAt)}
                        disabled
                        className="input-field bg-gray-50"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Account Status
                      </label>
                      <input
                        type="text"
                        value={user?.isVerified ? 'Verified' : 'Pending Verification'}
                        disabled
                        className={`input-field ${user?.isVerified ? 'bg-green-50' : 'bg-yellow-50'}`}
                      />
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* Password Tab */}
            {activeTab === 'password' && (
              <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-6 flex items-center">
                  <Key className="w-5 h-5 mr-2 text-primary-600" />
                  Change Password
                </h3>
                <form onSubmit={handlePasswordSave} className="space-y-6">
                  <div>
                    <label htmlFor="currentPassword" className="block text-sm font-medium text-gray-700 mb-2">
                      Current Password
                    </label>
                    <input
                      type="password"
                      id="currentPassword"
                      name="currentPassword"
                      value={passwordData.currentPassword}
                      onChange={handlePasswordChange}
                      required
                      className="input-field"
                      placeholder="Enter your current password"
                    />
                  </div>
                  <div>
                    <label htmlFor="newPassword" className="block text-sm font-medium text-gray-700 mb-2">
                      New Password
                    </label>
                    <input
                      type="password"
                      id="newPassword"
                      name="newPassword"
                      value={passwordData.newPassword}
                      onChange={handlePasswordChange}
                      required
                      className="input-field"
                      placeholder="Enter your new password"
                    />
                  </div>
                  <div>
                    <label htmlFor="confirmPassword" className="block text-sm font-medium text-gray-700 mb-2">
                      Confirm New Password
                    </label>
                    <input
                      type="password"
                      id="confirmPassword"
                      name="confirmPassword"
                      value={passwordData.confirmPassword}
                      onChange={handlePasswordChange}
                      required
                      className="input-field"
                      placeholder="Confirm your new password"
                    />
                  </div>
                  <button
                    type="submit"
                    disabled={isLoading}
                    className="btn-primary flex items-center"
                  >
                    {isLoading ? <LoadingSpinner size="small" /> : <Key className="w-5 h-5 mr-2" />}
                    Change Password
                  </button>
                </form>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Profile;
