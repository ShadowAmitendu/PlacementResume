import React, { useState, useEffect } from 'react';
import {
  Dialog,
  DialogSurface,
  DialogBody,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  Textarea,
  Badge,
  Spinner,
  tokens,
} from '@fluentui/react-components';
import {
  SparkleRegular,
  CheckmarkRegular,
  DismissRegular,
  ArrowSyncRegular,
} from '@fluentui/react-icons';
import { useResume } from '../../context/ResumeContext';
import { rewriteResumeSnippet, RewriteMode } from '../../utils/bulletRewriter';

const MODES: Array<{ id: RewriteMode; label: string; desc: string }> = [
  { id: 'impact', label: 'Action & Impact', desc: 'Strong verbs + clear contribution' },
  { id: 'tighten', label: 'Tighten (1-Page)', desc: 'Shorter wording without losing facts' },
  { id: 'executive', label: 'Executive Tech', desc: 'Polished senior technical framing' },
];

export const BulletRewriteModal: React.FC = () => {
  const { rewriteTarget, openRewriteModal } = useResume();
  const [sourceText, setSourceText] = useState('');
  const [previewText, setPreviewText] = useState('');
  const [mode, setMode] = useState<RewriteMode>('impact');
  const [usedEngine, setUsedEngine] = useState<string>('local');
  const [isGenerating, setIsGenerating] = useState(false);

  const runRewrite = async (input: string, chosenMode: RewriteMode) => {
    setIsGenerating(true);
    try {
      const res = await rewriteResumeSnippet(input, chosenMode);
      setPreviewText(res.rewritten);
      setUsedEngine(res.usedEngine);
    } finally {
      setIsGenerating(false);
    }
  };

  useEffect(() => {
    if (rewriteTarget) {
      setSourceText(rewriteTarget.initialText);
      runRewrite(rewriteTarget.initialText, 'impact');
      setMode('impact');
    }
  }, [rewriteTarget]);

  const handleClose = () => openRewriteModal(null);

  const handleApply = () => {
    if (rewriteTarget && previewText.trim()) {
      rewriteTarget.onApply(previewText.trim());
    }
    handleClose();
  };

  return (
    <Dialog
      open={Boolean(rewriteTarget)}
      onOpenChange={(_, data) => {
        if (!data.open) handleClose();
      }}
    >
      <DialogSurface
        style={{
          maxWidth: 'min(540px, calc(100vw - 24px))',
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
                onClick={handleClose}
              />
            }
          >
            <span className="flex items-center gap-2">
              <SparkleRegular style={{ color: tokens.colorBrandForeground1 }} />
              <span>{rewriteTarget?.title || 'Rewrite & Tighten Text'}</span>
            </span>
          </DialogTitle>

          <DialogContent>
            <div className="space-y-3 py-1">
              <div className="grid grid-cols-3 gap-1.5">
                {MODES.map((m) => (
                  <Button
                    key={m.id}
                    size="small"
                    appearance={mode === m.id ? 'primary' : 'outline'}
                    onClick={() => {
                      setMode(m.id);
                      runRewrite(sourceText, m.id);
                    }}
                    title={m.desc}
                  >
                    {m.label}
                  </Button>
                ))}
              </div>

              <div className="space-y-1">
                <span
                  className="text-xs font-semibold block"
                  style={{ color: tokens.colorNeutralForeground2 }}
                >
                  Original text
                </span>
                <Textarea
                  value={sourceText}
                  onChange={(_, data) => setSourceText(data.value)}
                  rows={3}
                  style={{ width: '100%' }}
                />
              </div>

              <div className="space-y-1">
                <div className="flex items-center justify-between gap-2">
                  <span
                    className="text-xs font-semibold"
                    style={{ color: tokens.colorNeutralForeground2 }}
                  >
                    Rewritten suggestion
                  </span>
                  <div className="flex items-center gap-1.5">
                    <Badge appearance="outline" size="small">
                      Engine: {usedEngine}
                    </Badge>
                    <Button
                      size="small"
                      appearance="subtle"
                      icon={isGenerating ? <Spinner size="tiny" /> : <ArrowSyncRegular />}
                      disabled={isGenerating}
                      onClick={() => runRewrite(sourceText, mode)}
                    >
                      Refresh
                    </Button>
                  </div>
                </div>
                <Textarea
                  value={previewText}
                  onChange={(_, data) => setPreviewText(data.value)}
                  rows={3}
                  style={{ width: '100%' }}
                />
              </div>
            </div>
          </DialogContent>

          <DialogActions>
            <Button appearance="secondary" onClick={handleClose}>
              Cancel
            </Button>
            <Button
              appearance="primary"
              icon={<CheckmarkRegular />}
              disabled={!previewText.trim() || isGenerating}
              onClick={handleApply}
            >
              Apply to Resume
            </Button>
          </DialogActions>
        </DialogBody>
      </DialogSurface>
    </Dialog>
  );
};
