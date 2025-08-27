import { useState, useEffect, useRef } from 'react';
import { Mic, MicOff } from 'lucide-react';
import toast from 'react-hot-toast';

const VoiceInput = ({ onVoiceResult, disabled = false, categories = [] }) => {
  const [isListening, setIsListening] = useState(false);
  const [transcript, setTranscript] = useState('');
  const [error, setError] = useState('');
  const [isInitializing, setIsInitializing] = useState(true);
  const recognitionRef = useRef(null);

  // Initialize speech recognition
  useEffect(() => {
    const initializeSpeechRecognition = () => {
      const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;

      if (SpeechRecognition) {
        try {
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

          setIsInitializing(false);
          console.log('✅ Speech recognition initialized successfully');
        } catch (error) {
          console.error('Failed to initialize speech recognition:', error);
          setIsInitializing(false);
          setError('Failed to initialize voice recognition');
        }
      } else {
        setIsInitializing(false);
        setError('Voice recognition not supported in this browser');
      }
    };

    // Add a small delay to ensure the API is fully loaded
    const timer = setTimeout(initializeSpeechRecognition, 100);

    return () => clearTimeout(timer);
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

  // Show loading state while initializing
  if (isInitializing) {
    return (
      <div className="space-y-2">
        <div className="flex items-center justify-center">
          <div className="relative p-3 rounded-full bg-gray-300 dark:bg-gray-600 animate-pulse">
            <div className="w-5 h-5 bg-gray-400 dark:bg-gray-500 rounded-full"></div>
          </div>
        </div>
      </div>
    );
  }

  // Check if supported
  if (!recognitionRef.current) {
    return (
      <div className="space-y-2">
        <div className="flex items-center justify-center">
          <div className="text-center p-3">
            <div className="text-2xl">🎤</div>
            <p className="text-xs text-gray-500 dark:text-gray-400">
              Voice recognition is not supported in this browser.
            </p>
            <p className="text-xs text-gray-400 dark:text-gray-500">
              Please use Chrome, Edge, or Safari for voice features.
            </p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-2">
      {/* Voice Input Section - Only Mic Button */}
      <div className="flex gap-x-3 items-center justify-center">
        <p className="text-lg font-bold text-gray-800 dark:text-gray-200">Voice Transaction</p>
        <button
          type="button"
          onClick={startListening}
          disabled={disabled}
          className={`relative p-3 rounded-full transition-all duration-200 ${isListening
              ? 'bg-red-500 text-white shadow-lg scale-110 animate-pulse'
              : 'bg-gray-500 text-white hover:bg-gray-600 hover:scale-105'
            } ${disabled ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'}`}
          title={isListening ? 'Click to stop listening' : 'Click to start voice input'}
        >
          {isListening ? (
            <MicOff size={20} className="animate-pulse" />
          ) : (
            <Mic size={20} />
          )}
        </button>
      </div>

      {/* Error Display */}
      {error && (
        <div className="text-center p-3 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg">
          <p className="text-sm text-red-600 dark:text-red-400">{error}</p>
        </div>
      )}
    </div>
  );
};

export default VoiceInput;
