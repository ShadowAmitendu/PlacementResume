import React from 'react';
import { Button, Card, tokens } from '@fluentui/react-components';
import { LaptopRegular, ArrowRightRegular } from '@fluentui/react-icons';

interface MobileUnsupportedViewProps {
  onDismiss?: () => void;
}

export const MobileUnsupportedView: React.FC<MobileUnsupportedViewProps> = ({ onDismiss }) => {
  return (
    <div
      className="fixed inset-0 z-50 flex flex-col items-center justify-center p-6 text-center no-print"
      style={{
        backgroundColor: tokens.colorNeutralBackground3,
        color: tokens.colorNeutralForeground1,
      }}
    >
      <Card
        style={{
          width: '100%',
          maxWidth: 360,
          padding: 24,
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          gap: 16,
        }}
      >
        <div
          className="w-12 h-12 rounded-lg flex items-center justify-center"
          style={{
            backgroundColor: tokens.colorNeutralBackground2,
            border: `1px solid ${tokens.colorNeutralStroke1}`,
            color: tokens.colorBrandForeground1,
          }}
        >
          <LaptopRegular fontSize={26} />
        </div>

        <div className="space-y-1.5">
          <h1
            className="text-base font-semibold tracking-tight"
            style={{ color: tokens.colorNeutralForeground1 }}
          >
            This website is not supported on mobile phones
          </h1>
          <p
            className="text-xs leading-relaxed"
            style={{ color: tokens.colorNeutralForeground2 }}
          >
            Open PlacementResume on a tablet, laptop, or desktop browser to use the full editor.
          </p>
        </div>

        {onDismiss && (
          <Button
            appearance="subtle"
            size="small"
            icon={<ArrowRightRegular />}
            iconPosition="after"
            onClick={onDismiss}
          >
            Continue anyway
          </Button>
        )}
      </Card>
    </div>
  );
};
