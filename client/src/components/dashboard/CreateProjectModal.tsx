import React, { useState } from 'react';
import { X, FolderPlus, Sparkles, ShieldCheck } from 'lucide-react';
import { projectApi } from '../../services/api';
import { Project, LanguageCode, GuidelinesProfile, SUPPORTED_LANGUAGES } from '../../types';

interface CreateProjectModalProps {
  isOpen: boolean;
  onClose: () => void;
  onProjectCreated: (project: Project) => void;
}

export const CreateProjectModal: React.FC<CreateProjectModalProps> = ({
  isOpen,
  onClose,
  onProjectCreated
}) => {
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [targetLanguage, setTargetLanguage] = useState<LanguageCode>('hi-en');
  const [guidelinesProfile, setGuidelinesProfile] = useState<GuidelinesProfile>('indic_multilingual');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) {
      setError('Project name is required');
      return;
    }

    setIsSubmitting(true);
    setError(null);

    try {
      const resp = await projectApi.create({
        name: name.trim(),
        description: description.trim(),
        targetLanguage,
        guidelinesProfile
      });

      onProjectCreated(resp.data.project);
      onClose();
    } catch (err: any) {
      setError(err.toString());
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-[#0B1422]/80 backdrop-blur-sm flex items-center justify-center p-4">
      <div className="bg-[#172538] border border-white/10 rounded-2xl w-full max-w-md p-6 shadow-2xl relative animate-in fade-in zoom-in-95 duration-150">
        
        {/* CLOSE BUTTON */}
        <button
          onClick={onClose}
          className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-white/5 absolute top-5 right-5"
        >
          <X className="w-5 h-5" />
        </button>

        {/* HEADER */}
        <div className="flex items-center gap-3 mb-5">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-[#52DDBB]/20 to-[#64C8FF]/20 flex items-center justify-center text-[#52DDBB]">
            <FolderPlus className="w-5 h-5" />
          </div>
          <div>
            <h3 className="font-heading font-bold text-lg text-white">
              Create New Project
            </h3>
            <p className="text-xs text-[#94A3B8]">
              Configure speech annotation specifications
            </p>
          </div>
        </div>

        {error && (
          <div className="mb-4 p-2.5 rounded-lg bg-red-500/10 border border-red-500/20 text-red-300 text-xs">
            {error}
          </div>
        )}

        {/* FORM */}
        <form onSubmit={handleSubmit} className="space-y-4 text-xs">
          <div>
            <label className="block font-semibold text-slate-300 mb-1">
              Project Name *
            </label>
            <input
              type="text"
              required
              placeholder="e.g. Hindi Conversational Speech Corpus"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="w-full bg-[#0B1422] border border-white/10 rounded-lg px-3 py-2 text-white focus:outline-none focus:border-[#52DDBB]"
            />
          </div>

          <div>
            <label className="block font-semibold text-slate-300 mb-1">
              Description (Optional)
            </label>
            <textarea
              rows={2}
              placeholder="Brief details about speech audio sources, accent, or dataset purpose..."
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              className="w-full bg-[#0B1422] border border-white/10 rounded-lg px-3 py-2 text-white focus:outline-none focus:border-[#52DDBB]"
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block font-semibold text-slate-300 mb-1">
                Target Language
              </label>
              <select
                value={targetLanguage}
                onChange={(e) => setTargetLanguage(e.target.value as LanguageCode)}
                className="w-full bg-[#0B1422] border border-white/10 rounded-lg px-3 py-2 text-white focus:outline-none focus:border-[#52DDBB]"
              >
                <optgroup label="Indic Languages">
                  {SUPPORTED_LANGUAGES.filter(l => ['hi', 'hi-en', 'bn', 'ta', 'te', 'mr', 'gu', 'kn', 'ml', 'pa', 'or', 'ur', 'as'].includes(l.code)).map(lang => (
                    <option key={lang.code} value={lang.code}>
                      {lang.name} ({lang.nativeName})
                    </option>
                  ))}
                </optgroup>
                <optgroup label="Global Languages">
                  {SUPPORTED_LANGUAGES.filter(l => ['en', 'es', 'fr', 'de', 'ar'].includes(l.code)).map(lang => (
                    <option key={lang.code} value={lang.code}>
                      {lang.name} ({lang.nativeName})
                    </option>
                  ))}
                </optgroup>
                <optgroup label="Multilingual">
                  <option value="multilingual">Multilingual / Mixed Audio</option>
                </optgroup>
              </select>
            </div>

            <div>
              <label className="block font-semibold text-slate-300 mb-1">
                Guidelines Profile
              </label>
              <select
                value={guidelinesProfile}
                onChange={(e) => setGuidelinesProfile(e.target.value as GuidelinesProfile)}
                className="w-full bg-[#0B1422] border border-white/10 rounded-lg px-3 py-2 text-white focus:outline-none focus:border-[#52DDBB]"
              >
                <option value="indic_multilingual">Indic Multilingual Quality Rules</option>
                <option value="hindi_hi_IN">Hindi Alignment (hi_IN Page 17 Rules)</option>
                <option value="general">General Standard</option>
              </select>
            </div>
          </div>

          <div className="p-3 rounded-xl bg-white/5 border border-white/5 text-[11px] text-[#94A3B8] flex items-start gap-2">
            <ShieldCheck className="w-4 h-4 text-[#52DDBB] shrink-0 mt-0.5" />
            <span>
              {guidelinesProfile === 'hindi_hi_IN'
                ? 'The Hindi Alignment (hi_IN) profile strictly enforces single-word segmentation, Devanagari numerals conversion, canonical hesitation अं, and unsplit compound separation.'
                : 'The Indic Multilingual Quality profile validates script consistency (Devanagari, Bengali, Tamil, Telugu, etc.), digit conversion, and speech disfluency tags across 14+ languages.'}
            </span>
          </div>

          {/* ACTIONS */}
          <div className="pt-2 flex items-center justify-end gap-2">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-slate-400 hover:text-white"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isSubmitting}
              className="px-5 py-2 rounded-xl bg-gradient-to-r from-[#52DDBB] to-[#64C8FF] text-[#0B1422] font-bold flex items-center gap-2 hover:shadow-lg hover:shadow-[#52DDBB]/20 transition-all disabled:opacity-50"
            >
              <Sparkles className="w-3.5 h-3.5" />
              <span>{isSubmitting ? 'Creating...' : 'Create Project'}</span>
            </button>
          </div>
        </form>

      </div>
    </div>
  );
};
