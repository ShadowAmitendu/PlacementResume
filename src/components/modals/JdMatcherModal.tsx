import React, { useState } from 'react';
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
  Switch,
  Spinner,
  tokens,
} from '@fluentui/react-components';
import {
  TargetArrowRegular,
  SparkleRegular,
  DismissRegular,
  CheckmarkCircleRegular,
  WarningRegular,
} from '@fluentui/react-icons';
import { useResume } from '../../context/ResumeContext';
import { analyzeJdMatch, JdMatchResult } from '../../utils/jdMatcher';

export const JdMatcherModal: React.FC = () => {
  const { isJdMatcherModalOpen, setIsJdMatcherModalOpen, resumeData } = useResume();
  const [jdText, setJdText] = useState('');
  const [useAi, setUseAi] = useState(true);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [result, setResult] = useState<JdMatchResult | null>(null);

  const handleAnalyze = async () => {
    if (!jdText.trim()) return;
    setIsAnalyzing(true);
    try {
      const res = await analyzeJdMatch(resumeData, jdText, useAi);
      setResult(res);
    } finally {
      setIsAnalyzing(false);
    }
  };

  return (
    <Dialog
      open={isJdMatcherModalOpen}
      onOpenChange={(_, data) => setIsJdMatcherModalOpen(data.open)}
    >
      <DialogSurface
        style={{
          maxWidth: 'min(620px, calc(100vw - 24px))',
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
                onClick={() => setIsJdMatcherModalOpen(false)}
              />
            }
          >
            <span className="flex items-center gap-2">
              <TargetArrowRegular style={{ color: tokens.colorBrandForeground1 }} />
              <span>JD Keyword Match &amp; ATS Checker</span>
            </span>
          </DialogTitle>

          <DialogContent>
            <div className="space-y-3 py-1">
              <p className="text-xs" style={{ color: tokens.colorNeutralForeground3 }}>
                Paste the target company&apos;s Job Description below to check ATS keyword coverage and missing skills. Works offline instantly, and enriches with Gemini / Chrome AI if configured.
              </p>

              <Textarea
                value={jdText}
                onChange={(_, data) => setJdText(data.value)}
                placeholder="Paste Job Description requirements, skills, and responsibilities here..."
                rows={5}
                resize="vertical"
                style={{ width: '100%' }}
              />

              <div className="flex items-center justify-between gap-2 flex-wrap">
                <Switch
                  label="Include AI tailoring tips (if configured)"
                  checked={useAi}
                  onChange={(_, data) => setUseAi(data.checked)}
                />
                <div className="flex items-center gap-2">
                  {result && (
                    <Button
                      size="small"
                      appearance="subtle"
                      onClick={() => {
                        setJdText('');
                        setResult(null);
                      }}
                    >
                      Clear
                    </Button>
                  )}
                  <Button
                    appearance="primary"
                    size="small"
                    icon={isAnalyzing ? <Spinner size="tiny" /> : <SparkleRegular />}
                    disabled={!jdText.trim() || isAnalyzing}
                    onClick={handleAnalyze}
                  >
                    {isAnalyzing ? 'Analyzing...' : 'Analyze Match'}
                  </Button>
                </div>
              </div>

              {result && (
                <div
                  className="p-3 rounded-md border space-y-3"
                  style={{
                    backgroundColor: tokens.colorNeutralBackground2,
                    borderColor: tokens.colorNeutralStroke1,
                  }}
                >
                  <div className="flex items-center justify-between gap-2">
                    <div className="flex items-center gap-2">
                      <span
                        className="text-sm font-semibold"
                        style={{ color: tokens.colorNeutralForeground1 }}
                      >
                        Keyword Match Score:
                      </span>
                      <Badge
                        appearance="filled"
                        color={
                          result.scorePct >= 70
                            ? 'success'
                            : result.scorePct >= 40
                            ? 'warning'
                            : 'danger'
                        }
                      >
                        {result.scorePct}% ({result.matchedKeywords.length}/{result.totalKeywords})
                      </Badge>
                    </div>
                    <Badge appearance="outline" size="small">
                      Engine: {result.usedEngine}
                    </Badge>
                  </div>

                  {/* Matched */}
                  <div className="space-y-1">
                    <span
                      className="text-xs font-semibold flex items-center gap-1"
                      style={{ color: tokens.colorPaletteGreenForeground1 }}
                    >
                      <CheckmarkCircleRegular fontSize={14} />
                      <span>Present in your resume ({result.matchedKeywords.length})</span>
                    </span>
                    <div className="flex flex-wrap gap-1">
                      {result.matchedKeywords.length > 0 ? (
                        result.matchedKeywords.map((kw) => (
                          <Badge key={kw} appearance="tint" color="success" size="small">
                            {kw}
                          </Badge>
                        ))
                      ) : (
                        <span className="text-xs" style={{ color: tokens.colorNeutralForeground3 }}>
                          None of the extracted terms matched yet.
                        </span>
                      )}
                    </div>
                  </div>

                  {/* Missing */}
                  <div className="space-y-1">
                    <span
                      className="text-xs font-semibold flex items-center gap-1"
                      style={{ color: tokens.colorPaletteMarigoldForeground1 }}
                    >
                      <WarningRegular fontSize={14} />
                      <span>Missing or unmentioned ({result.missingKeywords.length})</span>
                    </span>
                    <div className="flex flex-wrap gap-1">
                      {result.missingKeywords.length > 0 ? (
                        result.missingKeywords.map((kw) => (
                          <Badge key={kw} appearance="tint" color="warning" size="small">
                            {kw}
                          </Badge>
                        ))
                      ) : (
                        <span className="text-xs" style={{ color: tokens.colorPaletteGreenForeground1 }}>
                          Great coverage — all extracted terms appear in your resume!
                        </span>
                      )}
                    </div>
                  </div>

                  {result.aiSuggestions && result.aiSuggestions.length > 0 && (
                    <div
                      className="pt-2 space-y-1 border-t"
                      style={{ borderColor: tokens.colorNeutralStroke2 }}
                    >
                      <span
                        className="text-xs font-semibold block"
                        style={{ color: tokens.colorNeutralForeground1 }}
                      >
                        AI Tailoring Recommendations
                      </span>
                      <ul
                        className="list-disc pl-4 space-y-1 text-xs"
                        style={{ color: tokens.colorNeutralForeground2 }}
                      >
                        {result.aiSuggestions.map((tip, idx) => (
                          <li key={idx}>{tip}</li>
                        ))}
                      </ul>
                    </div>
                  )}
                </div>
              )}
            </div>
          </DialogContent>

          <DialogActions>
            <Button appearance="secondary" onClick={() => setIsJdMatcherModalOpen(false)}>
              Close
            </Button>
          </DialogActions>
        </DialogBody>
      </DialogSurface>
    </Dialog>
  );
};
