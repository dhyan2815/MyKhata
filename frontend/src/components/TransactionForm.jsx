import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  ChevronDown, 
  Calendar,
  IndianRupee,
  Tag,
  AlignLeft,
  Plus
} from 'lucide-react';
import { getCategories } from '../api/categories';
import toast from 'react-hot-toast';

const TransactionForm = ({ 
  initialData = null, 
  onSubmit, 
  isLoading = false 
}) => {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    type: initialData?.type || 'expense',
    amount: initialData?.amount || '',
    category: initialData?.category?._id || '',
    description: initialData?.description || '',
    date: initialData?.date 
      ? new Date(initialData.date).toISOString().split('T')[0]
      : new Date().toISOString().split('T')[0],
  });
  
  const [categories, setCategories] = useState([]);
  const [loadingCategories, setLoadingCategories] = useState(false);
  
  useEffect(() => {
    const loadCategories = async () => {
      setLoadingCategories(true);
      try {
        const categoryData = await getCategories(formData.type);
        setCategories(categoryData);
      } catch (error) {
        toast.error('Failed to load categories');
      } finally {
        setLoadingCategories(false);
      }
    };
    
    loadCategories();
  }, [formData.type]);
  
  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
  };
  
  const handleTypeChange = (type) => {
    setFormData({ ...formData, type, category: '' });
  };
  
  const handleSubmit = (e) => {
    e.preventDefault();
    
    // Validate form
    if (!formData.amount || formData.amount <= 0) {
      return toast.error('Please enter a valid amount');
    }
    
    if (!formData.category) {
      return toast.error('Please select a category');
    }
    
    if (!formData.description) {
      return toast.error('Please enter a description');
    }
    
    // Format data for submission
    const submissionData = {
      ...formData,
      amount: parseFloat(formData.amount),
      date: new Date(formData.date).toISOString(),
    };
    
    onSubmit(submissionData);
  };
  
  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
        <div className="flex flex-col space-y-4">
          {/* Transaction Type */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Transaction Type
            </label>
            <div className="flex w-full rounded-md overflow-hidden border border-gray-300">
              <button
                type="button"
                className={`flex-1 py-2 px-4 text-sm font-medium text-center ${
                  formData.type === 'expense'
                    ? 'bg-red-500 text-white'
                    : 'bg-white text-gray-700 hover:bg-gray-50'
                }`}
                onClick={() => handleTypeChange('expense')}
              >
                Expense
              </button>
              <button
                type="button"
                className={`flex-1 py-2 px-4 text-sm font-medium text-center ${
                  formData.type === 'income'
                    ? 'bg-green-500 text-white'
                    : 'bg-white text-gray-700 hover:bg-gray-50'
                }`}
                onClick={() => handleTypeChange('income')}
              >
                Income
              </button>
            </div>
          </div>
          
          {/* Amount */}
          <div>
            <label htmlFor="amount" className="block text-sm font-medium text-gray-700 mb-1">
              Amount
            </label>
            <div className="relative rounded-md shadow-sm">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <IndianRupee size={16} className="text-gray-400" />
              </div>
              <input
                type="number"
                id="amount"
                name="amount"
                placeholder="0.00"
                step="0.01"
                min="0"
                className="input pl-10"
                value={formData.amount}
                onChange={handleChange}
                required
              />
            </div>
          </div>
          
          {/* Category */}
          <div>
            <label htmlFor="category" className="block text-sm font-medium text-gray-700 mb-1">
              Category
            </label>
            <div className="relative rounded-md shadow-sm">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <Tag size={16} className="text-gray-400" />
              </div>
              <select
                id="category"
                name="category"
                className="input pl-10 appearance-none"
                value={formData.category}
                onChange={handleChange}
                required
                disabled={loadingCategories}
              >
                <option value="">Select a category</option>
                {categories.map((category) => (
                  <option key={category._id} value={category._id}>
                    {category.name}
                  </option>
                ))}
              </select>
              <div className="absolute inset-y-0 right-0 flex items-center pr-2 pointer-events-none">
                <ChevronDown size={16} className="text-gray-400" />
              </div>
            </div>
          </div>
          
          {/* Description */}
          <div>
            <label htmlFor="description" className="block text-sm font-medium text-gray-700 mb-1">
              Description
            </label>
            <div className="relative rounded-md shadow-sm">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <AlignLeft size={16} className="text-gray-400" />
              </div>
              <input
                type="text"
                id="description"
                name="description"
                placeholder="What was this transaction for?"
                className="input pl-10"
                value={formData.description}
                onChange={handleChange}
                required
              />
            </div>
          </div>
          
          {/* Date */}
          <div>
            <label htmlFor="date" className="block text-sm font-medium text-gray-700 mb-1">
              Date
            </label>
            <div className="relative rounded-md shadow-sm">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <Calendar size={16} className="text-gray-400" />
              </div>
              <input
                type="date"
                id="date"
                name="date"
                className="input pl-10"
                value={formData.date}
                onChange={handleChange}
                required
              />
            </div>
          </div>
        </div>
      </div>
      
      <div className="flex space-x-4 justify-end">
        <button
          type="button"
          className="btn btn-secondary"
          onClick={() => navigate(-1)}
          disabled={isLoading}
        >
          Cancel
        </button>
        <button
          type="submit"
          className="btn btn-primary"
          disabled={isLoading}
        >
          {isLoading ? (
            <span className="flex items-center">
              <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
              </svg>
              Processing...
            </span>
          ) : (
            <span className="flex items-center">
              <Plus size={16} className="mr-2" />
              {initialData ? 'Update Transaction' : 'Add Transaction'}
            </span>
          )}
        </button>
      </div>
    </form>
  );
};

export default TransactionForm;