import {useContext} from 'react';
import {ThemeContext} from '../context/ThemeContext.jsx';

const ToggleMode = () => {

    const {theme, toggleTheme} = useContext(ThemeContext);

  return (
    <button className="px-4 py-2 bg-gray-200 dark:bg-gray-700 text-black dark:text-white rounded" onClick={toggleTheme}>
        {theme === 'light' ? 'Dark' : 'Light'} Theme
    </button>
  )
}

export default ToggleMode;
