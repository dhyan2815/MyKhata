import { useContext } from 'react';
import { ThemeContext } from '../context/ThemeContext.jsx';

const ToggleMode = () => {
  const { theme, toggleTheme } = useContext(ThemeContext);
  const isDark = theme === 'dark';

  return (
    <div className="flex items-center gap-2">
      <span className="text-sm text-black dark:text-gray-300">Theme:</span>
      
      <button
        onClick={toggleTheme}
        className={`w-14 h-8 flex items-center rounded-full p-1 transition-colors duration-300 ${
          isDark ? 'bg-teal-600' : 'bg-gray-300'
        }`}
      >
        <div
          className={`w-6 h-6 bg-white rounded-full shadow-md transform transition-transform duration-300 ${
            isDark ? 'translate-x-6' : 'translate-x-0'
          }`}
        />
      </button>
      
      <span className="text-sm text-black dark:text-gray-300">
        {isDark ? 'Dark' : 'Light'}
      </span>
    </div>
  );
};

export default ToggleMode;