import React from 'react';
import { useResume } from '../../context/ResumeContext';
import { HeaderLink } from '../../types/resume';
import { EditableContent } from './EditableContent';
import { LinkIcon } from './LinkIcon';
import { formatPhoneValue } from '../../utils/phoneFormatter';
import { sanitizeLinkUrl } from '../../utils/sanitize';
import { AddRegular } from '@fluentui/react-icons';

export const SocialLinks: React.FC = () => {
  const { resumeData, updateHeader, setIsLinkModalOpen, setEditingLink } = useResume();
  const { location, email, phone, links } = resumeData.header;

  const handleEditLink = (link: HeaderLink) => {
    setEditingLink(link);
    setIsLinkModalOpen(true);
  };

  const handleAddLink = () => {
    setEditingLink(null);
    setIsLinkModalOpen(true);
  };

  return (
    <div className="links-line" id="linksContainer">
      <span className="link-item">
        <svg className="link-icon shrink-0" viewBox="0 0 24 24">
          <path
            fillRule="evenodd"
            clipRule="evenodd"
            d="M11.54 22.351A24.25 24.25 0 0 1 12 22.5c.278-.142.548-.293.81-.452 3.82-2.316 8.69-6.31 8.69-12.048C21.5 4.477 17.246 0 12 0S2.5 4.477 2.5 10c0 5.738 4.87 9.732 8.69 12.048.118.072.234.143.35.213v.09zM12 14a4 4 0 1 0 0-8 4 4 0 0 0 0 8z"
          />
        </svg>
        <EditableContent
          singleLine
          html={location}
          onChange={(val) => updateHeader({ location: val })}
          placeholder="City, State, Country"
        />
      </span>

      <span className="link-item">
        <svg className="link-icon shrink-0" viewBox="0 0 24 24">
          <path d="M1.5 8.67v8.58a3 3 0 0 0 3 3h15a3 3 0 0 0 3-3V8.67l-8.928 5.493a3 3 0 0 1-3.144 0L1.5 8.67z" />
          <path d="M22.5 6.908V6.75a3 3 0 0 0-3-3h-15a3 3 0 0 0-3 3v.158l9.714 5.978a1.5 1.5 0 0 0 1.572 0L22.5 6.908z" />
        </svg>
        <EditableContent
          singleLine
          html={email}
          onChange={(val) => updateHeader({ email: val })}
          placeholder="your.email@example.com"
        />
      </span>

      <span className="link-item">
        <svg className="link-icon shrink-0" viewBox="0 0 24 24">
          <path
            fillRule="evenodd"
            clipRule="evenodd"
            d="M1.5 4.5a3 3 0 0 1 3-3h1.372c.86 0 1.61.586 1.819 1.42l1.105 4.423a1.875 1.875 0 0 1-.694 1.955l-1.293.97c-.135.101-.164.249-.126.352a11.285 11.285 0 0 0 6.697 6.697c.103.038.25.009.352-.126l.97-1.293a1.875 1.875 0 0 1 1.955-.694l4.423 1.105c.834.209 1.42.959 1.42 1.82V19.5a3 3 0 0 1-3 3h-2.25C8.552 22.5 1.5 15.448 1.5 6.75V4.5z"
          />
        </svg>
        <EditableContent
          singleLine
          html={phone}
          onChange={(val) => updateHeader({ phone: val })}
          transformOnBlur={formatPhoneValue}
          placeholder="+91 00000 00000"
          className="phone-number"
        />
      </span>

      {links.map((link) => (
        <span key={link.id} className="link-item" data-link-icon={link.icon}>
          <LinkIcon icon={link.icon} />
          <a
            href={sanitizeLinkUrl(link.url)}
            onClick={(e) => {
              e.preventDefault();
              handleEditLink(link);
            }}
            title="Click to edit link"
          >
            {link.text}
          </a>
        </span>
      ))}

      <button
        type="button"
        onClick={handleAddLink}
        title="Add Link"
        className="add-link-btn no-print inline-flex items-center justify-center w-4 h-4 rounded border border-neutral-300 bg-white hover:bg-neutral-100 text-neutral-700 transition-colors cursor-pointer shrink-0 ml-1"
      >
        <AddRegular fontSize={10} />
      </button>
    </div>
  );
};
