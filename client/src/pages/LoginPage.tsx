import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { LogIn, ArrowRight, Shield, User, AlertCircle, Sparkles } from 'lucide-react';
import { useAuthStore } from '../store/authStore';
import { Navbar } from '../components/common/Navbar';

export const LoginPage: React.FC = () => {
  const { login, isLoading, error } = useAuthStore();
  const navigate = useNavigate();

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [localError, setLocalError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLocalError(null);

    try {
      await login({ email, password });
      navigate('/dashboard');
    } catch (err: any) {
      setLocalError(err.toString());
    }
  };

  const fillDemoAccount = (demoEmail: string, demoPass: string) => {
    setEmail(demoEmail);
    setPassword(demoPass);
    setLocalError(null);
  };

  return (
    <div className="min-h-screen bg-[#0B1422] text-[#F5F8FC] flex flex-col">
      <Navbar />

      <div className="flex-1 flex items-center justify-center p-4 py-12 relative">
        {/* Glow backdrop */}
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[450px] h-[300px] bg-gradient-to-tr from-[#52DDBB]/10 to-[#64C8FF]/10 blur-[100px] pointer-events-none rounded-full" />

        <div className="w-full max-w-md bg-[#172538] border border-white/10 rounded-2xl p-6 sm:p-8 shadow-2xl relative z-10">
          
          <div className="text-center mb-6">
            <div className="w-12 h-12 mx-auto mb-3 flex items-center justify-center">
              <img src="/brand/voxalign-icon.svg" alt="VoxAlign" className="w-10 h-10" />
            </div>
            <h2 className="font-heading font-bold text-2xl text-white">
              Welcome back
            </h2>
            <p className="text-xs text-[#94A3B8] mt-1">
              Sign in to your VoxAlign speech annotation workspace
            </p>
          </div>

          {/* QUICK DEMO LOGIN BUTTONS */}
          <div className="mb-6 p-3 rounded-xl bg-[#0B1422] border border-white/5 space-y-2">
            <span className="block text-[10px] font-mono uppercase tracking-wider text-slate-400">
              Instant Demo Access:
            </span>
            <div className="grid grid-cols-2 gap-2">
              <button
                type="button"
                onClick={() => fillDemoAccount('admin@voxalign.ai', 'Admin@123456')}
                className="px-2.5 py-1.5 rounded-lg bg-white/5 hover:bg-white/10 text-left border border-white/10 transition-colors"
              >
                <div className="flex items-center gap-1.5 text-xs font-semibold text-[#64C8FF]">
                  <Shield className="w-3.5 h-3.5" />
                  <span>Admin User</span>
                </div>
                <div className="text-[10px] text-slate-400 truncate">admin@voxalign.ai</div>
              </button>

              <button
                type="button"
                onClick={() => fillDemoAccount('annotator@voxalign.ai', 'Annotator@123456')}
                className="px-2.5 py-1.5 rounded-lg bg-white/5 hover:bg-white/10 text-left border border-white/10 transition-colors"
              >
                <div className="flex items-center gap-1.5 text-xs font-semibold text-[#52DDBB]">
                  <User className="w-3.5 h-3.5" />
                  <span>Annotator</span>
                </div>
                <div className="text-[10px] text-slate-400 truncate">annotator@voxalign.ai</div>
              </button>
            </div>
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
                Email Address
              </label>
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="name@organization.com"
                className="w-full bg-[#0B1422] border border-white/10 rounded-lg px-3 py-2 text-white focus:outline-none focus:border-[#52DDBB]"
              />
            </div>

            <div>
              <div className="flex items-center justify-between mb-1">
                <label className="font-semibold text-slate-300">
                  Password
                </label>
                <Link to="/forgot-password" className="text-[11px] text-[#52DDBB] hover:underline">
                  Forgot password?
                </Link>
              </div>
              <input
                type="password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                className="w-full bg-[#0B1422] border border-white/10 rounded-lg px-3 py-2 text-white focus:outline-none focus:border-[#52DDBB]"
              />
            </div>

            <button
              type="submit"
              disabled={isLoading}
              className="w-full py-2.5 rounded-xl bg-gradient-to-r from-[#52DDBB] to-[#64C8FF] text-[#0B1422] font-heading font-bold text-sm flex items-center justify-center gap-2 hover:shadow-lg hover:shadow-[#52DDBB]/20 transition-all disabled:opacity-50"
            >
              <LogIn className="w-4 h-4" />
              <span>{isLoading ? 'Signing in...' : 'Sign In'}</span>
            </button>
          </form>

          <div className="mt-6 text-center text-xs text-[#94A3B8]">
            Don't have an account?{' '}
            <Link to="/register" className="text-[#52DDBB] font-semibold hover:underline">
              Register now
            </Link>
          </div>

        </div>
      </div>
    </div>
  );
};
