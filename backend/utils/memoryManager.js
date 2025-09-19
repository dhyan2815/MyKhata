/**
 * Memory Manager for Production Optimization
 * 
 * Monitors memory usage and manages resource-intensive operations
 * to prevent build failures and runtime crashes
 */

class MemoryManager {
  constructor() {
    this.memoryThreshold = 512 * 1024 * 1024; // 512MB threshold
    this.isMemoryConstrained = false;
    this.operationQueue = [];
    this.activeOperations = 0;
    this.maxConcurrentOperations = 2;
  }

  // Check if memory is constrained
  checkMemoryStatus() {
    const usedMemory = process.memoryUsage();
    const totalMemory = usedMemory.heapUsed + usedMemory.external;
    
    this.isMemoryConstrained = totalMemory > this.memoryThreshold;
    
    if (this.isMemoryConstrained) {
      console.log(`Memory usage high: ${Math.round(totalMemory / 1024 / 1024)}MB`);
    }
    
    return this.isMemoryConstrained;
  }

  // Queue operation to prevent memory overload
  async queueOperation(operation, priority = 'normal') {
    return new Promise((resolve, reject) => {
      this.operationQueue.push({
        operation,
        priority,
        resolve,
        reject
      });
      
      this.processQueue();
    });
  }

  // Process operation queue
  async processQueue() {
    if (this.activeOperations >= this.maxConcurrentOperations || this.operationQueue.length === 0) {
      return;
    }

    // Sort by priority
    this.operationQueue.sort((a, b) => {
      const priorityOrder = { high: 3, normal: 2, low: 1 };
      return priorityOrder[b.priority] - priorityOrder[a.priority];
    });

    const { operation, resolve, reject } = this.operationQueue.shift();
    this.activeOperations++;

    try {
      // Check memory before operation
      if (this.checkMemoryStatus()) {
        // Force garbage collection if available
        if (global.gc) {
          global.gc();
        }
        
        // Wait a bit for memory to free up
        await new Promise(resolve => setTimeout(resolve, 1000));
      }

      const result = await operation();
      resolve(result);
    } catch (error) {
      reject(error);
    } finally {
      this.activeOperations--;
      // Process next operation
      setImmediate(() => this.processQueue());
    }
  }

  // Force garbage collection
  forceGarbageCollection() {
    if (global.gc) {
      global.gc();
      console.log('Forced garbage collection');
    }
  }

  // Get memory usage info
  getMemoryInfo() {
    const usage = process.memoryUsage();
    return {
      heapUsed: Math.round(usage.heapUsed / 1024 / 1024),
      heapTotal: Math.round(usage.heapTotal / 1024 / 1024),
      external: Math.round(usage.external / 1024 / 1024),
      rss: Math.round(usage.rss / 1024 / 1024),
      isConstrained: this.isMemoryConstrained
    };
  }

  // Cleanup resources
  cleanup() {
    this.operationQueue = [];
    this.activeOperations = 0;
    this.forceGarbageCollection();
  }
}

export default new MemoryManager();
