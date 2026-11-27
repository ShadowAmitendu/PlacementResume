import React from 'react';
import { SignatureRegular, DeleteRegular, EditRegular } from '@fluentui/react-icons';
import { useResume } from '../../context/ResumeContext';
import { EditableContent } from './EditableContent';

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
          {signatureImage ? (
            <div className="sig-box relative inline-flex items-center justify-center mb-0.5">
              <img
                src={signatureImage}
                alt="Signature"
                className="max-h-14 max-w-40 object-contain inline-block contrast-125"
              />
              <div
                className="sig-actions-pill absolute top-0 -right-7 flex flex-col gap-0.5 no-print p-0.5 rounded shadow-sm"
                style={{
                  backgroundColor: '#ffffff',
                  border: '1px solid #d4d4d4',
                }}
              >
                <button
                  type="button"
                  onClick={() => setIsSignatureModalOpen(true)}
                  title="Edit signature"
                  className="p-0.5 hover:bg-neutral-100 rounded cursor-pointer flex items-center transition-colors"
                  style={{ color: '#242424' }}
                >
                  <EditRegular fontSize={12} />
                </button>
                <button
                  type="button"
                  onClick={() => updateDeclaration({ signatureImage: null })}
                  title="Remove signature image"
                  className="p-0.5 hover:bg-red-50 rounded cursor-pointer flex items-center transition-colors"
                  style={{ color: '#c42b1c' }}
                >
                  <DeleteRegular fontSize={12} />
                </button>
              </div>
            </div>
          ) : (
            <button
              type="button"
              onClick={() => setIsSignatureModalOpen(true)}
              className="text-[11px] text-neutral-600 hover:text-neutral-950 hover:underline flex items-center gap-1 mb-1 no-print font-sans cursor-pointer"
              title="Upload and clean handwritten signature"
            >
              <SignatureRegular fontSize={12} />
              <span>Add signature image</span>
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
