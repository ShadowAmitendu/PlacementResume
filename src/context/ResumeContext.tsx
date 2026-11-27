import React, { createContext, useContext, useEffect, useState, useCallback, useRef, useMemo } from 'react';
import {
  ResumeData,
  ResumeMeta,
  HeaderData,
  HeaderLink,
  SectionData,
  DeclarationData,
  TableSectionData,
  TextSectionData,
  ListSectionData,
  SectionType,
} from '../types/resume';
import { DEFAULT_RESUME_DATA, THEMES } from '../constants/themes';
import { buildEqualColWidths, normalizeColWidths } from '../utils/tableWidths';
import { createUniqueId, sanitizeLinkUrl, sanitizeRichTextHtml } from '../utils/sanitize';
import { MAX_ZOOM, MIN_ZOOM } from '../utils/documentMetrics';
import { useHistory } from '../hooks/useHistory';
import { parseLegacyResume } from '../utils/legacyMigration';

export type SaveStatus = 'saved' | 'saving' | 'error';

interface ConfirmDialogState {
  isOpen: boolean;
  title: string;
  message: string;
  confirmLabel: string;
  onConfirm: () => void;
}

interface AlertDialogState {
  isOpen: boolean;
  title: string;
  message: string;
}

interface ToastState {
  show: boolean;
  message: string;
  id?: number;
}

interface ResumeContextType {
  resumeData: ResumeData;
  canUndo: boolean;
  canRedo: boolean;
  undo: () => void;
  redo: () => void;

  // Meta actions
  updateMeta: (meta: Partial<ResumeMeta>) => void;
  setTheme: (theme: string) => void;
  setFont: (font: string) => void;
  setTableStyle: (style: string) => void;
  setMarker: (marker: string) => void;
  setZoom: (zoom: number | ((prev: number) => number)) => void;
  setResponsiveZoom: (zoom: number | null) => void;
  setPhoto: (photoBase64: string | null) => void;

  // Header actions
  updateHeader: (header: Partial<HeaderData>) => void;
  addLink: (link: Omit<HeaderLink, 'id'>) => void;
  updateLink: (id: string, link: Partial<HeaderLink>) => void;
  removeLink: (id: string) => void;

  // Section actions
  addSection: (type: SectionType) => void;
  updateSection: (id: string, updated: Partial<SectionData>) => void;
  updateListItem: (sectionId: string, itemIndex: number, value: string) => void;
  removeSection: (id: string) => void;
  duplicateSection: (id: string) => void;
  reorderSections: (newSections: SectionData[]) => void;

  // Table actions
  addTableRow: (sectionId: string, rowIndex?: number) => void;
  deleteTableRow: (sectionId: string, rowIndex?: number) => void;
  addTableColumn: (sectionId: string, atIndex?: number) => void;
  deleteTableColumn: (sectionId: string, colIndex?: number) => void;
  toggleTableBorders: (sectionId: string) => void;
  updateTableCell: (
    sectionId: string,
    rowIndex: number,
    colIndex: number,
    value: string,
    isHeader?: boolean
  ) => void;

  // Declaration
  updateDeclaration: (decl: Partial<DeclarationData>) => void;

  // Storage
  saveToBrowser: () => void;
  clearBrowserSave: () => void;
  exportResume: (fileName: string) => void;
  importResume: (file: File) => Promise<void>;

  // Theme & App UI
  isDarkMode: boolean;
  toggleDarkMode: () => void;
  saveStatus: SaveStatus;

  // Modals & Feedback
  isLinkModalOpen: boolean;
  setIsLinkModalOpen: (open: boolean) => void;
  editingLink: HeaderLink | null;
  setEditingLink: (link: HeaderLink | null) => void;

  isExportModalOpen: boolean;
  setIsExportModalOpen: (open: boolean) => void;

  isFindReplaceModalOpen: boolean;
  setIsFindReplaceModalOpen: (open: boolean) => void;
  findAndReplaceAll: (search: string, replaceWith: string, matchCase?: boolean) => number;

  isSignatureModalOpen: boolean;
  setIsSignatureModalOpen: (open: boolean) => void;

  isPdfAiModalOpen: boolean;
  setIsPdfAiModalOpen: (open: boolean) => void;
  pdfImportInitialFile: File | null;
  setPdfImportInitialFile: (file: File | null) => void;
  applyAiParsedResume: (parsedData: ResumeData) => void;

  isCropModalOpen: boolean;
  setIsCropModalOpen: (open: boolean) => void;
  cropImageSrc: string | null;
  setCropImageSrc: (src: string | null) => void;
  openCropModal: (imageSrc?: string | null) => void;

  confirmDialog: ConfirmDialogState;
  showConfirm: (message: string, title?: string, confirmLabel?: string) => Promise<boolean>;
  closeConfirm: () => void;

  alertDialog: AlertDialogState;
  showAlert: (message: string, title?: string) => void;
  closeAlert: () => void;

  toast: ToastState;
  showToast: (message: string) => void;
}

const ResumeContext = createContext<ResumeContextType | null>(null);

const STORAGE_KEY = 'mySavedResume';
const DARK_MODE_KEY = 'resumeAppDarkMode';
const ZOOM_KEY = 'resumeAppZoom';

export const ResumeProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  // Load saved state or default
  const getInitialState = (): ResumeData => {
    let initial = DEFAULT_RESUME_DATA;
    try {
      const saved = localStorage.getItem(STORAGE_KEY);
      if (saved) {
        initial = parseLegacyResume(JSON.parse(saved));
      }
    } catch (e) {
      console.warn('Failed to load initial resume data from localStorage', e);
    }
    return initial;
  };

  const {
    state: storedResumeData,
    set: setResumeData,
    setDebounced: setResumeDataDebounced,
    undo,
    redo,
    canUndo,
    canRedo,
    resetHistory,
  } = useHistory<ResumeData>(getInitialState());

  const [zoomState, setZoomState] = useState<number>(() => {
    try {
      const savedZoom = localStorage.getItem(ZOOM_KEY);
      if (savedZoom) {
        const parsedZoom = parseFloat(savedZoom);
        if (!isNaN(parsedZoom) && parsedZoom >= MIN_ZOOM && parsedZoom <= MAX_ZOOM) {
          return parsedZoom;
        }
      }
    } catch {
      // ignore
    }
    return DEFAULT_RESUME_DATA.meta.zoom || 1;
  });
  const [responsiveZoom, setResponsiveZoom] = useState<number | null>(null);
  const effectiveZoom = responsiveZoom ?? zoomState;

  const resumeData = useMemo<ResumeData>(
    () => ({
      ...storedResumeData,
      meta: {
        ...storedResumeData.meta,
        zoom: effectiveZoom,
      },
    }),
    [storedResumeData, effectiveZoom]
  );

  // Dark mode state
  const [isDarkMode, setIsDarkMode] = useState<boolean>(() => {
    try {
      return localStorage.getItem(DARK_MODE_KEY) === 'true';
    } catch {
      return false;
    }
  });
  const [saveStatus, setSaveStatus] = useState<SaveStatus>('saved');

  const [isLinkModalOpen, setIsLinkModalOpen] = useState(false);
  const [editingLink, setEditingLink] = useState<HeaderLink | null>(null);
  const [isExportModalOpen, setIsExportModalOpen] = useState(false);
  const [isFindReplaceModalOpen, setIsFindReplaceModalOpen] = useState(false);
  const [isSignatureModalOpen, setIsSignatureModalOpen] = useState(false);
  const [isPdfAiModalOpen, setIsPdfAiModalOpen] = useState(false);
  const [pdfImportInitialFile, setPdfImportInitialFile] = useState<File | null>(null);
  const [isCropModalOpen, setIsCropModalOpen] = useState(false);
  const [cropImageSrc, setCropImageSrc] = useState<string | null>(null);

  const openCropModal = useCallback(
    (src?: string | null) => {
      if (src) {
        setCropImageSrc(src);
      } else if (resumeData.meta.photo) {
        setCropImageSrc(resumeData.meta.photo);
      }
      setIsCropModalOpen(true);
    },
    [resumeData.meta.photo]
  );

  // Modals & Toast
  const [toast, setToast] = useState<ToastState>({ show: false, message: '', id: 0 });
  const [alertDialog, setAlertDialog] = useState<AlertDialogState>({
    isOpen: false,
    title: '',
    message: '',
  });

  const [confirmDialog, setConfirmDialog] = useState<ConfirmDialogState>({
    isOpen: false,
    title: '',
    message: '',
    confirmLabel: 'Confirm',
    onConfirm: () => {},
  });

  const confirmResolverRef = useRef<((val: boolean) => void) | null>(null);

  const showToast = useCallback((message: string) => {
    setToast({ show: true, message, id: Date.now() + Math.random() });
  }, []);

  const showAlert = useCallback((message: string, title = 'Notice') => {
    setAlertDialog({ isOpen: true, title, message });
  }, []);

  const closeAlert = useCallback(() => {
    setAlertDialog({ isOpen: false, title: '', message: '' });
  }, []);

  const showConfirm = useCallback(
    (message: string, title = 'Are you sure?', confirmLabel = 'Delete'): Promise<boolean> => {
      if (confirmResolverRef.current) {
        confirmResolverRef.current(false);
        confirmResolverRef.current = null;
      }
      return new Promise((resolve) => {
        confirmResolverRef.current = resolve;
        setConfirmDialog({
          isOpen: true,
          title,
          message,
          confirmLabel,
          onConfirm: () => {
            resolve(true);
            setConfirmDialog((prev) => ({ ...prev, isOpen: false }));
            confirmResolverRef.current = null;
          },
        });
      });
    },
    []
  );

  const closeConfirm = useCallback(() => {
    if (confirmResolverRef.current) {
      confirmResolverRef.current(false);
      confirmResolverRef.current = null;
    }
    setConfirmDialog((prev) => ({ ...prev, isOpen: false }));
  }, []);

  const toggleDarkMode = useCallback(() => {
    setIsDarkMode((prev) => {
      const next = !prev;
      try {
        localStorage.setItem(DARK_MODE_KEY, String(next));
      } catch (err) {
        console.warn('Storage blocked', err);
      }
      return next;
    });
  }, []);

  // Sync document body class & CSS root variables
  useEffect(() => {
    document.documentElement.classList.toggle('dark', isDarkMode);
    document.body.classList.toggle('dark', isDarkMode);
    document.body.classList.toggle('dark-mode', isDarkMode);
  }, [isDarkMode]);

  useEffect(() => {
    const root = document.documentElement;
    const themeConfig = THEMES[resumeData.meta.theme] || THEMES.classic;

    root.style.setProperty('--theme-color', themeConfig.color);
    root.style.setProperty('--theme-bg-light', themeConfig.bg);
    root.style.setProperty('--theme-text-light', themeConfig.text);
    root.style.setProperty('--main-font', resumeData.meta.font);
    root.style.setProperty('--section-marker', `"${resumeData.meta.marker}"`);
  }, [resumeData.meta.theme, resumeData.meta.font, resumeData.meta.marker]);

  // Auto-save to localStorage with debounce
  const hasMountedAutoSaveRef = useRef(false);
  useEffect(() => {
    if (!hasMountedAutoSaveRef.current) {
      hasMountedAutoSaveRef.current = true;
      return;
    }
    setSaveStatus('saving');
    const timer = setTimeout(() => {
      try {
        localStorage.setItem(STORAGE_KEY, JSON.stringify(storedResumeData));
        setSaveStatus('saved');
      } catch (e) {
        console.warn('Auto-save error', e);
        setSaveStatus('error');
      }
    }, 1500);
    return () => clearTimeout(timer);
  }, [storedResumeData]);

  // Check for URL hash import (#import=<base64>)
  useEffect(() => {
    const hash = window.location.hash;
    if (hash && hash.startsWith('#import=')) {
      try {
        const b64 = hash.substring(8);
        const binary = atob(b64);
        const bytes = Uint8Array.from(binary, (c) => c.charCodeAt(0));
        const json = new TextDecoder().decode(bytes);
        const data = parseLegacyResume(JSON.parse(json));
        resetHistory(data);
        window.location.hash = '';
        showToast('Resume imported from URL');
      } catch (e) {
        console.error('URL import failed', e);
        showToast('Could not import resume from URL');
      }
    }
  }, [resetHistory, showToast]);

  const shortcutStateRef = useRef({
    storedResumeData,
    undo,
    redo,
    showToast,
    closeAlert,
    closeConfirm,
    adjustZoom: (_delta: number) => {},
    resetZoom: () => {},
  });
  shortcutStateRef.current = {
    storedResumeData,
    undo,
    redo,
    showToast,
    closeAlert,
    closeConfirm,
    adjustZoom: shortcutStateRef.current.adjustZoom,
    resetZoom: shortcutStateRef.current.resetZoom,
  };

  // Keyboard shortcuts (Ctrl+Z, Ctrl+Y, Ctrl+F, Ctrl+H, Ctrl+S, Ctrl+Plus/Minus/0, Ctrl+Scroll, Esc)
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      const latest = shortcutStateRef.current;

      if ((e.ctrlKey || e.metaKey) && !e.altKey) {
        if (
          e.key === '+' ||
          e.key === '=' ||
          e.code === 'NumpadAdd' ||
          e.code === 'Equal'
        ) {
          e.preventDefault();
          latest.adjustZoom(0.1);
          return;
        }
        if (
          e.key === '-' ||
          e.key === '_' ||
          e.code === 'NumpadSubtract' ||
          e.code === 'Minus'
        ) {
          e.preventDefault();
          latest.adjustZoom(-0.1);
          return;
        }
        if (e.key === '0' || e.code === 'Digit0' || e.code === 'Numpad0') {
          e.preventDefault();
          latest.resetZoom();
          return;
        }
      }

      if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === 's') {
        e.preventDefault();
        try {
          localStorage.setItem(STORAGE_KEY, JSON.stringify(latest.storedResumeData));
          setSaveStatus('saved');
          latest.showToast('Saved to browser');
        } catch {
          setSaveStatus('error');
          latest.showToast('Save failed, storage may be full');
        }
        return;
      }

      if ((e.ctrlKey || e.metaKey) && (e.key.toLowerCase() === 'f' || e.key.toLowerCase() === 'h')) {
        e.preventDefault();
        setIsFindReplaceModalOpen(true);
        return;
      }

      if (e.key === 'Escape') {
        latest.closeAlert();
        latest.closeConfirm();
      }

      const target = e.target as HTMLElement | null;
      if (
        !target ||
        target.tagName === 'INPUT' ||
        target.tagName === 'TEXTAREA' ||
        target.tagName === 'SELECT' ||
        target.isContentEditable
      ) {
        return;
      }

      const keyLower = e.key.toLowerCase();
      if ((e.ctrlKey || e.metaKey) && keyLower === 'z' && !e.shiftKey) {
        e.preventDefault();
        latest.undo();
        latest.showToast('Undone');
      }
      if ((e.ctrlKey || e.metaKey) && (keyLower === 'y' || (e.shiftKey && keyLower === 'z'))) {
        e.preventDefault();
        latest.redo();
        latest.showToast('Redone');
      }
    };

    const handleWheel = (e: WheelEvent) => {
      if (!(e.ctrlKey || e.metaKey)) return;
      const target = e.target as HTMLElement | null;
      if (target?.closest('[role="dialog"] canvas')) return;
      e.preventDefault();
      if (e.deltaY === 0) return;
      const step = Math.abs(e.deltaY) < 40 ? 0.02 : 0.1;
      shortcutStateRef.current.adjustZoom(e.deltaY < 0 ? step : -step);
    };

    window.addEventListener('keydown', handleKeyDown);
    window.addEventListener('wheel', handleWheel, { passive: false });
    return () => {
      window.removeEventListener('keydown', handleKeyDown);
      window.removeEventListener('wheel', handleWheel);
    };
  }, []);

  // Embed resume data in document.title before printing so the PDF can be
  // reimported losslessly without AI parsing.
  useEffect(() => {
    const originalTitle = document.title;
    const handleBeforePrint = () => {
      try {
        const json = JSON.stringify(storedResumeData);
        const b64 = btoa(unescape(encodeURIComponent(json)));
        document.title = `RSBLD::${b64}`;
      } catch {
        // If data is too large or encoding fails, leave title unchanged.
      }
    };
    const handleAfterPrint = () => {
      document.title = originalTitle;
    };
    window.addEventListener('beforeprint', handleBeforePrint);
    window.addEventListener('afterprint', handleAfterPrint);
    return () => {
      window.removeEventListener('beforeprint', handleBeforePrint);
      window.removeEventListener('afterprint', handleAfterPrint);
      document.title = originalTitle;
    };
  }, [storedResumeData]);

  // --- Meta Actions ---
  const updateMeta = useCallback(
    (meta: Partial<ResumeMeta>) => {
      setResumeData((prev) => ({
        ...prev,
        meta: { ...prev.meta, ...meta },
      }));
    },
    [setResumeData]
  );

  const setTheme = useCallback((theme: string) => updateMeta({ theme }), [updateMeta]);
  const setFont = useCallback((font: string) => updateMeta({ font }), [updateMeta]);
  const setTableStyle = useCallback((tableStyle: string) => updateMeta({ tableStyle }), [updateMeta]);
  const setMarker = useCallback((marker: string) => updateMeta({ marker }), [updateMeta]);
  const responsiveZoomRef = useRef<number | null>(null);
  responsiveZoomRef.current = responsiveZoom;

  const setZoom = useCallback(
    (zoomOrUpdater: number | ((prev: number) => number)) => {
      const activeOverride = responsiveZoomRef.current;
      responsiveZoomRef.current = null;
      setResponsiveZoom(null);
      setZoomState((prev) => {
        const current = activeOverride ?? prev;
        const raw = typeof zoomOrUpdater === 'function' ? zoomOrUpdater(current) : zoomOrUpdater;
        const clamped = Math.max(MIN_ZOOM, Math.min(MAX_ZOOM, Math.round(raw * 100) / 100));
        try {
          localStorage.setItem(ZOOM_KEY, String(clamped));
        } catch {
          // ignore
        }
        return clamped;
      });
    },
    []
  );
  shortcutStateRef.current.adjustZoom = (delta: number) => setZoom((prev) => prev + delta);
  shortcutStateRef.current.resetZoom = () => setZoom(1.0);
  const setPhoto = useCallback((photo: string | null) => updateMeta({ photo }), [updateMeta]);

  // --- Header Actions ---
  const updateHeader = useCallback(
    (headerUpdate: Partial<HeaderData>) => {
      setResumeDataDebounced((prev) => ({
        ...prev,
        header: { ...prev.header, ...headerUpdate },
      }));
    },
    [setResumeDataDebounced]
  );

  const addLink = useCallback(
    (newLink: Omit<HeaderLink, 'id'>) => {
      const link: HeaderLink = {
        ...newLink,
        url: sanitizeLinkUrl(newLink.url),
        id: createUniqueId('link'),
      };
      setResumeData((prev) => ({
        ...prev,
        header: {
          ...prev.header,
          links: [...prev.header.links, link],
        },
      }));
      showToast('Link added');
    },
    [setResumeData, showToast]
  );

  const updateLink = useCallback(
    (id: string, linkUpdate: Partial<HeaderLink>) => {
      const cleanUpdate =
        linkUpdate.url !== undefined
          ? { ...linkUpdate, url: sanitizeLinkUrl(linkUpdate.url) }
          : linkUpdate;
      setResumeData((prev) => ({
        ...prev,
        header: {
          ...prev.header,
          links: prev.header.links.map((l) => (l.id === id ? { ...l, ...cleanUpdate } : l)),
        },
      }));
      showToast('Link updated');
    },
    [setResumeData, showToast]
  );

  const removeLink = useCallback(
    async (id: string) => {
      const confirmed = await showConfirm(
        'This link will be permanently removed from your resume.',
        'Delete Link?',
        'Delete'
      );
      if (confirmed) {
        setResumeData((prev) => ({
          ...prev,
          header: {
            ...prev.header,
            links: prev.header.links.filter((l) => l.id !== id),
          },
        }));
        showToast('Link deleted');
      }
    },
    [setResumeData, showConfirm, showToast]
  );

  // --- Section Actions ---
  const addSection = useCallback(
    (type: SectionType) => {
      const id = createUniqueId('sec');
      let newSection: SectionData;

      switch (type) {
        case 'text':
          newSection = {
            id,
            type: 'text',
            title: 'New Section:',
            content: 'Enter your text here...',
          };
          break;
        case 'table':
          newSection = {
            id,
            type: 'table',
            title: 'New Table:',
            headers: ['Header 1', 'Header 2'],
            rows: [['Data 1', 'Data 2']],
            showColBorders: false,
          };
          break;
        case 'list':
          newSection = {
            id,
            type: 'list',
            title: 'New List:',
            items: ['List item one', 'List item two'],
          };
          break;
        case 'hr':
          newSection = {
            id,
            type: 'hr',
            title: '',
          };
          break;
      }

      setResumeData((prev) => ({
        ...prev,
        sections: [...prev.sections, newSection],
      }));
      showToast('Section added');
    },
    [setResumeData, showToast]
  );

  const updateSection = useCallback(
    (id: string, updated: Partial<SectionData>) => {
      setResumeDataDebounced((prev) => ({
        ...prev,
        sections: prev.sections.map((s) => (s.id === id ? ({ ...s, ...updated } as SectionData) : s)),
      }));
    },
    [setResumeDataDebounced]
  );

  const updateListItem = useCallback(
    (sectionId: string, itemIndex: number, value: string) => {
      setResumeDataDebounced((prev) => ({
        ...prev,
        sections: prev.sections.map((sec) => {
          if (sec.id !== sectionId || sec.type !== 'list') return sec;
          const listSec = sec as ListSectionData;
          if (itemIndex < 0 || itemIndex >= listSec.items.length) return sec;
          const newItems = [...listSec.items];
          newItems[itemIndex] = value;
          return { ...listSec, items: newItems };
        }),
      }));
    },
    [setResumeDataDebounced]
  );

  const removeSection = useCallback(
    async (id: string) => {
      const confirmed = await showConfirm(
        'This section and all its content will be removed. You can undo with Ctrl+Z.',
        'Delete Section?',
        'Delete'
      );
      if (confirmed) {
        setResumeData((prev) => ({
          ...prev,
          sections: prev.sections.filter((s) => s.id !== id),
        }));
        showToast('Section removed');
      }
    },
    [setResumeData, showConfirm, showToast]
  );

  const duplicateSection = useCallback(
    (id: string) => {
      setResumeData((prev) => {
        const index = prev.sections.findIndex((s) => s.id === id);
        if (index === -1) return prev;
        const target = prev.sections[index];
        const clone = JSON.parse(JSON.stringify(target));
        clone.id = createUniqueId('sec');

        const newSections = [...prev.sections];
        newSections.splice(index + 1, 0, clone);
        return {
          ...prev,
          sections: newSections,
        };
      });
      showToast('Section duplicated');
    },
    [setResumeData, showToast]
  );

  const reorderSections = useCallback(
    (newSections: SectionData[]) => {
      setResumeData((prev) => ({
        ...prev,
        sections: newSections,
      }));
    },
    [setResumeData]
  );

  // --- Table Actions ---
  const addTableRow = useCallback(
    (sectionId: string, rowIndex?: number) => {
      setResumeData((prev) => ({
        ...prev,
        sections: prev.sections.map((sec) => {
          if (sec.id !== sectionId || sec.type !== 'table') return sec;
          const tableSec = sec as TableSectionData;
          const colCount = tableSec.headers?.length || (tableSec.rows[0] ? tableSec.rows[0].length : 2);
          const newRow = Array(colCount).fill('[Data]');
          let newRows: string[][];
          if (rowIndex !== undefined && rowIndex >= 0 && rowIndex <= tableSec.rows.length) {
            newRows = [...tableSec.rows];
            newRows.splice(rowIndex, 0, newRow);
          } else {
            newRows = [...tableSec.rows, newRow];
          }
          return {
            ...tableSec,
            rows: newRows,
          };
        }),
      }));
    },
    [setResumeData]
  );

  const deleteTableRow = useCallback(
    (sectionId: string, rowIndex?: number) => {
      setResumeData((prev) => ({
        ...prev,
        sections: prev.sections.map((sec) => {
          if (sec.id !== sectionId || sec.type !== 'table') return sec;
          const tableSec = sec as TableSectionData;
          if (tableSec.rows.length <= 1) {
            showAlert('This is the last data row and cannot be deleted.', 'Cannot Delete Row');
            return sec;
          }
          const targetIndex = rowIndex !== undefined ? rowIndex : tableSec.rows.length - 1;
          const newRows = tableSec.rows.filter((_, idx) => idx !== targetIndex);
          return {
            ...tableSec,
            rows: newRows,
          };
        }),
      }));
    },
    [setResumeData, showAlert]
  );

  const addTableColumn = useCallback(
    (sectionId: string, atIndex?: number) => {
      setResumeData((prev) => ({
        ...prev,
        sections: prev.sections.map((sec) => {
          if (sec.id !== sectionId || sec.type !== 'table') return sec;
          const tableSec = sec as TableSectionData;
          const currentCols = tableSec.headers?.length || (tableSec.rows[0]?.length || 0);
          const insertIdx = atIndex !== undefined ? Math.max(0, Math.min(atIndex, currentCols)) : currentCols;

          let newHeaders: string[] | undefined = undefined;
          if (tableSec.headers) {
            newHeaders = [...tableSec.headers];
            newHeaders.splice(insertIdx, 0, '[Header]');
          }
          const newRows = tableSec.rows.map((row) => {
            const copy = [...row];
            copy.splice(insertIdx, 0, '[Data]');
            return copy;
          });
          const newColsCount = currentCols + 1;
          const newColWidths = buildEqualColWidths(newColsCount);
          return {
            ...tableSec,
            headers: newHeaders,
            rows: newRows,
            colWidths: newColWidths,
          };
        }),
      }));
    },
    [setResumeData]
  );

  const deleteTableColumn = useCallback(
    (sectionId: string, colIndex?: number) => {
      setResumeData((prev) => ({
        ...prev,
        sections: prev.sections.map((sec) => {
          if (sec.id !== sectionId || sec.type !== 'table') return sec;
          const tableSec = sec as TableSectionData;
          const currentCols = tableSec.headers?.length || (tableSec.rows[0] ? tableSec.rows[0].length : 0);
          if (currentCols <= 1) {
            showAlert('This is the last column and cannot be deleted.', 'Cannot Delete Column');
            return sec;
          }
          const targetIndex = colIndex !== undefined ? colIndex : currentCols - 1;
          const newHeaders = tableSec.headers ? tableSec.headers.filter((_, idx) => idx !== targetIndex) : undefined;
          const newRows = tableSec.rows.map((row) => row.filter((_, idx) => idx !== targetIndex));
          let newColWidths: number[] | undefined = undefined;
          if (tableSec.colWidths && tableSec.colWidths.length > 0) {
            const remaining = tableSec.colWidths.filter((_, idx) => idx !== targetIndex);
            newColWidths = normalizeColWidths(remaining);
          }
          return {
            ...tableSec,
            headers: newHeaders,
            rows: newRows,
            colWidths: newColWidths,
          };
        }),
      }));
    },
    [setResumeData, showAlert]
  );

  const toggleTableBorders = useCallback(
    (sectionId: string) => {
      setResumeData((prev) => ({
        ...prev,
        sections: prev.sections.map((sec) => {
          if (sec.id !== sectionId || sec.type !== 'table') return sec;
          const tableSec = sec as TableSectionData;
          return {
            ...tableSec,
            showColBorders: !tableSec.showColBorders,
          };
        }),
      }));
    },
    [setResumeData]
  );

  const updateTableCell = useCallback(
    (
      sectionId: string,
      rowIndex: number,
      colIndex: number,
      value: string,
      isHeader = false
    ) => {
      setResumeDataDebounced((prev) => ({
        ...prev,
        sections: prev.sections.map((sec) => {
          if (sec.id !== sectionId || sec.type !== 'table') return sec;
          const tableSec = sec as TableSectionData;
          if (isHeader && tableSec.headers) {
            const newHeaders = [...tableSec.headers];
            newHeaders[colIndex] = value;
            return { ...tableSec, headers: newHeaders };
          }
          const newRows = tableSec.rows.map((r, rIdx) => {
            if (rIdx !== rowIndex) return r;
            const newRow = [...r];
            newRow[colIndex] = value;
            return newRow;
          });
          return { ...tableSec, rows: newRows };
        }),
      }));
    },
    [setResumeDataDebounced]
  );

  // --- Declaration ---
  const updateDeclaration = useCallback(
    (decl: Partial<DeclarationData>) => {
      setResumeDataDebounced((prev) => ({
        ...prev,
        declaration: { ...prev.declaration, ...decl },
      }));
    },
    [setResumeDataDebounced]
  );

  // --- Storage ---
  const saveToBrowser = useCallback(() => {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(storedResumeData));
      setSaveStatus('saved');
      showToast('Saved to browser');
    } catch {
      setSaveStatus('error');
      showAlert('Could not save because browser storage is full.', 'Save failed');
    }
  }, [storedResumeData, showToast, showAlert]);

  const clearBrowserSave = useCallback(async () => {
    const confirmed = await showConfirm(
      'This will erase your saved resume from the browser. You cannot undo this.',
      'Clear Browser Save?',
      'Clear'
    );
    if (confirmed) {
      try {
        localStorage.removeItem(STORAGE_KEY);
      } catch {
        // ignore
      }
      resetHistory(DEFAULT_RESUME_DATA);
      setSaveStatus('saved');
      showToast('Browser save cleared');
    }
  }, [showConfirm, resetHistory, showToast]);

  const exportResume = useCallback(
    (fileName: string) => {
      const sanitizedName = fileName.trim() || 'my_resume';
      const exportData = {
        ...resumeData,
        meta: {
          ...resumeData.meta,
          zoom: 1,
        },
      };
      const blob = new Blob([JSON.stringify(exportData, null, 2)], {
        type: 'application/json',
      });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `${sanitizedName}.rsbld`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
      setIsExportModalOpen(false);
      showToast(`Exported as ${sanitizedName}.rsbld`);
    },
    [resumeData, showToast]
  );

  const applyAiParsedResume = useCallback(
    (parsedData: ResumeData) => {
      setResumeData(parsedData);
      showToast('Resume updated from PDF');
    },
    [setResumeData, showToast]
  );

  const importResume = useCallback(
    (file: File): Promise<void> => {
      if (file.name.toLowerCase().endsWith('.pdf')) {
        setPdfImportInitialFile(file);
        setIsPdfAiModalOpen(true);
        return Promise.resolve();
      }

      return new Promise((resolve, reject) => {
        const reader = new FileReader();
        reader.onload = (e) => {
          try {
            let content = e.target?.result as string;
            if (content.trim().startsWith('<!DOCTYPE html>')) {
              const match = content.match(/const resumeData = ({.*?});/s);
              if (match) content = match[1];
            }
            const rawData = JSON.parse(content);
            const migrated = parseLegacyResume(rawData);
            resetHistory(migrated);
            showToast('Resume imported successfully!');
            resolve();
          } catch (err) {
            console.error('Import failure', err);
            showAlert('Could not read file. Ensure it is a valid .rsbld or .pdf file.', 'Invalid File');
            reject(err);
          }
        };
        reader.onerror = () => {
          showAlert('Could not read the selected file.', 'Read error');
          reject(new Error('File read error'));
        };
        reader.readAsText(file);
      });
    },
    [resetHistory, showToast, showAlert]
  );

  const findAndReplaceAll = useCallback(
    (searchStr: string, replaceStr: string, matchCase = false): number => {
      if (!searchStr) return 0;
      let count = 0;

      const flags = matchCase ? 'g' : 'gi';
      const escaped = searchStr.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
      const regex = new RegExp(escaped, flags);

      const replaceInPlainUrl = (url: string): string => {
        if (!url) return url;
        const matches = url.match(regex);
        if (!matches) return url;
        count += matches.length;
        return sanitizeLinkUrl(url.replace(regex, () => replaceStr));
      };

      const replaceInString = (html: string): string => {
        if (!html) return html;
        if (typeof DOMParser === 'undefined') {
          const matches = html.match(regex);
          if (!matches) return html;
          count += matches.length;
          return html.replace(regex, () => replaceStr);
        }

        const parser = new DOMParser();
        const doc = parser.parseFromString(`<div>${html}</div>`, 'text/html');
        const root = doc.body.firstElementChild;
        if (!root) return html;

        let localReplaced = 0;
        const walkTextNodes = (node: Node) => {
          if (node.nodeType === Node.TEXT_NODE) {
            const text = node.textContent || '';
            const matches = text.match(regex);
            if (matches) {
              localReplaced += matches.length;
              node.textContent = text.replace(regex, () => replaceStr);
            }
            return;
          }
          node.childNodes.forEach(walkTextNodes);
        };

        walkTextNodes(root);
        if (localReplaced === 0) return html;
        count += localReplaced;
        return sanitizeRichTextHtml(root.innerHTML);
      };

      setResumeData((prev) => {
        // 1. Header
        const updatedHeader = {
          ...prev.header,
          fullName: replaceInString(prev.header.fullName),
          degreeTitle: replaceInString(prev.header.degreeTitle),
          universityCompany: replaceInString(prev.header.universityCompany),
          email: replaceInString(prev.header.email),
          phone: replaceInString(prev.header.phone),
          location: prev.header.location ? replaceInString(prev.header.location) : prev.header.location,
          links: prev.header.links.map((link) => ({
            ...link,
            text: replaceInString(link.text),
            url: replaceInPlainUrl(link.url),
          })),
        };

        // 2. Sections
        const updatedSections = prev.sections.map((sec) => {
          const title = replaceInString(sec.title);
          if (sec.type === 'text') {
            const textSec = sec as TextSectionData;
            return {
              ...textSec,
              title,
              content: replaceInString(textSec.content),
            };
          } else if (sec.type === 'list') {
            const listSec = sec as ListSectionData;
            return {
              ...listSec,
              title,
              items: listSec.items.map(replaceInString),
            };
          } else if (sec.type === 'table') {
            const tableSec = sec as TableSectionData;
            return {
              ...tableSec,
              title,
              headers: tableSec.headers ? tableSec.headers.map(replaceInString) : undefined,
              rows: tableSec.rows.map((row) => row.map(replaceInString)),
            };
          }
          return { ...sec, title };
        });

        // 3. Declaration
        const updatedDeclaration = {
          ...prev.declaration,
          text: replaceInString(prev.declaration.text),
          date: replaceInString(prev.declaration.date),
          place: replaceInString(prev.declaration.place),
        };

        return {
          ...prev,
          header: updatedHeader,
          sections: updatedSections,
          declaration: updatedDeclaration,
        };
      });

      return count;
    },
    [setResumeData]
  );

  const value = useMemo<ResumeContextType>(
    () => ({
      resumeData,
      canUndo,
      canRedo,
      undo,
      redo,
      updateMeta,
      setTheme,
      setFont,
      setTableStyle,
      setMarker,
      setZoom,
      setResponsiveZoom,
      setPhoto,
      updateHeader,
      addLink,
      updateLink,
      removeLink,
      addSection,
      updateSection,
      updateListItem,
      removeSection,
      duplicateSection,
      reorderSections,
      addTableRow,
      deleteTableRow,
      addTableColumn,
      deleteTableColumn,
      toggleTableBorders,
      updateTableCell,
      updateDeclaration,
      saveToBrowser,
      clearBrowserSave,
      exportResume,
      importResume,
      isDarkMode,
      toggleDarkMode,
      saveStatus,
      isLinkModalOpen,
      setIsLinkModalOpen,
      editingLink,
      setEditingLink,
      isExportModalOpen,
      setIsExportModalOpen,
      isFindReplaceModalOpen,
      setIsFindReplaceModalOpen,
      findAndReplaceAll,
      isSignatureModalOpen,
      setIsSignatureModalOpen,
      isPdfAiModalOpen,
      setIsPdfAiModalOpen,
      pdfImportInitialFile,
      setPdfImportInitialFile,
      applyAiParsedResume,
      isCropModalOpen,
      setIsCropModalOpen,
      cropImageSrc,
      setCropImageSrc,
      openCropModal,
      confirmDialog,
      showConfirm,
      closeConfirm,
      alertDialog,
      showAlert,
      closeAlert,
      toast,
      showToast,
    }),
    [
      resumeData,
      canUndo,
      canRedo,
      undo,
      redo,
      updateMeta,
      setTheme,
      setFont,
      setTableStyle,
      setMarker,
      setZoom,
      setPhoto,
      updateHeader,
      addLink,
      updateLink,
      removeLink,
      addSection,
      updateSection,
      updateListItem,
      removeSection,
      duplicateSection,
      reorderSections,
      addTableRow,
      deleteTableRow,
      addTableColumn,
      deleteTableColumn,
      toggleTableBorders,
      updateTableCell,
      updateDeclaration,
      saveToBrowser,
      clearBrowserSave,
      exportResume,
      importResume,
      isDarkMode,
      toggleDarkMode,
      saveStatus,
      isLinkModalOpen,
      editingLink,
      isExportModalOpen,
      isFindReplaceModalOpen,
      findAndReplaceAll,
      isSignatureModalOpen,
      isPdfAiModalOpen,
      pdfImportInitialFile,
      applyAiParsedResume,
      isCropModalOpen,
      cropImageSrc,
      openCropModal,
      confirmDialog,
      showConfirm,
      closeConfirm,
      alertDialog,
      showAlert,
      closeAlert,
      toast,
      showToast,
    ]
  );

  return <ResumeContext.Provider value={value}>{children}</ResumeContext.Provider>;
};

export function useResume(): ResumeContextType {
  const context = useContext(ResumeContext);
  if (!context) {
    throw new Error('useResume must be used within a ResumeProvider');
  }
  return context;
}
