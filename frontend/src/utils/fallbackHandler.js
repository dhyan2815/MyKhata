/**
 * Fallback Handler
 * Provides fallback mechanisms when primary services fail
 */

import errorHandler from './errorHandler';

class FallbackHandler {
  constructor() {
    this.fallbackStrategies = new Map();
    this.registerDefaultStrategies();
  }

  /**
   * Register default fallback strategies
   */
  registerDefaultStrategies() {
    // Cloud storage fallback
    this.fallbackStrategies.set('cloud_storage', {
      name: 'Local Storage Fallback',
      description: 'Store images locally when cloud upload fails',
      handler: this.handleCloudStorageFallback.bind(this)
    });

    // OCR fallback
    this.fallbackStrategies.set('ocr_processing', {
      name: 'Manual Entry Fallback',
      description: 'Allow manual data entry when OCR fails',
      handler: this.handleOCRFallback.bind(this)
    });

    // Network fallback
    this.fallbackStrategies.set('network_error', {
      name: 'Offline Mode',
      description: 'Store data locally and sync when connection is restored',
      handler: this.handleNetworkFallback.bind(this)
    });
  }

  /**
   * Handle cloud storage fallback
   */
  handleCloudStorageFallback(error, context = {}) {
    console.log('Cloud storage fallback activated');
    
    // Show warning to user
    errorHandler.showWarningToast(
      'Cloud storage unavailable. Using local storage as fallback.',
      5000
    );

    // Store data locally
    const fallbackData = {
      timestamp: new Date().toISOString(),
      type: 'cloud_storage_fallback',
      data: context.data,
      error: error.message
    };

    this.storeLocally('cloud_fallback', fallbackData);

    return {
      success: true,
      fallback: true,
      message: 'Data stored locally. Will sync when cloud storage is available.',
      data: context.data
    };
  }

  /**
   * Handle OCR processing fallback
   */
  handleOCRFallback(error, context = {}) {
    console.log('OCR fallback activated');
    
    // Show error with manual entry option
    errorHandler.showErrorToast(
      error,
      'Unable to read receipt automatically. Please enter the details manually.'
    );

    return {
      success: false,
      fallback: true,
      message: 'Please enter receipt details manually',
      showManualEntry: true,
      data: context.data || {}
    };
  }

  /**
   * Handle network error fallback
   */
  handleNetworkFallback(error, context = {}) {
    console.log('Network fallback activated');
    
    // Show offline mode message
    errorHandler.showWarningToast(
      'You are offline. Data will be synced when connection is restored.',
      7000
    );

    // Store data for later sync
    const offlineData = {
      timestamp: new Date().toISOString(),
      type: 'offline_data',
      data: context.data,
      error: error.message,
      needsSync: true
    };

    this.storeLocally('offline_data', offlineData);

    return {
      success: true,
      fallback: true,
      offline: true,
      message: 'Data saved offline. Will sync when online.',
      data: context.data
    };
  }

  /**
   * Store data locally
   */
  storeLocally(key, data) {
    try {
      const existingData = JSON.parse(localStorage.getItem(key) || '[]');
      existingData.push(data);
      
      // Keep only last 50 items to prevent storage bloat
      if (existingData.length > 50) {
        existingData.splice(0, existingData.length - 50);
      }
      
      localStorage.setItem(key, JSON.stringify(existingData));
      console.log(`Data stored locally with key: ${key}`);
    } catch (error) {
      console.error('Failed to store data locally:', error);
    }
  }

  /**
   * Retrieve locally stored data
   */
  getLocalData(key) {
    try {
      return JSON.parse(localStorage.getItem(key) || '[]');
    } catch (error) {
      console.error('Failed to retrieve local data:', error);
      return [];
    }
  }

  /**
   * Clear local data
   */
  clearLocalData(key) {
    try {
      localStorage.removeItem(key);
      console.log(`Local data cleared for key: ${key}`);
    } catch (error) {
      console.error('Failed to clear local data:', error);
    }
  }

  /**
   * Execute fallback strategy
   */
  executeFallback(strategyName, error, context = {}) {
    const strategy = this.fallbackStrategies.get(strategyName);
    
    if (!strategy) {
      console.error(`Fallback strategy not found: ${strategyName}`);
      return {
        success: false,
        message: 'No fallback strategy available'
      };
    }

    try {
      return strategy.handler(error, context);
    } catch (fallbackError) {
      console.error('Fallback strategy failed:', fallbackError);
      return {
        success: false,
        message: 'Fallback strategy failed',
        error: fallbackError.message
      };
    }
  }

  /**
   * Check if fallback is available for strategy
   */
  hasFallback(strategyName) {
    return this.fallbackStrategies.has(strategyName);
  }

  /**
   * Get all available fallback strategies
   */
  getAvailableStrategies() {
    return Array.from(this.fallbackStrategies.entries()).map(([key, strategy]) => ({
      key,
      ...strategy
    }));
  }

  /**
   * Register custom fallback strategy
   */
  registerStrategy(name, strategy) {
    this.fallbackStrategies.set(name, strategy);
  }

  /**
   * Sync offline data when connection is restored
   */
  async syncOfflineData(syncFunction) {
    const offlineData = this.getLocalData('offline_data');
    
    if (offlineData.length === 0) {
      return { synced: 0, errors: 0 };
    }

    let synced = 0;
    let errors = 0;

    for (const item of offlineData) {
      try {
        await syncFunction(item.data);
        synced++;
      } catch (error) {
        console.error('Failed to sync offline data:', error);
        errors++;
      }
    }

    // Clear synced data
    if (synced > 0) {
      this.clearLocalData('offline_data');
    }

    return { synced, errors };
  }

  /**
   * Check if device is online
   */
  isOnline() {
    return navigator.onLine;
  }

  /**
   * Setup online/offline event listeners
   */
  setupConnectionListeners() {
    window.addEventListener('online', () => {
      errorHandler.showSuccessToast('Connection restored! Syncing offline data...');
      // Trigger sync of offline data
      this.triggerOfflineSync();
    });

    window.addEventListener('offline', () => {
      errorHandler.showWarningToast('You are now offline. Data will be saved locally.');
    });
  }

  /**
   * Trigger offline data sync
   */
  triggerOfflineSync() {
    // This should be implemented by the calling application
    // with the appropriate sync function
    console.log('Offline sync triggered');
  }
}

// Create singleton instance
const fallbackHandler = new FallbackHandler();

export default fallbackHandler;
