/**
 * AnalyticsExports Page
 * 
 * Comprehensive page showcasing analytics and export features:
 * - Receipt analytics dashboard
 * - Export functionality
 * - Feature overview and usage statistics
 */
import React, { useState } from 'react';
import { Helmet } from 'react-helmet-async';
import { useTheme } from '../context/ThemeContext';
import ReceiptAnalytics from '../components/analytics/ReceiptAnalytics';
import ExportManager from '../components/export/ExportManager';

const AnalyticsExports = () => {
  const { isDark } = useTheme();
  const [activeFeature, setActiveFeature] = useState('analytics');



  // Navigation component
  const Navigation = () => (
    <div className="flex space-x-1 border-b border-gray-200 dark:border-gray-700 rounded-lg p-1 mb-6 pb-5">
      <button
        onClick={() => setActiveFeature('analytics')}
        className={`px-4 py-2 rounded-md text-sm font-medium transition-colors ${activeFeature === 'analytics'
          ? 'bg-white dark:bg-gray-600 text-gray-900 dark:text-white shadow-sm'
          : 'text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white'
          }`}
      >
        Analytics
      </button>
      <button
        onClick={() => setActiveFeature('export')}
        className={`px-4 py-2 rounded-md text-sm font-medium transition-colors ${activeFeature === 'export'
          ? 'bg-white dark:bg-gray-600 text-gray-900 dark:text-white shadow-sm'
          : 'text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white'
          }`}
      >
        Export
      </button>
    </div>
  );

  return (
    <>
      <Helmet>
        <title>Analytics & Exports · MyKhata</title>
        <meta name="description" content="Explore MyKhata's analytics and export features including receipt analytics and export functionality" />
      </Helmet>

      <div className={`min-h-screen ${isDark ? 'bg-gray-900 text-white' : 'bg-gray-50 text-gray-900'}`}>

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">
            Analytics & Exports
          </h1>
          <p className="text-md text-gray-600 dark:text-gray-400 mx-auto">
            Unlock MyKhata's analytics and export features to streamline your financial management.
          </p>
        </div>

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <Navigation />

          {activeFeature === 'analytics' && <ReceiptAnalytics />}
          {activeFeature === 'export' && (
            <ExportManager
              onClose={() => setActiveFeature('analytics')}
            />
          )}
        </div>
      </div>
    </>
  );
};

export default AnalyticsExports;
