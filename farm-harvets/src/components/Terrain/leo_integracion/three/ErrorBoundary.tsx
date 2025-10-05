import React from 'react';

// 🧩 Tipos de Props y State
interface ErrorBoundaryProps {
  children: React.ReactNode;
}

interface ErrorBoundaryState {
  hasError: boolean;
  error: Error | null;
}

class ErrorBoundary extends React.Component<ErrorBoundaryProps, ErrorBoundaryState> {
  constructor(props: ErrorBoundaryProps) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error: Error): ErrorBoundaryState {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, errorInfo: React.ErrorInfo): void {
    console.error('ErrorBoundary caught an error:', error, errorInfo);
  }

  render(): React.ReactNode {
    if (this.state.hasError) {
      return (
        <div className="relative w-full h-[calc(100vh-100px)] bg-blue-100 flex items-center justify-center">
          <div className="text-red-800 text-center font-luckiest bg-white bg-opacity-90 p-8 rounded-2xl shadow-2xl border-2 border-red-200">
            <p className="text-xl mb-2">Algo salió mal</p>
            <p className="text-sm text-red-600">
              {this.state.error?.message || 'Error desconocido'}
            </p>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}

export default ErrorBoundary;
