import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import TransactionForm from '../components/TransactionForm';
import { createTransaction } from '../api/transactions';
import toast from 'react-hot-toast';

// AddTransaction page component for adding a new transaction
const AddTransaction = () => {
  const navigate = useNavigate();
  // State to track if the form is submitting
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Handle form submission for creating a new transaction
  const handleSubmit = async (formData) => {
    setIsSubmitting(true);
    try {
      // Call API to create the transaction
      await createTransaction(formData);
      toast.success('Transaction added successfully');
      // Navigate to the transactions list after successful creation
      navigate('/transactions');
    } catch (error) {
      // Show error toast if creation fails
      toast.error(error.response?.data?.message || 'Failed to add transaction');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen space-y-6 dark:bg-gray-900 dark:text-white">
      <div>
        {/* Page title and description */}
        <h1 className="text-2xl font-bold text-gray-900 dark:text-gray-100">Add Transaction</h1>
        <p className="text-gray-600 dark:text-gray-400 mt-1">
          Create a new financial transaction
        </p>
      </div>

      {/* TransactionForm component for entering transaction details */}
      <TransactionForm 
        onSubmit={handleSubmit} 
        isLoading={isSubmitting} 
      />
    </div>
  );
};

export default AddTransaction;