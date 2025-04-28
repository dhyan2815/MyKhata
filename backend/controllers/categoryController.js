import asyncHandler from 'express-async-handler';
import Category from '../models/categoryModel.js';
import Transaction from '../models/transactionModel.js';

// @desc    Get all categories
// @route   GET /api/categories
// @access  Private
const getCategories = asyncHandler(async (req, res) => {
  const { type } = req.query;
  
  const filter = { user: req.user._id };
  
  if (type) {
    filter.type = type;
  }
  
  const categories = await Category.find(filter).sort({ name: 1 });
  res.json(categories);
});

// @desc    Create a new category
// @route   POST /api/categories
// @access  Private
const createCategory = asyncHandler(async (req, res) => {
  const { name, type, color, icon } = req.body;

  // Check if category already exists for this user
  const existingCategory = await Category.findOne({
    user: req.user._id,
    name,
    type,
  });

  if (existingCategory) {
    res.status(400);
    throw new Error('Category already exists');
  }

  const category = await Category.create({
    user: req.user._id,
    name,
    type,
    color: color || '#3B82F6',
    icon: icon || 'tag',
  });

  res.status(201).json(category);
});

// @desc    Update category
// @route   PUT /api/categories/:id
// @access  Private
const updateCategory = asyncHandler(async (req, res) => {
  const { name, color, icon } = req.body;

  const category = await Category.findById(req.params.id);

  if (!category) {
    res.status(404);
    throw new Error('Category not found');
  }

  // Check if category belongs to user
  if (category.user && category.user.toString() !== req.user._id.toString()) {
    res.status(401);
    throw new Error('Not authorized');
  }

  // Don't allow modifying default categories type
  if (category.isDefault && req.body.type && req.body.type !== category.type) {
    res.status(400);
    throw new Error('Cannot change type of default category');
  }

  category.name = name || category.name;
  category.color = color || category.color;
  category.icon = icon || category.icon;

  const updatedCategory = await category.save();
  res.json(updatedCategory);
});

// @desc    Delete category
// @route   DELETE /api/categories/:id
// @access  Private
const deleteCategory = asyncHandler(async (req, res) => {
  const category = await Category.findById(req.params.id);

  if (!category) {
    res.status(404);
    throw new Error('Category not found');
  }

  // Check if category belongs to user
  if (category.user && category.user.toString() !== req.user._id.toString()) {
    res.status(401);
    throw new Error('Not authorized');
  }

  // Don't allow deleting default categories
  if (category.isDefault) {
    res.status(400);
    throw new Error('Cannot delete default category');
  }

  // Check if there are transactions using this category
  const transactionCount = await Transaction.countDocuments({
    category: category._id,
  });

  if (transactionCount > 0) {
    res.status(400);
    throw new Error(
      `Cannot delete category with transactions. Please reassign ${transactionCount} transaction(s) first.`
    );
  }

  await category.deleteOne();
  res.json({ message: 'Category removed' });
});

export { getCategories, createCategory, updateCategory, deleteCategory };