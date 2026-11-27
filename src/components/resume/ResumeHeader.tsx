import React, { useRef } from 'react';
import { CropRegular, DeleteRegular } from '@fluentui/react-icons';
import { useResume } from '../../context/ResumeContext';
import { EditableContent } from './EditableContent';
import { SocialLinks } from './SocialLinks';

export const ResumeHeader: React.FC = () => {
  const { resumeData, updateHeader, setPhoto, openCropModal, showAlert } = useResume();
  const { fullName, degreeTitle, universityCompany } = resumeData.header;
  const photo = resumeData.meta.photo;
  const showPhoto = resumeData.meta.showPhoto ?? true;
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handlePhotoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (!file.type.startsWith('image/')) {
      showAlert('Select a valid image file.', 'Unsupported file');
      e.target.value = '';
      return;
    }

    const reader = new FileReader();
    reader.onerror = () => {
      showAlert('Failed to read the selected image file.', 'Read error');
    };
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
      {showPhoto && (
        <div
          className="photo-box cursor-pointer relative"
          onClick={() => fileInputRef.current?.click()}
          role="button"
          tabIndex={0}
          title="Upload or change profile photo"
          onKeyDown={(e) => {
            if (e.key === 'Enter' || e.key === ' ') {
              e.preventDefault();
              fileInputRef.current?.click();
            }
          }}
        >
          {photo ? (
            <>
              <img src={photo} alt="Profile" className="block w-full h-full object-cover" />
              <div className="photo-actions-pill absolute top-1 right-1 flex items-center gap-0.5 no-print z-10 bg-white/95 border border-neutral-300 rounded p-0.5 shadow-sm">
                <button
                  type="button"
                  onClick={(e) => {
                    e.stopPropagation();
                    openCropModal(photo);
                  }}
                  title="Crop photo"
                  className="hover:bg-neutral-100 text-neutral-800 rounded p-0.5 cursor-pointer flex items-center"
                >
                  <CropRegular fontSize={12} />
                </button>
                <button
                  type="button"
                  onClick={(e) => {
                    e.stopPropagation();
                    setPhoto(null);
                  }}
                  title="Remove photo"
                  className="hover:bg-red-50 text-neutral-800 hover:text-red-700 rounded p-0.5 cursor-pointer flex items-center"
                >
                  <DeleteRegular fontSize={12} />
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
