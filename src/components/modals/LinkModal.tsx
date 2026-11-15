import React, { useState, useEffect } from 'react';
import { useResume } from '../../context/ResumeContext';
import { LinkIconType } from '../../types/resume';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '../ui/dialog';
import { Button } from '../ui/button';
import { Globe, Mail, Link as LinkIcon } from 'lucide-react';

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
        return <LinkIcon className="w-4 h-4" />;
      case 'globe':
        return <Globe className="w-4 h-4" />;
      case 'email':
        return <Mail className="w-4 h-4" />;
      case 'github':
        return (
          <svg className="w-4 h-4 fill-current" viewBox="0 0 24 24">
            <path d="M12 0C5.374 0 0 5.373 0 12c0 5.302 3.438 9.8 8.207 11.387.599.111.793-.261.793-.577v-2.234c-3.338.726-4.033-1.416-4.033-1.416-.546-1.387-1.333-1.756-1.333-1.756-1.089-.745.083-.729.083-.729 1.205.084 1.839 1.237 1.839 1.237 1.07 1.834 2.807 1.304 3.492.997.107-.775.418-1.305.762-1.604-2.665-.305-5.467-1.334-5.467-5.931 0-1.311.469-2.381 1.236-3.221-.124-.303-.535-1.524.117-3.176 0 0 1.008-.322 3.301 1.23A11.509 11.509 0 0 1 12 5.803c1.02.005 2.047.138 3.006.404 2.291-1.552 3.297-1.23 3.297-1.23.653 1.653.242 2.874.118 3.176.77.84 1.235 1.911 1.235 3.221 0 4.609-2.807 5.624-5.479 5.921.43.372.823 1.102.823 2.222v3.293c0 .319.192.694.801.576C20.566 21.797 24 17.3 24 12c0-6.627-5.373-12-12-12z" />
          </svg>
        );
      case 'linkedin':
        return (
          <svg className="w-4 h-4 fill-current" viewBox="0 0 24 24">
            <path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433a2.062 2.062 0 0 1-2.063-2.065 2.064 2.064 0 1 1 2.063 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z" />
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
            <path d="M7 2h10a5 5 0 0 1 5 5v10a5 5 0 0 1-5 5H7a5 5 0 0 1-5-5V7a5 5 0 0 1 5-5zm10 2H7a3 3 0 0 0-3 3v10a3 3 0 0 0 3 3h10a3 3 0 0 0 3-3V7a3 3 0 0 0-3-3zm-5 3.5a5.5 5.5 0 1 1 0 11 5.5 5.5 0 0 1 0-11zm0 2a3.5 3.5 0 1 0 0 7 3.5 3.5 0 0 0 0-7zm5.75-2.75a1 1 0 1 1-2 0 1 1 0 0 1 2 0z" />
          </svg>
        );
      case 'youtube':
        return (
          <svg className="w-4 h-4 fill-current" viewBox="0 0 24 24">
            <path d="M23 7.5a3.5 3.5 0 0 0-2.46-2.48C18.4 4.5 12 4.5 12 4.5s-6.4 0-8.54.52A3.5 3.5 0 0 0 1 7.5 36.1 36.1 0 0 0 .5 12c0 1.5.2 3 .5 4.5a3.5 3.5 0 0 0 2.46 2.48C5.6 19.5 12 19.5 12 19.5s6.4 0 8.54-.52A3.5 3.5 0 0 0 23 16.5c.3-1.5.5-3 .5-4.5s-.2-3-.5-4.5zM10 15V9l5 3-5 3z" />
          </svg>
        );
      case 'facebook':
        return (
          <svg className="w-4 h-4 fill-current" viewBox="0 0 24 24">
            <path d="M22 12a10 10 0 1 0-11.6 9.9v-7h-2.4V12h2.4V9.7c0-2.4 1.4-3.7 3.6-3.7 1 0 2 .1 2 .1v2.2h-1.1c-1.1 0-1.4.7-1.4 1.4V12h2.5l-.4 2.9h-2.1v7A10 10 0 0 0 22 12z" />
          </svg>
        );
      default:
        return <Globe className="w-4 h-4" />;
    }
  };

  return (
    <Dialog open={isLinkModalOpen} onOpenChange={setIsLinkModalOpen}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>{editingLink ? 'Edit Link' : 'Add New Link'}</DialogTitle>
        </DialogHeader>

        <div className="space-y-4 py-2">
          <div>
            <label className="text-xs font-semibold text-muted-foreground uppercase tracking-wider block mb-2">
              Icon Style
            </label>
            <div className="grid grid-cols-3 gap-2">
              {ICON_OPTIONS.map((opt) => (
                <button
                  key={opt.key}
                  type="button"
                  onClick={() => setIcon(opt.key)}
                  className={`flex items-center gap-2 p-2 rounded-md border text-xs font-medium cursor-pointer transition-colors ${
                    icon === opt.key
                      ? 'border-primary bg-primary/10 text-primary'
                      : 'border-border bg-background hover:bg-muted text-foreground'
                  }`}
                >
                  {renderIconBadge(opt.key)}
                  <span className="truncate">{opt.label}</span>
                </button>
              ))}
            </div>
          </div>

          <div>
            <label className="text-xs font-semibold text-muted-foreground uppercase tracking-wider block mb-1">
              Display Text
            </label>
            <input
              type="text"
              value={text}
              onChange={(e) => setText(e.target.value)}
              placeholder="e.g. GitHub"
              className="w-full px-3 py-2 rounded-md border border-input bg-background text-sm focus:outline-none focus:border-primary"
            />
          </div>

          <div>
            <label className="text-xs font-semibold text-muted-foreground uppercase tracking-wider block mb-1">
              URL
            </label>
            <input
              type="text"
              value={url}
              onChange={(e) => setUrl(e.target.value)}
              placeholder="https://..."
              className="w-full px-3 py-2 rounded-md border border-input bg-background text-sm focus:outline-none focus:border-primary"
            />
          </div>
        </div>

        <DialogFooter className="flex items-center justify-between sm:justify-between w-full">
          {editingLink ? (
            <Button variant="destructive" size="sm" onClick={handleDelete}>
              Delete
            </Button>
          ) : (
            <div />
          )}
          <div className="flex gap-2">
            <Button variant="outline" size="sm" onClick={() => setIsLinkModalOpen(false)}>
              Cancel
            </Button>
            <Button size="sm" onClick={handleSave}>
              Save
            </Button>
          </div>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};
