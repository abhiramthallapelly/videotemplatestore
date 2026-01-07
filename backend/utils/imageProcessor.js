const path = require('path');
const fs = require('fs');
const logger = require('./logger');

// Try to load sharp, but make it optional
let sharp = null;
try {
  sharp = require('sharp');
} catch (error) {
  logger.warn('Sharp not available. Image processing will be limited.');
}

/**
 * Process and optimize uploaded image
 */
async function processImage(inputPath, outputPath, options = {}) {
  if (!sharp) {
    logger.warn('Image processing skipped - sharp not available');
    return inputPath; // Return original if sharp not available
  }

  try {
    const {
      width = 800,
      height = 600,
      quality = 80,
      format = 'jpeg'
    } = options;

    await sharp(inputPath)
      .resize(width, height, {
        fit: 'inside',
        withoutEnlargement: true
      })
      .jpeg({ quality })
      .toFile(outputPath);

    logger.info(`Image processed: ${outputPath}`);
    return outputPath;
  } catch (error) {
    logger.error('Error processing image:', error);
    throw error;
  }
}

/**
 * Generate thumbnail from image
 */
async function generateThumbnail(inputPath, outputPath, size = 200) {
  if (!sharp) {
    logger.warn('Thumbnail generation skipped - sharp not available');
    return inputPath; // Return original if sharp not available
  }

  try {
    await sharp(inputPath)
      .resize(size, size, {
        fit: 'cover',
        position: 'center'
      })
      .jpeg({ quality: 70 })
      .toFile(outputPath);

    logger.info(`Thumbnail generated: ${outputPath}`);
    return outputPath;
  } catch (error) {
    logger.error('Error generating thumbnail:', error);
    throw error;
  }
}

/**
 * Validate image file
 */
function validateImage(file) {
  const allowedTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/gif', 'image/webp'];
  const maxSize = 5 * 1024 * 1024; // 5MB

  if (!allowedTypes.includes(file.mimetype)) {
    throw new Error('Invalid image type. Allowed types: JPEG, PNG, GIF, WebP');
  }

  if (file.size > maxSize) {
    throw new Error('Image size exceeds 5MB limit');
  }

  return true;
}

module.exports = {
  processImage,
  generateThumbnail,
  validateImage
};

