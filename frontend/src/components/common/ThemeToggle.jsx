import { useEffect, useState } from 'react';

const ThemeToggle = () => {
  // Initialize theme state from localStorage or default to 'light'
  const [theme, setTheme] = useState(localStorage.getItem('theme') || 'light');

  useEffect(() => {
    // Get the root HTML element
    const root = window.document.documentElement;
    // Add or remove the 'dark' class based on the current theme
    if (theme === 'dark') {
      root.classList.add('dark');
    } else {
      root.classList.remove('dark');
    }
    // Persist the current theme to localStorage
    localStorage.setItem('theme', theme);
  }, [theme]);

  // Toggle between 'light' and 'dark' themes
  const toggleTheme = () => {
    setTheme(theme === 'dark' ? 'light' : 'dark');
  };

  return (
    // Button to toggle the theme, updates label based on current theme
    <button onClick={toggleTheme} className="px-4 py-2 bg-gray-200 dark:bg-gray-800 text-black dark:text-white rounded">
      Toggle {theme === 'dark' ? 'Light' : 'Dark'} Mode
    </button>
  );
};

export default ThemeToggle;