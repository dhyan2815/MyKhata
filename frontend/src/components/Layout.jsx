import { useState } from 'react';
import { Outlet } from 'react-router-dom';
import Navbar from './Navbar';
import Sidebar from './Sidebar';

// Main layout component for the application
const Layout = () => {
  // State to control sidebar open/close (for mobile)
  const [sidebarOpen, setSidebarOpen] = useState(false);
  // State to control sidebar collapsed/expanded (for desktop)
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);

  // Function to toggle sidebar visibility (mobile)
  const toggleSidebar = () => {
    setSidebarOpen(!sidebarOpen);
  };
  // Function to toggle sidebar collapsed state (desktop)
  const toggleSidebarCollapsed = () => {
    setSidebarCollapsed((prev) => !prev);
  };

  return (
    // Main container with minimum height and background color
    <div className="min-h-screen flex flex-col bg-gray-50 dark:bg-gray-900">
      {/* Top navigation bar, receives toggleSidebar and toggleSidebarCollapsed as props */}
      <Navbar toggleSidebar={toggleSidebar} toggleSidebarCollapsed={toggleSidebarCollapsed} sidebarCollapsed={sidebarCollapsed} />
      
      <div className="flex flex-1">
        {/* Sidebar component, controlled by sidebarOpen and sidebarCollapsed state */}
        <Sidebar isOpen={sidebarOpen} closeSidebar={() => setSidebarOpen(false)} collapsed={sidebarCollapsed} toggleCollapsed={toggleSidebarCollapsed} />
        
        {/* Main content area, expands when sidebar is collapsed */}
        <main className={`flex-1 transition-all duration-200 ease-in-out ${sidebarCollapsed ? 'lg:ml-16' : 'lg:ml-64'}`}> 
          <div className="px-3 sm:px-4 md:px-6 lg:px-8 py-4 sm:py-6 max-w-7xl mx-auto animate-fadeIn dark:bg-gray-900 dark:text-white">
            {/* Renders the matched child route */}
            <Outlet />
          </div>
        </main>
      </div>
    </div>
  );
};

export default Layout;