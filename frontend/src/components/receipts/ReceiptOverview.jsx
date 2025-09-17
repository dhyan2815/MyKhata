/**
 * ReceiptOverview Component
 * 
 * Displays statistical overview of receipts including:
 * - Total scanned receipts count
 * - Total processed receipts count
 * - Total pending receipts count
 * - Total processed amount in currency format
 * - Total pending amount in currency format
 * - Responsive grid layout with hover effects
 */
import React from 'react';
import { useTheme } from '../../context/ThemeContext';
import { getReceiptStatistics } from '../../utils/receiptUtils';

/**
 * Individual statistic card component
 */
const StatCard = ({ value, label, color, isDark }) => {
  // Define explicit color classes to ensure Tailwind includes them in build
  const getColorClass = (color) => {
    switch (color) {
      case 'blue': return 'text-blue-600';
      case 'green': return 'text-green-600';
      case 'yellow': return 'text-yellow-600';
      case 'purple': return 'text-purple-600';
      case 'red': return 'text-red-600';
      case 'indigo': return 'text-indigo-600';
      case 'pink': return 'text-pink-600';
      case 'gray': return 'text-gray-600';
      default: return 'text-blue-600';
    }
  };

  return (
    <div className="flex flex-col items-center min-w-[120px] p-3 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors">
      <div className={`text-4xl font-bold ${getColorClass(color)}`}>
        {value}
      </div>
      <div className={`text-sm ${isDark ? 'text-gray-300' : 'text-gray-600'}`}>
        {label}
      </div>
    </div>
  );
};

/**
 * Main ReceiptOverview component
 */
const ReceiptOverview = ({ receipts }) => {
  const { isDark } = useTheme();

  // Don't render if no receipts
  if (!receipts || receipts.length === 0) {
    return null;
  }

  // Calculate statistics
  const stats = getReceiptStatistics(receipts);

  return (
    <div
      className={`mt-12 rounded-lg p-6 shadow-lg border ${
        isDark
          ? 'bg-gray-800 border-gray-700'
          : 'bg-white border-gray-200'
      }`}
    >
      {/* Overview Header */}
      <h2 className="text-2xl font-semibold mb-4 text-gray-900 dark:text-white">
        Receipt Overview
      </h2>
      
      {/* Statistics Grid */}
      <div className="flex flex-wrap justify-center lg:justify-between items-center gap-4 px-2">
        {/* Total Scanned */}
        <StatCard
          value={stats.totalScanned}
          label="Total Scanned"
          color="blue"
          isDark={isDark}
        />

        {/* Total Processed Amount */}
        <StatCard
          value={stats.formattedAmount}
          label="Total Processed Amount"
          color="purple"
          isDark={isDark}
        />

        {/* Total Processed */}
        <StatCard
          value={stats.totalProcessed}
          label="Processed"
          color="green"
          isDark={isDark}
        />

        {/* Total Pending Amount */}
        <StatCard
          value={stats.formattedPendingAmount}
          label="Total Pending Amount"
          color="red"
          isDark={isDark}
        />

        {/* Total Pending */}
        <StatCard
          value={stats.totalPending}
          label="Pending"
          color="yellow"
          isDark={isDark}
        />
      </div>
    </div>
  );
};

export default ReceiptOverview;
