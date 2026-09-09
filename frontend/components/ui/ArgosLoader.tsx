'use client';

import React, { useEffect, useState, useId } from 'react';
import { 
  Check, 
  Activity, 
  Eye, 
  X,
  Volume2,
  Lock
} from 'lucide-react';

export type ArgosLoaderVariant = 'initial' | 'page' | 'analysis';

export interface ArgosLoaderProps {
  variant?: ArgosLoaderVariant;
  /** Force display even if sessionStorage says already booted */
  forceShow?: boolean;
  /** Custom callback when sequence completes */
  onComplete?: () => void;
  /** Custom title or message for page or analysis mode */
  message?: string;
  /** Target asset or filename being analyzed in 'analysis' mode */
  targetName?: string;
  /** Allow dismissing analysis loader */
  onClose?: () => void;
  /** For analysis mode: simulated duration in ms (defaults to 2000) */
  duration?: number;
}

// ============================================================================
// 1. REUSABLE ARGOS SHIELD + EYE SVG COMPONENT
// ============================================================================
export interface ArgosShieldEyeProps {
  size?: number;
  stage?: number; // 1: outline, 2: eye open, 3: matrix, 4: dna, 5: locked
  isLocked?: boolean;
  showRadar?: boolean;
  showLaser?: boolean;
  className?: string;
}

export function ArgosShieldEye({
  size = 180,
  stage = 5,
  isLocked = false,
  showRadar = true,
  showLaser = true,
  className = '',
}: ArgosShieldEyeProps) {
  const laserGradId = useId();
  const eyeClipId = useId();

  return (
    <div 
      className={`relative flex items-center justify-center select-none ${className}`}
      style={{ width: size, height: size }}
    >
      <svg
        width={size}
        height={size}
        viewBox="0 0 200 200"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        className="w-full h-full overflow-visible"
        aria-label="ARGOS Cyber Shield and Eye"
      >
        <defs>
          {/* Laser scan gradient */}
          <linearGradient id={laserGradId} x1="0%" y1="0%" x2="0%" y2="100%">
            <stop offset="0%" stopColor="#8BCF9B" stopOpacity="0" />
            <stop offset="50%" stopColor="#8BCF9B" stopOpacity="0.9" />
            <stop offset="100%" stopColor="#8BCF9B" stopOpacity="0" />
          </linearGradient>

          {/* Eye opening clip path */}
          <clipPath id={eyeClipId}>
            <rect 
              x="30" 
              y={stage >= 2 ? "50" : "98"} 
              width="140" 
              height={stage >= 2 ? "100" : "4"} 
              className="transition-all duration-300"
            />
          </clipPath>
        </defs>

        {/* --- HARD OFFSET DROP SHADOW (Phase 5 or isLocked) --- */}
        {(stage >= 5 || isLocked) && (
          <path
            d="M100 18L32 46V102C32 146 61 183 100 193C139 183 168 146 168 102V46L100 18Z"
            fill="#111111"
            transform="translate(7, 7)"
            opacity="0.9"
          />
        )}

        {/* --- MAIN SHIELD OUTLINE & FILL --- */}
        <path
          d="M100 18L32 46V102C32 146 61 183 100 193C139 183 168 146 168 102V46L100 18Z"
          fill={stage >= 5 ? '#F4CD3F' : stage >= 3 ? '#EFD99C' : '#FAF1EE'}
          stroke="#111111"
          strokeWidth="5"
          strokeLinejoin="round"
          className="transition-colors duration-300"
        />

        {/* Circuit traces on shield surface */}
        <g stroke="#111111" strokeWidth="2.5" strokeLinecap="square" opacity={stage >= 2 ? 1 : 0.4}>
          <path d="M48 64H75V84" fill="none" />
          <path d="M152 64H125V84" fill="none" />
          <path d="M48 120H68V142L82 152" fill="none" />
          <path d="M152 120H132V142L118 152" fill="none" />
          <circle cx="75" cy="84" r="3" fill="#844469" />
          <circle cx="125" cy="84" r="3" fill="#844469" />
          <circle cx="82" cy="152" r="3" fill="#844469" />
          <circle cx="118" cy="152" r="3" fill="#844469" />
        </g>

        {/* --- RADAR RINGS (Phase 2+) --- */}
        {showRadar && stage >= 2 && (
          <g opacity="0.65">
            <circle 
              cx="100" 
              cy="100" 
              r="34" 
              stroke="#844469" 
              strokeWidth="1.5" 
              strokeDasharray="3 3"
              className="animate-spin"
              style={{ transformOrigin: '100px 100px', animationDuration: '8s' }}
            />
            <circle 
              cx="100" 
              cy="100" 
              r="48" 
              stroke="#111111" 
              strokeWidth="1.5" 
              strokeDasharray="4 4"
              className="animate-spin"
              style={{ transformOrigin: '100px 100px', animationDuration: '14s', animationDirection: 'reverse' }}
            />
          </g>
        )}

        {/* --- THE EYE GROUP (Clipped to animate opening in Phase 2) --- */}
        <g clipPath={`url(#${eyeClipId})`}>
          {/* Sclera / Eye Diamond-Oval */}
          <path
            d="M50 100C66 74 134 74 150 100C134 126 66 126 50 100Z"
            fill={stage >= 4 ? '#F8E8E8' : '#FFFFFF'}
            stroke="#111111"
            strokeWidth="4"
          />

          {/* Iris Outer Ring */}
          <circle
            cx="100"
            cy="100"
            r="22"
            fill={stage >= 4 ? '#844469' : '#F6C6D8'}
            stroke="#111111"
            strokeWidth="3.5"
            className="transition-colors duration-300"
          />

          {/* Iris Radiating Ticks */}
          <g stroke="#111111" strokeWidth="1.5">
            <line x1="100" y1="78" x2="100" y2="83" />
            <line x1="100" y1="117" x2="100" y2="122" />
            <line x1="78" y1="100" x2="83" y2="100" />
            <line x1="117" y1="100" x2="122" y2="100" />
            <line x1="84" y1="84" x2="88" y2="88" />
            <line x1="116" y1="116" x2="112" y2="112" />
            <line x1="84" y1="116" x2="88" y2="112" />
            <line x1="116" y1="84" x2="112" y2="88" />
          </g>

          {/* Pupil */}
          <circle
            cx="100"
            cy="100"
            r={stage >= 3 ? 9 : 6}
            fill="#111111"
            className="transition-all duration-300"
          />

          {/* Pupil Target Glint */}
          <circle
            cx="97"
            cy="97"
            r="2.5"
            fill={stage >= 4 ? '#8BCF9B' : '#EFD99C'}
          />

          {/* Crosshair Target Reticle */}
          {stage >= 2 && (
            <g stroke={stage >= 4 ? '#8BCF9B' : '#844469'} strokeWidth="1.5">
              <line x1="92" y1="100" x2="108" y2="100" />
              <line x1="100" y1="92" x2="100" y2="108" />
            </g>
          )}
        </g>

        {/* --- HORIZONTAL SCANLINE LASER (Phases 2 & 3) --- */}
        {showLaser && stage >= 2 && stage < 5 && (
          <rect
            x="32"
            y="46"
            width="136"
            height="14"
            fill={`url(#${laserGradId})`}
            className="animate-scanline-laser pointer-events-none"
          />
        )}

        {/* --- NEO-BRUTALIST PIXEL ACCENTS (Phase 3+) --- */}
        {stage >= 3 && (
          <>
            <rect x="94" y="24" width="12" height="4" fill="#111111" />
            <rect x="34" y="48" width="4" height="10" fill="#D95D5D" stroke="#111111" strokeWidth="1" />
            <rect x="162" y="48" width="4" height="10" fill="#8BCF9B" stroke="#111111" strokeWidth="1" />
          </>
        )}
      </svg>
    </div>
  );
}

// ============================================================================
// 2. MAIN BOOT LOADER (variant="initial")
// ============================================================================
const MODULE_CARDS = [
  {
    id: 'dna',
    title: 'MEDIA DNA ENGINE',
    statusPending: 'GENERATING HASHES...',
    statusReady: 'DNA ANCHORED',
    subtitle: 'Cryptographic provenance',
    telemetry: 'P-HASH 64b // DWT L3 // LATENCY 1.2ms',
    color: 'bg-[#EFD99C]',
    badgeBg: 'bg-[#844469] text-[#EFD99C]',
    accentBorder: 'border-[#111111]'
  },
  {
    id: 'spectral',
    title: 'FORENSIC SPECTRAL SCAN',
    statusPending: 'SPECTRAL DECOMP...',
    statusReady: 'NYQUIST NOMINAL',
    subtitle: 'Frequency & artifact analysis',
    telemetry: 'FFT 2048-pt // CONFIDENCE 99.4%',
    color: 'bg-[#F6C6D8]',
    badgeBg: 'bg-[#111111] text-[#F4CD3F]',
    accentBorder: 'border-[#111111]'
  },
  {
    id: 'sync',
    title: 'AUDIO-VISUAL SYNC',
    statusPending: 'CORRELATING VISEMES...',
    statusReady: 'SYNC LOCKED ±1.8ms',
    subtitle: 'Phoneme-viseme correlation',
    telemetry: 'VISEME DELTA 0.04 // AUDIO-BIO 98.7%',
    color: 'bg-[#FAF1EE]',
    badgeBg: 'bg-[#844469] text-white',
    accentBorder: 'border-[#111111]'
  },
  {
    id: 'watermark',
    title: 'WATERMARK ANCHOR',
    statusPending: 'EMBEDDING C2PA...',
    statusReady: 'MANIFEST SIGNED',
    subtitle: 'Perceptual hash & C2PA seal',
    telemetry: 'SPREAD-SPECTRUM // PAYLOAD 256b',
    color: 'bg-[#EFD99C]',
    badgeBg: 'bg-[#111111] text-[#8BCF9B]',
    accentBorder: 'border-[#111111]'
  },
  {
    id: 'defense',
    title: 'ACTIVE COUNTERMEASURE',
    statusPending: 'ENCODING DEFENSE...',
    statusReady: 'CLOAK ENGAGED',
    subtitle: 'Poisoning perturbation shield',
    telemetry: 'ADVERSARIAL ε=0.015 // IMMUNITY HIGH',
    color: 'bg-[#F4CD3F]',
    badgeBg: 'bg-[#844469] text-[#EFD99C]',
    accentBorder: 'border-[#111111]'
  }
];

export function ArgosBootLoader({ 
  forceShow = false, 
  onComplete 
}: { 
  forceShow?: boolean; 
  onComplete?: () => void; 
}) {
  const [visible, setVisible] = useState(true);
  const [phase, setPhase] = useState<1 | 2 | 3 | 4 | 5>(1);
  const [cardReadyCount, setCardReadyCount] = useState(0);
  const [counter, setCounter] = useState(1048);
  const [hashChars, setHashChars] = useState('');
  const [isWipingOut, setIsWipingOut] = useState(false);

  const fullHash = "7f83b1657ff1fc53b92dc18148a1d65dfc2d4b1fa3d677284addd200126d9069";

  const finishBoot = () => {
    sessionStorage.setItem('argos_booted', 'true');
    setIsWipingOut(true);
    setTimeout(() => {
      setVisible(false);
      onComplete?.();
    }, 280);
  };

  useEffect(() => {
    // Check if motion is reduced
    if (typeof window !== 'undefined') {
      const mediaQuery = window.matchMedia('(prefers-reduced-motion: reduce)');
      if (mediaQuery.matches) {
        const timer = setTimeout(finishBoot, 180);
        return () => clearTimeout(timer);
      }
    }

    // Check session storage unless forced
    if (!forceShow && typeof window !== 'undefined') {
      const hasBooted = sessionStorage.getItem('argos_booted');
      if (hasBooted) {
        setVisible(false);
        onComplete?.();
        return;
      }
    }

    // Rapid counter in Phase 1
    const counterInterval = setInterval(() => {
      setCounter((prev) => (prev > 9500 ? 1048 : prev + Math.floor(Math.random() * 450 + 120)));
    }, 45);

    // Sequence Timers (Target ~2.0s total)
    // Phase 1 -> 2 at 0.38s
    const tPhase2 = setTimeout(() => {
      setPhase(2);
    }, 380);

    // Phase 2 -> 3 at 0.78s
    const tPhase3 = setTimeout(() => {
      setPhase(3);
    }, 780);

    // Cards activate sequentially during Phase 3 (0.8s -> 1.45s)
    const tCard1 = setTimeout(() => setCardReadyCount(1), 840);
    const tCard2 = setTimeout(() => setCardReadyCount(2), 980);
    const tCard3 = setTimeout(() => setCardReadyCount(3), 1120);
    const tCard4 = setTimeout(() => setCardReadyCount(4), 1260);
    const tCard5 = setTimeout(() => setCardReadyCount(5), 1400);

    // Phase 3 -> 4 at 1.48s (DNA Hash generation)
    const tPhase4 = setTimeout(() => {
      setPhase(4);
    }, 1480);

    // Phase 4 hash typewriter (1.48s - 1.88s)
    const hashInterval = setInterval(() => {
      setHashChars((prev) => {
        if (prev.length >= fullHash.length) return prev;
        return fullHash.slice(0, prev.length + 4);
      });
    }, 25);

    // Phase 4 -> 5 at 1.88s (Final locked snap & power burst)
    const tPhase5 = setTimeout(() => {
      setPhase(5);
    }, 1880);

    // Complete at 2.18s
    const tEnd = setTimeout(() => {
      finishBoot();
    }, 2180);

    // Keyboard listener for ESC key to skip boot
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        finishBoot();
      }
    };
    window.addEventListener('keydown', handleKeyDown);

    return () => {
      clearInterval(counterInterval);
      clearInterval(hashInterval);
      clearTimeout(tPhase2);
      clearTimeout(tPhase3);
      clearTimeout(tCard1);
      clearTimeout(tCard2);
      clearTimeout(tCard3);
      clearTimeout(tCard4);
      clearTimeout(tCard5);
      clearTimeout(tPhase4);
      clearTimeout(tPhase5);
      clearTimeout(tEnd);
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [forceShow]);

  if (!visible) return null;

  return (
    <div 
      className={`fixed inset-0 z-9999 bg-[#F8E8E8] text-[#111111] font-mono flex flex-col justify-between p-4 sm:p-6 select-none overflow-hidden transition-all duration-300 ${
        isWipingOut ? 'opacity-0 scale-[1.02] filter blur-xs pointer-events-none' : 'opacity-100'
      }`}
      style={{
        backgroundImage: 'radial-gradient(#111111 1px, transparent 1px)',
        backgroundSize: '24px 24px',
      }}
    >
      {/* CRT Scanlines Overlay */}
      <div className="absolute inset-0 pointer-events-none z-10 crt-scanlines opacity-55" />

      {/* Floating Pixel Particles */}
      <div className="absolute inset-0 pointer-events-none overflow-hidden z-5">
        <div className="absolute top-[20%] left-[15%] w-3 h-3 bg-[#F4CD3F] border border-[#111111] animate-bounce" style={{ animationDuration: '3s' }} />
        <div className="absolute top-[75%] left-[25%] w-2 h-2 bg-[#844469] border border-[#111111] animate-pulse" />
        <div className="absolute top-[30%] right-[20%] w-3 h-3 bg-[#8BCF9B] border border-[#111111] animate-bounce" style={{ animationDuration: '2.5s' }} />
        <div className="absolute top-[65%] right-[12%] w-2.5 h-2.5 bg-[#D95D5D] border border-[#111111] animate-ping" style={{ animationDuration: '4s' }} />
      </div>

      {/* ================================================================ */}
      {/* TOP STATUS BAR                                                   */}
      {/* ================================================================ */}
      <header className="relative z-20 flex flex-wrap items-center justify-between border-b-[3px] border-[#111111] pb-3 bg-[#F8E8E8]/90 backdrop-blur-sm gap-2">
        <div className="flex items-center gap-3">
          <div className="px-2.5 py-1 bg-[#111111] text-[#F4CD3F] text-xs font-black tracking-widest border-[2px] border-[#111111] flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-[#8BCF9B] led-blink-fast" />
            ARGOS FORENSIC BIOS
          </div>
          <span className="text-[11px] font-bold text-[#844469] hidden sm:inline">
            CORE_V3.4 // KERNEL 0x{counter.toString(16).toUpperCase()}
          </span>
        </div>

        <div className="flex items-center gap-3 text-xs">
          <div className="hidden md:flex items-center gap-2 px-2 py-0.5 bg-[#EFD99C] border-[2px] border-[#111111] font-bold text-[11px]">
            <span>TELEMETRY:</span>
            <span className="text-[#844469]">{counter} FLOPS/s</span>
          </div>

          <button
            onClick={finishBoot}
            className="px-2.5 py-1 bg-white hover:bg-[#F6C6D8] text-[#111111] border-[2px] border-[#111111] brutal-shadow-sm text-[10px] sm:text-xs font-black tracking-wider transition-all"
            title="Press Escape to skip loading sequence"
          >
            [ESC / CLICK TO SKIP]
          </button>
        </div>
      </header>

      {/* ================================================================ */}
      {/* CENTER COCKPIT & 5 RADAR CARDS                                  */}
      {/* ================================================================ */}
      <main className="relative z-20 flex-1 flex flex-col items-center justify-center my-4 sm:my-6">
        
        {/* DESKTOP 5-CARD SURROUND RADAR LAYOUT (Hidden on mobile) */}
        <div className="hidden lg:grid grid-cols-12 gap-4 w-full max-w-6xl items-center">
          
          {/* LEFT 2 CARDS */}
          <div className="col-span-3 space-y-4">
            {MODULE_CARDS.slice(0, 2).map((card, idx) => {
              const isReady = cardReadyCount > idx;
              return (
                <div
                  key={card.id}
                  className={`border-[3px] border-[#111111] p-3 ${card.color} brutal-shadow transition-all duration-300 ${
                    phase >= 3 ? 'opacity-100 translate-x-0' : 'opacity-40 -translate-x-4'
                  }`}
                >
                  <div className="flex items-center justify-between pb-1.5 border-b border-[#111111]/20">
                    <span className="text-[11px] font-black tracking-tight">{card.title}</span>
                    <span className={`text-[9px] font-bold px-1.5 py-0.5 border border-[#111111] ${
                      isReady ? 'bg-[#8BCF9B] text-[#111111]' : card.badgeBg
                    }`}>
                      {isReady ? '✓ READY' : card.statusPending}
                    </span>
                  </div>
                  <div className="text-[10px] text-[#111111]/75 mt-1 font-sans font-medium">{card.subtitle}</div>
                  <div className="text-[9px] text-[#844469] font-mono font-bold mt-1.5 bg-white/70 px-1.5 py-0.5 border border-[#111111]/30 truncate">
                    {card.telemetry}
                  </div>
                </div>
              );
            })}
          </div>

          {/* CENTER SHIELD & EYE LOGO */}
          <div className="col-span-6 flex flex-col items-center justify-center text-center px-4">
            
            {/* Center Eye Emblem */}
            <div className={`relative transition-transform duration-300 ${
              phase >= 5 ? 'scale-105' : phase >= 2 ? 'scale-100' : 'scale-95'
            }`}>
              <ArgosShieldEye
                size={220}
                stage={phase}
                isLocked={phase >= 5}
                showRadar={phase >= 2}
                showLaser={phase >= 2 && phase < 5}
              />
            </div>

            {/* Status Message Below Logo */}
            <div className="mt-5 min-h-[58px] flex flex-col items-center justify-center">
              {phase === 1 && (
                <div className="inline-flex items-center gap-2 px-3 py-1 bg-[#111111] text-[#EFD99C] border-[2px] border-[#111111] text-xs font-bold uppercase">
                  <span className="w-2 h-2 rounded-full bg-[#D95D5D] led-blink-fast" />
                  PHASE 1: SYSTEM BOOT // CYCLING CODES
                </div>
              )}

              {phase === 2 && (
                <div className="inline-flex items-center gap-2 px-3 py-1 bg-[#844469] text-white border-[2px] border-[#111111] text-xs font-bold uppercase tracking-wider animate-pulse">
                  <Eye className="w-3.5 h-3.5 text-[#F4CD3F]" />
                  INITIALIZING FORENSIC MATRIX...
                </div>
              )}

              {phase === 3 && (
                <div className="inline-flex items-center gap-2 px-3 py-1 bg-[#EFD99C] text-[#111111] border-[2px] border-[#111111] text-xs font-black uppercase tracking-wider">
                  <Activity className="w-3.5 h-3.5 text-[#844469] animate-spin" />
                  CALIBRATING 5 FORENSIC MODULES ({cardReadyCount}/5)
                </div>
              )}

              {phase === 4 && (
                <div className="space-y-1.5 flex flex-col items-center">
                  <div className="inline-flex items-center gap-2 px-3 py-1 bg-[#8BCF9B] text-[#111111] border-[2px] border-[#111111] text-xs font-black uppercase brutal-shadow-sm">
                    <Check className="w-4 h-4 stroke-[3]" />
                    IDENTITY VERIFIED // MEDIA DNA ANCHORED
                  </div>
                  <div className="text-[10px] text-[#844469] font-mono font-bold max-w-sm truncate bg-white px-2 py-0.5 border border-[#111111]">
                    SHA256: {hashChars}
                  </div>
                </div>
              )}

              {phase >= 5 && (
                <div className="space-y-2 flex flex-col items-center animate-in zoom-in-95 duration-200">
                  <div className="text-2xl font-black font-display uppercase tracking-tight text-[#111111]">
                    ARGOS<span className="text-[#844469]">.AI</span> // ACTIVE
                  </div>
                  <div className="text-xs font-black tracking-widest text-[#111111] bg-[#F4CD3F] px-3 py-1 border-[2px] border-[#111111] brutal-shadow-sm">
                    PROTECT • DETECT • VERIFY • RESPOND
                  </div>
                </div>
              )}
            </div>

          </div>

          {/* RIGHT 3 CARDS */}
          <div className="col-span-3 space-y-4">
            {MODULE_CARDS.slice(2, 5).map((card, idx) => {
              const isReady = cardReadyCount > idx + 2;
              return (
                <div
                  key={card.id}
                  className={`border-[3px] border-[#111111] p-3 ${card.color} brutal-shadow transition-all duration-300 ${
                    phase >= 3 ? 'opacity-100 translate-x-0' : 'opacity-40 translate-x-4'
                  }`}
                >
                  <div className="flex items-center justify-between pb-1.5 border-b border-[#111111]/20">
                    <span className="text-[11px] font-black tracking-tight">{card.title}</span>
                    <span className={`text-[9px] font-bold px-1.5 py-0.5 border border-[#111111] ${
                      isReady ? 'bg-[#8BCF9B] text-[#111111]' : card.badgeBg
                    }`}>
                      {isReady ? '✓ READY' : card.statusPending}
                    </span>
                  </div>
                  <div className="text-[10px] text-[#111111]/75 mt-1 font-sans font-medium">{card.subtitle}</div>
                  <div className="text-[9px] text-[#844469] font-mono font-bold mt-1.5 bg-white/70 px-1.5 py-0.5 border border-[#111111]/30 truncate">
                    {card.telemetry}
                  </div>
                </div>
              );
            })}
          </div>

        </div>

        {/* MOBILE & TABLET LAYOUT (Stacked & Responsive Ticker) */}
        <div className="lg:hidden flex flex-col items-center w-full max-w-md space-y-4">
          
          <ArgosShieldEye
            size={160}
            stage={phase}
            isLocked={phase >= 5}
            showRadar={phase >= 2}
            showLaser={phase >= 2 && phase < 5}
          />

          <div className="min-h-[50px] text-center flex flex-col items-center justify-center">
            {phase < 4 ? (
              <div className="inline-flex items-center gap-2 px-3 py-1 bg-[#111111] text-[#F4CD3F] text-xs font-bold uppercase border-[2px] border-[#111111]">
                <Activity className="w-3.5 h-3.5 animate-spin" />
                INITIALIZING FORENSIC MATRIX ({cardReadyCount}/5)
              </div>
            ) : phase === 4 ? (
              <div className="inline-flex items-center gap-2 px-3 py-1 bg-[#8BCF9B] text-[#111111] text-xs font-black uppercase border-[2px] border-[#111111]">
                <Check className="w-4 h-4 stroke-[3]" />
                IDENTITY VERIFIED // DNA ANCHORED
              </div>
            ) : (
              <div className="space-y-1">
                <div className="text-xl font-black font-display uppercase tracking-tight text-[#111111]">
                  ARGOS<span className="text-[#844469]">.AI</span>
                </div>
                <div className="text-[11px] font-black tracking-widest text-[#111111] bg-[#F4CD3F] px-2 py-0.5 border border-[#111111]">
                  PROTECT • DETECT • RESPOND
                </div>
              </div>
            )}
          </div>

          {/* Condensed Mobile Module Ticker */}
          <div className="w-full bg-white border-[3px] border-[#111111] p-3 brutal-shadow space-y-1.5 text-xs">
            <div className="text-[10px] font-bold text-gray-500 uppercase tracking-widest pb-1 border-b border-gray-200 flex justify-between">
              <span>SYSTEM MODULES</span>
              <span className="text-[#844469] font-mono">{cardReadyCount}/5 ACTIVE</span>
            </div>
            {MODULE_CARDS.map((card, idx) => (
              <div key={card.id} className="flex items-center justify-between text-[11px] font-mono">
                <span className="text-[#111111] font-semibold">{card.title}</span>
                <span className={`font-bold ${cardReadyCount > idx ? 'text-[#8BCF9B]' : 'text-gray-400'}`}>
                  {cardReadyCount > idx ? '[✓ READY]' : '[PENDING]'}
                </span>
              </div>
            ))}
          </div>

        </div>

      </main>

      {/* ================================================================ */}
      {/* BOTTOM PROGRESS MATRIX                                           */}
      {/* ================================================================ */}
      <footer className="relative z-20 pt-3 border-t-[3px] border-[#111111] bg-[#F8E8E8]/90 backdrop-blur-sm flex flex-col gap-2">
        <div className="flex items-center justify-between text-[11px] font-bold">
          <span className="text-[#844469] flex items-center gap-2">
            <Lock className="w-3.5 h-3.5" />
            C2PA STANDARDS COMPLIANT // SPREAD-SPECTRUM COGNITIVE WATERMARKING
          </span>
          <span className="text-[#111111] font-mono">
            PHASE {phase}/5 [{(phase * 20)}%]
          </span>
        </div>

        {/* Multi-segment Brutalist Progress Bar */}
        <div className="grid grid-cols-5 gap-1.5 h-3">
          {[1, 2, 3, 4, 5].map((seg) => (
            <div
              key={seg}
              className={`border-[2px] border-[#111111] transition-colors duration-200 ${
                phase >= seg 
                  ? seg === 5 ? 'bg-[#8BCF9B]' : 'bg-[#F4CD3F]' 
                  : 'bg-white/60'
              }`}
            />
          ))}
        </div>
      </footer>
    </div>
  );
}

// ============================================================================
// 3. FAST PAGE-TRANSITION LOADER (variant="page")
// ============================================================================
export function ArgosPageLoader({ 
  message = "SWITCHING FORENSIC MODULE...",
  onComplete 
}: { 
  message?: string;
  onComplete?: () => void;
}) {
  const [visible, setVisible] = useState(true);

  useEffect(() => {
    const timer = setTimeout(() => {
      setVisible(false);
      onComplete?.();
    }, 360);
    return () => clearTimeout(timer);
  }, [onComplete]);

  if (!visible) return null;

  return (
    <div className="fixed inset-0 z-9999 bg-[#F8E8E8]/95 backdrop-blur-xs flex items-center justify-center p-4 crt-scanlines select-none pointer-events-none animate-in fade-in duration-100">
      <div className="bg-[#EFD99C] border-[3px] border-[#111111] p-4 brutal-shadow-lg flex items-center gap-4 font-mono">
        <div className="w-10 h-10 bg-[#F4CD3F] border-[2px] border-[#111111] flex items-center justify-center">
          <ArgosShieldEye size={30} stage={3} isLocked={false} showRadar={false} showLaser={false} />
        </div>
        <div>
          <div className="text-xs font-black uppercase text-[#111111] tracking-wider flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-[#844469] led-blink-fast" />
            {message}
          </div>
          <div className="text-[10px] text-[#844469] font-bold mt-0.5">
            CALIBRATING FORENSIC SPECTRAL CHANNELS...
          </div>
        </div>
      </div>
    </div>
  );
}

// ============================================================================
// 4. FORENSIC ENGINE ANALYSIS LOADER (variant="analysis")
// ============================================================================
export function ArgosAnalysisLoader({
  targetName = "camera_raw_keynote_master_4k.mp4",
  duration = 2000,
  onComplete,
  onClose
}: {
  targetName?: string;
  duration?: number;
  onComplete?: () => void;
  onClose?: () => void;
}) {
  const [frame, setFrame] = useState(1);
  const [totalFrames] = useState(620);
  const [confidence, setConfidence] = useState(88.4);
  const [stepIndex, setStepIndex] = useState(0);

  // Oscillating face bounding box coords
  const [boxCoords, setBoxCoords] = useState({ x: 135, y: 88, w: 220, h: 250 });

  useEffect(() => {
    // Frame incrementer
    const frameTimer = setInterval(() => {
      setFrame((prev) => {
        if (prev >= totalFrames) return totalFrames;
        return prev + Math.floor(Math.random() * 22 + 8);
      });
    }, 40);

    // Bounding box jitter to simulate realistic face tracking
    const boxTimer = setInterval(() => {
      setBoxCoords({
        x: 135 + Math.floor((Math.random() - 0.5) * 8),
        y: 88 + Math.floor((Math.random() - 0.5) * 6),
        w: 220 + Math.floor((Math.random() - 0.5) * 4),
        h: 250 + Math.floor((Math.random() - 0.5) * 6),
      });
      setConfidence((prev) => {
        const delta = (Math.random() - 0.48) * 3.5;
        return Math.min(99.4, Math.max(72.0, +(prev + delta).toFixed(1)));
      });
    }, 70);

    // Parallel checklist progression
    const s1 = setTimeout(() => setStepIndex(1), duration * 0.25);
    const s2 = setTimeout(() => setStepIndex(2), duration * 0.5);
    const s3 = setTimeout(() => setStepIndex(3), duration * 0.75);
    const s4 = setTimeout(() => setStepIndex(4), duration * 0.95);

    const endTimer = setTimeout(() => {
      onComplete?.();
    }, duration);

    return () => {
      clearInterval(frameTimer);
      clearInterval(boxTimer);
      clearTimeout(s1);
      clearTimeout(s2);
      clearTimeout(s3);
      clearTimeout(s4);
      clearTimeout(endTimer);
    };
  }, [duration, onComplete, totalFrames]);

  const tests = [
    {
      name: 'Sensor PRNU Noise Floor',
      pending: 'EXTRACTING SENSOR NOISE...',
      done: 'PRNU PROFILE: NOMINAL (98.4%)',
      status: stepIndex >= 1 ? 'PASS' : 'CALC',
      color: stepIndex >= 1 ? 'text-[#8BCF9B]' : 'text-[#EFD99C]'
    },
    {
      name: 'Diffusion Pattern Anomaly',
      pending: 'CHECKING LATENT FREQUENCIES...',
      done: 'NO DIFFUSION RESIDUE DETECTED',
      status: stepIndex >= 2 ? 'PASS' : 'CALC',
      color: stepIndex >= 2 ? 'text-[#8BCF9B]' : 'text-[#EFD99C]'
    },
    {
      name: 'Lip Sync Latency (±12ms)',
      pending: 'CROSS-CORRELATING VISEMES...',
      done: 'SYNCHRONIZED: +1.8ms OFFSET',
      status: stepIndex >= 3 ? 'PASS' : 'CALC',
      color: stepIndex >= 3 ? 'text-[#8BCF9B]' : 'text-[#EFD99C]'
    },
    {
      name: 'Spatial Frequency Decay',
      pending: 'FFT 2D AZIMUTHAL INTEGRAL...',
      done: 'ORGANIC POWER DECAY LAW: VALID',
      status: stepIndex >= 4 ? 'PASS' : 'CALC',
      color: stepIndex >= 4 ? 'text-[#8BCF9B]' : 'text-[#EFD99C]'
    }
  ];

  return (
    <div className="fixed inset-0 z-9999 bg-[#111111]/90 backdrop-blur-md flex items-center justify-center p-4 sm:p-6 select-none crt-scanlines">
      <div className="bg-[#1A1A1A] border-[4px] border-[#F4CD3F] text-[#EFD99C] font-mono max-w-4xl w-full brutal-shadow-xl overflow-hidden flex flex-col">
        
        {/* Header Bar */}
        <div className="flex items-center justify-between p-3.5 bg-[#111111] border-b-[3px] border-[#F4CD3F]">
          <div className="flex items-center gap-3">
            <div className="w-7 h-7 bg-[#F4CD3F] text-[#111111] flex items-center justify-center font-black text-xs border border-[#111111]">
              A
            </div>
            <div>
              <div className="text-xs font-black uppercase text-white tracking-wider flex items-center gap-2">
                <span>ARGOS DEEP FORENSIC ENGINE</span>
                <span className="text-[10px] px-1.5 py-0.2 bg-[#844469] text-[#EFD99C] font-bold">
                  MULTI-MODEL v3.4
                </span>
              </div>
              <div className="text-[10px] text-[#EFD99C]/70 truncate max-w-md">
                TARGET: <span className="text-white font-bold">{targetName}</span>
              </div>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <span className="text-xs font-bold text-[#F4CD3F] animate-pulse hidden sm:inline">
              LIVE SENSOR TELEMETRY
            </span>
            {onClose && (
              <button 
                onClick={onClose}
                className="w-7 h-7 border border-[#EFD99C]/40 hover:bg-[#D95D5D] hover:text-white flex items-center justify-center text-xs transition-colors cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            )}
          </div>
        </div>

        {/* Main Body: Viewport (Left) + Checklists (Right) */}
        <div className="grid grid-cols-1 md:grid-cols-12 gap-0 border-b-[3px] border-[#F4CD3F]">
          
          {/* SIMULATED VIDEO FRAME & FACE TRACKING VIEWPORT (Left 7 Cols) */}
          <div className="md:col-span-7 bg-[#0d0d0d] p-4 relative min-h-[300px] flex flex-col justify-between border-b md:border-b-0 md:border-r border-white/15">
            
            {/* Viewfinder Reticle Corners */}
            <div className="absolute top-2 left-2 w-4 h-4 border-t-2 border-l-2 border-[#F4CD3F]" />
            <div className="absolute top-2 right-2 w-4 h-4 border-t-2 border-r-2 border-[#F4CD3F]" />
            <div className="absolute bottom-2 left-2 w-4 h-4 border-b-2 border-l-2 border-[#F4CD3F]" />
            <div className="absolute bottom-2 right-2 w-4 h-4 border-b-2 border-r-2 border-[#F4CD3F]" />

            {/* Top Viewfinder Metadata */}
            <div className="flex items-center justify-between text-[10px] text-[#EFD99C]/80 z-10">
              <span className="flex items-center gap-1.5 text-[#D95D5D] font-bold">
                <span className="w-2 h-2 rounded-full bg-[#D95D5D] led-blink-fast" />
                REC FORENSIC STREAM
              </span>
              <span>ISO 800 // 1/50s // 24.000 FPS</span>
            </div>

            {/* Center: Face Bounding Box & Viseme Mesh */}
            <div className="relative w-full h-[190px] flex items-center justify-center overflow-hidden my-2">
              
              {/* Wireframe Face Silhouette */}
              <svg viewBox="0 0 300 200" className="w-full h-full opacity-60">
                {/* Synthetic grid lines */}
                <line x1="20" y1="100" x2="280" y2="100" stroke="#844469" strokeWidth="0.5" strokeDasharray="4 4" />
                <line x1="150" y1="20" x2="150" y2="180" stroke="#844469" strokeWidth="0.5" strokeDasharray="4 4" />

                {/* Face Oval Mesh Outline */}
                <ellipse cx="150" cy="95" rx="55" ry="70" fill="none" stroke="#EFD99C" strokeWidth="1.5" strokeDasharray="2 2" />

                {/* Eyes reticles */}
                <circle cx="130" cy="80" r="6" stroke="#8BCF9B" strokeWidth="1.5" fill="none" />
                <circle cx="170" cy="80" r="6" stroke="#8BCF9B" strokeWidth="1.5" fill="none" />

                {/* Nose bridge */}
                <path d="M150 82V105L145 110H155" stroke="#EFD99C" strokeWidth="1" fill="none" />

                {/* Mouth Mesh / Viseme Polygon (oscillates) */}
                <polygon 
                  points={`135,130 150,${126 + (frame % 5)} 165,130 155,${136 + (frame % 4)} 145,${136 + (frame % 4)}`}
                  fill="none" 
                  stroke="#F4CD3F" 
                  strokeWidth="2" 
                />
              </svg>

              {/* Dynamic Animated Face Bounding Box */}
              <div 
                className="absolute border-2 border-[#8BCF9B] transition-all duration-75 pointer-events-none"
                style={{
                  width: '58%',
                  height: '75%',
                }}
              >
                {/* Corner crosshairs */}
                <div className="absolute -top-1.5 -left-1.5 w-3 h-3 border-t-2 border-l-2 border-[#8BCF9B]" />
                <div className="absolute -top-1.5 -right-1.5 w-3 h-3 border-t-2 border-r-2 border-[#8BCF9B]" />
                <div className="absolute -bottom-1.5 -left-1.5 w-3 h-3 border-b-2 border-l-2 border-[#8BCF9B]" />
                <div className="absolute -bottom-1.5 -right-1.5 w-3 h-3 border-b-2 border-r-2 border-[#8BCF9B]" />

                {/* Box tag */}
                <div className="absolute -top-5 left-0 bg-[#8BCF9B] text-[#111111] px-1 py-0.2 text-[9px] font-black uppercase">
                  FACE_01 [CONF: {(confidence / 100).toFixed(3)}]
                </div>
              </div>

            </div>

            {/* Bottom: Simulated Audio Waveform Visualizer */}
            <div className="pt-2 border-t border-white/10 z-10">
              <div className="flex items-center justify-between text-[10px] mb-1">
                <span className="flex items-center gap-1.5 text-xs text-[#EFD99C]">
                  <Volume2 className="w-3.5 h-3.5 text-[#F4CD3F]" />
                  AUDIO VISUAL VISEME SPECTRUM
                </span>
                <span className="text-[#8BCF9B] font-bold">48.0 kHz 24-BIT</span>
              </div>
              <div className="h-6 flex items-end gap-0.5 bg-black/40 p-1 border border-white/10">
                {Array.from({ length: 48 }).map((_, i) => {
                  const heightPct = Math.min(100, Math.max(15, Math.sin((i + frame) * 0.45) * 45 + Math.cos(i * 0.2) * 35 + 20));
                  return (
                    <div
                      key={i}
                      className="flex-1 bg-[#F4CD3F] transition-all duration-75"
                      style={{ height: `${heightPct}%` }}
                    />
                  );
                })}
              </div>
            </div>

          </div>

          {/* PARALLEL CHECKLIST & CONFIDENCE (Right 5 Cols) */}
          <div className="md:col-span-5 p-4 flex flex-col justify-between bg-[#151515] space-y-4">
            
            <div>
              <div className="text-[11px] font-bold text-white uppercase tracking-wider mb-2 flex items-center justify-between border-b border-white/10 pb-1.5">
                <span>PARALLEL FORENSIC PIPELINE</span>
                <span className="text-[#F4CD3F]">{stepIndex}/4 COMPLETE</span>
              </div>

              {/* 4 Tests */}
              <div className="space-y-2.5 mt-3">
                {tests.map((test, idx) => {
                  const isDone = stepIndex > idx;
                  return (
                    <div 
                      key={test.name}
                      className={`p-2 border border-white/15 bg-black/30 transition-all ${
                        isDone ? 'border-[#8BCF9B]/50' : 'border-white/10'
                      }`}
                    >
                      <div className="flex items-center justify-between text-[10px] font-bold">
                        <span className="text-white flex items-center gap-1.5">
                          <span className={`w-1.5 h-1.5 rounded-full ${isDone ? 'bg-[#8BCF9B]' : 'bg-[#F4CD3F] led-blink-fast'}`} />
                          {test.name}
                        </span>
                        <span className={`text-[9px] px-1 py-0.2 border ${
                          isDone 
                            ? 'bg-[#8BCF9B]/20 text-[#8BCF9B] border-[#8BCF9B]/40' 
                            : 'bg-white/5 text-[#EFD99C] border-white/20'
                        }`}>
                          {test.status}
                        </span>
                      </div>
                      <div className={`text-[10px] mt-1 font-mono ${test.color} truncate`}>
                        {isDone ? test.done : test.pending}
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Confidence Score Gauge */}
            <div className="p-3 bg-[#1f1622] border-[2px] border-[#844469]">
              <div className="flex items-center justify-between text-[11px] text-[#EFD99C] font-bold mb-1">
                <span>CONVERGING CONFIDENCE SCORE:</span>
                <span className="text-[#8BCF9B] font-mono text-sm font-black">{confidence}%</span>
              </div>
              <div className="w-full bg-white/10 h-2 border border-white/20 overflow-hidden">
                <div 
                  className="h-full bg-gradient-to-r from-[#F4CD3F] to-[#8BCF9B] transition-all duration-100"
                  style={{ width: `${confidence}%` }}
                />
              </div>
            </div>

          </div>

        </div>

        {/* Footer Bar: Frame Count & Time Elapsed */}
        <div className="p-3 bg-[#111111] flex flex-wrap items-center justify-between text-xs font-bold gap-2">
          <div className="flex items-center gap-3">
            <span className="text-[#F4CD3F] flex items-center gap-1.5">
              <Activity className="w-3.5 h-3.5 animate-spin" />
              ANALYZING FRAME: <span className="text-white font-mono">{frame} / {totalFrames}</span>
            </span>
            <span className="text-white/40 hidden sm:inline">|</span>
            <span className="text-[#EFD99C]/70 text-[11px] hidden sm:inline">
              PROCESSED BY 8 FORENSIC SUBMODELS
            </span>
          </div>

          <div className="text-[11px] text-[#8BCF9B] font-mono font-bold">
            PROGRESS: {Math.min(100, Math.floor((frame / totalFrames) * 100))}%
          </div>
        </div>

      </div>
    </div>
  );
}

// ============================================================================
// 5. DEFAULT EXPORT (SWITCHER COMPONENT)
// ============================================================================
export default function ArgosLoader({
  variant = 'initial',
  forceShow = false,
  onComplete,
  message,
  targetName,
  onClose,
  duration,
}: ArgosLoaderProps) {
  if (variant === 'page') {
    return <ArgosPageLoader message={message} onComplete={onComplete} />;
  }

  if (variant === 'analysis') {
    return (
      <ArgosAnalysisLoader
        targetName={targetName}
        duration={duration}
        onComplete={onComplete}
        onClose={onClose}
      />
    );
  }

  return <ArgosBootLoader forceShow={forceShow} onComplete={onComplete} />;
}
