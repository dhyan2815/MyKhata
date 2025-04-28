import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { getTransactions } from '../api/transactions';
import TransactionList from '../components/TransactionList';
import { Plus, Filter } from 'lucide-react';
import { getCategories } from '../api/categories';
import toast from 'react-hot-toast';

const Transactions = () => {
  const [transactions, setTransactions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [categories, setCategories] = useState([]);
  const [filters, setFilters] = useState({
    type: '',
    category: '',
    startDate: '',
    endDate: '',
    page: 1
  });
  const [pagination, setPagination] = useState(null);
  const [showFilters, setShowFilters] = useState(false);

  // Load transactions based on current filters
  useEffect(() => {
    const fetchTransactions = async () => {
      setLoading(true);
      try {
        const result = await getTransactions(filters);
        setTransactions(result.transactions);
        setPagination(result.pagination);
      } catch (error) {
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
        const allCategories = await getCategories();
        setCategories(allCategories);
      } catch (error) {
        toast.error('Failed to load categories');
      }
    };

    fetchCategories();
  }, []);

  const handleFilterChange = (e) => {
    const { name, value } = e.target;
    setFilters({ ...filters, [name]: value, page: 1 });
  };

  const clearFilters = () => {
    setFilters({
      type: '',
      category: '',
      startDate: '',
      endDate: '',
      page: 1
    });
  };

  const handlePageChange = (page) => {
    setFilters({ ...filters, page });
  };

  const handleTransactionDeleted = (id) => {
    setTransactions(transactions.filter(transaction => transaction._id !== id));
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between space-y-4 sm:space-y-0">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Transactions</h1>
          <p className="text-gray-600 mt-1">
            View and manage your financial transactions
          </p>
        </div>
        <div className="flex space-x-3">
          <button
            onClick={() => setShowFilters(!showFilters)}
            className="btn btn-secondary"
          >
            <Filter size={16} className="mr-2" />
            {showFilters ? 'Hide Filters' : 'Show Filters'}
          </button>
          <Link to="/transactions/add" className="btn btn-primary">
            <Plus size={16} className="mr-2" /> Add Transaction
          </Link>
        </div>
      </div>

      {showFilters && (
        <div className="bg-white p-4 rounded-lg shadow-sm border border-gray-200 animate-fadeIn">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div>
              <label htmlFor="type" className="block text-sm font-medium text-gray-700 mb-1">
                Type
              </label>
              <select
                id="type"
                name="type"
                className="input"
                value={filters.type}
                onChange={handleFilterChange}
              >
                <option value="">All Types</option>
                <option value="income">Income</option>
                <option value="expense">Expense</option>
              </select>
            </div>
            <div>
              <label htmlFor="category" className="block text-sm font-medium text-gray-700 mb-1">
                Category
              </label>
              <select
                id="category"
                name="category"
                className="input"
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
            <div>
              <label htmlFor="startDate" className="block text-sm font-medium text-gray-700 mb-1">
                From Date
              </label>
              <input
                type="date"
                id="startDate"
                name="startDate"
                className="input"
                value={filters.startDate}
                onChange={handleFilterChange}
              />
            </div>
            <div>
              <label htmlFor="endDate" className="block text-sm font-medium text-gray-700 mb-1">
                To Date
              </label>
              <input
                type="date"
                id="endDate"
                name="endDate"
                className="input"
                value={filters.endDate}
                onChange={handleFilterChange}
              />
            </div>
          </div>
          <div className="mt-4 flex justify-end">
            <button
              onClick={clearFilters}
              className="btn btn-secondary"
            >
              Clear Filters
            </button>
          </div>
        </div>
      )}

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