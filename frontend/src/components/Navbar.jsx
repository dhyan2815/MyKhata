import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Menu, X, UserCircle, LogOut, Settings, ChevronDown, ChevronsLeft, ChevronsRight, Lightbulb } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { fetchInsights } from '../api/insights';
import { motion, AnimatePresence } from 'framer-motion';

// Navbar component for the top navigation bar
const Navbar = ({ toggleSidebar, toggleSidebarCollapsed, sidebarCollapsed }) => {
  // Get user and logout function from AuthContext
  const { user, logout } = useAuth();
  // State to control profile dropdown menu
  const [profileMenuOpen, setProfileMenuOpen] = useState(false);
  // State for insights
  const [insights, setInsights] = useState([]);
  const [insightsLoading, setInsightsLoading] = useState(true);
  const [currentInsightIdx, setCurrentInsightIdx] = useState(0);
  const [fade, setFade] = useState(true);

  useEffect(() => {
    const loadInsights = async () => {
      setInsightsLoading(true);
      try {
        const data = await fetchInsights();
        setInsights(data);
      } catch (err) {
        setInsights([]);
      } finally {
        setInsightsLoading(false);
      }
    };
    loadInsights();
  }, []);

  // Slideshow effect for insights with fade transition
  useEffect(() => {
    if (!insights || insights.length <= 1) return;
    setFade(true);
    const interval = setInterval(() => {
      setFade(false);
      setTimeout(() => {
        setCurrentInsightIdx((prev) => (prev + 1) % insights.length);
        setFade(true);
      }, 400); // fade out duration
    }, 4000); // 4 seconds per slide
    return () => clearInterval(interval);
  }, [insights, currentInsightIdx]);

  return (
    <motion.header 
      initial={{ y: -100 }}
      animate={{ y: 0 }}
      transition={{ duration: 0.5, ease: "easeOut" }}
      className="sticky top-0 z-50 bg-white dark:bg-gray-900 shadow-sm dark:shadow-md h-16"
    >
      <div className="h-full flex items-center justify-between px-3 sm:px-4 md:px-6 lg:px-8">
        {/* Left section: Sidebar toggle and logo */}
        <div className="flex items-center flex-1 min-w-0">
          {/* Sidebar toggle button (visible on mobile) */}
          <button
            className="p-2 rounded-md text-gray-600 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white hover:bg-gray-100 dark:hover:bg-gray-700 focus:outline-none focus:ring-2 focus:ring-teal-500 lg:hidden"
            onClick={toggleSidebar}
          >
            <Menu size={20} />
          </button>

          {/* Logo and app name */}
          <Link to="/" className="flex items-center ml-2 lg:ml-0 flex-shrink-0">
            <span className="bg-teal-600 text-white p-1.5 rounded">
              <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="lucide lucide-bar-chart-2">
                <line x1="18" x2="18" y1="20" y2="10"></line>
                <line x1="12" x2="12" y1="20" y2="4"></line>
                <line x1="6" x2="6" y1="20" y2="14"></line>
              </svg>
            </span>
            <span className="ml-2 text-lg sm:text-xl font-bold text-gray-900 dark:text-white">MyKhata</span>
          </Link>

          {/* Insights display - hidden on very small screens */}
          <div className="hidden sm:flex ml-3 md:ml-4 items-center space-x-2 overflow-x-auto hide-scrollbar max-w-xs sm:max-w-md md:max-w-lg">
            {insightsLoading ? (
              <span className="inline-flex items-center px-4 py-1.5 rounded-md text-teal-800 dark:text-teal-200 text-sm animate-pulse shadow-sm">
                <Lightbulb size={16} className="mr-1" /> Loading insights...
              </span>
            ) : insights.length > 0 ? (
              <span
                className={`inline-flex items-center px-4 py-1.5 rounded-md text-teal-800 dark:text-teal-200 text-sm whitespace-nowrap transition-opacity duration-400 shadow-sm ${fade ? 'opacity-100' : 'opacity-0'}`}
                key={currentInsightIdx}
              >
                <Lightbulb size={16} className="mr-1 text-teal-500 dark:text-teal-300" /> {insights[currentInsightIdx]}
              </span>
            ) : (
              <span className="inline-flex items-center px-4 py-1.5 rounded-full text-gray-500 dark:text-gray-300 text-sm shadow-sm">
                <Lightbulb size={16} className="mr-1" /> No insights yet
              </span>
            )}
          </div>
        </div>

        {/* Right section: Profile menu */}
        <div className="flex items-center flex-shrink-0">
          <div className="relative">
            {/* Profile button (shows user initial or icon) */}
            <button
              className="flex items-center text-sm focus:outline-none"
              onClick={() => setProfileMenuOpen(!profileMenuOpen)}
            >
              <div className="h-8 w-8 rounded-full bg-teal-600 text-white flex items-center justify-center">
                {user?.name ? user.name.charAt(0).toUpperCase() : <UserCircle size={20} />}
              </div>
              <span className="hidden md:block ml-2 text-sm font-medium text-gray-800 dark:text-gray-200">
                {user?.name || 'User'}
              </span>
              <ChevronDown size={16} className="hidden sm:block ml-1 text-gray-700 dark:text-gray-300" />
            </button>

            {/* Dropdown menu for profile actions */}
            {profileMenuOpen && (
              <div className="origin-top-right absolute right-0 mt-2 w-48 rounded-md shadow-lg py-1 bg-white dark:bg-gray-800 ring-1 ring-black ring-opacity-5 dark:ring-white dark:ring-opacity-10 focus:outline-none">
                {/* Link to profile settings */}
                <Link
                  to="/profile"
                  className="flex items-center px-4 py-2 text-sm text-gray-700 dark:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-700"
                  onClick={() => setProfileMenuOpen(false)}
                >
                  <Settings size={16} className="mr-2" />
                  Profile Settings
                </Link>
                {/* Sign out button */}
                <button
                  onClick={() => {
                    setProfileMenuOpen(false);
                    logout();
                  }}
                  className="flex w-full items-center px-4 py-2 text-sm text-gray-700 dark:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-700"
                >
                  <LogOut size={16} className="mr-2" />
                  Sign out
                </button>
              </div>
            )}
          </div>
        </div>
      </div>
    </motion.header>
  );
};

export default Navbar;