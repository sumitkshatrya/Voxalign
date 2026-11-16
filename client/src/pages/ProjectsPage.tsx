import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  FolderKanban, Plus, FileAudio, Clock, Trash2, 
  ExternalLink, Search, Sparkles, MoreVertical 
} from 'lucide-react';
import { projectApi } from '../services/api';
import { Project } from '../types';
import { Navbar } from '../components/common/Navbar';
import { Footer } from '../components/common/Footer';
import { CreateProjectModal } from '../components/dashboard/CreateProjectModal';

export const ProjectsPage: React.FC = () => {
  const navigate = useNavigate();
  const [projects, setProjects] = useState<Project[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [isLoading, setIsLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);

  const loadProjects = async () => {
    setIsLoading(true);
    try {
      const resp = await projectApi.list();
      setProjects(resp.data.projects);
    } catch (err) {
      console.error(err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadProjects();
  }, []);

  const handleDeleteProject = async (e: React.MouseEvent, id: string) => {
    e.stopPropagation();
    if (!confirm('Are you sure you want to delete this project and all uploaded files?')) return;
    try {
      await projectApi.delete(id);
      setProjects(prev => prev.filter(p => p.id !== id));
    } catch (err) {
      alert('Failed to delete project');
    }
  };

  const filtered = projects.filter(p => 
    p.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    (p.description || '').toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="min-h-screen bg-[#0B1422] text-[#F5F8FC] flex flex-col">
      <Navbar />

      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6">
        
        {/* HEADER */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-white/10">
          <div>
            <h1 className="font-heading font-bold text-2xl text-white">
              Speech Annotation Projects
            </h1>
            <p className="text-xs text-[#94A3B8] mt-1">
              Organize speech audio corpora, team members, and alignment deliverables
            </p>
          </div>

          <button
            onClick={() => setIsModalOpen(true)}
            className="px-4 py-2.5 rounded-xl bg-gradient-to-r from-[#52DDBB] to-[#64C8FF] text-[#0B1422] font-heading font-bold text-xs flex items-center gap-2 hover:shadow-lg hover:shadow-[#52DDBB]/20 transition-all self-start sm:self-auto"
          >
            <Plus className="w-4 h-4" />
            <span>New Project</span>
          </button>
        </div>

        {/* SEARCH BAR */}
        <div className="relative max-w-md">
          <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
          <input
            type="text"
            placeholder="Search projects..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full bg-[#172538] border border-white/10 rounded-xl pl-9 pr-4 py-2 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-[#52DDBB]"
          />
        </div>

        {/* PROJECTS GRID */}
        {isLoading ? (
          <div className="p-12 text-center text-slate-500 text-sm">Loading projects...</div>
        ) : filtered.length === 0 ? (
          <div className="bg-[#172538] rounded-2xl p-12 text-center border border-white/5 space-y-4">
            <FolderKanban className="w-12 h-12 text-slate-600 mx-auto" />
            <h3 className="font-bold text-white text-base">No matching projects</h3>
            <p className="text-xs text-slate-400 max-w-xs mx-auto">
              Create a new project or adjust your search filter to get started.
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
            {filtered.map(proj => (
              <div
                key={proj.id}
                onClick={() => navigate(`/workspace/${proj.id}`)}
                className="bg-[#172538] hover:bg-[#1E2D44] border border-white/5 hover:border-[#52DDBB]/30 rounded-2xl p-5 cursor-pointer transition-all flex flex-col justify-between group shadow-lg shadow-black/20"
              >
                <div className="space-y-3">
                  <div className="flex items-start justify-between">
                    <span className="text-[10px] font-mono text-[#52DDBB] bg-[#52DDBB]/10 px-2 py-0.5 rounded border border-[#52DDBB]/20">
                      {proj.guidelinesProfile}
                    </span>
                    <button
                      onClick={(e) => handleDeleteProject(e, proj.id)}
                      className="p-1 rounded text-slate-500 hover:text-red-400 hover:bg-white/5 transition-colors"
                      title="Delete project"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>

                  <div>
                    <h3 className="font-heading font-bold text-base text-white group-hover:text-[#52DDBB] transition-colors line-clamp-1">
                      {proj.name}
                    </h3>
                    <p className="text-xs text-[#94A3B8] mt-1 line-clamp-2">
                      {proj.description || 'Speech audio dataset for forced alignment and transcription quality verification.'}
                    </p>
                  </div>
                </div>

                <div className="pt-4 mt-4 border-t border-white/5 flex items-center justify-between text-xs text-slate-400">
                  <span className="flex items-center gap-1.5 font-mono">
                    <FileAudio className="w-3.5 h-3.5 text-[#64C8FF]" />
                    {proj.audioFilesCount || 0} files
                  </span>
                  <span className="font-mono text-[11px] text-slate-300">
                    {(proj.totalDurationSeconds || 0).toFixed(1)}s total
                  </span>
                </div>
              </div>
            ))}
          </div>
        )}

      </main>

      <Footer />

      <CreateProjectModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onProjectCreated={(newProj) => {
          setProjects(prev => [newProj, ...prev]);
          navigate(`/workspace/${newProj.id}`);
        }}
      />
    </div>
  );
};
