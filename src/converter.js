/**
 * @typedef {import('./types.js').ImageFormat} ImageFormat
 * @typedef {import('./types.js').ConvertOptions} ConvertOptions
 */

import { validateWebPFile, createImageFromFile, calculateDimensions } from './utils.js';

/**
 * Converts a WebP image to the specified format using Canvas API
 * @param {File} file - WebP image file to convert
 * @param {ImageFormat} format - Output format ('png' or 'jpeg')
 * @param {ConvertOptions} [options={}] - Conversion options
 * @returns {Promise<Blob>} Converted image as Blob
 * @throws {Error} If conversion fails or invalid parameters
 */
export async function webp2any(file, format, options = {}) {
  // Validate inputs
  validateWebPFile(file);

  if (!['png', 'jpeg'].includes(format)) {
    throw new Error(`Invalid format: expected 'png' or 'jpeg', got '${format}'`);
  }

  // Load image
  const img = await createImageFromFile(file);

  // Calculate target dimensions
  const { width, height } = calculateDimensions(
    img.naturalWidth,
    img.naturalHeight,
    options
  );

  // Create canvas
  const canvas = document.createElement('canvas');
  canvas.width = width;
  canvas.height = height;

  const ctx = canvas.getContext('2d');
  if (!ctx) {
    throw new Error('Failed to get canvas 2d context');
  }

  // Draw image on canvas
  ctx.drawImage(img, 0, 0, width, height);

  // Convert to blob
  return new Promise((resolve, reject) => {
    const mimeType = format === 'png' ? 'image/png' : 'image/jpeg';
    const quality = format === 'jpeg' ? (options.quality ?? 0.9) : undefined;

    canvas.toBlob(
      (blob) => {
        if (blob) {
          resolve(blob);
        } else {
          reject(new Error('Failed to convert canvas to blob'));
        }
      },
      mimeType,
      quality
    );
  });
}

/**
 * Converts a WebP image to PNG format
 * @param {File} file - WebP image file to convert
 * @param {ConvertOptions} [options={}] - Conversion options
 * @returns {Promise<Blob>} PNG image as Blob
 */
export async function webp2png(file, options = {}) {
  return webp2any(file, 'png', options);
}

/**
 * Converts a WebP image to JPEG format
 * @param {File} file - WebP image file to convert
 * @param {number} [quality=0.9] - JPEG quality (0-1)
 * @param {ConvertOptions} [options={}] - Additional conversion options
 * @returns {Promise<Blob>} JPEG image as Blob
 */
export async function webp2jpg(file, quality = 0.9, options = {}) {
  return webp2any(file, 'jpeg', { ...options, quality });
}

/**
 * Converts multiple WebP images to the specified format
 * @param {File[]} files - Array of WebP image files to convert
 * @param {ImageFormat} format - Output format ('png' or 'jpeg')
 * @param {ConvertOptions} [options={}] - Conversion options
 * @returns {Promise<Blob[]>} Array of converted images as Blobs
 */
export async function convertBatch(files, format, options = {}) {
  if (!Array.isArray(files)) {
    throw new Error('Invalid input: expected an array of File objects');
  }

  if (files.length === 0) {
    return [];
  }

  // Convert all files in parallel
  return Promise.all(
    files.map(file => webp2any(file, format, options))
  );
}
