# webp2any

Canvas API를 사용하여 브라우저에서 WebP를 PNG/JPEG로 변환하는 제로 디펜던시 라이브러리입니다.

[English](./README.md) | **한국어**

## 특징

- ✨ 의존성 제로
- 🎨 Canvas API 기반 변환
- 📦 가볍고 빠름
- 🔄 배치 변환 지원
- 📐 종횡비 유지 이미지 리사이징
- 🎯 JSDoc을 통한 완전한 TypeScript 지원
- 🌐 브라우저 전용 (Node.js 미지원)

## 설치

```bash
npm install webp2any
# 또는
yarn add webp2any
# 또는
bun add webp2any
```

## 사용법

### 기본 변환

```javascript
import { webp2png, webp2jpg } from 'webp2any';

// PNG로 변환
const pngBlob = await webp2png(webpFile);

// 커스텀 품질로 JPEG 변환
const jpegBlob = await webp2jpg(webpFile, 0.8);
```

### 고급 옵션

```javascript
import { webp2any } from 'webp2any';

const blob = await webp2any(webpFile, 'png', {
  quality: 0.9,              // JPEG 전용 (0-1)
  maxWidth: 1920,            // 최대 너비
  maxHeight: 1080,           // 최대 높이
  maintainAspectRatio: true  // 종횡비 유지 (기본값: true)
});
```

### 배치 변환

```javascript
import { convertBatch } from 'webp2any';

const files = [...input.files]; // WebP 파일 배열
const blobs = await convertBatch(files, 'jpeg', { quality: 0.85 });
```

### 다운로드 헬퍼

```javascript
import { webp2png, downloadBlob } from 'webp2any';

const blob = await webp2png(webpFile);
downloadBlob(blob, 'converted-image.png');
```

### 이미지 크기 가져오기

```javascript
import { getImageSize } from 'webp2any';

const { width, height } = await getImageSize(webpFile);
console.log(`이미지 크기: ${width}x${height}`);
```

## API

### `webp2any(file, format, options?)`

WebP 파일을 지정된 형식으로 변환합니다.

- **file**: `File` - WebP 이미지 파일
- **format**: `'png' | 'jpeg'` - 출력 형식
- **options**: `ConvertOptions` (선택사항)
  - `quality`: `number` - JPEG 품질 (0-1), 기본값: 0.9
  - `maxWidth`: `number` - 최대 너비
  - `maxHeight`: `number` - 최대 높이
  - `maintainAspectRatio`: `boolean` - 종횡비 유지 (기본값: true)
- **반환값**: `Promise<Blob>` - 변환된 이미지

### `webp2png(file, options?)`

WebP 파일을 PNG로 변환합니다.

- **file**: `File` - WebP 이미지 파일
- **options**: `ConvertOptions` (선택사항)
- **반환값**: `Promise<Blob>` - PNG 이미지

### `webp2jpg(file, quality?, options?)`

WebP 파일을 JPEG로 변환합니다.

- **file**: `File` - WebP 이미지 파일
- **quality**: `number` (선택사항) - JPEG 품질 (0-1), 기본값: 0.9
- **options**: `ConvertOptions` (선택사항)
- **반환값**: `Promise<Blob>` - JPEG 이미지

### `convertBatch(files, format, options?)`

여러 WebP 파일을 병렬로 변환합니다.

- **files**: `File[]` - WebP 파일 배열
- **format**: `'png' | 'jpeg'` - 출력 형식
- **options**: `ConvertOptions` (선택사항)
- **반환값**: `Promise<Blob[]>` - 변환된 이미지 배열

### `getImageSize(file)`

이미지 파일의 크기를 가져옵니다.

- **file**: `File` - 이미지 파일
- **반환값**: `Promise<{ width: number, height: number }>` - 이미지 크기

### `downloadBlob(blob, filename)`

Blob을 다운로드합니다.

- **blob**: `Blob` - 다운로드할 Blob
- **filename**: `string` - 다운로드할 파일명

## 완전한 예제

```html
<!DOCTYPE html>
<html>
<head>
  <title>WebP 변환기</title>
</head>
<body>
  <input type="file" id="input" accept="image/webp" multiple>
  <button id="convert">PNG로 변환</button>

  <script type="module">
    import { convertBatch, downloadBlob } from './src/index.js';

    document.getElementById('convert').addEventListener('click', async () => {
      const input = document.getElementById('input');
      const files = [...input.files];

      if (files.length === 0) {
        alert('WebP 파일을 선택해주세요');
        return;
      }

      try {
        const blobs = await convertBatch(files, 'png');

        blobs.forEach((blob, index) => {
          const filename = files[index].name.replace(/\.webp$/i, '.png');
          downloadBlob(blob, filename);
        });

        alert(`${blobs.length}개의 이미지 변환 완료!`);
      } catch (error) {
        alert(`변환 실패: ${error.message}`);
      }
    });
  </script>
</body>
</html>
```

## 브라우저 호환성

이 라이브러리는 다음이 필요합니다:
- Canvas API 지원
- ES6+ 기능 (Promise, async/await)
- File API 및 Blob 지원

지원 브라우저:
- Chrome/Edge 15+
- Firefox 52+
- Safari 11+

## 에러 처리

라이브러리는 일반적인 문제에 대해 설명적인 에러를 발생시킵니다:

```javascript
try {
  const blob = await webp2png(file);
} catch (error) {
  if (error.message.includes('Invalid file type')) {
    console.error('파일이 WebP 이미지가 아닙니다');
  } else if (error.message.includes('Failed to load')) {
    console.error('이미지를 로드할 수 없습니다');
  } else if (error.message.includes('canvas')) {
    console.error('Canvas 컨텍스트 생성 실패');
  }
}
```

## 테스트

```bash
# 테스트 실행
bun test

# 또는
npm test
```

이 라이브러리는 Playwright를 사용하여 실제 브라우저 환경에서 테스트됩니다.

## 라이선스

MIT

## 작성자

justn-hyeok
