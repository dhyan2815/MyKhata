import { useState } from 'react';
import { Link } from 'react-router-dom';
import { Menu, X, UserCircle, LogOut, Settings, ChevronDown } from 'lucide-react';
import { useAuth } from '../context/AuthContext';

const Navbar = ({ toggleSidebar }) => {
  const { user, logout } = useAuth();
  const [profileMenuOpen, setProfileMenuOpen] = useState(false);

  return (
    <header className="fixed top-0 left-0 right-0 z-30 bg-white shadow-sm h-16">
      <div className="h-full flex items-center justify-between px-4 sm:px-6 lg:px-8">
        <div className="flex items-center">
          <button
            className="p-2 rounded-md text-gray-600 hover:text-gray-900 hover:bg-gray-100 focus:outline-none focus:ring-2 focus:ring-teal-500 lg:hidden"
            onClick={toggleSidebar}
          >
            <Menu size={24} />
          </button>
          
          <Link to="/" className="flex items-center ml-2 lg:ml-0">
            <span className="bg-teal-600 text-white p-1.5 rounded">
              <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="lucide lucide-bar-chart-2">
                <line x1="18" x2="18" y1="20" y2="10"></line>
                <line x1="12" x2="12" y1="20" y2="4"></line>
                <line x1="6" x2="6" y1="20" y2="14"></line>
              </svg>
            </span>
            <span className="ml-2 text-xl font-bold text-gray-900">MyKhata</span>
          </Link>
        </div>
        
        <div className="flex items-center">
          <div className="relative">
            <button
              className="flex items-center text-sm focus:outline-none"
              onClick={() => setProfileMenuOpen(!profileMenuOpen)}
            >
              <div className="h-8 w-8 rounded-full bg-teal-600 text-white flex items-center justify-center">
                {user?.name?.charAt(0).toUpperCase() || <UserCircle />}
              </div>
              <span className="hidden md:block ml-2 text-sm font-medium">
                {user?.name || 'User'}
              </span>
              <ChevronDown size={16} className="ml-1" />
            </button>
            
            {profileMenuOpen && (
              <div className="origin-top-right absolute right-0 mt-2 w-48 rounded-md shadow-lg py-1 bg-white ring-1 ring-black ring-opacity-5 focus:outline-none">
                <Link
                  to="/profile"
                  className="flex items-center px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                  onClick={() => setProfileMenuOpen(false)}
                >
                  <Settings size={16} className="mr-2" />
                  Profile Settings
                </Link>
                <button
                  onClick={() => {
                    setProfileMenuOpen(false);
                    logout();
                  }}
                  className="flex w-full items-center px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                >
                  <LogOut size={16} className="mr-2" />
                  Sign out
                </button>
              </div>
            )}
          </div>
        </div>
      </div>
    </header>
  );
};

export default Navbar;