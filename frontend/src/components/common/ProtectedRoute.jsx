import { Navigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';

// ProtectedRoute component to guard routes that require authentication
const ProtectedRoute = ({ children }) => {
  // Get user and loading state from AuthContext
  const { user, loading } = useAuth();

  // Show a loading spinner while authentication status is being determined
  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-teal-600"></div>
      </div>
    );
  }

  // If user is not authenticated, redirect to login page
  if (!user) {
    return <Navigate to="/login" replace />;
  }

  // If authenticated, render the protected children components
  return children;
};

export default ProtectedRoute;