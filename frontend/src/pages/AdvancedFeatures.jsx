/**
 * AdvancedFeatures Page
 * 
 * Comprehensive page showcasing all advanced features:
 * - Batch processing interface
 * - Smart categorization tools
 * - Receipt analytics dashboard
 * - Export functionality
 * - Feature overview and usage statistics
 */
import React, { useState } from 'react';
import { Helmet } from 'react-helmet-async';
import { useTheme } from '../context/ThemeContext';
import BatchProcessor from '../components/receipts/BatchProcessor';
import ReceiptAnalytics from '../components/analytics/ReceiptAnalytics';
import ExportManager from '../components/export/ExportManager';

const AdvancedFeatures = () => {
  const { isDark } = useTheme();
  const [activeFeature, setActiveFeature] = useState('overview');

  // Feature cards data
  const features = [
    {
      id: 'batch',
      title: 'Batch Processing',
      description: 'Process multiple receipts simultaneously with intelligent OCR and automated categorization',
      icon: '📦',
      color: 'blue',
      status: 'completed'
    },
    {
      id: 'smart',
      title: 'Smart Categorization',
      description: 'ML-powered merchant recognition and automatic category suggestions based on your spending patterns',
      icon: '🧠',
      color: 'green',
      status: 'completed'
    },
    {
      id: 'analytics',
      title: 'Receipt Analytics',
      description: 'Comprehensive analytics with spending patterns, merchant insights, and time-based trends',
      icon: '📊',
      color: 'purple',
      status: 'completed'
    },
    {
      id: 'export',
      title: 'Export & Reports',
      description: 'Generate PDF reports, export data in multiple formats, and create custom analytics reports',
      icon: '📄',
      color: 'yellow',
      status: 'completed'
    }
  ];

  // Feature overview component
  const FeatureOverview = () => (
    <div className="space-y-8">

      {/* Feature Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {features.map(feature => (
          <div
            key={feature.id}
            onClick={() => setActiveFeature(feature.id)}
            className={`p-6 rounded-lg border-2 cursor-pointer transition-all hover:shadow-lg ${feature.color === 'blue' ? 'border-blue-200 hover:border-blue-300 bg-blue-50 dark:bg-blue-900/20' :
              feature.color === 'green' ? 'border-green-200 hover:border-green-300 bg-green-50 dark:bg-green-900/20' :
                feature.color === 'purple' ? 'border-purple-200 hover:border-purple-300 bg-purple-50 dark:bg-purple-900/20' :
                  'border-yellow-200 hover:border-yellow-300 bg-yellow-50 dark:bg-yellow-900/20'
              }`}
          >
            <div className="flex items-start space-x-4">
              <div className="text-4xl">{feature.icon}</div>
              <div className="flex-1">
                <div className="flex items-center space-x-2 mb-2">
                  <h3 className="text-xl font-semibold text-gray-900 dark:text-white">
                    {feature.title}
                  </h3>
                  <span className={`px-2 py-1 rounded-full text-xs font-medium ${feature.status === 'completed'
                    ? 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200'
                    : 'bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-200'
                    }`}>
                    {feature.status}
                  </span>
                </div>
                <p className="text-gray-600 dark:text-gray-400 mb-4">
                  {feature.description}
                </p>
                <button className={`px-4 py-2 rounded-md text-sm font-medium transition-colors ${feature.color === 'blue' ? 'bg-blue-600 text-white hover:bg-blue-700' :
                  feature.color === 'green' ? 'bg-green-600 text-white hover:bg-green-700' :
                    feature.color === 'purple' ? 'bg-purple-600 text-white hover:bg-purple-700' :
                      'bg-yellow-600 text-white hover:bg-yellow-700'
                  }`}>
                  Explore Feature
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Quick Stats */}
      <div className="bg-white dark:bg-gray-800 rounded-lg p-6 shadow">
        <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
          Feature Overview
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div className="text-center">
            <div className="text-2xl font-bold text-blue-600 dark:text-blue-400">4</div>
            <div className="text-sm text-gray-600 dark:text-gray-400">Advanced Features</div>
          </div>
          <div className="text-center">
            <div className="text-2xl font-bold text-green-600 dark:text-green-400">100%</div>
            <div className="text-sm text-gray-600 dark:text-gray-400">Completion Rate</div>
          </div>
          <div className="text-center">
            <div className="text-2xl font-bold text-purple-600 dark:text-purple-400">10+</div>
            <div className="text-sm text-gray-600 dark:text-gray-400">Export Formats</div>
          </div>
          <div className="text-center">
            <div className="text-2xl font-bold text-yellow-600 dark:text-yellow-400">∞</div>
            <div className="text-sm text-gray-600 dark:text-gray-400">Possibilities</div>
          </div>
        </div>
      </div>

      {/* Getting Started */}
      <div className="bg-gradient-to-r from-blue-50 to-purple-50 dark:from-blue-900/20 dark:to-purple-900/20 rounded-lg p-6">
        <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
          Getting Started
        </h3>
        <p className="text-gray-600 dark:text-gray-400 mb-4">
          Ready to explore these powerful features? Here's how to get started:
        </p>
        <div className="space-y-2">
          <div className="flex items-center space-x-2">
            <span className="w-6 h-6 bg-blue-600 text-white rounded-full flex items-center justify-center text-sm font-medium">1</span>
            <span className="text-gray-700 dark:text-gray-300">Try batch processing with multiple receipts</span>
          </div>
          <div className="flex items-center space-x-2">
            <span className="w-6 h-6 bg-green-600 text-white rounded-full flex items-center justify-center text-sm font-medium">2</span>
            <span className="text-gray-700 dark:text-gray-300">Let smart categorization learn your preferences</span>
          </div>
          <div className="flex items-center space-x-2">
            <span className="w-6 h-6 bg-purple-600 text-white rounded-full flex items-center justify-center text-sm font-medium">3</span>
            <span className="text-gray-700 dark:text-gray-300">Explore analytics to understand your spending</span>
          </div>
          <div className="flex items-center space-x-2">
            <span className="w-6 h-6 bg-yellow-600 text-white rounded-full flex items-center justify-center text-sm font-medium">4</span>
            <span className="text-gray-700 dark:text-gray-300">Export your data for external analysis</span>
          </div>
        </div>
      </div>
    </div>
  );

  // Navigation component
  const Navigation = () => (
    <div className="flex space-x-1 border-b border-gray-200 dark:border-gray-700 rounded-lg p-1 mb-6 pb-5">
      <button
        onClick={() => setActiveFeature('overview')}
        className={`px-4 py-2 rounded-md text-sm font-medium transition-colors ${activeFeature === 'overview'
          ? 'bg-white dark:bg-gray-600 text-gray-900 dark:text-white shadow-sm'
          : 'text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white'
          }`}
      >
        Overview
      </button>
      <button
        onClick={() => setActiveFeature('batch')}
        className={`px-4 py-2 rounded-md text-sm font-medium transition-colors ${activeFeature === 'batch'
          ? 'bg-white dark:bg-gray-600 text-gray-900 dark:text-white shadow-sm'
          : 'text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white'
          }`}
      >
        Batch Processing
      </button>
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
        <title>Advanced Features · MyKhata</title>
        <meta name="description" content="Explore MyKhata's advanced features including batch processing, smart categorization, analytics, and export functionality" />
      </Helmet>

      <div className={`min-h-screen ${isDark ? 'bg-gray-900 text-white' : 'bg-gray-50 text-gray-900'}`}>

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <h1 className="text-4xl font-bold text-gray-900 dark:text-white mb-4">
            Advanced Features
          </h1>
          <p className="text-lg text-gray-600 dark:text-gray-400 mx-auto">
            Unlock MyKhata’s advanced features to streamline your financial management.
          </p>
        </div>

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <Navigation />

          {activeFeature === 'overview' && <FeatureOverview />}
          {activeFeature === 'batch' && (
            <BatchProcessor
              onComplete={() => {
                console.log('Batch processing completed');
                setActiveFeature('overview');
              }}
              onCancel={() => setActiveFeature('overview')}
            />
          )}
          {activeFeature === 'analytics' && <ReceiptAnalytics />}
          {activeFeature === 'export' && (
            <ExportManager
              onClose={() => setActiveFeature('overview')}
            />
          )}
        </div>
      </div>
    </>
  );
};

export default AdvancedFeatures;
