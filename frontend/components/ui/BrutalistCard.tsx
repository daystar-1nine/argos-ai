import React from 'react';

interface BrutalistCardProps {
  children: React.ReactNode;
  variant?: 'cream' | 'pink' | 'mauve' | 'dark' | 'yellow';
  className?: string;
  header?: React.ReactNode;
  footer?: React.ReactNode;
}

export default function BrutalistCard({
  children,
  variant = 'cream',
  className = '',
  header,
  footer
}: BrutalistCardProps) {
  const variantClass = {
    cream: 'brutal-card-cream',
    pink: 'brutal-card-pink',
    mauve: 'brutal-card-mauve',
    dark: 'brutal-card-dark',
    yellow: 'bg-[#F4CD3F] border-[3px] border-[#111111] brutal-shadow text-[#111111]',
  }[variant];

  return (
    <div className={`${variantClass} flex flex-col justify-between ${className}`}>
      {header && (
        <div className="p-3.5 border-b-[2px] border-[#111111] font-mono text-xs font-black uppercase flex items-center justify-between">
          {header}
        </div>
      )}
      <div className="p-5 flex-1 min-w-0">
        {children}
      </div>
      {footer && (
        <div className="p-3.5 border-t-[2px] border-[#111111] font-mono text-xs">
          {footer}
        </div>
      )}
    </div>
  );
}
