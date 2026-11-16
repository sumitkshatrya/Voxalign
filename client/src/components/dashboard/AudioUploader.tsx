import React, { useState, useRef } from 'react';
import { UploadCloud, FileAudio, Check, AlertCircle, X, Sparkles } from 'lucide-react';
import { audioApi } from '../../services/api';
import { AudioFile } from '../../types';

interface AudioUploaderProps {
  projectId: string;
  onUploadSuccess: (newFiles: AudioFile[]) => void;
}

export const AudioUploader: React.FC<AudioUploaderProps> = ({ projectId, onUploadSuccess }) => {
  const [isDragging, setIsDragging] = useState(false);
  const [selectedFiles, setSelectedFiles] = useState<File[]>([]);
  const [isUploading, setIsUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const allowedFormats = ['.mp3', '.wav', '.m4a', '.flac', '.ogg'];

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = () => {
    setIsDragging(false);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      validateAndAddFiles(Array.from(e.dataTransfer.files));
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      validateAndAddFiles(Array.from(e.target.files));
    }
  };

  const validateAndAddFiles = (files: File[]) => {
    setErrorMessage(null);
    const valid: File[] = [];

    for (const f of files) {
      const ext = '.' + f.name.split('.').pop()?.toLowerCase();
      if (!allowedFormats.includes(ext)) {
        setErrorMessage(`"${f.name}" has an unsupported format. Supported: MP3, WAV, M4A, FLAC, OGG.`);
        return;
      }
      if (f.size > 100 * 1024 * 1024) {
        setErrorMessage(`"${f.name}" exceeds the 100MB limit.`);
        return;
      }
      valid.push(f);
    }

    setSelectedFiles(prev => [...prev, ...valid]);
  };

  const removeFile = (index: number) => {
    setSelectedFiles(prev => prev.filter((_, i) => i !== index));
  };

  const handleUpload = async () => {
    if (selectedFiles.length === 0) return;

    setIsUploading(true);
    setUploadProgress(15);
    setErrorMessage(null);

    try {
      const interval = setInterval(() => {
        setUploadProgress(p => (p < 85 ? p + 15 : p));
      }, 300);

      const resp = await audioApi.upload(projectId, selectedFiles);
      clearInterval(interval);
      setUploadProgress(100);

      setTimeout(() => {
        setSelectedFiles([]);
        setIsUploading(false);
        setUploadProgress(0);
        onUploadSuccess(resp.data.files);
      }, 500);

    } catch (err: any) {
      setIsUploading(false);
      setUploadProgress(0);
      setErrorMessage(err.toString());
    }
  };

  return (
    <div className="space-y-4">
      {/* DRAG AND DROP ZONE */}
      <div
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
        onClick={() => fileInputRef.current?.click()}
        className={`border-2 border-dashed rounded-2xl p-8 text-center cursor-pointer transition-all ${
          isDragging 
            ? 'border-[#52DDBB] bg-[#52DDBB]/10 shadow-lg shadow-[#52DDBB]/10 scale-[1.01]' 
            : 'border-white/10 hover:border-[#52DDBB]/50 hover:bg-white/[0.02] bg-[#0F1C2E]'
        }`}
      >
        <input
          ref={fileInputRef}
          type="file"
          multiple
          accept=".mp3,.wav,.m4a,.flac,.ogg"
          onChange={handleFileChange}
          className="hidden"
        />

        <div className="w-12 h-12 mx-auto mb-3 rounded-full bg-gradient-to-tr from-[#52DDBB]/20 to-[#64C8FF]/20 flex items-center justify-center text-[#52DDBB]">
          <UploadCloud className="w-6 h-6" />
        </div>

        <h4 className="font-heading font-semibold text-base text-white">
          Drag & drop audio files, or <span className="text-[#52DDBB]">Browse</span>
        </h4>
        <p className="text-xs text-[#94A3B8] mt-1">
          Supports MP3, WAV, M4A, FLAC up to 100MB per file
        </p>

        <div className="mt-4 flex items-center justify-center gap-2 text-[10px] font-mono text-slate-400">
          <span className="bg-white/5 px-2 py-0.5 rounded">Hindi / Hinglish ASR</span>
          <span className="bg-white/5 px-2 py-0.5 rounded">Word-level Alignment</span>
          <span className="bg-white/5 px-2 py-0.5 rounded">Speaker Detection</span>
        </div>
      </div>

      {/* ERROR MESSAGE */}
      {errorMessage && (
        <div className="p-3 rounded-xl bg-red-500/10 border border-red-500/20 text-red-300 text-xs flex items-center gap-2">
          <AlertCircle className="w-4 h-4 shrink-0 text-red-400" />
          <span>{errorMessage}</span>
        </div>
      )}

      {/* SELECTED FILES QUEUE */}
      {selectedFiles.length > 0 && (
        <div className="bg-[#172538] rounded-xl p-4 border border-white/5 space-y-3">
          <div className="flex items-center justify-between text-xs text-[#94A3B8]">
            <span className="font-medium text-white">
              Selected Files ({selectedFiles.length})
            </span>
            <span>Total: {(selectedFiles.reduce((acc, f) => acc + f.size, 0) / (1024 * 1024)).toFixed(2)} MB</span>
          </div>

          <div className="space-y-2 max-h-48 overflow-y-auto custom-scrollbar">
            {selectedFiles.map((f, i) => (
              <div key={i} className="flex items-center justify-between p-2 rounded-lg bg-[#0B1422] text-xs">
                <div className="flex items-center gap-2.5 truncate">
                  <FileAudio className="w-4 h-4 text-[#52DDBB] shrink-0" />
                  <span className="text-white truncate font-medium">{f.name}</span>
                  <span className="text-slate-500 font-mono text-[10px]">
                    {(f.size / (1024 * 1024)).toFixed(1)} MB
                  </span>
                </div>
                {!isUploading && (
                  <button
                    onClick={() => removeFile(i)}
                    className="p-1 rounded hover:bg-white/10 text-slate-400 hover:text-red-400"
                  >
                    <X className="w-3.5 h-3.5" />
                  </button>
                )}
              </div>
            ))}
          </div>

          {/* PROGRESS BAR */}
          {isUploading && (
            <div className="space-y-1.5 pt-2">
              <div className="flex items-center justify-between text-xs font-mono text-[#52DDBB]">
                <span>Uploading & Starting AI Alignment Pipeline...</span>
                <span>{uploadProgress}%</span>
              </div>
              <div className="w-full h-2 bg-[#0B1422] rounded-full overflow-hidden">
                <div
                  className="h-full bg-gradient-to-r from-[#52DDBB] to-[#64C8FF] transition-all duration-300"
                  style={{ width: `${uploadProgress}%` }}
                />
              </div>
            </div>
          )}

          {/* UPLOAD SUBMIT BUTTON */}
          <div className="pt-2 flex justify-end gap-2">
            <button
              onClick={() => setSelectedFiles([])}
              disabled={isUploading}
              className="px-4 py-2 text-xs font-medium text-slate-400 hover:text-white"
            >
              Clear
            </button>
            <button
              onClick={handleUpload}
              disabled={isUploading}
              className="px-5 py-2 rounded-xl bg-gradient-to-r from-[#52DDBB] to-[#64C8FF] text-[#0B1422] font-bold text-xs flex items-center gap-2 hover:shadow-lg hover:shadow-[#52DDBB]/20 transition-all disabled:opacity-50"
            >
              <Sparkles className="w-3.5 h-3.5" />
              <span>{isUploading ? 'Uploading...' : `Upload & Process (${selectedFiles.length})`}</span>
            </button>
          </div>
        </div>
      )}
    </div>
  );
};
