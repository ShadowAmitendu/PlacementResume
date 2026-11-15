import React, { useState, useRef, useEffect, useCallback } from 'react';
import { useResume } from '../../context/ResumeContext';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '../ui/dialog';
import { Button } from '../ui/button';
import { Slider } from '../ui/slider';
import {
  Crop as CropIcon,
  RotateCw,
  RotateCcw,
  FlipHorizontal,
  ZoomIn,
  ZoomOut,
  Upload,
  Check,
  RefreshCw,
} from 'lucide-react';

type AspectRatioPreset = '4:5' | '1:1' | '3:4' | 'free';

export const ImageCropModal: React.FC = () => {
  const {
    isCropModalOpen,
    setIsCropModalOpen,
    cropImageSrc,
    setPhoto,
    showToast,
  } = useResume();

  const fileInputRef = useRef<HTMLInputElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);

  const [imageObj, setImageObj] = useState<HTMLImageElement | null>(null);
  const [aspectRatio, setAspectRatio] = useState<AspectRatioPreset>('4:5');
  const [zoom, setZoom] = useState<number>(1);
  const [rotation, setRotation] = useState<number>(0); // 0, 90, 180, 270
  const [isFlippedH, setIsFlippedH] = useState<boolean>(false);
  const [pan, setPan] = useState<{ x: number; y: number }>({ x: 0, y: 0 });
  const [isDragging, setIsDragging] = useState<boolean>(false);
  const [dragStart, setDragStart] = useState<{ x: number; y: number }>({ x: 0, y: 0 });

  // Load image object whenever source changes or modal opens
  useEffect(() => {
    if (!isCropModalOpen || !cropImageSrc) {
      return;
    }
    const img = new Image();
    img.crossOrigin = 'anonymous';
    img.onload = () => {
      setImageObj(img);
      setZoom(1);
      setRotation(0);
      setIsFlippedH(false);
      setPan({ x: 0, y: 0 });
    };
    img.src = cropImageSrc;
  }, [isCropModalOpen, cropImageSrc]);

  // Compute crop viewport dimensions inside the 460x360 canvas
  const getCropBoxSize = useCallback(() => {
    switch (aspectRatio) {
      case '4:5': // Standard Resume ratio (100px x 125px)
        return { w: 224, h: 280 };
      case '1:1': // Square
        return { w: 260, h: 260 };
      case '3:4': // Classic Portrait
        return { w: 225, h: 300 };
      case 'free':
      default:
        return { w: 260, h: 260 };
    }
  }, [aspectRatio]);

  // Redraw canvas with image, transform, mask, grid, and corner guides
  const drawCanvas = useCallback(() => {
    const canvas = canvasRef.current;
    if (!canvas || !imageObj) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const cw = canvas.width;
    const ch = canvas.height;
    const { w: cropW, h: cropH } = getCropBoxSize();
    const cropX = (cw - cropW) / 2;
    const cropY = (ch - cropH) / 2;

    ctx.clearRect(0, 0, cw, ch);

    // 1. Draw image with scale, rotation, flip, and pan
    ctx.save();
    // Center of canvas
    ctx.translate(cw / 2 + pan.x, ch / 2 + pan.y);

    // Apply rotation
    ctx.rotate((rotation * Math.PI) / 180);

    // Apply flip
    ctx.scale(isFlippedH ? -1 : 1, 1);

    // Calculate base scale to fill the crop box
    const isRotated90or270 = rotation % 180 !== 0;
    const effectiveW = isRotated90or270 ? imageObj.naturalHeight : imageObj.naturalWidth;
    const effectiveH = isRotated90or270 ? imageObj.naturalWidth : imageObj.naturalHeight;

    const baseScale = Math.max(cropW / effectiveW, cropH / effectiveH);
    const finalScale = baseScale * zoom;

    const drawW = imageObj.naturalWidth * finalScale;
    const drawH = imageObj.naturalHeight * finalScale;

    ctx.drawImage(imageObj, -drawW / 2, -drawH / 2, drawW, drawH);
    ctx.restore();

    // 2. Draw darkened overlay outside crop box
    ctx.fillStyle = 'rgba(0, 0, 0, 0.6)';
    // Top
    ctx.fillRect(0, 0, cw, cropY);
    // Bottom
    ctx.fillRect(0, cropY + cropH, cw, ch - (cropY + cropH));
    // Left
    ctx.fillRect(0, cropY, cropX, cropH);
    // Right
    ctx.fillRect(cropX + cropW, cropY, cw - (cropX + cropW), cropH);

    // 3. Draw crop box border
    ctx.strokeStyle = '#ffffff';
    ctx.lineWidth = 2;
    ctx.strokeRect(cropX, cropY, cropW, cropH);

    // 4. Rule-of-thirds grid
    ctx.strokeStyle = 'rgba(255, 255, 255, 0.28)';
    ctx.lineWidth = 1;
    ctx.setLineDash([4, 4]);

    // Vertical grid lines
    ctx.beginPath();
    ctx.moveTo(cropX + cropW / 3, cropY);
    ctx.lineTo(cropX + cropW / 3, cropY + cropH);
    ctx.moveTo(cropX + (cropW * 2) / 3, cropY);
    ctx.lineTo(cropX + (cropW * 2) / 3, cropY + cropH);

    // Horizontal grid lines
    ctx.moveTo(cropX, cropY + cropH / 3);
    ctx.lineTo(cropX + cropW, cropY + cropH / 3);
    ctx.moveTo(cropX, cropY + (cropH * 2) / 3);
    ctx.lineTo(cropX + cropW, cropY + (cropH * 2) / 3);
    ctx.stroke();
    ctx.setLineDash([]);

    // 5. Corner markers (L-brackets)
    const markerLen = 14;
    ctx.strokeStyle = '#38bdf8'; // Vibrant cyan accent
    ctx.lineWidth = 3;
    ctx.beginPath();

    // Top-left
    ctx.moveTo(cropX, cropY + markerLen);
    ctx.lineTo(cropX, cropY);
    ctx.lineTo(cropX + markerLen, cropY);

    // Top-right
    ctx.moveTo(cropX + cropW - markerLen, cropY);
    ctx.lineTo(cropX + cropW, cropY);
    ctx.lineTo(cropX + cropW, cropY + markerLen);

    // Bottom-left
    ctx.moveTo(cropX, cropY + cropH - markerLen);
    ctx.lineTo(cropX, cropY + cropH);
    ctx.lineTo(cropX + markerLen, cropY + cropH);

    // Bottom-right
    ctx.moveTo(cropX + cropW - markerLen, cropY + cropH);
    ctx.lineTo(cropX + cropW, cropY + cropH);
    ctx.lineTo(cropX + cropW, cropY + cropH - markerLen);

    ctx.stroke();
  }, [imageObj, getCropBoxSize, zoom, rotation, isFlippedH, pan]);

  useEffect(() => {
    drawCanvas();
  }, [drawCanvas]);

  // Handle Drag / Pan Events
  const handleMouseDown = (e: React.MouseEvent<HTMLCanvasElement>) => {
    setIsDragging(true);
    setDragStart({ x: e.clientX - pan.x, y: e.clientY - pan.y });
  };

  const handleMouseMove = (e: React.MouseEvent<HTMLCanvasElement>) => {
    if (!isDragging) return;
    setPan({
      x: e.clientX - dragStart.x,
      y: e.clientY - dragStart.y,
    });
  };

  const handleMouseUp = () => {
    setIsDragging(false);
  };

  // Touch handlers for mobile / tablet gestures
  const handleTouchStart = (e: React.TouchEvent<HTMLCanvasElement>) => {
    if (e.touches.length === 1) {
      const touch = e.touches[0];
      setIsDragging(true);
      setDragStart({ x: touch.clientX - pan.x, y: touch.clientY - pan.y });
    }
  };

  const handleTouchMove = (e: React.TouchEvent<HTMLCanvasElement>) => {
    if (!isDragging || e.touches.length !== 1) return;
    const touch = e.touches[0];
    setPan({
      x: touch.clientX - dragStart.x,
      y: touch.clientY - dragStart.y,
    });
  };

  const handleTouchEnd = () => {
    setIsDragging(false);
  };

  // Mouse wheel zoom
  const handleWheel = (e: React.WheelEvent<HTMLCanvasElement>) => {
    e.preventDefault();
    const delta = e.deltaY > 0 ? -0.1 : 0.1;
    setZoom((prev) => Math.max(1, Math.min(3, Math.round((prev + delta) * 10) / 10)));
  };

  // Upload a different photo
  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (ev) => {
      const src = ev.target?.result;
      if (typeof src === 'string') {
        const img = new Image();
        img.onload = () => {
          setImageObj(img);
          setZoom(1);
          setRotation(0);
          setIsFlippedH(false);
          setPan({ x: 0, y: 0 });
        };
        img.src = src;
      }
    };
    reader.readAsDataURL(file);
    e.target.value = '';
  };

  // Reset transforms
  const handleReset = () => {
    setZoom(1);
    setRotation(0);
    setIsFlippedH(false);
    setPan({ x: 0, y: 0 });
  };

  // Export cropped high-res photo
  const handleApplyCrop = () => {
    if (!imageObj) return;

    const canvas = canvasRef.current;
    if (!canvas) return;

    const { w: cropW, h: cropH } = getCropBoxSize();

    // High resolution export dimensions (scaled 2x for sharp print quality)
    const exportWidth = cropW * 2;
    const exportHeight = cropH * 2;

    const exportCanvas = document.createElement('canvas');
    exportCanvas.width = exportWidth;
    exportCanvas.height = exportHeight;
    const expCtx = exportCanvas.getContext('2d');
    if (!expCtx) return;

    // Calculate base scale used in preview
    const isRotated90or270 = rotation % 180 !== 0;
    const effectiveW = isRotated90or270 ? imageObj.naturalHeight : imageObj.naturalWidth;
    const effectiveH = isRotated90or270 ? imageObj.naturalWidth : imageObj.naturalHeight;
    const baseScale = Math.max(cropW / effectiveW, cropH / effectiveH);
    const finalScale = baseScale * zoom;

    expCtx.save();
    // Translate to center of export canvas + scaled pan offset
    expCtx.translate(exportWidth / 2 + pan.x * 2, exportHeight / 2 + pan.y * 2);

    // Apply rotation
    expCtx.rotate((rotation * Math.PI) / 180);

    // Apply flip
    expCtx.scale(isFlippedH ? -1 : 1, 1);

    // Draw full image scaled up 2x for high resolution
    const drawW = imageObj.naturalWidth * finalScale * 2;
    const drawH = imageObj.naturalHeight * finalScale * 2;

    expCtx.drawImage(imageObj, -drawW / 2, -drawH / 2, drawW, drawH);
    expCtx.restore();

    const croppedBase64 = exportCanvas.toDataURL('image/jpeg', 0.9);
    setPhoto(croppedBase64);
    showToast('Profile photo cropped & updated successfully');
    setIsCropModalOpen(false);
  };

  return (
    <Dialog open={isCropModalOpen} onOpenChange={setIsCropModalOpen}>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <div className="flex items-center gap-2">
            <CropIcon className="w-5 h-5 text-primary shrink-0" />
            <DialogTitle>Crop Profile Picture</DialogTitle>
          </div>
        </DialogHeader>

        <div className="space-y-4 py-2">
          {/* Main Cropper Viewport */}
          <div className="relative flex justify-center bg-neutral-950/90 rounded-lg p-2 overflow-hidden border border-border shadow-inner">
            <canvas
              ref={canvasRef}
              width={460}
              height={360}
              onMouseDown={handleMouseDown}
              onMouseMove={handleMouseMove}
              onMouseUp={handleMouseUp}
              onMouseLeave={handleMouseUp}
              onWheel={handleWheel}
              onTouchStart={handleTouchStart}
              onTouchMove={handleTouchMove}
              onTouchEnd={handleTouchEnd}
              className={`rounded cursor-move select-none touch-none max-w-full h-auto aspect-[460/360] ${
                isDragging ? 'cursor-grabbing' : 'cursor-grab'
              }`}
              title="Click and drag to reposition image, use scroll wheel to zoom"
            />
            <div className="absolute bottom-3 left-4 text-[10px] text-neutral-400 bg-neutral-900/80 px-2 py-0.5 rounded pointer-events-none select-none">
              Drag or touch to reposition • Scroll to zoom
            </div>
          </div>

          {/* Aspect Ratio Presets */}
          <div className="space-y-1.5">
            <label className="text-[11px] font-semibold text-[var(--ui-text-dim)] uppercase tracking-wider block">
              Aspect Ratio
            </label>
            <div className="flex flex-wrap items-center gap-2">
              <Button
                type="button"
                size="sm"
                variant={aspectRatio === '4:5' ? 'default' : 'outline'}
                onClick={() => setAspectRatio('4:5')}
                className="text-xs h-7.5 px-3"
              >
                4:5 (Resume Standard)
              </Button>
              <Button
                type="button"
                size="sm"
                variant={aspectRatio === '1:1' ? 'default' : 'outline'}
                onClick={() => setAspectRatio('1:1')}
                className="text-xs h-7.5 px-3"
              >
                1:1 (Square)
              </Button>
              <Button
                type="button"
                size="sm"
                variant={aspectRatio === '3:4' ? 'default' : 'outline'}
                onClick={() => setAspectRatio('3:4')}
                className="text-xs h-7.5 px-3"
              >
                3:4 (Portrait)
              </Button>
              <Button
                type="button"
                size="sm"
                variant={aspectRatio === 'free' ? 'default' : 'outline'}
                onClick={() => setAspectRatio('free')}
                className="text-xs h-7.5 px-3"
              >
                Freeform
              </Button>
            </div>
          </div>

          {/* Transformation Controls: Zoom & Orientation */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-1">
            {/* Zoom Slider */}
            <div className="space-y-1.5">
              <div className="flex items-center justify-between text-xs font-medium">
                <span className="flex items-center gap-1 text-[var(--ui-text-dim)]">
                  <ZoomIn className="w-3.5 h-3.5" />
                  <span>Zoom</span>
                </span>
                <span className="font-mono text-[11px]">{Math.round(zoom * 100)}%</span>
              </div>
              <div className="flex items-center gap-2">
                <Button
                  type="button"
                  variant="outline"
                  size="icon"
                  className="h-7 w-7 shrink-0 cursor-pointer"
                  onClick={() => setZoom((z) => Math.max(1, Math.round((z - 0.1) * 10) / 10))}
                  title="Zoom Out"
                >
                  <ZoomOut className="w-3.5 h-3.5" />
                </Button>
                <Slider
                  min={1}
                  max={3}
                  step={0.05}
                  value={[zoom]}
                  onValueChange={(val) => setZoom(val[0])}
                  className="flex-1"
                />
                <Button
                  type="button"
                  variant="outline"
                  size="icon"
                  className="h-7 w-7 shrink-0 cursor-pointer"
                  onClick={() => setZoom((z) => Math.min(3, Math.round((z + 0.1) * 10) / 10))}
                  title="Zoom In"
                >
                  <ZoomIn className="w-3.5 h-3.5" />
                </Button>
              </div>
            </div>

            {/* Rotate & Flip Tools */}
            <div className="space-y-1.5">
              <span className="text-[11px] font-semibold text-[var(--ui-text-dim)] uppercase tracking-wider block">
                Rotate & Flip
              </span>
              <div className="flex items-center gap-2">
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  className="h-7 px-2.5 text-xs flex items-center gap-1 cursor-pointer"
                  onClick={() => setRotation((r) => (r - 90 + 360) % 360)}
                  title="Rotate 90° Left"
                >
                  <RotateCcw className="w-3.5 h-3.5" />
                  <span>-90°</span>
                </Button>
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  className="h-7 px-2.5 text-xs flex items-center gap-1 cursor-pointer"
                  onClick={() => setRotation((r) => (r + 90) % 360)}
                  title="Rotate 90° Right"
                >
                  <RotateCw className="w-3.5 h-3.5" />
                  <span>+90°</span>
                </Button>
                <Button
                  type="button"
                  variant={isFlippedH ? 'default' : 'outline'}
                  size="sm"
                  className="h-7 px-2.5 text-xs flex items-center gap-1 cursor-pointer"
                  onClick={() => setIsFlippedH((f) => !f)}
                  title="Flip Horizontally"
                >
                  <FlipHorizontal className="w-3.5 h-3.5" />
                  <span>Flip</span>
                </Button>
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  className="h-7 px-2.5 text-xs flex items-center gap-1 text-muted-foreground hover:text-foreground cursor-pointer"
                  onClick={handleReset}
                  title="Reset adjustments"
                >
                  <RefreshCw className="w-3 h-3" />
                  <span>Reset</span>
                </Button>
              </div>
            </div>
          </div>
        </div>

        <DialogFooter className="flex flex-col sm:flex-row items-center justify-between gap-2 border-t pt-3">
          {/* Upload different file button */}
          <div>
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={() => fileInputRef.current?.click()}
              className="text-xs flex items-center gap-1.5 cursor-pointer"
            >
              <Upload className="w-3.5 h-3.5" />
              <span>Change Image</span>
            </Button>
            <input
              ref={fileInputRef}
              type="file"
              accept="image/*"
              onChange={handleFileChange}
              className="hidden"
            />
          </div>

          <div className="flex items-center gap-2">
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={() => setIsCropModalOpen(false)}
            >
              Cancel
            </Button>
            <Button
              type="button"
              size="sm"
              onClick={handleApplyCrop}
              className="flex items-center gap-1.5"
            >
              <Check className="w-3.5 h-3.5" />
              <span>Apply & Save</span>
            </Button>
          </div>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};
