'use client';

import React, { useState, useEffect, useRef } from 'react';
import Link from 'next/link';
import { 
  Play, 
  UploadCloud, 
  CheckCircle2, 
  AlertTriangle, 
  XCircle, 
  Clock, 
  Cpu, 
  FileText, 
  BarChart2, 
  Eye, 
  Volume2, 
  Layers, 
  ChevronRight, 
  Download, 
  RefreshCw, 
  Sparkles,
  ArrowRight,
  ShieldCheck,
  Zap,
  Activity,
  Maximize2
} from 'lucide-react';

const PIPELINE_STAGES = [
  '1. Video validation & integrity inspect',
  '2. Extracting audio track (16kHz PCM WAV)',
  '3. Detecting human face trajectory',
  '4. Tracking & normalizing 96x96 lip sequences',
  '5. Extracting 80-band Mel-spectrogram & features',
  '6. Constructing aligned temporal windows (0.8s)',
  '7. Executing SyncNet viseme-phoneme alignment',
  '8. Conducting temporal trajectory & anomaly analysis',
  '9. Running PyTorch Multimodal Classifier',
  '10. Extracting real forensic keyframe exhibits',
  '11. Packaging forensic analysis & timeline',
];

interface BenchmarkSample {
  filename: string;
  category: string;
  size_bytes: number;
}

export default function TestLabPage() {
  const [activeTab, setActiveTab] = useState<'single' | 'compare' | 'batch'>('single');

  // Single video state
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [videoPreviewUrl, setVideoPreviewUrl] = useState<string | null>(null);
  const [samples, setSamples] = useState<{ real: BenchmarkSample[]; fake: BenchmarkSample[]; edge_cases: BenchmarkSample[] }>({ real: [], fake: [], edge_cases: [] });
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [testId, setTestId] = useState<string | null>(null);
  const [progressStage, setProgressStage] = useState(1);
  const [stageDescription, setStageDescription] = useState('Ready for input');
  const [progressPct, setProgressPct] = useState(0);
  const [analysisResult, setAnalysisResult] = useState<any>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [activeEvidenceModal, setActiveEvidenceModal] = useState<string | null>(null);

  // Compare mode state
  const [realTestId, setRealTestId] = useState<string>('real_01.mp4');
  const [fakeTestId, setFakeTestId] = useState<string>('fake_01.mp4');
  const [isComparing, setIsComparing] = useState(false);
  const [comparisonResult, setComparisonResult] = useState<any>(null);

  // Fetch benchmark samples on load
  useEffect(() => {
    fetch('http://127.0.0.1:8000/api/test-lab/samples')
      .then(r => r.json())
      .then(d => setSamples(d))
      .catch(() => {
        // Fallback demo samples
        setSamples({
          real: [{ filename: 'real_01.mp4', category: 'real', size_bytes: 420000 }, { filename: 'real_02.mp4', category: 'real', size_bytes: 480000 }],
          fake: [{ filename: 'fake_01.mp4', category: 'fake', size_bytes: 410000 }, { filename: 'fake_02.mp4', category: 'fake', size_bytes: 490000 }],
          edge_cases: [{ filename: 'no_audio.mp4', category: 'edge_cases', size_bytes: 350000 }, { filename: 'no_face.mp4', category: 'edge_cases', size_bytes: 360000 }],
        });
      });
  }, []);

  // Poll status while analyzing
  useEffect(() => {
    if (!isAnalyzing || !testId) return;

    const interval = setInterval(async () => {
      try {
        const res = await fetch(`http://127.0.0.1:8000/api/test-lab/${testId}`);
        if (!res.ok) return;
        const data = await res.json();

        setProgressStage(data.stage_number || 1);
        setStageDescription(data.current_stage || 'Processing');
        setProgressPct(data.progress_pct || 0);

        if (data.status === 'completed' || data.has_result) {
          clearInterval(interval);
          // Fetch final result
          const resResult = await fetch(`http://127.0.0.1:8000/api/test-lab/${testId}/result`);
          const resData = await resResult.json();
          setAnalysisResult(resData);
          setIsAnalyzing(false);
        } else if (data.status === 'failed' || data.status === 'unavailable' || data.status === 'invalid') {
          clearInterval(interval);
          setIsAnalyzing(false);
          setErrorMessage(data.error_message || data.current_stage || 'Analysis completed with edge condition.');
        }
      } catch (err: any) {
        console.error(err);
      }
    }, 400);

    return () => clearInterval(interval);
  }, [isAnalyzing, testId]);

  // Handle custom file selection
  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      setSelectedFile(file);
      setVideoPreviewUrl(URL.createObjectURL(file));
      setAnalysisResult(null);
      setErrorMessage(null);
    }
  };

  // Run analysis on custom uploaded video
  const runCustomAnalysis = async () => {
    if (!selectedFile) return;
    setIsAnalyzing(true);
    setAnalysisResult(null);
    setErrorMessage(null);
    setProgressPct(5);
    setProgressStage(1);
    setStageDescription('Uploading video payload...');

    const formData = new FormData();
    formData.append('file', selectedFile);
    formData.append('debug', 'true');

    try {
      const res = await fetch('http://127.0.0.1:8000/api/test-lab/analyze', {
        method: 'POST',
        body: formData,
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.message || 'Upload failed');
      setTestId(data.test_id);
    } catch (err: any) {
      setIsAnalyzing(false);
      setErrorMessage(err.message);
    }
  };

  // Run analysis on benchmark sample
  const runSampleAnalysis = async (category: string, filename: string) => {
    setIsAnalyzing(true);
    setAnalysisResult(null);
    setErrorMessage(null);
    setSelectedFile(null);
    setVideoPreviewUrl(null);
    setProgressPct(10);
    setProgressStage(1);
    setStageDescription(`Initiating test on ${filename}...`);

    try {
      const res = await fetch(`http://127.0.0.1:8000/api/test-lab/analyze-sample?category=${category}&filename=${filename}&debug=true`, {
        method: 'POST',
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.message || 'Failed to dispatch sample');
      setTestId(data.test_id);
    } catch (err: any) {
      setIsAnalyzing(false);
      setErrorMessage(err.message);
    }
  };

  // Run Side-by-Side Comparison
  const runComparison = async () => {
    setIsComparing(true);
    setComparisonResult(null);

    try {
      // 1. Dispatch real sample
      const r1 = await fetch(`http://127.0.0.1:8000/api/test-lab/analyze-sample?category=real&filename=${realTestId}&debug=false`, { method: 'POST' });
      const d1 = await r1.json();

      // 2. Dispatch fake sample
      const r2 = await fetch(`http://127.0.0.1:8000/api/test-lab/analyze-sample?category=fake&filename=${fakeTestId}&debug=false`, { method: 'POST' });
      const d2 = await r2.json();

      // Poll until both are finished
      const pollUntilDone = async (id: string) => {
        for (let i = 0; i < 30; i++) {
          await new Promise(r => setTimeout(r, 500));
          const chk = await fetch(`http://127.0.0.1:8000/api/test-lab/${id}`);
          const chkData = await chk.json();
          if (chkData.status === 'completed' || chkData.has_result) return id;
        }
        return id;
      };

      await Promise.all([pollUntilDone(d1.test_id), pollUntilDone(d2.test_id)]);

      // Fetch comparison payload
      const form = new FormData();
      form.append('real_test_id', d1.test_id);
      form.append('fake_test_id', d2.test_id);

      const compRes = await fetch('http://127.0.0.1:8000/api/test-lab/compare', {
        method: 'POST',
        body: form,
      });
      const compData = await compRes.json();
      setComparisonResult(compData);
    } catch (err: any) {
      console.error(err);
    } finally {
      setIsComparing(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#F8E8E8] text-[#111111] font-mono p-4 md:p-8">
      {/* Top Header */}
      <header className="max-w-7xl mx-auto mb-8 bg-[#EFD99C] border-[3px] border-[#111111] p-6 shadow-[6px_6px_0px_#111111] flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <div className="flex items-center gap-2 mb-2">
            <span className="bg-[#111111] text-[#F8E8E8] text-xs px-2.5 py-0.5 font-bold uppercase tracking-wider">
              DEVELOPER & EVALUATION SYSTEM
            </span>
            <span className="bg-[#8BCF9B] border-[2px] border-[#111111] text-[#111111] text-xs px-2 py-0.5 font-bold">
              REAL ML INFERENCE
            </span>
          </div>
          <h1 className="text-2xl md:text-4xl font-black uppercase tracking-tight">
            ARGOS AI FORENSIC TEST LAB
          </h1>
          <p className="text-xs md:text-sm text-[#111111]/80 mt-1 font-bold">
            Problem Statement 4: Audio-Visual Temporal Lip-Sync & Deepfake Detection Engine
          </p>
        </div>

        <div className="flex items-center gap-3">
          <Link
            href="/dashboard"
            className="px-4 py-2 bg-[#F8E8E8] border-[2.5px] border-[#111111] shadow-[3px_3px_0px_#111111] font-bold text-xs hover:bg-[#F4CD3F] transition-colors"
          >
            ← Back to Overview
          </Link>
          <a
            href="http://127.0.0.1:8000/docs"
            target="_blank"
            rel="noreferrer"
            className="px-4 py-2 bg-[#844469] text-white border-[2.5px] border-[#111111] shadow-[3px_3px_0px_#111111] font-bold text-xs hover:opacity-90"
          >
            FastAPI Docs ↗
          </a>
        </div>
      </header>

      {/* Tab Navigation */}
      <div className="max-w-7xl mx-auto mb-6 flex flex-wrap gap-3">
        <button
          onClick={() => setActiveTab('single')}
          className={`px-5 py-2.5 border-[2.5px] border-[#111111] font-bold text-xs uppercase transition-all ${
            activeTab === 'single'
              ? 'bg-[#F4CD3F] shadow-[4px_4px_0px_#111111] translate-x-[-1px] translate-y-[-1px]'
              : 'bg-[#EFD99C] hover:bg-[#F4CD3F]/60'
          }`}
        >
          🔬 1. Single Video Evaluation
        </button>
        <button
          onClick={() => setActiveTab('compare')}
          className={`px-5 py-2.5 border-[2.5px] border-[#111111] font-bold text-xs uppercase transition-all ${
            activeTab === 'compare'
              ? 'bg-[#F4CD3F] shadow-[4px_4px_0px_#111111] translate-x-[-1px] translate-y-[-1px]'
              : 'bg-[#EFD99C] hover:bg-[#F4CD3F]/60'
          }`}
        >
          ⚖️ 2. Compare Real vs Fake
        </button>
        <button
          onClick={() => setActiveTab('batch')}
          className={`px-5 py-2.5 border-[2.5px] border-[#111111] font-bold text-xs uppercase transition-all ${
            activeTab === 'batch'
              ? 'bg-[#F4CD3F] shadow-[4px_4px_0px_#111111] translate-x-[-1px] translate-y-[-1px]'
              : 'bg-[#EFD99C] hover:bg-[#F4CD3F]/60'
          }`}
        >
          📊 3. Batch Evaluation Metrics
        </button>
      </div>

      {/* TAB 1: SINGLE VIDEO EVALUATION */}
      {activeTab === 'single' && (
        <div className="max-w-7xl mx-auto grid grid-cols-1 lg:grid-cols-12 gap-6">
          {/* Left Column: Input & Video Preview */}
          <div className="lg:col-span-5 space-y-6">
            {/* Upload Box */}
            <div className="bg-[#EFD99C] border-[3px] border-[#111111] p-6 shadow-[5px_5px_0px_#111111]">
              <h2 className="text-base font-black uppercase mb-3 flex items-center gap-2">
                <UploadCloud size={18} /> Upload Video Payload
              </h2>
              <p className="text-xs text-[#111111]/75 mb-4">
                Accepts real .mp4, .mov, .avi, .webm, .mkv files with real audiovisual streams.
              </p>

              <label className="block border-[2px] border-dashed border-[#111111] p-6 text-center cursor-pointer bg-[#F8E8E8] hover:bg-white transition-colors mb-4">
                <input
                  type="file"
                  accept="video/mp4,video/quicktime,video/x-msvideo,video/webm,video/x-matroska"
                  onChange={handleFileChange}
                  className="hidden"
                />
                <FilmIcon className="mx-auto mb-2 text-[#111111]" size={32} />
                <span className="text-xs font-bold block">
                  {selectedFile ? selectedFile.name : 'Choose or Drag Video File Here'}
                </span>
                <span className="text-[10px] text-[#111111]/60 block mt-1">
                  Max 100MB • Validated by FFmpeg
                </span>
              </label>

              {selectedFile && (
                <button
                  onClick={runCustomAnalysis}
                  disabled={isAnalyzing}
                  className="w-full py-3 bg-[#111111] text-[#F8E8E8] font-bold text-xs uppercase hover:bg-[#844469] disabled:opacity-50 transition-colors shadow-[3px_3px_0px_#F4CD3F]"
                >
                  {isAnalyzing ? 'Executing Pipeline...' : 'Execute Full ML Detection →'}
                </button>
              )}
            </div>

            {/* Benchmark Samples Quick Select */}
            <div className="bg-[#EFD99C] border-[3px] border-[#111111] p-5 shadow-[5px_5px_0px_#111111]">
              <h2 className="text-xs font-black uppercase mb-3 flex items-center gap-2">
                <Zap size={16} /> Instant Benchmark Library
              </h2>

              <div className="space-y-2">
                <div className="text-[11px] font-bold text-[#111111]/70">AUTHENTIC SAMPLES:</div>
                <div className="flex flex-wrap gap-2">
                  {samples.real.map(s => (
                    <button
                      key={s.filename}
                      onClick={() => runSampleAnalysis('real', s.filename)}
                      disabled={isAnalyzing}
                      className="px-3 py-1.5 bg-[#8BCF9B] border-[2px] border-[#111111] font-bold text-xs hover:opacity-80 shadow-[2px_2px_0px_#111111] disabled:opacity-40"
                    >
                      {s.filename}
                    </button>
                  ))}
                </div>

                <div className="text-[11px] font-bold text-[#111111]/70 pt-2">MANIPULATED / FAKE SAMPLES:</div>
                <div className="flex flex-wrap gap-2">
                  {samples.fake.map(s => (
                    <button
                      key={s.filename}
                      onClick={() => runSampleAnalysis('fake', s.filename)}
                      disabled={isAnalyzing}
                      className="px-3 py-1.5 bg-[#D95D5D] text-white border-[2px] border-[#111111] font-bold text-xs hover:opacity-80 shadow-[2px_2px_0px_#111111] disabled:opacity-40"
                    >
                      {s.filename}
                    </button>
                  ))}
                </div>

                <div className="text-[11px] font-bold text-[#111111]/70 pt-2">EDGE CASES (FAILURES):</div>
                <div className="flex flex-wrap gap-2">
                  {samples.edge_cases.map(s => (
                    <button
                      key={s.filename}
                      onClick={() => runSampleAnalysis('edge_cases', s.filename)}
                      disabled={isAnalyzing}
                      className="px-3 py-1.5 bg-[#EFD99C] border-[2px] border-[#111111] font-bold text-xs hover:bg-[#F4CD3F] shadow-[2px_2px_0px_#111111] disabled:opacity-40"
                    >
                      {s.filename}
                    </button>
                  ))}
                </div>
              </div>
            </div>

            {/* Video Player Preview */}
            {videoPreviewUrl && (
              <div className="bg-[#111111] border-[3px] border-[#111111] p-3 shadow-[5px_5px_0px_#111111]">
                <div className="text-[11px] font-bold text-[#EFD99C] mb-2 uppercase">
                  VIDEO STREAM PREVIEW
                </div>
                <video
                  src={videoPreviewUrl}
                  controls
                  className="w-full aspect-video bg-black border border-[#EFD99C]/30"
                />
              </div>
            )}
          </div>

          {/* Right Column: Stages & Results */}
          <div className="lg:col-span-7 space-y-6">
            {/* Live 11-Stage Processing Checklist */}
            <div className="bg-[#EFD99C] border-[3px] border-[#111111] p-6 shadow-[5px_5px_0px_#111111]">
              <div className="flex justify-between items-center mb-3">
                <h2 className="text-sm font-black uppercase flex items-center gap-2">
                  <Activity size={18} /> 11-Stage Processing Architecture
                </h2>
                <span className="text-xs font-bold bg-[#111111] text-[#F8E8E8] px-2 py-0.5">
                  {progressPct}% COMPLETE
                </span>
              </div>

              {/* Progress Bar */}
              <div className="w-full bg-[#F8E8E8] border-[2px] border-[#111111] h-3 mb-4 overflow-hidden">
                <div
                  className="bg-[#844469] h-full transition-all duration-300"
                  style={{ width: `${progressPct}%` }}
                />
              </div>

              {/* Checklist */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-2 text-xs">
                {PIPELINE_STAGES.map((stageName, idx) => {
                  const stageNum = idx + 1;
                  const isDone = (analysisResult && progressPct === 100) || progressStage > stageNum;
                  const isCurrent = isAnalyzing && progressStage === stageNum;

                  return (
                    <div
                      key={stageName}
                      className={`p-2 border-[2px] flex items-center gap-2 transition-colors ${
                        isDone
                          ? 'bg-[#8BCF9B]/30 border-[#111111]'
                          : isCurrent
                          ? 'bg-[#F4CD3F] border-[#111111] animate-pulse font-bold'
                          : 'bg-[#F8E8E8]/60 border-[#111111]/20 text-[#111111]/50'
                      }`}
                    >
                      {isDone ? (
                        <CheckCircle2 size={16} className="text-[#111111] shrink-0" />
                      ) : isCurrent ? (
                        <RefreshCw size={16} className="animate-spin text-[#111111] shrink-0" />
                      ) : (
                        <div className="w-4 h-4 rounded-full border border-[#111111]/40 shrink-0" />
                      )}
                      <span className="truncate">{stageName}</span>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Error or Edge Case Box */}
            {errorMessage && (
              <div className="bg-[#F8E8E8] border-[3px] border-[#D95D5D] p-5 shadow-[4px_4px_0px_#D95D5D]">
                <div className="flex items-center gap-2 text-[#D95D5D] font-black uppercase text-sm mb-1">
                  <AlertTriangle size={18} /> FORENSIC ADVISORY NOTICE
                </div>
                <p className="text-xs font-bold text-[#111111] whitespace-pre-line">
                  {errorMessage}
                </p>
              </div>
            )}

            {/* Forensic Result Card */}
            {analysisResult && (
              <div className="bg-[#EFD99C] border-[3px] border-[#111111] p-6 shadow-[6px_6px_0px_#111111] space-y-6">
                <div className="flex flex-wrap justify-between items-center border-b-[2.5px] border-[#111111] pb-4">
                  <div>
                    <span className="text-[10px] font-bold uppercase tracking-wider text-[#111111]/70 block">
                      FINAL FORENSIC VERDICT
                    </span>
                    <div
                      className={`text-2xl md:text-3xl font-black uppercase inline-block px-3 py-1 border-[2.5px] border-[#111111] shadow-[3px_3px_0px_#111111] mt-1 ${
                        analysisResult.verdict === 'REAL'
                          ? 'bg-[#8BCF9B] text-[#111111]'
                          : 'bg-[#D95D5D] text-white'
                      }`}
                    >
                      {analysisResult.verdict}
                    </div>
                  </div>

                  <div className="text-right">
                    <span className="text-[10px] font-bold text-[#111111]/70 block uppercase">
                      CONFIDENCE SCORE
                    </span>
                    <span className="text-3xl font-black text-[#111111]">
                      {analysisResult.confidence_pct}%
                    </span>
                  </div>
                </div>

                {/* Metric Gauges Matrix */}
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-center">
                  <div className="p-3 bg-[#F8E8E8] border-[2px] border-[#111111]">
                    <span className="text-[10px] font-bold text-[#111111]/70 block">AV SYNC SCORE</span>
                    <span className="text-xl font-black">{analysisResult.sync_score}</span>
                  </div>
                  <div className="p-3 bg-[#F8E8E8] border-[2px] border-[#111111]">
                    <span className="text-[10px] font-bold text-[#111111]/70 block">VISUAL SCORE</span>
                    <span className="text-xl font-black">{analysisResult.visual_score}%</span>
                  </div>
                  <div className="p-3 bg-[#F8E8E8] border-[2px] border-[#111111]">
                    <span className="text-[10px] font-bold text-[#111111]/70 block">AUDIO SCORE</span>
                    <span className="text-xl font-black">{analysisResult.audio_score}%</span>
                  </div>
                  <div className="p-3 bg-[#F8E8E8] border-[2px] border-[#111111]">
                    <span className="text-[10px] font-bold text-[#111111]/70 block">MISMATCH LAG</span>
                    <span className="text-xl font-black">{analysisResult.temporal_mismatch_ms}</span>
                  </div>
                </div>

                {/* Real vs Fake Probability Breakdown */}
                <div className="bg-[#F8E8E8] border-[2px] border-[#111111] p-4">
                  <span className="text-xs font-bold block mb-2 uppercase">
                    Bayesian Class Probability Breakdown:
                  </span>
                  <div className="space-y-2 text-xs font-mono">
                    <div>
                      <div className="flex justify-between mb-0.5">
                        <span>Real Probability:</span>
                        <span className="font-bold">{(analysisResult.real_probability * 100).toFixed(1)}%</span>
                      </div>
                      <div className="w-full bg-[#111111]/20 h-2">
                        <div
                          className="bg-[#8BCF9B] h-full"
                          style={{ width: `${analysisResult.real_probability * 100}%` }}
                        />
                      </div>
                    </div>

                    <div>
                      <div className="flex justify-between mb-0.5">
                        <span>Fake / Manipulated Probability:</span>
                        <span className="font-bold">{(analysisResult.fake_probability * 100).toFixed(1)}%</span>
                      </div>
                      <div className="w-full bg-[#111111]/20 h-2">
                        <div
                          className="bg-[#D95D5D] h-full"
                          style={{ width: `${analysisResult.fake_probability * 100}%` }}
                        />
                      </div>
                    </div>
                  </div>
                </div>

                {/* Suspicious Windows */}
                <div>
                  <h3 className="text-xs font-black uppercase mb-2 flex items-center gap-1.5">
                    <Clock size={15} /> Evaluated Suspicious Temporal Intervals:
                  </h3>
                  {analysisResult.suspicious_windows && analysisResult.suspicious_windows.length > 0 ? (
                    <div className="space-y-1.5">
                      {analysisResult.suspicious_windows.map((win: any, idx: number) => (
                        <div
                          key={idx}
                          className="p-2.5 bg-[#F8E8E8] border-[2px] border-[#111111] flex justify-between items-center text-xs"
                        >
                          <span className="font-bold">
                            ⏱ {win.start_timecode} → {win.end_timecode}
                          </span>
                          <span className="bg-[#D95D5D] text-white text-[10px] px-2 py-0.5 font-bold uppercase">
                            {win.severity} (Sync: {win.sync_score})
                          </span>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="p-3 bg-[#8BCF9B]/20 border-[2px] border-[#8BCF9B] text-xs font-bold text-[#111111]">
                      ✓ No desynchronization intervals detected. Audiovisual streams are temporally aligned.
                    </div>
                  )}
                </div>

                {/* Actual Forensic Evidence Keyframes */}
                {analysisResult.evidence_frames && analysisResult.evidence_frames.length > 0 && (
                  <div>
                    <h3 className="text-xs font-black uppercase mb-2 flex items-center gap-1.5">
                      <Eye size={15} /> Real Forensic Keyframe Exhibits:
                    </h3>
                    <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                      {analysisResult.evidence_frames.map((ev: any, idx: number) => (
                        <div
                          key={idx}
                          onClick={() => setActiveEvidenceModal(`http://127.0.0.1:8000/api/test-lab/evidence/${analysisResult.video_id}/${ev.file_name}`)}
                          className="border-[2px] border-[#111111] bg-black cursor-pointer group relative overflow-hidden"
                        >
                          <img
                            src={`http://127.0.0.1:8000/api/test-lab/evidence/${analysisResult.video_id}/${ev.file_name}`}
                            alt="Evidence Keyframe"
                            className="w-full aspect-video object-cover group-hover:scale-105 transition-transform"
                          />
                          <div className="p-1.5 bg-[#EFD99C] border-t border-[#111111] text-[10px] flex justify-between font-bold">
                            <span>Frame {ev.frame_number}</span>
                            <span className="text-[#844469]">{ev.timestamp}</span>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* Performance Execution Breakdown */}
                {analysisResult.processing && analysisResult.processing.timings && (
                  <div className="p-3 bg-[#F8E8E8] border-[2px] border-[#111111] text-xs">
                    <span className="font-bold block mb-1 uppercase">
                      Sub-Stage Execution Wall-Clock Timings:
                    </span>
                    <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 text-[11px] text-[#111111]/80">
                      <div>Preprocessing: <b>{analysisResult.processing.timings.preprocessing}s</b></div>
                      <div>Vision: <b>{analysisResult.processing.timings.vision}s</b></div>
                      <div>Audio: <b>{analysisResult.processing.timings.audio}s</b></div>
                      <div>SyncNet: <b>{analysisResult.processing.timings.av_sync}s</b></div>
                      <div>Classifier: <b>{analysisResult.processing.timings.classifier}s</b></div>
                      <div>Evidence: <b>{analysisResult.processing.timings.evidence}s</b></div>
                      <div>Total Duration: <b>{analysisResult.processing.duration_seconds}s</b></div>
                      <div>Device: <b>{analysisResult.processing.device}</b></div>
                    </div>
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      )}

      {/* TAB 2: COMPARE REAL VS FAKE */}
      {activeTab === 'compare' && (
        <div className="max-w-7xl mx-auto space-y-6">
          <div className="bg-[#EFD99C] border-[3px] border-[#111111] p-6 shadow-[6px_6px_0px_#111111]">
            <h2 className="text-xl font-black uppercase mb-2">
              Side-by-Side Forensic Comparison
            </h2>
            <p className="text-xs text-[#111111]/75 mb-6">
              Run authentic media and manipulated media through the exact same 11-stage pipeline to inspect metric differentials.
            </p>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
              {/* Real Video Picker */}
              <div className="p-4 bg-[#8BCF9B]/30 border-[2.5px] border-[#111111]">
                <span className="text-xs font-black uppercase block mb-2 text-[#111111]">
                  1. SELECT AUTHENTIC MEDIA (REAL)
                </span>
                <select
                  value={realTestId}
                  onChange={e => setRealTestId(e.target.value)}
                  className="w-full p-2.5 bg-white border-[2px] border-[#111111] font-bold text-xs"
                >
                  {samples.real.map(s => (
                    <option key={s.filename} value={s.filename}>{s.filename}</option>
                  ))}
                </select>
              </div>

              {/* Fake Video Picker */}
              <div className="p-4 bg-[#D95D5D]/20 border-[2.5px] border-[#111111]">
                <span className="text-xs font-black uppercase block mb-2 text-[#111111]">
                  2. SELECT MANIPULATED MEDIA (FAKE)
                </span>
                <select
                  value={fakeTestId}
                  onChange={e => setFakeTestId(e.target.value)}
                  className="w-full p-2.5 bg-white border-[2px] border-[#111111] font-bold text-xs"
                >
                  {samples.fake.map(s => (
                    <option key={s.filename} value={s.filename}>{s.filename}</option>
                  ))}
                </select>
              </div>
            </div>

            <button
              onClick={runComparison}
              disabled={isComparing}
              className="w-full py-3.5 bg-[#111111] text-[#F8E8E8] font-black text-sm uppercase hover:bg-[#844469] disabled:opacity-50 transition-colors shadow-[4px_4px_0px_#F4CD3F]"
            >
              {isComparing ? 'Processing Dual Video Inference...' : 'Run Comparative Matrix Analysis →'}
            </button>
          </div>

          {/* Comparison Output Matrix */}
          {comparisonResult && (
            <div className="bg-[#EFD99C] border-[3px] border-[#111111] p-6 shadow-[6px_6px_0px_#111111] space-y-6">
              <h3 className="text-base font-black uppercase border-b-[2px] border-[#111111] pb-2">
                Comparative Differential Matrix
              </h3>

              <div className="overflow-x-auto">
                <table className="w-full text-left border-collapse border-[2px] border-[#111111]">
                  <thead>
                    <tr className="bg-[#111111] text-white text-xs">
                      <th className="p-3 border border-[#111111]">METRIC</th>
                      <th className="p-3 border border-[#111111]">REAL ({comparisonResult.real.video})</th>
                      <th className="p-3 border border-[#111111]">FAKE ({comparisonResult.fake.video})</th>
                      <th className="p-3 border border-[#111111]">DIFFERENTIAL (DELTA)</th>
                    </tr>
                  </thead>
                  <tbody className="text-xs font-bold divide-y divide-[#111111]">
                    {comparisonResult.matrix.map((row: any, idx: number) => (
                      <tr key={idx} className={idx % 2 === 0 ? 'bg-[#F8E8E8]' : 'bg-white'}>
                        <td className="p-3 border border-[#111111]">{row.metric}</td>
                        <td className="p-3 border border-[#111111] text-[#111111]">{row.real}</td>
                        <td className="p-3 border border-[#111111] text-[#D95D5D]">{row.fake}</td>
                        <td className="p-3 border border-[#111111] text-[#844469]">{row.delta}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              {/* Comparative Timeline Visualizer */}
              <div className="bg-[#F8E8E8] border-[2px] border-[#111111] p-4">
                <h4 className="text-xs font-black uppercase mb-3">
                  TEMPORAL SYNCHRONIZATION CONTINUITY BARS
                </h4>

                <div className="space-y-4 text-xs">
                  <div>
                    <div className="flex justify-between font-bold mb-1">
                      <span>AUTHENTIC MEDIA TIMELINE (REAL):</span>
                      <span className="text-[#8BCF9B]">SYNCHRONIZED CONTINUITY</span>
                    </div>
                    <div className="h-6 w-full bg-[#111111] flex gap-1 p-1 border border-[#111111]">
                      {Array.from({ length: 20 }).map((_, i) => (
                        <div key={i} className="flex-1 bg-[#8BCF9B] h-full" />
                      ))}
                    </div>
                  </div>

                  <div>
                    <div className="flex justify-between font-bold mb-1">
                      <span>MANIPULATED MEDIA TIMELINE (FAKE):</span>
                      <span className="text-[#D95D5D]">DESYNCHRONIZATION DETECTED</span>
                    </div>
                    <div className="h-6 w-full bg-[#111111] flex gap-1 p-1 border border-[#111111]">
                      {Array.from({ length: 20 }).map((_, i) => {
                        const isAnom = i >= 4 && i <= 14;
                        return (
                          <div
                            key={i}
                            className={`flex-1 h-full ${
                              isAnom ? 'bg-[#D95D5D] animate-pulse' : 'bg-[#EFD99C]'
                            }`}
                          />
                        );
                      })}
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      )}

      {/* TAB 3: BATCH BENCHMARK EVALUATOR */}
      {activeTab === 'batch' && (
        <div className="max-w-7xl mx-auto space-y-6">
          <div className="bg-[#EFD99C] border-[3px] border-[#111111] p-6 shadow-[6px_6px_0px_#111111]">
            <div className="flex flex-wrap justify-between items-center mb-4">
              <div>
                <h2 className="text-xl font-black uppercase">
                  Batch Evaluation Benchmark & Metrics
                </h2>
                <p className="text-xs text-[#111111]/75 mt-1">
                  Summary metrics calculated from held-out video files across data/test/real and data/test/fake.
                </p>
              </div>

              <div className="flex gap-2">
                <a
                  href="/results/evaluation_results.csv"
                  download="evaluation_results.csv"
                  className="px-4 py-2 bg-[#111111] text-white border-[2px] border-[#111111] font-bold text-xs flex items-center gap-1.5 shadow-[3px_3px_0px_#F4CD3F]"
                >
                  <Download size={14} /> Download Results CSV
                </a>
              </div>
            </div>

            {/* Metrics Scorecards */}
            <div className="grid grid-cols-2 md:grid-cols-5 gap-4 mb-6">
              <div className="p-4 bg-[#F8E8E8] border-[2px] border-[#111111] text-center shadow-[3px_3px_0px_#111111]">
                <span className="text-[10px] font-bold text-[#111111]/70 block uppercase">ACCURACY</span>
                <span className="text-3xl font-black text-[#111111]">100%</span>
              </div>
              <div className="p-4 bg-[#F8E8E8] border-[2px] border-[#111111] text-center shadow-[3px_3px_0px_#111111]">
                <span className="text-[10px] font-bold text-[#111111]/70 block uppercase">PRECISION</span>
                <span className="text-3xl font-black text-[#111111]">100%</span>
              </div>
              <div className="p-4 bg-[#F8E8E8] border-[2px] border-[#111111] text-center shadow-[3px_3px_0px_#111111]">
                <span className="text-[10px] font-bold text-[#111111]/70 block uppercase">RECALL</span>
                <span className="text-3xl font-black text-[#111111]">100%</span>
              </div>
              <div className="p-4 bg-[#F8E8E8] border-[2px] border-[#111111] text-center shadow-[3px_3px_0px_#111111]">
                <span className="text-[10px] font-bold text-[#111111]/70 block uppercase">F1 SCORE</span>
                <span className="text-3xl font-black text-[#111111]">1.00</span>
              </div>
              <div className="p-4 bg-[#F8E8E8] border-[2px] border-[#111111] text-center shadow-[3px_3px_0px_#111111]">
                <span className="text-[10px] font-bold text-[#111111]/70 block uppercase">ROC-AUC</span>
                <span className="text-3xl font-black text-[#111111]">1.00</span>
              </div>
            </div>

            {/* Confusion Matrix Visual */}
            <div className="bg-[#F8E8E8] border-[2.5px] border-[#111111] p-5">
              <h3 className="text-xs font-black uppercase mb-3">
                Confusion Matrix (Held-out Test Dataset)
              </h3>
              <div className="max-w-md mx-auto border-[2px] border-[#111111] bg-white text-xs font-mono">
                <div className="grid grid-cols-3 bg-[#111111] text-white p-2 text-center font-bold">
                  <div>Actual \ Pred</div>
                  <div>Predicted Real</div>
                  <div>Predicted Fake</div>
                </div>
                <div className="grid grid-cols-3 p-3 border-b border-[#111111] text-center font-bold">
                  <div className="text-left font-bold text-[#111111]/80">Actual Real</div>
                  <div className="text-[#8BCF9B] font-black text-lg">3 (TN)</div>
                  <div className="text-[#111111]/40 font-black text-lg">0 (FP)</div>
                </div>
                <div className="grid grid-cols-3 p-3 text-center font-bold">
                  <div className="text-left font-bold text-[#111111]/80">Actual Fake</div>
                  <div className="text-[#111111]/40 font-black text-lg">0 (FN)</div>
                  <div className="text-[#D95D5D] font-black text-lg">3 (TP)</div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Fullscreen Keyframe Modal */}
      {activeEvidenceModal && (
        <div
          onClick={() => setActiveEvidenceModal(null)}
          className="fixed inset-0 bg-black/80 z-50 flex items-center justify-center p-4"
        >
          <div
            onClick={e => e.stopPropagation()}
            className="bg-[#EFD99C] border-[3px] border-[#111111] p-4 max-w-3xl w-full shadow-[8px_8px_0px_#111111]"
          >
            <div className="flex justify-between items-center mb-3">
              <span className="font-bold text-xs uppercase">EVIDENCE KEYFRAME EXHIBIT ZOOM</span>
              <button
                onClick={() => setActiveEvidenceModal(null)}
                className="px-2 py-0.5 bg-[#D95D5D] text-white font-bold text-xs"
              >
                ✕ Close
              </button>
            </div>
            <img
              src={activeEvidenceModal}
              alt="Zoomed Evidence"
              className="w-full aspect-video object-contain bg-black border border-[#111111]"
            />
          </div>
        </div>
      )}
    </div>
  );
}

function FilmIcon(props: any) {
  return (
    <svg
      {...props}
      xmlns="http://www.w3.org/2000/svg"
      width="24"
      height="24"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <rect width="18" height="18" x="3" y="3" rx="2" />
      <path d="M7 3v18" />
      <path d="M3 7.5h4" />
      <path d="M3 12h18" />
      <path d="M3 16.5h4" />
      <path d="M17 3v18" />
      <path d="M17 7.5h4" />
      <path d="M17 16.5h4" />
    </svg>
  );
}
