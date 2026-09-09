import React from 'react';

export default function RetroLogo({ size = "default" }: { size?: "sm" | "default" | "lg" }) {
  const dim = size === "sm" ? "w-7 h-7" : size === "lg" ? "w-12 h-12" : "w-9 h-9";
  
  return (
    <div className="flex items-center gap-2.5 select-none">
      {/* Eye + Shield + Digital Circuit Icon */}
      <div className={`relative ${dim} bg-[#F4CD3F] border-[2.5px] border-[#111111] brutal-shadow-sm flex items-center justify-center overflow-hidden`}>
        {/* Shield contour */}
        <svg
          viewBox="0 0 24 24"
          fill="none"
          stroke="#111111"
          strokeWidth="2.5"
          className="w-full h-full p-1"
        >
          {/* Outer Shield */}
          <path
            d="M12 2L4 5V11C4 16.5 7.4 20.9 12 22C16.6 20.9 20 16.5 20 11V5L12 2Z"
            fill="#EFD99C"
          />
          {/* Cyber Eye pupil inside shield */}
          <circle cx="12" cy="11.5" r="3.2" fill="#844469" />
          <circle cx="12" cy="11.5" r="1.3" fill="#F4CD3F" />
          {/* Pixel circuit lines */}
          <line x1="4" y1="11" x2="8" y2="11" stroke="#111111" strokeWidth="1.5" />
          <line x1="16" y1="11" x2="20" y2="11" stroke="#111111" strokeWidth="1.5" />
          <line x1="12" y1="5" x2="12" y2="8" stroke="#111111" strokeWidth="1.5" />
        </svg>
        {/* Retro scan pixel mark in corner */}
        <div className="absolute top-0.5 right-0.5 w-1 h-1 bg-[#D95D5D]" />
      </div>

      <div className="flex flex-col">
        <div className="flex items-center gap-1.5">
          <span className="font-extrabold tracking-tight text-xl md:text-2xl uppercase leading-none font-display">
            ARGOS<span className="text-[#844469]">.AI</span>
          </span>
          <span className="text-[9px] px-1 py-0.2 bg-[#111111] text-[#F4CD3F] font-mono font-bold tracking-widest uppercase border border-[#111111]">
            v3.4
          </span>
        </div>
        <span className="text-[10px] font-mono tracking-wider text-[#111111]/70 font-semibold uppercase">
          PROTECT // DETECT // VERIFY // RESPOND
        </span>
      </div>
    </div>
  );
}
