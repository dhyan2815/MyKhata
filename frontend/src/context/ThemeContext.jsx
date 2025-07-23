import {createContext} from 'react'
import { useState, useEffect } from 'react'

// create context for theme
export const ThemeContext = createContext();

// create provider for theme
export const ThemeProvider = ({children}) => {
    // initialize theme state from localStorage or default to 'light'
    const [theme, setTheme] = useState( () => {
        return localStorage.getItem('theme') || 'light'
    });

    // update document class and localStorage whenever theme changes
    useEffect(() => {
        document.documentElement.className = theme;
        localStorage.setItem('theme', theme);
    }, [theme]);

    // function to toggle between light and dark themes
    const toggleTheme = () => {
        setTheme(prev => (prev === 'light' ? 'dark' : 'light'));
    };

    // provide theme and toggleTheme to children components
    return (
        <ThemeContext.Provider value={{theme, toggleTheme}}>
            {children} {/* wrap children with context provider */}
        </ThemeContext.Provider>
    )
};