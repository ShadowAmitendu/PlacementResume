import React, { useState, useEffect, useRef } from 'react';
import {
  Dialog,
  DialogSurface,
  DialogBody,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  Input,
  Field,
  Dropdown,
  Option,
  RadioGroup,
  Radio,
  Badge,
  Spinner,
  tokens,
} from '@fluentui/react-components';
import {
  DocumentPdfRegular,
  ArrowUploadRegular,
  CheckmarkCircleRegular,
  WarningRegular,
  BotRegular,
  DesktopRegular,
  DocumentTextRegular,
  KeyRegular,
  ArrowRightRegular,
  EyeRegular,
  EyeOffRegular,
  ArrowSyncRegular,
  DismissRegular,
} from '@fluentui/react-icons';
import { useResume } from '../../context/ResumeContext';
import {
  parseResumeHeuristically,
  parseResumeWithGemini,
  parseResumeWithWindowAi,
  convertParsedToResumeData,
  ParsedResumeResult,
  AiEngineType,
  checkAvailableAiEngines,
  fetchGeminiModels,
  DEFAULT_GEMINI_MODELS,
  GeminiModelInfo,
} from '../../utils/aiResumeParser';

export const PdfAiImportModal: React.FC = () => {
  const {
    isPdfAiModalOpen,
    setIsPdfAiModalOpen,
    pdfImportInitialFile,
    setPdfImportInitialFile,
    resumeData,
    applyAiParsedResume,
    showToast,
  } = useResume();

  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [engine, setEngine] = useState<AiEngineType>('gemini');
  const [apiKey, setApiKey] = useState<string>('');
  const [showApiKey, setShowApiKey] = useState<boolean>(false);
  const [hasWindowAi, setHasWindowAi] = useState<boolean>(false);

  const [geminiModels, setGeminiModels] = useState<GeminiModelInfo[]>(DEFAULT_GEMINI_MODELS);
  const [selectedModel, setSelectedModel] = useState<string>(() => {
    return (
      (typeof window !== 'undefined' && localStorage.getItem('placement_gemini_selected_model')) ||
      'gemini-2.5-flash'
    );
  });
  const [isLoadingModels, setIsLoadingModels] = useState<boolean>(false);
  const [modelsFetchStatus, setModelsFetchStatus] = useState<string | null>(null);

  const [isProcessing, setIsProcessing] = useState<boolean>(false);
  const [statusMessage, setStatusMessage] = useState<string>('');
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const [parsedResult, setParsedResult] = useState<ParsedResumeResult | null>(null);
  const [importMode, setImportMode] = useState<'replace' | 'merge'>('replace');

  const fileInputRef = useRef<HTMLInputElement>(null);
  const abortControllerRef = useRef<AbortController | null>(null);

  const handleFetchModels = async (keyToUse?: string) => {
    const key = (keyToUse !== undefined ? keyToUse : apiKey).trim();
    if (!key) {
      setModelsFetchStatus('Enter an API key to fetch models.');
      return;
    }

    abortControllerRef.current?.abort();
    const controller = new AbortController();
    abortControllerRef.current = controller;

    setIsLoadingModels(true);
    setModelsFetchStatus(null);
    try {
      const models = await fetchGeminiModels(key, controller.signal);
      if (controller.signal.aborted) return;
      setGeminiModels(models);
      setModelsFetchStatus(`${models.length} models loaded`);

      if (!models.some((m) => m.id === selectedModel)) {
        const best =
          models.find((m) => m.id.includes('2.5-flash'))?.id ||
          models[0]?.id ||
          'gemini-2.5-flash';
        setSelectedModel(best);
        try {
          localStorage.setItem('placement_gemini_selected_model', best);
        } catch {}
      }
    } catch (err: unknown) {
      if (controller.signal.aborted) return;
      const message = err instanceof Error ? err.message : 'Using preset models.';
      console.warn('Failed to fetch Gemini models:', err);
      setModelsFetchStatus(message);
    } finally {
      if (!controller.signal.aborted) {
        setIsLoadingModels(false);
      }
    }
  };

  const handleModelChange = (val: string) => {
    setSelectedModel(val);
    try {
      localStorage.setItem('placement_gemini_selected_model', val);
    } catch {}
  };

  useEffect(() => {
    let active = true;
    if (isPdfAiModalOpen) {
      const savedKey = localStorage.getItem('placement_gemini_api_key') || '';
      setApiKey(savedKey);

      checkAvailableAiEngines().then(({ hasWindowAi: winAi }) => {
        if (!active) return;
        setHasWindowAi(winAi);
        if (winAi) {
          setEngine('window-ai');
        } else if (savedKey.trim()) {
          setEngine('gemini');
        } else {
          setEngine('local');
        }
      });

      if (savedKey.trim().length > 10) {
        handleFetchModels(savedKey);
      }

      if (pdfImportInitialFile) {
        setSelectedFile(pdfImportInitialFile);
      }
    } else {
      abortControllerRef.current?.abort();
      setErrorMessage(null);
      setParsedResult(null);
      setIsProcessing(false);
      setStatusMessage('');
      if (pdfImportInitialFile) {
        setPdfImportInitialFile(null);
      }
    }
    return () => {
      active = false;
      abortControllerRef.current?.abort();
    };
  }, [isPdfAiModalOpen, pdfImportInitialFile, setPdfImportInitialFile]);

  const handleApiKeyChange = (val: string) => {
    setApiKey(val);
    try {
      localStorage.setItem('placement_gemini_api_key', val.trim());
    } catch {}

    if (val.trim().length > 25) {
      handleFetchModels(val);
    }
  };

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      if (!file.name.toLowerCase().endsWith('.pdf')) {
        setErrorMessage('Select a valid .pdf file.');
        return;
      }
      setSelectedFile(file);
      setErrorMessage(null);
      setParsedResult(null);
    }
  };

  const handleDrop = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
    const file = e.dataTransfer.files?.[0];
    if (file) {
      if (!file.name.toLowerCase().endsWith('.pdf')) {
        setErrorMessage('Drop a valid .pdf file.');
        return;
      }
      setSelectedFile(file);
      setErrorMessage(null);
      setParsedResult(null);
    }
  };

  const handleStartParsing = async () => {
    if (!selectedFile) {
      setErrorMessage('Select a PDF file first.');
      return;
    }

    setIsProcessing(true);
    setErrorMessage(null);
    setParsedResult(null);

    abortControllerRef.current?.abort();
    const controller = new AbortController();
    abortControllerRef.current = controller;

    try {
      setStatusMessage('Extracting text with PDF.js...');
      const { extractTextFromPdf } = await import('../../utils/pdfExtractor');
      const rawText = await extractTextFromPdf(selectedFile);
      if (controller.signal.aborted) return;

      if (!rawText || rawText.trim().length < 30) {
        throw new Error(
          'Could not extract selectable text from this PDF. Check that it is not a scanned image.'
        );
      }

      const currentModel = geminiModels.find((m) => m.id === selectedModel);
      const modelDisplayName = currentModel?.displayName || selectedModel;

      setStatusMessage(
        `Parsing resume with ${
          engine === 'gemini'
            ? modelDisplayName
            : engine === 'window-ai'
            ? 'Chrome Built-in AI'
            : 'Local Parser'
        }...`
      );

      let result: ParsedResumeResult;

      if (engine === 'gemini') {
        if (!apiKey.trim()) {
          throw new Error('Enter a Google Gemini API key or switch to the Local Parser.');
        }
        result = await parseResumeWithGemini(rawText, apiKey, selectedModel, controller.signal);
      } else if (engine === 'window-ai') {
        result = await parseResumeWithWindowAi(rawText);
      } else {
        result = parseResumeHeuristically(rawText);
      }

      if (controller.signal.aborted) return;
      setParsedResult(result);
      setStatusMessage('');
      showToast('PDF resume extracted');
    } catch (err: unknown) {
      if (controller.signal.aborted) return;
      console.error('AI PDF parse error:', err);
      const message =
        err instanceof Error ? err.message : 'Failed to parse resume PDF.';
      setErrorMessage(message);
    } finally {
      if (!controller.signal.aborted) {
        setIsProcessing(false);
      }
    }
  };

  const handleApply = () => {
    if (!parsedResult) return;
    const finalData = convertParsedToResumeData(parsedResult, resumeData, importMode);
    applyAiParsedResume(finalData);
    setIsPdfAiModalOpen(false);
  };

  const currentModelInfo = geminiModels.find((m) => m.id === selectedModel);
  const selectedModelLabel = currentModelInfo
    ? `${currentModelInfo.displayName} (${currentModelInfo.id})`
    : selectedModel;

  return (
    <Dialog
      open={isPdfAiModalOpen}
      onOpenChange={(_, data) => setIsPdfAiModalOpen(data.open)}
    >
      <DialogSurface style={{ maxWidth: 580, maxHeight: '90vh', overflowY: 'auto' }}>
        <DialogBody>
          <DialogTitle
            action={
              <Button
                appearance="subtle"
                size="small"
                aria-label="Close"
                icon={<DismissRegular />}
                onClick={() => setIsPdfAiModalOpen(false)}
              />
            }
          >
            <span className="flex items-center gap-2">
              <DocumentPdfRegular style={{ color: tokens.colorBrandForeground1 }} />
              <span>Import resume from PDF</span>
            </span>
          </DialogTitle>

          <DialogContent>
            <div className="space-y-4 py-1">
              <p className="text-xs" style={{ color: tokens.colorNeutralForeground2 }}>
                Extract fields from an existing text PDF resume in your browser.
              </p>

              {/* Step 1: Select PDF */}
              <Field label="1. Resume PDF file">
                {!selectedFile ? (
                  <div
                    onDragOver={(e) => e.preventDefault()}
                    onDrop={handleDrop}
                    className="w-full"
                  >
                    <button
                      type="button"
                      onClick={() => fileInputRef.current?.click()}
                      className="w-full rounded-lg p-6 text-center cursor-pointer transition-colors flex flex-col items-center justify-center gap-2"
                      style={{
                        border: `1.5px dashed ${tokens.colorNeutralStroke1}`,
                        backgroundColor: tokens.colorNeutralBackground2,
                      }}
                    >
                      <ArrowUploadRegular
                        fontSize={24}
                        style={{ color: tokens.colorBrandForeground1 }}
                      />
                      <div>
                        <p
                          className="text-sm font-medium"
                          style={{ color: tokens.colorNeutralForeground1 }}
                        >
                          Choose or drop a PDF resume
                        </p>
                        <p
                          className="text-xs mt-0.5"
                          style={{ color: tokens.colorNeutralForeground3 }}
                        >
                          Text-based PDF documents only
                        </p>
                      </div>
                    </button>
                  </div>
                ) : (
                  <div
                    className="flex items-center justify-between p-2.5 rounded-md"
                    style={{
                      border: `1px solid ${tokens.colorNeutralStroke1}`,
                      backgroundColor: tokens.colorNeutralBackground2,
                    }}
                  >
                    <div className="flex items-center gap-2.5 overflow-hidden">
                      <DocumentPdfRegular
                        fontSize={20}
                        style={{ color: tokens.colorBrandForeground1, flexShrink: 0 }}
                      />
                      <div className="min-w-0">
                        <p
                          className="text-xs font-semibold truncate"
                          style={{ color: tokens.colorNeutralForeground1 }}
                        >
                          {selectedFile.name}
                        </p>
                        <p
                          className="text-[11px]"
                          style={{ color: tokens.colorNeutralForeground3 }}
                        >
                          {(selectedFile.size / 1024).toFixed(1)} KB
                        </p>
                      </div>
                    </div>
                    <Button
                      appearance="subtle"
                      size="small"
                      aria-label="Remove file"
                      icon={<DismissRegular />}
                      onClick={() => {
                        setSelectedFile(null);
                        setParsedResult(null);
                        setErrorMessage(null);
                      }}
                    />
                  </div>
                )}
                <input
                  ref={fileInputRef}
                  type="file"
                  accept=".pdf"
                  onChange={handleFileSelect}
                  className="hidden"
                />
              </Field>

              {/* Step 2: Parser Engine */}
              <div className="space-y-2">
                <Field label="2. Extraction method">
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
                    <button
                      type="button"
                      onClick={() => setEngine('gemini')}
                      className="p-2.5 rounded-md text-left cursor-pointer transition-colors"
                      style={{
                        border: `1px solid ${
                          engine === 'gemini'
                            ? tokens.colorBrandStroke1
                            : tokens.colorNeutralStroke1
                        }`,
                        backgroundColor:
                          engine === 'gemini'
                            ? tokens.colorBrandBackground2
                            : tokens.colorNeutralBackground1,
                        color: tokens.colorNeutralForeground1,
                      }}
                    >
                      <div className="flex items-center gap-1.5 mb-1 font-semibold text-xs">
                        <BotRegular fontSize={14} />
                        <span>Google Gemini</span>
                      </div>
                      <p
                        className="text-[11px] leading-snug"
                        style={{ color: tokens.colorNeutralForeground3 }}
                      >
                        Uses your Gemini API key.
                      </p>
                    </button>

                    <button
                      type="button"
                      onClick={() => setEngine('local')}
                      className="p-2.5 rounded-md text-left cursor-pointer transition-colors"
                      style={{
                        border: `1px solid ${
                          engine === 'local'
                            ? tokens.colorBrandStroke1
                            : tokens.colorNeutralStroke1
                        }`,
                        backgroundColor:
                          engine === 'local'
                            ? tokens.colorBrandBackground2
                            : tokens.colorNeutralBackground1,
                        color: tokens.colorNeutralForeground1,
                      }}
                    >
                      <div className="flex items-center gap-1.5 mb-1 font-semibold text-xs">
                        <DocumentTextRegular fontSize={14} />
                        <span>Local rules</span>
                      </div>
                      <p
                        className="text-[11px] leading-snug"
                        style={{ color: tokens.colorNeutralForeground3 }}
                      >
                        Offline parser, no key needed.
                      </p>
                    </button>

                    <button
                      type="button"
                      disabled={!hasWindowAi}
                      onClick={() => setEngine('window-ai')}
                      className="p-2.5 rounded-md text-left transition-colors disabled:opacity-45"
                      style={{
                        border: `1px solid ${
                          engine === 'window-ai'
                            ? tokens.colorBrandStroke1
                            : tokens.colorNeutralStroke1
                        }`,
                        backgroundColor:
                          engine === 'window-ai'
                            ? tokens.colorBrandBackground2
                            : tokens.colorNeutralBackground1,
                        color: tokens.colorNeutralForeground1,
                        cursor: hasWindowAi ? 'pointer' : 'not-allowed',
                      }}
                      title={
                        !hasWindowAi
                          ? 'Requires Chrome with Prompt API enabled'
                          : undefined
                      }
                    >
                      <div className="flex items-center gap-1.5 mb-1 font-semibold text-xs">
                        <DesktopRegular fontSize={14} />
                        <span>Browser AI</span>
                      </div>
                      <p
                        className="text-[11px] leading-snug"
                        style={{ color: tokens.colorNeutralForeground3 }}
                      >
                        {hasWindowAi ? 'On-device model' : 'Unavailable'}
                      </p>
                    </button>
                  </div>
                </Field>

                {engine === 'gemini' && (
                  <div
                    className="p-3 rounded-md space-y-3"
                    style={{
                      border: `1px solid ${tokens.colorNeutralStroke2}`,
                      backgroundColor: tokens.colorNeutralBackground2,
                    }}
                  >
                    <Field
                      label={
                        <span className="flex items-center justify-between w-full text-xs">
                          <span className="flex items-center gap-1.5">
                            <KeyRegular fontSize={13} />
                            <span>Gemini API key</span>
                          </span>
                          <a
                            href="https://aistudio.google.com/app/apikey"
                            target="_blank"
                            rel="noreferrer"
                            className="text-[11px] hover:underline"
                            style={{ color: tokens.colorBrandForeground1 }}
                          >
                            Get API key
                          </a>
                        </span>
                      }
                      hint="Stored in browser localStorage and sent only to Google Gemini API."
                    >
                      <Input
                        type={showApiKey ? 'text' : 'password'}
                        size="small"
                        value={apiKey}
                        onChange={(_, data) => handleApiKeyChange(data.value)}
                        placeholder="AIzaSy..."
                        contentAfter={
                          <Button
                            appearance="subtle"
                            size="small"
                            aria-label="Toggle API key visibility"
                            icon={showApiKey ? <EyeOffRegular /> : <EyeRegular />}
                            onClick={() => setShowApiKey(!showApiKey)}
                          />
                        }
                      />
                    </Field>

                    <Field
                      label={
                        <span className="flex items-center justify-between w-full text-xs">
                          <span>Gemini model</span>
                          <Button
                            appearance="subtle"
                            size="small"
                            disabled={isLoadingModels || !apiKey.trim()}
                            icon={<ArrowSyncRegular />}
                            onClick={() => handleFetchModels()}
                            style={{ fontSize: 11, height: 22 }}
                          >
                            {isLoadingModels ? 'Loading' : 'Refresh list'}
                          </Button>
                        </span>
                      }
                      hint={modelsFetchStatus || currentModelInfo?.description}
                    >
                      <Dropdown
                        size="small"
                        value={selectedModelLabel}
                        selectedOptions={[selectedModel]}
                        disabled={isLoadingModels}
                        onOptionSelect={(_, data) => {
                          if (data.optionValue) handleModelChange(data.optionValue);
                        }}
                      >
                        {geminiModels.map((m) => {
                          const label = `${m.displayName} (${m.id})`;
                          return (
                            <Option key={m.id} value={m.id} text={label}>
                              {label}
                            </Option>
                          );
                        })}
                      </Dropdown>
                    </Field>
                  </div>
                )}
              </div>

              {!parsedResult && (
                <Button
                  appearance="primary"
                  onClick={handleStartParsing}
                  disabled={!selectedFile || isProcessing}
                  icon={isProcessing ? <Spinner size="tiny" /> : <DocumentPdfRegular />}
                  style={{ width: '100%' }}
                >
                  {isProcessing ? statusMessage || 'Parsing PDF...' : 'Extract resume data'}
                </Button>
              )}

              {errorMessage && (
                <div
                  className="p-3 rounded-md text-xs flex items-start gap-2"
                  style={{
                    backgroundColor: tokens.colorPaletteRedBackground1,
                    border: `1px solid ${tokens.colorPaletteRedBorder1}`,
                    color: tokens.colorPaletteRedForeground1,
                  }}
                >
                  <WarningRegular fontSize={16} className="shrink-0 mt-0.5" />
                  <div className="flex-1 space-y-1">
                    <p className="font-semibold">Extraction failed</p>
                    <p>{errorMessage}</p>
                    {engine !== 'local' && (
                      <Button
                        appearance="subtle"
                        size="small"
                        onClick={() => {
                          setEngine('local');
                          setErrorMessage(null);
                        }}
                        style={{ paddingLeft: 0, textDecoration: 'underline' }}
                      >
                        Switch to Local rules parser
                      </Button>
                    )}
                  </div>
                </div>
              )}

              {parsedResult && (
                <div
                  className="space-y-3 pt-3"
                  style={{ borderTop: `1px solid ${tokens.colorNeutralStroke2}` }}
                >
                  <div className="flex items-center justify-between">
                    <span
                      className="text-xs font-semibold flex items-center gap-1.5"
                      style={{ color: tokens.colorPaletteGreenForeground1 }}
                    >
                      <CheckmarkCircleRegular fontSize={15} />
                      <span>Extracted data ready</span>
                    </span>
                    <Button
                      appearance="subtle"
                      size="small"
                      icon={<ArrowSyncRegular />}
                      disabled={isProcessing}
                      onClick={handleStartParsing}
                    >
                      Re-parse
                    </Button>
                  </div>

                  <div
                    className="p-3 rounded-md text-xs space-y-2"
                    style={{
                      border: `1px solid ${tokens.colorNeutralStroke1}`,
                      backgroundColor: tokens.colorNeutralBackground2,
                    }}
                  >
                    <div>
                      <h4
                        className="font-semibold text-sm"
                        style={{ color: tokens.colorNeutralForeground1 }}
                      >
                        {parsedResult.header.fullName}
                      </h4>
                      <p style={{ color: tokens.colorNeutralForeground2 }}>
                        {parsedResult.header.degreeTitle} | {parsedResult.header.universityCompany}
                      </p>
                      <p
                        className="text-[11px] mt-0.5"
                        style={{ color: tokens.colorNeutralForeground3 }}
                      >
                        {parsedResult.header.location} | {parsedResult.header.email} |{' '}
                        {parsedResult.header.phone}
                      </p>
                    </div>

                    <div className="flex flex-wrap gap-1.5 pt-1">
                      {parsedResult.academics && (
                        <Badge appearance="outline" size="small">
                          Academics ({parsedResult.academics.rows.length})
                        </Badge>
                      )}
                      {parsedResult.technicalSkills && (
                        <Badge appearance="outline" size="small">
                          Skills ({parsedResult.technicalSkills.length})
                        </Badge>
                      )}
                      {parsedResult.projects && (
                        <Badge appearance="outline" size="small">
                          Projects ({parsedResult.projects.rows.length})
                        </Badge>
                      )}
                      {parsedResult.experience && (
                        <Badge appearance="outline" size="small">
                          Experience ({parsedResult.experience.rows.length})
                        </Badge>
                      )}
                      {parsedResult.personalProfile && (
                        <Badge appearance="outline" size="small">
                          Profile ({parsedResult.personalProfile.length})
                        </Badge>
                      )}
                    </div>
                  </div>

                  <Field label="3. Import mode">
                    <RadioGroup
                      layout="horizontal"
                      value={importMode}
                      onChange={(_, data) =>
                        setImportMode(data.value as 'replace' | 'merge')
                      }
                    >
                      <Radio value="replace" label="Replace existing sections" />
                      <Radio value="merge" label="Keep current and append new" />
                    </RadioGroup>
                  </Field>
                </div>
              )}
            </div>
          </DialogContent>

          <DialogActions>
            <Button appearance="secondary" onClick={() => setIsPdfAiModalOpen(false)}>
              Cancel
            </Button>
            {parsedResult && (
              <Button
                appearance="primary"
                icon={<ArrowRightRegular />}
                iconPosition="after"
                onClick={handleApply}
              >
                Apply to resume
              </Button>
            )}
          </DialogActions>
        </DialogBody>
      </DialogSurface>
    </Dialog>
  );
};
