import { Component, ErrorInfo, ReactNode } from 'react';
import { Button, Card, tokens } from '@fluentui/react-components';
import { WarningRegular, ArrowClockwiseRegular } from '@fluentui/react-icons';

interface Props {
  children: ReactNode;
  fallback?: ReactNode;
}

interface State {
  hasError: boolean;
  error: Error | null;
}

export class ErrorBoundary extends Component<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, info: ErrorInfo) {
    console.error('[ErrorBoundary]', error, info.componentStack);
  }

  render() {
    if (this.state.hasError) {
      if (this.props.fallback) return this.props.fallback;
      return (
        <Card
          style={{
            margin: 16,
            padding: 20,
            maxWidth: 460,
            border: `1px solid ${tokens.colorPaletteRedBorder1}`,
            backgroundColor: tokens.colorNeutralBackground1,
            color: tokens.colorNeutralForeground1,
          }}
        >
          <div className="flex items-start gap-2.5">
            <WarningRegular
              fontSize={20}
              style={{ color: tokens.colorPaletteRedForeground1, flexShrink: 0, marginTop: 2 }}
            />
            <div className="space-y-2">
              <h3 className="text-sm font-semibold">Something went wrong</h3>
              <p className="text-xs leading-relaxed" style={{ color: tokens.colorNeutralForeground2 }}>
                {this.state.error?.message || 'An unexpected error occurred.'}
              </p>
              <div className="flex items-center gap-2 pt-1">
                <Button
                  appearance="secondary"
                  size="small"
                  onClick={() => this.setState({ hasError: false, error: null })}
                >
                  Try again
                </Button>
                <Button
                  appearance="primary"
                  size="small"
                  icon={<ArrowClockwiseRegular />}
                  onClick={() => window.location.reload()}
                >
                  Reload page
                </Button>
              </div>
            </div>
          </div>
        </Card>
      );
    }
    return this.props.children;
  }
}
