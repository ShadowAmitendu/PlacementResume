import React, { useRef } from 'react';
import { useResume } from '../../context/ResumeContext';
import { EditableContent } from './EditableContent';
import { SocialLinks } from './SocialLinks';

export const ResumeHeader: React.FC = () => {
  const { resumeData, updateHeader, setPhoto } = useResume();
  const { fullName, degreeTitle, universityCompany } = resumeData.header;
  const photo = resumeData.meta.photo;
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handlePhotoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (ev) => {
      const img = new Image();
      img.onload = () => {
        const canvas = document.createElement('canvas');
        let width = img.width;
        let height = img.height;
        const maxDim = 400;

        if (width > height) {
          if (width > maxDim) {
            height *= maxDim / width;
            width = maxDim;
          }
        } else {
          if (height > maxDim) {
            width *= maxDim / height;
            height = maxDim;
          }
        }

        canvas.width = width;
        canvas.height = height;
        const ctx = canvas.getContext('2d');
        if (ctx) {
          ctx.drawImage(img, 0, 0, width, height);
          const base64 = canvas.toDataURL('image/jpeg', 0.7);
          setPhoto(base64);
        }
      };
      if (typeof ev.target?.result === 'string') {
        img.src = ev.target.result;
      }
    };
    reader.readAsDataURL(file);
    e.target.value = '';
  };

  return (
    <div className="header">
      {/* Profile Photo */}
      <div
        className="photo-box cursor-pointer"
        onClick={() => fileInputRef.current?.click()}
        role="button"
        tabIndex={0}
        title="Click to upload profile photo"
        onKeyDown={(e) => {
          if (e.key === 'Enter') fileInputRef.current?.click();
        }}
      >
        {photo ? (
          <img src={photo} alt="Profile" className="block w-full h-full object-cover" />
        ) : (
          <span id="photo-label" className="leading-tight text-center px-1">
            Click to
            <br />
            upload photo
          </span>
        )}
        <input
          ref={fileInputRef}
          type="file"
          accept="image/*"
          onChange={handlePhotoUpload}
          className="hidden"
        />
      </div>

      {/* Details */}
      <div className="header-details">
        <EditableContent
          tagName="h1"
          html={fullName}
          onChange={(val) => updateHeader({ fullName: val })}
          placeholder="Your Full Name"
        />

        <div className="subtitle-line">
          <EditableContent
            html={degreeTitle}
            onChange={(val) => updateHeader({ degreeTitle: val })}
            placeholder="Degree / Job Title"
            style={{ fontWeight: 'bold' }}
          />
          <span className="subtitle-sep">|</span>
          <EditableContent
            html={universityCompany}
            onChange={(val) => updateHeader({ universityCompany: val })}
            placeholder="University / Company"
          />
        </div>

        <SocialLinks />
      </div>
    </div>
  );
};
