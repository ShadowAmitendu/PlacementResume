import { Component, ErrorInfo, ReactNode } from 'react';

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
        <div
          style={{
            padding: '24px',
            margin: '16px',
            borderRadius: '8px',
            border: '1px solid #ef4444',
            background: '#fef2f2',
            color: '#991b1b',
            fontFamily: 'Inter, sans-serif',
          }}
        >
          <h3 style={{ margin: '0 0 8px', fontSize: '16px', fontWeight: 700 }}>
            Something went wrong
          </h3>
          <p style={{ margin: '0 0 12px', fontSize: '13px' }}>
            {this.state.error?.message || 'An unexpected error occurred.'}
          </p>
          <button
            type="button"
            onClick={() => window.location.reload()}
            style={{
              padding: '6px 14px',
              borderRadius: '6px',
              border: 'none',
              background: '#ef4444',
              color: '#fff',
              fontSize: '13px',
              cursor: 'pointer',
              fontWeight: 600,
            }}
          >
            Reload Page
          </button>
        </div>
      );
    }
    return this.props.children;
  }
}
