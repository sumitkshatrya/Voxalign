import React, { useState } from 'react';
import { User, Shield, Building, Clock, Save, CheckCircle2 } from 'lucide-react';
import { useAuthStore } from '../store/authStore';
import { authApi } from '../services/api';
import { Navbar } from '../components/common/Navbar';
import { Footer } from '../components/common/Footer';

export const ProfilePage: React.FC = () => {
  const { user, updateUser } = useAuthStore();
  const [name, setName] = useState(user?.name || '');
  const [organization, setOrganization] = useState(user?.organization || '');
  const [isSaving, setIsSaving] = useState(false);
  const [message, setMessage] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSaving(true);
    setMessage(null);

    try {
      const resp = await authApi.updateProfile({ name, organization });
      updateUser(resp.data.user);
      setMessage('Profile updated successfully!');
      setTimeout(() => setMessage(null), 3000);
    } catch (err: any) {
      alert(err.toString());
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#0B1422] text-[#F5F8FC] flex flex-col">
      <Navbar />

      <main className="flex-1 max-w-3xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-8">
        
        <div className="pb-4 border-b border-white/10">
          <h1 className="font-heading font-bold text-2xl text-white">
            User Account & Preferences
          </h1>
          <p className="text-xs text-[#94A3B8] mt-1">
            Manage your annotator profile, organization affiliation and quota allocation
          </p>
        </div>

        {message && (
          <div className="p-3 rounded-xl bg-[#10B981]/10 border border-[#10B981]/30 text-[#10B981] text-xs flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 shrink-0" />
            <span>{message}</span>
          </div>
        )}

        <div className="bg-[#172538] rounded-2xl border border-white/5 p-6 space-y-6">
          
          {/* PROFILE CARD */}
          <div className="flex items-center gap-4 pb-6 border-b border-white/5">
            <div className="w-16 h-16 rounded-2xl bg-gradient-to-tr from-[#52DDBB] to-[#64C8FF] text-[#0B1422] font-extrabold text-2xl flex items-center justify-center shadow-lg shadow-[#52DDBB]/10">
              {user?.name?.charAt(0) || 'U'}
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="font-heading font-bold text-lg text-white">{user?.name}</h3>
                <span className="text-[10px] font-mono px-2 py-0.5 rounded uppercase bg-[#52DDBB]/10 text-[#52DDBB] border border-[#52DDBB]/20">
                  {user?.role}
                </span>
              </div>
              <p className="text-xs text-[#94A3B8] font-mono mt-0.5">{user?.email}</p>
              <p className="text-xs text-slate-400 mt-1">{user?.organization || 'Independent Speech Annotator'}</p>
            </div>
          </div>

          {/* QUOTA STATS */}
          <div className="grid grid-cols-2 gap-4 bg-[#0B1422] p-4 rounded-xl border border-white/5">
            <div>
              <div className="text-[11px] text-slate-400 flex items-center gap-1.5 mb-1">
                <Clock className="w-3.5 h-3.5 text-[#52DDBB]" />
                Speech Processing Quota
              </div>
              <div className="text-xl font-bold font-mono text-white">
                {user?.usedMinutes || 0} / {user?.quotaMinutes || 120} mins
              </div>
            </div>

            <div>
              <div className="text-[11px] text-slate-400 flex items-center gap-1.5 mb-1">
                <Shield className="w-3.5 h-3.5 text-[#64C8FF]" />
                Guidelines Compliance Level
              </div>
              <div className="text-xl font-bold font-mono text-[#52DDBB]">
                hi_IN Certified
              </div>
            </div>
          </div>

          {/* EDIT FORM */}
          <form onSubmit={handleSubmit} className="space-y-4 text-xs">
            <div>
              <label className="block font-semibold text-slate-300 mb-1">
                Display Name
              </label>
              <input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="w-full bg-[#0B1422] border border-white/10 rounded-lg px-3 py-2 text-white focus:outline-none focus:border-[#52DDBB]"
              />
            </div>

            <div>
              <label className="block font-semibold text-slate-300 mb-1">
                Organization / Team
              </label>
              <input
                type="text"
                value={organization}
                onChange={(e) => setOrganization(e.target.value)}
                className="w-full bg-[#0B1422] border border-white/10 rounded-lg px-3 py-2 text-white focus:outline-none focus:border-[#52DDBB]"
              />
            </div>

            <div className="pt-2 flex justify-end">
              <button
                type="submit"
                disabled={isSaving}
                className="px-5 py-2.5 rounded-xl bg-gradient-to-r from-[#52DDBB] to-[#64C8FF] text-[#0B1422] font-bold text-xs flex items-center gap-2 hover:shadow-lg hover:shadow-[#52DDBB]/20 transition-all disabled:opacity-50"
              >
                <Save className="w-4 h-4" />
                <span>{isSaving ? 'Saving...' : 'Save Profile'}</span>
              </button>
            </div>
          </form>

        </div>

      </main>

      <Footer />
    </div>
  );
};
