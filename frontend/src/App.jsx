import { useEffect, Suspense, lazy } from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import { useAuth } from './context/AuthContext';
import Layout from './components/layout/Layout';
import ProtectedRoute from './components/common/ProtectedRoute';
import { Toaster } from 'react-hot-toast';

// Lazy load components for better performance
const Dashboard = lazy(() => import('./pages/Dashboard'));
const Transactions = lazy(() => import('./pages/Transactions'));
const Categories = lazy(() => import('./pages/Categories'));
const AddTransaction = lazy(() => import('./pages/AddTransaction'));
const EditTransaction = lazy(() => import('./pages/EditTransaction'));
const ReceiptScannerPage = lazy(() => import('./pages/ReceiptScannerPage'));
const ReceiptHistoryPage = lazy(() => import('./pages/ReceiptHistoryPage'));
const AdvancedFeatures = lazy(() => import('./pages/AdvancedFeatures'));
const Login = lazy(() => import('./pages/Login'));
const Register = lazy(() => import('./pages/Register'));
const Profile = lazy(() => import('./pages/Profile'));
const NotFound = lazy(() => import('./pages/NotFound'));

// Loading component for lazy routes
const LoadingSpinner = () => (
  <div className="min-h-screen flex items-center justify-center">
    <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-teal-600"></div>
  </div>
);

function App() {
  // Get user and loading state from AuthContext
  const { user, loading } = useAuth();

  // Prevent body scrolling when modal is open
  useEffect(() => {
    const body = document.body;
    const hasModal = document.querySelector('[role="dialog"]');
    
    if (hasModal) {
      body.style.overflow = 'hidden';
    } else {
      body.style.overflow = '';
    }
    
    // Cleanup: always reset overflow when effect is cleaned up
    return () => {
      body.style.overflow = '';
    };
  }, []);

  // Show loading spinner while authentication state is being determined
  if (loading) {
    return <LoadingSpinner />;
  }

  // Define application routes
  return (
    <>
      <Toaster
        position="top-right"
        toastOptions={{
          duration: 4000,
          style: {
            background: '#363636',
            color: '#fff',
          },
          success: {
            duration: 3000,
            iconTheme: {
              primary: '#10B981',
              secondary: '#fff',
            },
          },
          error: {
            duration: 5000,
            iconTheme: {
              primary: '#EF4444',
              secondary: '#fff',
            },
          },
          loading: {
            iconTheme: {
              primary: '#3B82F6',
              secondary: '#fff',
            },
          },
        }}
      />
      <Suspense fallback={<LoadingSpinner />}>
        <Routes>
          {/* Public routes for login and registration */}
          <Route path="/login" element={!user ? <Login /> : <Navigate to="/" replace />} />
          <Route path="/register" element={!user ? <Register /> : <Navigate to="/register" replace />} />
          
          {/* Protected routes wrapped in Layout */}
          <Route element={<Layout />}>
            {/* Dashboard (home) route */}
            <Route path="/" element={
              <ProtectedRoute>
                <Dashboard />
              </ProtectedRoute>
            } />
            {/* Transactions list route */}
            <Route path="/transactions" element={
              <ProtectedRoute>
                <Transactions />
              </ProtectedRoute>
            } />
            {/* Add transaction route */}
            <Route path="/transactions/add" element={
              <ProtectedRoute>
                <AddTransaction />
              </ProtectedRoute>
            } />
            {/* Edit transaction route */}
            <Route path="/transactions/:id/edit" element={
              <ProtectedRoute>
                <EditTransaction />
              </ProtectedRoute>
            } />
            {/* Categories management route */}
            <Route path="/categories" element={
              <ProtectedRoute>
                <Categories />
              </ProtectedRoute>
            } />
            {/* User profile route */}
            <Route path="/profile" element={
              <ProtectedRoute>
                <Profile />
              </ProtectedRoute>
            } />
            {/* Receipt scanner route */}
            <Route path="/receipt-scanner" element={
              <ProtectedRoute>
                <ReceiptScannerPage />
              </ProtectedRoute>
            } />
            {/* Receipt history route */}
            <Route path="/receipt-history" element={
              <ProtectedRoute>
                <ReceiptHistoryPage />
              </ProtectedRoute>
            } />
            {/* Advanced features route */}
            <Route path="/advanced-features" element={
              <ProtectedRoute>
                <AdvancedFeatures />
              </ProtectedRoute>
            } />
          </Route>
          
          {/* Default route - redirect unauthenticated users to register page */}
          <Route path="*" element={
            !user ? <Navigate to="/register" replace /> : <NotFound />
          } />
        </Routes>
      </Suspense>
    </>
  );
}

export default App;