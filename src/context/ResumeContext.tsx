import React, { createContext, useContext, useEffect, useState, useCallback, useRef } from 'react';
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
import { useHistory } from '../hooks/useHistory';
import { parseLegacyResume } from '../utils/legacyMigration';

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
  setZoom: (zoom: number) => void;
  setPhoto: (photoBase64: string | null) => void;

  // Header actions
  updateHeader: (header: Partial<HeaderData>) => void;
  addLink: (link: Omit<HeaderLink, 'id'>) => void;
  updateLink: (id: string, link: Partial<HeaderLink>) => void;
  removeLink: (id: string) => void;

  // Section actions
  addSection: (type: SectionType) => void;
  updateSection: (id: string, updated: Partial<SectionData>) => void;
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
  isMobileSidebarOpen: boolean;
  setIsMobileSidebarOpen: (open: boolean) => void;

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

export const ResumeProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  // Load saved state or default
  const getInitialState = (): ResumeData => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY);
      if (saved) {
        return parseLegacyResume(JSON.parse(saved));
      }
    } catch (e) {
      console.warn('Failed to load initial resume data from localStorage', e);
    }
    return DEFAULT_RESUME_DATA;
  };

  const {
    state: resumeData,
    set: setResumeData,
    setDebounced: setResumeDataDebounced,
    undo,
    redo,
    canUndo,
    canRedo,
    resetHistory,
  } = useHistory<ResumeData>(getInitialState());

  // Dark mode state
  const [isDarkMode, setIsDarkMode] = useState<boolean>(() => {
    try {
      return localStorage.getItem(DARK_MODE_KEY) === 'true';
    } catch {
      return false;
    }
  });

  const [isMobileSidebarOpen, setIsMobileSidebarOpen] = useState(false);
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
  const [toast, setToast] = useState<ToastState>({ show: false, message: '' });
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
    setToast({ show: true, message });
    setTimeout(() => {
      setToast({ show: false, message: '' });
    }, 2200);
  }, []);

  const showAlert = useCallback((message: string, title = 'Notice') => {
    setAlertDialog({ isOpen: true, title, message });
  }, []);

  const closeAlert = useCallback(() => {
    setAlertDialog({ isOpen: false, title: '', message: '' });
  }, []);

  const showConfirm = useCallback(
    (message: string, title = 'Are you sure?', confirmLabel = 'Delete'): Promise<boolean> => {
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
  useEffect(() => {
    const timer = setTimeout(() => {
      try {
        localStorage.setItem(STORAGE_KEY, JSON.stringify(resumeData));
      } catch (e) {
        console.warn('Auto-save error', e);
      }
    }, 1500);
    return () => clearTimeout(timer);
  }, [resumeData]);

  // Check for URL hash import (#import=<base64>)
  useEffect(() => {
    const hash = window.location.hash;
    if (hash && hash.startsWith('#import=')) {
      try {
        const b64 = hash.substring(8);
        const json = atob(b64);
        const data = parseLegacyResume(JSON.parse(json));
        resetHistory(data);
        window.location.hash = '';
        showToast('Resume imported from URL');
      } catch (e) {
        console.error('URL import failed', e);
      }
    }
  }, [resetHistory, showToast]);

  // Keyboard shortcuts (Ctrl+Z, Ctrl+Y, Ctrl+F, Ctrl+H, Esc)
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        setIsMobileSidebarOpen(false);
        setIsLinkModalOpen(false);
        setIsExportModalOpen(false);
        setIsFindReplaceModalOpen(false);
        setIsSignatureModalOpen(false);
        closeAlert();
        closeConfirm();
      }

      if ((e.ctrlKey || e.metaKey) && (e.key === 'f' || e.key === 'h')) {
        e.preventDefault();
        setIsFindReplaceModalOpen(true);
        return;
      }

      const target = e.target as HTMLElement;
      if (target.tagName === 'INPUT' || target.tagName === 'TEXTAREA' || target.tagName === 'SELECT') {
        return;
      }

      if ((e.ctrlKey || e.metaKey) && e.key === 'z' && !e.shiftKey) {
        e.preventDefault();
        undo();
        showToast('Undone');
      }
      if ((e.ctrlKey || e.metaKey) && (e.key === 'y' || (e.shiftKey && e.key === 'z'))) {
        e.preventDefault();
        redo();
        showToast('Redone');
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [undo, redo, showToast, closeAlert, closeConfirm]);

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
  const setZoom = useCallback((zoom: number) => updateMeta({ zoom }), [updateMeta]);
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
      const link: HeaderLink = { ...newLink, id: `link-${Date.now()}` };
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
      setResumeData((prev) => ({
        ...prev,
        header: {
          ...prev.header,
          links: prev.header.links.map((l) => (l.id === id ? { ...l, ...linkUpdate } : l)),
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
      const id = `sec-${Date.now()}`;
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
        clone.id = `sec-${Date.now()}`;

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
          const newColWidths = Array(newColsCount).fill(Math.round((100 / newColsCount) * 10) / 10);
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
            const total = remaining.reduce((a, b) => a + b, 0) || 1;
            newColWidths = remaining.map((w) => Math.round(((w / total) * 100) * 10) / 10);
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
      localStorage.setItem(STORAGE_KEY, JSON.stringify(resumeData));
      showToast('Saved to browser!');
    } catch {
      showAlert('Could not save — browser storage may be full.', 'Save Failed');
    }
  }, [resumeData, showToast, showAlert]);

  const clearBrowserSave = useCallback(async () => {
    const confirmed = await showConfirm(
      'This will erase your saved resume from the browser. You cannot undo this.',
      'Clear Browser Save?',
      'Clear'
    );
    if (confirmed) {
      localStorage.removeItem(STORAGE_KEY);
      resetHistory(DEFAULT_RESUME_DATA);
      showToast('Browser save cleared');
    }
  }, [showConfirm, resetHistory, showToast]);

  const exportResume = useCallback(
    (fileName: string) => {
      const sanitizedName = fileName.trim() || 'my_resume';
      const blob = new Blob([JSON.stringify(resumeData, null, 2)], {
        type: 'application/json',
      });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `${sanitizedName}.resumeBuilder`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
      setIsExportModalOpen(false);
      showToast(`Exported as ${sanitizedName}.resumeBuilder`);
    },
    [resumeData, showToast]
  );

  const applyAiParsedResume = useCallback(
    (parsedData: ResumeData) => {
      setResumeData(parsedData);
      showToast('Resume updated from PDF using AI!');
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
            showAlert('Could not read file. Ensure it is a valid .resumeBuilder or .pdf file.', 'Invalid File');
            reject(err);
          }
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

      const replaceInString = (str: string): string => {
        if (!str) return str;
        const flags = matchCase ? 'g' : 'gi';
        const escaped = searchStr.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
        const regex = new RegExp(escaped, flags);
        const matches = str.match(regex);
        if (matches) {
          count += matches.length;
        }
        return str.replace(regex, replaceStr);
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
            url: replaceInString(link.url),
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

  const value = {
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
    isMobileSidebarOpen,
    setIsMobileSidebarOpen,
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
  };

  return <ResumeContext.Provider value={value}>{children}</ResumeContext.Provider>;
};

export function useResume(): ResumeContextType {
  const context = useContext(ResumeContext);
  if (!context) {
    throw new Error('useResume must be used within a ResumeProvider');
  }
  return context;
}
