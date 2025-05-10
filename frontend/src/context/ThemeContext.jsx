import React from 'react'
import { useState, useEffect } from 'react'

// create context for theme
export const ThemeContext = createContext();

    // create provider for theme
    export const ThemeProvider = ({children}) => {
        const [theme, setTheme] = useState( () => {
            return localStorage.getItem('theme') || 'light'
        });
    
        // use effect to store theme in local storage
        useEffect(() => {
            document.documentElement.className = theme;
            localStorage.setItem('theme', theme);
        }, [theme],);

        // toggle theme when clicked
        const toggleTheme = () => {
            setTheme(prev => (prev === 'light' ? 'dark' : 'light'));
        };

        return (
            <ThemeContext.Provider value={{theme, toggleTheme}}>
                {children} {/* wrap children with context provider */}
            </ThemeContext.Provider>
        )


    };