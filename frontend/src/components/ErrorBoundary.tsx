import React, { ReactNode, ReactElement } from "react";

interface ErrorBoundaryProps {
  children: ReactNode;
}

interface ErrorBoundaryState {
  hasError: boolean;
  error: Error | null;
  errorInfo: React.ErrorInfo | null;
}

export class ErrorBoundary extends React.Component<ErrorBoundaryProps, ErrorBoundaryState> {
  constructor(props: ErrorBoundaryProps) {
    super(props);
    this.state = {
      hasError: false,
      error: null,
      errorInfo: null
    };
  }

  static getDerivedStateFromError(_error: Error): Partial<ErrorBoundaryState> {
    return { hasError: true };
  }

  componentDidCatch(_error: Error, errorInfo: React.ErrorInfo): void {
    this.setState({
      error: _error,
      errorInfo
    });

    // Log to console in development
    if (import.meta.env.DEV) {
      console.error("Error caught by ErrorBoundary:");
      console.error("Error:", _error);
      console.error("ErrorInfo:", errorInfo);
    }
  }

  resetError = (): void => {
    this.setState({
      hasError: false,
      error: null,
      errorInfo: null
    });
  };

  render(): ReactElement {
    if (this.state.hasError) {
      return (
        <div className="error-boundary-container">
          <div className="error-boundary-content">
            <h1>⚠️ Something went wrong</h1>
            <p>An unexpected error occurred in the application.</p>

            {import.meta.env.DEV && this.state.error && (
              <details className="error-details">
                <summary>Error Details (Development Only)</summary>
                <pre className="error-stack">
                  {this.state.error.toString()}
                  {"\n\n"}
                  {this.state.errorInfo?.componentStack}
                </pre>
              </details>
            )}

            <div className="error-boundary-actions">
              <button onClick={this.resetError} className="error-btn-reset">
                Try Again
              </button>
              <button
                onClick={() => {
                  window.location.href = "/";
                }}
                className="error-btn-home"
              >
                Go to Home
              </button>
            </div>

            <p className="error-help-text">
              If the problem persists, please try refreshing the page or contact support.
            </p>
          </div>
        </div>
      );
    }

    return <>{this.props.children}</>;
  }
}
