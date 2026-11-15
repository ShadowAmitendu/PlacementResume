import React, { useRef } from 'react';
import { useResume } from '../../context/ResumeContext';
import { EditableContent } from './EditableContent';
import { SocialLinks } from './SocialLinks';
import { Trash2, Crop } from 'lucide-react';

export const ResumeHeader: React.FC = () => {
  const { resumeData, updateHeader, setPhoto, openCropModal } = useResume();
  const { fullName, degreeTitle, universityCompany } = resumeData.header;
  const photo = resumeData.meta.photo;
  const showPhoto = resumeData.meta.showPhoto ?? true;
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handlePhotoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (ev) => {
      if (typeof ev.target?.result === 'string') {
        openCropModal(ev.target.result);
      }
    };
    reader.readAsDataURL(file);
    e.target.value = '';
  };

  return (
    <div className={`header ${!showPhoto ? 'no-photo' : ''}`}>
      {/* Profile Photo */}
      {showPhoto && (
        <div
          className="photo-box cursor-pointer group/photo relative"
          onClick={() => fileInputRef.current?.click()}
          role="button"
          tabIndex={0}
          title="Click to upload or change profile photo"
          onKeyDown={(e) => {
            if (e.key === 'Enter') fileInputRef.current?.click();
          }}
        >
          {photo ? (
            <>
              <img src={photo} alt="Profile" className="block w-full h-full object-cover" />
              <div className="absolute top-1 right-1 opacity-0 group-hover/photo:opacity-100 flex items-center gap-1 transition-opacity no-print z-10">
                <button
                  type="button"
                  onClick={(e) => {
                    e.stopPropagation();
                    openCropModal(photo);
                  }}
                  title="Crop / adjust photo"
                  className="bg-neutral-900/80 hover:bg-neutral-800 text-white rounded p-1 cursor-pointer transition-colors"
                >
                  <Crop className="w-3 h-3" />
                </button>
                <button
                  type="button"
                  onClick={(e) => {
                    e.stopPropagation();
                    setPhoto(null);
                  }}
                  title="Remove photo"
                  className="bg-neutral-900/80 hover:bg-destructive text-white rounded p-1 cursor-pointer transition-colors"
                >
                  <Trash2 className="w-3 h-3" />
                </button>
              </div>
            </>
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
      )}

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
