import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { getTransactions } from '../api/transactions';
import TransactionList from '../components/TransactionList';
import { Plus, Filter } from 'lucide-react';
import { getCategories } from '../api/categories';
import toast from 'react-hot-toast';
import { Helmet } from 'react-helmet-async';
import { safeArray } from '../utils/safeArray';

// Transactions page component
const Transactions = () => {
  // State for list of transactions
  const [transactions, setTransactions] = useState([]);
  // State for loading indicator
  const [loading, setLoading] = useState(true);
  // State for available categories (for filtering)
  const [categories, setCategories] = useState([]);
  // State for filter values
  const [filters, setFilters] = useState({
    type: '',
    category: '',
    startDate: '',
    endDate: '',
    page: 1,
    limit: 10,
  });
  // State for pagination info
  const [pagination, setPagination] = useState(null);
  // State to show/hide filter panel
  const [showFilters, setShowFilters] = useState(false);

  // Load transactions based on current filters
  useEffect(() => {
    const fetchTransactions = async () => {
      setLoading(true);
      try {
        // Fetch transactions from API with filters
        const result = await getTransactions(filters);
        setTransactions(safeArray(result.transactions));
        setPagination(result.pagination);
      } catch (error) {
        // Show error toast if fetch fails
        toast.error(error.response?.data?.message || 'Failed to load transactions');
      } finally {
        setLoading(false);
      }
    };

    fetchTransactions();
  }, [filters]);

  // Load categories for filtering
  useEffect(() => {
    const fetchCategories = async () => {
      try {
        // Fetch all categories from API
        const allCategories = await getCategories();
        setCategories(safeArray(allCategories));
      } catch (error) {
        // Show error toast if fetch fails
        toast.error('Failed to load categories');
      }
    };

    fetchCategories();
  }, []);

  // Handle changes in filter inputs
  const handleFilterChange = (e) => {
    const { name, value } = e.target;
    // Update filters and reset to first page
    setFilters({ ...filters, [name]: value, page: 1 });
  };

  // Clear all filters
  const clearFilters = () => {
    setFilters({
      type: '',
      category: '',
      startDate: '',
      endDate: '',
      page: 1
    });
  };

  // Handle pagination page change
  const handlePageChange = (page) => {
    setFilters({ ...filters, page });
  };

  // Remove a transaction from the list after deletion
  const handleTransactionDeleted = (id) => {
    setTransactions(transactions.filter(transaction => transaction._id !== id));
  };

  return (
    <div className="space-y-6 min-h-screen dark:bg-gray-900 dark:text-white">
      <Helmet>
        <title>Transactions · MyKhata</title>
      </Helmet>
      {/* Header and action buttons */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between space-y-3 sm:space-y-0">
        <div>
          <h1 className="text-xl sm:text-2xl font-bold text-gray-900 dark:text-gray-100">Transactions</h1>
          <p className="text-sm sm:text-base text-gray-600 dark:text-gray-400 mt-1">
            View and manage your financial transactions
          </p>
        </div>
        <div className="flex flex-col sm:flex-row space-y-2 sm:space-y-0 sm:space-x-3">
          {/* Toggle filter panel button */}
          <button
            onClick={() => setShowFilters(!showFilters)}
            className="btn btn-secondary dark:bg-gray-700 dark:text-gray-300 text-sm"
          >
            <Filter size={16} className="mr-2" />
            {showFilters ? 'Hide Filters' : 'Show Filters'}
          </button>
          {/* Add transaction button */}
          <Link to="/transactions/add" className="btn btn-primary dark:bg-teal-500 dark:text-white text-sm">
            <Plus size={16} className="mr-2" /> Add Transaction
          </Link>
        </div>
      </div>

      {/* Filter panel */}
      {showFilters && (
        <div className="bg-white dark:bg-gray-800 p-3 sm:p-4 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 animate-fadeIn">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
            {/* Type filter */}
            <div>
              <label htmlFor="type" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                Type
              </label>
              <select
                id="type"
                name="type"
                className="input dark:bg-gray-700 dark:text-white"
                value={filters.type}
                onChange={handleFilterChange}
              >
                <option value="">All Types</option>
                <option value="income">Income</option>
                <option value="expense">Expense</option>
              </select>
            </div>
            {/* Category filter */}
            <div>
              <label htmlFor="category" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                Category
              </label>
              <select
                id="category"
                name="category"
                className="input dark:bg-gray-700 dark:text-white"
                value={filters.category}
                onChange={handleFilterChange}
              >
                <option value="">All Categories</option>
                {categories.map((category) => (
                  <option key={category._id} value={category._id}>
                    {category.name}
                  </option>
                ))}
              </select>
            </div>
            {/* Start date filter */}
            <div>
              <label htmlFor="startDate" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                From Date
              </label>
              <input
                type="date"
                id="startDate"
                name="startDate"
                className="input dark:bg-gray-700 dark:text-white"
                value={filters.startDate}
                onChange={handleFilterChange}
              />
            </div>
            {/* End date filter */}
            <div>
              <label htmlFor="endDate" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                To Date
              </label>
              <input
                type="date"
                id="endDate"
                name="endDate"
                className="input dark:bg-gray-700 dark:text-white"
                value={filters.endDate}
                onChange={handleFilterChange}
              />
            </div>
          </div>
          {/* Clear filters button */}
          <div className="mt-4 flex justify-end">
            <button
              onClick={clearFilters}
              className="btn btn-secondary dark:bg-gray-700 dark:text-gray-300"
            >
              Clear Filters
            </button>
          </div>
        </div>
      )}

      {/* Transaction list with pagination and loading state */}
      <TransactionList
        transactions={transactions}
        onTransactionDeleted={handleTransactionDeleted}
        isLoading={loading}
        pagination={pagination}
        onPageChange={handlePageChange}
      />
    </div>
  );
};

export default Transactions;