import React from 'react';
import { useResume } from '../../context/ResumeContext';
import { EditableContent } from './EditableContent';

export const DeclarationSection: React.FC = () => {
  const { resumeData, updateDeclaration } = useResume();
  const { showDeclaration } = resumeData.meta;
  const { text, place, date, signature } = resumeData.declaration;

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

        <div className="text-right">
          <div className="signature-line">
            <EditableContent
              html={signature}
              onChange={(val) => updateDeclaration({ signature: val })}
              placeholder="Signature"
            />
          </div>
        </div>
      </div>
    </div>
  );
};
