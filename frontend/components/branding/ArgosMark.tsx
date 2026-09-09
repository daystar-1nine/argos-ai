import React from 'react';

interface ArgosMarkProps {
  size?: number | string;
  className?: string;
  variant?: 'color' | 'mono' | 'light';
}

export default function ArgosMark({ 
  size = 32, 
  className = '', 
  variant = 'color' 
}: ArgosMarkProps) {
  const shieldFill = variant === 'mono' ? '#111111' : variant === 'light' ? '#FFFFFF' : '#F4CD3F';
  const innerFill = variant === 'mono' ? '#FFFFFF' : variant === 'light' ? '#111111' : '#844469';
  const pupilFill = variant === 'mono' ? '#111111' : variant === 'light' ? '#FFFFFF' : '#EFD99C';
  const strokeColor = variant === 'light' ? '#111111' : '#111111';

  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 32 32"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={`shrink-0 ${className}`}
      aria-label="Argos AI Emblem"
    >
      {/* Outer Brutalist Border & Shield Shape */}
      <path
        d="M16 2L4 6.5V15.5C4 22.8 9.1 29 16 30.5C22.9 29 28 22.8 28 15.5V6.5L16 2Z"
        fill={shieldFill}
        stroke={strokeColor}
        strokeWidth="2.5"
        strokeLinejoin="round"
      />
      {/* Circuit Nodes & Geometric Lines */}
      <line x1="4" y1="15.5" x2="10" y2="15.5" stroke={strokeColor} strokeWidth="2" />
      <line x1="22" y1="15.5" x2="28" y2="15.5" stroke={strokeColor} strokeWidth="2" />
      <line x1="16" y1="6.5" x2="16" y2="10.5" stroke={strokeColor} strokeWidth="2" />
      
      {/* The All-Seeing Cyber Eye */}
      <circle cx="16" cy="16" r="5" fill={innerFill} stroke={strokeColor} strokeWidth="2" />
      <circle cx="16" cy="16" r="2.2" fill={pupilFill} />
      
      {/* Pixel Art Tech Accent */}
      <rect x="19" y="8" width="2" height="2" fill="#D95D5D" stroke="#111111" strokeWidth="0.5" />
    </svg>
  );
}
