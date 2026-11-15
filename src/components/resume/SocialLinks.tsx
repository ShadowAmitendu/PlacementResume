import React from 'react';
import { useResume } from '../../context/ResumeContext';
import { HeaderLink, LinkIconType } from '../../types/resume';
import { EditableContent } from './EditableContent';
import { formatPhoneValue } from '../../utils/phoneFormatter';
import { MapPin, Mail, Phone, Globe, Plus } from 'lucide-react';

export const SocialLinks: React.FC = () => {
  const { resumeData, updateHeader, setIsLinkModalOpen, setEditingLink } = useResume();
  const { location, email, phone, links } = resumeData.header;

  const handlePhoneChange = (val: string) => {
    updateHeader({ phone: formatPhoneValue(val) });
  };

  const renderIcon = (icon: LinkIconType) => {
    switch (icon) {
      case 'none':
        return null;
      case 'globe':
        return <Globe className="w-3.5 h-3.5 text-[var(--theme-color)]" />;
      case 'email':
        return <Mail className="w-3.5 h-3.5 text-[var(--theme-color)]" />;
      case 'github':
        return (
          <svg
            className="w-3.5 h-3.5"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
          >
            <path d="M15 22v-4a4.8 4.8 0 0 0-1-3.5c3 0 6-2 6-5.5.08-1.25-.27-2.48-1-3.5.28-1.15.28-2.35 0-3.5 0 0-1 0-3 1.5-2.64-.5-5.36-.5-8 0C6 2 5 2 5 2c-.3 1.15-.3 2.35 0 3.5A5.403 5.403 0 0 0 4 9c0 3.5 3 5.5 6 5.5-.39.49-.68 1.05-.85 1.65-.17.6-.22 1.23-.15 1.85v4" />
            <path d="M9 18c-4.51 2-5-2-7-2" />
          </svg>
        );
      case 'linkedin':
        return (
          <svg
            className="w-3.5 h-3.5"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
          >
            <path d="M16 8a6 6 0 0 1 6 6v7h-4v-7a2 2 0 0 0-2-2 2 2 0 0 0-2 2v7h-4v-7a6 6 0 0 1 6-6z" />
            <rect width="4" height="12" x="2" y="9" />
            <circle cx="4" cy="4" r="2" />
          </svg>
        );
      case 'twitter':
        return (
          <svg
            className="w-3.5 h-3.5"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
          >
            <path d="M22 4s-.7 2.1-2 3.4c1.6 10-9.4 17.3-18 11.6 2.2.1 4.4-.6 6-2C3 15.5.5 9.6 3 5c2.2 2.6 5.6 4.1 9 4-.9-4.2 4-6.6 7-3.8 1.1 0 3-1.2 3-1.2z" />
          </svg>
        );
      case 'instagram':
        return (
          <svg
            className="w-3.5 h-3.5"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
          >
            <rect width="20" height="20" x="2" y="2" rx="5" ry="5" />
            <path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z" />
            <line x1="17.5" x2="17.51" y1="6.5" y2="6.5" />
          </svg>
        );
      case 'youtube':
        return (
          <svg
            className="w-3.5 h-3.5"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
          >
            <path d="M2.5 17a24.12 24.12 0 0 1 0-10 2 2 0 0 1 1.4-1.4 49.56 49.56 0 0 1 16.2 0A2 2 0 0 1 21.5 7a24.12 24.12 0 0 1 0 10 2 2 0 0 1-1.4 1.4 49.55 49.55 0 0 1-16.2 0A2 2 0 0 1 2.5 17" />
            <polygon points="10 15 15 12 10 9 10 15" />
          </svg>
        );
      case 'facebook':
        return (
          <svg
            className="w-3.5 h-3.5"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
          >
            <path d="M18 2h-3a5 5 0 0 0-5 5v3H7v4h3v8h4v-8h3l1-4h-4V7a1 1 0 0 1 1-1h3z" />
          </svg>
        );
      default:
        return <Globe className="w-3.5 h-3.5 text-[var(--theme-color)]" />;
    }
  };

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
        <MapPin className="w-3.5 h-3.5 text-[var(--theme-color)] shrink-0" />
        <EditableContent
          html={location}
          onChange={(val) => updateHeader({ location: val })}
          placeholder="City, State, Country"
        />
      </span>

      <span className="link-item">
        <Mail className="w-3.5 h-3.5 text-[var(--theme-color)] shrink-0" />
        <EditableContent
          html={email}
          onChange={(val) => updateHeader({ email: val })}
          placeholder="your.email@example.com"
        />
      </span>

      <span className="link-item">
        <Phone className="w-3.5 h-3.5 text-[var(--theme-color)] shrink-0" />
        <EditableContent
          html={phone}
          onChange={handlePhoneChange}
          placeholder="+91 00000 00000"
          className="phone-number inline-block min-w-[110px]"
        />
      </span>

      {links.map((link) => (
        <span key={link.id} className="link-item" data-link-icon={link.icon}>
          {renderIcon(link.icon)}
          <a
            href={link.url}
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
        className="add-link-btn no-print flex items-center gap-1 cursor-pointer bg-emerald-600 hover:bg-emerald-700 text-white rounded px-1.5 py-0.5 text-[10px] font-bold"
      >
        <Plus className="w-3 h-3" />
        <span>Add Link</span>
      </button>
    </div>
  );
};
