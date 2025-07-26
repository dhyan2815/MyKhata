import { useContext } from 'react';
import { ThemeContext } from '../context/ThemeContext.jsx';
import { Sun, Moon } from 'lucide-react';
import { motion } from 'framer-motion';

// ToggleMode component for switching between light and dark themes
const ToggleMode = () => {
  // Get current theme and toggle function from ThemeContext
  const { theme, toggleTheme } = useContext(ThemeContext);
  const isDark = theme === 'dark';

  return (
    <div className="flex items-center gap-3">
      {/* Label for the theme toggle */}
      <span className="text-sm font-medium text-gray-700 dark:text-gray-300">Theme:</span>
      
      {/* Enhanced toggle button for switching theme */}
      <motion.button
        type='button'
        onClick={toggleTheme}
        whileHover={{ scale: 1.05 }}
        whileTap={{ scale: 0.95 }}
        className={`relative w-12 h-6 flex items-center rounded-full p-0.5 transition-all duration-300 ease-in-out shadow-md ${
          isDark 
            ? 'bg-gradient-to-r from-teal-600 to-teal-700' 
            : 'bg-gradient-to-r from-teal-400 to-teal-500'
        }`}
      >
        {/* Background icons */}
        <div className="absolute inset-0 flex items-center justify-between px-1.5">
          <Sun 
            size={10} 
            className={`transition-all duration-300 ${
              isDark ? 'text-teal-100 opacity-80' : 'text-white opacity-100'
            }`}
          />
          <Moon 
            size={10} 
            className={`transition-all duration-300 ${
              isDark ? 'text-white opacity-100' : 'text-teal-200 opacity-80'
            }`}
          />
        </div>
        
        {/* The toggle knob with icon */}
        <motion.div
          layout
          className={`w-5 h-5 bg-white rounded-full shadow-lg flex items-center justify-center transform transition-all duration-300 ${
            isDark ? 'translate-x-6' : 'translate-x-0'
          }`}
        >
          <motion.div
            initial={false}
            animate={{ rotate: isDark ? 180 : 0 }}
            transition={{ duration: 0.3 }}
          >
            {isDark ? (
              <Moon size={8} className="text-teal-900" />
            ) : (
              <Sun size={8} className="text-teal-700" />
            )}
          </motion.div>
        </motion.div>
      </motion.button>
      
      {/* Display current theme mode with better styling */}
      <span className={`text-sm font-medium px-2 py-1 rounded-md transition-colors duration-300 ${
        isDark 
          ? 'bg-gray-800 text-gray-200 border border-gray-700' 
          : 'bg-gray-100 text-gray-700 border border-gray-200'
      }`}>
        {isDark ? 'Dark' : 'Light'}
      </span>
    </div>
  );
};

export default ToggleMode;