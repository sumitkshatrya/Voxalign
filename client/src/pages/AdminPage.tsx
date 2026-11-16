import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  Shield, Server, Users, Activity, Cpu, HardDrive, 
  Trash2, RefreshCw, AlertCircle, CheckCircle2, Clock 
} from 'lucide-react';
import { adminApi } from '../services/api';
import { User } from '../types';
import { Navbar } from '../components/common/Navbar';
import { Footer } from '../components/common/Footer';
import { useAuthStore } from '../store/authStore';

export const AdminPage: React.FC = () => {
  const { user } = useAuthStore();
  const navigate = useNavigate();

  const [stats, setStats] = useState<any>(null);
  const [health, setHealth] = useState<any>(null);
  const [users, setUsers] = useState<User[]>([]);
  const [auditLogs, setAuditLogs] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<'health' | 'users' | 'logs'>('health');

  const loadAdminData = async () => {
    setIsLoading(true);
    try {
      const [statsRes, healthRes, usersRes, logsRes] = await Promise.all([
        adminApi.getStats(),
        adminApi.getHealth(),
        adminApi.getUsers(),
        adminApi.getAuditLogs({ limit: 50 })
      ]);

      setStats(statsRes.data);
      setHealth(healthRes.data);
      setUsers(usersRes.data.users);
      setAuditLogs(logsRes.data.logs);
    } catch (err) {
      console.error('Failed to load admin telemetry:', err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    if (user && user.role !== 'admin') {
      navigate('/dashboard');
      return;
    }
    loadAdminData();
  }, [user]);

  const handleUpdateRole = async (userId: string, newRole: string) => {
    try {
      await adminApi.updateUser(userId, { role: newRole });
      setUsers(prev => prev.map(u => u.id === userId ? { ...u, role: newRole as any } : u));
    } catch (err) {
      alert('Failed to update user role');
    }
  };

  const handleUpdateQuota = async (userId: string, minutes: number) => {
    try {
      await adminApi.updateUser(userId, { quotaMinutes: minutes });
      setUsers(prev => prev.map(u => u.id === userId ? { ...u, quotaMinutes: minutes } : u));
    } catch (err) {
      alert('Failed to update quota');
    }
  };

  const handleDeleteUser = async (userId: string) => {
    if (!confirm('Are you sure you want to delete this user?')) return;
    try {
      await adminApi.deleteUser(userId);
      setUsers(prev => prev.filter(u => u.id !== userId));
    } catch (err: any) {
      alert(err.toString());
    }
  };

  return (
    <div className="min-h-screen bg-[#0B1422] text-[#F5F8FC] flex flex-col">
      <Navbar />

      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6">
        
        {/* HEADER */}
        <div className="flex items-center justify-between pb-4 border-b border-white/10">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-[#64C8FF]/10 text-[#64C8FF] flex items-center justify-center">
              <Shield className="w-5 h-5" />
            </div>
            <div>
              <h1 className="font-heading font-bold text-2xl text-white">
                Platform Administration Console
              </h1>
              <p className="text-xs text-[#94A3B8]">
                System telemetry, user roles, background worker queues and audit trails
              </p>
            </div>
          </div>

          <button
            onClick={loadAdminData}
            className="px-3 py-1.5 rounded-lg bg-white/5 hover:bg-white/10 text-xs flex items-center gap-1.5 border border-white/10 transition-colors"
          >
            <RefreshCw className="w-3.5 h-3.5" />
            <span>Refresh Telemetry</span>
          </button>
        </div>

        {/* TABS */}
        <div className="flex items-center gap-2 border-b border-white/10 text-xs">
          {[
            { id: 'health', label: 'System Health & Engine', icon: Server },
            { id: 'users', label: 'User Management', icon: Users, count: users.length },
            { id: 'logs', label: 'Audit Log Feed', icon: Activity, count: auditLogs.length }
          ].map(tab => {
            const Icon = tab.icon;
            const isActive = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id as any)}
                className={`py-3 px-4 font-semibold flex items-center gap-2 border-b-2 transition-colors ${
                  isActive
                    ? 'border-[#64C8FF] text-white bg-white/5'
                    : 'border-transparent text-slate-400 hover:text-white'
                }`}
              >
                <Icon className={`w-4 h-4 ${isActive ? 'text-[#64C8FF]' : 'text-slate-400'}`} />
                <span>{tab.label}</span>
                {tab.count !== undefined && (
                  <span className="bg-white/10 px-1.5 py-0.5 rounded-full font-mono text-[10px]">
                    {tab.count}
                  </span>
                )}
              </button>
            );
          })}
        </div>

        {/* TAB 1: SYSTEM HEALTH */}
        {activeTab === 'health' && health && (
          <div className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              
              {/* Database Status */}
              <div className="bg-[#172538] p-5 rounded-2xl border border-white/5 space-y-3">
                <div className="flex items-center justify-between text-xs text-slate-400">
                  <span className="font-semibold text-white">Database Engine</span>
                  <HardDrive className="w-4 h-4 text-[#52DDBB]" />
                </div>
                <div className="flex items-center gap-2 text-sm font-bold text-white">
                  <CheckCircle2 className="w-4 h-4 text-[#10B981]" />
                  <span>{health.database.mode.toUpperCase()}</span>
                </div>
                <div className="text-[11px] font-mono text-slate-400 truncate">
                  URI: {health.database.uri}
                </div>
              </div>

              {/* Background Queue */}
              <div className="bg-[#172538] p-5 rounded-2xl border border-white/5 space-y-3">
                <div className="flex items-center justify-between text-xs text-slate-400">
                  <span className="font-semibold text-white">Background Queue</span>
                  <Clock className="w-4 h-4 text-[#64C8FF]" />
                </div>
                <div className="flex items-center gap-2 text-sm font-bold text-white">
                  <CheckCircle2 className="w-4 h-4 text-[#10B981]" />
                  <span>{health.queue.mode.toUpperCase()}</span>
                </div>
                <div className="text-[11px] font-mono text-slate-400">
                  Pending Jobs: {health.queue.pendingCount}
                </div>
              </div>

              {/* AI Service Ping */}
              <div className="bg-[#172538] p-5 rounded-2xl border border-white/5 space-y-3">
                <div className="flex items-center justify-between text-xs text-slate-400">
                  <span className="font-semibold text-white">Python AI Microservice</span>
                  <Cpu className="w-4 h-4 text-purple-400" />
                </div>
                <div className="flex items-center gap-2 text-sm font-bold text-white">
                  {health.aiService.reachable ? (
                    <>
                      <CheckCircle2 className="w-4 h-4 text-[#10B981]" />
                      <span>ONLINE ({health.aiService.latencyMs}ms)</span>
                    </>
                  ) : (
                    <>
                      <CheckCircle2 className="w-4 h-4 text-[#52DDBB]" />
                      <span>BUILT-IN ALIGNMENT ACTIVE</span>
                    </>
                  )}
                </div>
                <div className="text-[11px] font-mono text-slate-400 truncate">
                  Target: {health.aiService.url}
                </div>
              </div>

            </div>

            {/* Hardware & Process Metrics */}
            <div className="bg-[#172538] p-6 rounded-2xl border border-white/5 space-y-4">
              <h3 className="font-heading font-bold text-sm text-white">
                Host Server Telemetry
              </h3>

              <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-xs">
                <div className="bg-[#0B1422] p-3 rounded-xl">
                  <div className="text-slate-400">OS Platform</div>
                  <div className="font-mono font-bold text-white mt-1">{health.system.platform} ({health.system.release})</div>
                </div>

                <div className="bg-[#0B1422] p-3 rounded-xl">
                  <div className="text-slate-400">CPU Cores</div>
                  <div className="font-mono font-bold text-white mt-1">{health.system.cpuCount} Cores</div>
                </div>

                <div className="bg-[#0B1422] p-3 rounded-xl">
                  <div className="text-slate-400">Node Heap Memory</div>
                  <div className="font-mono font-bold text-[#52DDBB] mt-1">{health.system.memory.heapUsedMB} MB</div>
                </div>

                <div className="bg-[#0B1422] p-3 rounded-xl">
                  <div className="text-slate-400">System Free RAM</div>
                  <div className="font-mono font-bold text-[#64C8FF] mt-1">{health.system.memory.freeSystemGB} GB</div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* TAB 2: USER MANAGEMENT */}
        {activeTab === 'users' && (
          <div className="bg-[#172538] rounded-2xl border border-white/5 overflow-hidden">
            <div className="p-4 border-b border-white/5 flex items-center justify-between text-xs">
              <span className="font-bold text-white">Registered Annotators & Admins</span>
              <span className="text-slate-400 font-mono">Count: {users.length}</span>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs text-slate-300">
                <thead className="bg-[#0B1422] text-slate-400 font-mono uppercase text-[10px]">
                  <tr>
                    <th className="p-3">User</th>
                    <th className="p-3">Role</th>
                    <th className="p-3">Organization</th>
                    <th className="p-3">Quota (Minutes)</th>
                    <th className="p-3 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-white/5">
                  {users.map(u => (
                    <tr key={u.id} className="hover:bg-white/[0.02]">
                      <td className="p-3">
                        <div className="font-semibold text-white">{u.name}</div>
                        <div className="text-slate-500 font-mono text-[11px]">{u.email}</div>
                      </td>
                      <td className="p-3">
                        <select
                          value={u.role}
                          onChange={(e) => handleUpdateRole(u.id, e.target.value)}
                          className="bg-[#0B1422] border border-white/10 rounded px-2 py-1 text-white font-mono text-xs"
                        >
                          <option value="user">User</option>
                          <option value="reviewer">Reviewer</option>
                          <option value="admin">Admin</option>
                        </select>
                      </td>
                      <td className="p-3">{u.organization || 'Independent'}</td>
                      <td className="p-3 font-mono">
                        <input
                          type="number"
                          defaultValue={u.quotaMinutes}
                          onBlur={(e) => handleUpdateQuota(u.id, parseInt(e.target.value, 10))}
                          className="w-20 bg-[#0B1422] border border-white/10 rounded px-2 py-1 text-white"
                        />
                      </td>
                      <td className="p-3 text-right">
                        <button
                          onClick={() => handleDeleteUser(u.id)}
                          className="p-1.5 rounded hover:bg-red-500/20 text-slate-500 hover:text-red-400"
                          title="Delete user account"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* TAB 3: AUDIT TRAIL */}
        {activeTab === 'logs' && (
          <div className="bg-[#172538] rounded-2xl border border-white/5 overflow-hidden">
            <div className="p-4 border-b border-white/5 text-xs font-bold text-white">
              System Audit Trails ({auditLogs.length})
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs text-slate-300">
                <thead className="bg-[#0B1422] text-slate-400 font-mono uppercase text-[10px]">
                  <tr>
                    <th className="p-3">Timestamp</th>
                    <th className="p-3">User</th>
                    <th className="p-3">Action</th>
                    <th className="p-3">Entity</th>
                    <th className="p-3">Details</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-white/5 font-mono text-[11px]">
                  {auditLogs.map((log, i) => (
                    <tr key={i} className="hover:bg-white/[0.02]">
                      <td className="p-3 text-slate-500">{new Date(log.createdAt).toLocaleTimeString()}</td>
                      <td className="p-3 text-white">{log.userEmail}</td>
                      <td className="p-3 text-[#52DDBB]">{log.action}</td>
                      <td className="p-3 text-[#64C8FF]">{log.entityType}</td>
                      <td className="p-3 text-slate-400 truncate max-w-xs">{JSON.stringify(log.details)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

      </main>

      <Footer />
    </div>
  );
};
