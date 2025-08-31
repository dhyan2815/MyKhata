import Tesseract from 'tesseract.js';
import sharp from 'sharp';

class OCRProcessor {
  constructor() {
    this.worker = null;
    this.isInitializing = false;
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
      this.worker = await Tesseract.createWorker('eng', 1, {
        logger: m => console.log('OCR:', m)
      });
      
      // Configure worker for better performance
      await this.worker.setParameters({
        tessedit_pageseg_mode: Tesseract.PSM.SINGLE_BLOCK,
        tessedit_char_whitelist: '0123456789ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz .,/$-:',
      });
      
      console.log('OCR Worker initialized successfully');
    } catch (error) {
      console.error('Error initializing OCR worker:', error);
      throw error;
    } finally {
      this.isInitializing = false;
    }
  }

  // Process receipt image and extract text
  async processReceipt(imageBuffer) {
    try {
      if (!this.worker) {
        await this.initialize();
      }

      // Preprocess image for better OCR results
      const processedImage = await this.preprocessImage(imageBuffer);
      
      // Extract text from image
      const { data: { text } } = await this.worker.recognize(processedImage);
      
      // Parse extracted text to find relevant information
      const extractedData = this.parseReceiptText(text);
      
      return extractedData;
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

  // Cleanup worker when done
  async cleanup() {
    if (this.worker) {
      try {
        await this.worker.terminate();
        this.worker = null;
        console.log('OCR Worker terminated successfully');
      } catch (error) {
        console.error('Error terminating OCR worker:', error);
      }
    }
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

    // Extract merchant name (usually first few lines)
    if (lines.length > 0) {
      extractedData.merchant = lines[0].trim();
    }

    // Extract date (look for date patterns)
    const datePattern = /(\d{1,2}[\/\-]\d{1,2}[\/\-]\d{2,4})|(\d{4}[\/\-]\d{1,2}[\/\-]\d{1,2})/;
    for (const line of lines) {
      const dateMatch = line.match(datePattern);
      if (dateMatch) {
        extractedData.date = dateMatch[0];
        break;
      }
    }

    // Extract total amount (look for total, grand total, etc.)
    const totalPattern = /(?:total|grand total|amount due|balance due)[\s:]*\$?(\d+\.?\d*)/i;
    for (const line of lines) {
      const totalMatch = line.match(totalPattern);
      if (totalMatch) {
        extractedData.total = totalMatch[1];
        break;
      }
    }

    // Extract subtotal
    const subtotalPattern = /(?:subtotal|sub total)[\s:]*\$?(\d+\.?\d*)/i;
    for (const line of lines) {
      const subtotalMatch = line.match(subtotalPattern);
      if (subtotalMatch) {
        extractedData.subtotal = subtotalMatch[1];
        break;
      }
    }

    // Extract tax
    const taxPattern = /(?:tax|sales tax)[\s:]*\$?(\d+\.?\d*)/i;
    for (const line of lines) {
      const taxMatch = line.match(taxPattern);
      if (taxMatch) {
        extractedData.tax = taxMatch[1];
        break;
      }
    }

    // Extract line items (look for price patterns)
    const pricePattern = /\$(\d+\.?\d*)/;
    for (const line of lines) {
      if (pricePattern.test(line) && !line.toLowerCase().includes('total')) {
        const priceMatch = line.match(pricePattern);
        if (priceMatch) {
          extractedData.items.push({
            description: line.replace(pricePattern, '').trim(),
            price: priceMatch[1]
          });
        }
      }
    }

    return extractedData;
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
