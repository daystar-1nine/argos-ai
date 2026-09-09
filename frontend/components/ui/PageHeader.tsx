import React from 'react';

interface PageHeaderProps {
  badge?: string;
  badgeColor?: 'pink' | 'yellow' | 'mauve' | 'dark' | 'red';
  title: string;
  subtitle?: string;
  actions?: React.ReactNode;
}

export default function PageHeader({
  badge,
  badgeColor = 'mauve',
  title,
  subtitle,
  actions
}: PageHeaderProps) {
  const badgeClasses = {
    pink: 'bg-[#F6C6D8] text-[#111111]',
    yellow: 'bg-[#F4CD3F] text-[#111111]',
    mauve: 'bg-[#844469] text-[#EFD99C]',
    dark: 'bg-[#111111] text-[#F4CD3F]',
    red: 'bg-[#D95D5D] text-white',
  }[badgeColor];

  return (
    <div className="flex flex-col md:flex-row md:items-end justify-between pb-6 mb-8 border-b-[3px] border-[#111111] gap-4 min-w-0">
      <div className="min-w-0 max-w-3xl">
        {badge && (
          <div className={`inline-flex items-center gap-1.5 px-3 py-1 border-[2px] border-[#111111] font-mono text-xs font-black uppercase tracking-wider mb-3 ${badgeClasses}`}>
            {badge}
          </div>
        )}
        <h1 className="text-3xl sm:text-4xl lg:text-5xl font-black uppercase tracking-tight text-[#111111] font-display break-words">
          {title}
        </h1>
        {subtitle && (
          <p className="font-mono text-xs sm:text-sm text-[#111111]/80 mt-2 break-words leading-relaxed max-w-2xl">
            {subtitle}
          </p>
        )}
      </div>

      {actions && (
        <div className="flex flex-wrap items-center gap-3 shrink-0">
          {actions}
        </div>
      )}
    </div>
  );
}
