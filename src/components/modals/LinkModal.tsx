import React, { useState, useEffect } from 'react';
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
  tokens,
} from '@fluentui/react-components';
import { LinkRegular, DeleteRegular, DismissRegular } from '@fluentui/react-icons';
import { useResume } from '../../context/ResumeContext';
import { LinkIconType } from '../../types/resume';
import { LinkIcon } from '../resume/LinkIcon';
import { sanitizeLinkUrl } from '../../utils/sanitize';

interface IconOption {
  key: LinkIconType;
  label: string;
}

const ICON_OPTIONS: IconOption[] = [
  { key: 'none', label: 'None' },
  { key: 'github', label: 'GitHub' },
  { key: 'linkedin', label: 'LinkedIn' },
  { key: 'globe', label: 'Website' },
  { key: 'twitter', label: 'X / Twitter' },
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
      showAlert('Enter both a display label and a URL.', 'Missing fields');
      return;
    }

    const safeUrl = sanitizeLinkUrl(url);
    if (editingLink) {
      updateLink(editingLink.id, { text: text.trim(), url: safeUrl, icon });
    } else {
      addLink({ text: text.trim(), url: safeUrl, icon });
    }
    setIsLinkModalOpen(false);
    setEditingLink(null);
  };

  const handleClose = () => {
    setIsLinkModalOpen(false);
    setEditingLink(null);
  };

  const handleDelete = () => {
    if (editingLink) {
      const targetId = editingLink.id;
      handleClose();
      removeLink(targetId);
    }
  };

  return (
    <Dialog
      open={isLinkModalOpen}
      onOpenChange={(_, data) => {
        if (!data.open) handleClose();
      }}
    >
      <DialogSurface style={{ maxWidth: 'min(460px, calc(100vw - 24px))', width: '100%', maxHeight: '90dvh', overflowY: 'auto' }}>
        <DialogBody>
          <DialogTitle
            action={
              <Button
                appearance="subtle"
                size="small"
                aria-label="Close"
                icon={<DismissRegular />}
                onClick={handleClose}
              />
            }
          >
            <span className="flex items-center gap-2">
              <LinkRegular style={{ color: tokens.colorBrandForeground1 }} />
              <span>{editingLink ? 'Edit link' : 'Add link'}</span>
            </span>
          </DialogTitle>

          <DialogContent>
            <div className="space-y-4 py-1">
              <Field label="Icon">
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-1.5 pt-0.5">
                  {ICON_OPTIONS.map((opt) => (
                    <Button
                      key={opt.key}
                      size="small"
                      appearance={icon === opt.key ? 'primary' : 'outline'}
                      onClick={() => setIcon(opt.key)}
                      icon={
                        <LinkIcon
                          icon={opt.key}
                          className="w-4 h-4 fill-current"
                          showNoneFallback
                        />
                      }
                      style={{ justifyContent: 'flex-start', fontSize: 12 }}
                    >
                      <span className="truncate">{opt.label}</span>
                    </Button>
                  ))}
                </div>
              </Field>

              <Field label="Display label">
                <Input
                  value={text}
                  onChange={(_, data) => setText(data.value)}
                  placeholder="GitHub"
                />
              </Field>

              <Field label="URL">
                <Input
                  value={url}
                  onChange={(_, data) => setUrl(data.value)}
                  placeholder="https://"
                  onKeyDown={(e) => {
                    if (e.key === 'Enter') handleSave();
                  }}
                />
              </Field>
            </div>
          </DialogContent>

          <DialogActions style={{ justifyContent: 'space-between', width: '100%', flexWrap: 'wrap', gap: 8 }}>
            {editingLink ? (
              <Button
                appearance="subtle"
                icon={<DeleteRegular />}
                onClick={handleDelete}
                style={{ color: tokens.colorPaletteRedForeground1 }}
              >
                Delete
              </Button>
            ) : (
              <span />
            )}
            <div className="flex items-center gap-2">
              <Button appearance="secondary" onClick={handleClose}>
                Cancel
              </Button>
              <Button appearance="primary" onClick={handleSave}>
                Save link
              </Button>
            </div>
          </DialogActions>
        </DialogBody>
      </DialogSurface>
    </Dialog>
  );
};
