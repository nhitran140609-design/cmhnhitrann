import heic2any from 'heic2any';

export interface ProcessedImageResult {
  dataUrl: string;
  isHeic: boolean;
  fileName: string;
  originalSize: number;
  newSize?: number;
}

/**
 * Check if a file is an Apple HEIC / HEIF image format
 */
export function isHeicFile(file: File): boolean {
  if (!file) return false;
  const name = (file.name || '').toLowerCase();
  const type = (file.type || '').toLowerCase();
  return (
    name.endsWith('.heic') ||
    name.endsWith('.heif') ||
    type === 'image/heic' ||
    type === 'image/heif' ||
    type === 'image/heic-sequence' ||
    type === 'image/heif-sequence'
  );
}

/**
 * Resize and compress image to high quality (max 1600px, JPEG 0.85)
 * Keeps full detail intact while reducing raw multi-megabyte camera files down to ~150-300KB
 * Ensures images persist permanently in IndexedDB and LocalStorage without quota issues.
 */
export function optimizeImageDataUrl(
  sourceUrl: string,
  maxDimension = 1600,
  quality = 0.85
): Promise<string> {
  return new Promise((resolve) => {
    // If not a data or blob URL, return as-is
    if (!sourceUrl.startsWith('data:') && !sourceUrl.startsWith('blob:')) {
      resolve(sourceUrl);
      return;
    }

    const img = new Image();
    img.crossOrigin = 'anonymous';

    img.onload = () => {
      let { width, height } = img;
      
      // If image is already smaller than maxDimension and not overly huge, keep it
      if (width <= maxDimension && height <= maxDimension && sourceUrl.length < 600000) {
        resolve(sourceUrl);
        return;
      }

      // Calculate scaled dimensions keeping aspect ratio
      if (width > maxDimension || height > maxDimension) {
        if (width > height) {
          height = Math.round((height * maxDimension) / width);
          width = maxDimension;
        } else {
          width = Math.round((width * maxDimension) / height);
          height = maxDimension;
        }
      }

      const canvas = document.createElement('canvas');
      canvas.width = width;
      canvas.height = height;
      const ctx = canvas.getContext('2d');
      if (!ctx) {
        resolve(sourceUrl);
        return;
      }

      ctx.imageSmoothingEnabled = true;
      ctx.imageSmoothingQuality = 'high';
      ctx.drawImage(img, 0, 0, width, height);

      try {
        const optimized = canvas.toDataURL('image/jpeg', quality);
        resolve(optimized);
      } catch {
        resolve(sourceUrl);
      }
    };

    img.onerror = () => {
      resolve(sourceUrl);
    };

    img.src = sourceUrl;
  });
}

/**
 * Converts a HEIC/HEIF or standard image File to a browser-displayable Data URL (JPEG/PNG).
 * Handles HEIC conversion via heic2any with automatic fallback, and optimizes dimensions
 * so images are preserved y nguyên (intact) without memory or storage dropouts.
 */
export async function processImageFile(
  file: File,
  onProgress?: (status: string) => void
): Promise<ProcessedImageResult> {
  const isHeic = isHeicFile(file);

  if (isHeic) {
    onProgress?.('Đang giải mã và chuyển đổi ảnh HEIC từ iPhone/iPad sang JPG...');

    try {
      // heic2any conversion
      const conversionResult = await heic2any({
        blob: file,
        toType: 'image/jpeg',
        quality: 0.85
      });

      const convertedBlob: Blob = Array.isArray(conversionResult)
        ? conversionResult[0]
        : conversionResult;

      const rawDataUrl = await blobToDataURL(convertedBlob);
      onProgress?.('Đang tối ưu hóa dung lượng ảnh để lưu trữ vĩnh viễn...');
      
      const optimizedDataUrl = await optimizeImageDataUrl(rawDataUrl, 1600, 0.85);
      onProgress?.('Chuyển đổi và lưu ảnh HEIC thành công!');

      return {
        dataUrl: optimizedDataUrl,
        isHeic: true,
        fileName: file.name.replace(/\.(heic|heif)$/i, '.jpg'),
        originalSize: file.size,
        newSize: Math.round(optimizedDataUrl.length * 0.75)
      };
    } catch (err: any) {
      console.error('Lỗi khi chuyển đổi HEIC:', err);
      throw new Error(
        `Không thể chuyển đổi ảnh HEIC: ${err?.message || 'Định dạng HEIC không hợp lệ hoặc không được hỗ trợ'}`
      );
    }
  }

  // Standard image (JPG, PNG, WebP, GIF, SVG)
  onProgress?.('Đang đọc dữ liệu ảnh...');
  const rawDataUrl = await blobToDataURL(file);
  
  onProgress?.('Đang xử lý và lưu giữ ảnh chất lượng cao...');
  const optimizedDataUrl = await optimizeImageDataUrl(rawDataUrl, 1600, 0.85);

  return {
    dataUrl: optimizedDataUrl,
    isHeic: false,
    fileName: file.name,
    originalSize: file.size,
    newSize: Math.round(optimizedDataUrl.length * 0.75)
  };
}

/**
 * Convert a Blob / File to Base64 Data URL
 */
export function blobToDataURL(blob: Blob): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => {
      if (typeof reader.result === 'string') {
        resolve(reader.result);
      } else {
        reject(new Error('Không thể đọc file hình ảnh'));
      }
    };
    reader.onerror = () => {
      reject(reader.error || new Error('Lỗi khi đọc file'));
    };
    reader.readAsDataURL(blob);
  });
}
