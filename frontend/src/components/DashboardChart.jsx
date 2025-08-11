import { useState, useEffect } from 'react';
import { Bar, Doughnut } from 'react-chartjs-2';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend,
  ArcElement,
} from 'chart.js';
import { useAuth } from '../context/AuthContext';
import { formatCurrency } from '../utils/currencyFormatter';
import { motion } from 'framer-motion';

// Register necessary Chart.js components
ChartJS.register(
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend,
  ArcElement
);

const DashboardChart = ({ transactionData, isLoading }) => {
  // Get user from AuthContext to access currency preference
  const { user } = useAuth();
  
  // State to control which chart type is shown
  const [chartType, setChartType] = useState('doughnut');
  // State to hold chart data for both chart types
  const [chartData, setChartData] = useState(null);

  // Prepare chart data whenever transactionData changes
  useEffect(() => {
    if (!transactionData?.summary || !transactionData?.categories) {
      return;
    }

    const { summary, categories } = transactionData;

    // Data for Income vs Expense bar chart
    const incomeVsExpenseData = {
      labels: ['Income', 'Expense'],
      datasets: [
        {
          data: [summary.income || 0, summary.expense || 0],
          backgroundColor: ['#10B981', '#EF4444'],
          borderColor: ['#10B981', '#EF4444'],
          borderWidth: 1,
        },
      ],
    };

    // Data for Expense Breakdown doughnut chart
    const expenseCategories = categories.expense || [];
    const expenseCategoryData = {
      labels: expenseCategories.map(cat => cat.name),
      datasets: [
        {
          data: expenseCategories.map(cat => cat.total),
          backgroundColor: expenseCategories.map(cat => cat.color),
          borderColor: expenseCategories.map(cat => cat.color),
          borderWidth: 1,
        },
      ],
    };

    // Store both chart data objects in state
    setChartData({
      doughnut: expenseCategoryData,
      bar: incomeVsExpenseData,
    });
  }, [transactionData]);

  // Show loading skeleton if data is loading
  if (isLoading) {
    return (
      <div className="bg-white dark:bg-gray-800 p-4 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 animate-pulse">
        <div className="h-6 bg-gray-200 dark:bg-gray-600 rounded w-1/4 mb-4"></div>
        <div className="h-64 bg-gray-200 dark:bg-gray-600 rounded w-full"></div>
      </div>
    );
  }

  // Show message if no chart data is available
  if (!chartData) {
    return (
      <div className="bg-white dark:bg-gray-800 p-4 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 flex flex-col items-center justify-center h-64">
        <div className="text-gray-400 dark:text-gray-500 mb-2">
          <svg className="w-12 h-12" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
          </svg>
        </div>
        <p className="text-gray-500 dark:text-gray-400 text-center">
          No transaction data available for the selected period
        </p>
        <p className="text-xs text-gray-400 dark:text-gray-500 text-center mt-1">
          Add some transactions to see your financial insights here
        </p>
      </div>
    );
  }

  // Chart options for doughnut chart
  const doughnutOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        position: 'right',
        labels: {
          color: typeof window !== 'undefined' ? getComputedStyle(document.documentElement).getPropertyValue('--chart-legend-label').trim() || '#222' : '#222',
        },
      },
      tooltip: {
        callbacks: {
          label: (context) => {
            const label = context.label || '';
            const value = context.raw || 0;
            const total = context.dataset.data.reduce((a, b) => a + b, 0);
            const percentage = total ? Math.round((value / total) * 100) : 0;
            return `${label}: ${formatCurrency(value, user?.currency || 'INR', { fromCurrency: transactionData?.currency || 'INR' })} (${percentage}%)`;
          },
        },
      },
    },
  };

  // Chart options for bar chart
  const barOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        display: false,
      },
      tooltip: {
        callbacks: {
          label: (context) => {
            const label = context.label || '';
            const value = context.raw || 0;
            return `${label}: ${formatCurrency(value, user?.currency || 'INR', { fromCurrency: transactionData?.currency || 'INR' })}`;
          },
        },
      },
    },
    scales: {
      y: {
        beginAtZero: true,
        ticks: {
          callback: (value) => formatCurrency(value, user?.currency || 'INR', { fromCurrency: transactionData?.currency || 'INR' }),
        },
      },
    },
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-4"
    >
      {/* Chart Header */}
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
          Income & Expense Overview
        </h3>
        
        {/* Chart Type Toggle */}
        <div className="flex bg-gray-100 dark:bg-gray-700 rounded-lg p-1">
          <button
            onClick={() => setChartType('doughnut')}
            className={`px-3 py-1 text-sm rounded-md transition-colors ${
              chartType === 'doughnut'
                ? 'bg-white dark:bg-gray-600 text-gray-900 dark:text-white shadow-sm'
                : 'text-gray-600 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white'
            }`}
          >
            Breakdown
          </button>
          <button
            onClick={() => setChartType('bar')}
            className={`px-3 py-1 text-sm rounded-md transition-colors ${
              chartType === 'bar'
                ? 'bg-white dark:bg-gray-600 text-gray-900 dark:text-white shadow-sm'
                : 'text-gray-600 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white'
            }`}
          >
            Comparison
          </button>
        </div>
      </div>

      {/* Chart Container */}
      <div className="h-64 mt-[64px]">
        {chartType === 'doughnut' ? (
          <Doughnut data={chartData.doughnut} options={doughnutOptions} />
        ) : (
          <Bar data={chartData.bar} options={barOptions} />
        )}
      </div>
    </motion.div>
  );
};

export default DashboardChart;