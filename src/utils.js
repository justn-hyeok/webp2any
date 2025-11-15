/**
 * @typedef {import('./types.js').ConvertOptions} ConvertOptions
 * @typedef {import('./types.js').ImageDimensions} ImageDimensions
 */

/**
 * Validates if the provided file is a WebP image
 * @param {File} file - File to validate
 * @throws {Error} If file is not a WebP image
 */
export function validateWebPFile(file) {
  if (!(file instanceof File)) {
    throw new Error('Invalid input: expected a File object');
  }

  if (!file.type || !file.type.includes('webp')) {
    throw new Error(`Invalid file type: expected image/webp, got ${file.type || 'unknown'}`);
  }
}

/**
 * Creates an HTMLImageElement from a File object
 * @param {File} file - Image file to load
 * @returns {Promise<HTMLImageElement>} Loaded image element
 * @throws {Error} If image fails to load
 */
export function createImageFromFile(file) {
  return new Promise((resolve, reject) => {
    const url = URL.createObjectURL(file);
    const img = new Image();

    img.onload = () => {
      URL.revokeObjectURL(url);
      resolve(img);
    };

    img.onerror = () => {
      URL.revokeObjectURL(url);
      reject(new Error('Failed to load image from file'));
    };

    img.src = url;
  });
}

/**
 * Calculates target dimensions for image resizing
 * @param {number} width - Original width
 * @param {number} height - Original height
 * @param {ConvertOptions} [options={}] - Conversion options
 * @returns {ImageDimensions} Calculated dimensions
 */
export function calculateDimensions(width, height, options = {}) {
  const {
    maxWidth,
    maxHeight,
    maintainAspectRatio = true
  } = options;

  // No resizing needed
  if (!maxWidth && !maxHeight) {
    return { width, height };
  }

  let targetWidth = width;
  let targetHeight = height;

  if (maintainAspectRatio) {
    const aspectRatio = width / height;

    if (maxWidth && maxHeight) {
      // Fit within both constraints
      if (width / maxWidth > height / maxHeight) {
        targetWidth = maxWidth;
        targetHeight = Math.round(maxWidth / aspectRatio);
      } else {
        targetHeight = maxHeight;
        targetWidth = Math.round(maxHeight * aspectRatio);
      }
    } else if (maxWidth) {
      targetWidth = Math.min(width, maxWidth);
      targetHeight = Math.round(targetWidth / aspectRatio);
    } else if (maxHeight) {
      targetHeight = Math.min(height, maxHeight);
      targetWidth = Math.round(targetHeight * aspectRatio);
    }
  } else {
    // Don't maintain aspect ratio
    if (maxWidth) targetWidth = Math.min(width, maxWidth);
    if (maxHeight) targetHeight = Math.min(height, maxHeight);
  }

  return {
    width: targetWidth,
    height: targetHeight
  };
}

/**
 * Gets the dimensions of an image file
 * @param {File} file - Image file
 * @returns {Promise<ImageDimensions>} Image dimensions
 * @throws {Error} If file is invalid or cannot be loaded
 */
export async function getImageSize(file) {
  validateWebPFile(file);
  const img = await createImageFromFile(file);

  return {
    width: img.naturalWidth,
    height: img.naturalHeight
  };
}

/**
 * Triggers a download of a Blob with the specified filename
 * @param {Blob} blob - Blob to download
 * @param {string} filename - Name for the downloaded file
 */
export function downloadBlob(blob, filename) {
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');

  a.href = url;
  a.download = filename;
  a.style.display = 'none';

  document.body.appendChild(a);
  a.click();

  // Cleanup
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
}
