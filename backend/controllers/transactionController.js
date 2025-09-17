import asyncHandler from 'express-async-handler';
import Transaction from '../models/transactionModel.js';
import { convertCurrency } from '../utils/currencyConverter.js';

// @desc    Create a new transaction
// @route   POST /api/transactions
// @access  Private
const createTransaction = asyncHandler(async (req, res) => {
  const { amount, type, category, description, date } = req.body;

  const transaction = await Transaction.create({
    user: req.user._id,
    amount,
    type,
    category,
    description,
    date: date || new Date(),
    currency: req.user.currency || 'INR', // Store the user's currency at the time of creation
  });

  res.status(201).json(transaction);
});

// @desc    Get all user transactions
// @route   GET /api/transactions
// @access  Private
const getTransactions = asyncHandler(async (req, res) => {
  const { startDate, endDate, type, category, sort, limit = 50, page = 1 } = req.query;
  
  // Build filter object
  const filter = { user: req.user._id };
  
  if (startDate && endDate) {
    filter.date = {
      $gte: new Date(startDate),
      $lte: new Date(endDate),
    };
  } else if (startDate) {
    filter.date = { $gte: new Date(startDate) };
  } else if (endDate) {
    filter.date = { $lte: new Date(endDate) };
  }
  
  if (type) {
    filter.type = type;
  }
  
  if (category) {
    filter.category = category;
  }
  
  // Build sort object
  let sortOption = { createdAt: -1 }; // Default: newest first by creation time
if (sort) {
  const [field, order] = sort.split(':');
  if (field === 'createdAt' || field === 'updatedAt') {
    sortOption = { [field]: order === 'asc' ? 1 : -1 };
  } else if (field === 'date') {
    sortOption = { date: order === 'asc' ? 1 : -1 };
  } else if (field === 'amount') {
    sortOption = { amount: order === 'asc' ? 1 : -1 };
  }
}
  
  // Calculate pagination
  const skip = (parseInt(page) - 1) * parseInt(limit);
  
  const transactions = await Transaction.find(filter)
    .populate('category', 'name color icon')
    .select('amount type category description date currency')
    .sort(sortOption)
    .limit(parseInt(limit))
    .skip(skip);
  
  // Get total count for pagination
  const total = await Transaction.countDocuments(filter);
  
  res.json({
    transactions,
    pagination: {
      total,
      page: parseInt(page),
      pages: Math.ceil(total / parseInt(limit)),
    },
  });
});

// @desc    Get transaction by ID
// @route   GET /api/transactions/:id
// @access  Private
const getTransactionById = asyncHandler(async (req, res) => {
  const transaction = await Transaction.findById(req.params.id)
    .populate('category', 'name color icon')
    .select('amount type category description date currency user');

  if (transaction && transaction.user.toString() === req.user._id.toString()) {
    const { user, ...transactionData } = transaction.toObject();
    res.json(transaction);
  } else {
    res.status(404);
    throw new Error('Transaction not found');
  }
});

// @desc    Update transaction
// @route   PUT /api/transactions/:id
// @access  Private
const updateTransaction = asyncHandler(async (req, res) => {
  const { amount, type, category, description, date } = req.body;

  const transaction = await Transaction.findById(req.params.id)
    .select('amount type category description date user');

  if (transaction && transaction.user.toString() === req.user._id.toString()) {
    transaction.amount = amount || transaction.amount;
    transaction.type = type || transaction.type;
    transaction.category = category || transaction.category;
    transaction.description = description || transaction.description;
    transaction.date = date || transaction.date;

    const updatedTransaction = await transaction.save();

    // Populate category for the response
    await updatedTransaction.populate('category', 'name color icon');

    res.json(updatedTransaction);
  } else {
    res.status(404);
    throw new Error('Transaction not found');
  }
});

// @desc    Delete transaction
// @route   DELETE /api/transactions/:id
// @access  Private
const deleteTransaction = asyncHandler(async (req, res) => {
  const transaction = await Transaction.findById(req.params.id);

  if (transaction && transaction.user.toString() === req.user._id.toString()) {
    await transaction.deleteOne();
    res.json({ message: 'Transaction removed' });
  } else {
    res.status(404);
    throw new Error('Transaction not found');
  }
});

// @desc    Get transaction summary (totals by type)
// @route   GET /api/transactions/summary
// @access  Private
const getTransactionSummary = asyncHandler(async (req, res) => {
  const { startDate, endDate } = req.query;
  
  const dateFilter = {};
  
  if (startDate && endDate) {
    dateFilter.date = {
      $gte: new Date(startDate),
      $lte: new Date(endDate),
    };
  } else if (startDate) {
    dateFilter.date = { $gte: new Date(startDate) };
  } else if (endDate) {
    dateFilter.date = { $lte: new Date(endDate) };
  }
  
  // Get all transactions for the period to handle currency conversion properly
  const transactions = await Transaction.find({
    user: req.user._id,
    ...dateFilter,
  })
    .populate('category', 'name color icon')
    .select('amount type category currency');

  // Group transactions by type and convert to user's currency
  const summary = { income: 0, expense: 0 };
  const categories = { income: [], expense: [] };
  const categoryTotals = {};

  transactions.forEach(transaction => {
    // Convert amount to user's currency
    const convertedAmount = convertCurrency(
      transaction.amount, 
      transaction.currency || 'INR', 
      req.user.currency || 'INR'
    );

    // Add to summary
    summary[transaction.type] += convertedAmount;

    // Add to category totals
    const categoryKey = `${transaction.type}_${transaction.category._id}`;
    if (!categoryTotals[categoryKey]) {
      categoryTotals[categoryKey] = {
        type: transaction.type,
        category: transaction.category,
        total: 0
      };
    }
    categoryTotals[categoryKey].total += convertedAmount;
  });

  // Calculate balance
  const balance = summary.income - summary.expense;

  // Convert category totals to array format
  Object.values(categoryTotals).forEach(cat => {
    if (!categories[cat.type]) {
      categories[cat.type] = [];
    }
    categories[cat.type].push({
      id: cat.category._id,
      name: cat.category.name,
      color: cat.category.color,
      icon: cat.category.icon,
      total: cat.total,
    });
  });

  // Sort categories by total
  Object.keys(categories).forEach(type => {
    categories[type].sort((a, b) => b.total - a.total);
  });

  res.json({
    summary: {
      income: summary.income,
      expense: summary.expense,
      balance,
    },
    categories,
  });
});

export {
  createTransaction,
  getTransactions,
  getTransactionById,
  updateTransaction,
  deleteTransaction,
  getTransactionSummary,
};