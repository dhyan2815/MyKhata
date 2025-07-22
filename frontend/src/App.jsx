import { useEffect } from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import { useAuth } from './context/AuthContext';
import Layout from './components/Layout';
import Dashboard from './pages/Dashboard';
import Transactions from './pages/Transactions';
import Categories from './pages/Categories';
import AddTransaction from './pages/AddTransaction';
import EditTransaction from './pages/EditTransaction';
import Login from './pages/Login';
import Register from './pages/Register';
import Profile from './pages/Profile';
import NotFound from './pages/NotFound';
import ProtectedRoute from './components/ProtectedRoute';

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
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-teal-600"></div>
      </div>
    );
  }

  // Define application routes
  return (
    <Routes>
      {/* Public routes for login and registration */}
      <Route path="/login" element={!user ? <Login /> : <Navigate to="/" replace />} />
      <Route path="/register" element={!user ? <Register /> : <Navigate to="/" replace />} />
      
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
      </Route>
      
      {/* Catch-all route for 404 Not Found */}
      <Route path="*" element={<NotFound />} />
    </Routes>
  );
}

export default App;