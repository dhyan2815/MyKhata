import { v2 as cloudinary } from 'cloudinary';
// import sharp from 'sharp';
import crypto from 'crypto';

class CloudStorageService {
  constructor() {
    this.isConfigured = false;
    this.configChecked = false;
  }

  checkConfiguration() {
    if (this.configChecked) {
      return this.isConfigured;
    }
    
    const required = ['CLOUDINARY_CLOUD_NAME', 'CLOUDINARY_API_KEY', 'CLOUDINARY_API_SECRET'];
    const missing = required.filter(key => !process.env[key]);
    
    if (missing.length > 0) {
      console.warn(`Cloudinary configuration missing: ${missing.join(', ')}`);
      console.warn('Cloudinary features will be disabled. Images will be stored as base64.');
      this.isConfigured = false;
    } else {
      // Configure Cloudinary with current environment variables
      cloudinary.config({
        cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
        api_key: process.env.CLOUDINARY_API_KEY,
        api_secret: process.env.CLOUDINARY_API_SECRET,
      });
      console.log('✅ Cloudinary configuration found - cloud storage enabled');
      this.isConfigured = true;
    }
    
    this.configChecked = true;
    return this.isConfigured;
  }

  /**
   * Upload image to Cloudinary with optimization
   * @param {Buffer} imageBuffer - Image buffer
   * @param {Object} options - Upload options
   * @returns {Promise<Object>} Upload result
   */
  async uploadImage(imageBuffer, options = {}) {
    if (!this.checkConfiguration()) {
      throw new Error('Cloudinary is not properly configured');
    }

    try {
      // Optimize image before upload
      const optimizedBuffer = await this.optimizeImage(imageBuffer, options.optimize);

      // Upload to Cloudinary
      const result = await new Promise((resolve, reject) => {
        cloudinary.uploader.upload_stream(
          {
            folder: options.folder || 'mykhata/receipts',
            public_id: options.publicId || `receipt_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
            resource_type: 'image',
            transformation: [
              { quality: 'auto:good' },
              { fetch_format: 'auto' },
              { width: 1200, height: 1200, crop: 'limit' }
            ],
            tags: options.tags || ['receipt', 'mykhata'],
            ...options.cloudinaryOptions
          },
          (error, result) => {
            if (error) reject(error);
            else resolve(result);
          }
        ).end(optimizedBuffer);
      });

      return {
        success: true,
        publicId: result.public_id,
        secureUrl: result.secure_url,
        url: result.url,
        width: result.width,
        height: result.height,
        bytes: result.bytes,
        format: result.format
      };
    } catch (error) {
      console.error('Cloudinary upload error:', error);
      throw new Error(`Failed to upload image: ${error.message}`);
    }
  }

  /**
   * Delete image from Cloudinary
   * @param {string} publicId - Cloudinary public ID
   * @returns {Promise<Object>} Delete result
   */
  async deleteImage(publicId) {
    if (!this.isConfigured) {
      throw new Error('Cloudinary is not properly configured');
    }

    try {
      const result = await cloudinary.uploader.destroy(publicId);
      return {
        success: result.result === 'ok',
        result: result.result
      };
    } catch (error) {
      console.error('Cloudinary delete error:', error);
      throw new Error(`Failed to delete image: ${error.message}`);
    }
  }

  /**
   * Generate optimized image URL with transformations
   * @param {string} publicId - Cloudinary public ID
   * @param {Object} transformations - Image transformations
   * @returns {string} Optimized image URL
   */
  generateOptimizedUrl(publicId, transformations = {}) {
    if (!this.isConfigured) {
      return null;
    }

    const defaultTransformations = {
      quality: 'auto:good',
      fetch_format: 'auto',
      width: 400,
      height: 400,
      crop: 'limit'
    };

    return cloudinary.url(publicId, {
      ...defaultTransformations,
      ...transformations
    });
  }

  /**
   * Optimize image before upload
   * @param {Buffer} imageBuffer - Original image buffer
   * @param {Object} options - Optimization options
   * @returns {Promise<Buffer>} Optimized image buffer
   */
  async optimizeImage(imageBuffer, options = {}) {
    try {
      // Image optimization temporarily disabled
      // Return original buffer
      return imageBuffer;
    } catch (error) {
      console.error('Image optimization error:', error);
      return imageBuffer; // Return original if optimization fails
    }
  }

  /**
   * Extract public ID from Cloudinary URL
   * @param {string} url - Cloudinary URL
   * @returns {string|null} Public ID
   */
  extractPublicId(url) {
    if (!url || !url.includes('cloudinary.com')) {
      return null;
    }

    const match = url.match(/\/v\d+\/(.+)\.(jpg|jpeg|png|gif|webp)$/);
    return match ? match[1] : null;
  }

  /**
   * Check if URL is a Cloudinary URL
   * @param {string} url - URL to check
   * @returns {boolean} True if Cloudinary URL
   */
  isCloudinaryUrl(url) {
    return url && url.includes('cloudinary.com');
  }
}

// Create singleton instance
const cloudStorageService = new CloudStorageService();

export default cloudStorageService;
