import { useState } from 'react';
import { Link } from 'react-router-dom';
import { Edit, Trash2, ChevronDown, ChevronUp, Search } from 'lucide-react';
import { format } from 'date-fns';
import { deleteTransaction } from '../api/transactions';
import toast from 'react-hot-toast';
import { safeArray } from '../utils/safeArray';
import { useAuth } from '../context/AuthContext';
import { formatTransactionAmount } from '../utils/currencyFormatter';
import { motion, AnimatePresence } from 'framer-motion';

// TransactionList component displays a list of transactions with sorting, searching, and pagination
const TransactionList = ({
  transactions,
  onTransactionDeleted,
  isLoading = false,
  pagination = null,
  onPageChange = () => {},
  showActions = true,
}) => {
  // Get user from AuthContext to access currency preference
  const { user } = useAuth();
  
  // State for search input
  const [searchTerm, setSearchTerm] = useState("");
  // State for sorting field and direction
  const [sortField, setSortField] = useState("date");
  const [sortDirection, setSortDirection] = useState("desc");

  // Handles sorting logic when a column header is clicked
  const handleSort = (field) => {
    if (sortField === field) {
      setSortDirection(sortDirection === "asc" ? "desc" : "asc");
    } else {
      setSortField(field);
      setSortDirection("asc");
    }
  };

  // Handles deletion of a transaction
  const handleDelete = async (id) => {
    if (window.confirm("Are you sure you want to delete this transaction?")) {
      try {
        await deleteTransaction(id);
        toast.success("Transaction deleted successfully");
        if (onTransactionDeleted) {
          onTransactionDeleted(id);
        }
      } catch (error) {
        toast.error(
          error.response?.data?.message || "Failed to delete transaction"
        );
      }
    }
  };

  // Always use a safe array for all array operations
  const safeTransactions = safeArray(transactions);
  // Filter transactions based on search term (description or category)
  const filteredTransactions = safeTransactions.filter((transaction) => 
    transaction.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
    transaction.category.name.toLowerCase().includes(searchTerm.toLowerCase())
  );
  // Sort filtered transactions based on selected field and direction
  const sortedTransactions = [...filteredTransactions].sort((a, b) => {
    if (sortField === "date") {
      return sortDirection === "asc"
        ? new Date(a.date) - new Date(b.date)
        : new Date(b.date) - new Date(a.date);
    } else if (sortField === "amount") {
      return sortDirection === "asc"
        ? a.amount - b.amount
        : b.amount - a.amount;
    } else if (sortField === "description") {
      return sortDirection === "asc"
        ? a.description.localeCompare(b.description)
        : b.description.localeCompare(a.description);
    } else if (sortField === "category") {
      return sortDirection === "asc"
        ? a.category.name.localeCompare(b.category.name)
        : b.category.name.localeCompare(a.category.name);
    }
    return 0;
  });

  // Show loading spinner if data is loading
  if (isLoading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-teal-600"></div>
      </div>
    );
  }

  return (
    <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 overflow-hidden">
      {/* Search bar */}
      <div className="p-3 sm:p-4 border-b border-gray-200 dark:border-gray-700">
        <div className="flex items-center">
          <div className="relative flex-1">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <Search size={16} className="text-gray-400 dark:text-gray-500" />
            </div>
            <input
              type="text"
              placeholder="Search transactions..."
              className="pl-10 pr-3 py-2 w-full border border-gray-300 dark:border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-teal-500 focus:border-transparent dark:bg-gray-700 dark:text-white text-sm sm:text-base"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
        </div>
      </div>
      {/* Responsive Table/Card */}
      <div className="overflow-x-auto">
        {/* Table for lg+ screens, cards for mobile */}
        <table className="hidden lg:table min-w-full divide-y divide-gray-200 dark:divide-gray-700">
          <thead className="bg-gray-50 dark:bg-gray-800">
            <tr>
              <th
                className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider cursor-pointer"
                onClick={() => handleSort("date")}
              >
                <div className="flex items-center">
                  Date
                  {sortField === "date" &&
                    (sortDirection === "asc" ? (
                      <ChevronUp
                        size={16}
                        className="text-gray-500 dark:text-gray-300"
                      />
                    ) : (
                      <ChevronDown
                        size={16}
                        className="text-gray-500 dark:text-gray-300"
                      />
                    ))}
                </div>
              </th>
              <th
                className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider cursor-pointer"
                onClick={() => handleSort("description")}
              >
                <div className="flex items-center">
                  Description
                  {sortField === "description" &&
                    (sortDirection === "asc" ? (
                      <ChevronUp
                        size={16}
                        className="text-gray-500 dark:text-gray-300"
                      />
                    ) : (
                      <ChevronDown
                        size={16}
                        className="text-gray-500 dark:text-gray-300"
                      />
                    ))}
                </div>
              </th>
              <th
                className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider cursor-pointer hidden sm:table-cell"
                onClick={() => handleSort("category")}
              >
                <div className="flex items-center">
                  Category
                  {sortField === "category" &&
                    (sortDirection === "asc" ? (
                      <ChevronUp
                        size={16}
                        className="text-gray-500 dark:text-gray-300"
                      />
                    ) : (
                      <ChevronDown
                        size={16}
                        className="text-gray-500 dark:text-gray-300"
                      />
                    ))}
                </div>
              </th>
              <th
                className="px-6 py-3 text-right text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider cursor-pointer"
                onClick={() => handleSort("amount")}
              >
                <div className="flex items-center justify-end">
                  Amount
                  {sortField === "amount" &&
                    (sortDirection === "asc" ? (
                      <ChevronUp
                        size={16}
                        className="text-gray-500 dark:text-gray-300"
                      />
                    ) : (
                      <ChevronDown
                        size={16}
                        className="text-gray-500 dark:text-gray-300"
                      />
                    ))}
                </div>
              </th>
              {showActions && (
                <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                  Actions
                </th>
              )}
            </tr>
          </thead>
          <tbody className="bg-white dark:bg-gray-800 divide-y divide-gray-200 dark:divide-gray-700">
            {isLoading ? (
              Array.from({ length: 3 }).map((_, index) => (
                <tr key={index} className="animate-pulse">
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="h-4 bg-gray-200 dark:bg-gray-600 rounded w-24"></div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="h-4 bg-gray-200 dark:bg-gray-600 rounded w-32"></div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap hidden sm:table-cell">
                    <div className="h-4 bg-gray-200 dark:bg-gray-600 rounded w-20"></div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-right">
                    <div className="h-4 bg-gray-200 dark:bg-gray-600 rounded w-16 ml-auto"></div>
                  </td>
                  {showActions && (
                    <td className="px-6 py-4 whitespace-nowrap text-right">
                      <div className="h-4 bg-gray-200 dark:bg-gray-600 rounded w-20 ml-auto"></div>
                    </td>
                  )}
                </tr>
              ))
            ) : sortedTransactions.length > 0 ? (
              sortedTransactions.map((transaction, index) => (
                <motion.tr
                  key={transaction._id}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ 
                    duration: 0.3,
                    delay: index * 0.05,
                    ease: "easeOut"
                  }}
                  exit={{ opacity: 0, x: 20 }}
                  className="hover:bg-gray-50 dark:hover:bg-gray-700"
                >
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-300">
                    {format(new Date(transaction.date), "MMM dd, yyyy")}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 dark:text-gray-100 max-w-[120px] overflow-hidden text-ellipsis" title={transaction.description}>
                    {transaction.description}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap hidden sm:table-cell">
                    <span
                      className="px-2.5 py-1 rounded-full text-xs font-medium"
                      style={{
                        backgroundColor: `${transaction.category.color}20`,
                        color: transaction.category.color,
                      }}
                    >
                      {transaction.category.name}
                    </span>
                  </td>
                  <td
                    className={`px-6 py-4 whitespace-nowrap text-sm font-medium text-right ${
                      transaction.type === "expense"
                        ? "text-red-600"
                        : "text-green-600"
                    }`}
                  >
                    {formatTransactionAmount(transaction.amount, transaction.type, user?.currency || 'INR', { fromCurrency: transaction.currency || 'INR' })}
                  </td>
                  {showActions && (
                    <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                      <div className="flex justify-end items-center gap-5">
                        <Link
                          to={`/transactions/${transaction._id}/edit`}
                          className="text-blue-600 hover:text-blue-900"
                        >
                          <Edit size={16} />
                        </Link>
                        <button
                          onClick={() => handleDelete(transaction._id)}
                          className="text-red-600 hover:text-red-900"
                        >
                          <Trash2 size={16} />
                        </button>
                      </div>
                    </td>
                  )}
                </motion.tr>
              ))
            ) : (
              <tr>
                <td
                  colSpan={showActions ? 5 : 4}
                  className="px-6 py-4 text-center text-gray-500 dark:text-gray-400"
                >
                  No transactions found
                </td>
              </tr>
            )}
          </tbody>
        </table>
        {/* Cards for mobile (below lg) */}
        <div className="lg:hidden space-y-3 p-2">
          {isLoading ? (
            Array.from({ length: 3 }).map((_, index) => (
              <div
                key={index}
                className="animate-pulse bg-gray-100 dark:bg-gray-700 rounded-lg p-4"
              >
                <div className="h-4 bg-gray-200 dark:bg-gray-600 rounded w-24 mb-2"></div>
                <div className="h-4 bg-gray-200 dark:bg-gray-600 rounded w-32 mb-2"></div>
                <div className="h-4 bg-gray-200 dark:bg-gray-600 rounded w-20 mb-2"></div>
                <div className="h-4 bg-gray-200 dark:bg-gray-600 rounded w-16"></div>
              </div>
            ))
          ) : sortedTransactions.length > 0 ? (
            sortedTransactions.map((transaction, index) => (
              <motion.div
                key={transaction._id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ 
                  duration: 0.3,
                  delay: index * 0.05,
                  ease: "easeOut"
                }}
                exit={{ opacity: 0, y: -20 }}
                whileHover={{ 
                  y: -2,
                  transition: { duration: 0.2 }
                }}
                className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-3 sm:p-4 flex flex-col gap-2"
              >
                <div className="flex justify-between items-center">
                  <span className="text-xs text-gray-500 dark:text-gray-400">
                    {format(new Date(transaction.date), "MMM dd, yyyy")}
                  </span>
                  <span
                    className={`text-sm font-medium ${
                      transaction.type === "expense"
                        ? "text-red-600"
                        : "text-green-600"
                    }`}
                  >
                    {formatTransactionAmount(transaction.amount, transaction.type, user?.currency || 'INR', { fromCurrency: transaction.currency || 'INR' })}
                  </span>
                </div>
                <div className="text-sm text-gray-900 dark:text-gray-100 font-semibold max-w-[180px] overflow-hidden text-ellipsis whitespace-nowrap" title={transaction.description}>
                  {transaction.description}
                </div>
                {/* Show category on all mobile sizes */}
                <div className="text-xs">
                  <span
                    className="px-2.5 py-1 rounded-full font-medium"
                    style={{
                      backgroundColor: `${transaction.category.color}20`,
                      color: transaction.category.color,
                    }}
                  >
                    {transaction.category.name}
                  </span>
                </div>
                {showActions && (
                  <div className="flex gap-4 mt-2">
                    <Link
                      to={`/transactions/${transaction._id}/edit`}
                      className="text-blue-600 hover:text-blue-900"
                    >
                      <Edit size={16} />
                    </Link>
                    <button
                      onClick={() => handleDelete(transaction._id)}
                      className="text-red-600 hover:text-red-900"
                    >
                      <Trash2 size={16} />
                    </button>
                  </div>
                )}
              </motion.div>
            ))
          ) : (
            <div className="text-center text-gray-500 dark:text-gray-400 py-4">
              No transactions found
            </div>
          )}
        </div>
      </div>
      {/* Pagination controls */}
      {pagination && pagination.total > 0 && showActions && (
        <div className="px-6 py-4 border-t border-gray-200 dark:border-gray-700 flex items-center justify-between">
          <div className="text-sm text-gray-500 dark:text-gray-400">
            Showing {(pagination.page - 1) * 10 + 1} to{" "}
            {Math.min(pagination.page * 10, pagination.total)} of{" "}
            {pagination.total} transactions
          </div>
          <div className="flex space-x-2">
            <button
              className="px-3 py-1 rounded border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-sm font-medium text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-600 disabled:opacity-50"
              onClick={() => onPageChange(pagination.page - 1)}
              disabled={pagination.page === 1}
            >
              Previous
            </button>
            <button
              className="px-3 py-1 rounded border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-sm font-medium text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-600 disabled:opacity-50"
              onClick={() => onPageChange(pagination.page + 1)}
              disabled={pagination.page === pagination.pages}
            >
              Next
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default TransactionList;
