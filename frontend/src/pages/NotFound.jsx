import { Link } from 'react-router-dom'; // Import Link component for navigation
import { Home } from 'lucide-react'; // Import Home icon
import { Helmet } from 'react-helmet-async';

// NotFound component displays a 404 error page
const NotFound = () => {
  return (
    <div className="not-found-page">
      <Helmet>
        <title>404 Not Found · MyKhata</title>
      </Helmet>
      {/* Main container with flex layout and background styling */}
      <div className="min-h-screen bg-gray-50 flex flex-col justify-center items-center px-4 sm:px-6 lg:px-8">
        <div className="text-center">
          {/* Large 404 error code */}
          <h1 className="text-9xl font-bold text-teal-600">404</h1>
          {/* Page not found heading */}
          <h2 className="mt-4 text-3xl font-extrabold text-gray-900 tracking-tight">
            Page not found
          </h2>
          {/* Apology message */}
          <p className="mt-4 text-lg text-gray-600">
            Sorry, we couldn't find the page you're looking for.
          </p>
          <div className="mt-8">
            {/* Link to navigate back to the dashboard/homepage */}
            <Link
              to="/"
              className="inline-flex items-center px-4 py-2 border border-transparent text-base font-medium rounded-md shadow-sm text-white bg-teal-600 hover:bg-teal-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-teal-500"
            >
              {/* Home icon */}
              <Home size={16} className="mr-2" />
              Back to Dashboard
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
};

export default NotFound; // Export the NotFound component