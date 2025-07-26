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
    if (!transactionData?.summary || !transactionData?.categories) return;

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
      <div className="bg-white dark:bg-gray-800 p-4 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 flex items-center justify-center h-64">
        <p className="text-gray-500 dark:text-gray-400">No data available for charts</p>
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
            return `${label}: ${formatCurrency(value, user?.currency || 'INR')} (${percentage}%)`;
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
          label: (context) => formatCurrency(context.raw, user?.currency || 'INR'),
        },
      },
    },
    scales: {
      y: {
        beginAtZero: true,
        ticks: {
          callback: (value) => formatCurrency(value, user?.currency || 'INR'),
        },
      },
    },
  };

  return (
    <motion.div 
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4 }}
      className="bg-white dark:bg-gray-800 p-4 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700"
    >
      <div className="flex items-center justify-between mb-20">
        <h2 className="text-lg font-semibold text-gray-800 dark:text-white">Financial Overview</h2>
        <div className="flex space-x-2">
          {/* Button to switch to Expense Breakdown (doughnut) chart */}
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            className={`px-3 py-1 text-sm rounded-md ${
              chartType === 'doughnut'
                ? 'bg-teal-600 text-white'
                : 'bg-gray-200 dark:bg-gray-600 text-gray-700 dark:text-gray-300 hover:bg-gray-300 dark:hover:bg-gray-500'
            }`}
            onClick={() => setChartType('doughnut')}
          >
            Expense Breakdown
          </motion.button>
          {/* Button to switch to Income vs Expense (bar) chart */}
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            className={`px-3 py-1 text-sm rounded-md ${
              chartType === 'bar'
                ? 'bg-teal-600 text-white'
                : 'bg-gray-200 dark:bg-gray-600 text-gray-700 dark:text-gray-300 hover:bg-gray-300 dark:hover:bg-gray-500'
            }`}
            onClick={() => setChartType('bar')}
          >
            Income vs Expense
          </motion.button>
        </div>
      </div>

      <div className="h-64">
        {/* Conditionally render the selected chart type, or a message if no data */}
        {chartType === 'doughnut'
          ? chartData.doughnut?.datasets?.[0]?.data?.length > 0
            ? <Doughnut data={chartData.doughnut} options={doughnutOptions} />
            : <div className="flex items-center justify-center h-full text-gray-500">No data available</div>
          : chartData.bar?.datasets?.[0]?.data?.length > 0
            ? <Bar data={chartData.bar} options={barOptions} />
            : <div className="flex items-center justify-center h-full text-gray-500">No data available</div>
        }
      </div>
    </motion.div>
  );
};

export default DashboardChart;