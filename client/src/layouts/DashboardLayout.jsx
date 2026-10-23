import { Outlet, useNavigate, useLocation } from 'react-router-dom';
import { LogOut, ShieldAlert, LayoutDashboard } from 'lucide-react';
import { useAuthStore } from '../store/useAuthStore';
import { Button } from '../components/ui/Button';

export const DashboardLayout = () => {
  const { user, logout } = useAuthStore();
  const navigate = useNavigate();
  const location = useLocation();

  const handleLogout = async () => {
    await logout();
    navigate('/login');
  };

  const isAdmin = user?.role === 'admin';
  const isActive = user?.subscription?.status === 'active';

  return (
    <div className="min-h-screen bg-bg-base flex flex-col font-sans">
      {/* Top Navigation */}
      <header className="sticky top-0 z-50 bg-bg-base/80 backdrop-blur-xl border-b border-white/[0.08] px-6 py-3.5">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-6">
            <div 
              className="flex items-center gap-2.5 cursor-pointer group"
              onClick={() => navigate(isAdmin ? '/admin' : '/dashboard')}
            >
              <div className="w-8 h-8 rounded-lg bg-zinc-900 border border-white/10 flex items-center justify-center font-bold text-xs tracking-wider text-text-main group-hover:border-primary/50 transition-colors">
                DH
              </div>
              <div className="flex flex-col">
                <span className="font-semibold text-sm tracking-tight text-text-main">Digital Heroes</span>
                <span className="text-[10px] text-text-subtle font-mono uppercase tracking-widest">Club & Draws</span>
              </div>
            </div>

            {isAdmin && (
              <div className="flex items-center p-0.5 bg-zinc-900/80 rounded-lg border border-white/[0.06]">
                <button
                  type="button"
                  onClick={() => navigate('/admin')}
                  className={`flex items-center gap-1.5 px-3 py-1.5 rounded-md text-xs font-medium transition-all ${
                    location.pathname === '/admin'
                      ? 'bg-zinc-800 text-text-main shadow-xs'
                      : 'text-text-muted hover:text-text-main'
                  }`}
                >
                  <ShieldAlert size={14} className={location.pathname === '/admin' ? 'text-primary' : ''} />
                  <span>Command Center</span>
                </button>
                <button
                  type="button"
                  onClick={() => navigate('/dashboard')}
                  className={`flex items-center gap-1.5 px-3 py-1.5 rounded-md text-xs font-medium transition-all ${
                    location.pathname === '/dashboard'
                      ? 'bg-zinc-800 text-text-main shadow-xs'
                      : 'text-text-muted hover:text-text-main'
                  }`}
                >
                  <LayoutDashboard size={14} className={location.pathname === '/dashboard' ? 'text-primary' : ''} />
                  <span>User View</span>
                </button>
              </div>
            )}
          </div>
          
          <div className="flex items-center gap-3">
            <div className="hidden sm:flex items-center gap-2 px-3 py-1.5 rounded-lg bg-white/[0.02] border border-white/[0.06] text-xs">
              <span className="relative flex h-2 w-2">
                <span className={`animate-ping absolute inline-flex h-full w-full rounded-full opacity-75 ${isActive || isAdmin ? 'bg-primary' : 'bg-zinc-500'}`} />
                <span className={`relative inline-flex rounded-full h-2 w-2 ${isActive || isAdmin ? 'bg-primary' : 'bg-zinc-500'}`} />
              </span>
              <span className="text-text-muted font-medium">{user?.email}</span>
              {isAdmin ? (
                <span className="text-[10px] bg-primary/10 text-primary px-1.5 py-0.5 rounded border border-primary/20 font-mono font-semibold uppercase">
                  Admin
                </span>
              ) : (
                <span className={`text-[10px] px-1.5 py-0.5 rounded border font-mono font-medium ${
                  isActive ? 'bg-primary/10 text-primary border-primary/20' : 'bg-zinc-800 text-zinc-400 border-zinc-700'
                }`}>
                  {isActive ? 'Active' : 'Inactive'}
                </span>
              )}
            </div>

            <Button variant="ghost" onClick={handleLogout} className="!px-3 !py-1.5 text-xs text-text-muted hover:text-text-main">
              <LogOut size={15} />
              <span className="hidden md:inline">Sign out</span>
            </Button>
          </div>
        </div>
      </header>

      {/* Main Content Area */}
      <main className="flex-1 max-w-7xl w-full mx-auto p-6 md:p-8">
        <Outlet />
      </main>
    </div>
  );
};