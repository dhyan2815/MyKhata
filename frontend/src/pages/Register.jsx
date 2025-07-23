import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { register } from '../api/auth';
import { useAuth } from '../context/AuthContext';
import { User, Mail, LockKeyhole, ArrowRight, Eye, EyeOff } from 'lucide-react';
import toast from 'react-hot-toast';
import Image from '../assets/illustration-img.jpg'

// Register component for user registration
const Register = () => {
  const navigate = useNavigate();
  const { login } = useAuth();
  // State for form data (name, email, password, confirmPassword)
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    confirmPassword: '',
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

  // Validate form before submission
  const validateForm = () => {
    if (formData.password.length < 6) {
      toast.error('Password must be at least 6 characters long');
      return false;
    }
    if (formData.password !== formData.confirmPassword) {
      toast.error('Passwords do not match');
      return false;
    }
    return true;
  };

  // Handle form submission
  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!validateForm()) {
      return;
    }

    setIsLoading(true);
    try {
      // Call register API with form data
      const userData = await register({
        name: formData.name,
        email: formData.email,
        password: formData.password,
      });

      // Log in the user after successful registration
      login(userData, userData.token);
      toast.success('Registration successful');
      // Redirect to home page
      navigate('/');
    } catch (error) {
      // Show error message if registration fails
      toast.error(error.response?.data?.message || 'Registration failed');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-white flex">

      {/* Registration Form Section */}
      <div className="w-1/2 flex flex-col justify-center pt-1 sm:px-6 lg:px-8">

        <div className="sm:mx-auto sm:w-full sm:max-w-md">
          <div className="sm:rounded-lg sm:px-30">
            {/* Registration form */}
            <form className="space-y-6" onSubmit={handleSubmit}>
              <div>
                <h2 className="text-2xl font-extrabold text-gray-900">
                  Start smart with MyKhata
                </h2>
                <p className="mt-2 text-sm text-gray-600">
                  Create your account to get started
                </p>
              </div>
              {/* Name input */}
              <div>
                <label htmlFor="name" className="block text-sm font-medium text-gray-700">
                  Full Name
                </label>
                <div className="mt-1 relative rounded-md shadow-sm">
                  {/* User icon */}
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <User size={16} className="text-gray-400" />
                  </div>
                  <input
                    id="name"
                    name="name"
                    type="text"
                    autoComplete="name"
                    required
                    value={formData.name}
                    onChange={handleChange}
                    className="input pl-10"
                    placeholder="John Doe"
                  />
                </div>
              </div>

              {/* Email input */}
              <div>
                <label htmlFor="email" className="block text-sm font-medium text-gray-700">
                  Email address
                </label>
                <div className="mt-1 relative rounded-md shadow-sm">
                  {/* Mail icon */}
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
                  {/* Lock icon */}
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <LockKeyhole size={16} className="text-gray-400" />
                  </div>
                  <input
                    id="password"
                    name="password"
                    type={showPassword ? "text" : "password"}
                    autoComplete="new-password"
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
                <p className="mt-1 text-xs text-gray-500">
                  Password must be at least 6 characters long
                </p>
              </div>

              {/* Confirm Password input */}
              <div>
                <label htmlFor="confirmPassword" className="block text-sm font-medium text-gray-700">
                  Confirm Password
                </label>
                <div className="mt-1 relative rounded-md shadow-sm">
                  {/* Lock icon */}
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <LockKeyhole size={16} className="text-gray-400" />
                  </div>
                  <input
                    id="confirmPassword"
                    name="confirmPassword"
                    type="password"
                    autoComplete="new-password"
                    required
                    value={formData.confirmPassword}
                    onChange={handleChange}
                    className="input pl-10"
                    placeholder="••••••••"
                  />
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
                    <div className="flex items-center justify-center">
                      {/* Loading spinner */}
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
                      Creating account...
                    </div>
                  ) : (
                    'Create Account'
                  )}
                </button>
              </div>
            </form>

            {/* Divider and link to login */}
            <div className="mt-6">
              <div className="relative">
                <div className="absolute inset-0 flex items-center">
                  <div className="w-full border-t border-gray-300"></div>
                </div>
                <div className="relative flex justify-center text-sm">
                  <span className="px-2 bg-white text-gray-500">
                    Already have an account?
                  </span>
                </div>
              </div>

              {/* Link to login page */}
              <div className="mt-6">
                <Link
                  to="/login"
                  className="w-full flex items-center justify-center py-2 px-4 border border-gray-300 rounded-md shadow-sm bg-white text-sm font-medium text-gray-700 hover:bg-gray-50"
                >
                  Sign in
                  <ArrowRight size={16} className="ml-2" />
                </Link>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Image Section */}
      <div className="w-1/2 h-screen">
        <img
          src={Image}
          alt="Register"
          className="w-full h-full object-cover"
        />
      </div>

    </div>
  );
};

export default Register;