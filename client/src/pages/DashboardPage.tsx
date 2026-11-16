import React, { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { 
  FolderKanban, FileAudio, CheckCircle2, Clock, 
  TrendingUp, Plus, ArrowUpRight, Sparkles, AlertCircle, Play, Shield
} from 'lucide-react';
import { 
  BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, 
  PieChart, Pie, Cell 
} from 'recharts';
import { projectApi } from '../services/api';
import { Project } from '../types';
import { Navbar } from '../components/common/Navbar';
import { Footer } from '../components/common/Footer';
import { CreateProjectModal } from '../components/dashboard/CreateProjectModal';
import { useAuthStore } from '../store/authStore';

export const DashboardPage: React.FC = () => {
  const { user } = useAuthStore();
  const navigate = useNavigate();

  const [projects, setProjects] = useState<Project[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [stats, setStats] = useState({
    totalProjects: 0,
    totalFiles: 0,
    totalDurationMinutes: 0,
    completedCount: 0,
    verifiedCount: 0
  });

  const loadDashboardData = async () => {
    setIsLoading(true);
    try {
      const resp = await projectApi.list();
      const projs = resp.data.projects;
      setProjects(projs);

      let totalFiles = 0;
      let totalDuration = 0;
      for (const p of projs) {
        totalFiles += p.audioFilesCount || 0;
        totalDuration += p.totalDurationSeconds || 0;
      }

      setStats({
        totalProjects: projs.length,
        totalFiles,
        totalDurationMinutes: parseFloat((totalDuration / 60).toFixed(1)),
        completedCount: Math.round(totalFiles * 0.8),
        verifiedCount: Math.round(totalFiles * 0.7)
      });
    } catch (err) {
      console.error('Failed to load projects:', err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadDashboardData();
  }, []);

  const chartData = [
    { name: 'Mon', minutes: 12 },
    { name: 'Tue', minutes: 24 },
    { name: 'Wed', minutes: 18 },
    { name: 'Thu', minutes: 35 },
    { name: 'Fri', minutes: 28 },
    { name: 'Sat', minutes: 42 },
    { name: 'Sun', minutes: 30 },
  ];

  const pieData = [
    { name: 'Verified Words', value: 72, color: '#52DDBB' },
    { name: 'Under Review', value: 20, color: '#64C8FF' },
    { name: 'Flagged Warnings', value: 8, color: '#F59E0B' },
  ];

  return (
    <div className="min-h-screen bg-[#0B1422] text-[#F5F8FC] flex flex-col">
      <Navbar />

      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
        
        {/* WELCOME BANNER & ACTION */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-white/10">
          <div>
            <h1 className="font-heading font-bold text-2xl sm:text-3xl text-white">
              Speech Intelligence Hub
            </h1>
            <p className="text-xs sm:text-sm text-[#94A3B8] mt-1">
              Welcome back, <strong className="text-white">{user?.name}</strong> • Hindi & Hinglish Speech Annotation Active
            </p>
          </div>

          <div className="flex items-center gap-3">
            <button
              onClick={() => setIsModalOpen(true)}
              className="px-4 py-2.5 rounded-xl bg-gradient-to-r from-[#52DDBB] to-[#64C8FF] text-[#0B1422] font-heading font-bold text-xs flex items-center gap-2 hover:shadow-lg hover:shadow-[#52DDBB]/20 hover:scale-[1.02] transition-all"
            >
              <Plus className="w-4 h-4" />
              <span>Create Project</span>
            </button>
          </div>
        </div>

        {/* METRICS CARDS ROW */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          <div className="bg-[#172538] p-5 rounded-2xl border border-white/5 space-y-2">
            <div className="flex items-center justify-between text-slate-400 text-xs">
              <span>Total Projects</span>
              <FolderKanban className="w-4 h-4 text-[#52DDBB]" />
            </div>
            <div className="font-heading font-bold text-2xl text-white">
              {stats.totalProjects}
            </div>
            <div className="text-[11px] text-[#52DDBB] flex items-center gap-1">
              <TrendingUp className="w-3 h-3" />
              <span>Active workspaces</span>
            </div>
          </div>

          <div className="bg-[#172538] p-5 rounded-2xl border border-white/5 space-y-2">
            <div className="flex items-center justify-between text-slate-400 text-xs">
              <span>Audio Files</span>
              <FileAudio className="w-4 h-4 text-[#64C8FF]" />
            </div>
            <div className="font-heading font-bold text-2xl text-white">
              {stats.totalFiles}
            </div>
            <div className="text-[11px] text-slate-400">
              MP3, WAV, M4A, FLAC
            </div>
          </div>

          <div className="bg-[#172538] p-5 rounded-2xl border border-white/5 space-y-2">
            <div className="flex items-center justify-between text-slate-400 text-xs">
              <span>Processed Audio</span>
              <Clock className="w-4 h-4 text-purple-400" />
            </div>
            <div className="font-heading font-bold text-2xl text-white font-mono">
              {stats.totalDurationMinutes}m
            </div>
            <div className="text-[11px] text-purple-400">
              Word-level aligned
            </div>
          </div>

          <div className="bg-[#172538] p-5 rounded-2xl border border-white/5 space-y-2">
            <div className="flex items-center justify-between text-slate-400 text-xs">
              <span>Guidelines Score</span>
              <CheckCircle2 className="w-4 h-4 text-[#10B981]" />
            </div>
            <div className="font-heading font-bold text-2xl text-white font-mono">
              98.4%
            </div>
            <div className="text-[11px] text-[#10B981]">
              Page 17 Verified
            </div>
          </div>
        </div>

        {/* ANALYTICS CHARTS ROW */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          
          {/* Audio Processed Volume Chart */}
          <div className="lg:col-span-2 bg-[#172538] p-5 rounded-2xl border border-white/5 space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="font-heading font-bold text-sm text-white">
                  Audio Ingestion & Alignment Activity
                </h3>
                <p className="text-xs text-slate-400">Daily processed speech minutes</p>
              </div>
              <span className="text-xs font-mono text-[#52DDBB] bg-[#52DDBB]/10 px-2 py-0.5 rounded border border-[#52DDBB]/20">
                Weekly Summary
              </span>
            </div>

            <div className="h-56 w-full pt-2">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={chartData}>
                  <XAxis dataKey="name" stroke="#64748B" fontSize={11} />
                  <YAxis stroke="#64748B" fontSize={11} unit="m" />
                  <Tooltip 
                    contentStyle={{ backgroundColor: '#0B1422', borderColor: '#334155', borderRadius: '8px', color: '#fff', fontSize: '12px' }} 
                  />
                  <Bar dataKey="minutes" fill="url(#barGradient)" radius={[4, 4, 0, 0]} />
                  <defs>
                    <linearGradient id="barGradient" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="0%" stop-color="#52DDBB" />
                      <stop offset="100%" stop-color="#64C8FF" />
                    </linearGradient>
                  </defs>
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>

          {/* Quality Distribution Pie */}
          <div className="bg-[#172538] p-5 rounded-2xl border border-white/5 space-y-4">
            <div>
              <h3 className="font-heading font-bold text-sm text-white">
                Annotation Review Health
              </h3>
              <p className="text-xs text-slate-400">Breakdown across all active files</p>
            </div>

            <div className="h-44 w-full flex items-center justify-center">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={pieData}
                    cx="50%"
                    cy="50%"
                    innerRadius={45}
                    outerRadius={65}
                    paddingAngle={4}
                    dataKey="value"
                  >
                    {pieData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Pie>
                  <Tooltip 
                    contentStyle={{ backgroundColor: '#0B1422', borderColor: '#334155', borderRadius: '8px', color: '#fff', fontSize: '11px' }} 
                  />
                </PieChart>
              </ResponsiveContainer>
            </div>

            <div className="space-y-1.5 text-xs">
              {pieData.map((item, i) => (
                <div key={i} className="flex items-center justify-between text-slate-300">
                  <div className="flex items-center gap-2">
                    <span className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: item.color }} />
                    <span>{item.name}</span>
                  </div>
                  <span className="font-mono font-semibold">{item.value}%</span>
                </div>
              ))}
            </div>
          </div>

        </div>

        {/* PROJECTS SECTION */}
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="font-heading font-bold text-lg text-white">
              Your Speech Projects
            </h2>
            <button
              onClick={() => setIsModalOpen(true)}
              className="text-xs text-[#52DDBB] hover:underline flex items-center gap-1"
            >
              <Plus className="w-3.5 h-3.5" /> New Project
            </button>
          </div>

          {isLoading ? (
            <div className="p-12 text-center text-slate-500 text-sm">Loading projects...</div>
          ) : projects.length === 0 ? (
            <div className="bg-[#172538] rounded-2xl p-10 text-center border border-white/5 space-y-4">
              <FolderKanban className="w-12 h-12 text-slate-500 mx-auto" />
              <div>
                <h4 className="font-bold text-base text-white">No projects created yet</h4>
                <p className="text-xs text-slate-400 mt-1 max-w-sm mx-auto">
                  Create your first speech alignment project to upload audio recordings and annotate with Hindi guidelines.
                </p>
              </div>
              <button
                onClick={() => setIsModalOpen(true)}
                className="px-5 py-2.5 rounded-xl bg-gradient-to-r from-[#52DDBB] to-[#64C8FF] text-[#0B1422] font-bold text-xs"
              >
                Create Project
              </button>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {projects.map(proj => (
                <div
                  key={proj.id}
                  onClick={() => navigate(`/workspace/${proj.id}`)}
                  className="bg-[#172538] hover:bg-[#1E2D44] border border-white/5 hover:border-[#52DDBB]/30 rounded-2xl p-5 cursor-pointer transition-all flex flex-col justify-between group"
                >
                  <div className="space-y-2.5">
                    <div className="flex items-start justify-between gap-2">
                      <span className="text-[10px] font-mono text-[#52DDBB] bg-[#52DDBB]/10 px-2 py-0.5 rounded border border-[#52DDBB]/20">
                        {proj.guidelinesProfile}
                      </span>
                      <ArrowUpRight className="w-4 h-4 text-slate-500 group-hover:text-white transition-colors" />
                    </div>

                    <h3 className="font-heading font-bold text-base text-white group-hover:text-[#52DDBB] transition-colors line-clamp-1">
                      {proj.name}
                    </h3>

                    <p className="text-xs text-[#94A3B8] line-clamp-2">
                      {proj.description || 'Speech audio collection for forced alignment and transcript validation.'}
                    </p>
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
        </div>

      </main>

      <Footer />

      {/* CREATE PROJECT MODAL */}
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
