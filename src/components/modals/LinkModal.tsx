import React, { useState, useEffect } from 'react';
import { useResume } from '../../context/ResumeContext';
import { LinkIconType } from '../../types/resume';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '../ui/dialog';
import { Button } from '../ui/button';
import { Globe, Mail, Link as LinkIcon, Trash2 } from 'lucide-react';

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
        return <LinkIcon className="w-4 h-4 opacity-40" />;
      case 'globe':
        return <Globe className="w-4 h-4" />;
      case 'email':
        return <Mail className="w-4 h-4" />;
      case 'github':
        return (
          <svg
            className="w-4 h-4"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
          >
            <path d="M15 22v-4a4.8 4.8 0 0 0-1-3.5c3 0 6-2 6-5.5.08-1.25-.27-2.48-1-3.5.28-1.15.28-2.35 0-3.5 0 0-1 0-3 1.5-2.64-.5-5.36-.5-8 0C6 2 5 2 5 2c-.3 1.15-.3 2.35 0 3.5A5.403 5.403 0 0 0 4 9c0 3.5 3 5.5 6 5.5-.39.49-.68 1.05-.85 1.65-.17.6-.22 1.23-.15 1.85v4" />
            <path d="M9 18c-4.51 2-5-2-7-2" />
          </svg>
        );
      case 'linkedin':
        return (
          <svg
            className="w-4 h-4"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
          >
            <path d="M16 8a6 6 0 0 1 6 6v7h-4v-7a2 2 0 0 0-2-2 2 2 0 0 0-2 2v7h-4v-7a6 6 0 0 1 6-6z" />
            <rect width="4" height="12" x="2" y="9" />
            <circle cx="4" cy="4" r="2" />
          </svg>
        );
      case 'twitter':
        return (
          <svg
            className="w-4 h-4"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
          >
            <path d="M22 4s-.7 2.1-2 3.4c1.6 10-9.4 17.3-18 11.6 2.2.1 4.4-.6 6-2C3 15.5.5 9.6 3 5c2.2 2.6 5.6 4.1 9 4-.9-4.2 4-6.6 7-3.8 1.1 0 3-1.2 3-1.2z" />
          </svg>
        );
      case 'instagram':
        return (
          <svg
            className="w-4 h-4"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
          >
            <rect width="20" height="20" x="2" y="2" rx="5" ry="5" />
            <path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z" />
            <line x1="17.5" x2="17.51" y1="6.5" y2="6.5" />
          </svg>
        );
      case 'youtube':
        return (
          <svg
            className="w-4 h-4"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
          >
            <path d="M2.5 17a24.12 24.12 0 0 1 0-10 2 2 0 0 1 1.4-1.4 49.56 49.56 0 0 1 16.2 0A2 2 0 0 1 21.5 7a24.12 24.12 0 0 1 0 10 2 2 0 0 1-1.4 1.4 49.55 49.55 0 0 1-16.2 0A2 2 0 0 1 2.5 17" />
            <polygon points="10 15 15 12 10 9 10 15" />
          </svg>
        );
      case 'facebook':
        return (
          <svg
            className="w-4 h-4"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
          >
            <path d="M18 2h-3a5 5 0 0 0-5 5v3H7v4h3v8h4v-8h3l1-4h-4V7a1 1 0 0 1 1-1h3z" />
          </svg>
        );
      default:
        return <Globe className="w-4 h-4" />;
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
