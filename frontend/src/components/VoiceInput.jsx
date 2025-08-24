import { useState, useEffect, useRef } from 'react';
import { Mic, MicOff } from 'lucide-react';
import toast from 'react-hot-toast';

const VoiceInput = ({ onVoiceResult, disabled = false, categories = [] }) => {
  const [isListening, setIsListening] = useState(false);
  const [transcript, setTranscript] = useState('');
  const [error, setError] = useState('');
  const recognitionRef = useRef(null);

  // Initialize speech recognition
  useEffect(() => {
    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    
    if (SpeechRecognition) {
      recognitionRef.current = new SpeechRecognition();
      recognitionRef.current.continuous = false;
      recognitionRef.current.interimResults = false;
      recognitionRef.current.lang = 'en-US';
      
      // Event handlers
      recognitionRef.current.onstart = () => {
        console.log('🎤 Voice recognition started');
        setIsListening(true);
        setError('');
        setTranscript('');
      };
      
      recognitionRef.current.onresult = (event) => {
        if (event.results && event.results.length > 0) {
          const result = event.results[0][0].transcript;
          console.log('🎯 Transcript:', result);
          setTranscript(result);
          handleVoiceCommand(result);
        }
      };
      
      recognitionRef.current.onerror = (event) => {
        console.error('❌ Voice recognition error:', event.error);
        let errorMessage = 'Voice recognition failed';
        
        switch (event.error) {
          case 'no-speech':
            errorMessage = 'No speech detected. Please try again.';
            break;
          case 'audio-capture':
            errorMessage = 'Microphone access denied. Please check permissions.';
            break;
          case 'not-allowed':
            errorMessage = 'Microphone permission denied. Please allow access.';
            break;
          default:
            errorMessage = `Voice recognition error: ${event.error}`;
        }
        
        setError(errorMessage);
        setIsListening(false);
        toast.error(errorMessage);
      };
      
      recognitionRef.current.onend = () => {
        console.log('🛑 Voice recognition ended');
        setIsListening(false);
      };
    }
  }, []);

  // Handle voice command parsing
  const handleVoiceCommand = (command) => {
    const lowerCommand = command.toLowerCase();
    
    // Parse amount
    const amountMatch = lowerCommand.match(/(?:₹|rs|rupees?|inr|dollars?|usd|euros?|eur)?\s*(\d+(?:\.\d{1,2})?)/i);
    const amount = amountMatch ? parseFloat(amountMatch[1]) : null;
    
    // Parse transaction type
    const isExpense = lowerCommand.includes('expense') || lowerCommand.includes('spent') || lowerCommand.includes('paid');
    const isIncome = lowerCommand.includes('income') || lowerCommand.includes('earned') || lowerCommand.includes('received');
    const type = isExpense ? 'expense' : isIncome ? 'income' : null;
    
    // Parse category
    let detectedCategory = null;
    let detectedCategoryId = null;
    
    if (Array.isArray(categories) && categories.length > 0) {
      for (const cat of categories) {
        if (cat && cat.name && cat._id) {
          const categoryName = cat.name.toLowerCase();
          if (lowerCommand.includes(categoryName)) {
            detectedCategory = cat.name;
            detectedCategoryId = cat._id;
            break;
          }
        }
      }
    }
    
    // Parse date
    const dateKeywords = {
      'yesterday': () => {
        const date = new Date();
        date.setDate(date.getDate() - 1);
        return date.toISOString().split('T')[0];
      },
      'today': () => new Date().toISOString().split('T')[0]
    };
    
    let detectedDate = null;
    for (const [keyword, dateFn] of Object.entries(dateKeywords)) {
      if (lowerCommand.includes(keyword)) {
        detectedDate = dateFn();
        break;
      }
    }
    
    // Parse description (simplified)
    let description = command;
    if (amount) description = description.replace(amountMatch[0], '').trim();
    if (detectedCategory) description = description.replace(new RegExp(detectedCategory, 'gi'), '').trim();
    if (detectedDate) {
      Object.keys(dateKeywords).forEach(keyword => {
        description = description.replace(new RegExp(keyword, 'gi'), '').trim();
      });
    }
    description = description.replace(/\s+/g, ' ').trim();
    
    // Pass parsed data to parent
    onVoiceResult({
      amount,
      type,
      category: detectedCategory,
      categoryId: detectedCategoryId,
      description,
      date: detectedDate,
      rawCommand: command
    });
  };

  // Start listening
  const startListening = () => {
    if (!recognitionRef.current) {
      toast.error('Voice recognition not available. Please refresh the page.');
      return;
    }
    
    if (isListening) {
      stopListening();
      return;
    }
    
    try {
      recognitionRef.current.start();
    } catch (error) {
      console.error('Failed to start voice recognition:', error);
      toast.error('Failed to start voice recognition');
    }
  };

  // Stop listening
  const stopListening = () => {
    if (recognitionRef.current && isListening) {
      recognitionRef.current.stop();
    }
  };

  // Check if supported
  if (!recognitionRef.current) {
    return (
      <div className="text-center p-4">
        <div className="text-2xl">🎤</div>
        <p className="text-sm text-gray-500 dark:text-gray-400">
          Voice recognition is not supported in this browser.
        </p>
        <p className="text-xs text-gray-400 dark:text-gray-500">
          Please use Chrome, Edge, or Safari for voice features.
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-3">
      {/* Voice Input Button */}
      <div className="flex items-center justify-center">
        <button
          type="button"
          onClick={startListening}
          disabled={disabled}
          className={`relative p-4 rounded-full transition-all duration-200 ${
            isListening
              ? 'bg-red-500 text-white shadow-lg scale-110 animate-pulse'
              : 'bg-blue-500 text-white hover:bg-blue-600 hover:scale-105'
          } ${disabled ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'}`}
          title={isListening ? 'Click to stop listening' : 'Click to start voice input'}
        >
          {isListening ? (
            <MicOff size={24} className="animate-pulse" />
          ) : (
            <Mic size={24} />
          )}
        </button>
      </div>

      {/* Status */}
      <div className="text-center space-y-2">
        {isListening && (
          <div className="flex items-center justify-center space-x-2 text-blue-600 dark:text-blue-400">
            <div className="w-2 h-2 bg-blue-600 rounded-full animate-pulse"></div>
            <span className="text-sm font-medium">Listening... Speak now!</span>
          </div>
        )}
        
        {!isListening && (
          <div className="text-sm text-gray-600 dark:text-gray-400">
            <p>Click the microphone and say something like:</p>
            <p className="mt-2 text-xs font-medium">"Add ₹500 to groceries for vegetables"</p>
          </div>
        )}
      </div>

      {/* Error Display */}
      {error && (
        <div className="text-center p-3 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg">
          <p className="text-sm text-red-600 dark:text-red-400">{error}</p>
        </div>
      )}

      {/* Transcript Display */}
      {transcript && (
        <div className="text-center p-3 bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg">
          <p className="text-xs text-blue-600 dark:text-blue-400 mb-1">You said:</p>
          <p className="text-sm font-medium text-blue-800 dark:text-blue-300">"{transcript}"</p>
        </div>
      )}
    </div>
  );
};

export default VoiceInput;
