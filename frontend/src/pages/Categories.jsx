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

const Categories = () => {
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedType, setSelectedType] = useState('expense');
  const [editingCategory, setEditingCategory] = useState(null);
  const [formData, setFormData] = useState({
    name: '',
    type: 'expense',
    color: '#3B82F6',
    icon: 'tag'
  });
  const [showForm, setShowForm] = useState(false);

  // Color options
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

  // Icon options
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

  // Load categories
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

  const filteredCategories = categories.filter(
    category => category.type === selectedType
  );

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData({
      ...formData,
      [name]: value
    });
  };

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
      
      // Reset form
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
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between space-y-4 sm:space-y-0">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Categories</h1>
          <p className="text-gray-600 mt-1">
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
          className="btn btn-primary"
        >
          <Plus size={16} className="mr-2" />
          Add Category
        </button>
      </div>

      {showForm && (
        <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200 animate-fadeIn">
          <h2 className="text-lg font-medium text-gray-900 mb-4">
            {editingCategory ? 'Edit Category' : 'Add New Category'}
          </h2>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label htmlFor="name" className="block text-sm font-medium text-gray-700 mb-1">
                  Category Name
                </label>
                <input
                  type="text"
                  id="name"
                  name="name"
                  value={formData.name}
                  onChange={handleInputChange}
                  className="input"
                  required
                />
              </div>
              <div>
                <label htmlFor="type" className="block text-sm font-medium text-gray-700 mb-1">
                  Type
                </label>
                <select
                  id="type"
                  name="type"
                  value={formData.type}
                  onChange={handleInputChange}
                  className="input"
                  disabled={editingCategory?.isDefault}
                >
                  <option value="income">Income</option>
                  <option value="expense">Expense</option>
                </select>
                {editingCategory?.isDefault && (
                  <p className="text-xs text-gray-500 mt-1">
                    Type cannot be changed for default categories
                  </p>
                )}
              </div>
              <div>
                <label htmlFor="color" className="block text-sm font-medium text-gray-700 mb-1">
                  Color
                </label>
                <select
                  id="color"
                  name="color"
                  value={formData.color}
                  onChange={handleInputChange}
                  className="input"
                >
                  {colorOptions.map(color => (
                    <option key={color.value} value={color.value}>
                      {color.name}
                    </option>
                  ))}
                </select>
                <div 
                  className="w-full h-2 mt-1 rounded-full"
                  style={{ backgroundColor: formData.color }}
                ></div>
              </div>
              <div>
                <label htmlFor="icon" className="block text-sm font-medium text-gray-700 mb-1">
                  Icon
                </label>
                <select
                  id="icon"
                  name="icon"
                  value={formData.icon}
                  onChange={handleInputChange}
                  className="input"
                >
                  {iconOptions.map(icon => (
                    <option key={icon.value} value={icon.value}>
                      {icon.name}
                    </option>
                  ))}
                </select>
              </div>
            </div>
            <div className="flex justify-end space-x-3">
              <button
                type="button"
                onClick={cancelEdit}
                className="btn btn-secondary"
              >
                <X size={16} className="mr-2" />
                Cancel
              </button>
              <button type="submit" className="btn btn-primary">
                <Save size={16} className="mr-2" />
                {editingCategory ? 'Update' : 'Save'}
              </button>
            </div>
          </form>
        </div>
      )}

      <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
        <div className="p-4 border-b border-gray-200">
          <div className="flex">
            <button
              className={`px-4 py-2 rounded-l-md ${
                selectedType === 'expense'
                  ? 'bg-teal-600 text-white'
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
              onClick={() => setSelectedType('expense')}
            >
              Expense Categories
            </button>
            <button
              className={`px-4 py-2 rounded-r-md ${
                selectedType === 'income'
                  ? 'bg-teal-600 text-white'
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
              onClick={() => setSelectedType('income')}
            >
              Income Categories
            </button>
          </div>
        </div>

        {loading ? (
          <div className="p-6 animate-pulse space-y-4">
            {[1, 2, 3, 4].map(i => (
              <div key={i} className="flex items-center justify-between">
                <div className="flex items-center">
                  <div className="w-8 h-8 bg-gray-200 rounded-full"></div>
                  <div className="ml-4 w-24 h-4 bg-gray-200 rounded"></div>
                </div>
                <div className="w-16 h-4 bg-gray-200 rounded"></div>
              </div>
            ))}
          </div>
        ) : (
          <ul className="divide-y divide-gray-200">
            {filteredCategories.length > 0 ? (
              filteredCategories.map(category => (
                <li 
                  key={category._id} 
                  className="p-4 hover:bg-gray-50 flex items-center justify-between"
                >
                  <div className="flex items-center">
                    <div 
                      className="w-8 h-8 rounded-full flex items-center justify-center text-white"
                      style={{ backgroundColor: category.color }}
                    >
                      <Tag size={14} />
                    </div>
                    <span className="ml-4 text-gray-900 font-medium">
                      {category.name}
                    </span>
                    {category.isDefault && (
                      <span className="ml-2 px-2 py-0.5 bg-gray-100 text-gray-500 text-xs rounded-full">
                        Default
                      </span>
                    )}
                  </div>
                  <div className="flex items-center space-x-2">
                    <button
                      onClick={() => handleEdit(category)}
                      className="p-1 text-blue-600 hover:text-blue-800"
                    >
                      <Edit size={16} />
                    </button>
                    {!category.isDefault && (
                      <button
                        onClick={() => handleDelete(category._id)}
                        className="p-1 text-red-600 hover:text-red-800"
                      >
                        <Trash2 size={16} />
                      </button>
                    )}
                  </div>
                </li>
              ))
            ) : (
              <li className="p-6 text-center text-gray-500">
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