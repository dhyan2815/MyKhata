import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import TransactionForm from '../components/TransactionForm';
import VoiceInput from '../components/VoiceInput';
import { createTransaction } from '../api/transactions';
import toast from 'react-hot-toast';
import { Helmet } from 'react-helmet-async';
import { motion } from 'framer-motion';

// AddTransaction page component for adding a new transaction
const AddTransaction = () => {
  const navigate = useNavigate();
  // State to track if the form is submitting
  const [isSubmitting, setIsSubmitting] = useState(false);
  
  // State for voice input
  const [voiceResult, setVoiceResult] = useState(null);
  const [showVoiceConfirmation, setShowVoiceConfirmation] = useState(false);

  // Handle voice input results
  const handleVoiceResult = (voiceData) => {
    console.log('Voice input result:', voiceData);
    setVoiceResult(voiceData);
    
    // Show voice confirmation dialog
    setShowVoiceConfirmation(true);
    
    // Show success message
    toast.success('Voice input processed! Please review and adjust if needed.');
    
    // Clear voice result after a delay
    setTimeout(() => setVoiceResult(null), 5000);
  };

  // Handle voice confirmation
  const handleVoiceConfirmation = () => {
    setShowVoiceConfirmation(false);
    // Speak confirmation
    if ('speechSynthesis' in window) {
      const utterance = new SpeechSynthesisUtterance('Transaction details confirmed. You can now save the transaction.');
      utterance.rate = 0.9;
      window.speechSynthesis.speak(utterance);
    }
  };

  // Handle voice confirmation cancel
  const handleVoiceConfirmationCancel = () => {
    setShowVoiceConfirmation(false);
    setVoiceResult(null);
    // Speak cancellation
    if ('speechSynthesis' in window) {
      const utterance = new SpeechSynthesisUtterance('Voice input cancelled. Please fill the form manually.');
      utterance.rate = 0.9;
      window.speechSynthesis.speak(utterance);
    }
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

      {/* Voice Confirmation Modal */}
      {showVoiceConfirmation && (
        <motion.div 
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          className="bg-white p-4 sm:p-6 rounded-lg shadow-sm border border-gray-200 dark:bg-gray-800 dark:border-gray-700"
        >
          <div className="text-center space-y-4">
            <div className="flex items-center justify-center space-x-2 text-blue-600 dark:text-blue-400">
              <span className="text-lg">🎯</span>
              <span className="font-medium text-lg">Voice Input Detected!</span>
            </div>
            <p className="text-sm text-blue-700 dark:text-blue-300">
              Please review the details below and confirm if they are correct.
            </p>
            
            {/* Voice Result Display */}
            {voiceResult && (
              <div className="p-4 bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg">
                <div className="text-sm text-blue-800 dark:text-blue-300 space-y-2">
                  {voiceResult.amount && <p><span className="font-medium">Amount:</span> ₹{voiceResult.amount}</p>}
                  {voiceResult.type && <p><span className="font-medium">Type:</span> {voiceResult.type}</p>}
                  {voiceResult.category && <p><span className="font-medium">Category:</span> {voiceResult.category}</p>}
                  {voiceResult.date && <p><span className="font-medium">Date:</span> {voiceResult.date}</p>}
                  {voiceResult.description && <p><span className="font-medium">Description:</span> {voiceResult.description}</p>}
                  {voiceResult.categoryId && <p className="text-green-600 font-medium">✓ Category matched automatically</p>}
                </div>
              </div>
            )}
            
            <div className="flex space-x-3 justify-center">
              <button
                type="button"
                onClick={handleVoiceConfirmation}
                className="px-4 py-2 bg-green-500 text-white rounded-lg hover:bg-green-600 transition-colors"
              >
                ✓ Confirm Details
              </button>
              <button
                type="button"
                onClick={handleVoiceConfirmationCancel}
                className="px-4 py-2 bg-red-500 text-white rounded-lg hover:bg-red-600 transition-colors"
              >
                ✗ Cancel & Clear
              </button>
            </div>
          </div>
        </motion.div>
      )}

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