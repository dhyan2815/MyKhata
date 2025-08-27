import Tesseract from 'tesseract.js';
import sharp from 'sharp';

class OCRProcessor {
  constructor() {
    this.worker = null;
  }

  // Initialize Tesseract worker
  async initialize() {
    try {
      this.worker = await Tesseract.createWorker('eng');
      console.log('OCR Worker initialized successfully');
    } catch (error) {
      console.error('Error initializing OCR worker:', error);
      throw error;
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
        .resize(1200, null, { withoutEnlargement: true }) // Resize for optimal OCR
        .sharpen() // Enhance edges
        .threshold(128) // Convert to black and white
        .png() // Convert to PNG format
        .toBuffer();
    } catch (error) {
      console.error('Error preprocessing image:', error);
      throw error;
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
