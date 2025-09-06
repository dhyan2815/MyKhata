/**
 * Smart Categorizer Service
 * 
 * Provides ML-based merchant recognition and auto-categorization:
 * - Merchant name pattern matching
 * - Category prediction based on merchant keywords
 * - Learning from user's historical data
 * - Confidence scoring for predictions
 * - Fallback to default categories
 */
import Category from '../models/categoryModel.js';
import Transaction from '../models/transactionModel.js';
import Receipt from '../models/receiptModel.js';

class SmartCategorizer {
  constructor() {
    this.merchantPatterns = new Map();
    this.categoryKeywords = new Map();
    this.userPreferences = new Map();
    this.confidenceThreshold = 0.7;
  }

  // Initialize categorizer with predefined patterns
  async initialize() {
    await this.loadMerchantPatterns();
    await this.loadCategoryKeywords();
  }

  // Load predefined merchant patterns for common businesses
  async loadMerchantPatterns() {
    const patterns = {
      // Food & Dining
      'restaurant': [
        'restaurant', 'cafe', 'coffee', 'diner', 'bistro', 'grill', 'kitchen',
        'pizza', 'burger', 'sandwich', 'deli', 'bakery', 'food', 'eat'
      ],
      'fast_food': [
        'mcdonalds', 'burger king', 'kfc', 'subway', 'taco bell', 'pizza hut',
        'dominos', 'wendys', 'chick-fil-a', 'starbucks', 'dunkin'
      ],
      'grocery': [
        'grocery', 'supermarket', 'walmart', 'target', 'kroger', 'safeway',
        'whole foods', 'trader joe', 'costco', 'sam\'s club', 'food lion'
      ],

      // Transportation
      'gas_station': [
        'gas', 'fuel', 'shell', 'exxon', 'mobil', 'chevron', 'bp', 'arco',
        'speedway', '7-eleven', 'circle k', 'valero', 'phillips 66'
      ],
      'transportation': [
        'uber', 'lyft', 'taxi', 'bus', 'train', 'metro', 'transit',
        'airline', 'airport', 'parking', 'toll', 'dmv'
      ],

      // Shopping
      'retail': [
        'store', 'shop', 'mall', 'outlet', 'department', 'clothing',
        'fashion', 'apparel', 'shoes', 'jewelry', 'electronics'
      ],
      'online_shopping': [
        'amazon', 'ebay', 'etsy', 'shopify', 'paypal', 'stripe',
        'online', 'web', 'internet', 'digital'
      ],

      // Healthcare
      'healthcare': [
        'hospital', 'clinic', 'doctor', 'medical', 'pharmacy', 'cvs',
        'walgreens', 'rite aid', 'health', 'dental', 'vision', 'urgent care'
      ],

      // Entertainment
      'entertainment': [
        'movie', 'cinema', 'theater', 'concert', 'show', 'game', 'arcade',
        'bowling', 'golf', 'fitness', 'gym', 'sport', 'recreation'
      ],

      // Utilities
      'utilities': [
        'electric', 'gas', 'water', 'internet', 'phone', 'cable', 'utility',
        'power', 'energy', 'telecom', 'broadband'
      ],

      // Financial
      'financial': [
        'bank', 'credit', 'loan', 'mortgage', 'insurance', 'investment',
        'atm', 'withdrawal', 'deposit', 'transfer', 'payment'
      ],

      // Education
      'education': [
        'school', 'university', 'college', 'education', 'tuition', 'book',
        'library', 'course', 'training', 'academy'
      ],

      // Home & Garden
      'home_garden': [
        'home depot', 'lowes', 'hardware', 'garden', 'nursery', 'furniture',
        'appliance', 'repair', 'maintenance', 'construction'
      ]
    };

    for (const [category, keywords] of Object.entries(patterns)) {
      this.merchantPatterns.set(category, keywords);
    }
  }

  // Load category keywords from database
  async loadCategoryKeywords() {
    try {
      const categories = await Category.find({});
      for (const category of categories) {
        const keywords = this.extractKeywordsFromCategory(category);
        this.categoryKeywords.set(category._id.toString(), keywords);
      }
    } catch (error) {
      console.error('Error loading category keywords:', error);
    }
  }

  // Extract keywords from category name and description
  extractKeywordsFromCategory(category) {
    const keywords = [];
    
    // Add category name words
    if (category.name) {
      keywords.push(...category.name.toLowerCase().split(/\s+/));
    }
    
    // Add description words if available
    if (category.description) {
      keywords.push(...category.description.toLowerCase().split(/\s+/));
    }
    
    return [...new Set(keywords)]; // Remove duplicates
  }

  // Predict category for a merchant
  async predictCategory(merchant, userId, transactionType = 'expense') {
    try {
      const merchantLower = merchant.toLowerCase().trim();
      
      // Get user's historical preferences
      const userPreferences = await this.getUserPreferences(userId);
      
      // Calculate confidence scores for each category
      const scores = new Map();
      
      // Check predefined patterns
      for (const [category, keywords] of this.merchantPatterns) {
        const score = this.calculatePatternScore(merchantLower, keywords);
        if (score > 0) {
          scores.set(category, score);
        }
      }
      
      // Check user's historical data
      const historicalScore = await this.calculateHistoricalScore(merchantLower, userId);
      if (historicalScore.categoryId && historicalScore.confidence > 0) {
        scores.set(historicalScore.categoryId, historicalScore.confidence);
      }
      
      // Check database categories
      const dbCategories = await Category.find({ user: userId });
      for (const category of dbCategories) {
        const keywords = this.categoryKeywords.get(category._id.toString()) || [];
        const score = this.calculatePatternScore(merchantLower, keywords);
        if (score > 0) {
          scores.set(category._id.toString(), score);
        }
      }
      
      // Find best match
      let bestCategory = null;
      let bestScore = 0;
      
      for (const [categoryId, score] of scores) {
        if (score > bestScore) {
          bestScore = score;
          bestCategory = categoryId;
        }
      }
      
      // Return prediction with confidence
      return {
        categoryId: bestCategory,
        confidence: bestScore,
        isConfident: bestScore >= this.confidenceThreshold,
        alternatives: Array.from(scores.entries())
          .sort((a, b) => b[1] - a[1])
          .slice(0, 3)
          .map(([id, score]) => ({ categoryId: id, confidence: score }))
      };
      
    } catch (error) {
      console.error('Error predicting category:', error);
      return {
        categoryId: null,
        confidence: 0,
        isConfident: false,
        alternatives: []
      };
    }
  }

  // Calculate pattern matching score
  calculatePatternScore(merchant, keywords) {
    let score = 0;
    let matches = 0;
    
    for (const keyword of keywords) {
      if (merchant.includes(keyword)) {
        matches++;
        // Give higher score for exact matches
        if (merchant === keyword) {
          score += 1.0;
        } else if (merchant.startsWith(keyword) || merchant.endsWith(keyword)) {
          score += 0.8;
        } else {
          score += 0.6;
        }
      }
    }
    
    // Normalize score based on number of keywords
    return matches > 0 ? score / keywords.length : 0;
  }

  // Calculate score based on user's historical data
  async calculateHistoricalScore(merchant, userId) {
    try {
      // Find similar merchants in user's transaction history
      const similarTransactions = await Transaction.find({
        user: userId,
        merchant: { $regex: new RegExp(merchant.split(' ')[0], 'i') }
      }).limit(10);
      
      if (similarTransactions.length === 0) {
        return { categoryId: null, confidence: 0 };
      }
      
      // Count category occurrences
      const categoryCounts = new Map();
      for (const transaction of similarTransactions) {
        const categoryId = transaction.category.toString();
        categoryCounts.set(categoryId, (categoryCounts.get(categoryId) || 0) + 1);
      }
      
      // Find most common category
      let bestCategory = null;
      let maxCount = 0;
      
      for (const [categoryId, count] of categoryCounts) {
        if (count > maxCount) {
          maxCount = count;
          bestCategory = categoryId;
        }
      }
      
      // Calculate confidence based on frequency
      const confidence = Math.min(maxCount / similarTransactions.length, 1.0);
      
      return {
        categoryId: bestCategory,
        confidence: confidence
      };
      
    } catch (error) {
      console.error('Error calculating historical score:', error);
      return { categoryId: null, confidence: 0 };
    }
  }

  // Get user's category preferences
  async getUserPreferences(userId) {
    try {
      if (this.userPreferences.has(userId)) {
        return this.userPreferences.get(userId);
      }
      
      // Analyze user's transaction history
      const transactions = await Transaction.find({ user: userId })
        .populate('category')
        .limit(100);
      
      const preferences = {
        frequentCategories: new Map(),
        merchantCategories: new Map()
      };
      
      for (const transaction of transactions) {
        const categoryId = transaction.category._id.toString();
        const categoryName = transaction.category.name;
        
        // Track frequent categories
        preferences.frequentCategories.set(
          categoryId, 
          (preferences.frequentCategories.get(categoryId) || 0) + 1
        );
        
        // Track merchant-category mappings
        if (transaction.merchant) {
          const merchant = transaction.merchant.toLowerCase();
          if (!preferences.merchantCategories.has(merchant)) {
            preferences.merchantCategories.set(merchant, new Map());
          }
          const merchantCategories = preferences.merchantCategories.get(merchant);
          merchantCategories.set(
            categoryId,
            (merchantCategories.get(categoryId) || 0) + 1
          );
        }
      }
      
      this.userPreferences.set(userId, preferences);
      return preferences;
      
    } catch (error) {
      console.error('Error getting user preferences:', error);
      return { frequentCategories: new Map(), merchantCategories: new Map() };
    }
  }

  // Learn from user's categorization decisions
  async learnFromUserDecision(merchant, categoryId, userId) {
    try {
      // Update user preferences
      const preferences = await this.getUserPreferences(userId);
      
      if (!preferences.merchantCategories.has(merchant.toLowerCase())) {
        preferences.merchantCategories.set(merchant.toLowerCase(), new Map());
      }
      
      const merchantCategories = preferences.merchantCategories.get(merchant.toLowerCase());
      merchantCategories.set(
        categoryId,
        (merchantCategories.get(categoryId) || 0) + 1
      );
      
      // Update frequent categories
      preferences.frequentCategories.set(
        categoryId,
        (preferences.frequentCategories.get(categoryId) || 0) + 1
      );
      
      this.userPreferences.set(userId, preferences);
      
    } catch (error) {
      console.error('Error learning from user decision:', error);
    }
  }

  // Get category suggestions for a merchant
  async getCategorySuggestions(merchant, userId, limit = 5) {
    try {
      const prediction = await this.predictCategory(merchant, userId);
      
      const suggestions = [];
      
      // Add predicted category if confident
      if (prediction.isConfident && prediction.categoryId) {
        const category = await Category.findById(prediction.categoryId);
        if (category) {
          suggestions.push({
            categoryId: category._id,
            name: category.name,
            confidence: prediction.confidence,
            reason: 'Pattern match'
          });
        }
      }
      
      // Add alternatives
      for (const alt of prediction.alternatives) {
        if (alt.categoryId !== prediction.categoryId) {
          const category = await Category.findById(alt.categoryId);
          if (category) {
            suggestions.push({
              categoryId: category._id,
              name: category.name,
              confidence: alt.confidence,
              reason: 'Alternative match'
            });
          }
        }
      }
      
      // Add user's frequent categories if no good matches
      if (suggestions.length < limit) {
        const preferences = await this.getUserPreferences(userId);
        const frequentCategories = Array.from(preferences.frequentCategories.entries())
          .sort((a, b) => b[1] - a[1])
          .slice(0, limit - suggestions.length);
        
        for (const [categoryId, count] of frequentCategories) {
          const category = await Category.findById(categoryId);
          if (category && !suggestions.find(s => s.categoryId === categoryId)) {
            suggestions.push({
              categoryId: category._id,
              name: category.name,
              confidence: count / 10, // Normalize count to confidence
              reason: 'Frequently used'
            });
          }
        }
      }
      
      return suggestions.slice(0, limit);
      
    } catch (error) {
      console.error('Error getting category suggestions:', error);
      return [];
    }
  }

  // Clear user preferences cache
  clearUserCache(userId) {
    this.userPreferences.delete(userId);
  }

  // Clear all caches
  clearAllCaches() {
    this.userPreferences.clear();
  }
}

export default SmartCategorizer;
