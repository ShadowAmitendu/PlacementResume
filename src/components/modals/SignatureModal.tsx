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
  Checkbox,
  Field,
  tokens,
} from '@fluentui/react-components';
import {
  SignatureRegular,
  ArrowUploadRegular,
  CheckmarkRegular,
  ArrowDownloadRegular,
  DismissRegular,
} from '@fluentui/react-icons';
import { useResume } from '../../context/ResumeContext';
import { THEMES } from '../../constants/themes';
import {
  processSignatureImage,
  SignatureProcessOptions,
  ProcessedSignatureResult,
} from '../../utils/signatureProcessor';

export const SignatureModal: React.FC = () => {
  const {
    isSignatureModalOpen,
    setIsSignatureModalOpen,
    resumeData,
    updateDeclaration,
    showToast,
    showAlert,
  } = useResume();

  const activeThemeColor = THEMES[resumeData.meta.theme]?.color || '#000000';

  const fileInputRef = useRef<HTMLInputElement>(null);
  const [sourceImg, setSourceImg] = useState<HTMLImageElement | null>(null);
  const [processed, setProcessed] = useState<ProcessedSignatureResult | null>(null);

  const [threshold, setThreshold] = useState<number>(195);
  const [contrast, setContrast] = useState<number>(1.7);
  const [smoothness, setSmoothness] = useState<number>(2);
  const [inkColor, setInkColor] = useState<'black' | 'blue' | 'theme' | 'custom'>('black');
  const [customColor, setCustomColor] = useState<string>('#000000');
  const [autoCrop, setAutoCrop] = useState<boolean>(true);

  const runProcessing = useCallback(() => {
    if (!sourceImg) return;
    try {
      const options: SignatureProcessOptions = {
        threshold,
        contrast,
        smoothness,
        inkColor,
        customColor,
        themeColor: activeThemeColor,
        autoCrop,
      };
      const result = processSignatureImage(sourceImg, options);
      setProcessed(result);
    } catch (err) {
      console.error('Signature processing failed', err);
    }
  }, [sourceImg, threshold, contrast, smoothness, inkColor, customColor, activeThemeColor, autoCrop]);

  useEffect(() => {
    runProcessing();
  }, [runProcessing]);

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (!file.type.startsWith('image/')) {
      showAlert('Select a valid image file.', 'Unsupported file');
      e.target.value = '';
      return;
    }

    const reader = new FileReader();
    reader.onerror = () => {
      showAlert('Failed to read the selected signature file.', 'Read error');
    };
    reader.onload = (ev) => {
      const url = ev.target?.result as string;
      const img = new Image();
      img.onload = () => {
        setSourceImg(img);
      };
      img.onerror = () => {
        showAlert('Could not decode the selected image.', 'Invalid image');
      };
      img.src = url;
    };
    reader.readAsDataURL(file);
    e.target.value = '';
  };

  const handleApply = () => {
    if (!processed) return;
    updateDeclaration({ signatureImage: processed.pngDataUrl });
    showToast('Signature applied to resume');
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
    <Dialog
      open={isSignatureModalOpen}
      onOpenChange={(_, data) => setIsSignatureModalOpen(data.open)}
    >
      <DialogSurface style={{ maxWidth: 580 }}>
        <DialogBody>
          <DialogTitle
            action={
              <Button
                appearance="subtle"
                size="small"
                aria-label="Close"
                icon={<DismissRegular />}
                onClick={() => setIsSignatureModalOpen(false)}
              />
            }
          >
            <span className="flex items-center gap-2">
              <SignatureRegular style={{ color: tokens.colorBrandForeground1 }} />
              <span>Clean handwritten signature</span>
            </span>
          </DialogTitle>

          <DialogContent>
            <div className="space-y-4 py-1">
              <p className="text-xs" style={{ color: tokens.colorNeutralForeground2 }}>
                Upload a signature photo to remove paper background shading and produce a transparent cutout.
              </p>

              {!sourceImg ? (
                <button
                  type="button"
                  onClick={() => fileInputRef.current?.click()}
                  className="w-full rounded-lg p-8 flex flex-col items-center justify-center gap-2.5 cursor-pointer text-center transition-colors"
                  style={{
                    border: `1.5px dashed ${tokens.colorNeutralStroke1}`,
                    backgroundColor: tokens.colorNeutralBackground2,
                  }}
                >
                  <ArrowUploadRegular
                    fontSize={28}
                    style={{ color: tokens.colorBrandForeground1 }}
                  />
                  <div>
                    <p
                      className="text-sm font-semibold"
                      style={{ color: tokens.colorNeutralForeground1 }}
                    >
                      Select a photo of your signature
                    </p>
                    <p
                      className="text-xs mt-0.5"
                      style={{ color: tokens.colorNeutralForeground3 }}
                    >
                      PNG, JPG, or WEBP
                    </p>
                  </div>
                </button>
              ) : (
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <span
                      className="text-xs font-medium"
                      style={{ color: tokens.colorNeutralForeground2 }}
                    >
                      Preview
                    </span>
                    <Button
                      appearance="subtle"
                      size="small"
                      icon={<ArrowUploadRegular />}
                      onClick={() => fileInputRef.current?.click()}
                    >
                      Choose another image
                    </Button>
                  </div>

                  <div
                    className="w-full h-36 rounded-md flex items-center justify-center p-3 relative overflow-hidden"
                    style={{
                      border: `1px solid ${tokens.colorNeutralStroke1}`,
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
                        className="max-h-full max-w-full object-contain"
                      />
                    )}
                  </div>

                  <div
                    className="grid grid-cols-1 sm:grid-cols-2 gap-3.5 p-3 rounded-md"
                    style={{
                      backgroundColor: tokens.colorNeutralBackground2,
                      border: `1px solid ${tokens.colorNeutralStroke2}`,
                    }}
                  >
                    <Field
                      label={
                        <span className="flex items-center justify-between w-full text-xs">
                          <span>Background cutoff</span>
                          <span className="font-mono">{threshold}</span>
                        </span>
                      }
                      hint="Increase to clear paper shadow"
                    >
                      <Slider
                        size="small"
                        min={120}
                        max={245}
                        step={1}
                        value={threshold}
                        onChange={(_, data) => setThreshold(data.value)}
                      />
                    </Field>

                    <Field
                      label={
                        <span className="flex items-center justify-between w-full text-xs">
                          <span>Ink contrast</span>
                          <span className="font-mono">{contrast.toFixed(1)}x</span>
                        </span>
                      }
                      hint="Strengthens faint pen strokes"
                    >
                      <Slider
                        size="small"
                        min={1.0}
                        max={2.5}
                        step={0.1}
                        value={contrast}
                        onChange={(_, data) => setContrast(data.value)}
                      />
                    </Field>

                    <Field
                      label={
                        <span className="flex items-center justify-between w-full text-xs">
                          <span>Edge smoothing</span>
                          <span className="font-mono">{smoothness}</span>
                        </span>
                      }
                    >
                      <Slider
                        size="small"
                        min={1}
                        max={5}
                        step={1}
                        value={smoothness}
                        onChange={(_, data) => setSmoothness(data.value)}
                      />
                    </Field>

                    <Field label="Ink color">
                      <div className="flex items-center gap-1.5 flex-wrap pt-0.5">
                        <Button
                          size="small"
                          appearance={inkColor === 'black' ? 'primary' : 'outline'}
                          onClick={() => setInkColor('black')}
                        >
                          Black
                        </Button>
                        <Button
                          size="small"
                          appearance={inkColor === 'blue' ? 'primary' : 'outline'}
                          onClick={() => setInkColor('blue')}
                        >
                          Blue
                        </Button>
                        <Button
                          size="small"
                          appearance={inkColor === 'theme' ? 'primary' : 'outline'}
                          onClick={() => setInkColor('theme')}
                        >
                          Theme
                        </Button>
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
                    </Field>
                  </div>

                  <div className="flex items-center justify-between flex-wrap gap-2">
                    <Checkbox
                      label="Auto-crop whitespace around signature"
                      checked={autoCrop}
                      onChange={(_, data) => setAutoCrop(!!data.checked)}
                    />

                    <div className="flex items-center gap-1">
                      <Button
                        appearance="subtle"
                        size="small"
                        icon={<ArrowDownloadRegular />}
                        onClick={handleDownloadSvg}
                      >
                        SVG
                      </Button>
                      <Button
                        appearance="subtle"
                        size="small"
                        icon={<ArrowDownloadRegular />}
                        onClick={handleDownloadPng}
                      >
                        PNG
                      </Button>
                    </div>
                  </div>
                </div>
              )}

              <input
                ref={fileInputRef}
                type="file"
                accept="image/*"
                onChange={handleFileUpload}
                className="hidden"
              />
            </div>
          </DialogContent>

          <DialogActions>
            <Button appearance="secondary" onClick={() => setIsSignatureModalOpen(false)}>
              Cancel
            </Button>
            {sourceImg && (
              <Button appearance="primary" icon={<CheckmarkRegular />} onClick={handleApply}>
                Apply to resume
              </Button>
            )}
          </DialogActions>
        </DialogBody>
      </DialogSurface>
    </Dialog>
  );
};
