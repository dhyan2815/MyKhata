import { useState, useEffect } from 'react';
import { getUserProfile, updateUserProfile } from '../api/auth';
import { useAuth } from '../context/AuthContext';
import { User, Mail, Save, Sun, IndianRupee } from 'lucide-react';
import toast from 'react-hot-toast';
import ToggleMode from '../components/common/ToggleMode';
import { Helmet } from 'react-helmet-async';
import { motion } from 'framer-motion';

// Profile component for user profile management
const Profile = () => {
  // Get user and updateUser function from AuthContext
  const { user, updateUser } = useAuth();

  // State for form data
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    confirmPassword: '',
    currency: 'INR',
  });

  // State for loading indicator (profile fetch)
  const [loading, setLoading] = useState(true);
  // State for form submission indicator
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Supported currencies for selection
  const currencies = [
    { code: 'USD', name: 'US Dollar ($)' },
    { code: 'EUR', name: 'Euro (€)' },
    { code: 'GBP', name: 'British Pound (£)' },
    { code: 'JPY', name: 'Japanese Yen (¥)' },
    { code: 'CAD', name: 'Canadian Dollar (C$)' },
    { code: 'AUD', name: 'Australian Dollar (A$)' },
    { code: 'INR', name: 'Indian Rupee (₹)' },
    { code: 'CNY', name: 'Chinese Yuan (¥)' },
  ];

  // Fetch user profile data on mount
  useEffect(() => {
    const fetchProfile = async () => {
      setLoading(true);
      try {
        const userData = await getUserProfile();
        setFormData({
          name: userData.name,
          email: userData.email,
          password: '',
          confirmPassword: '',
          currency: userData.currency || 'INR',
        });
      } catch (error) {
        toast.error('Failed to load profile data');
      } finally {
        setLoading(false);
      }
    };

    fetchProfile();
  }, []);

  // Handle input changes for form fields
  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
  };

  // Validate form before submission
  const validateForm = () => {
    if (formData.password && formData.password.length < 6) {
      toast.error('Password must be at least 6 characters long');
      return false;
    }
    if (formData.password && formData.password !== formData.confirmPassword) {
      toast.error('Passwords do not match');
      return false;
    }
    return true;
  };

  // Handle form submission for profile update
  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validateForm()) return;

    // Prepare update data
    const updateData = {
      name: formData.name,
      email: formData.email,
      currency: formData.currency,
    };

    // Include password if provided
    if (formData.password) {
      updateData.password = formData.password;
    }

    setIsSubmitting(true);
    try {
      // Update user profile via API
      const updatedUser = await updateUserProfile(updateData);
      updateUser(updatedUser); // Update user in context
      toast.success('Profile updated successfully');
      // Reset password fields after update
      setFormData({
        ...formData,
        password: '',
        confirmPassword: '',
      });
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to update profile');
    } finally {
      setIsSubmitting(false);
    }
  };

  // Show loading spinner while fetching profile
  if (loading) {
    return (
      <div className="min-h-screen flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-teal-600"></div>
      </div>
    );
  }
  
  // Render profile form
  return (
    <motion.div 
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4 }}
      className="profile-page"
    >
      <Helmet>
        <title>Profile · MyKhata</title>
      </Helmet>

      <motion.div 
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.3, delay: 0.1 }}
        className="bg-white dark:bg-gray-900 p-4 sm:p-6 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700"
      >
        <form onSubmit={handleSubmit} className="space-y-4 sm:space-y-6">
          {/* User avatar or initial */}
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between mb-4 sm:mb-6 space-y-4 sm:space-y-0">
            <div>
              <h1 className="text-xl sm:text-2xl font-bold text-gray-900 dark:text-white">Profile Settings</h1>
              <p className="text-sm sm:text-base text-gray-600 dark:text-gray-400 mt-1">Manage your account details</p>
            </div>
            <div className="h-20 w-20 sm:h-24 sm:w-24 rounded-full bg-teal-600 text-white flex items-center justify-center text-xl sm:text-2xl self-center sm:self-auto">
              {user?.name?.charAt(0).toUpperCase() || <User size={28} className="sm:w-8 sm:h-8" />}
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 sm:gap-6">
            {/* Name */}
            <div>
              <label htmlFor="name" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Full Name</label>
              <div className="relative rounded-md shadow-sm">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <User size={16} className="text-gray-400 dark:text-gray-500" />
                </div>
                <input
                  id="name"
                  name="name"
                  type="text"
                  autoComplete="name"
                  required
                  value={formData.name}
                  onChange={handleChange}
                  className="input pl-10 dark:bg-gray-800 dark:text-white dark:border-gray-600"
                />
              </div>
            </div>

            {/* Email */}
            <div>
              <label htmlFor="email" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Email Address</label>
              <div className="relative rounded-md shadow-sm">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <Mail size={16} className="text-gray-400 dark:text-gray-500" />
                </div>
                <input
                  id="email"
                  name="email"
                  type="email"
                  autoComplete="email"
                  required
                  value={formData.email}
                  onChange={handleChange}
                  className="input pl-10 dark:bg-gray-800 dark:text-white dark:border-gray-600"
                />
              </div>
            </div>

            {/* Currency */}
            <div>
              <label htmlFor="currency" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Preferred Currency</label>
              <div className="relative rounded-md shadow-sm">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <IndianRupee size={16} className="text-gray-400 dark:text-gray-500" />
                </div>
                <select
                  id="currency"
                  name="currency"
                  value={formData.currency}
                  onChange={handleChange}
                  className="input pl-10 appearance-none dark:bg-gray-800 dark:text-white dark:border-gray-600"
                >
                  {currencies.map(currency => (
                    <option key={currency.code} value={currency.code}>
                      {currency.name}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            {/* Theme Toggle */}
            <div>
              <label htmlFor="theme" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-4">Preferred Theme</label>
              <ToggleMode />
            </div>
          </div>

          {/* Change Password Section */}
          <div className="border-t border-gray-200 dark:border-gray-700 pt-4 sm:pt-6 mt-4 sm:mt-6">
            <h3 className="text-base sm:text-lg font-medium text-gray-900 dark:text-white mb-3 sm:mb-4">Change Password</h3>
            <p className="text-xs sm:text-sm text-gray-600 dark:text-gray-400 mb-3 sm:mb-4">
              Leave blank if you don't want to change your password
            </p>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 sm:gap-6">
              {/* Password */}
              <div>
                <label htmlFor="password" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">New Password</label>
                <input
                  id="password"
                  name="password"
                  type="password"
                  autoComplete="new-password"
                  value={formData.password}
                  onChange={handleChange}
                  className="input dark:bg-gray-800 dark:text-white dark:border-gray-600"
                  placeholder="••••••••"
                />
              </div>

              {/* Confirm Password */}
              <div>
                <label htmlFor="confirmPassword" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Confirm New Password</label>
                <input
                  id="confirmPassword"
                  name="confirmPassword"
                  type="password"
                  autoComplete="new-password"
                  value={formData.confirmPassword}
                  onChange={handleChange}
                  className="input dark:bg-gray-800 dark:text-white dark:border-gray-600"
                  placeholder="••••••••"
                />
              </div>
            </div>
          </div>

          {/* Save Button */}
          <div className="flex justify-end">
            <button
              type="submit"
              disabled={isSubmitting}
              className="btn btn-primary dark:bg-teal-700 dark:hover:bg-teal-800 dark:text-white"
            >
              {isSubmitting ? (
                <div className="flex items-center">
                  {/* Loading spinner while saving */}
                  <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                  Saving...
                </div>
              ) : (
                <div className="flex items-center">
                  <Save size={16} className="mr-2" />
                  Save Changes
                </div>
              )}
            </button>
          </div>
        </form>
      </motion.div>
    </motion.div>
  );
};

export default Profile;