import React, { Component, type ErrorInfo, type ReactNode } from 'react';
import { createRoot } from 'react-dom/client';
import './index.css';
import App from './App.tsx';

interface ErrorBoundaryProps {
  children: ReactNode;
}

interface ErrorBoundaryState {
  hasError: boolean;
  error: Error | null;
}

class ErrorBoundary extends Component<ErrorBoundaryProps, ErrorBoundaryState> {
  constructor(props: ErrorBoundaryProps) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error: Error): ErrorBoundaryState {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error('App runtime error caught by boundary:', error, errorInfo);
  }

  render() {
    if (this.state.hasError) {
      return (
        <div style={{ padding: 24, backgroundColor: '#0d0f1d', color: '#ffffff', minHeight: '100vh', fontFamily: 'sans-serif' }}>
          <h2 style={{ color: '#ec4899', fontSize: 20, marginBottom: 12 }}>Uygulama Başlatma Hatası</h2>
          <p style={{ color: '#cbd5e1', fontSize: 13, marginBottom: 16 }}>
            Bir bileşen yüklenirken hata oluştu:
          </p>
          <pre style={{ backgroundColor: '#1e2238', padding: 12, borderRadius: 8, fontSize: 11, overflowX: 'auto', color: '#f87171' }}>
            {this.state.error?.toString()}
          </pre>
          <button
            onClick={() => {
              localStorage.clear();
              window.location.reload();
            }}
            style={{
              marginTop: 20,
              padding: '10px 20px',
              backgroundColor: '#ec4899',
              color: '#fff',
              border: 'none',
              borderRadius: 12,
              fontWeight: 'bold',
              cursor: 'pointer'
            }}
          >
            Önbelleği Temizle ve Yeniden Başlat
          </button>
        </div>
      );
    }
    return this.props.children;
  }
}

createRoot(document.getElementById('root')!).render(
  <ErrorBoundary>
    <App />
  </ErrorBoundary>,
);
