// Import React core library
import React from 'react';
// Import ReactDOM for rendering the app
import ReactDOM from 'react-dom/client';
// Import BrowserRouter for routing
import { BrowserRouter } from 'react-router-dom';
// Import main App component
import App from './App.jsx';
// Import AuthProvider for authentication context
import { AuthProvider } from './context/AuthContext.jsx';
// Import Toaster for toast notifications
import { Toaster } from 'react-hot-toast';
// Import global styles
import './index.css';
// Import ThemeProvider for theme context
import { ThemeProvider } from './context/ThemeContext.jsx';
import { HelmetProvider } from 'react-helmet-async';
import ErrorBoundary from './components/ErrorBoundary.jsx';

// Render the React application into the root DOM node
ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <ErrorBoundary>
      <HelmetProvider>
        {/* Provide theme context to the app */}
        <ThemeProvider>
          {/* Enable client-side routing */}
          <BrowserRouter>
            {/* Provide authentication context to the app */}
            <AuthProvider>
              {/* Main application component */}
              <App />
              {/* Toast notification component with custom options */}
              <Toaster 
                position="top-right"
                toastOptions={{
                  style: {
                    background: '#363636',
                    color: '#fff',
                  },
                  success: {
                    duration: 3000,
                    iconTheme: {
                      primary: '#10B981',
                      secondary: '#FFFFFF',
                    },
                  },
                  error: {
                    duration: 4000,
                    iconTheme: {
                      primary: '#EF4444',
                      secondary: '#FFFFFF',
                    },
                  },
                }}
              />
            </AuthProvider>
          </BrowserRouter>
        </ThemeProvider>
      </HelmetProvider>
    </ErrorBoundary>
  </React.StrictMode>,
);