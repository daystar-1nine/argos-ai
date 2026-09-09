import React from 'react';

interface StatusBadgeProps {
  status: 'valid' | 'danger' | 'warning' | 'info' | 'pink';
  label: string;
  size?: 'sm' | 'default';
  pulsing?: boolean;
}

export default function StatusBadge({
  status,
  label,
  size = 'default',
  pulsing = false
}: StatusBadgeProps) {
  const styles = {
    valid: 'bg-[#8BCF9B] text-black border-[#111111]',
    danger: 'bg-[#D95D5D] text-white border-[#111111]',
    warning: 'bg-[#F4CD3F] text-black border-[#111111]',
    info: 'bg-[#EFD99C] text-black border-[#111111]',
    pink: 'bg-[#F6C6D8] text-black border-[#111111]'
  }[status];

  const padding = size === 'sm' ? 'px-1.5 py-0.5 text-[9px]' : 'px-2.5 py-1 text-[10px]';

  return (
    <span className={`inline-flex items-center gap-1.5 font-mono font-black uppercase border-[1.5px] whitespace-nowrap select-none ${styles} ${padding}`}>
      {pulsing && (
        <span className={`w-1.5 h-1.5 rounded-full ${status === 'danger' ? 'bg-white' : 'bg-black'} led-blink`} />
      )}
      {label}
    </span>
  );
}
