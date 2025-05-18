import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import TransactionForm from '../components/TransactionForm';
import { getTransactionById, updateTransaction } from '../api/transactions';
import toast from 'react-hot-toast';

const EditTransaction = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [transaction, setTransaction] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    const fetchTransaction = async () => {
      setIsLoading(true);
      try {
        const data = await getTransactionById(id);
        setTransaction(data);
      } catch (error) {
        toast.error(error.response?.data?.message || 'Failed to load transaction');
        navigate('/transactions');
      } finally {
        setIsLoading(false);
      }
    };

    fetchTransaction();
  }, [id, navigate]);

  const handleSubmit = async (formData) => {
    setIsSubmitting(true);
    try {
      await updateTransaction(id, formData);
      toast.success('Transaction updated successfully');
      navigate('/transactions');
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to update transaction');
    } finally {
      setIsSubmitting(false);
    }
  };

  if (isLoading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-teal-600"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6 min-h-screen">
      <div>
        <h1 className="text-2xl font-bold text-white">Edit Transaction</h1>
        <p className="text-gray-400 mt-1">
          Update your transaction details
        </p>
      </div>

      {transaction && (
        <TransactionForm 
          initialData={transaction} 
          onSubmit={handleSubmit} 
          isLoading={isSubmitting} 
        />
      )}
    </div>
  );
};

export default EditTransaction;