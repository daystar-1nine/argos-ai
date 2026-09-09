import React from 'react';
import ArgosMark from './ArgosMark';

interface ArgosLogoProps {
  size?: 'sm' | 'default' | 'lg';
  variant?: 'color' | 'mono' | 'light';
  showTagline?: boolean;
  className?: string;
}

export default function ArgosLogo({
  size = 'default',
  variant = 'color',
  showTagline = true,
  className = ''
}: ArgosLogoProps) {
  const markSize = size === 'sm' ? 26 : size === 'lg' ? 42 : 32;
  const titleSize = size === 'sm' ? 'text-lg' : size === 'lg' ? 'text-2xl' : 'text-xl';
  const tagColor = variant === 'light' ? 'text-white/70' : 'text-[#111111]/70';
  const textColor = variant === 'light' ? 'text-white' : 'text-[#111111]';

  return (
    <div className={`inline-flex items-center gap-2.5 select-none ${className}`}>
      {/* Eye + Shield SVG Emblem */}
      <div className="relative">
        <ArgosMark size={markSize} variant={variant} />
      </div>

      {/* Typography */}
      <div className="flex flex-col justify-center">
        <div className="flex items-center gap-1.5 leading-none">
          <span className={`font-black uppercase tracking-tight ${titleSize} ${textColor} font-display`}>
            ARGOS<span className={variant === 'light' ? 'text-[#F4CD3F]' : 'text-[#844469]'}>.AI</span>
          </span>
          <span className="text-[9px] px-1 py-0.2 bg-[#111111] text-[#F4CD3F] font-mono font-bold tracking-widest uppercase border border-[#111111]">
            v3.4
          </span>
        </div>
        {showTagline && (
          <span className={`text-[9px] font-mono tracking-wider font-semibold uppercase mt-0.5 ${tagColor}`}>
            PROTECT // DETECT // RESPOND
          </span>
        )}
      </div>
    </div>
  );
}
