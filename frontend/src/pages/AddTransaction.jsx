import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import TransactionForm from '../components/TransactionForm';
import { createTransaction } from '../api/transactions';
import toast from 'react-hot-toast';

const AddTransaction = () => {
  const navigate = useNavigate();
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (formData) => {
    setIsSubmitting(true);
    try {
      await createTransaction(formData);
      toast.success('Transaction added successfully');
      navigate('/transactions');
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to add transaction');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen space-y-6 dark:bg-gray-900 dark:text-white">
      <div>
        <h1 className="text-2xl font-bold text-gray-900 dark:text-gray-100">Add Transaction</h1>
        <p className="text-gray-600 dark:text-gray-400 mt-1">
          Create a new financial transaction
        </p>
      </div>

      <TransactionForm 
        onSubmit={handleSubmit} 
        isLoading={isSubmitting} 
      />
    </div>
  );
};

export default AddTransaction;