import { useContext } from 'react';
import { ThemeContext } from '../context/ThemeContext.jsx';

const ToggleMode = () => {
  const { theme, toggleTheme } = useContext(ThemeContext);
  const isDark = theme === 'dark';

  return (
    <div className="flex items-center gap-2">
      <span className="text-sm text-white dark:text-black">Theme:</span>
      
      <button
        onClick={toggleTheme}
        className={`w-7 h-4 flex items-center rounded-full p-1 transition-colors duration-300 ${
          isDark ? 'bg-teal-600' : 'bg-gray-300'
        }`}
      >
        <div
          className={`w-3 h-3 bg-white rounded-full shadow-md transform transition-transform duration-300 ${
            isDark ? 'translate-x-6' : 'translate-x-0'
          }`}
        />
      </button>
      
      <span className="text-sm text-white dark:text-black">
        {isDark ? 'Dark' : 'Light'}
      </span>
    </div>
  );
};

export default ToggleMode;