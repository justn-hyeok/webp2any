# webp2any

Zero-dependency WebP to PNG/JPEG converter for browsers using Canvas API.

## Features

- ✨ Zero dependencies
- 🎨 Canvas API based conversion
- 📦 Lightweight and fast
- 🔄 Batch conversion support
- 📐 Image resizing with aspect ratio preservation
- 🎯 Full TypeScript support via JSDoc
- 🌐 Browser-only (not for Node.js)

## Installation

```bash
npm install webp2any
# or
yarn add webp2any
# or
bun add webp2any
```

## Usage

### Basic Conversion

```javascript
import { webp2png, webp2jpg } from 'webp2any';

// Convert to PNG
const pngBlob = await webp2png(webpFile);

// Convert to JPEG with custom quality
const jpegBlob = await webp2jpg(webpFile, 0.8);
```

### Advanced Options

```javascript
import { webp2any } from 'webp2any';

const blob = await webp2any(webpFile, 'png', {
  quality: 0.9,              // JPEG only (0-1)
  maxWidth: 1920,            // Maximum width
  maxHeight: 1080,           // Maximum height
  maintainAspectRatio: true  // Preserve aspect ratio (default: true)
});
```

### Batch Conversion

```javascript
import { convertBatch } from 'webp2any';

const files = [...input.files]; // Array of WebP files
const blobs = await convertBatch(files, 'jpeg', { quality: 0.85 });
```

### Download Helper

```javascript
import { webp2png, downloadBlob } from 'webp2any';

const blob = await webp2png(webpFile);
downloadBlob(blob, 'converted-image.png');
```

### Get Image Dimensions

```javascript
import { getImageSize } from 'webp2any';

const { width, height } = await getImageSize(webpFile);
console.log(`Image size: ${width}x${height}`);
```

## API

### `webp2any(file, format, options?)`

Converts a WebP file to the specified format.

- **file**: `File` - WebP image file
- **format**: `'png' | 'jpeg'` - Output format
- **options**: `ConvertOptions` (optional)
  - `quality`: `number` - JPEG quality (0-1), default: 0.9
  - `maxWidth`: `number` - Maximum width
  - `maxHeight`: `number` - Maximum height
  - `maintainAspectRatio`: `boolean` - Preserve aspect ratio (default: true)
- **Returns**: `Promise<Blob>` - Converted image

### `webp2png(file, options?)`

Converts a WebP file to PNG.

- **file**: `File` - WebP image file
- **options**: `ConvertOptions` (optional)
- **Returns**: `Promise<Blob>` - PNG image

### `webp2jpg(file, quality?, options?)`

Converts a WebP file to JPEG.

- **file**: `File` - WebP image file
- **quality**: `number` (optional) - JPEG quality (0-1), default: 0.9
- **options**: `ConvertOptions` (optional)
- **Returns**: `Promise<Blob>` - JPEG image

### `convertBatch(files, format, options?)`

Converts multiple WebP files in parallel.

- **files**: `File[]` - Array of WebP files
- **format**: `'png' | 'jpeg'` - Output format
- **options**: `ConvertOptions` (optional)
- **Returns**: `Promise<Blob[]>` - Array of converted images

### `getImageSize(file)`

Gets the dimensions of an image file.

- **file**: `File` - Image file
- **Returns**: `Promise<{ width: number, height: number }>` - Image dimensions

### `downloadBlob(blob, filename)`

Triggers a download of a Blob.

- **blob**: `Blob` - Blob to download
- **filename**: `string` - Filename for download

## Complete Example

```html
<!DOCTYPE html>
<html>
<head>
  <title>WebP Converter</title>
</head>
<body>
  <input type="file" id="input" accept="image/webp" multiple>
  <button id="convert">Convert to PNG</button>

  <script type="module">
    import { convertBatch, downloadBlob } from './src/index.js';

    document.getElementById('convert').addEventListener('click', async () => {
      const input = document.getElementById('input');
      const files = [...input.files];

      if (files.length === 0) {
        alert('Please select WebP files');
        return;
      }

      try {
        const blobs = await convertBatch(files, 'png');

        blobs.forEach((blob, index) => {
          const filename = files[index].name.replace(/\.webp$/i, '.png');
          downloadBlob(blob, filename);
        });

        alert(`Successfully converted ${blobs.length} images!`);
      } catch (error) {
        alert(`Conversion failed: ${error.message}`);
      }
    });
  </script>
</body>
</html>
```

## Browser Compatibility

This library requires:
- Canvas API support
- ES6+ features (Promise, async/await)
- File API and Blob support

Supported browsers:
- Chrome/Edge 15+
- Firefox 52+
- Safari 11+

## Error Handling

The library throws descriptive errors for common issues:

```javascript
try {
  const blob = await webp2png(file);
} catch (error) {
  if (error.message.includes('Invalid file type')) {
    console.error('File is not a WebP image');
  } else if (error.message.includes('Failed to load')) {
    console.error('Image could not be loaded');
  } else if (error.message.includes('canvas')) {
    console.error('Canvas context creation failed');
  }
}
```

## License

MIT
