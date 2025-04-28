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
  const [chartType, setChartType] = useState('bar');
  const [chartData, setChartData] = useState(null);

  useEffect(() => {
    if (transactionData && transactionData.categories) {
      // Prepare data for Bar Chart (Income vs Expense)
      const incomeVsExpenseData = {
        labels: ['Income', 'Expense'],
        datasets: [
          {
            data: [
              transactionData.summary.income || 0,
              transactionData.summary.expense || 0,
            ],
            backgroundColor: ['#10B981', '#EF4444'],
            borderColor: ['#10B981', '#EF4444'],
            borderWidth: 1,
          },
        ],
      };

      // Prepare data for Doughnut Chart (Expense Categories)
      const expenseCategories = transactionData.categories.expense || [];
      const expenseCategoryData = {
        labels: expenseCategories.map((cat) => cat.name),
        datasets: [
          {
            data: expenseCategories.map((cat) => cat.total),
            backgroundColor: expenseCategories.map((cat) => cat.color),
            borderColor: expenseCategories.map((cat) => cat.color),
            borderWidth: 1,
          },
        ],
      };

      setChartData({
        bar: incomeVsExpenseData,
        doughnut: expenseCategoryData,
      });
    }
  }, [transactionData]);

  if (isLoading) {
    return (
      <div className="bg-white p-4 rounded-lg shadow-sm border border-gray-200 animate-pulse">
        <div className="h-6 bg-gray-200 rounded w-1/4 mb-4"></div>
        <div className="h-64 bg-gray-200 rounded w-full"></div>
      </div>
    );
  }

  if (!chartData) {
    return (
      <div className="bg-white p-4 rounded-lg shadow-sm border border-gray-200 flex items-center justify-center h-64">
        <p className="text-gray-500">No data available for charts</p>
      </div>
    );
  }

  return (
    <div className="bg-white p-4 rounded-lg shadow-sm border border-gray-200">
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-lg font-semibold text-gray-800">Financial Overview</h2>
        <div className="flex space-x-2">
          <button
            className={`px-3 py-1 text-sm rounded-md ${
              chartType === 'bar'
                ? 'bg-teal-600 text-white'
                : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
            }`}
            onClick={() => setChartType('bar')}
          >
            Income vs Expense
          </button>
          <button
            className={`px-3 py-1 text-sm rounded-md ${
              chartType === 'doughnut'
                ? 'bg-teal-600 text-white'
                : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
            }`}
            onClick={() => setChartType('doughnut')}
          >
            Expense Breakdown
          </button>
        </div>
      </div>
      
      <div className="h-64">
        {chartType === 'bar' ? (
          <Bar
            data={chartData.bar}
            options={{
              responsive: true,
              maintainAspectRatio: false,
              plugins: {
                legend: {
                  display: false,
                },
                tooltip: {
                  callbacks: {
                    label: function(context) {
                      return `$${context.raw.toFixed(2)}`;
                    }
                  }
                }
              },
              scales: {
                y: {
                  beginAtZero: true,
                  ticks: {
                    callback: function(value) {
                      return '$' + value;
                    }
                  }
                }
              }
            }}
          />
        ) : (
          <Doughnut
            data={chartData.doughnut}
            options={{
              responsive: true,
              maintainAspectRatio: false,
              plugins: {
                legend: {
                  position: 'right',
                },
                tooltip: {
                  callbacks: {
                    label: function(context) {
                      const label = context.label || '';
                      const value = context.raw || 0;
                      const total = context.dataset.data.reduce((a, b) => a + b, 0);
                      const percentage = Math.round((value / total) * 100);
                      return `${label}: $${value.toFixed(2)} (${percentage}%)`;
                    }
                  }
                }
              },
            }}
          />
        )}
      </div>
    </div>
  );
};

export default DashboardChart;