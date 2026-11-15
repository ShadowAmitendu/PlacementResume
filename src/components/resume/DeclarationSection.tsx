import React from 'react';
import { useResume } from '../../context/ResumeContext';
import { EditableContent } from './EditableContent';
import { PenTool, Trash2, Edit3 } from 'lucide-react';

export const DeclarationSection: React.FC = () => {
  const { resumeData, updateDeclaration, setIsSignatureModalOpen } = useResume();
  const { showDeclaration } = resumeData.meta;
  const { text, place, date, signature, signatureImage } = resumeData.declaration;

  if (!showDeclaration) return null;

  return (
    <div className="section-block" id="declarationSection">
      <div className="declaration">
        <strong>Declaration:&nbsp;</strong>
        <EditableContent
          html={text}
          onChange={(val) => updateDeclaration({ text: val })}
          placeholder="I hereby declare that the information given above is true and correct to the best of my knowledge."
        />
      </div>

      <div className="signature-area">
        <div>
          <p>
            Place:&nbsp;
            <EditableContent
              html={place}
              onChange={(val) => updateDeclaration({ place: val })}
              placeholder="___________"
            />
          </p>
          <p className="mt-1">
            Date:&nbsp;
            <EditableContent
              html={date}
              onChange={(val) => updateDeclaration({ date: val })}
              placeholder="___________"
            />
          </p>
        </div>

        <div className="text-right flex flex-col items-end">
          {/* Handwritten / Cleaned Vector Signature Image */}
          {signatureImage ? (
            <div className="relative group/sig inline-flex items-center justify-center mb-0.5">
              <img
                src={signatureImage}
                alt="Signature"
                className="max-h-14 max-w-[160px] object-contain inline-block filter contrast-125"
              />
              <div className="absolute top-0 -right-7 opacity-0 group-hover/sig:opacity-100 flex flex-col gap-1 no-print bg-[var(--ui-surface)] p-1 rounded-md shadow-md border border-[var(--ui-border)] transition-opacity">
                <button
                  type="button"
                  onClick={() => setIsSignatureModalOpen(true)}
                  title="Adjust & clean signature"
                  className="p-1 hover:text-primary rounded cursor-pointer"
                >
                  <Edit3 className="w-3 h-3" />
                </button>
                <button
                  type="button"
                  onClick={() => updateDeclaration({ signatureImage: null })}
                  title="Remove signature image"
                  className="p-1 hover:text-destructive rounded cursor-pointer"
                >
                  <Trash2 className="w-3 h-3" />
                </button>
              </div>
            </div>
          ) : (
            <button
              type="button"
              onClick={() => setIsSignatureModalOpen(true)}
              className="text-[10px] text-primary hover:underline flex items-center gap-1 mb-1 no-print font-sans cursor-pointer transition-colors"
              title="Upload handwritten signature and remove paper shading"
            >
              <PenTool className="w-3 h-3" />
              <span>Add Sign (SVG / Clean)</span>
            </button>
          )}

          <div className="signature-line">
            <EditableContent
              html={signature}
              onChange={(val) => updateDeclaration({ signature: val })}
              placeholder="Full Name / Signature"
            />
          </div>
        </div>
      </div>
    </div>
  );
};
