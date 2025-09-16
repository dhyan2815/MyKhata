/**
 * ReceiptAnalytics Component
 * 
 * Comprehensive analytics dashboard for receipts:
 * - Overview statistics and KPIs
 * - Spending patterns by category
 * - Merchant insights and analysis
 * - Time-based trends and charts
 * - Interactive charts and visualizations
 */
import React, { useState, useEffect } from 'react';
import { useTheme } from '../../context/ThemeContext';
import { 
  getSpendingPatterns,
  getMerchantInsights,
  getTimeBasedAnalytics
} from '../../api/analytics';
import { Line, Bar, Doughnut } from 'react-chartjs-2';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  Title,
  Tooltip,
  Legend,
  ArcElement
} from 'chart.js';

// Register Chart.js components
ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  Title,
  Tooltip,
  Legend,
  ArcElement
);

const ReceiptAnalytics = () => {
  const { isDark } = useTheme();
  const [activeTab, setActiveTab] = useState('merchants');
  const [period, setPeriod] = useState('30d');
  const [loading, setLoading] = useState(false);
  const [data, setData] = useState({
    spendingPatterns: null,
    merchantInsights: null,
    timeBased: null
  });

  // Load analytics data
  useEffect(() => {
    loadAnalyticsData();
  }, [period]);

  const loadAnalyticsData = async () => {
    setLoading(true);
    try {
      const [spendingPatterns, merchantInsights, timeBased] = await Promise.all([
        getSpendingPatterns(period),
        getMerchantInsights(period),
        getTimeBasedAnalytics(period, 'daily')
      ]);

      setData({
        spendingPatterns: spendingPatterns.success ? spendingPatterns.data : null,
        merchantInsights: merchantInsights.success ? merchantInsights.data : null,
        timeBased: timeBased.success ? timeBased.data : null
      });
    } catch (error) {
      console.error('Error loading analytics data:', error);
    } finally {
      setLoading(false);
    }
  };

  // Chart options
  const chartOptions = {
    responsive: true,
    plugins: {
      legend: {
        labels: {
          color: isDark ? '#e5e7eb' : '#374151'
        }
      }
    },
    scales: {
      x: {
        ticks: {
          color: isDark ? '#9ca3af' : '#6b7280'
        },
        grid: {
          color: isDark ? '#374151' : '#e5e7eb'
        }
      },
      y: {
        ticks: {
          color: isDark ? '#9ca3af' : '#6b7280'
        },
        grid: {
          color: isDark ? '#374151' : '#e5e7eb'
        }
      }
    }
  };

  // Period selector
  const PeriodSelector = () => (
    <div className="flex space-x-2 mb-6">
      {['7d', '30d', '90d', '1y'].map(p => (
        <button
          key={p}
          onClick={() => setPeriod(p)}
          className={`px-3 py-1 rounded-md text-sm font-medium transition-colors ${
            period === p
              ? 'bg-blue-600 text-white'
              : 'bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-300 dark:hover:bg-gray-600'
          }`}
        >
          {p === '7d' ? '7 D' : p === '30d' ? '30 D' : p === '90d' ? '90 D' : '1 Y'}
        </button>
      ))}
    </div>
  );


  // Spending patterns tab
  const SpendingPatternsTab = () => {
    if (!data.spendingPatterns) return <div>Loading...</div>;

    const { patterns, totalSpending } = data.spendingPatterns;

    const chartData = {
      labels: patterns.map(p => p.categoryName),
      datasets: [
        {
          label: 'Amount Spent',
          data: patterns.map(p => p.totalAmount),
          backgroundColor: [
            '#3B82F6', '#EF4444', '#10B981', '#F59E0B', '#8B5CF6',
            '#EC4899', '#06B6D4', '#84CC16', '#F97316', '#6366F1'
          ],
          borderWidth: 0
        }
      ]
    };

    return (
      <div className="space-y-6">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Doughnut Chart */}
          <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">Spending by Category</h3>
            <div className="h-64">
              <Doughnut data={chartData} options={chartOptions} />
            </div>
          </div>

          {/* Category List */}
          <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">Category Breakdown</h3>
            <div className="space-y-3">
              {patterns.map((pattern, index) => (
                <div key={index} className="flex items-center justify-between">
                  <div className="flex items-center space-x-3">
                    <div 
                      className="w-4 h-4 rounded-full"
                      style={{ backgroundColor: chartData.datasets[0].backgroundColor[index] }}
                    />
                    <span className="font-medium text-gray-900 dark:text-white">{pattern.categoryName}</span>
                  </div>
                  <div className="text-right">
                    <p className="font-semibold text-gray-900 dark:text-white">${pattern.totalAmount}</p>
                    <p className="text-sm text-gray-600 dark:text-gray-400">{pattern.percentage}%</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Summary */}
        <div className="bg-blue-50 dark:bg-blue-900/20 p-6 rounded-lg">
          <h3 className="text-lg font-semibold text-blue-900 dark:text-blue-100 mb-2">Total Spending</h3>
          <p className="text-3xl font-bold text-blue-900 dark:text-blue-100">${totalSpending}</p>
          <p className="text-sm text-blue-700 dark:text-blue-300">Across {patterns.length} categories</p>
        </div>
      </div>
    );
  };

  // Merchant insights tab
  const MerchantInsightsTab = () => {
    if (!data.merchantInsights) return <div>Loading...</div>;

    const { topByAmount, topByFrequency, summary } = data.merchantInsights;

    return (
      <div className="space-y-6">
        {/* Summary Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">Total Merchants</h3>
            <p className="text-3xl font-bold text-blue-600 dark:text-blue-400">{summary.totalMerchants}</p>
          </div>
          <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">Total Amount</h3>
            <p className="text-3xl font-bold text-green-600 dark:text-green-400">${summary.totalAmount}</p>
          </div>
          <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">Avg per Merchant</h3>
            <p className="text-3xl font-bold text-purple-600 dark:text-purple-400">${summary.averagePerMerchant}</p>
          </div>
        </div>

        {/* Top Merchants by Amount */}
        <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">Top Merchants by Amount</h3>
          <div className="space-y-3">
            {topByAmount.map((merchant, index) => (
              <div key={index} className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-700 rounded-lg">
                <div className="flex items-center space-x-3">
                  <div className="w-8 h-8 bg-blue-100 dark:bg-blue-900 rounded-full flex items-center justify-center">
                    <span className="text-sm font-medium text-blue-600 dark:text-blue-400">{index + 1}</span>
                  </div>
                  <div>
                    <p className="font-medium text-gray-900 dark:text-white capitalize">{merchant.merchant}</p>
                    <p className="text-sm text-gray-600 dark:text-gray-400">{merchant.receiptCount} receipts</p>
                  </div>
                </div>
                <div className="text-right">
                  <p className="font-semibold text-gray-900 dark:text-white">${merchant.totalAmount}</p>
                  <p className="text-sm text-gray-600 dark:text-gray-400">Avg: ${merchant.averageAmount}</p>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Top Merchants by Frequency */}
        <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">Most Frequent Merchants</h3>
          <div className="space-y-3">
            {topByFrequency.map((merchant, index) => (
              <div key={index} className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-700 rounded-lg">
                <div className="flex items-center space-x-3">
                  <div className="w-8 h-8 bg-green-100 dark:bg-green-900 rounded-full flex items-center justify-center">
                    <span className="text-sm font-medium text-green-600 dark:text-green-400">{index + 1}</span>
                  </div>
                  <div>
                    <p className="font-medium text-gray-900 dark:text-white capitalize">{merchant.merchant}</p>
                    <p className="text-sm text-gray-600 dark:text-gray-400">{merchant.receiptCount} receipts</p>
                  </div>
                </div>
                <div className="text-right">
                  <p className="font-semibold text-gray-900 dark:text-white">{merchant.frequency.toFixed(2)}/day</p>
                  <p className="text-sm text-gray-600 dark:text-gray-400">Frequency</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    );
  };

  // Time-based analytics tab
  const TimeBasedTab = () => {
    if (!data.timeBased) return <div>Loading...</div>;

    const { analytics, summary } = data.timeBased;

    const chartData = {
      labels: analytics.map(a => a.period),
      datasets: [
        {
          label: 'Receipts',
          data: analytics.map(a => a.receiptCount),
          borderColor: '#3B82F6',
          backgroundColor: 'rgba(59, 130, 246, 0.1)',
          tension: 0.1
        },
        {
          label: 'Processed',
          data: analytics.map(a => a.processedCount),
          borderColor: '#10B981',
          backgroundColor: 'rgba(16, 185, 129, 0.1)',
          tension: 0.1
        },
        {
          label: 'Amount',
          data: analytics.map(a => a.totalAmount),
          borderColor: '#F59E0B',
          backgroundColor: 'rgba(245, 158, 11, 0.1)',
          tension: 0.1,
          yAxisID: 'y1'
        }
      ]
    };

    const chartOptionsWithY1 = {
      ...chartOptions,
      scales: {
        ...chartOptions.scales,
        y1: {
          type: 'linear',
          display: true,
          position: 'right',
          ticks: {
            color: isDark ? '#9ca3af' : '#6b7280'
          },
          grid: {
            drawOnChartArea: false,
            color: isDark ? '#374151' : '#e5e7eb'
          }
        }
      }
    };

    return (
      <div className="space-y-6">
        {/* Summary Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
          <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">Total Receipts</h3>
            <p className="text-3xl font-bold text-blue-600 dark:text-blue-400">{summary.totalReceipts}</p>
          </div>
          <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">Processed</h3>
            <p className="text-3xl font-bold text-green-600 dark:text-green-400">{summary.totalProcessed}</p>
          </div>
          <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">Total Amount</h3>
            <p className="text-3xl font-bold text-yellow-600 dark:text-yellow-400">${summary.totalAmount}</p>
          </div>
        </div>

        {/* Time Series Chart */}
        <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">Receipt Processing Over Time</h3>
          <div className="h-64">
            <Line data={chartData} options={chartOptionsWithY1} />
          </div>
        </div>
      </div>
    );
  };


  // Tab navigation
  const TabNavigation = () => (
    <div className="flex space-x-1 bg-gray-100 dark:bg-gray-700 rounded-lg p-1 mb-6">
      {[
        { id: 'merchants', label: 'Merchant Insights' },
        { id: 'spending', label: 'Spending Patterns' },
        { id: 'time', label: 'Time Trends' }
      ].map(tab => (
        <button
          key={tab.id}
          onClick={() => setActiveTab(tab.id)}
          className={`px-4 py-2 rounded-md text-sm font-medium transition-colors ${
            activeTab === tab.id
              ? 'bg-white dark:bg-gray-600 text-gray-900 dark:text-white shadow-sm'
              : 'text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white'
          }`}
        >
          {tab.label}
        </button>
      ))}
    </div>
  );

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold text-gray-900 dark:text-white">Receipt Analytics</h2>
        <PeriodSelector />
      </div>

      <TabNavigation />

      {activeTab === 'merchants' && <MerchantInsightsTab />}
      {activeTab === 'spending' && <SpendingPatternsTab />}
      {activeTab === 'time' && <TimeBasedTab />}
    </div>
  );
};

export default ReceiptAnalytics;
