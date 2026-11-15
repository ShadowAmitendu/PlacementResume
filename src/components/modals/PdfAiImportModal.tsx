import React, { useState, useEffect, useRef } from 'react';
import { useResume } from '../../context/ResumeContext';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '../ui/dialog';
import { Button } from '../ui/button';
import { extractTextFromPdf } from '../../utils/pdfExtractor';
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
import {
  Sparkles,
  FileText,
  Upload,
  CheckCircle2,
  AlertCircle,
  Cpu,
  Key,
  Layers,
  ArrowRight,
  Eye,
  EyeOff,
  RefreshCw,
  X,
  Bot,
} from 'lucide-react';

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

  // Gemini model fetching & selection
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

  const handleFetchModels = async (keyToUse?: string) => {
    const key = (keyToUse !== undefined ? keyToUse : apiKey).trim();
    if (!key) {
      setModelsFetchStatus('Enter an API key to fetch models.');
      return;
    }

    setIsLoadingModels(true);
    setModelsFetchStatus(null);
    try {
      const models = await fetchGeminiModels(key);
      setGeminiModels(models);
      setModelsFetchStatus(`Found ${models.length} models`);

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
    } catch (err: any) {
      console.warn('Failed to fetch Gemini models:', err);
      setModelsFetchStatus(err.message || 'Could not fetch models. Using presets.');
    } finally {
      setIsLoadingModels(false);
    }
  };

  const handleModelChange = (val: string) => {
    setSelectedModel(val);
    try {
      localStorage.setItem('placement_gemini_selected_model', val);
    } catch {}
  };

  // Check saved API key & available browser AI
  useEffect(() => {
    if (isPdfAiModalOpen) {
      const savedKey = localStorage.getItem('placement_gemini_api_key') || '';
      setApiKey(savedKey);

      checkAvailableAiEngines().then(({ hasWindowAi: winAi }) => {
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
      // Reset state on close
      setErrorMessage(null);
      setParsedResult(null);
      setIsProcessing(false);
      setStatusMessage('');
      if (pdfImportInitialFile) {
        setPdfImportInitialFile(null);
      }
    }
  }, [isPdfAiModalOpen, pdfImportInitialFile, setPdfImportInitialFile]);

  const handleApiKeyChange = (val: string) => {
    setApiKey(val);
    try {
      localStorage.setItem('placement_gemini_api_key', val.trim());
    } catch {
      // Ignore storage errors
    }

    if (val.trim().length > 25) {
      handleFetchModels(val);
    }
  };

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      if (!file.name.toLowerCase().endsWith('.pdf')) {
        setErrorMessage('Please select a valid .pdf resume file.');
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
        setErrorMessage('Please drop a valid .pdf resume file.');
        return;
      }
      setSelectedFile(file);
      setErrorMessage(null);
      setParsedResult(null);
    }
  };

  const handleStartParsing = async () => {
    if (!selectedFile) {
      setErrorMessage('Please select a PDF file first.');
      return;
    }

    setIsProcessing(true);
    setErrorMessage(null);
    setParsedResult(null);

    try {
      // Step 1: In-browser PDF text extraction
      setStatusMessage('Extracting text with PDF.js...');
      const rawText = await extractTextFromPdf(selectedFile);

      if (!rawText || rawText.trim().length < 30) {
        throw new Error(
          'Could not extract text from this PDF. It may be a scanned image or empty. Please ensure it contains selectable text.'
        );
      }

      // Step 2: AI Parsing
      const currentModel = geminiModels.find((m) => m.id === selectedModel);
      const modelDisplayName = currentModel?.displayName || selectedModel;

      setStatusMessage(
        `Analyzing resume structure with ${
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
          throw new Error('Please enter a Google Gemini API Key, or switch to the Local Parser.');
        }
        result = await parseResumeWithGemini(rawText, apiKey, selectedModel);
      } else if (engine === 'window-ai') {
        result = await parseResumeWithWindowAi(rawText);
      } else {
        result = parseResumeHeuristically(rawText);
      }

      setParsedResult(result);
      setStatusMessage('');
      showToast('Resume parsed successfully! Review the extracted details below.');
    } catch (err: any) {
      console.error('AI PDF parse error:', err);
      setErrorMessage(err.message || 'Failed to parse resume PDF. You can try the Local Parser.');
    } finally {
      setIsProcessing(false);
    }
  };

  const handleApply = () => {
    if (!parsedResult) return;
    const finalData = convertParsedToResumeData(parsedResult, resumeData, importMode);
    applyAiParsedResume(finalData);
    setIsPdfAiModalOpen(false);
  };

  const currentModelInfo = geminiModels.find((m) => m.id === selectedModel);

  return (
    <Dialog open={isPdfAiModalOpen} onOpenChange={setIsPdfAiModalOpen}>
      <DialogContent className="max-w-xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <div className="flex items-center gap-2">
            <div className="p-2 rounded-lg bg-primary/10 text-primary">
              <Sparkles className="w-5 h-5" />
            </div>
            <div>
              <DialogTitle className="text-base font-bold">Import Old Resume PDF (AI)</DialogTitle>
              <p className="text-xs text-[var(--ui-text-dim)]">
                Extract details from an existing resume PDF in your browser and automatically build your resume.
              </p>
            </div>
          </div>
        </DialogHeader>

        <div className="space-y-4 py-2">
          {/* File Upload Dropzone */}
          <div>
            <label className="text-[11px] font-semibold text-[var(--ui-text-dim)] uppercase tracking-wider block mb-1.5">
              1. Select Resume PDF
            </label>
            {!selectedFile ? (
              <div
                onDragOver={(e) => e.preventDefault()}
                onDrop={handleDrop}
                onClick={() => fileInputRef.current?.click()}
                className="border-2 border-dashed border-[var(--ui-border)] hover:border-primary/60 bg-[var(--ui-surface2)] hover:bg-primary/5 rounded-xl p-6 text-center cursor-pointer transition-colors flex flex-col items-center justify-center gap-2"
              >
                <div className="w-10 h-10 rounded-full bg-[var(--ui-surface)] flex items-center justify-center shadow-xs text-primary">
                  <Upload className="w-5 h-5" />
                </div>
                <div>
                  <p className="text-sm font-semibold text-[var(--ui-text)]">
                    Click to browse or drag &amp; drop PDF
                  </p>
                  <p className="text-xs text-[var(--ui-text-dim)] mt-0.5">
                    Supports any standard text-based PDF resume
                  </p>
                </div>
              </div>
            ) : (
              <div className="flex items-center justify-between p-3 rounded-xl border border-[var(--ui-border)] bg-[var(--ui-surface2)]">
                <div className="flex items-center gap-2.5 overflow-hidden">
                  <div className="p-2 rounded-lg bg-red-500/10 text-red-600 shrink-0">
                    <FileText className="w-5 h-5" />
                  </div>
                  <div className="min-w-0">
                    <p className="text-xs font-semibold text-[var(--ui-text)] truncate">
                      {selectedFile.name}
                    </p>
                    <p className="text-[10px] text-[var(--ui-text-dim)]">
                      {(selectedFile.size / 1024).toFixed(1)} KB • PDF Document
                    </p>
                  </div>
                </div>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => {
                    setSelectedFile(null);
                    setParsedResult(null);
                    setErrorMessage(null);
                  }}
                  className="h-8 w-8 p-0 text-muted-foreground hover:text-foreground shrink-0"
                  title="Remove selected file"
                >
                  <X className="w-4 h-4" />
                </Button>
              </div>
            )}
            <input
              ref={fileInputRef}
              type="file"
              accept=".pdf"
              onChange={handleFileSelect}
              className="hidden"
            />
          </div>

          {/* AI Engine Selection */}
          <div className="space-y-2">
            <label className="text-[11px] font-semibold text-[var(--ui-text-dim)] uppercase tracking-wider block">
              2. Choose AI Engine
            </label>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
              {/* Gemini API Option */}
              <button
                type="button"
                onClick={() => setEngine('gemini')}
                className={`p-2.5 rounded-lg border text-left cursor-pointer transition-colors ${
                  engine === 'gemini'
                    ? 'border-primary bg-primary/10 text-primary'
                    : 'border-[var(--ui-border)] bg-[var(--ui-surface)] hover:bg-[var(--ui-surface2)] text-[var(--ui-text)]'
                }`}
              >
                <div className="flex items-center gap-1.5 mb-1 font-semibold text-xs">
                  <Sparkles className="w-3.5 h-3.5 text-primary" />
                  <span>{currentModelInfo?.displayName || 'Google Gemini'}</span>
                </div>
                <p className="text-[10px] text-[var(--ui-text-dim)] leading-tight">
                  High-accuracy extraction using Google Gemini API.
                </p>
              </button>

              {/* Local Parser Option */}
              <button
                type="button"
                onClick={() => setEngine('local')}
                className={`p-2.5 rounded-lg border text-left cursor-pointer transition-colors ${
                  engine === 'local'
                    ? 'border-primary bg-primary/10 text-primary'
                    : 'border-[var(--ui-border)] bg-[var(--ui-surface)] hover:bg-[var(--ui-surface2)] text-[var(--ui-text)]'
                }`}
              >
                <div className="flex items-center gap-1.5 mb-1 font-semibold text-xs">
                  <Cpu className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400" />
                  <span>Instant Local</span>
                </div>
                <p className="text-[10px] text-[var(--ui-text-dim)] leading-tight">
                  Zero setup, 100% offline rule-based parser.
                </p>
              </button>

              {/* Chrome Built-in AI Option */}
              <button
                type="button"
                disabled={!hasWindowAi}
                onClick={() => setEngine('window-ai')}
                className={`p-2.5 rounded-lg border text-left transition-colors ${
                  !hasWindowAi
                    ? 'opacity-40 cursor-not-allowed border-[var(--ui-border)] bg-[var(--ui-surface)]'
                    : engine === 'window-ai'
                    ? 'border-primary bg-primary/10 text-primary cursor-pointer'
                    : 'border-[var(--ui-border)] bg-[var(--ui-surface)] hover:bg-[var(--ui-surface2)] text-[var(--ui-text)] cursor-pointer'
                }`}
                title={!hasWindowAi ? 'Requires Chrome with Prompt API / Gemini Nano enabled' : undefined}
              >
                <div className="flex items-center gap-1.5 mb-1 font-semibold text-xs">
                  <Layers className="w-3.5 h-3.5 text-purple-600 dark:text-purple-400" />
                  <span>Window.ai</span>
                </div>
                <p className="text-[10px] text-[var(--ui-text-dim)] leading-tight">
                  {hasWindowAi ? 'On-device Gemini Nano model.' : 'Not available in this browser.'}
                </p>
              </button>
            </div>

            {/* Gemini API Key & Model Selection */}
            {engine === 'gemini' && (
              <div className="p-3 rounded-lg border border-[var(--ui-border)] bg-[var(--ui-surface2)] space-y-3 mt-2">
                {/* API Key */}
                <div className="space-y-1.5">
                  <div className="flex items-center justify-between text-xs">
                    <span className="font-medium text-[var(--ui-text)] flex items-center gap-1.5">
                      <Key className="w-3.5 h-3.5 text-primary" />
                      Google Gemini API Key
                    </span>
                    <a
                      href="https://aistudio.google.com/app/apikey"
                      target="_blank"
                      rel="noreferrer"
                      className="text-[11px] text-primary hover:underline font-medium"
                    >
                      Get Free API Key ↗
                    </a>
                  </div>
                  <div className="relative flex items-center">
                    <input
                      type={showApiKey ? 'text' : 'password'}
                      value={apiKey}
                      onChange={(e) => handleApiKeyChange(e.target.value)}
                      placeholder="AIzaSy..."
                      className="w-full pr-8 pl-2.5 py-1.5 text-xs rounded-md border border-[var(--ui-border)] bg-[var(--ui-surface)] text-[var(--ui-text)] focus:outline-none focus:border-primary font-mono"
                    />
                    <button
                      type="button"
                      onClick={() => setShowApiKey(!showApiKey)}
                      className="absolute right-2 text-muted-foreground hover:text-foreground cursor-pointer"
                    >
                      {showApiKey ? <EyeOff className="w-3.5 h-3.5" /> : <Eye className="w-3.5 h-3.5" />}
                    </button>
                  </div>
                </div>

                {/* Model Selection Dropdown */}
                <div className="space-y-1.5 pt-2 border-t border-[var(--ui-border)]/70">
                  <div className="flex items-center justify-between text-xs">
                    <span className="font-medium text-[var(--ui-text)] flex items-center gap-1.5">
                      <Bot className="w-3.5 h-3.5 text-primary" />
                      Select Gemini Model
                    </span>
                    <button
                      type="button"
                      disabled={isLoadingModels || !apiKey.trim()}
                      onClick={() => handleFetchModels()}
                      className="text-[11px] text-primary hover:underline flex items-center gap-1 cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
                      title="Fetch live model list from Google Gemini API"
                    >
                      <RefreshCw className={`w-3 h-3 ${isLoadingModels ? 'animate-spin' : ''}`} />
                      <span>{isLoadingModels ? 'Fetching...' : 'Fetch Models'}</span>
                    </button>
                  </div>

                  <select
                    value={selectedModel}
                    onChange={(e) => handleModelChange(e.target.value)}
                    disabled={isLoadingModels}
                    className="w-full px-2.5 py-1.5 text-xs rounded-md border border-[var(--ui-border)] bg-[var(--ui-surface)] text-[var(--ui-text)] focus:outline-none focus:border-primary cursor-pointer font-medium"
                  >
                    {geminiModels.map((m) => (
                      <option key={m.id} value={m.id}>
                        {m.displayName} ({m.id})
                      </option>
                    ))}
                  </select>

                  <div className="flex items-center justify-between text-[10px] text-[var(--ui-text-dim)] pt-0.5">
                    <span className="truncate max-w-[70%]">
                      {currentModelInfo?.description || 'Select a Gemini model for resume parsing.'}
                    </span>
                    {modelsFetchStatus && (
                      <span className="shrink-0 text-primary font-medium">{modelsFetchStatus}</span>
                    )}
                  </div>
                </div>

                <p className="text-[10px] text-[var(--ui-text-dim)]">
                  Your key is stored securely in your browser's local storage and used directly via client-side fetch.
                </p>
              </div>
            )}
          </div>

          {/* Action Button: Parse */}
          {!parsedResult && (
            <div className="pt-2">
              <Button
                onClick={handleStartParsing}
                disabled={!selectedFile || isProcessing}
                className="w-full text-xs h-10 gap-2 bg-primary text-primary-foreground font-semibold shadow-md cursor-pointer"
              >
                {isProcessing ? (
                  <>
                    <RefreshCw className="w-4 h-4 animate-spin" />
                    <span>{statusMessage || 'Processing PDF...'}</span>
                  </>
                ) : (
                  <>
                    <Sparkles className="w-4 h-4" />
                    <span>Extract &amp; Populate Resume</span>
                  </>
                )}
              </Button>
            </div>
          )}

          {/* Error Message */}
          {errorMessage && (
            <div className="p-3 rounded-lg bg-destructive/10 border border-destructive/20 text-destructive text-xs flex items-start gap-2">
              <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
              <div className="flex-1">
                <p className="font-semibold">Extraction Error</p>
                <p className="text-[11px] mt-0.5">{errorMessage}</p>
                {engine !== 'local' && (
                  <button
                    type="button"
                    onClick={() => {
                      setEngine('local');
                      setErrorMessage(null);
                    }}
                    className="mt-1.5 text-[11px] font-semibold underline cursor-pointer hover:opacity-80"
                  >
                    Try using the Instant Local Parser instead →
                  </button>
                )}
              </div>
            </div>
          )}

          {/* Parsed Result Preview */}
          {parsedResult && (
            <div className="space-y-3 pt-2 border-t border-[var(--ui-border)]">
              <div className="flex items-center justify-between">
                <span className="text-[11px] font-semibold text-emerald-600 dark:text-emerald-400 flex items-center gap-1.5">
                  <CheckCircle2 className="w-4 h-4" />
                  Successfully Extracted Details
                </span>
                <button
                  type="button"
                  onClick={handleStartParsing}
                  disabled={isProcessing}
                  className="text-[11px] text-primary hover:underline flex items-center gap-1 cursor-pointer"
                >
                  <RefreshCw className="w-3 h-3" />
                  Re-parse
                </button>
              </div>

              {/* Summary Card */}
              <div className="p-3 rounded-xl border border-[var(--ui-border)] bg-[var(--ui-surface2)] text-xs space-y-2">
                <div>
                  <h4 className="font-bold text-sm text-[var(--ui-text)]">
                    {parsedResult.header.fullName}
                  </h4>
                  <p className="text-[11px] text-[var(--ui-text-dim)]">
                    {parsedResult.header.degreeTitle} • {parsedResult.header.universityCompany}
                  </p>
                  <p className="text-[10px] text-[var(--ui-text-dim)] mt-0.5">
                    {parsedResult.header.location} | {parsedResult.header.email} | {parsedResult.header.phone}
                  </p>
                </div>

                <div className="flex flex-wrap gap-1.5 pt-1">
                  {parsedResult.academics && (
                    <span className="px-2 py-0.5 rounded-full bg-blue-500/10 text-blue-600 dark:text-blue-400 text-[10px] font-medium">
                      🎓 Academics ({parsedResult.academics.rows.length} rows)
                    </span>
                  )}
                  {parsedResult.technicalSkills && (
                    <span className="px-2 py-0.5 rounded-full bg-purple-500/10 text-purple-600 dark:text-purple-400 text-[10px] font-medium">
                      ⚡ Skills ({parsedResult.technicalSkills.length} items)
                    </span>
                  )}
                  {parsedResult.projects && (
                    <span className="px-2 py-0.5 rounded-full bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 text-[10px] font-medium">
                      🚀 Projects ({parsedResult.projects.rows.length} items)
                    </span>
                  )}
                  {parsedResult.experience && (
                    <span className="px-2 py-0.5 rounded-full bg-amber-500/10 text-amber-600 dark:text-amber-400 text-[10px] font-medium">
                      💼 Experience ({parsedResult.experience.rows.length} items)
                    </span>
                  )}
                  {parsedResult.personalProfile && (
                    <span className="px-2 py-0.5 rounded-full bg-teal-500/10 text-teal-600 dark:text-teal-400 text-[10px] font-medium">
                      👤 Profile ({parsedResult.personalProfile.length} fields)
                    </span>
                  )}
                </div>
              </div>

              {/* Import Mode Selection */}
              <div className="space-y-1.5">
                <label className="text-[11px] font-semibold text-[var(--ui-text-dim)] uppercase tracking-wider block">
                  3. Import Method
                </label>
                <div className="grid grid-cols-2 gap-2 text-xs">
                  <label
                    className={`flex items-center gap-2 p-2.5 rounded-lg border cursor-pointer transition-colors ${
                      importMode === 'replace'
                        ? 'border-primary bg-primary/10 text-primary font-semibold'
                        : 'border-[var(--ui-border)] bg-[var(--ui-surface)] text-[var(--ui-text)]'
                    }`}
                  >
                    <input
                      type="radio"
                      name="importMode"
                      value="replace"
                      checked={importMode === 'replace'}
                      onChange={() => setImportMode('replace')}
                      className="accent-primary"
                    />
                    <div>
                      <span>Replace All</span>
                      <p className="text-[10px] text-[var(--ui-text-dim)] font-normal">
                        Fresh import of all sections
                      </p>
                    </div>
                  </label>

                  <label
                    className={`flex items-center gap-2 p-2.5 rounded-lg border cursor-pointer transition-colors ${
                      importMode === 'merge'
                        ? 'border-primary bg-primary/10 text-primary font-semibold'
                        : 'border-[var(--ui-border)] bg-[var(--ui-surface)] text-[var(--ui-text)]'
                    }`}
                  >
                    <input
                      type="radio"
                      name="importMode"
                      value="merge"
                      checked={importMode === 'merge'}
                      onChange={() => setImportMode('merge')}
                      className="accent-primary"
                    />
                    <div>
                      <span>Merge</span>
                      <p className="text-[10px] text-[var(--ui-text-dim)] font-normal">
                        Keep current sections, add new
                      </p>
                    </div>
                  </label>
                </div>
              </div>
            </div>
          )}
        </div>

        <DialogFooter className="gap-2 pt-2 border-t border-[var(--ui-border)]">
          <Button variant="outline" size="sm" onClick={() => setIsPdfAiModalOpen(false)}>
            Cancel
          </Button>
          {parsedResult && (
            <Button
              size="sm"
              onClick={handleApply}
              className="gap-1.5 bg-primary text-primary-foreground font-semibold shadow-md"
            >
              <span>Apply to Resume</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </Button>
          )}
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};
