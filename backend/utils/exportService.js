/**
 * Export Service
 * 
 * Provides comprehensive data export functionality:
 * - PDF report generation with charts and analytics
 * - CSV/Excel data export
 * - Receipt image compilation
 * - Custom report templates
 * - Multi-format support (PDF, CSV, JSON)
 */
// import puppeteer from 'puppeteer';
import Receipt from '../models/receiptModel.js';
import Transaction from '../models/transactionModel.js';
import Category from '../models/categoryModel.js';
import moment from 'moment';
// import memoryManager from './memoryManager.js';

class ExportService {
  constructor() {
    this.browser = null;
  }

  // Initialize browser instance
  async initialize() {
    if (!this.browser) {
      // Use production-optimized browser configuration
      if (process.env.NODE_ENV === 'production') {
        console.log('Using production-optimized PDF generation');
      }
      
      this.browser = await puppeteer.launch({
        headless: 'new',
        args: [
          '--no-sandbox', 
          '--disable-setuid-sandbox',
          '--disable-dev-shm-usage',
          '--disable-gpu',
          '--no-first-run',
          '--no-zygote',
          '--single-process',
          '--disable-background-timer-throttling',
          '--disable-backgrounding-occluded-windows',
          '--disable-renderer-backgrounding'
        ]
      });
    }
  }

  // Generate PDF report
  async generatePDFReport(userId, options = {}) {
    try {
      // PDF generation temporarily disabled for deployment
      // Return a message indicating the feature is temporarily unavailable
      console.log('PDF generation temporarily disabled for deployment');
      
      throw new Error('PDF generation is temporarily unavailable. Please use CSV export instead.');
    } catch (error) {
      console.error('PDF generation error:', error);
      throw error;
    }
  }

  // Gather data for report
  async gatherReportData(userId, startDate, endDate, reportType) {
    const data = {
      user: null,
      receipts: [],
      transactions: [],
      categories: [],
      analytics: {},
      period: {
        startDate,
        endDate,
        label: moment(endDate).diff(moment(startDate), 'days') + ' days'
      }
    };

    // Get receipts
    data.receipts = await Receipt.find({
      user: userId,
      createdAt: { $gte: startDate, $lte: endDate }
    }).populate('transactionId');

    // Get transactions from receipts
    const transactionIds = data.receipts
      .filter(r => r.transactionId)
      .map(r => r.transactionId._id);
    
    data.transactions = await Transaction.find({
      _id: { $in: transactionIds }
    }).populate('category');

    // Get categories
    data.categories = await Category.find({ user: userId });

    // Calculate analytics
    data.analytics = this.calculateAnalytics(data);

    return data;
  }

  // Calculate analytics for report
  calculateAnalytics(data) {
    const { receipts, transactions } = data;
    
    const analytics = {
      totalReceipts: receipts.length,
      processedReceipts: receipts.filter(r => r.status === 'processed').length,
      totalAmount: 0,
      averageAmount: 0,
      categoryBreakdown: {},
      merchantBreakdown: {},
      dailyBreakdown: {},
      processingRate: 0
    };

    // Calculate amounts
    const processedReceipts = receipts.filter(r => r.status === 'processed' && r.extractedData?.amount);
    analytics.totalAmount = processedReceipts.reduce((sum, r) => sum + (r.extractedData.amount || 0), 0);
    analytics.averageAmount = processedReceipts.length > 0 ? analytics.totalAmount / processedReceipts.length : 0;
    analytics.processingRate = receipts.length > 0 ? (analytics.processedReceipts / receipts.length) * 100 : 0;

    // Category breakdown
    transactions.forEach(transaction => {
      const categoryName = transaction.category?.name || 'Unknown';
      if (!analytics.categoryBreakdown[categoryName]) {
        analytics.categoryBreakdown[categoryName] = { count: 0, amount: 0 };
      }
      analytics.categoryBreakdown[categoryName].count += 1;
      analytics.categoryBreakdown[categoryName].amount += transaction.amount;
    });

    // Merchant breakdown
    receipts.forEach(receipt => {
      if (receipt.extractedData?.merchant) {
        const merchant = receipt.extractedData.merchant.toLowerCase().trim();
        if (!analytics.merchantBreakdown[merchant]) {
          analytics.merchantBreakdown[merchant] = { count: 0, amount: 0 };
        }
        analytics.merchantBreakdown[merchant].count += 1;
        analytics.merchantBreakdown[merchant].amount += receipt.extractedData.amount || 0;
      }
    });

    // Daily breakdown
    receipts.forEach(receipt => {
      const date = moment(receipt.createdAt).format('YYYY-MM-DD');
      if (!analytics.dailyBreakdown[date]) {
        analytics.dailyBreakdown[date] = { receipts: 0, amount: 0 };
      }
      analytics.dailyBreakdown[date].receipts += 1;
      analytics.dailyBreakdown[date].amount += receipt.extractedData?.amount || 0;
    });

    return analytics;
  }

  // Generate HTML content for PDF
  generateHTMLReport(data, options) {
    const { analytics, receipts, transactions, period } = data;
    
    return `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="utf-8">
        <title>MyKhata Receipt Report</title>
        <style>
          body {
            font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
            line-height: 1.6;
            color: #333;
            margin: 0;
            padding: 20px;
          }
          .header {
            text-align: center;
            border-bottom: 3px solid #3B82F6;
            padding-bottom: 20px;
            margin-bottom: 30px;
          }
          .header h1 {
            color: #3B82F6;
            margin: 0;
            font-size: 2.5em;
          }
          .header p {
            color: #666;
            margin: 10px 0 0 0;
            font-size: 1.1em;
          }
          .summary {
            display: grid;
            grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
            gap: 20px;
            margin-bottom: 30px;
          }
          .summary-card {
            background: #f8fafc;
            border: 1px solid #e2e8f0;
            border-radius: 8px;
            padding: 20px;
            text-align: center;
          }
          .summary-card h3 {
            margin: 0 0 10px 0;
            color: #64748b;
            font-size: 0.9em;
            text-transform: uppercase;
            letter-spacing: 0.5px;
          }
          .summary-card .value {
            font-size: 2em;
            font-weight: bold;
            color: #1e293b;
            margin: 0;
          }
          .section {
            margin-bottom: 30px;
          }
          .section h2 {
            color: #1e293b;
            border-bottom: 2px solid #e2e8f0;
            padding-bottom: 10px;
            margin-bottom: 20px;
          }
          .table {
            width: 100%;
            border-collapse: collapse;
            margin-bottom: 20px;
          }
          .table th,
          .table td {
            border: 1px solid #e2e8f0;
            padding: 12px;
            text-align: left;
          }
          .table th {
            background-color: #f8fafc;
            font-weight: 600;
            color: #475569;
          }
          .table tr:nth-child(even) {
            background-color: #f8fafc;
          }
          .chart-placeholder {
            background: #f8fafc;
            border: 2px dashed #cbd5e1;
            border-radius: 8px;
            padding: 40px;
            text-align: center;
            color: #64748b;
            margin: 20px 0;
          }
          .footer {
            margin-top: 50px;
            padding-top: 20px;
            border-top: 1px solid #e2e8f0;
            text-align: center;
            color: #64748b;
            font-size: 0.9em;
          }
          .status-badge {
            display: inline-block;
            padding: 4px 8px;
            border-radius: 4px;
            font-size: 0.8em;
            font-weight: 600;
            text-transform: uppercase;
          }
          .status-processed {
            background-color: #dcfce7;
            color: #166534;
          }
          .status-scanned {
            background-color: #fef3c7;
            color: #92400e;
          }
          .status-failed {
            background-color: #fecaca;
            color: #991b1b;
          }
        </style>
      </head>
      <body>
        <div class="header">
          <h1>MyKhata Receipt Report</h1>
          <p>Generated on ${moment().format('MMMM Do YYYY, h:mm:ss a')}</p>
          <p>Period: ${period.label} (${moment(period.startDate).format('MMM DD, YYYY')} - ${moment(period.endDate).format('MMM DD, YYYY')})</p>
        </div>

        <div class="summary">
          <div class="summary-card">
            <h3>Total Receipts</h3>
            <p class="value">${analytics.totalReceipts}</p>
          </div>
          <div class="summary-card">
            <h3>Processed</h3>
            <p class="value">${analytics.processedReceipts}</p>
          </div>
          <div class="summary-card">
            <h3>Total Amount</h3>
            <p class="value">$${analytics.totalAmount.toFixed(2)}</p>
          </div>
          <div class="summary-card">
            <h3>Success Rate</h3>
            <p class="value">${analytics.processingRate.toFixed(1)}%</p>
          </div>
        </div>

        <div class="section">
          <h2>Receipt Summary</h2>
          <table class="table">
            <thead>
              <tr>
                <th>Date</th>
                <th>Merchant</th>
                <th>Amount</th>
                <th>Status</th>
                <th>Category</th>
              </tr>
            </thead>
            <tbody>
              ${receipts.map(receipt => `
                <tr>
                  <td>${moment(receipt.createdAt).format('MMM DD, YYYY')}</td>
                  <td>${receipt.extractedData?.merchant || 'N/A'}</td>
                  <td>$${(receipt.extractedData?.amount || 0).toFixed(2)}</td>
                  <td>
                    <span class="status-badge status-${receipt.status}">
                      ${receipt.status}
                    </span>
                  </td>
                  <td>${receipt.transactionId?.category?.name || 'N/A'}</td>
                </tr>
              `).join('')}
            </tbody>
          </table>
        </div>

        <div class="section">
          <h2>Category Breakdown</h2>
          <table class="table">
            <thead>
              <tr>
                <th>Category</th>
                <th>Transactions</th>
                <th>Total Amount</th>
                <th>Average</th>
              </tr>
            </thead>
            <tbody>
              ${Object.entries(analytics.categoryBreakdown).map(([category, data]) => `
                <tr>
                  <td>${category}</td>
                  <td>${data.count}</td>
                  <td>$${data.amount.toFixed(2)}</td>
                  <td>$${(data.amount / data.count).toFixed(2)}</td>
                </tr>
              `).join('')}
            </tbody>
          </table>
        </div>

        <div class="section">
          <h2>Top Merchants</h2>
          <table class="table">
            <thead>
              <tr>
                <th>Merchant</th>
                <th>Receipts</th>
                <th>Total Amount</th>
                <th>Average</th>
              </tr>
            </thead>
            <tbody>
              ${Object.entries(analytics.merchantBreakdown)
                .sort(([,a], [,b]) => b.amount - a.amount)
                .slice(0, 10)
                .map(([merchant, data]) => `
                <tr>
                  <td>${merchant}</td>
                  <td>${data.count}</td>
                  <td>$${data.amount.toFixed(2)}</td>
                  <td>$${(data.amount / data.count).toFixed(2)}</td>
                </tr>
              `).join('')}
            </tbody>
          </table>
        </div>

        <div class="footer">
          <p>This report was generated by MyKhata - Your Personal Finance Tracker</p>
          <p>For support, visit our website or contact our support team</p>
        </div>
      </body>
      </html>
    `;
  }

  // Export data as CSV
  async exportCSV(userId, options = {}) {
    try {
      const { period = '30d', dataType = 'receipts' } = options;
      
      // Calculate date range
      const endDate = new Date();
      const startDate = moment().subtract(parseInt(period.replace('d', '')), 'days').toDate();

      let data = [];
      let headers = [];

      if (dataType === 'receipts') {
        const receipts = await Receipt.find({
          user: userId,
          createdAt: { $gte: startDate, $lte: endDate }
        }).populate('transactionId');

        headers = ['Date', 'Merchant', 'Amount', 'Status', 'Category', 'Description'];
        data = receipts.map(receipt => [
          moment(receipt.createdAt).format('YYYY-MM-DD'),
          receipt.extractedData?.merchant || '',
          receipt.extractedData?.amount || 0,
          receipt.status,
          receipt.transactionId?.category?.name || '',
          receipt.extractedData?.description || ''
        ]);
      } else if (dataType === 'transactions') {
        const transactions = await Transaction.find({
          user: userId,
          date: { $gte: startDate, $lte: endDate },
          receiptImage: { $exists: true, $ne: null }
        }).populate('category');

        headers = ['Date', 'Merchant', 'Amount', 'Type', 'Category', 'Description'];
        data = transactions.map(transaction => [
          moment(transaction.date).format('YYYY-MM-DD'),
          transaction.merchant || '',
          transaction.amount,
          transaction.type,
          transaction.category?.name || '',
          transaction.description || ''
        ]);
      }

      // Generate CSV content
      const csvContent = [
        headers.join(','),
        ...data.map(row => row.map(field => `"${field}"`).join(','))
      ].join('\n');

      return csvContent;

    } catch (error) {
      console.error('CSV export error:', error);
      throw error;
    }
  }

  // Export data as JSON
  async exportJSON(userId, options = {}) {
    try {
      const { period = '30d' } = options;
      
      // Calculate date range
      const endDate = new Date();
      const startDate = moment().subtract(parseInt(period.replace('d', '')), 'days').toDate();

      const data = await this.gatherReportData(userId, startDate, endDate, 'comprehensive');
      
      return JSON.stringify(data, null, 2);

    } catch (error) {
      console.error('JSON export error:', error);
      throw error;
    }
  }

  // Cleanup browser instance
  async cleanup() {
    if (this.browser) {
      await this.browser.close();
      this.browser = null;
    }
  }
}

export default ExportService;
