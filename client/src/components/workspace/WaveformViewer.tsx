import React, { useEffect, useRef, useState, useCallback } from 'react';
import WaveSurfer from 'wavesurfer.js';
import TimelinePlugin from 'wavesurfer.js/dist/plugins/timeline.esm.js';
import RegionsPlugin from 'wavesurfer.js/dist/plugins/regions.esm.js';
import { 
  Play, Pause, RotateCcw, RotateCw, ZoomIn, ZoomOut, 
  Volume2, VolumeX, Repeat, Scissors, FastForward, Clock
} from 'lucide-react';
import { useWorkspaceStore } from '../../store/workspaceStore';
import { WordSegment } from '../../types';

export const WaveformViewer: React.FC = () => {
  const {
    currentFile,
    segments,
    selectedSegmentId,
    selectSegment,
    currentTime,
    setCurrentTime,
    isPlaying,
    setIsPlaying,
    zoomLevel,
    setZoom,
    playbackRate,
    setPlaybackRate,
    splitSegmentAtCurrentTime
  } = useWorkspaceStore();

  const containerRef = useRef<HTMLDivElement>(null);
  const timelineRef = useRef<HTMLDivElement>(null);
  const wavesurferRef = useRef<WaveSurfer | null>(null);
  const regionsPluginRef = useRef<any>(null);

  const [isReady, setIsReady] = useState(false);
  const [volume, setVolume] = useState(1.0);
  const [isMuted, setIsMuted] = useState(false);
  const [isLooping, setIsLooping] = useState(false);

  // Initialize WaveSurfer
  useEffect(() => {
    if (!containerRef.current || !currentFile) return;

    setIsReady(false);

    // Destroy existing instance if any
    if (wavesurferRef.current) {
      wavesurferRef.current.destroy();
    }

    const regions = RegionsPlugin.create();
    regionsPluginRef.current = regions;

    const ws = WaveSurfer.create({
      container: containerRef.current,
      waveColor: '#1E3A5F',
      progressColor: '#52DDBB',
      cursorColor: '#64C8FF',
      cursorWidth: 2,
      barWidth: 2,
      barGap: 1,
      barRadius: 2,
      height: 120,
      normalize: true,
      minPxPerSec: zoomLevel,
      plugins: [
        TimelinePlugin.create({
          container: timelineRef.current!,
          primaryLabelInterval: 1,
          secondaryLabelInterval: 0.2,
          style: {
            color: '#64748B',
            fontSize: '10px',
            fontFamily: 'JetBrains Mono, monospace'
          }
        }),
        regions
      ]
    });

    wavesurferRef.current = ws;

    // Load audio stream
    const audioUrl = currentFile.url.startsWith('http') || currentFile.url.startsWith('/api') 
      ? currentFile.url 
      : `/api/audio/${currentFile.id}/stream`;

    ws.load(audioUrl);

    ws.on('ready', () => {
      setIsReady(true);
      ws.setPlaybackRate(playbackRate);
    });

    ws.on('timeupdate', (time: number) => {
      setCurrentTime(time);

      // Loop current segment if loop mode active
      if (isLooping && selectedSegmentId) {
        const seg = segments.find(s => s.id === selectedSegmentId);
        if (seg && time >= seg.end) {
          ws.setTime(seg.start);
        }
      }
    });

    ws.on('play', () => setIsPlaying(true));
    ws.on('pause', () => setIsPlaying(false));
    ws.on('finish', () => setIsPlaying(false));

    return () => {
      ws.destroy();
      wavesurferRef.current = null;
    };
  }, [currentFile?.id]);

  // Update zoom
  useEffect(() => {
    if (wavesurferRef.current && isReady) {
      wavesurferRef.current.zoom(zoomLevel);
    }
  }, [zoomLevel, isReady]);

  // Update playback rate
  useEffect(() => {
    if (wavesurferRef.current && isReady) {
      wavesurferRef.current.setPlaybackRate(playbackRate);
    }
  }, [playbackRate, isReady]);

  // Update volume
  useEffect(() => {
    if (wavesurferRef.current && isReady) {
      wavesurferRef.current.setVolume(isMuted ? 0 : volume);
    }
  }, [volume, isMuted, isReady]);

  // Play / Pause toggle
  const togglePlay = useCallback(() => {
    if (wavesurferRef.current && isReady) {
      wavesurferRef.current.playPause();
    }
  }, [isReady]);

  // Skip -3s
  const skipBackward = () => {
    if (wavesurferRef.current && isReady) {
      const target = Math.max(0, currentTime - 3);
      wavesurferRef.current.setTime(target);
    }
  };

  // Skip +3s
  const skipForward = () => {
    if (wavesurferRef.current && isReady) {
      const dur = wavesurferRef.current.getDuration() || 10;
      const target = Math.min(dur, currentTime + 3);
      wavesurferRef.current.setTime(target);
    }
  };

  // Play specific segment
  const playSegment = (seg: WordSegment) => {
    selectSegment(seg.id);
    if (wavesurferRef.current && isReady) {
      wavesurferRef.current.setTime(seg.start);
      wavesurferRef.current.play();
    }
  };

  // Global Keyboard shortcuts
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // Don't intercept typing in inputs or textareas
      if (['INPUT', 'TEXTAREA'].includes((e.target as HTMLElement).tagName)) {
        return;
      }

      if (e.code === 'Space') {
        e.preventDefault();
        togglePlay();
      } else if (e.key === 's' || e.key === 'S') {
        e.preventDefault();
        splitSegmentAtCurrentTime();
      } else if (e.key === 'ArrowLeft') {
        e.preventDefault();
        skipBackward();
      } else if (e.key === 'ArrowRight') {
        e.preventDefault();
        skipForward();
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [togglePlay, isReady, currentTime]);

  const activeSegment = segments.find(s => s.id === selectedSegmentId);
  const totalDuration = currentFile?.metadata?.duration || 10;

  return (
    <div className="flex flex-col bg-[#0F1C2E] border-b border-white/10 select-none">
      
      {/* TOP HEADER: File Info & Time Readout */}
      <div className="flex items-center justify-between px-4 py-2 bg-[#0B1422] border-b border-white/5 text-xs">
        <div className="flex items-center gap-3">
          <span className="font-semibold text-white truncate max-w-xs">{currentFile?.originalName}</span>
          <span className="font-mono text-[10px] text-[#52DDBB] bg-[#52DDBB]/10 px-2 py-0.5 rounded border border-[#52DDBB]/20">
            {currentFile?.metadata?.sampleRate || 16000} Hz • {currentFile?.metadata?.format?.toUpperCase() || 'WAV'}
          </span>
          {activeSegment && (
            <span className="font-mono text-[#94A3B8] hidden sm:inline">
              Selected: <strong className="text-white">"{activeSegment.text}"</strong> [{activeSegment.start.toFixed(2)}s - {activeSegment.end.toFixed(2)}s]
            </span>
          )}
        </div>

        {/* JetBrains Mono Timestamp Readout */}
        <div className="flex items-center gap-2 font-mono text-xs">
          <Clock className="w-3.5 h-3.5 text-[#64C8FF]" />
          <span className="text-[#52DDBB] font-semibold tracking-wide">
            {formatDuration(currentTime)}
          </span>
          <span className="text-slate-500">/</span>
          <span className="text-slate-400">
            {formatDuration(totalDuration)}
          </span>
        </div>
      </div>

      {/* WAVEFORM CANVAS CONTAINER */}
      <div className="relative px-4 pt-3 pb-1 bg-gradient-to-b from-[#0F1C2E] to-[#0B1422] overflow-x-auto custom-scrollbar">
        <div ref={containerRef} className="w-full cursor-pointer" />
        <div ref={timelineRef} className="w-full h-5 mt-1" />

        {/* Loading overlay */}
        {!isReady && (
          <div className="absolute inset-0 bg-[#0B1422]/80 backdrop-blur-sm flex items-center justify-center gap-3 text-sm text-[#94A3B8]">
            <div className="w-5 h-5 border-2 border-[#52DDBB] border-t-transparent rounded-full animate-spin" />
            <span>Decoding acoustic spectrogram...</span>
          </div>
        )}
      </div>

      {/* SYNCHRONIZED WORD SEGMENT STRIP */}
      <div className="bg-[#172538]/70 border-t border-b border-white/5 px-4 py-2 overflow-x-auto custom-scrollbar">
        <div className="text-[10px] font-mono text-[#94A3B8] mb-1.5 uppercase tracking-wider flex items-center justify-between">
          <span>Word Alignment Track ({segments.length} words)</span>
          <span className="text-[9px] text-[#52DDBB]">Click word to jump & play</span>
        </div>

        <div className="flex items-center gap-1.5 min-w-max pb-1">
          {segments.map((seg, idx) => {
            const isSelected = seg.id === selectedSegmentId;
            const isCurrent = currentTime >= seg.start && currentTime <= seg.end;
            const hasError = seg.validationIssues?.some(i => i.severity === 'error');
            const hasWarning = seg.validationIssues?.some(i => i.severity === 'warning');

            let badgeColor = 'bg-white/5 border-white/10 text-slate-300 hover:bg-white/10';
            if (isSelected) {
              badgeColor = 'bg-[#52DDBB]/20 border-[#52DDBB] text-white ring-1 ring-[#52DDBB]';
            } else if (isCurrent) {
              badgeColor = 'bg-[#64C8FF]/20 border-[#64C8FF] text-white';
            } else if (hasError) {
              badgeColor = 'bg-red-500/10 border-red-500/50 text-red-200';
            } else if (hasWarning) {
              badgeColor = 'bg-amber-500/10 border-amber-500/40 text-amber-200';
            }

            return (
              <button
                key={seg.id || idx}
                onClick={() => playSegment(seg)}
                className={`flex flex-col items-center px-2 py-1 rounded-md text-xs border transition-all ${badgeColor}`}
                title={`[${seg.start.toFixed(2)}s - ${seg.end.toFixed(2)}s] ${seg.speaker}`}
              >
                <span className="font-medium tracking-tight">
                  {seg.text || '<empty>'}
                </span>
                <span className="text-[9px] font-mono text-slate-400 mt-0.5">
                  {(seg.end - seg.start).toFixed(2)}s
                </span>
              </button>
            );
          })}
        </div>
      </div>

      {/* BOTTOM PLAYBACK CONTROLS BAR */}
      <div className="flex flex-wrap items-center justify-between px-4 py-2.5 bg-[#0B1422] gap-3">
        
        {/* Left: Playback Actions */}
        <div className="flex items-center gap-1.5">
          <button
            onClick={skipBackward}
            className="p-2 rounded-lg text-slate-400 hover:text-white hover:bg-white/5 transition-colors"
            title="Skip back 3s (Left Arrow)"
          >
            <RotateCcw className="w-4 h-4" />
          </button>

          <button
            onClick={togglePlay}
            disabled={!isReady}
            className="p-3 rounded-xl bg-gradient-to-r from-[#52DDBB] to-[#64C8FF] text-[#0B1422] font-bold hover:shadow-lg hover:shadow-[#52DDBB]/25 transition-all disabled:opacity-50"
            title="Play/Pause (Space)"
          >
            {isPlaying ? <Pause className="w-5 h-5 fill-current" /> : <Play className="w-5 h-5 fill-current" />}
          </button>

          <button
            onClick={skipForward}
            className="p-2 rounded-lg text-slate-400 hover:text-white hover:bg-white/5 transition-colors"
            title="Skip forward 3s (Right Arrow)"
          >
            <RotateCw className="w-4 h-4" />
          </button>

          <div className="h-4 w-px bg-white/10 mx-1" />

          {/* Loop toggle */}
          <button
            onClick={() => setIsLooping(!isLooping)}
            className={`p-2 rounded-lg transition-colors ${
              isLooping ? 'bg-[#52DDBB]/20 text-[#52DDBB] border border-[#52DDBB]/30' : 'text-slate-400 hover:text-white hover:bg-white/5'
            }`}
            title="Loop active segment"
          >
            <Repeat className="w-4 h-4" />
          </button>

          {/* Split at cursor shortcut */}
          <button
            onClick={() => splitSegmentAtCurrentTime()}
            className="px-2.5 py-1.5 rounded-lg text-xs font-medium text-slate-300 hover:text-white bg-white/5 hover:bg-white/10 border border-white/10 flex items-center gap-1.5 transition-colors"
            title="Split segment at playhead (S key)"
          >
            <Scissors className="w-3.5 h-3.5 text-[#52DDBB]" />
            <span>Split (S)</span>
          </button>
        </div>

        {/* Center: Playback Speed Selector */}
        <div className="flex items-center gap-2 text-xs">
          <span className="text-[#94A3B8] hidden sm:inline">Speed:</span>
          <div className="flex items-center bg-[#172538] rounded-lg p-0.5 border border-white/10">
            {[0.75, 1.0, 1.25, 1.5].map(rate => (
              <button
                key={rate}
                onClick={() => setPlaybackRate(rate)}
                className={`px-2 py-1 rounded text-xs font-mono transition-colors ${
                  playbackRate === rate ? 'bg-[#52DDBB] text-[#0B1422] font-bold' : 'text-slate-400 hover:text-white'
                }`}
              >
                {rate}x
              </button>
            ))}
          </div>
        </div>

        {/* Right: Zoom & Volume */}
        <div className="flex items-center gap-4">
          {/* Zoom controls */}
          <div className="flex items-center gap-1.5">
            <button
              onClick={() => setZoom(Math.max(15, zoomLevel - 15))}
              className="p-1.5 rounded text-slate-400 hover:text-white hover:bg-white/5"
              title="Zoom out"
            >
              <ZoomOut className="w-3.5 h-3.5" />
            </button>
            <input
              type="range"
              min="15"
              max="200"
              value={zoomLevel}
              onChange={(e) => setZoom(Number(e.target.value))}
              className="w-16 sm:w-24 h-1 bg-[#172538] accent-[#52DDBB] rounded cursor-pointer"
            />
            <button
              onClick={() => setZoom(Math.min(200, zoomLevel + 15))}
              className="p-1.5 rounded text-slate-400 hover:text-white hover:bg-white/5"
              title="Zoom in"
            >
              <ZoomIn className="w-3.5 h-3.5" />
            </button>
          </div>

          <div className="h-4 w-px bg-white/10 hidden sm:block" />

          {/* Volume control */}
          <div className="hidden sm:flex items-center gap-1.5">
            <button
              onClick={() => setIsMuted(!isMuted)}
              className="p-1.5 rounded text-slate-400 hover:text-white"
            >
              {isMuted || volume === 0 ? <VolumeX className="w-4 h-4 text-red-400" /> : <Volume2 className="w-4 h-4 text-slate-400" />}
            </button>
            <input
              type="range"
              min="0"
              max="1"
              step="0.05"
              value={isMuted ? 0 : volume}
              onChange={(e) => {
                setVolume(Number(e.target.value));
                setIsMuted(false);
              }}
              className="w-16 h-1 bg-[#172538] accent-[#64C8FF] rounded cursor-pointer"
            />
          </div>
        </div>

      </div>

    </div>
  );
};

function formatDuration(seconds: number): string {
  const mins = Math.floor(seconds / 60);
  const secs = (seconds % 60).toFixed(2);
  return `${mins}:${parseFloat(secs) < 10 ? '0' : ''}${secs}`;
}
