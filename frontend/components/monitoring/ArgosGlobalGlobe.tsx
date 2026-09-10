'use client';

import React, { useState, useEffect, useRef, useMemo, useCallback } from 'react';
import Globe, { GlobeMethods } from 'react-globe.gl';
import { 
  DEMO_TELEMETRY_REGIONS, 
  DEMO_DERIVATIVE_ARCS, 
  TelemetryRegion, 
  MONITORING_DISCLAIMER 
} from '@/lib/monitoringData';
import { Shield, Radio, Activity, Eye, AlertTriangle, Compass, RefreshCw, ZoomIn, ZoomOut } from 'lucide-react';

export interface ArgosGlobalGlobeProps {
  selectedRegion?: string;
  onSelectRegion?: (regionName: string) => void;
  highlightedDetectionId?: string;
  className?: string;
}

export default function ArgosGlobalGlobe({
  selectedRegion = 'All',
  onSelectRegion,
  highlightedDetectionId,
  className = ''
}: ArgosGlobalGlobeProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const globeEl = useRef<GlobeMethods | undefined>(undefined);
  
  const [dimensions, setDimensions] = useState({ width: 600, height: 500 });
  const [countries, setCountries] = useState<any[]>([]);
  const [hoveredRegion, setHoveredRegion] = useState<TelemetryRegion | null>(null);
  const [isAutoRotating, setIsAutoRotating] = useState(true);
  const [globeReady, setGlobeReady] = useState(false);

  // ResizeObserver for rock-solid responsive sizing without distortion or layout shift
  useEffect(() => {
    if (!containerRef.current) return;
    const updateSize = () => {
      if (containerRef.current) {
        const { clientWidth, clientHeight } = containerRef.current;
        setDimensions({
          width: clientWidth || 600,
          height: clientHeight || 500
        });
      }
    };

    updateSize();
    const observer = new ResizeObserver(updateSize);
    observer.observe(containerRef.current);
    return () => observer.disconnect();
  }, []);

  // Load offline countries GeoJSON dataset
  useEffect(() => {
    fetch('/data/ne_110m_countries.json')
      .then((res) => res.json())
      .then((data) => {
        if (data && data.features) {
          setCountries(data.features);
        }
      })
      .catch((err) => {
        console.warn('Could not load offline countries GeoJSON:', err);
      });
  }, []);

  // Configure initial Three.js controls once globe is ready
  useEffect(() => {
    if (globeEl.current) {
      const controls = globeEl.current.controls();
      if (controls) {
        controls.autoRotate = isAutoRotating;
        controls.autoRotateSpeed = 0.5;
        controls.enableZoom = true;
        controls.minDistance = 160;
        controls.maxDistance = 450;
      }
      setGlobeReady(true);
    }
  }, [globeReady, isAutoRotating]);

  // Handle camera focus when selectedRegion changes
  useEffect(() => {
    if (!globeEl.current || !selectedRegion || selectedRegion === 'All') return;

    const targetRegion = DEMO_TELEMETRY_REGIONS.find(
      (r) => r.name.toLowerCase() === selectedRegion.toLowerCase()
    );

    if (targetRegion) {
      // Temporarily pause auto-rotate during focus
      const controls = globeEl.current.controls();
      if (controls) controls.autoRotate = false;
      setIsAutoRotating(false);

      globeEl.current.pointOfView(
        {
          lat: targetRegion.lat,
          lng: targetRegion.lng,
          altitude: 1.85
        },
        1400
      );

      // Resume auto-rotation after 6 seconds
      const timeout = setTimeout(() => {
        if (globeEl.current?.controls()) {
          globeEl.current.controls().autoRotate = true;
          setIsAutoRotating(true);
        }
      }, 6000);

      return () => clearTimeout(timeout);
    }
  }, [selectedRegion]);

  // Ring markers data: generates expanding radar pulse rings around active nodes
  const ringsData = useMemo(() => {
    return DEMO_TELEMETRY_REGIONS.map((reg) => ({
      lat: reg.lat,
      lng: reg.lng,
      risk: reg.risk,
      name: reg.name,
      isSelected: selectedRegion === reg.name,
      radius: reg.risk === 'high' ? 8 : reg.risk === 'medium' ? 6 : 4.5
    }));
  }, [selectedRegion]);

  // Points data for regional centroids
  const pointsData = useMemo(() => {
    return DEMO_TELEMETRY_REGIONS.map((reg) => ({
      lat: reg.lat,
      lng: reg.lng,
      name: reg.name,
      risk: reg.risk,
      size: selectedRegion === reg.name ? 1.4 : 0.9,
      color:
        reg.risk === 'high'
          ? '#D95D5D'
          : reg.risk === 'medium'
          ? '#F4CD3F'
          : '#8BCF9B'
    }));
  }, [selectedRegion]);

  // Labels for active regions ONLY: India, USA, UK, Singapore, Australia
  const labelsData = useMemo(() => {
    return DEMO_TELEMETRY_REGIONS.map((reg) => ({
      lat: reg.lat,
      lng: reg.lng,
      name: reg.name,
      risk: reg.risk,
      isSelected: selectedRegion === reg.name,
      text: `${reg.name.toUpperCase()} [${reg.risk === 'high' ? 'CRITICAL' : reg.risk === 'medium' ? 'WARN' : 'SECURE'}]`,
      color:
        reg.risk === 'high'
          ? '#D95D5D'
          : reg.risk === 'medium'
          ? '#F4CD3F'
          : '#8BCF9B'
    }));
  }, [selectedRegion]);

  // Arcs between regions representing detected derivative propagation
  const arcsData = useMemo(() => {
    return DEMO_DERIVATIVE_ARCS;
  }, []);

  const handleRegionClick = useCallback(
    (name: string) => {
      if (onSelectRegion) {
        onSelectRegion(name);
      }
    },
    [onSelectRegion]
  );

  const toggleAutoRotate = () => {
    if (globeEl.current) {
      const controls = globeEl.current.controls();
      if (controls) {
        const nextState = !isAutoRotating;
        controls.autoRotate = nextState;
        setIsAutoRotating(nextState);
      }
    }
  };

  const handleResetCamera = () => {
    if (globeEl.current) {
      globeEl.current.pointOfView({ lat: 20, lng: 20, altitude: 2.5 }, 1200);
      if (onSelectRegion) onSelectRegion('All');
    }
  };

  return (
    <div
      ref={containerRef}
      className={`relative w-full h-[540px] lg:h-[620px] bg-[#090d14] border-[3px] border-[#111111] brutal-shadow-lg overflow-hidden flex flex-col select-none font-mono ${className}`}
    >
      {/* Top Header Bar: Telemetry Status & Legend */}
      <div className="absolute top-0 inset-x-0 z-20 p-3 bg-black/85 backdrop-blur-md border-b border-white/20 flex flex-wrap items-center justify-between gap-3 text-xs">
        {/* Requirement 13: Live Status Indicator */}
        <div className="flex items-center gap-2 font-bold tracking-wider">
          <span className="w-2.5 h-2.5 rounded-full bg-[#8BCF9B] led-blink-fast" />
          <span className="text-[#8BCF9B] font-black">GLOBAL TELEMETRY ONLINE</span>
          <span className="text-white/40">|</span>
          <span className="text-[#F4CD3F] text-[11px] uppercase">5 REGIONS ACTIVE</span>
          <span className="hidden sm:inline-block px-1.5 py-0.2 bg-[#EFD99C] text-[#111111] text-[9px] font-black border border-[#111111]">
            DEMO / SIMULATED
          </span>
        </div>

        {/* Requirement 14: Legend */}
        <div className="flex items-center gap-3 text-[10px] font-bold">
          <div className="flex items-center gap-1 text-[#8BCF9B]">
            <span className="w-2 h-2 rounded-full bg-[#8BCF9B]" />
            <span>VERIFIED</span>
          </div>
          <div className="flex items-center gap-1 text-[#F4CD3F]">
            <span className="w-2 h-2 rounded-full bg-[#F4CD3F]" />
            <span>SUSPICIOUS</span>
          </div>
          <div className="flex items-center gap-1 text-[#D95D5D]">
            <span className="w-2 h-2 rounded-full bg-[#D95D5D] led-blink" />
            <span>HIGH RISK</span>
          </div>
        </div>
      </div>

      {/* Cyber Reticle Grid Coordinates */}
      <div className="absolute top-14 left-3 z-10 text-[9px] text-white/50 space-y-0.5 pointer-events-none hidden sm:block">
        <div>ORBIT: 22.4°N // 78.9°E</div>
        <div>SENSOR PRNU: LOCKED</div>
        <div>DERIVATIVE ARCS: ACTIVE</div>
      </div>

      {/* WebGL 3D Globe Viewport */}
      <div className="relative flex-1 w-full h-full cursor-grab active:cursor-grabbing overflow-hidden">
        <Globe
          ref={globeEl}
          width={dimensions.width}
          height={dimensions.height}
          backgroundColor="rgba(9, 13, 20, 0)"
          showAtmosphere={true}
          atmosphereColor="#EFD99C"
          atmosphereAltitude={0.14}
          // Country / Land Polygons (Dark forensic style with cream boundaries)
          polygonsData={countries}
          polygonCapColor={(feat: any) => {
            const countryName = feat?.properties?.ADMIN || feat?.properties?.NAME || '';
            const isMatch =
              selectedRegion !== 'All' &&
              countryName.toLowerCase().includes(selectedRegion.toLowerCase());
            if (isMatch) return 'rgba(244, 205, 63, 0.35)';
            return '#151d28';
          }}
          polygonSideColor={() => 'rgba(10, 14, 20, 0.7)'}
          polygonStrokeColor={(feat: any) => {
            const countryName = feat?.properties?.ADMIN || feat?.properties?.NAME || '';
            const isMatch =
              selectedRegion !== 'All' &&
              countryName.toLowerCase().includes(selectedRegion.toLowerCase());
            if (isMatch) return '#F4CD3F';
            return 'rgba(239, 217, 156, 0.22)';
          }}
          polygonAltitude={0.008}
          polygonCapCurvatureResolution={2}
          // Points Data for Centroids
          pointsData={pointsData}
          pointLat="lat"
          pointLng="lng"
          pointColor="color"
          pointAltitude={0.03}
          pointRadius="size"
          pointsMerge={false}
          onPointClick={(pt: any) => handleRegionClick(pt.name)}
          onPointHover={(pt: any) => {
            if (pt) {
              const reg = DEMO_TELEMETRY_REGIONS.find((r) => r.name === pt.name);
              setHoveredRegion(reg || null);
            } else {
              setHoveredRegion(null);
            }
          }}
          // Animated Pulsing Rings (Requirement 7)
          ringsData={ringsData}
          ringLat="lat"
          ringLng="lng"
          ringAltitude={0.02}
          ringColor={(d: any) => (t: number) => {
            const rgb =
              d.risk === 'high'
                ? '217, 93, 93'
                : d.risk === 'medium'
                ? '244, 205, 63'
                : '139, 207, 155';
            return `rgba(${rgb}, ${Math.max(0, 1 - t)})`;
          }}
          ringMaxRadius="radius"
          ringPropagationSpeed={(d: any) => (d.risk === 'high' ? 3.5 : 2.2)}
          ringRepeatPeriod={(d: any) => (d.risk === 'high' ? 1400 : 2200)}
          // Animated Arcs with Moving Particle Dashes (Requirement 8)
          arcsData={arcsData}
          arcStartLat="startLat"
          arcStartLng="startLng"
          arcEndLat="endLat"
          arcEndLng="endLng"
          arcColor="color"
          arcAltitude={0.28}
          arcStroke={1.8}
          arcDashLength={0.35}
          arcDashGap={0.25}
          arcDashInitialGap={(d: any) => (d.risk === 'high' ? 0 : 0.4)}
          arcDashAnimateTime={(d: any) => d.speed || 3000}
          // Active Region Labels (Requirement 9)
          labelsData={labelsData}
          labelLat="lat"
          labelLng="lng"
          labelText="text"
          labelSize={1.3}
          labelDotRadius={0.7}
          labelColor="color"
          labelResolution={2}
          labelAltitude={0.025}
          onLabelClick={(label: any) => handleRegionClick(label.name)}
          onLabelHover={(label: any) => {
            if (label) {
              const reg = DEMO_TELEMETRY_REGIONS.find((r) => r.name === label.name);
              setHoveredRegion(reg || null);
            } else {
              setHoveredRegion(null);
            }
          }}
        />

        {/* Subtle Forensic Scanline Overlay */}
        <div className="absolute inset-0 scanline-overlay pointer-events-none opacity-35" />

        {/* Corner Reticle Brackets (Y2K Cyberpunk) */}
        <div className="absolute top-14 right-3 w-4 h-4 border-t-2 border-r-2 border-[#EFD99C]/60 pointer-events-none" />
        <div className="absolute bottom-12 left-3 w-4 h-4 border-b-2 border-l-2 border-[#EFD99C]/60 pointer-events-none" />
        <div className="absolute bottom-12 right-3 w-4 h-4 border-b-2 border-r-2 border-[#EFD99C]/60 pointer-events-none" />

        {/* Requirement 10: Compact Hover Information HUD Tooltip */}
        {hoveredRegion && (
          <div className="absolute bottom-16 left-4 z-30 pointer-events-none max-w-xs p-3 bg-[#111111]/95 text-[#EFD99C] border-[2px] border-[#EFD99C] brutal-shadow-sm font-mono text-xs animate-in fade-in zoom-in-95">
            <div className="flex items-center justify-between pb-1 mb-2 border-b border-white/20 font-black">
              <span className="uppercase text-sm tracking-wider text-[#F4CD3F]">
                {hoveredRegion.name}
              </span>
              <span
                className={`text-[9px] px-1.5 py-0.2 uppercase font-bold text-white ${
                  hoveredRegion.risk === 'high'
                    ? 'bg-[#D95D5D]'
                    : hoveredRegion.risk === 'medium'
                    ? 'bg-[#F4CD3F] text-black'
                    : 'bg-[#8BCF9B] text-black'
                }`}
              >
                {hoveredRegion.risk} RISK
              </span>
            </div>

            <div className="space-y-1 text-[11px]">
              <div className="flex justify-between">
                <span className="text-white/60">Active nodes:</span>
                <span className="font-bold text-white">{hoveredRegion.activeNodes}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-white/60">Potential matches:</span>
                <span className="font-bold text-[#F4CD3F]">{hoveredRegion.potentialMatches}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-white/60">High-risk detections:</span>
                <span
                  className={`font-black ${
                    hoveredRegion.highRiskDetections > 0 ? 'text-[#D95D5D]' : 'text-[#8BCF9B]'
                  }`}
                >
                  {hoveredRegion.highRiskDetections}
                </span>
              </div>
            </div>

            <div className="mt-2 pt-1 border-t border-white/15 text-[9px] text-white/50 flex justify-between">
              <span>LAT/LNG: {hoveredRegion.lat.toFixed(2)}, {hoveredRegion.lng.toFixed(2)}</span>
              <span className="text-[#8BCF9B]">PING: {hoveredRegion.lastPing}</span>
            </div>
          </div>
        )}
      </div>

      {/* Bottom Controls Strip: Auto-Rotate Toggle, Reset View, Region Pills */}
      <div className="z-20 p-2.5 bg-black/90 border-t border-white/20 flex flex-wrap items-center justify-between gap-2 text-xs">
        {/* Quick Region Selector Pills */}
        <div className="flex flex-wrap items-center gap-1.5">
          <button
            type="button"
            onClick={() => handleRegionClick('All')}
            className={`px-2 py-1 text-[10px] font-bold border transition-colors ${
              selectedRegion === 'All'
                ? 'bg-[#F4CD3F] text-black border-[#111111]'
                : 'bg-[#18202c] text-white/80 border-white/20 hover:bg-white/10'
            }`}
          >
            ALL
          </button>
          {DEMO_TELEMETRY_REGIONS.map((reg) => {
            const isSelected = selectedRegion.toLowerCase() === reg.name.toLowerCase();
            return (
              <button
                key={reg.id}
                type="button"
                onClick={() => handleRegionClick(reg.name)}
                className={`px-2 py-1 text-[10px] font-bold border flex items-center gap-1 transition-colors ${
                  isSelected
                    ? 'bg-[#F4CD3F] text-black border-[#111111]'
                    : 'bg-[#18202c] text-white/80 border-white/20 hover:bg-white/10'
                }`}
              >
                <span
                  className={`w-1.5 h-1.5 rounded-full ${
                    reg.risk === 'high'
                      ? 'bg-[#D95D5D]'
                      : reg.risk === 'medium'
                      ? 'bg-[#F4CD3F]'
                      : 'bg-[#8BCF9B]'
                  }`}
                />
                <span>{reg.name}</span>
              </button>
            );
          })}
        </div>

        {/* Orbit & View Controls */}
        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={toggleAutoRotate}
            className={`px-2 py-1 text-[10px] font-bold border flex items-center gap-1 ${
              isAutoRotating
                ? 'bg-[#EFD99C] text-black border-[#111111]'
                : 'bg-[#18202c] text-white/70 border-white/20'
            }`}
            title="Toggle Auto Orbit"
          >
            <Compass className={`w-3 h-3 ${isAutoRotating ? 'animate-spin' : ''}`} />
            <span>{isAutoRotating ? 'ORBIT: ON' : 'ORBIT: PAUSED'}</span>
          </button>

          <button
            type="button"
            onClick={handleResetCamera}
            className="px-2 py-1 text-[10px] font-bold bg-[#18202c] hover:bg-white/10 text-white/80 border border-white/20 flex items-center gap-1"
            title="Reset Camera View"
          >
            <RefreshCw className="w-3 h-3" />
            <span className="hidden sm:inline">RESET VIEW</span>
          </button>
        </div>
      </div>

      {/* Scope Disclaimer Banner (Requirement 23) */}
      <div className="bg-[#111111] px-3 py-1 border-t border-white/10 text-[9px] text-white/60 flex items-center justify-between">
        <span>{MONITORING_DISCLAIMER}</span>
        <span className="text-[#F4CD3F] hidden md:inline">THREE.JS / WEBGL CORE // 60 FPS ACCELERATED</span>
      </div>
    </div>
  );
}
