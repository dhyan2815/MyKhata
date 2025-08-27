import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import TransactionForm from '../components/TransactionForm';
import VoiceInput from '../components/VoiceInput';
import { createTransaction } from '../api/transactions';
import toast from 'react-hot-toast';
import { Helmet } from 'react-helmet-async';

// AddTransaction page component for adding a new transaction
const AddTransaction = () => {
  const navigate = useNavigate();
  // State to track if the form is submitting
  const [isSubmitting, setIsSubmitting] = useState(false);
  
  // State for voice input
  const [voiceResult, setVoiceResult] = useState(null);

  // Handle voice input results
  const handleVoiceResult = (voiceData) => {
    console.log('Voice input result:', voiceData);
    setVoiceResult(voiceData);
    
    // Show success message
    toast.success('Voice input processed! Form has been auto-filled.');
    
    // Clear voice result after a delay
    setTimeout(() => setVoiceResult(null), 5000);
  };

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
      <Helmet>
        <title>Add Transaction · MyKhata</title>
      </Helmet>
      
      {/* Page header with title, description, and voice input */}
      <div className="flex items-start justify-between">
        <div className="flex-1">
          {/* Page title and description */}
          <h1 className="text-2xl font-bold text-gray-900 dark:text-gray-100">Add Transaction</h1>
          <p className="text-gray-600 dark:text-gray-400 mt-1">
            Create a new financial transaction
          </p>
        </div>
        
        {/* Voice Input on the right side */}
        <div className="ml-6">
          <VoiceInput 
            onVoiceResult={handleVoiceResult}
            disabled={isSubmitting}
          />
        </div>
      </div>

      {/* TransactionForm component for entering transaction details */}
      <TransactionForm 
        onSubmit={handleSubmit} 
        isLoading={isSubmitting}
        voiceResult={voiceResult}
      />
    </div>
  );
};

export default AddTransaction;