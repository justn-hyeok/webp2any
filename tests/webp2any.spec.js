import { test, expect } from '@playwright/test';

// 브라우저에서 Canvas로 직접 WebP를 생성하는 헬퍼 함수
async function createTestWebPFile(page) {
  return await page.evaluate(async () => {
    const canvas = document.createElement('canvas');
    canvas.width = 10;
    canvas.height = 10;
    const ctx = canvas.getContext('2d');
    ctx.fillStyle = 'red';
    ctx.fillRect(0, 0, 10, 10);

    return new Promise((resolve) => {
      canvas.toBlob((blob) => {
        const file = new File([blob], 'test.webp', { type: 'image/webp' });
        resolve(file);
      }, 'image/webp');
    });
  });
}

test.describe('webp2any 브라우저 테스트', () => {
  test.beforeEach(async ({ page }) => {
    // 테스트 페이지 로드
    await page.goto('http://localhost:3000/demo');

    // ES 모듈 로드 완료까지 대기
    await page.waitForFunction(() => window.webp2anyLoaded === true, { timeout: 10000 });
  });

  test('페이지가 정상적으로 로드되는지 확인', async ({ page }) => {
    // 제목 확인
    await expect(page).toHaveTitle(/webp2any Demo/);

    // 주요 요소들이 존재하는지 확인
    await expect(page.locator('h1')).toContainText('webp2any Demo');

    // convertBtn이 존재하는지 확인
    await expect(page.locator('#convertBtn')).toHaveCount(1);
  });

  test('WebP 파일을 PNG로 변환할 수 있는지 확인', async ({ page }) => {
    const result = await page.evaluate(async () => {
      // Canvas로 WebP 생성
      const canvas = document.createElement('canvas');
      canvas.width = 10;
      canvas.height = 10;
      const ctx = canvas.getContext('2d');
      ctx.fillStyle = 'red';
      ctx.fillRect(0, 0, 10, 10);

      const webpBlob = await new Promise((resolve) => {
        canvas.toBlob(resolve, 'image/webp');
      });
      const file = new File([webpBlob], 'test.webp', { type: 'image/webp' });

      // webp2png 함수 실행
      const pngBlob = await window.webp2png(file);

      return {
        type: pngBlob.type,
        size: pngBlob.size
      };
    });

    // PNG MIME 타입인지 확인
    expect(result.type).toBe('image/png');
    // Blob 크기가 0보다 큰지 확인
    expect(result.size).toBeGreaterThan(0);
  });

  test('WebP 파일을 JPEG로 변환할 수 있는지 확인', async ({ page }) => {
    const result = await page.evaluate(async () => {
      // Canvas로 WebP 생성
      const canvas = document.createElement('canvas');
      canvas.width = 10;
      canvas.height = 10;
      const ctx = canvas.getContext('2d');
      ctx.fillStyle = 'red';
      ctx.fillRect(0, 0, 10, 10);

      const webpBlob = await new Promise((resolve) => {
        canvas.toBlob(resolve, 'image/webp');
      });
      const file = new File([webpBlob], 'test.webp', { type: 'image/webp' });

      // webp2jpg 함수 실행
      const jpegBlob = await window.webp2jpg(file);

      return {
        type: jpegBlob.type,
        size: jpegBlob.size
      };
    });

    // JPEG MIME 타입인지 확인
    expect(result.type).toBe('image/jpeg');
    expect(result.size).toBeGreaterThan(0);
  });

  test('webp2any 함수로 형식을 지정하여 변환할 수 있는지 확인', async ({ page }) => {
    const result = await page.evaluate(async () => {
      // Canvas로 WebP 생성
      const canvas = document.createElement('canvas');
      canvas.width = 10;
      canvas.height = 10;
      const ctx = canvas.getContext('2d');
      ctx.fillStyle = 'red';
      ctx.fillRect(0, 0, 10, 10);

      const webpBlob = await new Promise((resolve) => {
        canvas.toBlob(resolve, 'image/webp');
      });
      const file = new File([webpBlob], 'test.webp', { type: 'image/webp' });

      // webp2any 함수로 PNG 변환
      const pngBlob = await window.webp2any(file, 'png');

      // webp2any 함수로 JPEG 변환
      const jpegBlob = await window.webp2any(file, 'jpeg', { quality: 0.8 });

      return {
        png: { type: pngBlob.type, size: pngBlob.size },
        jpeg: { type: jpegBlob.type, size: jpegBlob.size }
      };
    });

    expect(result.png.type).toBe('image/png');
    expect(result.png.size).toBeGreaterThan(0);
    expect(result.jpeg.type).toBe('image/jpeg');
    expect(result.jpeg.size).toBeGreaterThan(0);
  });

  test('이미지 크기 조정 옵션이 작동하는지 확인', async ({ page }) => {
    const result = await page.evaluate(async () => {
      // 큰 캔버스로 WebP 생성
      const canvas = document.createElement('canvas');
      canvas.width = 800;
      canvas.height = 600;
      const ctx = canvas.getContext('2d');
      ctx.fillStyle = 'red';
      ctx.fillRect(0, 0, 800, 600);

      const webpBlob = await new Promise((resolve) => {
        canvas.toBlob(resolve, 'image/webp');
      });
      const file = new File([webpBlob], 'test.webp', { type: 'image/webp' });

      // 원본 크기 확인
      const { width: origWidth, height: origHeight } = await window.getImageSize(file);

      // 크기 조정하여 변환
      const resizedBlob = await window.webp2any(file, 'png', {
        maxWidth: 400,
        maxHeight: 300,
        maintainAspectRatio: true
      });

      // 변환된 이미지의 크기를 Image로 확인
      const resizedUrl = URL.createObjectURL(resizedBlob);
      const resizedImg = new Image();
      await new Promise((resolve, reject) => {
        resizedImg.onload = resolve;
        resizedImg.onerror = reject;
        resizedImg.src = resizedUrl;
      });
      URL.revokeObjectURL(resizedUrl);

      return {
        original: { width: origWidth, height: origHeight },
        resized: { width: resizedImg.naturalWidth, height: resizedImg.naturalHeight }
      };
    });

    // 원본 이미지는 800x600 픽셀
    expect(result.original.width).toBe(800);
    expect(result.original.height).toBe(600);
    // 리사이즈된 이미지는 400x300으로 축소되어야 함 (aspect ratio 유지)
    expect(result.resized.width).toBe(400);
    expect(result.resized.height).toBe(300);
  });

  test('convertBatch로 여러 파일을 동시에 변환할 수 있는지 확인', async ({ page }) => {
    const result = await page.evaluate(async () => {
      // Canvas로 WebP 생성
      const canvas = document.createElement('canvas');
      canvas.width = 10;
      canvas.height = 10;
      const ctx = canvas.getContext('2d');
      ctx.fillStyle = 'red';
      ctx.fillRect(0, 0, 10, 10);

      const webpBlob = await new Promise((resolve) => {
        canvas.toBlob(resolve, 'image/webp');
      });

      // 동일한 이미지로 3개의 파일 생성
      const files = [
        new File([webpBlob], 'test1.webp', { type: 'image/webp' }),
        new File([webpBlob], 'test2.webp', { type: 'image/webp' }),
        new File([webpBlob], 'test3.webp', { type: 'image/webp' })
      ];

      // convertBatch 함수 실행 (Blob 배열 반환)
      const blobs = await window.convertBatch(files, 'png');

      return {
        count: blobs.length,
        types: blobs.map(blob => blob.type),
        sizes: blobs.map(blob => blob.size)
      };
    });

    // 3개의 결과가 반환되어야 함
    expect(result.count).toBe(3);
    // 모두 PNG 타입이어야 함
    expect(result.types).toEqual(['image/png', 'image/png', 'image/png']);
    // 모든 크기가 0보다 커야 함
    result.sizes.forEach(size => {
      expect(size).toBeGreaterThan(0);
    });
  });

  test('잘못된 파일 형식일 때 에러를 발생시키는지 확인', async ({ page }) => {
    const error = await page.evaluate(async () => {
      try {
        // 잘못된 MIME 타입의 파일 생성
        const blob = new Blob(['test'], { type: 'text/plain' });
        const file = new File([blob], 'test.txt', { type: 'text/plain' });

        await window.webp2any(file, 'png');
        return null;
      } catch (err) {
        return err.message;
      }
    });

    // 에러 메시지가 반환되어야 함
    expect(error).toContain('image/webp');
  });

  test('getImageSize 함수가 정확한 이미지 크기를 반환하는지 확인', async ({ page }) => {
    const result = await page.evaluate(async () => {
      // Canvas로 WebP 생성
      const canvas = document.createElement('canvas');
      canvas.width = 10;
      canvas.height = 10;
      const ctx = canvas.getContext('2d');
      ctx.fillStyle = 'red';
      ctx.fillRect(0, 0, 10, 10);

      const webpBlob = await new Promise((resolve) => {
        canvas.toBlob(resolve, 'image/webp');
      });
      const file = new File([webpBlob], 'test.webp', { type: 'image/webp' });

      return await window.getImageSize(file);
    });

    // 10x10 픽셀 이미지이므로
    expect(result.width).toBe(10);
    expect(result.height).toBe(10);
  });

  test('UI 인터랙션: 파일 선택 및 변환 버튼 활성화', async ({ page }) => {
    // 초기에는 변환 버튼이 비활성화되어 있어야 함
    const convertBtn = page.locator('#convertBtn');
    await expect(convertBtn).toBeDisabled();

    // 직접 이벤트를 트리거하여 파일 선택 시뮬레이션
    await page.evaluate(async () => {
      // Canvas로 WebP 생성
      const canvas = document.createElement('canvas');
      canvas.width = 10;
      canvas.height = 10;
      const ctx = canvas.getContext('2d');
      ctx.fillStyle = 'red';
      ctx.fillRect(0, 0, 10, 10);

      const webpBlob = await new Promise((resolve) => {
        canvas.toBlob(resolve, 'image/webp');
      });
      const file = new File([webpBlob], 'test.webp', { type: 'image/webp' });

      const dataTransfer = new DataTransfer();
      dataTransfer.items.add(file);

      const fileInput = document.getElementById('fileInput');
      Object.defineProperty(fileInput, 'files', {
        value: dataTransfer.files,
        writable: false
      });

      fileInput.dispatchEvent(new Event('change', { bubbles: true }));
    });

    // 변환 버튼이 활성화될 때까지 대기
    await expect(convertBtn).toBeEnabled({ timeout: 3000 });
  });
});
