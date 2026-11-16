import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { io, Socket } from 'socket.io-client';
import { 
  FolderKanban, FileAudio, UploadCloud, Sliders, 
  FileText, ShieldCheck, Download, Trash2, ArrowLeft, 
  RefreshCw, CheckCircle2, AlertCircle, Clock, ChevronRight, Menu
} from 'lucide-react';
import { projectApi, audioApi } from '../services/api';
import { useWorkspaceStore } from '../store/workspaceStore';
import { Navbar } from '../components/common/Navbar';
import { WaveformViewer } from '../components/workspace/WaveformViewer';
import { TranscriptEditor } from '../components/workspace/TranscriptEditor';
import { SegmentInspector } from '../components/workspace/SegmentInspector';
import { QualityControlPanel } from '../components/workspace/QualityControlModal';
import { ExportPanel } from '../components/workspace/ExportPanel';
import { AudioUploader } from '../components/dashboard/AudioUploader';
import { AudioFile } from '../types';

export const WorkspacePage: React.FC = () => {
  const { projectId } = useParams<{ projectId: string }>();
  const navigate = useNavigate();

  const {
    currentProject,
    currentFile,
    setCurrentProject,
    setCurrentFile,
    activeTab,
    setActiveTab,
    qcReport
  } = useWorkspaceStore();

  const [audioFiles, setAudioFiles] = useState<AudioFile[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [showUploadModal, setShowUploadModal] = useState(false);
  const [mobileSidebarOpen, setMobileSidebarOpen] = useState(false);
  const [socket, setSocket] = useState<Socket | null>(null);

  // Load project & files
  const loadWorkspace = async () => {
    if (!projectId) return;
    setIsLoading(true);
    try {
      const resp = await projectApi.get(projectId);
      setCurrentProject(resp.data.project);
      setAudioFiles(resp.data.audioFiles);

      if (resp.data.audioFiles.length > 0) {
        // Select first file if not already selected
        if (!currentFile || currentFile.projectId !== projectId) {
          setCurrentFile(resp.data.audioFiles[0]);
        }
      } else {
        setCurrentFile(null);
      }
    } catch (err) {
      console.error('Failed to load workspace:', err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadWorkspace();
  }, [projectId]);

  // Socket.IO real-time progress connection
  useEffect(() => {
    if (!projectId) return;

    const newSocket = io({
      withCredentials: true
    });

    newSocket.on('connect', () => {
      newSocket.emit('join:project', projectId);
    });

    newSocket.on('file:progress', (data: any) => {
      setAudioFiles(prev => prev.map(f => {
        if (f.id === data.fileId) {
          return {
            ...f,
            processingProgress: data.progress,
            processingStep: data.step,
            status: data.progress < 100 ? 'transcribing' : 'completed'
          };
        }
        return f;
      }));

      // If active file is being updated
      if (currentFile && currentFile.id === data.fileId) {
        // update progress
      }
    });

    newSocket.on('file:completed', (data: any) => {
      setAudioFiles(prev => prev.map(f => f.id === data.fileId ? data.result : f));
      if (currentFile && currentFile.id === data.fileId) {
        setCurrentFile(data.result);
      }
    });

    newSocket.on('file:failed', (data: any) => {
      setAudioFiles(prev => prev.map(f => {
        if (f.id === data.fileId) {
          return { ...f, status: 'failed', errorMessage: data.error };
        }
        return f;
      }));
    });

    setSocket(newSocket);

    return () => {
      newSocket.disconnect();
    };
  }, [projectId, currentFile?.id]);

  const handleSelectFile = async (file: AudioFile) => {
    try {
      const resp = await audioApi.get(file.id);
      setCurrentFile(resp.data.file);
      setMobileSidebarOpen(false);
    } catch (err) {
      console.error('Failed to select file:', err);
    }
  };

  const handleDeleteFile = async (e: React.MouseEvent, fileId: string) => {
    e.stopPropagation();
    if (!confirm('Are you sure you want to delete this audio file and all aligned transcripts?')) return;

    try {
      await audioApi.delete(fileId);
      setAudioFiles(prev => prev.filter(f => f.id !== fileId));
      if (currentFile?.id === fileId) {
        const remaining = audioFiles.filter(f => f.id !== fileId);
        setCurrentFile(remaining.length ? remaining[0] : null);
      }
    } catch (err) {
      alert('Failed to delete file');
    }
  };

  const handleTriggerAlignment = async (e: React.MouseEvent, fileId: string) => {
    e.stopPropagation();
    try {
      await audioApi.process(fileId);
      setAudioFiles(prev => prev.map(f => f.id === fileId ? { ...f, status: 'queued', processingProgress: 5 } : f));
    } catch (err) {
      alert('Failed to trigger alignment');
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-[#0B1422] flex flex-col">
        <Navbar />
        <div className="flex-1 flex items-center justify-center text-slate-400 text-sm gap-2">
          <div className="w-5 h-5 border-2 border-[#52DDBB] border-t-transparent rounded-full animate-spin" />
          <span>Opening Annotation Studio...</span>
        </div>
      </div>
    );
  }

  return (
    <div className="h-screen bg-[#0B1422] flex flex-col overflow-hidden text-[#F5F8FC]">
      <Navbar />

      {/* STUDIO WORKSPACE (3-PANEL RESPONSIVE) */}
      <div className="flex-1 flex overflow-hidden relative">
        
        {/* LEFT PANEL: Project Audio Files */}
        <aside className={`
          w-72 border-r border-white/10 bg-[#0F1C2E] flex flex-col shrink-0 z-30 transition-transform duration-200
          ${mobileSidebarOpen ? 'translate-x-0 absolute inset-y-0 left-0 shadow-2xl' : '-translate-x-full md:translate-x-0'}
        `}>
          
          {/* Project Details Header */}
          <div className="p-4 border-b border-white/10 bg-[#0B1422]">
            <div className="flex items-center justify-between mb-1">
              <span className="text-[10px] font-mono text-[#52DDBB] uppercase tracking-wider">
                Project Files
              </span>
              <button
                onClick={() => navigate('/dashboard')}
                className="text-slate-400 hover:text-white"
                title="Back to Dashboard"
              >
                <ArrowLeft className="w-4 h-4" />
              </button>
            </div>
            <h2 className="font-heading font-bold text-sm text-white truncate">
              {currentProject?.name}
            </h2>
            <div className="flex items-center gap-2 mt-2">
              <span className="text-[10px] font-mono bg-white/5 px-2 py-0.5 rounded border border-white/10 text-slate-300">
                {currentProject?.targetLanguage}
              </span>
              <span className="text-[10px] font-mono bg-[#52DDBB]/10 px-2 py-0.5 rounded border border-[#52DDBB]/20 text-[#52DDBB]">
                {currentProject?.guidelinesProfile}
              </span>
            </div>
          </div>

          {/* Upload Button */}
          <div className="p-3 border-b border-white/5">
            <button
              onClick={() => setShowUploadModal(true)}
              className="w-full py-2 px-3 rounded-xl bg-gradient-to-r from-[#52DDBB] to-[#64C8FF] text-[#0B1422] font-heading font-bold text-xs flex items-center justify-center gap-1.5 hover:shadow-lg hover:shadow-[#52DDBB]/20 transition-all"
            >
              <UploadCloud className="w-4 h-4" />
              <span>Upload Audio</span>
            </button>
          </div>

          {/* Files List */}
          <div className="flex-1 overflow-y-auto divide-y divide-white/5 custom-scrollbar">
            {audioFiles.length === 0 ? (
              <div className="p-6 text-center text-slate-500 text-xs space-y-2">
                <FileAudio className="w-8 h-8 mx-auto opacity-30 text-[#52DDBB]" />
                <p>No audio files in project.</p>
                <p className="text-[11px] text-slate-600">Upload MP3/WAV files to start forced alignment.</p>
              </div>
            ) : (
              audioFiles.map(file => {
                const isSelected = currentFile?.id === file.id;
                const isProcessing = ['transcribing', 'aligning', 'diarizing', 'validating', 'queued'].includes(file.status);

                return (
                  <div
                    key={file.id}
                    onClick={() => handleSelectFile(file)}
                    className={`p-3 cursor-pointer transition-colors flex items-center justify-between text-xs ${
                      isSelected ? 'bg-[#172538] border-l-2 border-[#52DDBB]' : 'hover:bg-white/[0.02]'
                    }`}
                  >
                    <div className="flex items-start gap-2.5 min-w-0 pr-2">
                      <FileAudio className={`w-4 h-4 mt-0.5 shrink-0 ${isSelected ? 'text-[#52DDBB]' : 'text-slate-400'}`} />
                      <div className="min-w-0">
                        <div className="font-medium text-white truncate max-w-[140px]">
                          {file.originalName}
                        </div>
                        <div className="flex items-center gap-1.5 text-[10px] text-slate-400 font-mono mt-0.5">
                          <span>{(file.metadata?.duration || 0).toFixed(1)}s</span>
                          <span>•</span>
                          <span className={file.status === 'completed' ? 'text-[#10B981]' : isProcessing ? 'text-[#64C8FF]' : 'text-slate-400'}>
                            {file.status}
                          </span>
                        </div>
                        {isProcessing && (
                          <div className="w-full bg-[#0B1422] h-1 rounded-full overflow-hidden mt-1.5">
                            <div 
                              className="bg-gradient-to-r from-[#52DDBB] to-[#64C8FF] h-full transition-all duration-300"
                              style={{ width: `${file.processingProgress || 10}%` }}
                            />
                          </div>
                        )}
                      </div>
                    </div>

                    <div className="flex items-center gap-1">
                      {file.status === 'failed' && (
                        <button
                          onClick={(e) => handleTriggerAlignment(e, file.id)}
                          className="p-1 rounded text-[#52DDBB] hover:bg-white/10"
                          title="Retry Alignment"
                        >
                          <RefreshCw className="w-3.5 h-3.5" />
                        </button>
                      )}
                      <button
                        onClick={(e) => handleDeleteFile(e, file.id)}
                        className="p-1 rounded text-slate-500 hover:text-red-400 hover:bg-white/10"
                        title="Delete file"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>
                );
              })
            )}
          </div>

        </aside>

        {/* CENTER + RIGHT: Main Workspace View */}
        <div className="flex-1 flex flex-col min-w-0 overflow-hidden">
          
          {currentFile ? (
            <div className="flex-1 flex flex-col md:flex-row min-h-0 overflow-hidden">
              
              {/* CENTER PANEL: WaveSurfer Visualizer & Playhead */}
              <div className="flex-1 flex flex-col border-r border-white/10 min-w-0 bg-[#0B1422]">
                
                {/* Mobile Drawer Toggle */}
                <div className="md:hidden flex items-center justify-between p-2 bg-[#172538] border-b border-white/5 text-xs">
                  <button
                    onClick={() => setMobileSidebarOpen(true)}
                    className="flex items-center gap-1.5 text-slate-300 hover:text-white"
                  >
                    <Menu className="w-4 h-4" />
                    <span>Files ({audioFiles.length})</span>
                  </button>
                  <span className="font-semibold text-white truncate max-w-[180px]">
                    {currentFile.originalName}
                  </span>
                </div>

                {/* Professional WaveSurfer Component */}
                <WaveformViewer />

                {/* Main Transcript list below waveform on medium/compact viewports */}
                <div className="flex-1 overflow-hidden flex flex-col">
                  <TranscriptEditor />
                </div>
              </div>

              {/* RIGHT PANEL: Inspector / Quality Control / Export Tabs */}
              <div className="w-full md:w-96 bg-[#172538] flex flex-col shrink-0 border-t md:border-t-0 md:border-l border-white/10">
                
                {/* Tab selector bar */}
                <div className="flex items-center border-b border-white/10 bg-[#0F1C2E] text-xs">
                  {[
                    { id: 'properties', label: 'Inspect', icon: Sliders },
                    { id: 'qc', label: 'Page 17 QC', icon: ShieldCheck, badge: qcReport?.errorCount },
                    { id: 'export', label: 'Export', icon: Download }
                  ].map(tab => {
                    const Icon = tab.icon;
                    const isActive = activeTab === tab.id;
                    return (
                      <button
                        key={tab.id}
                        onClick={() => setActiveTab(tab.id as any)}
                        className={`flex-1 py-3 px-2 flex items-center justify-center gap-1.5 font-medium transition-colors border-b-2 ${
                          isActive 
                            ? 'border-[#52DDBB] text-white bg-white/5' 
                            : 'border-transparent text-slate-400 hover:text-white hover:bg-white/[0.02]'
                        }`}
                      >
                        <Icon className={`w-3.5 h-3.5 ${isActive ? 'text-[#52DDBB]' : 'text-slate-400'}`} />
                        <span>{tab.label}</span>
                        {tab.badge !== undefined && tab.badge > 0 && (
                          <span className="bg-red-500 text-white text-[9px] font-mono px-1 rounded-full">
                            {tab.badge}
                          </span>
                        )}
                      </button>
                    );
                  })}
                </div>

                {/* Tab Body */}
                <div className="flex-1 overflow-hidden">
                  {activeTab === 'properties' && <SegmentInspector />}
                  {activeTab === 'qc' && <QualityControlPanel />}
                  {activeTab === 'export' && <ExportPanel />}
                </div>

              </div>

            </div>
          ) : (
            <div className="flex-1 flex flex-col items-center justify-center p-8 text-center text-slate-500">
              <FileAudio className="w-16 h-16 text-slate-600 mb-3" />
              <h3 className="font-heading font-bold text-lg text-white">No Audio Selected</h3>
              <p className="text-xs text-slate-400 mt-1 max-w-sm">
                Upload or select an audio file from the left sidebar to start inspecting and aligning word segments.
              </p>
              <button
                onClick={() => setShowUploadModal(true)}
                className="mt-4 px-5 py-2.5 rounded-xl bg-gradient-to-r from-[#52DDBB] to-[#64C8FF] text-[#0B1422] font-bold text-xs"
              >
                Upload Audio File
              </button>
            </div>
          )}

        </div>

      </div>

      {/* UPLOAD MODAL */}
      {showUploadModal && projectId && (
        <div className="fixed inset-0 z-50 bg-[#0B1422]/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-[#172538] border border-white/10 rounded-2xl w-full max-w-lg p-6 shadow-2xl relative">
            <div className="flex items-center justify-between pb-3 border-b border-white/10 mb-4">
              <h3 className="font-heading font-bold text-base text-white">
                Upload Audio for Speech Alignment
              </h3>
              <button
                onClick={() => setShowUploadModal(false)}
                className="text-slate-400 hover:text-white"
              >
                ✕
              </button>
            </div>

            <AudioUploader
              projectId={projectId}
              onUploadSuccess={(newFiles) => {
                setShowUploadModal(false);
                setAudioFiles(prev => [...newFiles, ...prev]);
                if (newFiles.length > 0) {
                  setCurrentFile(newFiles[0]);
                }
              }}
            />
          </div>
        </div>
      )}

    </div>
  );
};
