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
  const [chartType, setChartType] = useState('doughnut');
  const [chartData, setChartData] = useState(null);

  useEffect(() => {
    if (!transactionData?.summary || !transactionData?.categories) return;

    const { summary, categories } = transactionData;

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

    setChartData({
      doughnut: expenseCategoryData,
      bar: incomeVsExpenseData,
    });
  }, [transactionData]);

  if (isLoading) {
    return (
      <div className="bg-white dark:bg-gray-800 p-4 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 animate-pulse">
        <div className="h-6 bg-gray-200 dark:bg-gray-600 rounded w-1/4 mb-4"></div>
        <div className="h-64 bg-gray-200 dark:bg-gray-600 rounded w-full"></div>
      </div>
    );
  }

  if (!chartData) {
    return (
      <div className="bg-white dark:bg-gray-800 p-4 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 flex items-center justify-center h-64">
        <p className="text-gray-500 dark:text-gray-400">No data available for charts</p>
      </div>
    );
  }

  const doughnutOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        position: 'right',
        labels: {
          color: 'rgb(255, 255, 255)', // Ensure legend labels are white in dark mode
        },
      },
      tooltip: {
        callbacks: {
          label: (context) => {
            const label = context.label || '';
            const value = context.raw || 0;
            const total = context.dataset.data.reduce((a, b) => a + b, 0);
            const percentage = total ? Math.round((value / total) * 100) : 0;
            return `${label}: ₹${value.toFixed(2)} (${percentage}%)`;
          },
        },
      },
    },
  };

  const barOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        display: false,
      },
      tooltip: {
        callbacks: {
          label: (context) => `₹${context.raw.toFixed(2)}`,
        },
      },
    },
    scales: {
      y: {
        beginAtZero: true,
        ticks: {
          callback: (value) => '₹' + value,
        },
      },
    },
  };

  return (
    <div className="bg-white dark:bg-gray-800 p-4 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700">
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-lg font-semibold text-gray-800 dark:text-white">Financial Overview</h2>
        <div className="flex space-x-2">
          <button
            className={`px-3 py-1 text-sm rounded-md ${
              chartType === 'doughnut'
                ? 'bg-teal-600 text-white'
                : 'bg-gray-200 dark:bg-gray-600 text-gray-700 dark:text-gray-300 hover:bg-gray-300 dark:hover:bg-gray-500'
            }`}
            onClick={() => setChartType('doughnut')}
          >
            Expense Breakdown
          </button>
          <button
            className={`px-3 py-1 text-sm rounded-md ${
              chartType === 'bar'
                ? 'bg-teal-600 text-white'
                : 'bg-gray-200 dark:bg-gray-600 text-gray-700 dark:text-gray-300 hover:bg-gray-300 dark:hover:bg-gray-500'
            }`}
            onClick={() => setChartType('bar')}
          >
            Income vs Expense
          </button>
        </div>
      </div>

      <div className="h-64">
        {chartType === 'doughnut' ? (
          <Doughnut data={chartData.doughnut} options={doughnutOptions} />
        ) : (
          <Bar data={chartData.bar} options={barOptions} />
        )}
      </div>
    </div>
  );
};

export default DashboardChart;