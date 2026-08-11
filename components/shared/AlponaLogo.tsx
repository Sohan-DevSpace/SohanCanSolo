'use client'

import React from 'react'

export function AlponaLogoMark({ 
  size = 34, 
  className = '' 
}: { 
  size?: number
  className?: string 
}) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 40 40"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={`shrink-0 ${className}`}
    >
      <defs>
        <linearGradient id="alponaEmblemGrad" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="#F5D0A9" />
          <stop offset="45%" stopColor="#B8763C" />
          <stop offset="100%" stopColor="#8C4E1E" />
        </linearGradient>
        <filter id="alponaGlow" x="-20%" y="-20%" width="140%" height="140%">
          <feDropShadow dx="0" dy="2" stdDeviation="2.5" floodColor="#B8763C" floodOpacity="0.45" />
        </filter>
      </defs>

      {/* Primary Alpona Artistic Swoosh */}
      <path
        d="M6 23C12 11 23 6 36 9C26 14 18 22 14 30C11 34 8 31 6 23Z"
        fill="url(#alponaEmblemGrad)"
        filter="url(#alponaGlow)"
      />
      {/* Accent Motif Dot */}
      <circle
        cx="33"
        cy="28"
        r="3"
        fill="url(#alponaEmblemGrad)"
        filter="url(#alponaGlow)"
      />
    </svg>
  )
}
