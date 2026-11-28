import React, { useState } from 'react';
import {
  Dialog,
  DialogSurface,
  DialogBody,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  Input,
  Badge,
  tokens,
} from '@fluentui/react-components';
import {
  FolderRegular,
  AddRegular,
  CopyRegular,
  DeleteRegular,
  EditRegular,
  CheckmarkRegular,
  DismissRegular,
  DocumentSparkleRegular,
} from '@fluentui/react-icons';
import { useResume } from '../../context/ResumeContext';

export const ResumesModal: React.FC = () => {
  const {
    isResumesModalOpen,
    setIsResumesModalOpen,
    profiles,
    activeProfileId,
    switchProfile,
    createProfile,
    duplicateProfile,
    renameProfile,
    deleteProfile,
    setIsTemplatesModalOpen,
  } = useResume();

  const [newName, setNewName] = useState('');
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editingName, setEditingName] = useState('');

  const handleCreate = () => {
    const trimmed = newName.trim() || `Resume ${profiles.length + 1}`;
    createProfile(trimmed);
    setNewName('');
  };

  const startRename = (id: string, currentName: string) => {
    setEditingId(id);
    setEditingName(currentName);
  };

  const commitRename = (id: string) => {
    if (editingName.trim()) {
      renameProfile(id, editingName.trim());
    }
    setEditingId(null);
  };

  return (
    <Dialog
      open={isResumesModalOpen}
      onOpenChange={(_, data) => setIsResumesModalOpen(data.open)}
    >
      <DialogSurface
        style={{
          maxWidth: 'min(520px, calc(100vw - 24px))',
          width: '100%',
          maxHeight: '90dvh',
          overflowY: 'auto',
        }}
      >
        <DialogBody>
          <DialogTitle
            action={
              <Button
                appearance="subtle"
                size="small"
                aria-label="Close"
                icon={<DismissRegular />}
                onClick={() => setIsResumesModalOpen(false)}
              />
            }
          >
            <span className="flex items-center gap-2">
              <FolderRegular style={{ color: tokens.colorBrandForeground1 }} />
              <span>Saved Resume Versions</span>
            </span>
          </DialogTitle>

          <DialogContent>
            <div className="space-y-3 py-1">
              <p className="text-xs" style={{ color: tokens.colorNeutralForeground3 }}>
                Maintain separate tailored versions (e.g., SDE, Data Science, Core) locally in your browser.
              </p>

              {/* Create new profile bar */}
              <div className="flex items-center gap-2">
                <Input
                  value={newName}
                  onChange={(_, data) => setNewName(data.value)}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter') handleCreate();
                  }}
                  placeholder="New version name (e.g., SDE Intern 2026)"
                  className="flex-1"
                />
                <Button
                  appearance="primary"
                  size="small"
                  icon={<AddRegular />}
                  onClick={handleCreate}
                >
                  Create
                </Button>
              </div>

              {/* Profiles List */}
              <div className="space-y-1.5 max-h-64 overflow-y-auto pr-0.5">
                {profiles.map((prof) => {
                  const isActive = prof.id === activeProfileId;
                  const isEditing = editingId === prof.id;
                  const updatedStr = new Date(prof.updatedAt).toLocaleString([], {
                    month: 'short',
                    day: 'numeric',
                    hour: '2-digit',
                    minute: '2-digit',
                  });

                  return (
                    <div
                      key={prof.id}
                      className="flex items-center justify-between gap-2 p-2.5 rounded-md border transition-colors"
                      style={{
                        backgroundColor: isActive
                          ? tokens.colorBrandBackground2
                          : tokens.colorNeutralBackground2,
                        borderColor: isActive
                          ? tokens.colorBrandStroke1
                          : tokens.colorNeutralStroke1,
                      }}
                    >
                      <div
                        className="min-w-0 flex-1 cursor-pointer"
                        onClick={() => {
                          if (!isEditing && !isActive) {
                            switchProfile(prof.id);
                          }
                        }}
                      >
                        {isEditing ? (
                          <Input
                            size="small"
                            value={editingName}
                            onChange={(_, data) => setEditingName(data.value)}
                            onKeyDown={(e) => {
                              if (e.key === 'Enter') commitRename(prof.id);
                              if (e.key === 'Escape') setEditingId(null);
                            }}
                            autoFocus
                          />
                        ) : (
                          <>
                            <div className="flex items-center gap-2 min-w-0">
                              <span
                                className="text-sm font-semibold truncate"
                                style={{ color: tokens.colorNeutralForeground1 }}
                              >
                                {prof.name}
                              </span>
                              {isActive && (
                                <Badge appearance="filled" color="brand" size="small">
                                  Active
                                </Badge>
                              )}
                            </div>
                            <span
                              className="text-[11px] block truncate"
                              style={{ color: tokens.colorNeutralForeground3 }}
                            >
                              Updated {updatedStr} &middot; {prof.data.sections.length} sections
                            </span>
                          </>
                        )}
                      </div>

                      <div className="flex items-center gap-1 shrink-0">
                        {isEditing ? (
                          <Button
                            size="small"
                            appearance="primary"
                            icon={<CheckmarkRegular />}
                            onClick={() => commitRename(prof.id)}
                            aria-label="Save name"
                          />
                        ) : (
                          <>
                            {!isActive && (
                              <Button
                                size="small"
                                appearance="outline"
                                onClick={() => switchProfile(prof.id)}
                              >
                                Open
                              </Button>
                            )}
                            <Button
                              size="small"
                              appearance="subtle"
                              icon={<EditRegular />}
                              onClick={() => startRename(prof.id, prof.name)}
                              title="Rename version"
                              aria-label="Rename version"
                            />
                            <Button
                              size="small"
                              appearance="subtle"
                              icon={<CopyRegular />}
                              onClick={() => duplicateProfile(prof.id)}
                              title="Clone version"
                              aria-label="Clone version"
                            />
                            {profiles.length > 1 && (
                              <Button
                                size="small"
                                appearance="subtle"
                                icon={<DeleteRegular />}
                                onClick={() => deleteProfile(prof.id)}
                                title="Delete version"
                                aria-label="Delete version"
                                style={{ color: tokens.colorPaletteRedForeground1 }}
                              />
                            )}
                          </>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          </DialogContent>

          <DialogActions>
            <Button
              appearance="outline"
              icon={<DocumentSparkleRegular />}
              onClick={() => {
                setIsResumesModalOpen(false);
                setIsTemplatesModalOpen(true);
              }}
            >
              Browse Templates
            </Button>
            <Button appearance="secondary" onClick={() => setIsResumesModalOpen(false)}>
              Done
            </Button>
          </DialogActions>
        </DialogBody>
      </DialogSurface>
    </Dialog>
  );
};
