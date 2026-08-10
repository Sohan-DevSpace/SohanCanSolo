'use client';

import React, { Component, ErrorInfo, ReactNode } from 'react';
import { AlertCircle, RefreshCw } from 'lucide-react';

interface Props {
  children: ReactNode;
  fallback?: ReactNode;
  sectionName?: string;
  onReset?: () => void;
}

interface State {
  hasError: boolean;
  error?: Error;
}

export class ErrorBoundary extends Component<Props, State> {
  public state: State = {
    hasError: false,
  };

  public static getDerivedStateFromError(error: Error): State {
    if (typeof window !== 'undefined' && (error.name === 'ChunkLoadError' || error.message?.includes('Loading chunk') || error.message?.includes('Failed to fetch'))) {
      const storageKey = 'alpona_chunk_reload_' + (error.message || '')
      if (!sessionStorage.getItem(storageKey)) {
        sessionStorage.setItem(storageKey, 'true')
        window.location.reload()
      }
    }
    return { hasError: true, error }
  }

  public componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error(`[ErrorBoundary - ${this.props.sectionName || 'Global'}] caught error:`, error, errorInfo);
  }

  public handleReset = () => {
    if (typeof window !== 'undefined' && (this.state.error?.name === 'ChunkLoadError' || this.state.error?.message?.includes('Loading chunk'))) {
      window.location.reload()
      return
    }
    this.setState({ hasError: false, error: undefined });
    if (this.props.onReset) {
      this.props.onReset();
    }
  };

  public render() {
    if (this.state.hasError) {
      if (this.props.fallback) {
        return this.props.fallback;
      }

      return (
        <div className="w-full p-8 my-4 rounded-3xl bg-amber-500/5 border border-amber-500/20 text-foreground flex flex-col items-center justify-center text-center space-y-4 shadow-sm">
          <div className="w-12 h-12 rounded-2xl bg-amber-500/10 text-amber-600 dark:text-amber-400 flex items-center justify-center">
            <AlertCircle className="w-6 h-6" />
          </div>
          <div>
            <h3 className="text-lg font-semibold tracking-tight text-foreground">
              Something went wrong in {this.props.sectionName || 'this section'}
            </h3>
            <p className="text-sm text-muted-foreground mt-1 max-w-md">
              {this.state.error?.message || 'An unexpected error occurred while loading this component.'}
            </p>
          </div>
          <button
            onClick={this.handleReset}
            className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-amber-600 hover:bg-amber-700 text-white font-medium text-sm transition-colors shadow-md shadow-amber-600/20 active:scale-95"
          >
            <RefreshCw className="w-4 h-4" />
            Reload Section
          </button>
        </div>
      );
    }

    return this.props.children;
  }
}
