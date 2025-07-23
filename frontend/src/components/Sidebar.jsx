import { Link, useLocation } from 'react-router-dom';
import { X, LayoutDashboard, ListOrdered, Tag, User, ChevronsLeft, ChevronsRight } from 'lucide-react';

// Sidebar component for navigation
const Sidebar = ({ isOpen, closeSidebar, collapsed = false, toggleCollapsed }) => {
  const location = useLocation();

  // Navigation items for the sidebar
  const navItems = [
    {
      name: 'Dashboard',
      icon: <LayoutDashboard size={20} />,
      path: '/',
    },
    {
      name: 'Transactions',
      icon: <ListOrdered size={20} />,
      path: '/transactions',
    },
    {
      name: 'Categories',
      icon: <Tag size={20} />,
      path: '/categories',
    },
    {
      name: 'Profile',
      icon: <User size={20} />,
      path: '/profile',
    },
  ];

  // Function to determine if a nav item is active based on current route
  const isActive = (path) => {
    if (path === '/') {
      return location.pathname === '/';
    }
    return location.pathname.startsWith(path);
  };

  return (
    <>
      {/* Mobile sidebar backdrop (closes sidebar on click) */}
      {isOpen && (
        <div 
          className="fixed inset-0 z-20 bg-black bg-opacity-50 lg:hidden"
          onClick={closeSidebar}
        ></div>
      )}

      {/* Sidebar panel */}
      <aside
        className={`fixed top-16 left-0 z-40 h-[calc(100vh-4rem)] min-w-0 overflow-hidden ${collapsed ? 'w-16' : 'w-64'} bg-white dark:bg-gray-900 border-r border-gray-200 dark:border-gray-800 transition-all duration-300 ease-in-out transform ${
          isOpen ? 'translate-x-0' : '-translate-x-full'
        } lg:translate-x-0`}
      >
        {/* Sidebar header (visible on mobile) */}
        <div className="flex items-center justify-between px-4 py-3 lg:hidden">
          <h2 className="text-xl font-semibold text-gray-800 dark:text-gray-100">Menu</h2>
          <button 
            onClick={closeSidebar}
            className="p-2 rounded-md text-gray-600 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white hover:bg-gray-100 dark:hover:bg-gray-700 focus:outline-none focus:ring-2 focus:ring-teal-500"
          >
            <X size={20} />
          </button>
        </div>

        {/* Collapse/Expand button (desktop only) */}
        <div className="hidden lg:flex items-center justify-end px-2 py-2">
          <button
            onClick={toggleCollapsed}
            className="p-2 rounded-md text-gray-600 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white hover:bg-gray-100 dark:hover:bg-gray-700 focus:outline-none focus:ring-2 focus:ring-teal-500"
            aria-label={collapsed ? 'Expand sidebar' : 'Collapse sidebar'}
          >
            {collapsed ? <ChevronsRight size={20} /> : <ChevronsLeft size={20} />}
          </button>
        </div>

        {/* Navigation links */}
        <nav className="mt-4 px-2">
          <ul className="space-y-1">
            {navItems.map((item) => (
              <li key={item.name}>
                <Link
                  to={item.disabled ? '#' : item.path}
                  onClick={
                    item.disabled
                      ? (e) => e.preventDefault()
                      : isOpen
                      ? closeSidebar
                      : undefined
                  }
                  className={`flex items-center px-4 py-2.5 text-sm font-medium rounded-md transition-colors ${
                    isActive(item.path)
                      ? 'bg-teal-50 dark:bg-teal-800 text-teal-600 dark:text-white'
                      : 'text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 hover:text-gray-900 dark:hover:text-white'
                  } ${item.disabled ? 'opacity-50 cursor-not-allowed' : ''}`}
                >
                  {/* Icon for the nav item */}
                  <span className="mr-3 flex-shrink-0">{item.icon}</span>
                  {/* Name of the nav item (hide if collapsed) */}
                  {!collapsed && item.name}
                  {/* "Soon" badge for disabled items */}
                  {item.disabled && !collapsed && (
                    <span className="ml-auto text-xs bg-gray-200 dark:bg-gray-600 px-2 py-0.5 rounded-full text-gray-700 dark:text-gray-200">
                      Soon
                    </span>
                  )}
                </Link>
              </li>
            ))}
          </ul>
        </nav>
      </aside>
    </>
  );
};

export default Sidebar;
