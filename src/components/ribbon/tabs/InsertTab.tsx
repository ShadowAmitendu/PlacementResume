import React from 'react';
import { Button, Switch } from '@fluentui/react-components';
import {
  DocumentTextRegular,
  TableRegular,
  TextBulletListLtrRegular,
  LineHorizontal1Regular,
  CropRegular,
  SignatureRegular,
  LinkRegular,
} from '@fluentui/react-icons';
import { useResume } from '../../../context/ResumeContext';
import { RibbonGroup, RibbonActionButton } from '../RibbonGroup';

export const InsertTab: React.FC = () => {
  const {
    resumeData,
    addSection,
    updateMeta,
    openCropModal,
    setIsSignatureModalOpen,
    setIsLinkModalOpen,
    setEditingLink,
  } = useResume();

  const showPhoto = resumeData.meta.showPhoto ?? true;
  const showDeclaration = resumeData.meta.showDeclaration;
  const showLinkIcons = resumeData.meta.showLinkIcons;

  const handleOpenAddLink = () => {
    setEditingLink(null);
    setIsLinkModalOpen(true);
  };

  return (
    <div className="flex items-stretch h-full gap-1 overflow-x-auto scrollbar-none flex-nowrap">
      {/* Sections Group */}
      <RibbonGroup label="Sections">
        <RibbonActionButton
          icon={<DocumentTextRegular />}
          label="Text"
          onClick={() => addSection('text')}
          title="Add a paragraph section"
        />
        <RibbonActionButton
          icon={<TableRegular />}
          label="Table"
          onClick={() => addSection('table')}
          title="Add a data table section"
        />
        <RibbonActionButton
          icon={<TextBulletListLtrRegular />}
          label="List"
          onClick={() => addSection('list')}
          title="Add a bullet or numbered list"
        />
        <RibbonActionButton
          icon={<LineHorizontal1Regular />}
          label="Divider"
          onClick={() => addSection('hr')}
          title="Add a horizontal divider line"
        />
      </RibbonGroup>

      {/* Photo Group */}
      <RibbonGroup label="Photo">
        <div className="flex flex-col gap-1 justify-center">
          <Switch
            label="Profile photo"
            labelPosition="before"
            checked={showPhoto}
            onChange={(_, data) => updateMeta({ showPhoto: data.checked })}
            style={{ fontSize: 12 }}
          />
          {showPhoto && (
            <Button
              size="small"
              appearance="outline"
              icon={<CropRegular />}
              onClick={() => openCropModal(resumeData.meta.photo)}
              title="Crop, rotate, and frame profile photo"
              style={{ justifyContent: 'flex-start', fontSize: 11, height: 24 }}
            >
              Crop photo
            </Button>
          )}
        </div>
      </RibbonGroup>

      {/* Signature Group */}
      <RibbonGroup label="Declaration">
        <div className="flex flex-col gap-1 justify-center">
          <Switch
            label="Show declaration"
            labelPosition="before"
            checked={showDeclaration}
            onChange={(_, data) => updateMeta({ showDeclaration: data.checked })}
            style={{ fontSize: 12 }}
          />
          {showDeclaration && (
            <Button
              size="small"
              appearance="outline"
              icon={<SignatureRegular />}
              onClick={() => setIsSignatureModalOpen(true)}
              title="Clean and apply handwritten signature"
              style={{ justifyContent: 'flex-start', fontSize: 11, height: 24 }}
            >
              Clean signature
            </Button>
          )}
        </div>
      </RibbonGroup>

      {/* Links Group */}
      <RibbonGroup label="Links" showDivider={false}>
        <RibbonActionButton
          icon={<LinkRegular />}
          label="Add link"
          onClick={handleOpenAddLink}
          title="Add GitHub, LinkedIn, or website link"
        />
        <div className="pl-1">
          <Switch
            label="Show icons"
            labelPosition="before"
            checked={showLinkIcons}
            onChange={(_, data) => updateMeta({ showLinkIcons: data.checked })}
            style={{ fontSize: 12 }}
          />
        </div>
      </RibbonGroup>
    </div>
  );
};
