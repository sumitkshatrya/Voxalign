import React from 'react';
import { Link } from 'react-router-dom';
import { 
  Sparkles, ArrowRight, CheckCircle2, ShieldCheck, 
  Layers, Mic, Cpu, Download, Play, FileText, Check 
} from 'lucide-react';
import { Navbar } from '../components/common/Navbar';
import { Footer } from '../components/common/Footer';

export const LandingPage: React.FC = () => {
  return (
    <div className="min-h-screen bg-[#0B1422] text-[#F5F8FC] flex flex-col selection:bg-[#52DDBB]/30 selection:text-[#52DDBB]">
      <Navbar />

      {/* HERO SECTION */}
      <section className="relative overflow-hidden pt-16 pb-24 lg:pt-24 lg:pb-32">
        {/* Glow backdrop */}
        <div className="absolute top-1/4 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[350px] bg-gradient-to-tr from-[#52DDBB]/15 to-[#64C8FF]/15 blur-[120px] pointer-events-none rounded-full" />

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10 text-center">
          
          {/* TAGLINE PILL */}
          <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-white/5 border border-white/10 text-xs font-mono text-[#52DDBB] mb-8 animate-in fade-in slide-in-from-bottom-3 duration-500">
            <Sparkles className="w-3.5 h-3.5 text-[#52DDBB]" />
            <span>AI Audio Intelligence & Speech Annotation Platform</span>
          </div>

          {/* MAIN HEADLINE */}
          <h1 className="font-heading font-extrabold text-4xl sm:text-6xl lg:text-7xl tracking-tight max-w-5xl mx-auto leading-[1.1] mb-6">
            Every Word. <br className="hidden sm:inline" />
            Every Second. <br className="hidden sm:inline" />
            <span className="bg-gradient-to-r from-[#52DDBB] via-[#64C8FF] to-white bg-clip-text text-transparent">
              Aligned.
            </span>
          </h1>

          {/* SUBTITLE */}
          <p className="text-base sm:text-xl text-[#94A3B8] max-w-2xl mx-auto leading-relaxed mb-10">
            Convert spontaneous Hindi, Hinglish and multilingual speech into millisecond-accurate, structured and timestamped annotation datasets. Built directly on the official Hindi Alignment Guidelines.
          </p>

          {/* CTA BUTTONS */}
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4 max-w-md mx-auto mb-16">
            <Link
              to="/register"
              className="w-full sm:w-auto px-8 py-3.5 rounded-xl bg-gradient-to-r from-[#52DDBB] to-[#64C8FF] text-[#0B1422] font-heading font-bold text-base flex items-center justify-center gap-2 hover:shadow-xl hover:shadow-[#52DDBB]/25 hover:scale-[1.02] transition-all"
            >
              <span>Get Started Free</span>
              <ArrowRight className="w-4 h-4" />
            </Link>

            <Link
              to="/login"
              className="w-full sm:w-auto px-8 py-3.5 rounded-xl bg-[#172538] hover:bg-[#1E2D44] border border-white/10 text-white font-medium text-base transition-colors flex items-center justify-center gap-2"
            >
              <Play className="w-4 h-4 text-[#52DDBB]" />
              <span>Sign In with Demo</span>
            </Link>
          </div>

          {/* INTERACTIVE WORKSPACE PREVIEW MOCKUP */}
          <div className="max-w-5xl mx-auto rounded-2xl border border-white/15 bg-[#172538]/70 backdrop-blur-xl p-2 sm:p-4 shadow-2xl shadow-black/60 relative">
            
            <div className="flex items-center justify-between px-3 py-2 border-b border-white/10 text-xs font-mono text-[#94A3B8]">
              <div className="flex items-center gap-2">
                <span className="w-3 h-3 rounded-full bg-red-500/80" />
                <span className="w-3 h-3 rounded-full bg-amber-500/80" />
                <span className="w-3 h-3 rounded-full bg-emerald-500/80" />
                <span className="ml-2 text-white font-sans font-semibold">VoxAlign Pro Audio Studio</span>
              </div>
              <span className="text-[#52DDBB]">100% Guidelines Compliant</span>
            </div>

            {/* Visual Waveform Simulation */}
            <div className="py-6 px-4 bg-[#0B1422] rounded-xl my-2 border border-white/5 relative overflow-hidden">
              <div className="flex items-end justify-between h-24 gap-1 px-4 opacity-80">
                {[15, 30, 45, 80, 60, 40, 20, 75, 95, 70, 40, 60, 85, 30, 20, 50, 90, 100, 75, 55, 30, 65, 80, 45, 25, 40, 70, 90, 60, 35, 20, 50, 80, 95, 60, 30].map((h, i) => (
                  <div
                    key={i}
                    className="w-full rounded-full transition-all duration-300"
                    style={{
                      height: `${h}%`,
                      backgroundColor: i > 8 && i < 16 ? '#52DDBB' : i > 22 && i < 30 ? '#64C8FF' : '#1E3A5F'
                    }}
                  />
                ))}
              </div>

              {/* Word boundaries underneath */}
              <div className="mt-4 pt-3 border-t border-white/10 flex items-center justify-between gap-1 text-[11px] font-mono text-center">
                <span className="bg-[#52DDBB]/20 text-[#52DDBB] px-2.5 py-1 rounded border border-[#52DDBB]/40 font-semibold">नमस्ते [0.12s]</span>
                <span className="bg-[#52DDBB]/20 text-[#52DDBB] px-2.5 py-1 rounded border border-[#52DDBB]/40 font-semibold">मेरा [0.72s]</span>
                <span className="bg-[#52DDBB]/20 text-[#52DDBB] px-2.5 py-1 rounded border border-[#52DDBB]/40 font-semibold">नाम [1.02s]</span>
                <span className="bg-[#52DDBB]/20 text-[#52DDBB] px-2.5 py-1 rounded border border-[#52DDBB]/40 font-semibold">राहुल [1.40s]</span>
                <span className="bg-amber-400/20 text-amber-300 px-2.5 py-1 rounded border border-amber-400/40">अं [2.45s]</span>
                <span className="bg-[#64C8FF]/20 text-[#64C8FF] px-2.5 py-1 rounded border border-[#64C8FF]/40 font-semibold">cold [4.22s]</span>
                <span className="bg-[#52DDBB]/20 text-[#52DDBB] px-2.5 py-1 rounded border border-[#52DDBB]/40 font-semibold">हाँ [5.30s]</span>
                <span className="bg-[#52DDBB]/20 text-[#52DDBB] px-2.5 py-1 rounded border border-[#52DDBB]/40 font-semibold">जी [5.68s]</span>
              </div>
            </div>

            <div className="flex items-center justify-between text-xs text-[#94A3B8] px-2 py-1">
              <span>Automatic Alignment Confidence: <strong className="text-white font-mono">98.4%</strong></span>
              <span className="text-[#52DDBB] flex items-center gap-1 font-mono">
                <Check className="w-3.5 h-3.5" /> Page 17 QC Passed (0 Errors)
              </span>
            </div>

          </div>

        </div>
      </section>

      {/* CORE CAPABILITIES GRID */}
      <section className="py-20 bg-[#0F1C2E] border-t border-b border-white/5">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          
          <div className="text-center max-w-3xl mx-auto mb-16">
            <h2 className="font-heading font-bold text-3xl sm:text-4xl text-white mb-4">
              Engineered for Precision Speech Intelligence
            </h2>
            <p className="text-[#94A3B8] text-base">
              Everything audio annotators and AI research teams need to process recordings at scale.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            
            {/* Feature 1 */}
            <div className="bg-[#172538] p-6 rounded-2xl border border-white/5 hover:border-[#52DDBB]/30 transition-all group">
              <div className="w-12 h-12 rounded-xl bg-[#52DDBB]/10 text-[#52DDBB] flex items-center justify-center mb-5 group-hover:scale-110 transition-transform">
                <Mic className="w-6 h-6" />
              </div>
              <h3 className="font-heading font-bold text-lg text-white mb-2">
                WhisperX Word Alignment
              </h3>
              <p className="text-[#94A3B8] text-sm leading-relaxed">
                Phonetic CTC forced alignment generates high-precision start and end boundaries for every individual spoken token.
              </p>
            </div>

            {/* Feature 2 */}
            <div className="bg-[#172538] p-6 rounded-2xl border border-white/5 hover:border-[#64C8FF]/30 transition-all group">
              <div className="w-12 h-12 rounded-xl bg-[#64C8FF]/10 text-[#64C8FF] flex items-center justify-center mb-5 group-hover:scale-110 transition-transform">
                <ShieldCheck className="w-6 h-6" />
              </div>
              <h3 className="font-heading font-bold text-lg text-white mb-2">
                Hindi Guidelines Engine
              </h3>
              <p className="text-[#94A3B8] text-sm leading-relaxed">
                Automated validation of single-word segmentation, Devanagari numerals exclusion, compound hyphen splitting, and canonical filler tokens like अं.
              </p>
            </div>

            {/* Feature 3 */}
            <div className="bg-[#172538] p-6 rounded-2xl border border-white/5 hover:border-purple-400/30 transition-all group">
              <div className="w-12 h-12 rounded-xl bg-purple-500/10 text-purple-400 flex items-center justify-center mb-5 group-hover:scale-110 transition-transform">
                <Layers className="w-6 h-6" />
              </div>
              <h3 className="font-heading font-bold text-lg text-white mb-2">
                Neural Speaker Diarization
              </h3>
              <p className="text-[#94A3B8] text-sm leading-relaxed">
                Pyannote-driven acoustic clustering detects multi-speaker conversations, isolates speaker turns, and flags overlapping speech.
              </p>
            </div>

            {/* Feature 4 */}
            <div className="bg-[#172538] p-6 rounded-2xl border border-white/5 hover:border-emerald-400/30 transition-all group">
              <div className="w-12 h-12 rounded-xl bg-emerald-500/10 text-emerald-400 flex items-center justify-center mb-5 group-hover:scale-110 transition-transform">
                <CheckCircle2 className="w-6 h-6" />
              </div>
              <h3 className="font-heading font-bold text-lg text-white mb-2">
                Page 17 QC Checklist
              </h3>
              <p className="text-[#94A3B8] text-sm leading-relaxed">
                Integrated quality audit checklist verifies timestamp monotonicity, absence of overlaps, and correct uncertainty formatting prior to export.
              </p>
            </div>

            {/* Feature 5 */}
            <div className="bg-[#172538] p-6 rounded-2xl border border-white/5 hover:border-amber-400/30 transition-all group">
              <div className="w-12 h-12 rounded-xl bg-amber-500/10 text-amber-400 flex items-center justify-center mb-5 group-hover:scale-110 transition-transform">
                <Cpu className="w-6 h-6" />
              </div>
              <h3 className="font-heading font-bold text-lg text-white mb-2">
                WaveSurfer Pro Editor
              </h3>
              <p className="text-[#94A3B8] text-sm leading-relaxed">
                Split, merge, adjust, and re-label audio segments in an ultra-responsive timeline with full keyboard shortcuts and playback speeds.
              </p>
            </div>

            {/* Feature 6 */}
            <div className="bg-[#172538] p-6 rounded-2xl border border-white/5 hover:border-pink-400/30 transition-all group">
              <div className="w-12 h-12 rounded-xl bg-pink-500/10 text-pink-400 flex items-center justify-center mb-5 group-hover:scale-110 transition-transform">
                <Download className="w-6 h-6" />
              </div>
              <h3 className="font-heading font-bold text-lg text-white mb-2">
                Multi-Format Data Delivery
              </h3>
              <p className="text-[#94A3B8] text-sm leading-relaxed">
                Export directly to standardized JSON, CSV tabular data, plain text speaker logs, and WebVTT/SRT video caption tracks.
              </p>
            </div>

          </div>

        </div>
      </section>

      {/* FOOTER */}
      <Footer />
    </div>
  );
};
