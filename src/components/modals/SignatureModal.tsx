import React, { useState, useRef, useEffect, useCallback } from 'react';
import { useResume } from '../../context/ResumeContext';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '../ui/dialog';
import { Button } from '../ui/button';
import {
  processSignatureImage,
  SignatureProcessOptions,
  ProcessedSignatureResult,
} from '../../utils/signatureProcessor';
import { Upload, PenTool, Check, Download } from 'lucide-react';

export const SignatureModal: React.FC = () => {
  const {
    isSignatureModalOpen,
    setIsSignatureModalOpen,
    resumeData,
    updateDeclaration,
    showToast,
  } = useResume();

  const fileInputRef = useRef<HTMLInputElement>(null);
  const [sourceImg, setSourceImg] = useState<HTMLImageElement | null>(null);
  const [processed, setProcessed] = useState<ProcessedSignatureResult | null>(null);

  // Tuning options
  const [threshold, setThreshold] = useState<number>(195);
  const [contrast, setContrast] = useState<number>(1.7);
  const [smoothness, setSmoothness] = useState<number>(2);
  const [inkColor, setInkColor] = useState<'black' | 'blue' | 'theme' | 'custom'>('black');
  const [customColor, setCustomColor] = useState<string>('#000000');
  const [autoCrop, setAutoCrop] = useState<boolean>(true);

  // Reset or initialize when modal opens
  useEffect(() => {
    if (!isSignatureModalOpen) {
      // Keep state or reset if desired
    } else if (!sourceImg && resumeData.declaration.signatureImage) {
      // If resume already has a signature image, we could offer editing it or uploading new
    }
  }, [isSignatureModalOpen, sourceImg, resumeData.declaration.signatureImage]);

  // Re-process signature whenever image or settings change
  const runProcessing = useCallback(() => {
    if (!sourceImg) return;
    try {
      const options: SignatureProcessOptions = {
        threshold,
        contrast,
        smoothness,
        inkColor,
        customColor,
        themeColor: '#0056b3',
        autoCrop,
      };
      const result = processSignatureImage(sourceImg, options);
      setProcessed(result);
    } catch (err) {
      console.error('Signature processing failed', err);
    }
  }, [sourceImg, threshold, contrast, smoothness, inkColor, customColor, autoCrop]);

  useEffect(() => {
    runProcessing();
  }, [runProcessing]);

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (ev) => {
      const url = ev.target?.result as string;
      const img = new Image();
      img.onload = () => {
        setSourceImg(img);
      };
      img.src = url;
    };
    reader.readAsDataURL(file);
    e.target.value = '';
  };

  const handleApply = () => {
    if (!processed) return;
    updateDeclaration({ signatureImage: processed.pngDataUrl });
    showToast('Signature applied to resume!');
    setIsSignatureModalOpen(false);
  };

  const handleDownloadSvg = () => {
    if (!processed) return;
    const blob = new Blob([processed.svgMarkup], { type: 'image/svg+xml' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'clean_signature.svg';
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
    showToast('Downloaded clean_signature.svg');
  };

  const handleDownloadPng = () => {
    if (!processed) return;
    const a = document.createElement('a');
    a.href = processed.pngDataUrl;
    a.download = 'clean_signature.png';
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    showToast('Downloaded clean_signature.png');
  };

  return (
    <Dialog open={isSignatureModalOpen} onOpenChange={setIsSignatureModalOpen}>
      <DialogContent className="max-w-xl">
        <DialogHeader>
          <div className="flex items-center gap-2">
            <PenTool className="w-5 h-5 text-primary shrink-0" />
            <DialogTitle>Signature Cleaner & Vectorizer</DialogTitle>
          </div>
          <p className="text-xs text-[var(--ui-text-dim)]">
            Upload a photo of your handwritten signature. Paper shadows and shading are removed to produce a crisp, transparent vector signature.
          </p>
        </DialogHeader>

        {!sourceImg ? (
          /* Upload State */
          <div
            onClick={() => fileInputRef.current?.click()}
            className="border-2 border-dashed border-[var(--ui-border)] hover:border-primary rounded-xl p-8 flex flex-col items-center justify-center gap-3 cursor-pointer bg-[var(--ui-surface2)]/50 hover:bg-[var(--ui-surface2)] transition-colors text-center"
          >
            <div className="w-12 h-12 rounded-full bg-primary/10 text-primary flex items-center justify-center">
              <Upload className="w-6 h-6" />
            </div>
            <div>
              <p className="text-sm font-semibold text-[var(--ui-text)]">
                Click to upload photo of your handwritten signature
              </p>
              <p className="text-xs text-[var(--ui-text-dim)] mt-1">
                Supports camera snapshots, scans, PNG, JPG, WEBP
              </p>
            </div>
            <input
              ref={fileInputRef}
              type="file"
              accept="image/*"
              onChange={handleFileUpload}
              className="hidden"
            />
          </div>
        ) : (
          /* Interactive Tuning & Preview State */
          <div className="space-y-4 py-1">
            {/* Live Preview Area (Checkerboard for transparency) */}
            <div className="space-y-1.5">
              <div className="flex items-center justify-between">
                <span className="text-[11px] font-semibold uppercase text-[var(--ui-text-dim)] tracking-wider">
                  Transparent Vector Preview
                </span>
                <button
                  type="button"
                  onClick={() => fileInputRef.current?.click()}
                  className="text-xs text-primary hover:underline flex items-center gap-1 cursor-pointer"
                >
                  <Upload className="w-3 h-3" />
                  <span>Choose another photo</span>
                </button>
              </div>

              <div
                className="w-full h-36 rounded-lg border border-[var(--ui-border)] flex items-center justify-center p-3 relative overflow-hidden"
                style={{
                  backgroundImage: `
                    linear-gradient(45deg, #e5e7eb 25%, transparent 25%),
                    linear-gradient(-45deg, #e5e7eb 25%, transparent 25%),
                    linear-gradient(45deg, transparent 75%, #e5e7eb 75%),
                    linear-gradient(-45deg, transparent 75%, #e5e7eb 75%)
                  `,
                  backgroundSize: '16px 16px',
                  backgroundPosition: '0 0, 0 8px, 8px -8px, -8px 0px',
                  backgroundColor: '#ffffff',
                }}
              >
                {processed && (
                  <img
                    src={processed.pngDataUrl}
                    alt="Processed Signature"
                    className="max-h-full max-w-full object-contain filter drop-shadow-xs"
                  />
                )}
              </div>
            </div>

            {/* Sliders & Controls */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5 bg-[var(--ui-surface2)] p-3.5 rounded-lg border border-[var(--ui-border)]">
              {/* Paper & Shadow Removal */}
              <div className="space-y-1">
                <div className="flex items-center justify-between text-xs font-medium">
                  <span>Background / Shadow Cutoff</span>
                  <span className="font-mono text-[11px] text-[var(--ui-text-dim)]">{threshold}</span>
                </div>
                <input
                  type="range"
                  min="120"
                  max="245"
                  step="1"
                  value={threshold}
                  onChange={(e) => setThreshold(Number(e.target.value))}
                  className="w-full accent-primary cursor-pointer"
                />
                <p className="text-[10px] text-[var(--ui-text-dim)]">
                  Slide right to wipe out paper texture & ambient shadows
                </p>
              </div>

              {/* Ink Darkness & Boldness */}
              <div className="space-y-1">
                <div className="flex items-center justify-between text-xs font-medium">
                  <span>Ink Boldness / Contrast</span>
                  <span className="font-mono text-[11px] text-[var(--ui-text-dim)]">{contrast.toFixed(1)}x</span>
                </div>
                <input
                  type="range"
                  min="1.0"
                  max="2.5"
                  step="0.1"
                  value={contrast}
                  onChange={(e) => setContrast(Number(e.target.value))}
                  className="w-full accent-primary cursor-pointer"
                />
                <p className="text-[10px] text-[var(--ui-text-dim)]">
                  Strengthens faint pen strokes into solid ink
                </p>
              </div>

              {/* Stroke Smoothness */}
              <div className="space-y-1">
                <div className="flex items-center justify-between text-xs font-medium">
                  <span>Vector Smoothness</span>
                  <span className="font-mono text-[11px] text-[var(--ui-text-dim)]">{smoothness}</span>
                </div>
                <input
                  type="range"
                  min="1"
                  max="5"
                  step="1"
                  value={smoothness}
                  onChange={(e) => setSmoothness(Number(e.target.value))}
                  className="w-full accent-primary cursor-pointer"
                />
                <p className="text-[10px] text-[var(--ui-text-dim)]">
                  Anti-aliases stroke edges for smooth curves
                </p>
              </div>

              {/* Ink Color Picker */}
              <div className="space-y-1">
                <span className="text-xs font-medium block">Ink Color</span>
                <div className="flex items-center gap-1.5 flex-wrap">
                  <button
                    type="button"
                    onClick={() => setInkColor('black')}
                    className={`px-2 py-1 rounded text-xs font-medium border cursor-pointer transition-colors ${inkColor === 'black'
                        ? 'border-primary bg-primary text-primary-foreground font-semibold'
                        : 'border-[var(--ui-border)] bg-[var(--ui-surface)] text-[var(--ui-text)]'
                      }`}
                  >
                    Black
                  </button>
                  <button
                    type="button"
                    onClick={() => setInkColor('blue')}
                    className={`px-2 py-1 rounded text-xs font-medium border cursor-pointer transition-colors ${inkColor === 'blue'
                        ? 'border-blue-700 bg-blue-700 text-white font-semibold'
                        : 'border-[var(--ui-border)] bg-[var(--ui-surface)] text-[var(--ui-text)]'
                      }`}
                  >
                    Royal Blue
                  </button>
                  <button
                    type="button"
                    onClick={() => setInkColor('theme')}
                    className={`px-2 py-1 rounded text-xs font-medium border cursor-pointer transition-colors ${inkColor === 'theme'
                        ? 'border-primary bg-primary/20 text-primary font-semibold'
                        : 'border-[var(--ui-border)] bg-[var(--ui-surface)] text-[var(--ui-text)]'
                      }`}
                  >
                    Theme Color
                  </button>
                  <input
                    type="color"
                    value={customColor}
                    onChange={(e) => {
                      setCustomColor(e.target.value);
                      setInkColor('custom');
                    }}
                    title="Custom ink color"
                    className="w-6 h-6 p-0 border-0 rounded cursor-pointer bg-transparent"
                  />
                </div>
              </div>
            </div>

            <div className="flex items-center justify-between pt-1">
              <label className="flex items-center gap-2 text-xs font-medium text-[var(--ui-text)] cursor-pointer select-none">
                <input
                  type="checkbox"
                  checked={autoCrop}
                  onChange={(e) => setAutoCrop(e.target.checked)}
                  className="rounded border-[var(--ui-border)] text-primary h-4 w-4 cursor-pointer"
                />
                <span>Auto-crop empty borders around signature</span>
              </label>

              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={handleDownloadSvg}
                  className="text-xs text-[var(--ui-text-dim)] hover:text-foreground flex items-center gap-1 cursor-pointer hover:underline"
                  title="Download SVG vector file"
                >
                  <Download className="w-3 h-3" />
                  <span>SVG</span>
                </button>
                <span className="text-[var(--ui-border)]">|</span>
                <button
                  type="button"
                  onClick={handleDownloadPng}
                  className="text-xs text-[var(--ui-text-dim)] hover:text-foreground flex items-center gap-1 cursor-pointer hover:underline"
                  title="Download transparent PNG"
                >
                  <Download className="w-3 h-3" />
                  <span>PNG</span>
                </button>
              </div>
            </div>

            <input
              ref={fileInputRef}
              type="file"
              accept="image/*"
              onChange={handleFileUpload}
              className="hidden"
            />
          </div>
        )}

        <DialogFooter className="flex items-center justify-between sm:justify-between w-full">
          <Button
            variant="outline"
            size="sm"
            onClick={() => setIsSignatureModalOpen(false)}
          >
            Cancel
          </Button>

          {sourceImg && (
            <Button size="sm" onClick={handleApply} className="gap-1.5">
              <Check className="w-3.5 h-3.5" />
              <span>Apply to Resume</span>
            </Button>
          )}
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};
