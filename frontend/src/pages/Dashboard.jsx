import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { format, subDays, startOfMonth, endOfMonth } from 'date-fns';
import { ArrowUpRight, ArrowDownRight, Wallet, TrendingUp, Plus, Calendar } from 'lucide-react';
import { getTransactionSummary, getTransactions } from '../api/transactions';
import TransactionList from '../components/TransactionList';
import DashboardChart from '../components/DashboardChart';
import toast from 'react-hot-toast';
import { Helmet } from 'react-helmet-async';
import { safeArray } from '../utils/safeArray';
import { useAuth } from '../context/AuthContext';
import { formatCurrency } from '../utils/currencyFormatter';
import { motion } from 'framer-motion';

// Main Dashboard component
const Dashboard = () => {
  // Get user from AuthContext to access currency preference
  const { user } = useAuth();
  
  // State for loading indicator
  const [loading, setLoading] = useState(true);
  // State for summary data (balance, income, expense)
  const [summaryData, setSummaryData] = useState(null);
  // State for recent transactions list
  const [recentTransactions, setRecentTransactions] = useState([]);
  // State for selected date range
  const [dateRange, setDateRange] = useState(() => {
    const now = new Date();
    const startDate = format(startOfMonth(now), 'yyyy-MM-dd');
    const endDate = format(endOfMonth(now), 'yyyy-MM-dd');
    return { startDate, endDate };
  });
  
  // Fetch dashboard data whenever dateRange changes
  useEffect(() => {
    const fetchDashboardData = async () => {
      setLoading(true);
      try {
        // Fetch summary data for the selected date range
        const summary = await getTransactionSummary(dateRange);
        setSummaryData(summary);
        
        // Fetch the 5 most recent transactions for the selected date range
        const { transactions } = await getTransactions({ 
          limit: 5, 
          sort: 'date:desc',
          ...dateRange
        });
        setRecentTransactions(transactions);
      } catch (error) {
        // Show error toast if fetching fails
        toast.error('Failed to load dashboard data');
      } finally {
        setLoading(false);
      }
    };
    
    fetchDashboardData();
  }, [dateRange]);
  
  // Handler for quick date range buttons (Today, Last 7 Days, etc.)
  const handleQuickDateRange = (range) => {
    const today = new Date();
    let startDate, endDate;
    
    switch (range) {
      case 'today':
        startDate = format(today, 'yyyy-MM-dd');
        endDate = format(today, 'yyyy-MM-dd');
        break;
      case 'week':
        startDate = format(subDays(today, 7), 'yyyy-MM-dd');
        endDate = format(today, 'yyyy-MM-dd');
        break;
      case 'month':
        startDate = format(startOfMonth(today), 'yyyy-MM-dd');
        endDate = format(endOfMonth(today), 'yyyy-MM-dd');
        break;
      case 'year':
        startDate = format(new Date(today.getFullYear(), 0, 1), 'yyyy-MM-dd');
        endDate = format(new Date(today.getFullYear(), 11, 31), 'yyyy-MM-dd');
        break;
      default:
        return;
    }
    
    setDateRange({ startDate, endDate });
  };

  return (
    <div className="space-y-6">
      <Helmet>
        <title>Dashboard · MyKhata</title>
      </Helmet>
      {/* Header: Title and Add Transaction button */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between space-y-3 sm:space-y-0">
        <div>
          <h1 className="text-xl sm:text-2xl font-bold text-gray-900 dark:text-white">Dashboard</h1>
          <p className="text-sm sm:text-base text-gray-600 dark:text-gray-400 mt-1">
            Overview of your financial activities
          </p>
        </div>

        <div className="flex items-center space-x-3">
          <Link to="/transactions/add" className="btn btn-primary text-sm sm:text-base">
            <Plus size={16} className="mr-1" /> Add Transaction
          </Link>
        </div>
      </div>

      {/* Date Range Selector: Quick buttons and custom date pickers */}
      <div className="bg-white dark:bg-gray-900 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-3 sm:p-4 mb-4 sm:mb-6">
        <div className="grid grid-cols-1 sm:grid-cols-[auto_1fr_auto] sm:items-center gap-3">
          {/* Left: Date Range label */}
          <div className="text-sm text-gray-600 dark:text-gray-300 flex items-center">
            <Calendar size={16} className="mr-1" /> Date Range:
          </div>
          {/* Center: Quick range buttons */}
          <div className="flex flex-wrap justify-center gap-2">
            {['today', 'week', 'month', 'year'].map((range) => {
              const labelMap = {
                today: 'Today',
                week: 'Last 7 Days',
                month: 'This Month',
                year: 'This Year',
              };
              const expectedDate = {
                today: {
                  start: format(new Date(), 'yyyy-MM-dd'),
                  end: format(new Date(), 'yyyy-MM-dd'),
                },
                week: {
                  start: format(subDays(new Date(), 7), 'yyyy-MM-dd'),
                  end: format(new Date(), 'yyyy-MM-dd'),
                },
                month: {
                  start: format(startOfMonth(new Date()), 'yyyy-MM-dd'),
                  end: format(endOfMonth(new Date()), 'yyyy-MM-dd'),
                },
                year: {
                  start: format(new Date(new Date().getFullYear(), 0, 1), 'yyyy-MM-dd'),
                  end: format(new Date(new Date().getFullYear(), 11, 31), 'yyyy-MM-dd'),
                },
              };
              const isActive =
                dateRange.startDate === expectedDate[range].start &&
                dateRange.endDate === expectedDate[range].end;
              return (
                <button
                  key={range}
                  onClick={() => handleQuickDateRange(range)}
                  className={`px-2 sm:px-3 py-1 text-xs rounded-full border transition ${
                    isActive
                      ? 'bg-teal-600 text-white border-teal-600'
                      : 'bg-white dark:bg-gray-800 text-gray-700 dark:text-gray-300 border-gray-300 dark:border-gray-600 hover:bg-gray-50 dark:hover:bg-gray-700'
                  }`}
                >
                  {labelMap[range]}
                </button>
              );
            })}
          </div>
          {/* Right: Custom date range pickers */}
          <div className="flex items-center space-x-2 justify-end">
            <input
              type="date"
              value={dateRange.startDate}
              onChange={(e) => setDateRange({ ...dateRange, startDate: e.target.value })}
              className="input py-1 h-8 text-xs sm:text-sm dark:bg-gray-800 dark:text-gray-100 dark:border-gray-700"
            />
            <span className="text-gray-500 dark:text-gray-400 text-xs sm:text-sm">To</span>
            <input
              type="date"
              value={dateRange.endDate}
              onChange={(e) => setDateRange({ ...dateRange, endDate: e.target.value })}
              className="input py-1 h-8 text-xs sm:text-sm dark:bg-gray-800 dark:text-gray-100 dark:border-gray-700"
            />
          </div>
        </div>
      </div>

      {/* Summary Cards: Balance, Income, Expenses */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
        {['balance', 'income', 'expense'].map((key, index) => {
          // Card configuration for each summary type
          const config = {
            balance: {
              title: 'Balance',
              icon: <Wallet size={16} />,
              bg: 'bg-blue-100',
              text: 'text-blue-600',
            },
            income: {
              title: 'Income',
              icon: <ArrowUpRight size={16} />,
              bg: 'bg-green-100',
              text: 'text-green-600',
            },
            expense: {
              title: 'Expenses',
              icon: <ArrowDownRight size={16} />,
              bg: 'bg-red-100',
              text: 'text-red-600',
            },
          };

          return (
            <motion.div 
              key={key} 
              initial={{ opacity: 0, y: 30, scale: 0.95 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              transition={{ 
                duration: 0.4,
                delay: index * 0.1,
                ease: "easeOut"
              }}
              whileHover={{ 
                y: -5,
                transition: { duration: 0.2 }
              }}
              className={`card p-4 sm:p-5 dark:bg-gray-900 dark:border-gray-700 cursor-pointer ${loading ? 'animate-pulse' : ''}`}
            >
              {loading ? (
                // Loading skeleton for summary cards
                <>
                  <div className="h-4 sm:h-5 w-1/3 bg-gray-200 dark:bg-gray-700 rounded"></div>
                  <div className="h-6 sm:h-8 w-1/2 bg-gray-300 dark:bg-gray-600 rounded mt-2 sm:mt-3"></div>
                  <div className="h-3 sm:h-4 w-2/3 bg-gray-200 dark:bg-gray-700 rounded mt-2"></div>
                </>
              ) : (
                <>
                  <div className="flex justify-between items-start">
                    <span className="text-gray-500 dark:text-gray-400 text-xs sm:text-sm">{config[key].title}</span>
                    <div className={`p-1.5 sm:p-2 ${config[key].bg} rounded-full ${config[key].text}`}>
                      {config[key].icon}
                    </div>
                  </div>
                  <p className="text-lg sm:text-xl lg:text-2xl font-bold text-gray-900 dark:text-white mt-2">
                    {formatCurrency(summaryData?.summary?.[key] || 0, user?.currency || 'INR')}
                  </p>
                  <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                    {dateRange.startDate === dateRange.endDate
                      ? `on ${format(new Date(dateRange.startDate), 'MMM dd, yyyy')}`
                      : `from ${format(new Date(dateRange.startDate), 'MMM dd')} to ${format(new Date(dateRange.endDate), 'MMM dd, yyyy')}`}
                  </p>
                </>
              )}
            </motion.div>
          );
        })}
      </div>

      {/* Chart and Recent Transactions section */}
      <div className="grid grid-cols-1 xl:grid-cols-2 gap-4 sm:gap-6">
        {/* Dashboard chart for visualizing summary data */}
        <DashboardChart transactionData={summaryData} isLoading={loading} />

        {/* Recent Transactions Card */}
        <div className="bg-white dark:bg-gray-900 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 overflow-hidden">
          <div className="px-4 py-5 border-b border-gray-200 dark:border-gray-700 sm:px-6 flex justify-between items-center">
            <div>
              <h3 className="text-lg font-medium text-gray-900 dark:text-white">Recent Transactions</h3>
              <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">Your latest financial activities</p>
            </div>
            <Link
              to="/transactions"
              className="text-sm text-teal-600 hover:text-teal-800 dark:hover:text-teal-400 font-medium flex items-center"
            >
              View All
              <TrendingUp size={16} className="ml-1" />
            </Link>
          </div>
          <div className="px-4 py-5 sm:p-6">
            {/* List of recent transactions */}
            <TransactionList
              transactions={safeArray(recentTransactions).slice(0, 3)}
              isLoading={loading}
              showActions={false}
            />
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
