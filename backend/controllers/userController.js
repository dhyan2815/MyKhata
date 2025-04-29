import asyncHandler from 'express-async-handler';
import generateToken from '../utils/generateToken.js';
import User from '../models/userModel.js';
import Category from '../models/categoryModel.js';

// @desc    Auth user & get token
// @route   POST /api/users/login
// @access  Public
const authUser = asyncHandler(async (req, res) => {
  const { email, password } = req.body;

  const user = await User.findOne({ email }).select('+password');

  if (user && (await user.matchPassword(password))) {
    res.json({
      _id: user._id,
      name: user.name,
      email: user.email,
      currency: user.currency,
      token: generateToken(user._id),
    });
  } else {
    res.status(401);
    throw new Error('Invalid email or password');
  }
});

// @desc    Register a new user
// @route   POST /api/users
// @access  Public
const registerUser = asyncHandler(async (req, res) => {
  const { name, email, password } = req.body;

  const userExists = await User.findOne({ email });

  if (userExists) {
    res.status(400);
    throw new Error('User already exists');
  }

  const user = await User.create({
    name,
    email,
    password,
  });

  if (user) {
    // Create default categories for the new user
    await createDefaultCategories(user._id);

    res.status(201).json({
      _id: user._id,
      name: user.name,
      email: user.email,
      currency: user.currency,
      token: generateToken(user._id),
    });
  } else {
    res.status(400);
    throw new Error('Invalid user data');
  }
});

// @desc    Get user profile
// @route   GET /api/users/profile
// @access  Private
const getUserProfile = asyncHandler(async (req, res) => {
  const user = await User.findById(req.user._id);

  if (user) {
    res.json({
      _id: user._id,
      name: user.name,
      email: user.email,
      currency: user.currency,
    });
  } else {
    res.status(404);
    throw new Error('User not found');
  }
});

// @desc    Update user profile
// @route   PUT /api/users/profile
// @access  Private
const updateUserProfile = asyncHandler(async (req, res) => {
  const user = await User.findById(req.user._id);

  if (user) {
    user.name = req.body.name || user.name;
    user.email = req.body.email || user.email;
    user.currency = req.body.currency || user.currency;
    
    if (req.body.password) {
      user.password = req.body.password;
    }

    const updatedUser = await user.save();

    res.json({
      _id: updatedUser._id,
      name: updatedUser.name,
      email: updatedUser.email,
      currency: updatedUser.currency,
      token: generateToken(updatedUser._id),
    });
  } else {
    res.status(404);
    throw new Error('User not found');
  }
});

// Helper function to create default categories for new users
const createDefaultCategories = async (userId) => {
  const defaultExpenseCategories = [
    { name: 'Food & Dining', type: 'expense', color: '#F59E0B', icon: 'utensils', isDefault: true },
    { name: 'Transportation', type: 'expense', color: '#3B82F6', icon: 'car', isDefault: true },
    { name: 'Housing', type: 'expense', color: '#10B981', icon: 'home', isDefault: true },
    { name: 'Entertainment', type: 'expense', color: '#8B5CF6', icon: 'film', isDefault: true },
    { name: 'Shopping', type: 'expense', color: '#EC4899', icon: 'shopping-bag', isDefault: true },
    { name: 'Utilities', type: 'expense', color: '#6366F1', icon: 'bolt', isDefault: true },
    { name: 'Health', type: 'expense', color: '#EF4444', icon: 'heart', isDefault: true },
    { name: 'Other Expenses', type: 'expense', color: '#6B7280', icon: 'ellipsis-h', isDefault: true },
  ];

  const defaultIncomeCategories = [
    { name: 'Salary', type: 'income', color: '#10B981', icon: 'briefcase', isDefault: true },
    { name: 'Freelance', type: 'income', color: '#3B82F6', icon: 'laptop', isDefault: true },
    { name: 'Investments', type: 'income', color: '#8B5CF6', icon: 'chart-line', isDefault: true },
    { name: 'Allowance', type: 'income', color: '#F59E0B', icon: 'coins', isDefault: true },
    { name: 'Other Income', type: 'income', color: '#6B7280', icon: 'ellipsis-h', isDefault: true },
  ];

  const allCategories = [...defaultExpenseCategories, ...defaultIncomeCategories];
  
  for (const category of allCategories) {
    await Category.create({
      ...category,
      user: userId,
    });
  }
};

export { authUser, registerUser, getUserProfile, updateUserProfile };