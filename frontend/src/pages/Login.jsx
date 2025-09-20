import { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { login } from '../api/auth';
import { useAuth } from '../context/AuthContext';
import { 
  LockKeyhole, 
  Mail, 
  User, 
  EyeOff, 
  Eye, 
  ArrowRight, 
  Wallet,
  CheckCircle,
  Shield,
  Zap,
  ArrowLeft,
  Star,
  Users,
  TrendingUp,
  Receipt
} from 'lucide-react';
import toast from 'react-hot-toast';
import Image from '../assets/illustration-img.jpg';
import { Helmet } from 'react-helmet-async';
import { motion } from 'framer-motion';

// Enhanced Login component for user authentication
const Login = () => {
  const navigate = useNavigate();
  // Get login function and user from AuthContext
  const { login: authLogin, user } = useAuth();

  // State for form data (email and password)
  const [formData, setFormData] = useState({
    email: '',
    password: '',
  });

  // State for loading indicator (shows spinner on submit)
  const [isLoading, setIsLoading] = useState(false);

  // State to toggle password visibility
  const [showPassword, setShowPassword] = useState(false);

  // State for remember me checkbox
  const [rememberMe, setRememberMe] = useState(false);

  // Redirect if user is already logged in
  useEffect(() => {
    if (user) {
      // User is already logged in, redirect to dashboard
      navigate('/dashboard');
    }
  }, [user, navigate]);

  // Handle input changes for form fields
  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
  };

  // Handle form submission
  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    try {
      // Call login API with email and password
      const userData = await login(formData.email, formData.password);
      // Set user in auth context
      authLogin(userData, userData.token);
      toast.success('Welcome back! Login successful');
      // Redirect to dashboard after successful login
      navigate('/dashboard');
    } catch (error) {
      // Show error message if login fails
      toast.error(error.response?.data?.message || 'Login failed. Please check your credentials.');
    } finally {
      setIsLoading(false);
    }
  };

  // Quick benefits for returning users
  const quickBenefits = [
    { icon: <TrendingUp className="w-5 h-5 text-teal-600" />, text: "Track your financial growth" },
    { icon: <Receipt className="w-5 h-5 text-teal-600" />, text: "Scan receipts instantly" },
    { icon: <Shield className="w-5 h-5 text-teal-600" />, text: "Secure & encrypted data" }
  ];

  return (
    <motion.div 
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.5 }}
      className="min-h-screen bg-gradient-to-br from-teal-50 via-white to-teal-50"
    >
      <Helmet>
        <title>Sign In · MyKhata</title>
        <meta name="description" content="Sign in to your MyKhata account and continue managing your finances with smart budgeting tools." />
      </Helmet>

      {/* Navigation */}
      <nav className="bg-white/80 backdrop-blur-sm shadow-sm border-b border-gray-100">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <Link to="/" className="flex items-center">
              <Wallet className="w-8 h-8 text-teal-600" />
              <span className="ml-2 text-2xl font-bold text-gray-900">MyKhata</span>
            </Link>
            <div className="flex items-center space-x-4">
              <Link
                to="/"
                className="text-gray-600 hover:text-teal-600 px-3 py-2 rounded-md text-sm font-medium transition-colors flex items-center"
              >
                <ArrowLeft className="w-4 h-4 mr-1" />
                Back to Home
              </Link>
            </div>
          </div>
        </div>
      </nav>

      <div className="flex flex-col lg:flex-row min-h-screen">
        {/* Login Form Section */}
        <motion.div 
          initial={{ opacity: 0, x: -50 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.6, delay: 0.2 }}
          className="w-full lg:w-1/2 flex flex-col justify-center py-12 px-4 sm:px-6 lg:px-8"
        >
          <div className="sm:mx-auto sm:w-full sm:max-w-md">
            <div className="bg-white rounded-2xl shadow-xl p-8 lg:p-10">
              {/* Header */}
              <div className="text-center mb-8">
                <motion.div
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  transition={{ duration: 0.5, delay: 0.3 }}
                  className="w-16 h-16 bg-teal-100 rounded-full flex items-center justify-center mx-auto mb-4"
                >
                  <Wallet className="w-8 h-8 text-teal-600" />
                </motion.div>
                <h2 className="text-2xl lg:text-3xl font-bold text-gray-900 mb-2">
                  Welcome Back!
                </h2>
                <p className="text-gray-600">
                  Sign in to continue managing your finances
                </p>
              </div>

              {/* Login Form */}
              <form className="space-y-6" onSubmit={handleSubmit}>
                {/* Email input */}
                <div>
                  <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-2">
                    Email address
                  </label>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                      <Mail className="w-5 h-5 text-gray-400" />
                    </div>
                    <input
                      id="email"
                      name="email"
                      type="email"
                      autoComplete="email"
                      required
                      value={formData.email}
                      onChange={handleChange}
                      className="input pl-10 w-full h-12 text-base"
                      placeholder="youremail@example.com"
                    />
                  </div>
                </div>

                {/* Password input */}
                <div>
                  <label htmlFor="password" className="block text-sm font-medium text-gray-700 mb-2">
                    Password
                  </label>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                      <LockKeyhole className="w-5 h-5 text-gray-400" />
                    </div>
                    <input
                      id="password"
                      name="password"
                      type={showPassword ? "text" : "password"}
                      autoComplete="current-password"
                      required
                      value={formData.password}
                      onChange={handleChange}
                      className="input pl-10 pr-10 w-full h-12 text-base"
                      placeholder="Enter your password"
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword((prev) => !prev)}
                      className="absolute inset-y-0 right-0 pr-3 flex items-center text-gray-400 hover:text-gray-600 transition-colors"
                    >
                      {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                    </button>
                  </div>
                </div>

                {/* Remember me and forgot password */}
                <div className="flex items-center justify-between">
                  <div className="flex items-center">
                    <input
                      id="remember-me"
                      name="remember-me"
                      type="checkbox"
                      checked={rememberMe}
                      onChange={(e) => setRememberMe(e.target.checked)}
                      className="h-4 w-4 text-teal-600 focus:ring-teal-500 border-gray-300 rounded"
                    />
                    <label htmlFor="remember-me" className="ml-2 block text-sm text-gray-700">
                      Remember me
                    </label>
                  </div>
                  <div className="text-sm">
                    <a href="#" className="font-medium text-teal-600 hover:text-teal-500 transition-colors">
                      Forgot password?
                    </a>
                  </div>
                </div>

                {/* Submit button */}
                <div>
                  <button
                    type="submit"
                    disabled={isLoading}
                    className="w-full btn btn-primary py-3 text-base font-semibold rounded-lg shadow-lg hover:shadow-xl transition-all duration-200"
                  >
                    {isLoading ? (
                      <div className="flex items-center justify-center">
                        <svg className="animate-spin h-5 w-5 mr-3 text-white" viewBox="0 0 24 24">
                          <circle
                            className="opacity-25"
                            cx="12"
                            cy="12"
                            r="10"
                            stroke="currentColor"
                            strokeWidth="4"
                          ></circle>
                          <path
                            className="opacity-75"
                            fill="currentColor"
                            d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                          ></path>
                        </svg>
                        Signing in...
                      </div>
                    ) : (
                      <div className="flex items-center justify-center">
                        Sign In
                        <ArrowRight className="ml-2 w-5 h-5" />
                      </div>
                    )}
                  </button>
                </div>
              </form>

              {/* Divider */}
              <div className="mt-8">
                <div className="relative">
                  <div className="absolute inset-0 flex items-center">
                    <div className="w-full border-t border-gray-300"></div>
                  </div>
                  <div className="relative flex justify-center text-sm">
                    <span className="px-4 bg-white text-gray-500">
                      Don't have an account?
                    </span>
                  </div>
                </div>

                {/* Link to registration */}
                <div className="mt-6">
                  <Link
                    to="/register"
                    className="w-full flex items-center justify-center py-3 px-4 border-2 border-gray-300 rounded-lg shadow-sm bg-white text-base font-medium text-gray-700 hover:border-teal-600 hover:text-teal-600 transition-all duration-200"
                  >
                    <User className="w-5 h-5 mr-2" />
                    Create an account
                  </Link>
                </div>
              </div>
            </div>

            {/* Quick Benefits */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.8 }}
              className="mt-8 grid grid-cols-1 sm:grid-cols-3 gap-4"
            >
              {quickBenefits.map((benefit, index) => (
                <div key={index} className="flex items-center justify-center space-x-2 text-sm text-gray-600">
                  {benefit.icon}
                  <span>{benefit.text}</span>
                </div>
              ))}
            </motion.div>
          </div>
        </motion.div>

        {/* Right Side - Enhanced Visual Section */}
        <motion.div 
          initial={{ opacity: 0, x: 50 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.6, delay: 0.4 }}
          className="hidden lg:flex lg:w-1/2 relative overflow-hidden"
        >
          {/* Background with gradient overlay */}
          <div className="absolute inset-0 bg-gradient-to-br from-teal-600 to-teal-800"></div>
          <div className="absolute inset-0 bg-black/20"></div>
          
          {/* Main image */}
          <img
            src={Image}
            alt="MyKhata Dashboard"
            className="w-full h-full object-cover relative z-10"
          />
          
          {/* Floating elements */}
          <motion.div
            animate={{ y: [0, -10, 0] }}
            transition={{ duration: 3, repeat: Infinity }}
            className="absolute top-20 right-8 bg-white/90 backdrop-blur-sm rounded-xl shadow-xl p-4 z-20"
          >
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 bg-green-100 rounded-full flex items-center justify-center">
                <TrendingUp className="w-5 h-5 text-green-600" />
              </div>
              <div>
                <div className="text-sm font-semibold text-gray-900">+15% Savings</div>
                <div className="text-xs text-gray-600">This month</div>
              </div>
            </div>
          </motion.div>

          <motion.div
            animate={{ y: [0, 10, 0] }}
            transition={{ duration: 3, repeat: Infinity, delay: 1 }}
            className="absolute bottom-32 left-8 bg-white/90 backdrop-blur-sm rounded-xl shadow-xl p-4 z-20"
          >
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 bg-teal-100 rounded-full flex items-center justify-center">
                <Receipt className="w-5 h-5 text-teal-600" />
              </div>
              <div>
                <div className="text-sm font-semibold text-gray-900">Receipt Scanned</div>
                <div className="text-xs text-gray-600">Auto-categorized</div>
              </div>
            </div>
          </motion.div>

          <motion.div
            animate={{ y: [0, -5, 0] }}
            transition={{ duration: 2.5, repeat: Infinity, delay: 0.5 }}
            className="absolute top-1/2 left-8 bg-white/90 backdrop-blur-sm rounded-xl shadow-xl p-4 z-20"
          >
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center">
                <Shield className="w-5 h-5 text-blue-600" />
              </div>
              <div>
                <div className="text-sm font-semibold text-gray-900">Secure</div>
                <div className="text-xs text-gray-600">256-bit encryption</div>
              </div>
            </div>
          </motion.div>

          {/* Overlay content */}
          <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/60 to-transparent p-8 z-20">
            <div className="text-white">
              <h3 className="text-2xl font-bold mb-2">Welcome Back to MyKhata</h3>
              <p className="text-teal-100 mb-4">
                Continue your financial journey with smart insights and effortless expense tracking.
              </p>
              <div className="flex items-center space-x-4 text-sm">
                <div className="flex items-center space-x-1">
                  <Users className="w-4 h-4" />
                  <span>10K+ users</span>
                </div>
                <div className="flex items-center space-x-1">
                  <Star className="w-4 h-4 text-yellow-400 fill-current" />
                  <span>4.9/5 rating</span>
                </div>
                <div className="flex items-center space-x-1">
                  <Shield className="w-4 h-4" />
                  <span>Secure</span>
                </div>
              </div>
            </div>
          </div>
        </motion.div>
      </div>
    </motion.div>
  );
};

export default Login;