/**
 * SmartCategorySelector Component
 * 
 * Provides intelligent category selection with:
 * - ML-based category suggestions
 * - Confidence scoring
 * - Learning from user decisions
 * - Visual indicators for suggestions
 * - Fallback to manual selection
 */
import React, { useState, useEffect } from 'react';
import { useTheme } from '../../context/ThemeContext';
import { getSmartCategorySuggestions, learnFromCategorization } from '../../api/receipts';
import { getCategories } from '../../api/categories';
import toast from 'react-hot-toast';

const SmartCategorySelector = ({ 
  merchant, 
  transactionType = 'expense', 
  selectedCategoryId, 
  onCategoryChange,
  transactionId = null,
  disabled = false 
}) => {
  const { isDark } = useTheme();
  const [suggestions, setSuggestions] = useState([]);
  const [allCategories, setAllCategories] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [showSuggestions, setShowSuggestions] = useState(false);

  // Load categories and suggestions when merchant changes
  useEffect(() => {
    if (merchant && merchant.trim()) {
      loadSuggestions();
    }
  }, [merchant, transactionType]);

  // Load all categories
  useEffect(() => {
    loadCategories();
  }, []);

  const loadCategories = async () => {
    try {
      const response = await getCategories();
      if (response.success) {
        setAllCategories(response.data);
      }
    } catch (error) {
      console.error('Error loading categories:', error);
    }
  };

  const loadSuggestions = async () => {
    if (!merchant || merchant.trim() === '') return;

    setIsLoading(true);
    try {
      const response = await getSmartCategorySuggestions(merchant.trim(), transactionType);
      if (response.success) {
        setSuggestions(response.data.suggestions);
        setShowSuggestions(true);
      }
    } catch (error) {
      console.error('Error loading suggestions:', error);
      toast.error('Failed to load category suggestions');
    } finally {
      setIsLoading(false);
    }
  };

  const handleCategorySelect = async (categoryId) => {
    onCategoryChange(categoryId);
    
    // Learn from user's decision
    if (merchant && categoryId) {
      try {
        await learnFromCategorization(merchant.trim(), categoryId, transactionId);
      } catch (error) {
        console.error('Error learning from categorization:', error);
      }
    }
    
    setShowSuggestions(false);
  };

  const getConfidenceColor = (confidence) => {
    if (confidence >= 0.8) return 'text-green-600 dark:text-green-400';
    if (confidence >= 0.6) return 'text-yellow-600 dark:text-yellow-400';
    return 'text-gray-500 dark:text-gray-400';
  };

  const getConfidenceText = (confidence) => {
    if (confidence >= 0.8) return 'High confidence';
    if (confidence >= 0.6) return 'Medium confidence';
    return 'Low confidence';
  };

  const getReasonIcon = (reason) => {
    switch (reason) {
      case 'Pattern match':
        return '🎯';
      case 'Alternative match':
        return '🔄';
      case 'Frequently used':
        return '⭐';
      default:
        return '💡';
    }
  };

  const selectedCategory = allCategories.find(cat => cat._id === selectedCategoryId);

  return (
    <div className="space-y-3">
      {/* Current Selection */}
      {selectedCategory && (
        <div className="p-3 bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <span className="text-blue-600 dark:text-blue-400">✓</span>
              <span className="font-medium text-blue-900 dark:text-blue-100">
                {selectedCategory.name}
              </span>
            </div>
            <button
              onClick={() => onCategoryChange('')}
              disabled={disabled}
              className="text-blue-600 dark:text-blue-400 hover:text-blue-800 dark:hover:text-blue-200 disabled:opacity-50"
            >
              Change
            </button>
          </div>
        </div>
      )}

      {/* Smart Suggestions */}
      {!selectedCategory && merchant && (
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <h4 className="text-sm font-medium text-gray-700 dark:text-gray-300">
              Smart Suggestions
            </h4>
            {isLoading && (
              <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-blue-500"></div>
            )}
          </div>

          {suggestions.length > 0 && showSuggestions && (
            <div className="space-y-2">
              {suggestions.map((suggestion, index) => (
                <button
                  key={suggestion.categoryId}
                  onClick={() => handleCategorySelect(suggestion.categoryId)}
                  disabled={disabled}
                  className="w-full p-3 text-left border border-gray-200 dark:border-gray-600 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-3">
                      <span className="text-lg">
                        {getReasonIcon(suggestion.reason)}
                      </span>
                      <div>
                        <p className="font-medium text-gray-900 dark:text-white">
                          {suggestion.name}
                        </p>
                        <p className="text-xs text-gray-500 dark:text-gray-400">
                          {suggestion.reason}
                        </p>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className={`text-sm font-medium ${getConfidenceColor(suggestion.confidence)}`}>
                        {Math.round(suggestion.confidence * 100)}%
                      </p>
                      <p className="text-xs text-gray-500 dark:text-gray-400">
                        {getConfidenceText(suggestion.confidence)}
                      </p>
                    </div>
                  </div>
                </button>
              ))}
            </div>
          )}

          {/* Manual Selection */}
          <div className="pt-2">
            <button
              onClick={() => setShowSuggestions(!showSuggestions)}
              disabled={disabled}
              className="text-sm text-blue-600 dark:text-blue-400 hover:text-blue-800 dark:hover:text-blue-200 disabled:opacity-50"
            >
              {showSuggestions ? 'Hide suggestions' : 'Show all categories'}
            </button>
          </div>
        </div>
      )}

      {/* Manual Category Selection */}
      {showSuggestions && (
        <div className="space-y-3">
          <h4 className="text-sm font-medium text-gray-700 dark:text-gray-300">
            All Categories
          </h4>
          <select
            value={selectedCategoryId || ''}
            onChange={(e) => handleCategorySelect(e.target.value)}
            disabled={disabled}
            className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-white disabled:opacity-50"
          >
            <option value="">Select a category</option>
            {allCategories
              .filter(cat => cat.type === transactionType)
              .map(category => (
                <option key={category._id} value={category._id}>
                  {category.name}
                </option>
              ))}
          </select>
        </div>
      )}

      {/* No suggestions message */}
      {!isLoading && suggestions.length === 0 && merchant && (
        <div className="p-3 bg-gray-50 dark:bg-gray-800 rounded-lg">
          <p className="text-sm text-gray-500 dark:text-gray-400 text-center">
            No smart suggestions available. Please select a category manually.
          </p>
        </div>
      )}
    </div>
  );
};

export default SmartCategorySelector;
