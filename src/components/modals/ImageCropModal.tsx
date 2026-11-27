import React, { useState, useRef, useEffect, useCallback } from 'react';
import {
  Dialog,
  DialogSurface,
  DialogBody,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  Slider,
  Field,
  tokens,
} from '@fluentui/react-components';
import {
  CropRegular,
  ArrowRotateClockwiseRegular,
  ArrowRotateCounterclockwiseRegular,
  FlipHorizontalRegular,
  ZoomInRegular,
  ZoomOutRegular,
  ArrowUploadRegular,
  CheckmarkRegular,
  ArrowResetRegular,
  DismissRegular,
} from '@fluentui/react-icons';
import { useResume } from '../../context/ResumeContext';

type AspectRatioPreset = '4:5' | '1:1' | '3:4' | 'free';

const ASPECT_OPTIONS: Array<{ value: AspectRatioPreset; label: string }> = [
  { value: '4:5', label: '4:5 Standard' },
  { value: '1:1', label: '1:1 Square' },
  { value: '3:4', label: '3:4 Portrait' },
  { value: 'free', label: 'Freeform' },
];

export const ImageCropModal: React.FC = () => {
  const {
    isCropModalOpen,
    setIsCropModalOpen,
    cropImageSrc,
    setPhoto,
    showToast,
    showAlert,
  } = useResume();

  const fileInputRef = useRef<HTMLInputElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);

  const [imageObj, setImageObj] = useState<HTMLImageElement | null>(null);
  const [aspectRatio, setAspectRatio] = useState<AspectRatioPreset>('4:5');
  const [zoom, setZoom] = useState<number>(1);
  const [rotation, setRotation] = useState<number>(0);
  const [isFlippedH, setIsFlippedH] = useState<boolean>(false);
  const [pan, setPan] = useState<{ x: number; y: number }>({ x: 0, y: 0 });
  const [isDragging, setIsDragging] = useState<boolean>(false);
  const [dragStart, setDragStart] = useState<{ x: number; y: number }>({ x: 0, y: 0 });

  useEffect(() => {
    if (!isCropModalOpen) {
      setImageObj(null);
      return;
    }
    if (!cropImageSrc) {
      setImageObj(null);
      return;
    }
    let active = true;
    const img = new Image();
    img.crossOrigin = 'anonymous';
    img.onload = () => {
      if (!active) return;
      setImageObj(img);
      setZoom(1);
      setRotation(0);
      setIsFlippedH(false);
      setPan({ x: 0, y: 0 });
    };
    img.onerror = () => {
      if (!active) return;
      setImageObj(null);
      showAlert('Could not load the selected image.', 'Invalid image');
    };
    img.src = cropImageSrc;
    return () => {
      active = false;
    };
  }, [isCropModalOpen, cropImageSrc, showAlert]);

  const getCropBoxSize = useCallback(() => {
    switch (aspectRatio) {
      case '4:5':
        return { w: 224, h: 280 };
      case '1:1':
        return { w: 260, h: 260 };
      case '3:4':
        return { w: 225, h: 300 };
      case 'free':
      default:
        return { w: 260, h: 260 };
    }
  }, [aspectRatio]);

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

    ctx.save();
    ctx.translate(cw / 2 + pan.x, ch / 2 + pan.y);
    ctx.rotate((rotation * Math.PI) / 180);
    ctx.scale(isFlippedH ? -1 : 1, 1);

    const isRotated90or270 = rotation % 180 !== 0;
    const effectiveW = isRotated90or270 ? imageObj.naturalHeight : imageObj.naturalWidth;
    const effectiveH = isRotated90or270 ? imageObj.naturalWidth : imageObj.naturalHeight;

    const baseScale = Math.max(cropW / effectiveW, cropH / effectiveH);
    const finalScale = baseScale * zoom;

    const drawW = imageObj.naturalWidth * finalScale;
    const drawH = imageObj.naturalHeight * finalScale;

    ctx.drawImage(imageObj, -drawW / 2, -drawH / 2, drawW, drawH);
    ctx.restore();

    // Overlay mask outside crop frame
    ctx.fillStyle = 'rgba(0, 0, 0, 0.58)';
    ctx.fillRect(0, 0, cw, cropY);
    ctx.fillRect(0, cropY + cropH, cw, ch - (cropY + cropH));
    ctx.fillRect(0, cropY, cropX, cropH);
    ctx.fillRect(cropX + cropW, cropY, cw - (cropX + cropW), cropH);

    // Frame border
    ctx.strokeStyle = 'rgba(255, 255, 255, 0.85)';
    ctx.lineWidth = 1.5;
    ctx.strokeRect(cropX, cropY, cropW, cropH);

    // Rule-of-thirds guides
    ctx.strokeStyle = 'rgba(255, 255, 255, 0.25)';
    ctx.lineWidth = 1;
    ctx.setLineDash([4, 4]);
    ctx.beginPath();
    ctx.moveTo(cropX + cropW / 3, cropY);
    ctx.lineTo(cropX + cropW / 3, cropY + cropH);
    ctx.moveTo(cropX + (cropW * 2) / 3, cropY);
    ctx.lineTo(cropX + (cropW * 2) / 3, cropY + cropH);
    ctx.moveTo(cropX, cropY + cropH / 3);
    ctx.lineTo(cropX + cropW, cropY + cropH / 3);
    ctx.moveTo(cropX, cropY + (cropH * 2) / 3);
    ctx.lineTo(cropX + cropW, cropY + (cropH * 2) / 3);
    ctx.stroke();
    ctx.setLineDash([]);

    // Crisp monochrome corner ticks
    const markerLen = 12;
    ctx.strokeStyle = '#ffffff';
    ctx.lineWidth = 2.5;
    ctx.beginPath();
    ctx.moveTo(cropX, cropY + markerLen);
    ctx.lineTo(cropX, cropY);
    ctx.lineTo(cropX + markerLen, cropY);

    ctx.moveTo(cropX + cropW - markerLen, cropY);
    ctx.lineTo(cropX + cropW, cropY);
    ctx.lineTo(cropX + cropW, cropY + markerLen);

    ctx.moveTo(cropX, cropY + cropH - markerLen);
    ctx.lineTo(cropX, cropY + cropH);
    ctx.lineTo(cropX + markerLen, cropY + cropH);

    ctx.moveTo(cropX + cropW - markerLen, cropY + cropH);
    ctx.lineTo(cropX + cropW, cropY + cropH);
    ctx.lineTo(cropX + cropW, cropY + cropH - markerLen);
    ctx.stroke();
  }, [imageObj, getCropBoxSize, zoom, rotation, isFlippedH, pan]);

  useEffect(() => {
    drawCanvas();
  }, [drawCanvas]);

  const handleMouseDown = (e: React.MouseEvent<HTMLCanvasElement>) => {
    setIsDragging(true);
    setDragStart({ x: e.clientX - pan.x, y: e.clientY - pan.y });
  };

  const handleMouseMove = (e: React.MouseEvent<HTMLCanvasElement>) => {
    if (!isDragging) return;
    setPan({ x: e.clientX - dragStart.x, y: e.clientY - dragStart.y });
  };

  const handleMouseUp = () => {
    setIsDragging(false);
  };

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
    setPan({ x: touch.clientX - dragStart.x, y: touch.clientY - dragStart.y });
  };

  const handleTouchEnd = () => {
    setIsDragging(false);
  };

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas || !isCropModalOpen) return;
    const onNativeWheel = (e: WheelEvent) => {
      e.preventDefault();
      const delta = e.deltaY > 0 ? -0.1 : 0.1;
      setZoom((prev) => Math.max(1, Math.min(3, Math.round((prev + delta) * 10) / 10)));
    };
    canvas.addEventListener('wheel', onNativeWheel, { passive: false });
    return () => canvas.removeEventListener('wheel', onNativeWheel);
  }, [isCropModalOpen]);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (!file.type.startsWith('image/')) {
      showAlert('Select a valid image file.', 'Unsupported file');
      e.target.value = '';
      return;
    }

    const reader = new FileReader();
    reader.onerror = () => {
      showAlert('Failed to read the selected image file.', 'Read error');
    };
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
        img.onerror = () => {
          showAlert('Could not decode the selected image.', 'Invalid image');
        };
        img.src = src;
      }
    };
    reader.readAsDataURL(file);
    e.target.value = '';
  };

  const handleReset = () => {
    setZoom(1);
    setRotation(0);
    setIsFlippedH(false);
    setPan({ x: 0, y: 0 });
  };

  const handleApplyCrop = () => {
    if (!imageObj) return;
    const canvas = canvasRef.current;
    if (!canvas) return;

    const { w: cropW, h: cropH } = getCropBoxSize();
    const exportWidth = cropW * 2;
    const exportHeight = cropH * 2;

    const exportCanvas = document.createElement('canvas');
    exportCanvas.width = exportWidth;
    exportCanvas.height = exportHeight;
    const expCtx = exportCanvas.getContext('2d');
    if (!expCtx) return;

    // Paint white background so rotated/panned edges do not encode as black in JPEG
    expCtx.fillStyle = '#ffffff';
    expCtx.fillRect(0, 0, exportWidth, exportHeight);

    const isRotated90or270 = rotation % 180 !== 0;
    const effectiveW = isRotated90or270 ? imageObj.naturalHeight : imageObj.naturalWidth;
    const effectiveH = isRotated90or270 ? imageObj.naturalWidth : imageObj.naturalHeight;
    const baseScale = Math.max(cropW / effectiveW, cropH / effectiveH);
    const finalScale = baseScale * zoom;

    expCtx.save();
    expCtx.translate(exportWidth / 2 + pan.x * 2, exportHeight / 2 + pan.y * 2);
    expCtx.rotate((rotation * Math.PI) / 180);
    expCtx.scale(isFlippedH ? -1 : 1, 1);

    const drawW = imageObj.naturalWidth * finalScale * 2;
    const drawH = imageObj.naturalHeight * finalScale * 2;
    expCtx.drawImage(imageObj, -drawW / 2, -drawH / 2, drawW, drawH);
    expCtx.restore();

    const croppedBase64 = exportCanvas.toDataURL('image/jpeg', 0.9);
    setPhoto(croppedBase64);
    showToast('Profile photo updated');
    setIsCropModalOpen(false);
  };

  return (
    <Dialog
      open={isCropModalOpen}
      onOpenChange={(_, data) => setIsCropModalOpen(data.open)}
    >
      <DialogSurface style={{ maxWidth: 640 }}>
        <DialogBody>
          <DialogTitle
            action={
              <Button
                appearance="subtle"
                size="small"
                aria-label="Close"
                icon={<DismissRegular />}
                onClick={() => setIsCropModalOpen(false)}
              />
            }
          >
            <span className="flex items-center gap-2">
              <CropRegular style={{ color: tokens.colorBrandForeground1 }} />
              <span>Crop profile photo</span>
            </span>
          </DialogTitle>

          <DialogContent>
            <div className="space-y-4 py-1">
              <div
                className="relative flex justify-center rounded-md p-2 overflow-hidden"
                style={{
                  backgroundColor: '#141414',
                  border: `1px solid ${tokens.colorNeutralStroke1}`,
                }}
              >
                <canvas
                  ref={canvasRef}
                  width={460}
                  height={360}
                  onMouseDown={handleMouseDown}
                  onMouseMove={handleMouseMove}
                  onMouseUp={handleMouseUp}
                  onMouseLeave={handleMouseUp}
                  onTouchStart={handleTouchStart}
                  onTouchMove={handleTouchMove}
                  onTouchEnd={handleTouchEnd}
                  className={`rounded select-none touch-none max-w-full h-auto aspect-[460/360] ${
                    isDragging ? 'cursor-grabbing' : 'cursor-grab'
                  }`}
                  title="Drag to pan, scroll to zoom"
                />
                <div className="absolute bottom-3 left-3 text-[11px] text-neutral-300 bg-black/70 px-2 py-0.5 rounded pointer-events-none select-none">
                  Drag to pan, scroll to zoom
                </div>
              </div>

              <Field label="Aspect ratio">
                <div className="flex flex-wrap items-center gap-1.5">
                  {ASPECT_OPTIONS.map((opt) => (
                    <Button
                      key={opt.value}
                      size="small"
                      appearance={aspectRatio === opt.value ? 'primary' : 'outline'}
                      onClick={() => setAspectRatio(opt.value)}
                    >
                      {opt.label}
                    </Button>
                  ))}
                </div>
              </Field>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <Field
                  label={
                    <span className="flex items-center justify-between w-full">
                      <span>Zoom</span>
                      <span className="font-mono text-xs">{Math.round(zoom * 100)}%</span>
                    </span>
                  }
                >
                  <div className="flex items-center gap-1.5">
                    <Button
                      size="small"
                      appearance="subtle"
                      aria-label="Zoom out"
                      icon={<ZoomOutRegular />}
                      onClick={() => setZoom((z) => Math.max(1, Math.round((z - 0.1) * 10) / 10))}
                    />
                    <Slider
                      size="small"
                      min={1}
                      max={3}
                      step={0.05}
                      value={zoom}
                      onChange={(_, data) => setZoom(data.value)}
                      style={{ flex: 1 }}
                    />
                    <Button
                      size="small"
                      appearance="subtle"
                      aria-label="Zoom in"
                      icon={<ZoomInRegular />}
                      onClick={() => setZoom((z) => Math.min(3, Math.round((z + 0.1) * 10) / 10))}
                    />
                  </div>
                </Field>

                <Field label="Orientation">
                  <div className="flex items-center gap-1.5 flex-wrap">
                    <Button
                      size="small"
                      appearance="outline"
                      icon={<ArrowRotateCounterclockwiseRegular />}
                      onClick={() => setRotation((r) => (r - 90 + 360) % 360)}
                    >
                      -90°
                    </Button>
                    <Button
                      size="small"
                      appearance="outline"
                      icon={<ArrowRotateClockwiseRegular />}
                      onClick={() => setRotation((r) => (r + 90) % 360)}
                    >
                      +90°
                    </Button>
                    <Button
                      size="small"
                      appearance={isFlippedH ? 'primary' : 'outline'}
                      icon={<FlipHorizontalRegular />}
                      onClick={() => setIsFlippedH((f) => !f)}
                    >
                      Flip
                    </Button>
                    <Button
                      size="small"
                      appearance="subtle"
                      icon={<ArrowResetRegular />}
                      onClick={handleReset}
                    >
                      Reset
                    </Button>
                  </div>
                </Field>
              </div>
            </div>
          </DialogContent>

          <DialogActions style={{ justifyContent: 'space-between', width: '100%' }}>
            <div>
              <Button
                appearance="outline"
                icon={<ArrowUploadRegular />}
                onClick={() => fileInputRef.current?.click()}
              >
                Change image
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
              <Button appearance="secondary" onClick={() => setIsCropModalOpen(false)}>
                Cancel
              </Button>
              <Button appearance="primary" icon={<CheckmarkRegular />} onClick={handleApplyCrop}>
                Apply
              </Button>
            </div>
          </DialogActions>
        </DialogBody>
      </DialogSurface>
    </Dialog>
  );
};
