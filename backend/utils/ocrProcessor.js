import Tesseract from 'tesseract.js';
import sharp from 'sharp';
import cacheService from './cacheService.js';
import memoryManager from './memoryManager.js';

class OCRProcessor {
  constructor() {
    this.worker = null;
    this.isInitializing = false;
    this.workerPool = [];
    this.maxWorkers = 2; // Limit concurrent workers
    this.workerQueue = [];
    this.isShuttingDown = false;
  }

  // Initialize Tesseract worker with optimization
  async initialize() {
    if (this.isInitializing) {
      // Wait for existing initialization to complete
      while (this.isInitializing) {
        await new Promise(resolve => setTimeout(resolve, 100));
      }
      return;
    }
    
    try {
      this.isInitializing = true;
      
      // Use lighter OCR configuration in production
      if (process.env.NODE_ENV === 'production') {
        console.log('Using production-optimized OCR configuration');
      }
      
      this.worker = await Tesseract.createWorker('eng', 1, {
        logger: m => console.log('OCR:', m),
        // Optimize for memory usage
        cacheMethod: 'none',
        gzip: false
      });
      
      // Configure worker for better performance
      await this.worker.setParameters({
        tessedit_pageseg_mode: Tesseract.PSM.SINGLE_BLOCK,
        tessedit_char_whitelist: '0123456789ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz .,/$-:',
      });
      
      console.log('OCR Worker initialized successfully');
    } catch (error) {
      console.error('Error initializing OCR worker:', error);
      // Don't throw error in production, just log it
      if (process.env.NODE_ENV === 'production') {
        console.log('OCR initialization failed, continuing without OCR functionality');
        return;
      }
      throw error;
    } finally {
      this.isInitializing = false;
    }
  }

  // Process receipt image and extract text
  async processReceipt(imageBuffer) {
    try {
      // Generate cache key for the image
      const imageHash = cacheService.generateImageHash(imageBuffer);
      
      // Check cache first
      const cachedResult = cacheService.getOCRResult(imageHash);
      if (cachedResult) {
        console.log('OCR result found in cache');
        return cachedResult;
      }

      // Use memory manager to queue OCR operation
      return await memoryManager.queueOperation(async () => {
        // Get available worker
        const worker = await this.getWorker();

        try {
          // Preprocess image for better OCR results
          const processedImage = await this.preprocessImage(imageBuffer);
          
          // Extract text from image
          const { data: { text } } = await worker.recognize(processedImage);
          
          // Parse extracted text to find relevant information
          const extractedData = this.parseReceiptText(text);
          
          // Cache the result
          cacheService.setOCRResult(imageHash, extractedData);
          
          return extractedData;
        } finally {
          // Return worker to pool
          this.returnWorker(worker);
        }
      }, 'normal');
    } catch (error) {
      console.error('Error processing receipt:', error);
      throw error;
    }
  }

  // Preprocess image for better OCR accuracy
  async preprocessImage(imageBuffer) {
    try {
      return await sharp(imageBuffer)
        .resize(1200, null, { withoutEnlargement: true, fit: 'inside' }) // Resize for optimal OCR
        .grayscale() // Convert to grayscale first
        .normalize() // Normalize contrast
        .sharpen({ sigma: 1, flat: 1, jagged: 2 }) // Enhanced sharpening
        .gamma(1.2) // Adjust gamma for better contrast
        .jpeg({ quality: 95 }) // High quality JPEG
        .toBuffer();
    } catch (error) {
      console.error('Error preprocessing image:', error);
      return imageBuffer; // Return original if preprocessing fails
    }
  }

  // Get available worker from pool
  async getWorker() {
    // Return existing worker if available
    if (this.workerPool.length > 0) {
      return this.workerPool.pop();
    }

    // Create new worker if under limit
    if (this.workerPool.length < this.maxWorkers) {
      return await this.createWorker();
    }

    // Wait for worker to become available
    return new Promise((resolve) => {
      this.workerQueue.push(resolve);
    });
  }

  // Create new worker
  async createWorker() {
    try {
      const worker = await Tesseract.createWorker('eng', 1, {
        logger: m => console.log('OCR Worker:', m)
      });
      
      // Configure worker for better performance
      await worker.setParameters({
        tessedit_pageseg_mode: Tesseract.PSM.SINGLE_BLOCK,
        tessedit_char_whitelist: '0123456789ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz .,/$-:',
      });
      
      console.log('New OCR Worker created');
      return worker;
    } catch (error) {
      console.error('Error creating OCR worker:', error);
      throw error;
    }
  }

  // Return worker to pool
  returnWorker(worker) {
    if (this.isShuttingDown) {
      this.terminateWorker(worker);
      return;
    }

    if (this.workerQueue.length > 0) {
      const resolve = this.workerQueue.shift();
      resolve(worker);
    } else {
      this.workerPool.push(worker);
    }
  }

  // Terminate individual worker
  async terminateWorker(worker) {
    try {
      await worker.terminate();
      console.log('OCR Worker terminated');
    } catch (error) {
      console.error('Error terminating OCR worker:', error);
    }
  }

  // Cleanup all workers
  async cleanup() {
    this.isShuttingDown = true;
    
    // Terminate all workers in pool
    const terminatePromises = this.workerPool.map(worker => this.terminateWorker(worker));
    await Promise.all(terminatePromises);
    
    this.workerPool = [];
    this.workerQueue = [];
    
    console.log('All OCR Workers terminated');
  }

  // Parse extracted text to find receipt data
  parseReceiptText(text) {
    const lines = text.split('\n').filter(line => line.trim());
    
    const extractedData = {
      merchant: '',
      date: '',
      total: '',
      subtotal: '',
      tax: '',
      items: [],
      rawText: text
    };

    // Enhanced merchant extraction
    extractedData.merchant = this.extractMerchant(lines);

    // Enhanced date extraction
    extractedData.date = this.extractDate(lines);

    // Enhanced amount extraction
    const amounts = this.extractAmounts(lines);
    extractedData.total = amounts.total;
    extractedData.subtotal = amounts.subtotal;
    extractedData.tax = amounts.tax;

    // Enhanced line items extraction
    extractedData.items = this.extractLineItems(lines);

    return extractedData;
  }

  // Enhanced merchant name extraction
  extractMerchant(lines) {
    // Common merchant patterns
    const merchantPatterns = [
      /^[A-Z][A-Z\s&]+$/, // All caps with spaces and &
      /^[A-Z][a-z]+(?:\s+[A-Z][a-z]+)*$/, // Title case words
      /^[A-Z]{2,}$/, // All caps abbreviations
    ];

    // Look in first 5 lines for merchant name
    for (let i = 0; i < Math.min(5, lines.length); i++) {
      const line = lines[i].trim();
      
      // Skip common non-merchant lines
      if (this.isNonMerchantLine(line)) continue;

      // Check if line matches merchant patterns
      for (const pattern of merchantPatterns) {
        if (pattern.test(line) && line.length > 2 && line.length < 50) {
          return line;
        }
      }
    }

    // Fallback to first non-empty line
    return lines[0]?.trim() || '';
  }

  // Check if line is likely not a merchant name
  isNonMerchantLine(line) {
    const nonMerchantPatterns = [
      /^\d+$/, // Just numbers
      /^\d{1,2}[\/\-]\d{1,2}[\/\-]\d{2,4}$/, // Date
      /^[A-Z\s]*\d+[A-Z\s]*$/, // Mixed numbers and letters
      /^(receipt|invoice|bill|total|subtotal|tax|amount)/i,
      /^\$?\d+\.?\d*$/, // Just amounts
      /^[A-Z]{1,2}\d+$/, // Short codes
    ];

    return nonMerchantPatterns.some(pattern => pattern.test(line));
  }

  // Enhanced date extraction
  extractDate(lines) {
    const datePatterns = [
      // MM/DD/YYYY or MM-DD-YYYY
      /(\d{1,2}[\/\-]\d{1,2}[\/\-]\d{4})/,
      // DD/MM/YYYY or DD-MM-YYYY
      /(\d{1,2}[\/\-]\d{1,2}[\/\-]\d{4})/,
      // YYYY/MM/DD or YYYY-MM-DD
      /(\d{4}[\/\-]\d{1,2}[\/\-]\d{1,2})/,
      // Month DD, YYYY
      /(January|February|March|April|May|June|July|August|September|October|November|December)\s+\d{1,2},?\s+\d{4}/i,
      // DD Month YYYY
      /(\d{1,2}\s+(?:January|February|March|April|May|June|July|August|September|October|November|December)\s+\d{4})/i,
    ];

    for (const line of lines) {
      for (const pattern of datePatterns) {
        const match = line.match(pattern);
        if (match) {
          return match[1];
        }
      }
    }

    return '';
  }

  // Enhanced amount extraction
  extractAmounts(lines) {
    const amounts = { total: '', subtotal: '', tax: '' };

    // Enhanced total patterns
    const totalPatterns = [
      /(?:total|grand\s+total|amount\s+due|balance\s+due|final\s+total)[\s:]*\$?(\d+\.?\d*)/i,
      /(?:total|grand\s+total|amount\s+due|balance\s+due|final\s+total)[\s:]*(\d+\.?\d*)/i,
      /^[\s]*\$?(\d+\.?\d*)[\s]*$/i, // Line with just amount
    ];

    // Enhanced subtotal patterns
    const subtotalPatterns = [
      /(?:subtotal|sub\s+total|sub\s+total\s+amount)[\s:]*\$?(\d+\.?\d*)/i,
      /(?:subtotal|sub\s+total|sub\s+total\s+amount)[\s:]*(\d+\.?\d*)/i,
    ];

    // Enhanced tax patterns
    const taxPatterns = [
      /(?:tax|sales\s+tax|vat|gst|service\s+tax)[\s:]*\$?(\d+\.?\d*)/i,
      /(?:tax|sales\s+tax|vat|gst|service\s+tax)[\s:]*(\d+\.?\d*)/i,
    ];

    // Extract amounts
    for (const line of lines) {
      // Extract total
      if (!amounts.total) {
        for (const pattern of totalPatterns) {
          const match = line.match(pattern);
          if (match) {
            amounts.total = match[1];
            break;
          }
        }
      }

      // Extract subtotal
      if (!amounts.subtotal) {
        for (const pattern of subtotalPatterns) {
          const match = line.match(pattern);
          if (match) {
            amounts.subtotal = match[1];
            break;
          }
        }
      }

      // Extract tax
      if (!amounts.tax) {
        for (const pattern of taxPatterns) {
          const match = line.match(pattern);
          if (match) {
            amounts.tax = match[1];
            break;
          }
        }
      }
    }

    // If no total found, try to find the largest amount
    if (!amounts.total) {
      const allAmounts = this.extractAllAmounts(lines);
      if (allAmounts.length > 0) {
        amounts.total = Math.max(...allAmounts).toString();
      }
    }

    return amounts;
  }

  // Extract all amounts from text
  extractAllAmounts(lines) {
    const amounts = [];
    const amountPattern = /\$?(\d+\.?\d*)/g;

    for (const line of lines) {
      const matches = line.match(amountPattern);
      if (matches) {
        matches.forEach(match => {
          const amount = parseFloat(match);
          if (amount > 0 && amount < 100000) { // Reasonable range
            amounts.push(amount);
          }
        });
      }
    }

    return amounts;
  }

  // Enhanced line items extraction
  extractLineItems(lines) {
    const items = [];
    const pricePatterns = [
      /\$(\d+\.?\d*)/g,
      /(\d+\.?\d*)\s*$/g, // Amount at end of line
    ];

    for (const line of lines) {
      // Skip lines that are likely totals or headers
      if (this.isTotalLine(line) || this.isHeaderLine(line)) continue;

      for (const pattern of pricePatterns) {
        const matches = [...line.matchAll(pattern)];
        if (matches.length > 0) {
          matches.forEach(match => {
            const price = parseFloat(match[1]);
            if (price > 0 && price < 10000) { // Reasonable price range
              const description = line.replace(match[0], '').trim();
              if (description.length > 0) {
                items.push({
                  description: description,
                  price: price.toString()
                });
              }
            }
          });
        }
      }
    }

    return items;
  }

  // Check if line is a total line
  isTotalLine(line) {
    const totalKeywords = ['total', 'subtotal', 'tax', 'amount due', 'balance due', 'grand total'];
    return totalKeywords.some(keyword => 
      line.toLowerCase().includes(keyword)
    );
  }

  // Check if line is a header line
  isHeaderLine(line) {
    const headerKeywords = ['item', 'description', 'qty', 'quantity', 'price', 'amount'];
    return headerKeywords.some(keyword => 
      line.toLowerCase().includes(keyword)
    );
  }

  // Cleanup worker
  async terminate() {
    if (this.worker) {
      await this.worker.terminate();
      this.worker = null;
    }
  }
}

export default OCRProcessor;
