import asyncHandler from 'express-async-handler';
import Transaction from '../models/transactionModel.js';

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
  });

  res.status(201).json(transaction);
});

// @desc    Get all user transactions
// @route   GET /api/transactions
// @access  Private
const getTransactions = asyncHandler(async (req, res) => {
  const { startDate, endDate, type, category, sort, limit = 100, page = 1 } = req.query;
  
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
  let sortOption = { date: -1 }; // Default: newest first
  if (sort) {
    const [field, order] = sort.split(':');
    sortOption = { [field]: order === 'asc' ? 1 : -1 };
  }
  
  // Calculate pagination
  const skip = (parseInt(page) - 1) * parseInt(limit);
  
  const transactions = await Transaction.find(filter)
    .populate('category', 'name color icon')
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
  const transaction = await Transaction.findById(req.params.id).populate(
    'category',
    'name color icon'
  );

  if (transaction && transaction.user.toString() === req.user._id.toString()) {
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

  const transaction = await Transaction.findById(req.params.id);

  if (transaction && transaction.user.toString() === req.user._id.toString()) {
    transaction.amount = amount || transaction.amount;
    transaction.type = type || transaction.type;
    transaction.category = category || transaction.category;
    transaction.description = description || transaction.description;
    transaction.date = date || transaction.date;

    const updatedTransaction = await transaction.save();
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
  
  // Pipeline for aggregation
  const summaryPipeline = [
    {
      $match: {
        user: req.user._id,
        ...dateFilter,
      },
    },
    {
      $group: {
        _id: '$type',
        total: { $sum: '$amount' },
      },
    },
  ];
  
  // Pipeline for category breakdown
  const categoryPipeline = [
    {
      $match: {
        user: req.user._id,
        ...dateFilter,
      },
    },
    {
      $group: {
        _id: {
          type: '$type',
          category: '$category',
        },
        total: { $sum: '$amount' },
      },
    },
    {
      $lookup: {
        from: 'categories',
        localField: '_id.category',
        foreignField: '_id',
        as: 'categoryInfo',
      },
    },
    {
      $unwind: '$categoryInfo',
    },
    {
      $project: {
        _id: 0,
        type: '$_id.type',
        category: '$_id.category',
        categoryName: '$categoryInfo.name',
        categoryColor: '$categoryInfo.color',
        categoryIcon: '$categoryInfo.icon',
        total: 1,
      },
    },
    {
      $sort: { total: -1 },
    },
  ];
  
  const summaryResults = await Transaction.aggregate(summaryPipeline);
  const categoryResults = await Transaction.aggregate(categoryPipeline);
  
  // Format the summary data
  const summary = summaryResults.reduce((acc, curr) => {
    acc[curr._id] = curr.total;
    return acc;
  }, {});
  
  // Calculate balance
  const income = summary.income || 0;
  const expense = summary.expense || 0;
  const balance = income - expense;
  
  // Group categories by type
  const categories = categoryResults.reduce((acc, curr) => {
    if (!acc[curr.type]) {
      acc[curr.type] = [];
    }
    acc[curr.type].push({
      id: curr.category,
      name: curr.categoryName,
      color: curr.categoryColor,
      icon: curr.categoryIcon,
      total: curr.total,
    });
    return acc;
  }, {});
  
  res.json({
    summary: {
      income,
      expense,
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