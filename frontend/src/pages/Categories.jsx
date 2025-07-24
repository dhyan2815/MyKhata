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

  // Color options for category selection
  const colorOptions = [
    { name: 'Blue', value: '#3B82F6' },
    { name: 'Red', value: '#EF4444' },
    { name: 'Green', value: '#10B981' },
    { name: 'Yellow', value: '#F59E0B' },
    { name: 'Purple', value: '#8B5CF6' },
    { name: 'Pink', value: '#EC4899' },
    { name: 'Indigo', value: '#6366F1' },
    { name: 'Gray', value: '#6B7280' },
  ];

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
    <div className="min-h-screen space-y-6 p-5 rounded-lg dark:bg-gray-800 dark:text-white">
      <Helmet>
        <title>Categories · MyKhata</title>
      </Helmet>
      {/* Header section with title and add button */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between space-y-4 sm:space-y-0">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-gray-100">Categories</h1>
          <p className="text-gray-600 mt-1 dark:text-gray-300">
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
      </div>

      {/* Category form for add/edit */}
      {showForm && (
        <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200 animate-fadeIn dark:bg-gray-700 dark:border-gray-600">
          <h2 className="text-lg font-medium text-gray-900 dark:text-gray-100 mb-4">
            {editingCategory ? 'Edit Category' : 'Add New Category'}
          </h2>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
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
              {/* Color select */}
              <div>
                <label htmlFor="color" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Color
                </label>
                <select
                  id="color"
                  name="color"
                  value={formData.color}
                  onChange={handleInputChange}
                  className="input dark:bg-gray-700 dark:text-white"
                >
                  {colorOptions.map(color => (
                    <option key={color.value} value={color.value}>
                      {color.name}
                    </option>
                  ))}
                </select>
                {/* Color preview bar */}
                <div 
                  className="w-full h-2 mt-1 rounded-full"
                  style={{ backgroundColor: formData.color }}
                ></div>
              </div>
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
        </div>
      )}

      {/* Category list section */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden dark:bg-gray-700 dark:border-gray-600">
        {/* Tabs for switching between expense and income categories */}
        <div className="p-4 border-b border-gray-200 dark:border-gray-600">
          <div className="flex">
            <button
              className={`px-4 py-2 rounded-l-md ${selectedType === 'expense' ? 'bg-teal-600 text-white' : 'bg-gray-100 text-gray-700 hover:bg-gray-200 dark:bg-gray-600 dark:text-white dark:hover:bg-gray-500'}`}
              onClick={() => setSelectedType('expense')}
            >
              Expense Categories
            </button>
            <button
              className={`px-4 py-2 rounded-r-md ${selectedType === 'income' ? 'bg-teal-600 text-white' : 'bg-gray-100 text-gray-700 hover:bg-gray-200 dark:bg-gray-600 dark:text-white dark:hover:bg-gray-500'}`}
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
                <li 
                  key={category._id} 
                  className="p-4 hover:bg-gray-50 flex items-center justify-between dark:hover:bg-gray-600"
                >
                  <div className="flex items-center">
                    {/* Category icon with color */}
                    <div 
                      className="w-8 h-8 rounded-full flex items-center justify-center text-white"
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
                      className="p-1 text-blue-600 hover:text-blue-800 dark:text-blue-400 dark:hover:text-blue-600"
                    >
                      <Edit size={16} />
                    </button>
                    {/* Only allow delete if not a default category */}
                    {!category.isDefault && (
                      <button
                        onClick={() => handleDelete(category._id)}
                        className="p-1 text-red-600 hover:text-red-800 dark:text-red-400 dark:hover:text-red-600"
                      >
                        <Trash2 size={16} />
                      </button>
                    )}
                  </div>
                </li>
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
    </div>
  );
};

export default Categories;