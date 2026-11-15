import React, { useState, useEffect } from 'react';
import { useResume } from '../../context/ResumeContext';
import { LinkIconType } from '../../types/resume';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '../ui/dialog';
import { Button } from '../ui/button';
import { Link as LinkIcon, Trash2 } from 'lucide-react';

interface IconOption {
  key: LinkIconType;
  label: string;
}

const ICON_OPTIONS: IconOption[] = [
  { key: 'none', label: 'None' },
  { key: 'github', label: 'GitHub' },
  { key: 'linkedin', label: 'LinkedIn' },
  { key: 'globe', label: 'Website' },
  { key: 'twitter', label: 'X/Twitter' },
  { key: 'instagram', label: 'Instagram' },
  { key: 'youtube', label: 'YouTube' },
  { key: 'facebook', label: 'Facebook' },
  { key: 'email', label: 'Email' },
];

export const LinkModal: React.FC = () => {
  const {
    isLinkModalOpen,
    setIsLinkModalOpen,
    editingLink,
    setEditingLink,
    addLink,
    updateLink,
    removeLink,
    showAlert,
  } = useResume();

  const [text, setText] = useState('');
  const [url, setUrl] = useState('');
  const [icon, setIcon] = useState<LinkIconType>('globe');

  useEffect(() => {
    if (editingLink) {
      setText(editingLink.text);
      setUrl(editingLink.url);
      setIcon(editingLink.icon || 'globe');
    } else {
      setText('');
      setUrl('');
      setIcon('globe');
    }
  }, [editingLink, isLinkModalOpen]);

  const handleSave = () => {
    if (!text.trim() || !url.trim()) {
      showAlert('Please fill in both the display text and the URL.', 'Missing Fields');
      return;
    }

    if (editingLink) {
      updateLink(editingLink.id, { text: text.trim(), url: url.trim(), icon });
    } else {
      addLink({ text: text.trim(), url: url.trim(), icon });
    }
    setIsLinkModalOpen(false);
    setEditingLink(null);
  };

  const handleDelete = () => {
    if (editingLink) {
      setIsLinkModalOpen(false);
      removeLink(editingLink.id);
      setEditingLink(null);
    }
  };

  const renderIconBadge = (key: LinkIconType) => {
    switch (key) {
      case 'none':
        return (
          <svg className="w-4 h-4 fill-current opacity-40" viewBox="0 0 24 24">
            <path
              fillRule="evenodd"
              clipRule="evenodd"
              d="M19.902 4.098a3.75 3.75 0 0 0-5.304 0l-4.5 4.5a3.75 3.75 0 0 0 1.035 6.037.75.75 0 0 1-.646 1.353 5.25 5.25 0 0 1-1.449-8.45l4.5-4.5a5.25 5.25 0 1 1 7.424 7.424l-1.757 1.757a.75.75 0 1 1-1.06-1.06l1.757-1.757a3.75 3.75 0 0 0 0-5.304Zm-7.389 4.267a.75.75 0 0 1 1-.35 5.25 5.25 0 0 1 1.449 8.45l-4.5 4.5a5.25 5.25 0 1 1-7.424-7.424l1.757-1.757a.75.75 0 1 1 1.06 1.06l-1.757 1.757a3.75 3.75 0 1 0 5.304 5.304l4.5-4.5a3.75 3.75 0 0 0-1.035-6.037.75.75 0 0 1-.354-1Z"
            />
          </svg>
        );
      case 'globe':
        return (
          <svg className="w-4 h-4 fill-current" viewBox="0 0 24 24">
            <path d="M12 2a10 10 0 1 0 10 10A10.011 10.011 0 0 0 12 2zm6.92 6h-2.95a15.65 15.65 0 0 0-1.38-3.56A8.03 8.03 0 0 1 18.92 8zM12 4.04a13.62 13.62 0 0 1 1.84 3.96h-3.68A13.62 13.62 0 0 1 12 4.04zM4.26 14a7.82 7.82 0 0 1 0-4h3.38a16.74 16.74 0 0 0-.14 2c0 .68.05 1.35.14 2zm.82 2h2.95a15.65 15.65 0 0 0 1.38 3.56A8.03 8.03 0 0 1 5.08 16zm2.95-8H5.08a8.03 8.03 0 0 1 4.33-3.56A15.65 15.65 0 0 0 8.03 8zm3.97 11.96a13.62 13.62 0 0 1-1.84-3.96h3.68a13.62 13.62 0 0 1-1.84 3.96zM10.16 14a14.77 14.77 0 0 1-.16-2c0-.68.05-1.35.16-2h3.68c.11.65.16 1.32.16 2 0 .68-.05 1.35-.16 2zm4.43 5.56a15.65 15.65 0 0 0 1.38-3.56h2.95a8.03 8.03 0 0 1-4.33 3.56zM16.36 14c.09-.65.14-1.32.14-2 0-.68-.05-1.32-.14-2h3.38a7.82 7.82 0 0 1 0 4z" />
          </svg>
        );
      case 'email':
        return (
          <svg className="w-4 h-4 fill-current" viewBox="0 0 24 24">
            <path d="M1.5 8.67v8.58a3 3 0 0 0 3 3h15a3 3 0 0 0 3-3V8.67l-8.928 5.493a3 3 0 0 1-3.144 0L1.5 8.67z" />
            <path d="M22.5 6.908V6.75a3 3 0 0 0-3-3h-15a3 3 0 0 0-3 3v.158l9.714 5.978a1.5 1.5 0 0 0 1.572 0L22.5 6.908z" />
          </svg>
        );
      case 'github':
        return (
          <svg className="w-4 h-4 fill-current" viewBox="0 0 24 24">
            <path
              fillRule="evenodd"
              clipRule="evenodd"
              d="M12 2C6.477 2 2 6.484 2 12.017c0 4.425 2.865 8.18 6.839 9.504.5.092.682-.217.682-.483 0-.237-.008-.868-.013-1.703-2.782.605-3.369-1.343-3.369-1.343-.454-1.158-1.11-1.466-1.11-1.466-.908-.62.069-.608.069-.608 1.003.07 1.53 1.032 1.53 1.032.892 1.53 2.341 1.088 2.91.832.092-.647.35-1.088.636-1.338-2.22-.253-4.555-1.113-4.555-4.951 0-1.093.39-1.988 1.029-2.688-.103-.253-.446-1.272.098-2.65 0 0 .84-.27 2.75 1.026A9.564 9.564 0 0112 6.844c.85.004 1.705.115 2.504.337 1.909-1.296 2.747-1.027 2.747-1.027.546 1.379.202 2.398.1 2.651.64.7 1.028 1.595 1.028 2.688 0 3.848-2.339 4.695-4.566 4.943.359.309.678.92.678 1.855 0 1.338-.012 2.419-.012 2.747 0 .268.18.58.688.482A10.019 10.019 0 0022 12.017C22 6.484 17.522 2 12 2z"
            />
          </svg>
        );
      case 'linkedin':
        return (
          <svg className="w-4 h-4 fill-current" viewBox="0 0 24 24">
            <path d="M19 3a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h14m-.5 15.5v-5.3a3.26 3.26 0 0 0-3.26-3.26c-.85 0-1.84.52-2.28 1.3v-1.11h-2.79v8.37h2.79v-4.93c0-.77.62-1.4 1.39-1.4a1.4 1.4 0 0 1 1.4 1.4v4.93h2.75M6.88 8.56a1.68 1.68 0 0 0 1.68-1.68c0-.93-.75-1.69-1.68-1.69a1.69 1.69 0 0 0-1.69 1.69c0 .93.76 1.68 1.69 1.68m1.39 9.94v-8.37H5.5v8.37h2.77z" />
          </svg>
        );
      case 'twitter':
        return (
          <svg className="w-4 h-4 fill-current" viewBox="0 0 24 24">
            <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-4.714-6.231-5.401 6.231H2.748l7.73-8.835L1.254 2.25H8.08l4.264 5.633 5.9-5.633zm-1.161 17.52h1.833L7.084 4.126H5.117z" />
          </svg>
        );
      case 'instagram':
        return (
          <svg className="w-4 h-4 fill-current" viewBox="0 0 24 24">
            <path
              fillRule="evenodd"
              clipRule="evenodd"
              d="M12 2C8.74 2 8.33 2.01 7.05 2.07c-4.36.2-6.78 2.62-6.98 6.98C0.01 10.33 0 10.74 0 14c0 3.26.01 3.67.07 4.95.2 4.36 2.62 6.78 6.98 6.98 1.28.06 1.69.07 4.95.07s3.67-.01 4.95-.07c4.35-.2 6.78-2.62 6.98-6.98.06-1.28.07-1.69.07-4.95s-.01-3.67-.07-4.95c-.2-4.35-2.62-6.78-6.98-6.98C15.67 2.01 15.26 2 12 2zm0 2.16c3.2 0 3.58.01 4.85.07 3.25.15 4.77 1.69 4.92 4.92.06 1.27.07 1.64.07 4.85s-.01 3.58-.07 4.85c-.15 3.23-1.66 4.77-4.92 4.92-1.27.06-1.64.07-4.85.07s-3.58-.01-4.85-.07c-3.26-.15-4.77-1.7-4.92-4.92-.06-1.27-.07-1.64-.07-4.85s.01-3.58.07-4.85c.15-3.23 1.66-4.77 4.92-4.92 1.27-.06 1.65-.07 4.85-.07zm0 3.68a6.16 6.16 0 1 0 0 12.32 6.16 6.16 0 0 0 0-12.32zm0 10.16a4 4 0 1 1 0-8 4 4 0 0 1 0 8zm6.41-11.85a1.44 1.44 0 1 1-2.88 0 1.44 1.44 0 0 1 2.88 0z"
            />
          </svg>
        );
      case 'youtube':
        return (
          <svg className="w-4 h-4 fill-current" viewBox="0 0 24 24">
            <path d="M23.498 6.186a3.016 3.016 0 0 0-2.122-2.136C19.505 3.545 12 3.545 12 3.545s-7.505 0-9.377.505A3.017 3.017 0 0 0 .502 6.186C0 8.07 0 12 0 12s0 3.93.502 5.814a3.016 3.016 0 0 0 2.122 2.136c1.871.505 9.376.505 9.376.505s7.505 0 9.377-.505a3.015 3.015 0 0 0 2.122-2.136C24 15.93 24 12 24 12s0-3.93-.502-5.814zM9.545 15.568V8.432L15.818 12l-6.273 3.568z" />
          </svg>
        );
      case 'facebook':
        return (
          <svg className="w-4 h-4 fill-current" viewBox="0 0 24 24">
            <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z" />
          </svg>
        );
      default:
        return (
          <svg className="w-4 h-4 fill-current" viewBox="0 0 24 24">
            <path d="M12 2a10 10 0 1 0 10 10A10.011 10.011 0 0 0 12 2zm6.92 6h-2.95a15.65 15.65 0 0 0-1.38-3.56A8.03 8.03 0 0 1 18.92 8zM12 4.04a13.62 13.62 0 0 1 1.84 3.96h-3.68A13.62 13.62 0 0 1 12 4.04zM4.26 14a7.82 7.82 0 0 1 0-4h3.38a16.74 16.74 0 0 0-.14 2c0 .68.05 1.35.14 2zm.82 2h2.95a15.65 15.65 0 0 0 1.38 3.56A8.03 8.03 0 0 1 5.08 16zm2.95-8H5.08a8.03 8.03 0 0 1 4.33-3.56A15.65 15.65 0 0 0 8.03 8zm3.97 11.96a13.62 13.62 0 0 1-1.84-3.96h3.68a13.62 13.62 0 0 1-1.84 3.96zM10.16 14a14.77 14.77 0 0 1-.16-2c0-.68.05-1.35.16-2h3.68c.11.65.16 1.32.16 2 0 .68-.05 1.35-.16 2zm4.43 5.56a15.65 15.65 0 0 0 1.38-3.56h2.95a8.03 8.03 0 0 1-4.33 3.56zM16.36 14c.09-.65.14-1.32.14-2 0-.68-.05-1.32-.14-2h3.38a7.82 7.82 0 0 1 0 4z" />
          </svg>
        );
    }
  };

  return (
    <Dialog open={isLinkModalOpen} onOpenChange={setIsLinkModalOpen}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <div className="flex items-center gap-2">
            <LinkIcon className="w-5 h-5 text-primary shrink-0" />
            <DialogTitle>{editingLink ? 'Edit Link' : 'Add New Link'}</DialogTitle>
          </div>
        </DialogHeader>

        <div className="space-y-4 py-1">
          <div>
            <label className="text-[11px] font-semibold text-[var(--ui-text-dim)] uppercase tracking-wider block mb-2">
              Icon
            </label>
            <div className="grid grid-cols-3 gap-2">
              {ICON_OPTIONS.map((opt) => (
                <button
                  key={opt.key}
                  type="button"
                  onClick={() => setIcon(opt.key)}
                  className={`flex items-center gap-2 px-2.5 py-2 rounded-lg border text-xs font-medium cursor-pointer transition-colors ${icon === opt.key
                      ? 'border-primary bg-primary/10 text-primary font-semibold shadow-xs'
                      : 'border-[var(--ui-border)] bg-[var(--ui-surface2)] hover:bg-[var(--ui-border)] text-[var(--ui-text)]'
                    }`}
                >
                  {renderIconBadge(opt.key)}
                  <span className="truncate">{opt.label}</span>
                </button>
              ))}
            </div>
          </div>

          <div>
            <label className="text-[11px] font-semibold text-[var(--ui-text-dim)] uppercase tracking-wider block mb-1">
              Display Text
            </label>
            <input
              type="text"
              value={text}
              onChange={(e) => setText(e.target.value)}
              placeholder="e.g. GitHub"
              className="w-full px-3 py-2 rounded-md border border-[var(--ui-border)] bg-[var(--ui-surface2)] text-[var(--ui-text)] text-sm focus:outline-none focus:border-primary transition-colors"
            />
          </div>

          <div>
            <label className="text-[11px] font-semibold text-[var(--ui-text-dim)] uppercase tracking-wider block mb-1">
              URL
            </label>
            <input
              type="text"
              value={url}
              onChange={(e) => setUrl(e.target.value)}
              placeholder="https://..."
              className="w-full px-3 py-2 rounded-md border border-[var(--ui-border)] bg-[var(--ui-surface2)] text-[var(--ui-text)] text-sm focus:outline-none focus:border-primary transition-colors"
            />
          </div>
        </div>

        <DialogFooter className="flex items-center justify-between sm:justify-between w-full">
          {editingLink ? (
            <Button
              variant="destructive"
              size="sm"
              onClick={handleDelete}
              className="gap-1.5"
            >
              <Trash2 className="w-3.5 h-3.5" />
              <span>Delete</span>
            </Button>
          ) : (
            <div />
          )}
          <div className="flex gap-2">
            <Button variant="outline" size="sm" onClick={() => setIsLinkModalOpen(false)}>
              Cancel
            </Button>
            <Button size="sm" onClick={handleSave}>
              Save Link
            </Button>
          </div>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};
