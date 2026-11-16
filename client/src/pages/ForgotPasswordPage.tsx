import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { KeyRound, ArrowLeft, CheckCircle2, AlertCircle } from 'lucide-react';
import { authApi } from '../services/api';
import { Navbar } from '../components/common/Navbar';

export const ForgotPasswordPage: React.FC = () => {
  const [email, setEmail] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [demoToken, setDemoToken] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    try {
      const resp = await authApi.forgotPassword(email);
      setSubmitted(true);
      if (resp.data.demoResetToken) {
        setDemoToken(resp.data.demoResetToken);
      }
    } catch (err) {
      alert('Error requesting reset');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#0B1422] text-[#F5F8FC] flex flex-col">
      <Navbar />

      <div className="flex-1 flex items-center justify-center p-4 py-12">
        <div className="w-full max-w-md bg-[#172538] border border-white/10 rounded-2xl p-6 sm:p-8 shadow-2xl">
          
          <div className="text-center mb-6">
            <div className="w-12 h-12 mx-auto mb-3 rounded-full bg-[#52DDBB]/10 text-[#52DDBB] flex items-center justify-center">
              <KeyRound className="w-6 h-6" />
            </div>
            <h2 className="font-heading font-bold text-2xl text-white">
              Reset Password
            </h2>
            <p className="text-xs text-[#94A3B8] mt-1">
              Enter your registered email address to receive reset instructions
            </p>
          </div>

          {submitted ? (
            <div className="space-y-4 text-center">
              <div className="p-4 rounded-xl bg-[#10B981]/10 border border-[#10B981]/30 text-[#10B981] text-xs flex items-center gap-2 text-left">
                <CheckCircle2 className="w-5 h-5 shrink-0" />
                <span>Password reset instructions have been generated. Check your inbox.</span>
              </div>

              {demoToken && (
                <div className="p-3 rounded-xl bg-[#0B1422] border border-white/10 text-left space-y-1.5 font-mono text-xs">
                  <span className="text-slate-400 text-[10px] uppercase">Direct Demo Reset Token:</span>
                  <div className="text-[#52DDBB] break-all select-all bg-white/5 p-2 rounded">
                    {demoToken}
                  </div>
                </div>
              )}

              <Link
                to="/login"
                className="inline-flex items-center gap-1.5 text-xs text-[#52DDBB] hover:underline"
              >
                <ArrowLeft className="w-3.5 h-3.5" />
                <span>Return to Sign In</span>
              </Link>
            </div>
          ) : (
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
                  placeholder="admin@voxalign.ai"
                  className="w-full bg-[#0B1422] border border-white/10 rounded-lg px-3 py-2 text-white focus:outline-none focus:border-[#52DDBB]"
                />
              </div>

              <button
                type="submit"
                disabled={isSubmitting}
                className="w-full py-2.5 rounded-xl bg-gradient-to-r from-[#52DDBB] to-[#64C8FF] text-[#0B1422] font-heading font-bold text-sm flex items-center justify-center gap-2 hover:shadow-lg hover:shadow-[#52DDBB]/20 transition-all disabled:opacity-50"
              >
                <span>{isSubmitting ? 'Sending...' : 'Send Reset Link'}</span>
              </button>

              <div className="text-center pt-2">
                <Link to="/login" className="text-xs text-slate-400 hover:text-white flex items-center justify-center gap-1">
                  <ArrowLeft className="w-3.5 h-3.5" /> Back to Sign In
                </Link>
              </div>
            </form>
          )}

        </div>
      </div>
    </div>
  );
};
