import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowRight, Trophy, Heart, TrendingUp, ShieldCheck } from 'lucide-react';
import { useCharityStore } from '../../store/useCharityStore';
import { useAuthStore } from '../../store/useAuthStore';
import { Button } from '../../components/ui/Button';

export const Home = () => {
  const navigate = useNavigate();
  const { charities, fetchCharities, error: charitiesError } = useCharityStore();
  const { user, isAuthenticated } = useAuthStore();
  const [charitiesLoaded, setCharitiesLoaded] = useState(false);

  useEffect(() => {
    fetchCharities().finally(() => setCharitiesLoaded(true));
  }, [fetchCharities]);

  // Prefer featured charities; fall back to any charities if none are flagged as featured.
  const featured = charities.filter(c => c.isFeatured);
  const featuredCharities = (featured.length > 0 ? featured : charities).slice(0, 3);
  const targetDashboard = user?.role === 'admin' ? '/admin' : '/dashboard';

  return (
    <div className="min-h-screen bg-bg-base text-text-main flex flex-col font-sans selection:bg-primary/20 selection:text-primary">
      
      {/* Top Navigation */}
      <nav className="fixed top-0 w-full z-50 bg-bg-base/80 backdrop-blur-xl border-b border-white/[0.07]">
        <div className="max-w-7xl mx-auto px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-zinc-900 border border-white/10 flex items-center justify-center font-bold text-xs tracking-wider text-text-main shadow-inner">
              DH
            </div>
            <div className="flex flex-col">
              <span className="font-semibold text-sm tracking-tight text-text-main">Digital Heroes</span>
              <span className="text-[10px] text-text-subtle font-mono uppercase tracking-widest">Club & Draws</span>
            </div>
          </div>
          <div className="flex items-center gap-3">
            {isAuthenticated ? (
              <Button onClick={() => navigate(targetDashboard)}>
                {user?.role === 'admin' ? 'Command Center' : 'Go to Dashboard'}
                <ArrowRight size={15} />
              </Button>
            ) : (
              <>
                <Button variant="ghost" onClick={() => navigate('/login')} className="text-xs">
                  Sign In
                </Button>
                <Button onClick={() => navigate('/login')} className="text-xs">
                  Join the Club
                </Button>
              </>
            )}
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="relative pt-36 pb-20 px-6 lg:pt-44 lg:pb-28 max-w-7xl mx-auto flex flex-col items-center text-center">
        {/* Subtle Grid Pattern */}
        <div className="absolute inset-0 bg-[linear-gradient(to_right,#ffffff05_1px,transparent_1px),linear-gradient(to_bottom,#ffffff05_1px,transparent_1px)] bg-[size:4rem_4rem] [mask-image:radial-gradient(ellipse_60%_50%_at_50%_40%,#000_70%,transparent_100%)] pointer-events-none" />

        {/* Category Pill */}
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/[0.03] border border-white/10 text-xs text-text-muted mb-8 z-10">
          <span className="w-1.5 h-1.5 rounded-full bg-primary" />
          <span className="font-medium tracking-wide">Performance Tracking & Philanthropy</span>
        </div>
        
        <h1 className="text-4xl sm:text-6xl lg:text-7xl font-bold tracking-tight mb-6 max-w-4xl z-10 leading-[1.08]">
          Track Your Performance. <br className="hidden sm:inline" />
          <span className="text-transparent bg-clip-text bg-gradient-to-r from-text-main via-zinc-200 to-zinc-400">
            Fuel Meaningful Impact.
          </span>
        </h1>
        
        <p className="text-base sm:text-lg text-text-muted max-w-2xl mb-10 z-10 font-normal leading-relaxed">
          Log standard Stableford scores, enter monthly jackpot draws, and automatically route a portion of your membership to accredited charity partners.
        </p>
        
        <div className="flex flex-col sm:flex-row gap-3 z-10 w-full sm:w-auto">
          <Button 
            className="px-6 py-2.5 text-sm font-semibold" 
            onClick={() => navigate(isAuthenticated ? targetDashboard : '/login')}
          >
            {isAuthenticated ? 'Open Dashboard' : 'Get Started with Membership'}
            <ArrowRight size={16} />
          </Button>
          <Button 
            variant="secondary" 
            className="px-6 py-2.5 text-sm"
            onClick={() => {
              const el = document.getElementById('charities');
              el?.scrollIntoView({ behavior: 'smooth' });
            }}
          >
            Explore Featured Causes
          </Button>
        </div>

        {/* Metric Bar */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-20 w-full max-w-4xl pt-10 border-t border-white/[0.08] z-10">
          <div className="p-4 rounded-xl bg-white/[0.02] border border-white/[0.05]">
            <p className="text-2xl font-bold text-text-main">5-Score</p>
            <p className="text-xs text-text-muted mt-0.5">Rolling History Engine</p>
          </div>
          <div className="p-4 rounded-xl bg-white/[0.02] border border-white/[0.05]">
            <p className="text-2xl font-bold text-jackpot">Monthly</p>
            <p className="text-xs text-text-muted mt-0.5">Jackpot Prize Draws</p>
          </div>
          <div className="p-4 rounded-xl bg-white/[0.02] border border-white/[0.05]">
            <p className="text-2xl font-bold text-primary">10% - 100%</p>
            <p className="text-xs text-text-muted mt-0.5">Custom Charity Allocation</p>
          </div>
          <div className="p-4 rounded-xl bg-white/[0.02] border border-white/[0.05]">
            <p className="text-2xl font-bold text-text-main">Stripe Verified</p>
            <p className="text-xs text-text-muted mt-0.5">Secure Subscription Billing</p>
          </div>
        </div>
      </section>

      {/* How It Works Section */}
      <section className="py-24 bg-bg-surface/50 border-y border-white/[0.07] px-6">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-16">
            <span className="text-xs font-semibold text-primary uppercase tracking-widest font-mono">Workflow Architecture</span>
            <h2 className="text-3xl font-bold tracking-tight mt-2 mb-3">How Digital Heroes Works</h2>
            <p className="text-text-muted text-sm max-w-xl mx-auto">One seamless subscription connects your round scores with jackpot eligibility and direct charitable contributions.</p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="bg-bg-surface border border-white/[0.07] rounded-xl p-6 hover:border-white/20 transition-all">
              <div className="w-10 h-10 rounded-lg bg-zinc-900 border border-white/10 flex items-center justify-center text-primary mb-5 shadow-inner">
                <TrendingUp size={20} />
              </div>
              <h3 className="text-lg font-semibold mb-2">1. Record Performance</h3>
              <p className="text-sm text-text-muted leading-relaxed">
                Log your Stableford points (1–45) after each round. The system preserves your latest 5 verified entries as your active entry ticket numbers.
              </p>
            </div>
            
            <div className="bg-bg-surface border border-white/[0.07] rounded-xl p-6 hover:border-white/20 transition-all">
              <div className="w-10 h-10 rounded-lg bg-zinc-900 border border-white/10 flex items-center justify-center text-jackpot mb-5 shadow-inner">
                <Trophy size={20} />
              </div>
              <h3 className="text-lg font-semibold mb-2">2. Monthly Prize Draws</h3>
              <p className="text-sm text-text-muted leading-relaxed">
                Draws run monthly with frequency-weighted algorithms. Match 3, 4, or 5 numbers to unlock tier payouts. Unclaimed tier 5 pots automatically roll over.
              </p>
            </div>

            <div className="bg-bg-surface border border-white/[0.07] rounded-xl p-6 hover:border-white/20 transition-all">
              <div className="w-10 h-10 rounded-lg bg-zinc-900 border border-white/10 flex items-center justify-center text-secondary mb-5 shadow-inner">
                <Heart size={20} />
              </div>
              <h3 className="text-lg font-semibold mb-2">3. Direct Philanthropy</h3>
              <p className="text-sm text-text-muted leading-relaxed">
                Choose which verified foundation receives your impact. Allocate between 10% and 100% of your membership contribution with complete transparency.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Charity Spotlight Section */}
      <section id="charities" className="py-24 px-6 max-w-7xl mx-auto w-full">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-end mb-12 gap-4">
          <div>
            <span className="text-xs font-semibold text-primary uppercase tracking-widest font-mono">Impact Partners</span>
            <h2 className="text-2xl sm:text-3xl font-bold tracking-tight mt-1">Featured Charitable Causes</h2>
            <p className="text-text-muted text-sm mt-1">Verified partner organizations supported by member contributions.</p>
          </div>
          <Button variant="ghost" onClick={() => navigate('/login')} className="text-xs">
            Join to Select Cause <ArrowRight size={14} />
          </Button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {featuredCharities.length > 0 ? (
            featuredCharities.map(charity => (
              <div 
                key={charity._id} 
                className="bg-bg-surface border border-white/[0.07] rounded-xl p-6 flex flex-col justify-between hover:border-white/20 transition-all"
              >
                <div>
                  <div className="flex items-center justify-between mb-4">
                    <span className="text-[10px] font-mono uppercase tracking-wider px-2 py-0.5 rounded bg-primary/10 text-primary border border-primary/20">
                      Featured Cause
                    </span>
                    <Heart size={16} className="text-text-subtle" />
                  </div>
                  <h3 className="text-lg font-semibold text-text-main mb-2">{charity.name}</h3>
                  <p className="text-sm text-text-muted leading-relaxed line-clamp-3">{charity.description}</p>
                </div>
                <div className="mt-6 pt-4 border-t border-white/[0.05] flex items-center justify-between text-xs text-text-subtle">
                  <span>Accredited Partner</span>
                  <span className="text-primary font-medium">Eligible for 10-100% allocation</span>
                </div>
              </div>
            ))
          ) : (
            <div className="col-span-full text-center py-12 border border-white/[0.07] rounded-xl text-text-muted text-sm">
              {!charitiesLoaded ? (
                'Loading charities…'
              ) : charitiesError ? (
                <div className="flex flex-col items-center gap-3">
                  <p>{charitiesError}</p>
                  <Button variant="secondary" className="text-xs" onClick={fetchCharities}>
                    Try again
                  </Button>
                </div>
              ) : (
                'No charities have been added yet.'
              )}
            </div>
          )}
        </div>
      </section>

      {/* Trust & Footer */}
      <footer className="bg-bg-surface/60 py-10 px-6 border-t border-white/[0.07] mt-auto">
        <div className="max-w-7xl mx-auto flex flex-col sm:flex-row justify-between items-center gap-4 text-xs text-text-subtle">
          <div className="flex items-center gap-2 text-text-muted">
            <ShieldCheck size={16} className="text-primary" />
            <span>Stripe PCI-DSS Compliant • Algorithmic Draw Transparency</span>
          </div>
          <p>© 2026 Digital Heroes. Performance tracking and charity gaming platform.</p>
        </div>
      </footer>
    </div>
  );
};