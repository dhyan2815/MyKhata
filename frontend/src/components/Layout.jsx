import { useState } from 'react';
import { Outlet } from 'react-router-dom';
import Navbar from './Navbar';
import Sidebar from './Sidebar';

// Main layout component for the application
const Layout = () => {
  // State to control sidebar open/close
  const [sidebarOpen, setSidebarOpen] = useState(false);

  // Function to toggle sidebar visibility
  const toggleSidebar = () => {
    setSidebarOpen(!sidebarOpen);
  };

  return (
    // Main container with minimum height and background color
    <div className="min-h-screen flex flex-col bg-gray-50">
      {/* Top navigation bar, receives toggleSidebar as prop */}
      <Navbar toggleSidebar={toggleSidebar} />
      
      <div className="flex flex-1 pt-16">
        {/* Sidebar component, controlled by sidebarOpen state */}
        <Sidebar isOpen={sidebarOpen} closeSidebar={() => setSidebarOpen(false)} />
        
        {/* Main content area */}
        <main className="flex-1 transition-all duration-200 ease-in-out">
          <div className="px-4 sm:px-6 lg:px-8 py-6 max-w-7xl mx-auto animate-fadeIn dark:bg-gray-900 dark:text-white">
            {/* Renders the matched child route */}
            <Outlet />
          </div>
        </main>
      </div>
    </div>
  );
};

export default Layout;