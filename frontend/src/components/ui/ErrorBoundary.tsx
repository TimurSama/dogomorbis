'use client';

import React, { Component, ErrorInfo, ReactNode } from 'react';
import { AlertTriangle, RefreshCw, Home } from 'lucide-react';
import { Button } from './button';

interface Props {
  children: ReactNode;
  fallback?: ReactNode;
}

interface State {
  hasError: boolean;
  error?: Error;
  errorInfo?: ErrorInfo;
}

export class ErrorBoundary extends Component<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = { hasError: false };
  }

  static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error('ErrorBoundary caught an error:', error, errorInfo);
    this.setState({ error, errorInfo });
  }

  handleRetry = () => {
    this.setState({ hasError: false, error: undefined, errorInfo: undefined });
  };

  handleGoHome = () => {
    window.location.href = '/';
  };

  render() {
    if (this.state.hasError) {
      if (this.props.fallback) {
        return this.props.fallback;
      }

      return (
        <div className="min-h-screen flex items-center justify-center bg-gray-50 bg-gray-900 p-4">
          <div className="max-w-md w-full bg-white bg-gray-800 rounded-lg shadow-lg p-6 text-center">
            <div className="w-16 h-16 bg-red-100 bg-red-900/20 rounded-full flex items-center justify-center mx-auto mb-4">
              <AlertTriangle className="h-8 w-8 text-red-600 text-red-400" />
            </div>
            
            <h1 className="text-xl font-semibold text-gray-900 text-white mb-2">
              Что-то пошло не так
            </h1>
            
            <p className="text-gray-600 text-gray-400 mb-6">
              Произошла неожиданная ошибка. Мы уже работаем над её исправлением.
            </p>

            {process.env.NODE_ENV === 'development' && this.state.error && (
              <div className="mb-6 p-4 bg-gray-100 bg-gray-700 rounded-lg text-left">
                <h3 className="text-sm font-medium text-gray-900 text-white mb-2">
                  Детали ошибки:
                </h3>
                <pre className="text-xs text-gray-600 text-gray-400 overflow-auto">
                  {this.state.error.toString()}
                </pre>
              </div>
            )}

            <div className="flex space-x-3">
              <Button
                onClick={this.handleRetry}
                variant="outline"
                className="flex-1"
              >
                <RefreshCw className="h-4 w-4 mr-2" />
                Попробовать снова
              </Button>
              
              <Button
                onClick={this.handleGoHome}
                className="flex-1"
              >
                <Home className="h-4 w-4 mr-2" />
                На главную
              </Button>
            </div>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}

// HOC для оборачивания компонентов в ErrorBoundary
export function withErrorBoundary<P extends object>(
  Component: React.ComponentType<P>,
  fallback?: ReactNode
) {
  const WrappedComponent = (props: P) => (
    <ErrorBoundary fallback={fallback}>
      <Component {...props} />
    </ErrorBoundary>
  );

  WrappedComponent.displayName = `withErrorBoundary(${Component.displayName || Component.name})`;

  return WrappedComponent;
}