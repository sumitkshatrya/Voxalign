import React, { useState } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { 
  Sun, Moon, Shield, User as UserIcon, LogOut, 
  FolderKanban, LayoutDashboard, Sliders, Menu, X, Clock
} from 'lucide-react';
import { useAuthStore } from '../../store/authStore';
import { useWorkspaceStore } from '../../store/workspaceStore';

export const Navbar: React.FC = () => {
  const { user, logout, theme, setTheme } = useAuthStore();
  const { currentProject } = useWorkspaceStore();
  const navigate = useNavigate();
  const location = useLocation();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [profileDropdownOpen, setProfileDropdownOpen] = useState(false);

  const handleLogout = async () => {
    await logout();
    navigate('/login');
  };

  const isWorkspace = location.pathname.includes('/workspace');

  return (
    <nav className="border-b border-white/10 bg-[#0B1422]/90 backdrop-blur-md sticky top-0 z-50 transition-colors">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          
          {/* LEFT: Brand Logo & Wordmark */}
          <div className="flex items-center gap-6">
            <Link to={user ? "/dashboard" : "/"} className="flex items-center gap-3 group">
              <div className="w-9 h-9 relative flex items-center justify-center">
                <img 
                  src="/brand/voxalign-icon.svg" 
                  alt="VoxAlign" 
                  className="w-9 h-9 transition-transform duration-300 group-hover:scale-105" 
                />
              </div>
              <div className="flex flex-col">
                <div className="flex items-baseline">
                  <span className="font-heading font-bold text-xl tracking-tight text-[#F5F8FC]">Vox</span>
                  <span className="font-heading font-bold text-xl tracking-tight bg-gradient-to-r from-[#52DDBB] to-[#64C8FF] bg-clip-text text-transparent">Align</span>
                </div>
                <span className="font-mono text-[8px] uppercase tracking-wider text-[#94A3B8] -mt-1 hidden sm:block">
                  Every Word. Every Second.
                </span>
              </div>
            </Link>

            {/* Breadcrumb if inside project */}
            {currentProject && isWorkspace && (
              <div className="hidden md:flex items-center gap-2 pl-4 border-l border-white/10 text-sm">
                <span className="text-[#94A3B8] font-mono text-xs">Project:</span>
                <span className="font-medium text-[#F5F8FC] truncate max-w-[200px]">
                  {currentProject.name}
                </span>
                <span className="bg-[#52DDBB]/10 text-[#52DDBB] text-[10px] font-mono px-2 py-0.5 rounded-full border border-[#52DDBB]/30">
                  {currentProject.guidelinesProfile}
                </span>
              </div>
            )}
          </div>

          {/* CENTER: Navigation Links */}
          {user && (
            <div className="hidden md:flex items-center gap-1">
              <Link
                to="/dashboard"
                className={`px-3 py-2 rounded-lg text-sm font-medium transition-colors flex items-center gap-2 ${
                  location.pathname === '/dashboard' 
                    ? 'bg-white/10 text-[#52DDBB]' 
                    : 'text-[#94A3B8] hover:text-[#F5F8FC] hover:bg-white/5'
                }`}
              >
                <LayoutDashboard className="w-4 h-4" />
                Dashboard
              </Link>

              <Link
                to="/projects"
                className={`px-3 py-2 rounded-lg text-sm font-medium transition-colors flex items-center gap-2 ${
                  location.pathname.startsWith('/projects') || isWorkspace
                    ? 'bg-white/10 text-[#52DDBB]' 
                    : 'text-[#94A3B8] hover:text-[#F5F8FC] hover:bg-white/5'
                }`}
              >
                <FolderKanban className="w-4 h-4" />
                Projects
              </Link>

              {user.role === 'admin' && (
                <Link
                  to="/admin"
                  className={`px-3 py-2 rounded-lg text-sm font-medium transition-colors flex items-center gap-2 ${
                    location.pathname.startsWith('/admin') 
                      ? 'bg-white/10 text-[#64C8FF]' 
                      : 'text-[#94A3B8] hover:text-[#F5F8FC] hover:bg-white/5'
                  }`}
                >
                  <Shield className="w-4 h-4 text-[#64C8FF]" />
                  Admin Console
                </Link>
              )}
            </div>
          )}

          {/* RIGHT: Quota, Theme Toggle, Profile */}
          <div className="hidden md:flex items-center gap-3">
            {user && (
              <div className="flex items-center gap-2 bg-[#172538] px-3 py-1.5 rounded-lg border border-white/5">
                <Clock className="w-3.5 h-3.5 text-[#52DDBB]" />
                <div className="flex flex-col text-[11px]">
                  <span className="text-[#94A3B8]">Quota: <strong className="text-[#F5F8FC] font-mono">{user.usedMinutes}/{user.quotaMinutes}m</strong></span>
                </div>
              </div>
            )}

            {/* Theme Toggle */}
            <button
              onClick={() => setTheme(theme === 'dark' ? 'light' : 'dark')}
              className="p-2 rounded-lg text-[#94A3B8] hover:text-[#F5F8FC] hover:bg-white/5 transition-colors"
              title="Toggle theme"
            >
              {theme === 'dark' ? <Sun className="w-4 h-4 text-amber-400" /> : <Moon className="w-4 h-4 text-blue-400" />}
            </button>

            {user ? (
              <div className="relative">
                <button
                  onClick={() => setProfileDropdownOpen(!profileDropdownOpen)}
                  className="flex items-center gap-2 pl-2 pr-3 py-1.5 rounded-lg bg-white/5 hover:bg-white/10 border border-white/10 transition-colors"
                >
                  <div className="w-7 h-7 rounded-full bg-gradient-to-tr from-[#52DDBB] to-[#64C8FF] flex items-center justify-center text-[#0B1422] font-bold text-xs">
                    {user.name.charAt(0)}
                  </div>
                  <span className="text-sm font-medium text-[#F5F8FC] max-w-[120px] truncate">{user.name}</span>
                  <span className="text-[10px] font-mono uppercase px-1.5 py-0.5 rounded bg-white/10 text-[#52DDBB]">
                    {user.role}
                  </span>
                </button>

                {profileDropdownOpen && (
                  <div className="absolute right-0 mt-2 w-56 rounded-xl bg-[#172538] border border-white/10 shadow-2xl py-2 z-50 animate-in fade-in zoom-in-95 duration-100">
                    <div className="px-4 py-2 border-b border-white/5">
                      <p className="text-xs text-[#94A3B8]">Signed in as</p>
                      <p className="text-sm font-medium text-[#F5F8FC] truncate">{user.email}</p>
                      <p className="text-[11px] text-[#52DDBB] font-mono mt-0.5">{user.organization || 'Independent Annotator'}</p>
                    </div>

                    <div className="py-1">
                      <Link
                        to="/profile"
                        onClick={() => setProfileDropdownOpen(false)}
                        className="flex items-center gap-2 px-4 py-2 text-sm text-[#94A3B8] hover:text-[#F5F8FC] hover:bg-white/5"
                      >
                        <UserIcon className="w-4 h-4" />
                        Account Profile
                      </Link>

                      {user.role === 'admin' && (
                        <Link
                          to="/admin"
                          onClick={() => setProfileDropdownOpen(false)}
                          className="flex items-center gap-2 px-4 py-2 text-sm text-[#64C8FF] hover:bg-white/5"
                        >
                          <Shield className="w-4 h-4" />
                          Platform Admin
                        </Link>
                      )}
                    </div>

                    <div className="border-t border-white/5 pt-1">
                      <button
                        onClick={handleLogout}
                        className="w-full flex items-center gap-2 px-4 py-2 text-sm text-red-400 hover:bg-red-500/10 transition-colors"
                      >
                        <LogOut className="w-4 h-4" />
                        Sign Out
                      </button>
                    </div>
                  </div>
                )}
              </div>
            ) : (
              <div className="flex items-center gap-3">
                <Link
                  to="/login"
                  className="px-4 py-2 text-sm font-medium text-[#F5F8FC] hover:text-[#52DDBB] transition-colors"
                >
                  Sign In
                </Link>
                <Link
                  to="/register"
                  className="px-4 py-2 text-sm font-medium rounded-lg bg-gradient-to-r from-[#52DDBB] to-[#64C8FF] text-[#0B1422] font-semibold hover:shadow-lg hover:shadow-[#52DDBB]/20 transition-all"
                >
                  Get Started
                </Link>
              </div>
            )}
          </div>

          {/* Mobile hamburger button */}
          <div className="flex md:hidden items-center gap-2">
            <button
              onClick={() => setTheme(theme === 'dark' ? 'light' : 'dark')}
              className="p-2 text-[#94A3B8]"
            >
              {theme === 'dark' ? <Sun className="w-4 h-4 text-amber-400" /> : <Moon className="w-4 h-4 text-blue-400" />}
            </button>
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="p-2 text-[#F5F8FC] hover:bg-white/10 rounded-lg"
            >
              {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile drawer */}
      {mobileMenuOpen && (
        <div className="md:hidden border-t border-white/10 bg-[#0B1422] px-4 pt-2 pb-6 space-y-3">
          {user ? (
            <>
              <div className="py-2 border-b border-white/10">
                <p className="text-sm font-semibold text-[#F5F8FC]">{user.name}</p>
                <p className="text-xs text-[#94A3B8]">{user.email}</p>
                <div className="mt-2 text-xs text-[#52DDBB] font-mono">
                  Quota Remaining: {user.quotaMinutes - user.usedMinutes} mins
                </div>
              </div>
              <Link
                to="/dashboard"
                onClick={() => setMobileMenuOpen(false)}
                className="block py-2 text-base font-medium text-[#F5F8FC]"
              >
                Dashboard
              </Link>
              <Link
                to="/projects"
                onClick={() => setMobileMenuOpen(false)}
                className="block py-2 text-base font-medium text-[#F5F8FC]"
              >
                Projects
              </Link>
              {user.role === 'admin' && (
                <Link
                  to="/admin"
                  onClick={() => setMobileMenuOpen(false)}
                  className="block py-2 text-base font-medium text-[#64C8FF]"
                >
                  Admin Console
                </Link>
              )}
              <button
                onClick={handleLogout}
                className="w-full text-left py-2 text-base font-medium text-red-400"
              >
                Sign Out
              </button>
            </>
          ) : (
            <div className="flex flex-col gap-2 pt-2">
              <Link
                to="/login"
                onClick={() => setMobileMenuOpen(false)}
                className="w-full text-center py-2 text-sm font-medium border border-white/10 rounded-lg text-[#F5F8FC]"
              >
                Sign In
              </Link>
              <Link
                to="/register"
                onClick={() => setMobileMenuOpen(false)}
                className="w-full text-center py-2 text-sm font-semibold rounded-lg bg-gradient-to-r from-[#52DDBB] to-[#64C8FF] text-[#0B1422]"
              >
                Get Started
              </Link>
            </div>
          )}
        </div>
      )}
    </nav>
  );
};
