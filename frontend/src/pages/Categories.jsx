import { useState, useEffect } from 'react';
import { 
  Edit, 
  Trash2, 
  Plus, 
  Tag, 
  Save, 
  X, 
  ChevronDown, 
  ChevronUp 
} from 'lucide-react';
import { 
  getCategories, 
  createCategory, 
  updateCategory, 
  deleteCategory 
} from '../api/categories';
import toast from 'react-hot-toast';
import { Helmet } from 'react-helmet-async';
import { motion, AnimatePresence } from 'framer-motion';

// Color Picker Component
const ColorPicker = ({ value, onChange, label }) => {
  const [isOpen, setIsOpen] = useState(false);
  const [customHex, setCustomHex] = useState(value);

  // Predefined color palette
  const colorPalette = [
    '#3B82F6', '#EF4444', '#10B981', '#F59E0B',
    '#8B5CF6', '#EC4899', '#6366F1', '#6B7280',
    '#F97316', '#06B6D4', '#84CC16', '#A855F7',
    '#E11D48', '#059669', '#DC2626', '#7C3AED',
    '#DB2777', '#0891B2', '#65A30D', '#9333EA',
    '#BE185D', '#0E7490', '#4D7C0F', '#7E22CE'
  ];

  const handleColorSelect = (color) => {
    onChange(color);
    setCustomHex(color);
    setIsOpen(false);
  };

  const handleHexChange = (e) => {
    const hex = e.target.value;
    setCustomHex(hex);
    
    // Validate hex color format
    if (/^#([A-Fa-f0-9]{6}|[A-Fa-f0-9]{3})$/.test(hex)) {
      onChange(hex);
    }
  };

  const handleHexBlur = () => {
    // If invalid hex, revert to current value
    if (!/^#([A-Fa-f0-9]{6}|[A-Fa-f0-9]{3})$/.test(customHex)) {
      setCustomHex(value);
    }
  };

  // Update customHex when value changes externally
  useEffect(() => {
    setCustomHex(value);
  }, [value]);

  return (
    <div className="relative">
      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
        {label}
      </label>
      
      {/* Color display and dropdown trigger */}
      <div
        onClick={() => setIsOpen(!isOpen)}
        className="input cursor-pointer flex items-center justify-between dark:bg-gray-700 dark:text-white hover:border-blue-500 transition-colors"
      >
        <div className="flex items-center space-x-3">
          <div
            className="w-6 h-6 rounded-full border-2 border-gray-300 dark:border-gray-500 shadow-sm"
            style={{ backgroundColor: value }}
          />
          <span className="text-sm font-mono uppercase">{value}</span>
        </div>
        {isOpen ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
      </div>

      {/* Color picker dropdown */}
      {isOpen && (
        <div className="absolute z-50 mt-1 w-full bg-white dark:bg-gray-700 border border-gray-200 dark:border-gray-600 rounded-lg shadow-xl p-4 animate-fadeIn">
          {/* Color palette grid */}
          <div className="mb-4">
            <p className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-3">
              Choose from palette:
            </p>
            <div className="grid grid-cols-8 gap-2">
              {colorPalette.map((color) => (
                <button
                  key={color}
                  type="button"
                  onClick={() => handleColorSelect(color)}
                  className={`w-8 h-8 rounded-full border-2 hover:scale-110 transition-all duration-200 shadow-sm ${
                    value === color 
                      ? 'border-gray-800 dark:border-gray-200 ring-2 ring-blue-400 scale-110' 
                      : 'border-gray-300 dark:border-gray-500 hover:border-gray-400'
                  }`}
                  style={{ backgroundColor: color }}
                  title={color}
                />
              ))}
            </div>
          </div>

          {/* Custom hex input */}
          <div className="border-t border-gray-200 dark:border-gray-600 pt-4">
            <p className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Or enter hex code:
            </p>
            <div className="flex space-x-2">
              <input
                type="text"
                value={customHex}
                onChange={handleHexChange}
                onBlur={handleHexBlur}
                placeholder="#000000"
                className="flex-1 px-3 py-2 text-sm border border-gray-300 dark:border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-600 dark:text-white font-mono uppercase"
                maxLength={7}
              />
              <button
                type="button"
                onClick={() => handleColorSelect(customHex)}
                disabled={!/^#([A-Fa-f0-9]{6}|[A-Fa-f0-9]{3})$/.test(customHex)}
                className="px-4 py-2 text-sm bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:bg-gray-400 disabled:cursor-not-allowed transition-colors"
              >
                Apply
              </button>
            </div>
            {!/^#([A-Fa-f0-9]{6}|[A-Fa-f0-9]{3})$/.test(customHex) && customHex !== value && (
              <p className="text-xs text-red-500 mt-1">
                Please enter a valid hex color code (e.g., #FF0000)
              </p>
            )}
          </div>

          {/* Close button */}
          <div className="flex justify-end mt-4 pt-4 border-t border-gray-200 dark:border-gray-600">
            <button
              type="button"
              onClick={() => setIsOpen(false)}
              className="px-4 py-2 text-sm bg-gray-100 dark:bg-gray-600 text-gray-700 dark:text-gray-300 rounded-md hover:bg-gray-200 dark:hover:bg-gray-500 transition-colors"
            >
              Close
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

// Categories page component for managing income and expense categories
const Categories = () => {
  // State to store all categories
  const [categories, setCategories] = useState([]);
  // State to indicate if categories are loading
  const [loading, setLoading] = useState(true);
  // State to track selected type (income/expense)
  const [selectedType, setSelectedType] = useState('expense');
  // State to track the category being edited
  const [editingCategory, setEditingCategory] = useState(null);
  // State for form data (add/edit)
  const [formData, setFormData] = useState({
    name: '',
    type: 'expense',
    color: '#3B82F6',
    icon: 'tag'
  });
  // State to show/hide the form
  const [showForm, setShowForm] = useState(false);

  // Icon options for category selection
  const iconOptions = [
    { name: 'Tag', value: 'tag' },
    { name: 'Home', value: 'home' },
    { name: 'Car', value: 'car' },
    { name: 'Food', value: 'utensils' },
    { name: 'Shopping', value: 'shopping-bag' },
    { name: 'Health', value: 'heart' },
    { name: 'Entertainment', value: 'film' },
    { name: 'Education', value: 'book' },
    { name: 'Travel', value: 'plane' },
    { name: 'Bills', value: 'file-text' },
    { name: 'Salary', value: 'briefcase' },
    { name: 'Investment', value: 'trending-up' },
    { name: 'Other', value: 'more-horizontal' },
  ];

  // Load categories from API on mount
  useEffect(() => {
    const fetchCategories = async () => {
      setLoading(true);
      try {
        const data = await getCategories();
        setCategories(data);
      } catch (error) {
        toast.error('Failed to load categories');
      } finally {
        setLoading(false);
      }
    };

    fetchCategories();
  }, []);

  // Filter categories by selected type (income/expense)
  const filteredCategories = categories.filter(
    category => category.type === selectedType
  );

  // Handle input changes in the form
  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData({
      ...formData,
      [name]: value
    });
  };

  // Handle color change from ColorPicker
  const handleColorChange = (color) => {
    setFormData({
      ...formData,
      color: color
    });
  };

  // Handle form submission for add/edit category
  const handleSubmit = async (e) => {
    e.preventDefault();
    
    try {
      if (editingCategory) {
        // Update existing category
        const updated = await updateCategory(editingCategory._id, formData);
        setCategories(categories.map(cat => 
          cat._id === editingCategory._id ? updated : cat
        ));
        toast.success('Category updated successfully');
      } else {
        // Create new category
        const newCategory = await createCategory(formData);
        setCategories([...categories, newCategory]);
        toast.success('Category created successfully');
      }
      
      // Reset form after submit
      setFormData({
        name: '',
        type: selectedType,
        color: '#3B82F6',
        icon: 'tag'
      });
      setEditingCategory(null);
      setShowForm(false);
    } catch (error) {
      toast.error(error.response?.data?.message || 'Error saving category');
    }
  };

  // Handle edit button click
  const handleEdit = (category) => {
    setEditingCategory(category);
    setFormData({
      name: category.name,
      type: category.type,
      color: category.color,
      icon: category.icon
    });
    setShowForm(true);
  };

  // Handle delete button click
  const handleDelete = async (id) => {
    if (window.confirm('Are you sure you want to delete this category?')) {
      try {
        await deleteCategory(id);
        setCategories(categories.filter(cat => cat._id !== id));
        toast.success('Category deleted successfully');
      } catch (error) {
        toast.error(error.response?.data?.message || 'Failed to delete category');
      }
    }
  };

  // Cancel editing or adding a category
  const cancelEdit = () => {
    setEditingCategory(null);
    setFormData({
      name: '',
      type: selectedType,
      color: '#3B82F6',
      icon: 'tag'
    });
    setShowForm(false);
  };

  return (
    <motion.div 
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4 }}
      className="min-h-screen space-y-4 sm:space-y-6 p-3 sm:p-5 rounded-lg dark:bg-gray-800 dark:text-white"
    >
      <Helmet>
        <title>Categories · MyKhata</title>
      </Helmet>
      
      {/* Header section with title and add button */}
      <motion.div 
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3, delay: 0.1 }}
        className="flex flex-col sm:flex-row sm:items-center sm:justify-between space-y-3 sm:space-y-0"
      >
        <div>
          <h1 className="text-xl sm:text-2xl font-bold text-gray-900 dark:text-gray-100">Categories</h1>
          <p className="text-sm sm:text-base text-gray-600 mt-1 dark:text-gray-300">
            Manage your income and expense categories
          </p>
        </div>
        <button
          onClick={() => {
            setEditingCategory(null);
            setFormData({
              name: '',
              type: selectedType,
              color: '#3B82F6',
              icon: 'tag'
            });
            setShowForm(!showForm);
          }}
          className="btn btn-primary bg-blue-600 hover:bg-blue-700 dark:bg-blue-500 dark:hover:bg-blue-600"
        >
          <Plus size={16} className="mr-2" />
          Add Category
        </button>
      </motion.div>

      {/* Category form for add/edit */}
      <AnimatePresence>
        {showForm && (
          <motion.div 
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            transition={{ duration: 0.3 }}
            className="bg-white p-4 sm:p-6 rounded-lg shadow-sm border border-gray-200 dark:bg-gray-700 dark:border-gray-600"
          >
            <h2 className="text-base sm:text-lg font-medium text-gray-900 dark:text-gray-100 mb-3 sm:mb-4">
              {editingCategory ? 'Edit Category' : 'Add New Category'}
            </h2>
            <form onSubmit={handleSubmit} className="space-y-3 sm:space-y-4">
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-3 sm:gap-4">
                {/* Category Name input */}
                <div>
                  <label htmlFor="name" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    Category Name
                  </label>
                  <input
                    type="text"
                    id="name"
                    name="name"
                    value={formData.name}
                    onChange={handleInputChange}
                    className="input dark:bg-gray-700 dark:text-white"
                    required
                  />
                </div>
                
                {/* Type select (income/expense) */}
                <div>
                  <label htmlFor="type" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    Type
                  </label>
                  <select
                    id="type"
                    name="type"
                    value={formData.type}
                    onChange={handleInputChange}
                    className="input dark:bg-gray-700 dark:text-white"
                    disabled={editingCategory?.isDefault}
                  >
                    <option value="income">Income</option>
                    <option value="expense">Expense</option>
                  </select>
                  {editingCategory?.isDefault && (
                    <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                      Type cannot be changed for default categories
                    </p>
                  )}
                </div>
                
                {/* Enhanced Color Picker */}
                <ColorPicker
                  value={formData.color}
                  onChange={handleColorChange}
                  label="Color"
                />
                
                {/* Icon select */}
                <div>
                  <label htmlFor="icon" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    Icon
                  </label>
                  <select
                    id="icon"
                    name="icon"
                    value={formData.icon}
                    onChange={handleInputChange}
                    className="input dark:bg-gray-700 dark:text-white"
                  >
                    {iconOptions.map(icon => (
                      <option key={icon.value} value={icon.value}>
                        {icon.name}
                      </option>
                    ))}
                  </select>
                </div>
              </div>
              
              {/* Form action buttons */}
              <div className="flex justify-end space-x-3">
                <button
                  type="button"
                  onClick={cancelEdit}
                  className="btn btn-secondary dark:bg-gray-600 dark:hover:bg-gray-500"
                >
                  <X size={16} className="mr-2" />
                  Cancel
                </button>
                <button type="submit" className="btn btn-primary bg-blue-600 hover:bg-blue-700 dark:bg-blue-500 dark:hover:bg-blue-600">
                  <Save size={16} className="mr-2" />
                  {editingCategory ? 'Update' : 'Save'}
                </button>
              </div>
            </form>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Category list section */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden dark:bg-gray-700 dark:border-gray-600">
        {/* Tabs for switching between expense and income categories */}
        <div className="p-4 border-b border-gray-200 dark:border-gray-600">
          <div className="flex">
            <button
              className={`px-4 py-2 rounded-l-md transition-colors ${
                selectedType === 'expense' 
                  ? 'bg-teal-600 text-white' 
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200 dark:bg-gray-600 dark:text-white dark:hover:bg-gray-500'
              }`}
              onClick={() => setSelectedType('expense')}
            >
              Expense Categories
            </button>
            <button
              className={`px-4 py-2 rounded-r-md transition-colors ${
                selectedType === 'income' 
                  ? 'bg-teal-600 text-white' 
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200 dark:bg-gray-600 dark:text-white dark:hover:bg-gray-500'
              }`}
              onClick={() => setSelectedType('income')}
            >
              Income Categories
            </button>
          </div>
        </div>

        {/* Loading skeleton while fetching categories */}
        {loading ? (
          <div className="p-6 animate-pulse space-y-4">
            {[1, 2, 3, 4].map(i => (
              <div key={i} className="flex items-center justify-between">
                <div className="flex items-center">
                  <div className="w-8 h-8 bg-gray-200 rounded-full dark:bg-gray-600"></div>
                  <div className="ml-4 w-24 h-4 bg-gray-200 rounded dark:bg-gray-600"></div>
                </div>
                <div className="w-16 h-4 bg-gray-200 rounded dark:bg-gray-600"></div>
              </div>
            ))}
          </div>
        ) : (
          // Category list
          <ul className="divide-y divide-gray-200 dark:divide-gray-600">
            {filteredCategories.length > 0 ? (
              filteredCategories.map(category => (
                <motion.li 
                  key={category._id}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ duration: 0.3 }}
                  className="p-4 hover:bg-gray-50 flex items-center justify-between dark:hover:bg-gray-600 transition-colors"
                >
                  <div className="flex items-center">
                    {/* Category icon with color */}
                    <div 
                      className="w-8 h-8 rounded-full flex items-center justify-center text-white shadow-sm"
                      style={{ backgroundColor: category.color }}
                    >
                      <Tag size={14} />
                    </div>
                    {/* Category name */}
                    <span className="ml-4 text-gray-900 font-medium dark:text-gray-100">
                      {category.name}
                    </span>
                    {/* Default badge */}
                    {category.isDefault && (
                      <span className="ml-2 px-2 py-0.5 bg-gray-100 text-gray-500 text-xs rounded-full dark:bg-gray-800 dark:text-gray-400">
                        Default
                      </span>
                    )}
                  </div>
                  {/* Edit and Delete buttons */}
                  <div className="flex items-center space-x-2">
                    <button
                      onClick={() => handleEdit(category)}
                      className="p-1 text-blue-600 hover:text-blue-800 dark:text-blue-400 dark:hover:text-blue-600 transition-colors"
                      title="Edit category"
                    >
                      <Edit size={16} />
                    </button>
                    {/* Only allow delete if not a default category */}
                    {!category.isDefault && (
                      <button
                        onClick={() => handleDelete(category._id)}
                        className="p-1 text-red-600 hover:text-red-800 dark:text-red-400 dark:hover:text-red-600 transition-colors"
                        title="Delete category"
                      >
                        <Trash2 size={16} />
                      </button>
                    )}
                  </div>
                </motion.li>
              ))
            ) : (
              // No categories found message
              <li className="p-6 text-center text-gray-500 dark:text-gray-400">
                No {selectedType} categories found
              </li>
            )}
          </ul>
        )}
      </div>
    </motion.div>
  );
};

export default Categories;