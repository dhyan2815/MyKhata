import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { format, subDays, startOfMonth, endOfMonth } from 'date-fns';
import { ArrowUpRight, ArrowDownRight, Wallet, TrendingUp, Plus, Calendar } from 'lucide-react';
import { getTransactionSummary, getTransactions } from '../api/transactions';
import TransactionList from '../components/TransactionList';
import DashboardChart from '../components/DashboardChart';
import toast from 'react-hot-toast';

const Dashboard = () => {
  const [loading, setLoading] = useState(true);
  const [summaryData, setSummaryData] = useState(null);
  const [recentTransactions, setRecentTransactions] = useState([]);
  const [dateRange, setDateRange] = useState({
    startDate: format(startOfMonth(new Date()), 'yyyy-MM-dd'),
    endDate: format(endOfMonth(new Date()), 'yyyy-MM-dd'),
  });
  
  useEffect(() => {
    const fetchDashboardData = async () => {
      setLoading(true);
      try {
        // Fetch summary data
        const summary = await getTransactionSummary(dateRange);
        setSummaryData(summary);
        
        // Fetch recent transactions
        const { transactions } = await getTransactions({ 
          limit: 5, 
          sort: 'date:desc',
          ...dateRange
        });
        setRecentTransactions(transactions);
      } catch (error) {
        toast.error('Failed to load dashboard data');
        console.error(error);
      } finally {
        setLoading(false);
      }
    };
    
    fetchDashboardData();
  }, [dateRange]);
  
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
      <div className="flex flex-col md:flex-row md:items-center md:justify-between space-y-4 md:space-y-0">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Dashboard</h1>
          <p className="text-gray-600 mt-1">
            Overview of your financial activities
          </p>
        </div>
        
        <div className="flex items-center space-x-3">
          <Link
            to="/transactions/add"
            className="btn btn-primary"
          >
            <Plus size={16} className="mr-1" /> Add Transaction
          </Link>
        </div>
      </div>
      
      <div className="flex flex-wrap items-center justify-between space-y-2 sm:space-y-0 bg-white rounded-lg shadow-sm border border-gray-200 p-4 mb-6">
        <div className="text-sm text-gray-600 flex items-center">
          <Calendar size={16} className="mr-1" /> Date Range:
        </div>
        <div className="flex flex-wrap gap-2">
          <button
            onClick={() => handleQuickDateRange('today')}
            className={`px-3 py-1 text-xs rounded-full border ${
              dateRange.startDate === format(new Date(), 'yyyy-MM-dd') &&
              dateRange.endDate === format(new Date(), 'yyyy-MM-dd')
                ? 'bg-teal-600 text-white border-teal-600'
                : 'bg-white text-gray-700 border-gray-300 hover:bg-gray-50'
            }`}
          >
            Today
          </button>
          <button
            onClick={() => handleQuickDateRange('week')}
            className={`px-3 py-1 text-xs rounded-full border ${
              dateRange.startDate === format(subDays(new Date(), 7), 'yyyy-MM-dd') &&
              dateRange.endDate === format(new Date(), 'yyyy-MM-dd')
                ? 'bg-teal-600 text-white border-teal-600'
                : 'bg-white text-gray-700 border-gray-300 hover:bg-gray-50'
            }`}
          >
            Last 7 Days
          </button>
          <button
            onClick={() => handleQuickDateRange('month')}
            className={`px-3 py-1 text-xs rounded-full border ${
              dateRange.startDate === format(startOfMonth(new Date()), 'yyyy-MM-dd') &&
              dateRange.endDate === format(endOfMonth(new Date()), 'yyyy-MM-dd')
                ? 'bg-teal-600 text-white border-teal-600'
                : 'bg-white text-gray-700 border-gray-300 hover:bg-gray-50'
            }`}
          >
            This Month
          </button>
          <button
            onClick={() => handleQuickDateRange('year')}
            className={`px-3 py-1 text-xs rounded-full border ${
              dateRange.startDate === format(new Date(new Date().getFullYear(), 0, 1), 'yyyy-MM-dd') &&
              dateRange.endDate === format(new Date(new Date().getFullYear(), 11, 31), 'yyyy-MM-dd')
                ? 'bg-teal-600 text-white border-teal-600'
                : 'bg-white text-gray-700 border-gray-300 hover:bg-gray-50'
            }`}
          >
            This Year
          </button>
        </div>
        <div className="flex items-center space-x-2">
          <input
            type="date"
            value={dateRange.startDate}
            onChange={(e) => setDateRange({ ...dateRange, startDate: e.target.value })}
            className="input py-1 h-8 text-sm"
          />
          <span className="text-gray-500">to</span>
          <input
            type="date"
            value={dateRange.endDate}
            onChange={(e) => setDateRange({ ...dateRange, endDate: e.target.value })}
            className="input py-1 h-8 text-sm"
          />
        </div>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className={`card p-5 ${loading ? 'animate-pulse' : ''}`}>
          {loading ? (
            <>
              <div className="h-5 w-1/3 bg-gray-200 rounded"></div>
              <div className="h-8 w-1/2 bg-gray-300 rounded mt-3"></div>
              <div className="h-4 w-2/3 bg-gray-200 rounded mt-2"></div>
            </>
          ) : (
            <>
              <div className="flex justify-between items-start">
                <span className="text-gray-500 text-sm">Balance</span>
                <div className="p-2 bg-blue-100 rounded-full text-blue-600">
                  <Wallet size={16} />
                </div>
              </div>
              <p className="text-2xl font-bold text-gray-900 mt-2">
                ₹{summaryData?.summary?.balance.toFixed(2) || '0.00'}
              </p>
              <p className="text-xs text-gray-500 mt-1">
                {dateRange.startDate === dateRange.endDate 
                  ? `on ${format(new Date(dateRange.startDate), 'MMM dd, yyyy')}`
                  : `from ${format(new Date(dateRange.startDate), 'MMM dd')} to ${format(new Date(dateRange.endDate), 'MMM dd, yyyy')}`
                }
              </p>
            </>
          )}
        </div>
        
        <div className={`card p-5 ${loading ? 'animate-pulse' : ''}`}>
          {loading ? (
            <>
              <div className="h-5 w-1/3 bg-gray-200 rounded"></div>
              <div className="h-8 w-1/2 bg-gray-300 rounded mt-3"></div>
              <div className="h-4 w-2/3 bg-gray-200 rounded mt-2"></div>
            </>
          ) : (
            <>
              <div className="flex justify-between items-start">
                <span className="text-gray-500 text-sm">Income</span>
                <div className="p-2 bg-green-100 rounded-full text-green-600">
                  <ArrowUpRight size={16} />
                </div>
              </div>
              <p className="text-2xl font-bold text-gray-900 mt-2">
                ₹{summaryData?.summary?.income.toFixed(2) || '0.00'}
              </p>
              <p className="text-xs text-gray-500 mt-1">
                {dateRange.startDate === dateRange.endDate 
                  ? `on ${format(new Date(dateRange.startDate), 'MMM dd, yyyy')}`
                  : `from ${format(new Date(dateRange.startDate), 'MMM dd')} to ${format(new Date(dateRange.endDate), 'MMM dd, yyyy')}`
                }
              </p>
            </>
          )}
        </div>
        
        <div className={`card p-5 ${loading ? 'animate-pulse' : ''}`}>
          {loading ? (
            <>
              <div className="h-5 w-1/3 bg-gray-200 rounded"></div>
              <div className="h-8 w-1/2 bg-gray-300 rounded mt-3"></div>
              <div className="h-4 w-2/3 bg-gray-200 rounded mt-2"></div>
            </>
          ) : (
            <>
              <div className="flex justify-between items-start">
                <span className="text-gray-500 text-sm">Expenses</span>
                <div className="p-2 bg-red-100 rounded-full text-red-600">
                  <ArrowDownRight size={16} />
                </div>
              </div>
              <p className="text-2xl font-bold text-gray-900 mt-2">
                ₹{summaryData?.summary?.expense.toFixed(2) || '0.00'}
              </p>
              <p className="text-xs text-gray-500 mt-1">
                {dateRange.startDate === dateRange.endDate 
                  ? `on ${format(new Date(dateRange.startDate), 'MMM dd, yyyy')}`
                  : `from ${format(new Date(dateRange.startDate), 'MMM dd')} to ${format(new Date(dateRange.endDate), 'MMM dd, yyyy')}`
                }
              </p>
            </>
          )}
        </div>
      </div>
      
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <DashboardChart transactionData={summaryData} isLoading={loading} />
        
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
          <div className="px-4 py-5 border-b border-gray-200 sm:px-6 flex justify-between items-center">
            <div>
              <h3 className="text-lg font-medium text-gray-900">Recent Transactions</h3>
              <p className="text-sm text-gray-500 mt-1">Your latest financial activities</p>
            </div>
            <Link to="/transactions" className="text-sm text-teal-600 hover:text-teal-800 font-medium flex items-center">
              View All
              <TrendingUp size={16} className="ml-1" />
            </Link>
          </div>
          <div className="px-4 py-5 sm:p-6">
            <TransactionList
              transactions={recentTransactions}
              isLoading={loading}
            />
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;