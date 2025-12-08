import React from 'react';

class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error) {
    return { hasError: true, error };
  }

  componentDidCatch(error, errorInfo) {
    console.error('Error caught by boundary:', error, errorInfo);
  }

  render() {
    if (this.state.hasError) {
      return (
        <div style={{ 
          padding: '20px', 
          border: '1px solid #ff4d4f', 
          borderRadius: '8px',
          backgroundColor: '#fff2f0',
          color: '#cf1322'
        }}>
          <h3>Something went wrong</h3>
          <p>An error occurred while rendering this component.</p>
          <details style={{ marginTop: '10px' }}>
            <summary>Error details</summary>
            <pre style={{ fontSize: '12px', marginTop: '10px' }}>
              {this.state.error?.toString()}
            </pre>
          </details>
        </div>
      );
    }

    return this.props.children;
  }
}

export default ErrorBoundary;
