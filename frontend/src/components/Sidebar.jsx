import { Link, useLocation } from 'react-router-dom';
import { X, LayoutDashboard, ListOrdered, Tag, User } from 'lucide-react';

const Sidebar = ({ isOpen, closeSidebar }) => {
  const location = useLocation();

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

  const isActive = (path) => {
    if (path === '/') {
      return location.pathname === '/';
    }
    return location.pathname.startsWith(path);
  };

  return (
    <>
      {/* Mobile sidebar backdrop */}
      {isOpen && (
        <div 
          className="fixed inset-0 z-20 bg-black bg-opacity-50 lg:hidden"
          onClick={closeSidebar}
        ></div>
      )}

      {/* Sidebar */}
      <aside 
        className={`fixed top-0 left-0 z-40 h-full w-64 bg-white dark:bg-gray-900 border-r border-gray-200 dark:border-gray-700 pt-16 transition-transform duration-300 ease-in-out transform lg:translate-x-0 lg:static lg:h-auto ${
          isOpen ? 'translate-x-0' : '-translate-x-full'
        }`}
      >
        <div className="flex items-center justify-between px-4 py-3 lg:hidden">
          <h2 className="text-xl font-semibold text-gray-800 dark:text-gray-100">Menu</h2>
          <button 
            onClick={closeSidebar}
            className="p-2 rounded-md text-gray-600 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white hover:bg-gray-100 dark:hover:bg-gray-700 focus:outline-none focus:ring-2 focus:ring-teal-500"
          >
            <X size={20} />
          </button>
        </div>

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
                  <span className="mr-3">{item.icon}</span>
                  {item.name}
                  {item.disabled && (
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
