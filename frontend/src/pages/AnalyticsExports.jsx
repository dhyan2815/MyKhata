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




  return (
    <>
      <Helmet>
        <title>Analytics & Exports · MyKhata</title>
        <meta name="description" content="Explore MyKhata's analytics and export features including receipt analytics and export functionality" />
      </Helmet>

      <div className={`min-h-screen ${isDark ? 'bg-gray-900 text-white' : 'bg-gray-50 text-gray-900'}`}>

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          {/* Page Header */}
          <div className="flex items-center justify-between mb-8">
            <div>
              <h1 className="text-3xl font-bold text-gray-900 dark:text-white">Analytics & Exports</h1>
              <p className="text-sm sm:text-base text-gray-600 dark:text-gray-400 mt-1">
                Unlock MyKhata's analytics and export features to streamline your financial management.
              </p>
            </div>
            
            {/* Feature Toggle */}
            <div className="flex space-x-1 bg-gray-100 dark:bg-gray-700 rounded-lg p-1">
              <button
                onClick={() => setActiveFeature('analytics')}
                className={`px-4 py-2 rounded-md text-sm font-medium transition-colors ${
                  activeFeature === 'analytics'
                    ? 'bg-white dark:bg-gray-600 text-gray-900 dark:text-white shadow-sm'
                    : 'text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white'
                }`}
              >
                Analytics
              </button>
              <button
                onClick={() => setActiveFeature('export')}
                className={`px-4 py-2 rounded-md text-sm font-medium transition-colors ${
                  activeFeature === 'export'
                    ? 'bg-white dark:bg-gray-600 text-gray-900 dark:text-white shadow-sm'
                    : 'text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white'
                }`}
              >
                Export
              </button>
            </div>
          </div>
        </div>

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-1">
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
