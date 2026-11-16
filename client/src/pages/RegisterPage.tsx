import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { UserPlus, AlertCircle, ShieldCheck } from 'lucide-react';
import { useAuthStore } from '../store/authStore';
import { Navbar } from '../components/common/Navbar';

export const RegisterPage: React.FC = () => {
  const { register, isLoading, error } = useAuthStore();
  const navigate = useNavigate();

  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [role, setRole] = useState<'user' | 'reviewer' | 'admin'>('user');
  const [guidelinesAgreed, setGuidelinesAgreed] = useState(true);
  const [localError, setLocalError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLocalError(null);

    if (!guidelinesAgreed) {
      setLocalError('You must acknowledge adherence to the Hindi Alignment Guidelines.');
      return;
    }

    try {
      await register({ name, email, password, role });
      navigate('/dashboard');
    } catch (err: any) {
      setLocalError(err.toString());
    }
  };

  return (
    <div className="min-h-screen bg-[#0B1422] text-[#F5F8FC] flex flex-col">
      <Navbar />

      <div className="flex-1 flex items-center justify-center p-4 py-12 relative">
        <div className="w-full max-w-md bg-[#172538] border border-white/10 rounded-2xl p-6 sm:p-8 shadow-2xl relative z-10">
          
          <div className="text-center mb-6">
            <div className="w-12 h-12 mx-auto mb-3 flex items-center justify-center">
              <img src="/brand/voxalign-icon.svg" alt="VoxAlign" className="w-10 h-10" />
            </div>
            <h2 className="font-heading font-bold text-2xl text-white">
              Create an account
            </h2>
            <p className="text-xs text-[#94A3B8] mt-1">
              Join VoxAlign to transcribe and align audio datasets
            </p>
          </div>

          {(localError || error) && (
            <div className="mb-4 p-3 rounded-xl bg-red-500/10 border border-red-500/20 text-red-300 text-xs flex items-center gap-2">
              <AlertCircle className="w-4 h-4 shrink-0 text-red-400" />
              <span>{localError || error}</span>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4 text-xs">
            <div>
              <label className="block font-semibold text-slate-300 mb-1">
                Full Name
              </label>
              <input
                type="text"
                required
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="Dr. Priya Sharma"
                className="w-full bg-[#0B1422] border border-white/10 rounded-lg px-3 py-2 text-white focus:outline-none focus:border-[#52DDBB]"
              />
            </div>

            <div>
              <label className="block font-semibold text-slate-300 mb-1">
                Email Address
              </label>
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="priya@indic-speech.org"
                className="w-full bg-[#0B1422] border border-white/10 rounded-lg px-3 py-2 text-white focus:outline-none focus:border-[#52DDBB]"
              />
            </div>

            <div>
              <label className="block font-semibold text-slate-300 mb-1">
                Password
              </label>
              <input
                type="password"
                required
                minLength={6}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="At least 6 characters"
                className="w-full bg-[#0B1422] border border-white/10 rounded-lg px-3 py-2 text-white focus:outline-none focus:border-[#52DDBB]"
              />
            </div>

            <div>
              <label className="block font-semibold text-slate-300 mb-1">
                Platform Role
              </label>
              <select
                value={role}
                onChange={(e) => setRole(e.target.value as any)}
                className="w-full bg-[#0B1422] border border-white/10 rounded-lg px-3 py-2 text-white focus:outline-none focus:border-[#52DDBB]"
              >
                <option value="user">Speech Annotator</option>
                <option value="reviewer">Quality Reviewer</option>
                <option value="admin">Platform Administrator</option>
              </select>
            </div>

            <div className="pt-1">
              <label className="flex items-start gap-2 cursor-pointer text-slate-300">
                <input
                  type="checkbox"
                  checked={guidelinesAgreed}
                  onChange={(e) => setGuidelinesAgreed(e.target.checked)}
                  className="mt-0.5 rounded bg-[#0B1422] border-white/20 text-[#52DDBB] focus:ring-0"
                />
                <span className="text-[11px] leading-tight">
                  I agree to annotate audio according to the official Hindi Alignment Guidelines specification (Page 17 checklist).
                </span>
              </label>
            </div>

            <button
              type="submit"
              disabled={isLoading}
              className="w-full py-2.5 rounded-xl bg-gradient-to-r from-[#52DDBB] to-[#64C8FF] text-[#0B1422] font-heading font-bold text-sm flex items-center justify-center gap-2 hover:shadow-lg hover:shadow-[#52DDBB]/20 transition-all disabled:opacity-50"
            >
              <UserPlus className="w-4 h-4" />
              <span>{isLoading ? 'Creating Account...' : 'Create Account'}</span>
            </button>
          </form>

          <div className="mt-6 text-center text-xs text-[#94A3B8]">
            Already registered?{' '}
            <Link to="/login" className="text-[#52DDBB] font-semibold hover:underline">
              Sign In
            </Link>
          </div>

        </div>
      </div>
    </div>
  );
};
