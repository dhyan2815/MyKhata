
const Footer = () => {
  return (
    <footer className="bg-white border-t border-gray-200 py-4">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex flex-col md:flex-row justify-between items-center">
          <div className="flex items-center">
            <span className="text-sm text-gray-500">
              © {new Date().getFullYear()} MyKhata. All rights reserved.
            </span>
          </div>
          
          <div className="mt-4 md:mt-0 flex items-center space-x-6">
            <a href="#" className="text-sm text-gray-500 hover:text-gray-900">
              Privacy Policy
            </a>
            <a href="#" className="text-sm text-gray-500 hover:text-gray-900">
              Terms of Service
            </a>
            <a href="#" className="text-sm text-gray-500 hover:text-gray-900">
              Contact
            </a>
          </div>
          
          <div className="mt-4 md:mt-0 flex items-center">
            <span className="text-sm text-gray-500 flex items-center">
              Made by Dhyan Patel
            </span>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;