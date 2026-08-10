'use client'

import React, { Component, ErrorInfo, ReactNode } from 'react'

interface Props {
  name: string
  children: ReactNode
}

interface State {
  hasError: boolean
}

export class SafeBoundary extends Component<Props, State> {
  public state: State = {
    hasError: false
  }

  public static getDerivedStateFromError(_: Error): State {
    return { hasError: true }
  }

  public componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error(`Error in section "${this.props.name}":`, error, errorInfo)
  }

  public render() {
    if (this.state.hasError) {
      return (
        <div className="py-16 text-center text-red-500 font-mono border border-dashed border-red-300 bg-red-50/10 rounded-2xl m-6">
          <p className="font-bold">Error loading section: {this.props.name}</p>
          <p className="text-[12px] opacity-75 mt-1">Check the browser console for details.</p>
        </div>
      )
    }

    return this.props.children
  }
}
