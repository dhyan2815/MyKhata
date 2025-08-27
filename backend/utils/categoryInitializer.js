import Category from '../models/categoryModel.js';

/**
 * Initialize default categories for a new user
 * @param {string} userId - The user's ID
 */
export const initializeDefaultCategories = async (userId) => {
  try {
    // Check if user already has default categories
    const existingDefaults = await Category.find({
      user: userId,
      isDefault: true
    });

    if (existingDefaults.length === 0) {
      // Create default expense categories
      const defaultExpenseCategories = [
        {
          user: userId,
          name: 'Food & Dining',
          type: 'expense',
          color: '#EF4444',
          icon: 'utensils',
          isDefault: true
        },
        {
          user: userId,
          name: 'Transportation',
          type: 'expense',
          color: '#F59E0B',
          icon: 'car',
          isDefault: true
        },
        {
          user: userId,
          name: 'Shopping',
          type: 'expense',
          color: '#8B5CF6',
          icon: 'shopping-bag',
          isDefault: true
        },
        {
          user: userId,
          name: 'Bills & Utilities',
          type: 'expense',
          color: '#06B6D4',
          icon: 'file-text',
          isDefault: true
        },
        {
          user: userId,
          name: 'Other Expenses',
          type: 'expense',
          color: '#6B7280',
          icon: 'tag',
          isDefault: true
        }
      ];

      // Create default income categories
      const defaultIncomeCategories = [
        {
          user: userId,
          name: 'Salary',
          type: 'income',
          color: '#10B981',
          icon: 'briefcase',
          isDefault: true
        },
        {
          user: userId,
          name: 'Freelance',
          type: 'income',
          color: '#059669',
          icon: 'trending-up',
          isDefault: true
        },
        {
          user: userId,
          name: 'Investment',
          type: 'income',
          color: '#7C3AED',
          icon: 'trending-up',
          isDefault: true
        },
        {
          user: userId,
          name: 'Other Income',
          type: 'income',
          color: '#6B7280',
          icon: 'tag',
          isDefault: true
        }
      ];

      // Insert all default categories
      await Category.insertMany([...defaultExpenseCategories, ...defaultIncomeCategories]);
      
      console.log(`Default categories initialized for user: ${userId}`);
    }
  } catch (error) {
    console.error('Error initializing default categories:', error);
    throw error;
  }
};

/**
 * Get or create a default category for a specific type
 * @param {string} userId - The user's ID
 * @param {string} type - The category type ('income' or 'expense')
 * @returns {Object} The default category object
 */
export const getOrCreateDefaultCategory = async (userId, type = 'expense') => {
  try {
    // First try to find an existing default category
    let defaultCategory = await Category.findOne({
      user: userId,
      type: type,
      isDefault: true
    });
    
    // If no default category exists, create one
    if (!defaultCategory) {
      const categoryName = type === 'income' ? 'Other Income' : 'Other Expenses';
      const categoryColor = type === 'income' ? '#10B981' : '#EF4444';
      
      defaultCategory = await Category.create({
        user: userId,
        name: categoryName,
        type: type,
        color: categoryColor,
        icon: 'tag',
        isDefault: true
      });
    }
    
    return defaultCategory;
  } catch (error) {
    console.error('Error getting or creating default category:', error);
    throw error;
  }
};
