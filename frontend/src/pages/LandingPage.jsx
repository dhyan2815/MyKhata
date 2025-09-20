import { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { 
  ArrowRight, 
  CheckCircle, 
  Smartphone, 
  BarChart3, 
  Camera, 
  Shield, 
  Zap,
  Users,
  Star,
  TrendingUp,
  Wallet,
  Receipt,
  PieChart,
  Download,
  Eye
} from 'lucide-react';
import { motion } from 'framer-motion';
import { Helmet } from 'react-helmet-async';
import Image from '../assets/illustration-img.jpg';

const LandingPage = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [currentTestimonial, setCurrentTestimonial] = useState(0);

  // Redirect if user is already logged in
  useEffect(() => {
    if (user) {
      navigate('/');
    }
  }, [user, navigate]);

  // Testimonials data
  const testimonials = [
    {
      name: "Dhyan Patel",
      role: "Software Engineer",
      content: "MyKhata transformed how I manage my finances. The receipt scanning feature saves me hours every week!",
      rating: 5
    },
    {
      name: "Dhruv Shah",
      role: "Freelancer",
      content: "Finally, a budgeting app that actually works. The analytics help me understand my spending patterns.",
      rating: 4
    },
    {
      name: "Vraj Bhatt",
      role: "Student",
      content: "Perfect for tracking my expenses as a student. The interface is so intuitive and clean.",
      rating: 4
    }
  ];

  // Features data
  const features = [
    {
      icon: <Smartphone className="w-8 h-8 text-teal-600" />,
      title: "Mobile-First Design",
      description: "Access your financial data anywhere, anytime with our responsive design"
    },
    {
      icon: <Camera className="w-8 h-8 text-teal-600" />,
      title: "Receipt Scanning",
      description: "Scan receipts with AI-powered OCR for automatic transaction entry"
    },
    {
      icon: <BarChart3 className="w-8 h-8 text-teal-600" />,
      title: "Smart Analytics",
      description: "Get insights into your spending patterns with beautiful charts and reports"
    },
    {
      icon: <Shield className="w-8 h-8 text-teal-600" />,
      title: "Secure & Private",
      description: "Your data is encrypted and secure with enterprise-grade security"
    },
    {
      icon: <Zap className="w-8 h-8 text-teal-600" />,
      title: "Lightning Fast",
      description: "Optimized for speed with instant loading and real-time updates"
    },
    {
      icon: <PieChart className="w-8 h-8 text-teal-600" />,
      title: "Smart Categorization",
      description: "Automatically categorize transactions with AI-powered smart suggestions"
    }
  ];

  // Stats data
  const stats = [
    { number: "10+", label: "Active Users" },
    { number: "100+", label: "Transactions Processed" },
    { number: "97.9%", label: "Uptime" },
    { number: "4.2/5", label: "User Rating" }
  ];

  // Auto-rotate testimonials
  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentTestimonial((prev) => (prev + 1) % testimonials.length);
    }, 5000);
    return () => clearInterval(interval);
  }, [testimonials.length]);

  return (
    <motion.div 
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.5 }}
      className="min-h-screen bg-white"
    >
      <Helmet>
        <title>MyKhata - Smart Financial Management Made Simple</title>
        <meta name="description" content="Transform your financial management with MyKhata. Track expenses, scan receipts, and get smart insights with our AI-powered budgeting app." />
      </Helmet>

      {/* Navigation */}
      <nav className="bg-white shadow-sm border-b border-gray-100">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center">
              <Wallet className="w-8 h-8 text-teal-600" />
              <span className="ml-2 text-2xl font-bold text-gray-900">MyKhata</span>
            </div>
            <div className="flex items-center space-x-4">
              <Link
                to="/login"
                className="text-gray-700 hover:text-teal-600 px-3 py-2 rounded-md text-sm font-medium transition-colors"
              >
                Sign In
              </Link>
              <Link
                to="/register"
                className="bg-teal-600 text-white hover:bg-teal-700 px-4 py-2 rounded-md text-sm font-medium transition-colors"
              >
                Get Started
              </Link>
            </div>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="relative overflow-hidden bg-gradient-to-br from-teal-50 to-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
            <motion.div
              initial={{ opacity: 0, x: -50 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.6 }}
              className="space-y-8"
            >
              <div className="space-y-4">
                <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold text-gray-900 leading-tight">
                  Balance Your Books,{' '}
                  <span className="text-teal-600">Not Just Your Life</span>
                </h1>
                <p className="text-xl text-gray-600 leading-relaxed">
                  Transform your financial management with MyKhata. Track expenses, scan receipts, 
                  and get smart insights with our AI-powered budgeting app.
                </p>
              </div>

              <div className="flex flex-col sm:flex-row gap-4">
                <Link
                  to="/register"
                  className="inline-flex items-center justify-center px-8 py-4 bg-teal-600 text-white text-lg font-semibold rounded-lg hover:bg-teal-700 transition-colors shadow-lg hover:shadow-xl"
                >
                  Create Free Account
                  <ArrowRight className="ml-2 w-5 h-5" />
                </Link>
                <button 
                  onClick={() => {
                    document.getElementById('features')?.scrollIntoView({ 
                      behavior: 'smooth',
                      block: 'start'
                    });
                  }}
                  className="inline-flex items-center justify-center px-8 py-4 border-2 border-gray-300 text-gray-700 text-lg font-semibold rounded-lg hover:border-teal-600 hover:text-teal-600 transition-colors"
                >
                  <Eye className="mr-2 w-5 h-5" />
                  Explore Features
                </button>
              </div>

              {/* Trust indicators */}
              <div className="flex items-center space-x-6 pt-4">
                <div className="flex items-center">
                  <div className="flex -space-x-2">
                    {[1, 2, 3, 4].map((i) => (
                      <div key={i} className="w-8 h-8 bg-teal-100 rounded-full border-2 border-white flex items-center justify-center">
                        <Users className="w-4 h-4 text-teal-600" />
                      </div>
                    ))}
                  </div>
                  <span className="ml-3 text-sm text-gray-600">10+ Happy Users</span>
                </div>
                <div className="flex items-center">
                  <div className="flex">
                    {[1, 2, 3, 4].map((i) => (
                      <Star key={i} className="w-4 h-4 text-yellow-400 fill-current" />
                    ))}
                  </div>
                  <span className="ml-2 text-sm text-gray-600">4.2/5 rating</span>
                </div>
              </div>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, x: 50 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.6, delay: 0.2 }}
              className="relative"
            >
              <div className="relative z-10">
                <img
                  src={Image}
                  alt="MyKhata Dashboard Preview"
                  className="w-full h-auto rounded-2xl shadow-2xl"
                />
                {/* Floating elements */}
                <motion.div
                  animate={{ y: [0, -10, 0] }}
                  transition={{ duration: 3, repeat: Infinity }}
                  className="absolute -top-4 -right-4 bg-white rounded-lg shadow-lg p-4"
                >
                  <div className="flex items-center space-x-2">
                    <TrendingUp className="w-5 h-5 text-green-600" />
                    <span className="text-sm font-semibold text-gray-900">+15% Savings</span>
                  </div>
                </motion.div>
                <motion.div
                  animate={{ y: [0, 10, 0] }}
                  transition={{ duration: 3, repeat: Infinity, delay: 1 }}
                  className="absolute -bottom-4 -left-4 bg-white rounded-lg shadow-lg p-4"
                >
                  <div className="flex items-center space-x-2">
                    <Receipt className="w-5 h-5 text-teal-600" />
                    <span className="text-sm font-semibold text-gray-900">Receipt Scanned</span>
                  </div>
                </motion.div>
              </div>
            </motion.div>
          </div>
        </div>
      </section>

      {/* Stats Section */}
      <section className="bg-gray-50 py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-8">
            {stats.map((stat, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: index * 0.1 }}
                className="text-center"
              >
                <div className="text-3xl lg:text-4xl font-bold text-teal-600 mb-2">
                  {stat.number}
                </div>
                <div className="text-gray-600 font-medium">{stat.label}</div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section id="features" className="py-20 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="text-center mb-16"
          >
            <h2 className="text-3xl lg:text-4xl font-bold text-gray-900 mb-4">
              Everything You Need to Manage Your Finances
            </h2>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto">
              Powerful features designed to make financial management simple, smart, and secure.
            </p>
          </motion.div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {features.map((feature, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: index * 0.1 }}
                className="bg-white p-8 rounded-xl shadow-lg hover:shadow-xl transition-shadow border border-gray-100"
              >
                <div className="mb-4">{feature.icon}</div>
                <h3 className="text-xl font-semibold text-gray-900 mb-3">{feature.title}</h3>
                <p className="text-gray-600">{feature.description}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Testimonials Section */}
      <section className="py-20 bg-gradient-to-br from-teal-50 to-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="text-center mb-16"
          >
            <h2 className="text-3xl lg:text-4xl font-bold text-gray-900 mb-4">
              What Our Users Say
            </h2>
            <p className="text-xl text-gray-600">
              Hear from real users who are improving their financial management with MyKhata
            </p>
          </motion.div>

          <motion.div
            key={currentTestimonial}
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.5 }}
            className="max-w-4xl mx-auto"
          >
            <div className="bg-white rounded-2xl shadow-xl p-8 lg:p-12 text-center">
              <div className="flex justify-center mb-6">
                {[...Array(testimonials[currentTestimonial].rating)].map((_, i) => (
                  <Star key={i} className="w-6 h-6 text-yellow-400 fill-current" />
                ))}
              </div>
              <blockquote className="text-xl lg:text-2xl text-gray-700 mb-8 leading-relaxed">
                "{testimonials[currentTestimonial].content}"
              </blockquote>
              <div className="flex items-center justify-center">
                <div className="w-12 h-12 bg-teal-100 rounded-full flex items-center justify-center mr-4">
                  <Users className="w-6 h-6 text-teal-600" />
                </div>
                <div className="text-left">
                  <div className="font-semibold text-gray-900">
                    {testimonials[currentTestimonial].name}
                  </div>
                  <div className="text-gray-600">
                    {testimonials[currentTestimonial].role}
                  </div>
                </div>
              </div>
            </div>
          </motion.div>

          {/* Testimonial indicators */}
          <div className="flex justify-center mt-8 space-x-2">
            {testimonials.map((_, index) => (
              <button
                key={index}
                onClick={() => setCurrentTestimonial(index)}
                className={`w-3 h-3 rounded-full transition-colors ${
                  index === currentTestimonial ? 'bg-teal-600' : 'bg-gray-300'
                }`}
              />
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 bg-teal-600">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="space-y-8"
          >
            <h2 className="text-3xl lg:text-4xl font-bold text-white">
              Ready to Transform Your Financial Management?
            </h2>
            <p className="text-xl text-teal-100 max-w-2xl mx-auto">
              Start your journey towards smarter financial management with MyKhata today.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link
                to="/register"
                className="inline-flex items-center justify-center px-8 py-4 bg-white text-teal-600 text-lg font-semibold rounded-lg hover:bg-gray-50 transition-colors shadow-lg"
              >
                Get Started Free
                <ArrowRight className="ml-2 w-5 h-5" />
              </Link>
              <Link
                to="/login"
                className="inline-flex items-center justify-center px-8 py-4 border-2 border-white text-white text-lg font-semibold rounded-lg hover:bg-white hover:text-teal-600 transition-colors"
              >
                Sign In
              </Link>
            </div>
            <p className="text-teal-100 text-sm">
              No credit card needed • Always free • No hassle
            </p>
          </motion.div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-gray-900 text-white py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
            <div className="col-span-1 md:col-span-2">
              <div className="flex items-center mb-4">
                <Wallet className="w-8 h-8 text-teal-400" />
                <span className="ml-2 text-2xl font-bold">MyKhata</span>
              </div>
              <p className="text-gray-400 mb-4 max-w-md">
                Smart financial management made simple. Track expenses, scan receipts, 
                and get insights with our AI-powered budgeting app.
              </p>
            </div>
            <div>
              <h3 className="text-lg font-semibold mb-4">Product</h3>
              <ul className="space-y-2 text-gray-400">
                <li><button 
                  onClick={() => {
                    document.getElementById('features')?.scrollIntoView({ 
                      behavior: 'smooth',
                      block: 'start'
                    });
                  }}
                  className="hover:text-white transition-colors cursor-pointer"
                >
                  Features
                </button></li>
                <li><button 
                  onClick={() => {
                    document.getElementById('features')?.scrollIntoView({ 
                      behavior: 'smooth',
                      block: 'start'
                    });
                  }}
                  className="hover:text-white transition-colors cursor-pointer"
                >
                  Pricing
                </button></li>
                <li><button 
                  onClick={() => {
                    document.getElementById('features')?.scrollIntoView({ 
                      behavior: 'smooth',
                      block: 'start'
                    });
                  }}
                  className="hover:text-white transition-colors cursor-pointer"
                >
                  Security
                </button></li>
              </ul>
            </div>
            <div>
              <h3 className="text-lg font-semibold mb-4">Support</h3>
              <ul className="space-y-2 text-gray-400">
                <li><Link to="/login" className="hover:text-white transition-colors">Help Center</Link></li>
                <li><Link to="/login" className="hover:text-white transition-colors">Contact Us</Link></li>
                <li><Link to="/login" className="hover:text-white transition-colors">Privacy Policy</Link></li>
              </ul>
            </div>
          </div>
          <div className="border-t border-gray-800 mt-8 pt-8 text-center text-gray-400">
            <p>&copy; 2024 MyKhata. All rights reserved.</p>
            <p className="mt-2 text-sm font-bold">
              Made by{' '}
              <a href="https://www.linkedin.com/in/dhyan2815" target="_blank" rel="noopener noreferrer" className="text-teal-400 font-medium hover:underline cursor-pointer" > Dhyan Patel </a>
            </p>
          </div>
        </div>
      </footer>
    </motion.div>
  );
};

export default LandingPage;
