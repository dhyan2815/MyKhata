import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import TransactionForm from '../components/TransactionForm';
import { getTransactionById, updateTransaction } from '../api/transactions';
import toast from 'react-hot-toast';
import { Helmet } from 'react-helmet-async';

const EditTransaction = () => {
  // Get the transaction ID from the URL parameters
  const { id } = useParams();
  // Hook for navigation
  const navigate = useNavigate();
  // State to hold the transaction data
  const [transaction, setTransaction] = useState(null);
  // State to indicate if the transaction is being loaded
  const [isLoading, setIsLoading] = useState(true);
  // State to indicate if the form is being submitted
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    // Fetch the transaction data when the component mounts or the ID changes
    const fetchTransaction = async () => {
      setIsLoading(true);
      try {
        // Attempt to get the transaction by ID
        const data = await getTransactionById(id);
        setTransaction(data);
      } catch (error) {
        // Show error toast and redirect if fetching fails        
        toast.error('Failed to load transaction');
        // toast.error(error.response?.data?.message || 'Failed to load transaction');
        console.log(error.response?.data?.message || 'Failed to load transaction');
        navigate('/transactions');
      } finally {
        setIsLoading(false);
      }
    };

    fetchTransaction();
  }, [id, navigate]);

  // Handle form submission for updating the transaction
  const handleSubmit = async (formData) => {
    setIsSubmitting(true);
    try {
      // Attempt to update the transaction
      await updateTransaction(id, formData);
      toast.success('Transaction updated successfully');
      // Redirect to the transactions list after successful update
      navigate('/transactions');
    } catch (error) {
      // Show error toast if update fails
      toast.error(error.response?.data?.message || 'Failed to update transaction');
    } finally {
      setIsSubmitting(false);
    }
  };

  // Show a loading spinner while fetching transaction data
  if (isLoading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-teal-600"></div>
      </div>
    );
  }

  // Render the edit transaction form with initial data
  return (
    <div className="edit-transaction-page">
      <Helmet>
        <title>Edit Transaction · MyKhata</title>
      </Helmet>
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