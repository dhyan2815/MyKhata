import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { login } from '../api/auth';
import { useAuth } from '../context/AuthContext';
import { LockKeyhole, Mail, User, EyeOff, Eye } from 'lucide-react';
import toast from 'react-hot-toast';
import Image from '../assets/illustration-img.jpg'
import { Helmet } from 'react-helmet-async';
import { motion } from 'framer-motion';

// Login component for user authentication
const Login = () => {
  const navigate = useNavigate();
  // Get login function from AuthContext
  const { login: authLogin } = useAuth();

  // State for form data (email and password)
  const [formData, setFormData] = useState({
    email: '',
    password: '',
  });

  // State for loading indicator (shows spinner on submit)
  const [isLoading, setIsLoading] = useState(false);

  // State to toggle password visibility
  const [showPassword, setShowPassword] = useState(false);

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
      toast.success('Login successful');
      // Redirect to home page after successful login
      navigate('/');
    } catch (error) {
      // Show error message if login fails
      toast.error(error.response?.data?.message || 'Login failed');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <motion.div 
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.5 }}
      className="min-h-screen bg-white flex flex-col lg:flex-row"
    >
      <Helmet>
        <title>Login · MyKhata</title>
      </Helmet>
      {/* Login form section (left side) */}
      <motion.div 
        initial={{ opacity: 0, x: -50 }}
        animate={{ opacity: 1, x: 0 }}
        transition={{ duration: 0.6, delay: 0.2 }}
        className="w-full lg:w-1/2 flex flex-col justify-center pt-5 px-4 sm:px-6 lg:px-8"
      >
        <div className="mt-4 sm:mx-auto sm:w-full sm:max-w-md">
          <div className="sm:rounded-lg sm:px-30">
            {/* Login form */}
            <form className="space-y-4 sm:space-y-6" onSubmit={handleSubmit}>
              <div>
                <h2 className="mt-6 text-xl sm:text-2xl font-extrabold text-gray-900">
                  Balance Your Books! Not Just Your Life
                  <span className="hidden sm:inline"><br /></span>
                  <span className="block sm:inline"> With MyKhata</span>
                </h2>
                <p className="mt-2 text-sm text-gray-600">
                  Let's get you back in, Input your credentials below
                </p>
              </div>
              {/* Email input */}
              <div>
                <label htmlFor="email" className="block text-sm font-medium text-gray-700">
                  Email address
                </label>
                <div className="mt-1 relative rounded-md shadow-sm">
                  {/* Email icon */}
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <Mail size={16} className="text-gray-400" />
                  </div>
                  <input
                    id="email"
                    name="email"
                    type="email"
                    autoComplete="email"
                    required
                    value={formData.email}
                    onChange={handleChange}
                    className="input pl-10"
                    placeholder="youremail@example.com"
                  />
                </div>
              </div>

              {/* Password input */}
              <div>
                <label htmlFor="password" className="block text-sm font-medium text-gray-700">
                  Password
                </label>
                <div className="mt-1 relative rounded-md shadow-sm">
                  {/* Password icon */}
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <LockKeyhole size={16} className="text-gray-400" />
                  </div>
                  <input
                    id="password"
                    name="password"
                    type={showPassword ? "text" : "password"}
                    autoComplete="current-password"
                    required
                    value={formData.password}
                    onChange={handleChange}
                    className="input pl-10"
                    placeholder="••••••••"
                  />
                  {/* Password Visibility Toggle Button */}
                  <button
                    type="button"
                    onClick={() => setShowPassword((prev) => !prev)}
                    tabIndex={-1}
                    className="absolute inset-y-0 right-0 pr-3 flex items-center text-gray-400"
                  >
                    {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                  </button>
                </div>
              </div>

              {/* Submit button */}
              <div>
                <button
                  type="submit"
                  disabled={isLoading}
                  className="w-full btn btn-primary py-2"
                >
                  {isLoading ? (
                    // Loading spinner and text while signing in
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
                    'Sign in'
                  )}
                </button>
              </div>
            </form>

            {/* Divider and link to registration */}
            <div className="mt-6">
              <div className="relative">
                <div className="absolute inset-0 flex items-center">
                  <div className="w-full border-t border-gray-300"></div>
                </div>
                <div className="relative flex justify-center text-sm">
                  <span className="px-2 bg-white text-gray-500">
                    Don't have an account?
                  </span>
                </div>
              </div>

              {/* Link to registration page */}
              <div className="mt-6">
                <Link
                  to="/register"
                  className="w-full flex justify-center py-2 px-4 border border-gray-300 rounded-md shadow-sm bg-white text-sm font-medium text-gray-700 hover:bg-gray-50"
                >
                  <User size={16} className="mr-2" />
                  Create an account
                </Link>
              </div>
            </div>
          </div>
        </div>
      </motion.div>

      {/* Illustration image (right side) */}
      <motion.div 
        initial={{ opacity: 0, x: 50 }}
        animate={{ opacity: 1, x: 0 }}
        transition={{ duration: 0.6, delay: 0.4 }}
        className="hidden lg:block w-1/2 h-screen"
      >
        <img
          src={Image}
          alt="Login"
          className="w-full h-full object-cover"
        />
      </motion.div>
      
    </motion.div>
  );
};

export default Login;