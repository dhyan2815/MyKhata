/**
 * Analytics Controller
 * 
 * Provides comprehensive analytics for receipts and transactions:
 * - Spending patterns and trends
 * - Merchant insights and analysis
 * - Category breakdown and statistics
 * - Time-based analytics (daily, weekly, monthly, yearly)
 * - Receipt processing statistics
 * - Export-ready data formatting
 */
import Receipt from '../models/receiptModel.js';
import Transaction from '../models/transactionModel.js';
import Category from '../models/categoryModel.js';
import asyncHandler from 'express-async-handler';
import moment from 'moment';

// @desc    Get receipt analytics overview
// @route   GET /api/analytics/receipts/overview
// @access  Private
const getReceiptAnalyticsOverview = asyncHandler(async (req, res) => {
  try {
    const userId = req.user.id;
    const { period = '30d' } = req.query;

    // Calculate date range
    const endDate = new Date();
    const startDate = moment().subtract(parseInt(period.replace('d', '')), 'days').toDate();

    // Get receipt statistics
    const totalReceipts = await Receipt.countDocuments({ user: userId });
    const processedReceipts = await Receipt.countDocuments({ 
      user: userId, 
      status: 'processed' 
    });
    const scannedReceipts = await Receipt.countDocuments({ 
      user: userId, 
      status: 'scanned' 
    });
    const failedReceipts = await Receipt.countDocuments({ 
      user: userId, 
      status: 'failed' 
    });

    // Get receipts in period
    const receiptsInPeriod = await Receipt.find({
      user: userId,
      createdAt: { $gte: startDate, $lte: endDate }
    });

    // Calculate processing rate
    const processingRate = totalReceipts > 0 ? (processedReceipts / totalReceipts) * 100 : 0;

    // Get total amount from processed receipts
    const processedReceiptsWithAmounts = receiptsInPeriod.filter(
      receipt => receipt.status === 'processed' && receipt.extractedData?.amount
    );
    
    const totalAmount = processedReceiptsWithAmounts.reduce(
      (sum, receipt) => sum + (receipt.extractedData.amount || 0), 0
    );

    // Get average amount per receipt
    const averageAmount = processedReceiptsWithAmounts.length > 0 
      ? totalAmount / processedReceiptsWithAmounts.length 
      : 0;

    // Get most common merchants
    const merchantCounts = {};
    receiptsInPeriod.forEach(receipt => {
      if (receipt.extractedData?.merchant) {
        const merchant = receipt.extractedData.merchant.toLowerCase().trim();
        merchantCounts[merchant] = (merchantCounts[merchant] || 0) + 1;
      }
    });

    const topMerchants = Object.entries(merchantCounts)
      .sort(([,a], [,b]) => b - a)
      .slice(0, 5)
      .map(([merchant, count]) => ({ merchant, count }));

    res.status(200).json({
      success: true,
      data: {
        overview: {
          totalReceipts,
          processedReceipts,
          scannedReceipts,
          failedReceipts,
          processingRate: Math.round(processingRate * 100) / 100
        },
        period: {
          startDate,
          endDate,
          totalAmount: Math.round(totalAmount * 100) / 100,
          averageAmount: Math.round(averageAmount * 100) / 100,
          receiptCount: receiptsInPeriod.length
        },
        topMerchants,
        periodLabel: `${period} days`
      }
    });
  } catch (error) {
    console.error('Receipt analytics overview error:', error);
    res.status(500);
    throw new Error(`Failed to fetch receipt analytics: ${error.message}`);
  }
});

// @desc    Get spending patterns by category
// @route   GET /api/analytics/receipts/spending-patterns
// @access  Private
const getSpendingPatterns = asyncHandler(async (req, res) => {
  try {
    const userId = req.user.id;
    const { period = '30d', groupBy = 'category' } = req.query;

    // Calculate date range
    const endDate = new Date();
    const startDate = moment().subtract(parseInt(period.replace('d', '')), 'days').toDate();

    // Get transactions from processed receipts
    const transactions = await Transaction.find({
      user: userId,
      date: { $gte: startDate, $lte: endDate },
      receiptImage: { $exists: true, $ne: null }
    }).populate('category');

    // Group by category
    const categorySpending = {};
    transactions.forEach(transaction => {
      const categoryId = transaction.category._id.toString();
      const categoryName = transaction.category.name;
      
      if (!categorySpending[categoryId]) {
        categorySpending[categoryId] = {
          categoryId,
          categoryName,
          totalAmount: 0,
          transactionCount: 0,
          averageAmount: 0
        };
      }
      
      categorySpending[categoryId].totalAmount += transaction.amount;
      categorySpending[categoryId].transactionCount += 1;
    });

    // Calculate averages and sort
    const patterns = Object.values(categorySpending).map(pattern => ({
      ...pattern,
      averageAmount: Math.round((pattern.totalAmount / pattern.transactionCount) * 100) / 100,
      totalAmount: Math.round(pattern.totalAmount * 100) / 100
    })).sort((a, b) => b.totalAmount - a.totalAmount);

    // Calculate total spending
    const totalSpending = patterns.reduce((sum, pattern) => sum + pattern.totalAmount, 0);

    // Add percentage of total spending
    patterns.forEach(pattern => {
      pattern.percentage = totalSpending > 0 
        ? Math.round((pattern.totalAmount / totalSpending) * 100 * 100) / 100 
        : 0;
    });

    res.status(200).json({
      success: true,
      data: {
        patterns,
        totalSpending: Math.round(totalSpending * 100) / 100,
        period: {
          startDate,
          endDate,
          label: `${period} days`
        },
        groupBy
      }
    });
  } catch (error) {
    console.error('Spending patterns error:', error);
    res.status(500);
    throw new Error(`Failed to fetch spending patterns: ${error.message}`);
  }
});

// @desc    Get merchant insights
// @route   GET /api/analytics/receipts/merchant-insights
// @access  Private
const getMerchantInsights = asyncHandler(async (req, res) => {
  try {
    const userId = req.user.id;
    const { period = '30d' } = req.query;

    // Calculate date range
    const endDate = new Date();
    const startDate = moment().subtract(parseInt(period.replace('d', '')), 'days').toDate();

    // Get receipts in period
    const receipts = await Receipt.find({
      user: userId,
      createdAt: { $gte: startDate, $lte: endDate }
    });

    // Analyze merchants
    const merchantData = {};
    receipts.forEach(receipt => {
      if (receipt.extractedData?.merchant) {
        const merchant = receipt.extractedData.merchant.toLowerCase().trim();
        
        if (!merchantData[merchant]) {
          merchantData[merchant] = {
            merchant,
            totalAmount: 0,
            receiptCount: 0,
            averageAmount: 0,
            firstVisit: receipt.createdAt,
            lastVisit: receipt.createdAt,
            categories: new Set(),
            statusCounts: {
              processed: 0,
              scanned: 0,
              failed: 0
            }
          };
        }
        
        const data = merchantData[merchant];
        data.totalAmount += receipt.extractedData.amount || 0;
        data.receiptCount += 1;
        data.lastVisit = receipt.createdAt;
        data.statusCounts[receipt.status] += 1;
        
        // Track categories if transaction exists
        if (receipt.transactionId) {
          // This would need to be populated from transaction
        }
      }
    });

    // Calculate averages and format
    const insights = Object.values(merchantData).map(data => ({
      merchant: data.merchant,
      totalAmount: Math.round(data.totalAmount * 100) / 100,
      receiptCount: data.receiptCount,
      averageAmount: Math.round((data.totalAmount / data.receiptCount) * 100) / 100,
      firstVisit: data.firstVisit,
      lastVisit: data.lastVisit,
      statusCounts: data.statusCounts,
      frequency: data.receiptCount / Math.max(1, moment().diff(moment(data.firstVisit), 'days'))
    })).sort((a, b) => b.totalAmount - a.totalAmount);

    // Get top merchants by different metrics
    const topByAmount = insights.slice(0, 10);
    const topByFrequency = [...insights].sort((a, b) => b.frequency - a.frequency).slice(0, 10);
    const topByCount = [...insights].sort((a, b) => b.receiptCount - a.receiptCount).slice(0, 10);

    res.status(200).json({
      success: true,
      data: {
        insights,
        topByAmount,
        topByFrequency,
        topByCount,
        period: {
          startDate,
          endDate,
          label: `${period} days`
        },
        summary: {
          totalMerchants: insights.length,
          totalAmount: Math.round(insights.reduce((sum, m) => sum + m.totalAmount, 0) * 100) / 100,
          averagePerMerchant: insights.length > 0 
            ? Math.round((insights.reduce((sum, m) => sum + m.totalAmount, 0) / insights.length) * 100) / 100 
            : 0
        }
      }
    });
  } catch (error) {
    console.error('Merchant insights error:', error);
    res.status(500);
    throw new Error(`Failed to fetch merchant insights: ${error.message}`);
  }
});

// @desc    Get time-based analytics
// @route   GET /api/analytics/receipts/time-based
// @access  Private
const getTimeBasedAnalytics = asyncHandler(async (req, res) => {
  try {
    const userId = req.user.id;
    const { period = '30d', granularity = 'daily' } = req.query;

    // Calculate date range
    const endDate = new Date();
    const startDate = moment().subtract(parseInt(period.replace('d', '')), 'days').toDate();

    // Get receipts in period
    const receipts = await Receipt.find({
      user: userId,
      createdAt: { $gte: startDate, $lte: endDate }
    });

    // Group by time period
    const timeData = {};
    
    receipts.forEach(receipt => {
      let timeKey;
      const date = moment(receipt.createdAt);
      
      switch (granularity) {
        case 'hourly':
          timeKey = date.format('YYYY-MM-DD HH:00');
          break;
        case 'daily':
          timeKey = date.format('YYYY-MM-DD');
          break;
        case 'weekly':
          timeKey = date.format('YYYY-[W]WW');
          break;
        case 'monthly':
          timeKey = date.format('YYYY-MM');
          break;
        default:
          timeKey = date.format('YYYY-MM-DD');
      }
      
      if (!timeData[timeKey]) {
        timeData[timeKey] = {
          period: timeKey,
          receiptCount: 0,
          processedCount: 0,
          totalAmount: 0,
          averageAmount: 0
        };
      }
      
      const data = timeData[timeKey];
      data.receiptCount += 1;
      if (receipt.status === 'processed') {
        data.processedCount += 1;
        data.totalAmount += receipt.extractedData?.amount || 0;
      }
    });

    // Calculate averages and sort
    const analytics = Object.values(timeData).map(data => ({
      ...data,
      averageAmount: data.processedCount > 0 
        ? Math.round((data.totalAmount / data.processedCount) * 100) / 100 
        : 0,
      totalAmount: Math.round(data.totalAmount * 100) / 100,
      processingRate: data.receiptCount > 0 
        ? Math.round((data.processedCount / data.receiptCount) * 100 * 100) / 100 
        : 0
    })).sort((a, b) => a.period.localeCompare(b.period));

    // Calculate trends
    const totalReceipts = analytics.reduce((sum, data) => sum + data.receiptCount, 0);
    const totalProcessed = analytics.reduce((sum, data) => sum + data.processedCount, 0);
    const totalAmount = analytics.reduce((sum, data) => sum + data.totalAmount, 0);

    res.status(200).json({
      success: true,
      data: {
        analytics,
        summary: {
          totalReceipts,
          totalProcessed,
          totalAmount: Math.round(totalAmount * 100) / 100,
          averagePerPeriod: analytics.length > 0 
            ? Math.round((totalAmount / analytics.length) * 100) / 100 
            : 0,
          processingRate: totalReceipts > 0 
            ? Math.round((totalProcessed / totalReceipts) * 100 * 100) / 100 
            : 0
        },
        period: {
          startDate,
          endDate,
          granularity,
          label: `${period} days`
        }
      }
    });
  } catch (error) {
    console.error('Time-based analytics error:', error);
    res.status(500);
    throw new Error(`Failed to fetch time-based analytics: ${error.message}`);
  }
});

// @desc    Get receipt processing statistics
// @route   GET /api/analytics/receipts/processing-stats
// @access  Private
const getProcessingStats = asyncHandler(async (req, res) => {
  try {
    const userId = req.user.id;
    const { period = '30d' } = req.query;

    // Calculate date range
    const endDate = new Date();
    const startDate = moment().subtract(parseInt(period.replace('d', '')), 'days').toDate();

    // Get processing statistics
    const stats = await Receipt.aggregate([
      {
        $match: {
          user: userId,
          createdAt: { $gte: startDate, $lte: endDate }
        }
      },
      {
        $group: {
          _id: '$status',
          count: { $sum: 1 },
          totalAmount: { $sum: '$extractedData.amount' }
        }
      }
    ]);

    // Get daily processing counts
    const dailyStats = await Receipt.aggregate([
      {
        $match: {
          user: userId,
          createdAt: { $gte: startDate, $lte: endDate }
        }
      },
      {
        $group: {
          _id: {
            date: { $dateToString: { format: '%Y-%m-%d', date: '$createdAt' } },
            status: '$status'
          },
          count: { $sum: 1 }
        }
      },
      {
        $sort: { '_id.date': 1 }
      }
    ]);

    // Format daily stats
    const dailyData = {};
    dailyStats.forEach(stat => {
      const date = stat._id.date;
      const status = stat._id.status;
      
      if (!dailyData[date]) {
        dailyData[date] = { date, processed: 0, scanned: 0, failed: 0 };
      }
      
      dailyData[date][status] = stat.count;
    });

    const dailyArray = Object.values(dailyData).sort((a, b) => a.date.localeCompare(b.date));

    // Calculate success rate
    const totalReceipts = stats.reduce((sum, stat) => sum + stat.count, 0);
    const processedReceipts = stats.find(stat => stat._id === 'processed')?.count || 0;
    const successRate = totalReceipts > 0 ? (processedReceipts / totalReceipts) * 100 : 0;

    res.status(200).json({
      success: true,
      data: {
        statusBreakdown: stats.map(stat => ({
          status: stat._id,
          count: stat.count,
          percentage: totalReceipts > 0 
            ? Math.round((stat.count / totalReceipts) * 100 * 100) / 100 
            : 0,
          totalAmount: Math.round((stat.totalAmount || 0) * 100) / 100
        })),
        dailyStats: dailyArray,
        summary: {
          totalReceipts,
          processedReceipts,
          successRate: Math.round(successRate * 100) / 100,
          period: {
            startDate,
            endDate,
            label: `${period} days`
          }
        }
      }
    });
  } catch (error) {
    console.error('Processing stats error:', error);
    res.status(500);
    throw new Error(`Failed to fetch processing statistics: ${error.message}`);
  }
});

export {
  getReceiptAnalyticsOverview,
  getSpendingPatterns,
  getMerchantInsights,
  getTimeBasedAnalytics,
  getProcessingStats
};
