import React, { useState } from 'react';
import {
  Dialog,
  DialogSurface,
  DialogBody,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  Badge,
  Switch,
  tokens,
} from '@fluentui/react-components';
import { DocumentSparkleRegular, DismissRegular, CheckmarkRegular } from '@fluentui/react-icons';
import { useResume } from '../../context/ResumeContext';
import { RESUME_TEMPLATES } from '../../constants/templates';

export const TemplatesModal: React.FC = () => {
  const { isTemplatesModalOpen, setIsTemplatesModalOpen, applyTemplate } = useResume();
  const [preserveHeader, setPreserveHeader] = useState(true);

  return (
    <Dialog
      open={isTemplatesModalOpen}
      onOpenChange={(_, data) => setIsTemplatesModalOpen(data.open)}
    >
      <DialogSurface
        style={{
          maxWidth: 'min(640px, calc(100vw - 24px))',
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
                onClick={() => setIsTemplatesModalOpen(false)}
              />
            }
          >
            <span className="flex items-center gap-2">
              <DocumentSparkleRegular style={{ color: tokens.colorBrandForeground1 }} />
              <span>Placement &amp; Role Templates</span>
            </span>
          </DialogTitle>

          <DialogContent>
            <div className="space-y-3 py-1">
              <div
                className="flex items-center justify-between gap-3 p-2.5 rounded-md border"
                style={{
                  backgroundColor: tokens.colorNeutralBackground2,
                  borderColor: tokens.colorNeutralStroke1,
                }}
              >
                <div className="min-w-0">
                  <span
                    className="text-xs font-semibold block"
                    style={{ color: tokens.colorNeutralForeground1 }}
                  >
                    Keep my personal header &amp; contact details
                  </span>
                  <span
                    className="text-[11px] block"
                    style={{ color: tokens.colorNeutralForeground3 }}
                  >
                    Preserves your name, phone, email, links, photo, and signature when loading a template.
                  </span>
                </div>
                <Switch
                  checked={preserveHeader}
                  onChange={(_, data) => setPreserveHeader(data.checked)}
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                {RESUME_TEMPLATES.map((tpl) => {
                  const previewData = tpl.buildData();
                  return (
                    <div
                      key={tpl.id}
                      className="p-3 rounded-md border flex flex-col justify-between gap-2.5"
                      style={{
                        backgroundColor: tokens.colorNeutralBackground1,
                        borderColor: tokens.colorNeutralStroke1,
                      }}
                    >
                      <div className="space-y-1">
                        <div className="flex items-center justify-between gap-2">
                          <span
                            className="text-sm font-semibold"
                            style={{ color: tokens.colorNeutralForeground1 }}
                          >
                            {tpl.name}
                          </span>
                          <Badge appearance="tint" color="brand" size="small">
                            {tpl.badge}
                          </Badge>
                        </div>
                        <p
                          className="text-xs leading-relaxed"
                          style={{ color: tokens.colorNeutralForeground2 }}
                        >
                          {tpl.description}
                        </p>
                        <p
                          className="text-[11px]"
                          style={{ color: tokens.colorNeutralForeground3 }}
                        >
                          {previewData.sections.length} sections &middot;{' '}
                          {previewData.meta.margin || 'normal'} margins &middot; theme:{' '}
                          <span className="capitalize">{previewData.meta.theme}</span>
                        </p>
                      </div>

                      <Button
                        appearance="primary"
                        size="small"
                        icon={<CheckmarkRegular />}
                        onClick={() => {
                          applyTemplate(previewData, preserveHeader);
                          setIsTemplatesModalOpen(false);
                        }}
                      >
                        Apply Template
                      </Button>
                    </div>
                  );
                })}
              </div>
            </div>
          </DialogContent>

          <DialogActions>
            <Button appearance="secondary" onClick={() => setIsTemplatesModalOpen(false)}>
              Cancel
            </Button>
          </DialogActions>
        </DialogBody>
      </DialogSurface>
    </Dialog>
  );
};
