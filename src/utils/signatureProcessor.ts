export interface SignatureProcessOptions {
  threshold: number; // 100 - 250 (cutoff for paper & shading removal)
  contrast: number; // 1.0 - 3.0 (ink boldness / darkness)
  smoothness: number; // 1 - 5 (anti-aliasing curve for vector look)
  inkColor: 'black' | 'blue' | 'theme' | 'custom';
  customColor?: string;
  themeColor?: string;
  autoCrop?: boolean;
}

export interface ProcessedSignatureResult {
  pngDataUrl: string;
  svgMarkup: string;
  svgDataUrl: string;
  width: number;
  height: number;
}

// Convert hex string to RGB
function hexToRgb(hex: string): [number, number, number] {
  let clean = hex.replace('#', '').trim();
  if (clean.length === 3) {
    clean = clean.split('').map((c) => c + c).join('');
  }
  const num = parseInt(clean, 16);
  if (isNaN(num)) return [0, 0, 0];
  return [(num >> 16) & 255, (num >> 8) & 255, num & 255];
}

/**
 * Removes paper texture, background shading, and shadows from a handwritten signature photo
 * and converts it into a clean, transparent, SVG / vector-like graphic.
 */
export function processSignatureImage(
  img: HTMLImageElement,
  options: SignatureProcessOptions
): ProcessedSignatureResult {
  const {
    threshold = 200,
    contrast = 1.8,
    smoothness = 2,
    inkColor = 'black',
    customColor = '#000000',
    themeColor = '#0056b3',
    autoCrop = true,
  } = options;

  // Determine target ink color RGB
  let targetR = 0;
  let targetG = 0;
  let targetB = 0;

  if (inkColor === 'blue') {
    [targetR, targetG, targetB] = [16, 52, 166]; // Classic royal ballpoint blue
  } else if (inkColor === 'theme') {
    [targetR, targetG, targetB] = hexToRgb(themeColor);
  } else if (inkColor === 'custom') {
    [targetR, targetG, targetB] = hexToRgb(customColor);
  }

  // Create high-resolution processing canvas
  const maxDimension = 1200;
  let srcW = img.naturalWidth || img.width;
  let srcH = img.naturalHeight || img.height;

  if (srcW > maxDimension || srcH > maxDimension) {
    if (srcW > srcH) {
      srcH = Math.round((srcH * maxDimension) / srcW);
      srcW = maxDimension;
    } else {
      srcW = Math.round((srcW * maxDimension) / srcH);
      srcH = maxDimension;
    }
  }

  const canvas = document.createElement('canvas');
  canvas.width = srcW;
  canvas.height = srcH;
  const ctx = canvas.getContext('2d', { willReadFrequently: true });
  if (!ctx) {
    throw new Error('Canvas 2D context not available');
  }

  // Draw source image
  ctx.drawImage(img, 0, 0, srcW, srcH);

  const imgData = ctx.getImageData(0, 0, srcW, srcH);
  const data = imgData.data;
  const totalPixels = data.length;

  let minX = srcW;
  let minY = srcH;
  let maxX = 0;
  let maxY = 0;
  let hasInk = false;

  const edgeRamp = Math.max(4, smoothness * 8);

  for (let i = 0; i < totalPixels; i += 4) {
    const r = data[i];
    const g = data[i + 1];
    const b = data[i + 2];

    // Standard perceptual luminance
    const lum = 0.299 * r + 0.587 * g + 0.114 * b;

    if (lum >= threshold) {
      // Paper background, shadow, or bright area -> 100% transparent
      data[i + 3] = 0;
    } else {
      // Ink stroke detected
      const delta = threshold - lum;
      const alphaFactor = Math.min(1, delta / edgeRamp);
      const contrastFactor = Math.min(1, Math.pow(delta / threshold, 1 / contrast));
      const finalAlpha = Math.round(alphaFactor * contrastFactor * 255);

      data[i] = targetR;
      data[i + 1] = targetG;
      data[i + 2] = targetB;
      data[i + 3] = finalAlpha;

      if (finalAlpha > 25) {
        hasInk = true;
        const pixelIdx = i / 4;
        const x = pixelIdx % srcW;
        const y = Math.floor(pixelIdx / srcW);
        if (x < minX) minX = x;
        if (x > maxX) maxX = x;
        if (y < minY) minY = y;
        if (y > maxY) maxY = y;
      }
    }
  }

  ctx.putImageData(imgData, 0, 0);

  // Auto-crop to stroke bounding box if enabled and ink found
  let finalCanvas = canvas;
  let finalW = srcW;
  let finalH = srcH;

  if (autoCrop && hasInk && maxX > minX && maxY > minY) {
    const pad = 8;
    const cropX = Math.max(0, minX - pad);
    const cropY = Math.max(0, minY - pad);
    const cropW = Math.min(srcW - cropX, maxX - minX + pad * 2);
    const cropH = Math.min(srcH - cropY, maxY - minY + pad * 2);

    const croppedCanvas = document.createElement('canvas');
    croppedCanvas.width = cropW;
    croppedCanvas.height = cropH;
    const croppedCtx = croppedCanvas.getContext('2d');
    if (croppedCtx) {
      croppedCtx.drawImage(canvas, cropX, cropY, cropW, cropH, 0, 0, cropW, cropH);
      finalCanvas = croppedCanvas;
      finalW = cropW;
      finalH = cropH;
    }
  }

  const pngDataUrl = finalCanvas.toDataURL('image/png');

  // Generate SVG vector container wrapping the clean transparent artwork
  const svgMarkup = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${finalW} ${finalH}" width="${finalW}" height="${finalH}">
  <image href="${pngDataUrl}" width="${finalW}" height="${finalH}" />
</svg>`;

  const svgDataUrl = `data:image/svg+xml;charset=utf-8,${encodeURIComponent(svgMarkup)}`;

  return {
    pngDataUrl,
    svgMarkup,
    svgDataUrl,
    width: finalW,
    height: finalH,
  };
}
