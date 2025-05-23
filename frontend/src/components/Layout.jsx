import { useState } from 'react';
import { Outlet } from 'react-router-dom';
import Navbar from './Navbar';
import Sidebar from './Sidebar';

const Layout = () => {
  const [sidebarOpen, setSidebarOpen] = useState(false);

  const toggleSidebar = () => {
    setSidebarOpen(!sidebarOpen);
  };

  return (
    <div className="min-h-screen flex flex-col bg-gray-50">
      <Navbar toggleSidebar={toggleSidebar} />
      
      <div className="flex flex-1 pt-16">
        <Sidebar isOpen={sidebarOpen} closeSidebar={() => setSidebarOpen(false)} />
        
        <main className="flex-1 transition-all duration-200 ease-in-out">
          <div className="px-4 sm:px-6 lg:px-8 py-6 max-w-7xl mx-auto animate-fadeIn dark:bg-gray-900 dark:text-white">
            <Outlet />
          </div>
        </main>
      </div>
    </div>
  );
};

export default Layout;