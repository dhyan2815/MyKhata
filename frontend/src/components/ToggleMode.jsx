import { useContext } from 'react';
import { ThemeContext } from '../context/ThemeContext.jsx';

// ToggleMode component for switching between light and dark themes
const ToggleMode = () => {
  // Get current theme and toggle function from ThemeContext
  const { theme, toggleTheme } = useContext(ThemeContext);
  const isDark = theme === 'dark';

  return (
    <div className="flex items-center gap-2">
      {/* Label for the theme toggle */}
      <span className="text-sm">Theme:</span>
      
      {/* Toggle button for switching theme */}
      <button
        type='button'
        onClick={toggleTheme}
        className={`w-7 h-4 flex items-center rounded-full p-1 transition-colors duration-300 ${
          isDark ? 'bg-teal-600' : 'text-black'
        }`}
      >
        {/* The toggle knob */}
        <div
          className={`w-3 h-3 bg-white rounded-full shadow-md transform transition-transform duration-300 ${
            isDark ? 'translate-x-3' : 'translate-x-0'
          }`}
        />
      </button>
      
      {/* Display current theme mode */}
      <span className="text-sm">
        {isDark ? 'Dark' : 'Light'}
      </span>
    </div>
  );
};

export default ToggleMode;