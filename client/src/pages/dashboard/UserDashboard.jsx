import { useState, useEffect } from 'react';
import { Upload, CreditCard, Trophy, Heart, TrendingUp } from 'lucide-react';
import { useDrawStore } from '../../store/useDrawStore';
import { useAuthStore } from '../../store/useAuthStore';
import { Button } from '../../components/ui/Button';
import { ScoreManager } from '../../features/scores/ScoreManager';
import { SubscriptionModal } from '../../features/payment/SubscriptionModal';
import { CharityManager } from '../../features/charities/CharityManager';

const DashboardCard = ({ title, icon: Icon, badge, children, className = "" }) => (
  <div className={`bg-bg-surface border border-white/[0.07] rounded-xl p-5 sm:p-6 flex flex-col shadow-xs ${className}`}>
    <div className="flex items-center justify-between mb-5 pb-4 border-b border-white/[0.06]">
      <div className="flex items-center gap-2.5">
        <div className="w-8 h-8 rounded-lg bg-zinc-900 border border-white/10 flex items-center justify-center text-primary shrink-0 shadow-inner">
          <Icon size={16} />
        </div>
        <h2 className="text-sm font-semibold tracking-tight text-text-main">{title}</h2>
      </div>
      {badge && (
        <span className="text-[10px] font-mono uppercase tracking-wider text-text-muted px-2 py-0.5 rounded bg-white/[0.03] border border-white/[0.06]">
          {badge}
        </span>
      )}
    </div>
    <div className="flex-1 flex flex-col">
      {children}
    </div>
  </div>
);

export const UserDashboard = () => {
  const { user } = useAuthStore();
  const isActive = user?.subscription?.status === 'active';

  const [isSubscriptionModalOpen, setIsSubscriptionModalOpen] = useState(false);

  const { userWinnings, fetchUserWinnings, uploadVerificationProof } = useDrawStore();

  useEffect(() => {
    if (isActive) {
      fetchUserWinnings();
    }
  }, [isActive, fetchUserWinnings]);

  const handleFileUpload = async (drawId, e) => {
    const file = e.target.files[0];
    if (file) {
      await uploadVerificationProof(drawId, file);
    }
  };

  const handleSubscribe = () => {
    setIsSubscriptionModalOpen(true);
  };

  return (
    <>
      <div className="space-y-6 animate-in fade-in duration-300">
        
        {/* Welcome Section */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-4 border-b border-white/[0.06] gap-3">
          <div>
            <h1 className="text-2xl font-bold tracking-tight text-text-main">Member Dashboard</h1>
            <p className="text-xs text-text-muted mt-0.5">Manage your rolling scores, charitable allocation, and monthly draws.</p>
          </div>
          
          <div className="flex items-center gap-2">
            <span className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-mono font-medium border ${
              isActive 
                ? 'bg-primary/10 text-primary border-primary/20' 
                : 'bg-zinc-900 text-zinc-400 border-zinc-800'
            }`}>
              <span className={`w-1.5 h-1.5 rounded-full ${isActive ? 'bg-primary' : 'bg-zinc-500'}`} />
              {isActive ? 'Active Member' : 'Membership Required'}
            </span>
          </div>
        </div>

        {/* Grid Layout */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          
          {/* Module 1: Subscription Status */}
          <DashboardCard title="Membership Status" icon={CreditCard} badge="Plan Details" className="lg:col-span-1">
            <div className="flex-1 flex flex-col justify-center items-center text-center space-y-4 py-4">
              <div className="w-12 h-12 rounded-xl bg-zinc-900 border border-white/10 flex items-center justify-center text-text-muted shadow-inner">
                <CreditCard size={22} className={isActive ? 'text-primary' : 'text-zinc-500'} />
              </div>
              <div>
                <p className="text-lg font-semibold text-text-main">{isActive ? 'Verified Subscriber' : 'Inactive Plan'}</p>
                <p className="text-xs text-text-muted mt-1 max-w-[220px] mx-auto">
                  {isActive 
                    ? `Active coverage${user?.subscription?.renewalDate ? ` • Renews ${new Date(user.subscription.renewalDate).toLocaleDateString()}` : ''}` 
                    : 'Activate subscription to log scores and unlock monthly jackpot entries.'}
                </p>
              </div>
              {!isActive ? (
                <Button onClick={handleSubscribe} className="w-full mt-2 text-xs py-2">
                  Activate Membership
                </Button>
              ) : (
                <div className="text-[11px] text-text-subtle font-mono px-3 py-1 rounded bg-white/[0.02] border border-white/[0.05]">
                  Automated Stripe Renewal
                </div>
              )}
            </div>
          </DashboardCard>

          {/* Module 2: Charity Impact */}
          <DashboardCard title="Charitable Impact" icon={Heart} badge="Direct Philanthropy" className="lg:col-span-2">
             <CharityManager />
          </DashboardCard>

          {/* Module 3: Score Entry */}
          <DashboardCard title="Performance Scoring" icon={TrendingUp} badge="5-Score Rolling Engine" className="lg:col-span-2 min-h-[360px]">
            {isActive ? (
              <ScoreManager />
            ) : (
              <div className="flex flex-col items-center justify-center h-full text-text-muted border border-dashed border-white/[0.08] rounded-xl p-8 text-center text-xs">
                <TrendingUp size={28} className="mb-3 text-zinc-600" />
                <p className="font-medium text-text-muted">Scoring locked for inactive accounts.</p>
                <p className="text-text-subtle mt-1 max-w-sm">An active subscription is required to log Stableford scores and enter monthly prize draws.</p>
                <Button onClick={handleSubscribe} variant="secondary" className="mt-4 text-xs py-2">
                  Activate to Enter Scores
                </Button>
              </div>
            )}
          </DashboardCard>

          {/* Module 4: Winnings & Draws */}
          <DashboardCard title="Draws & Winnings" icon={Trophy} badge="Jackpot Results" className="lg:col-span-1">
            {!isActive ? (
              <div className="flex-1 flex flex-col items-center justify-center text-text-subtle text-center p-6 text-xs border border-dashed border-white/[0.07] rounded-xl">
                <Trophy size={24} className="mb-2 opacity-30 text-text-muted" />
                <p>Subscribe to participate in upcoming monthly draws and claim verified prizes.</p>
              </div>
            ) : (
              <div className="space-y-3.5 overflow-y-auto flex-1 pr-1">
                {/* Total Won Banner */}
                <div className="p-3.5 bg-bg-surface-elevated/40 rounded-xl flex justify-between items-center border border-white/[0.06]">
                  <div>
                    <span className="text-[10px] font-mono uppercase tracking-wider text-text-subtle block">Cumulative Payout</span>
                    <span className="text-xs text-text-muted font-medium">All Time</span>
                  </div>
                  <span className="text-xl font-bold font-mono text-jackpot">
                    ${userWinnings.reduce((sum, draw) => sum + (draw.prizeAmount || 0), 0).toFixed(2)}
                  </span>
                </div>

                {/* List Recent Draws */}
                {userWinnings.length === 0 ? (
                  <div className="p-6 text-center text-xs text-text-subtle border border-dashed border-white/[0.06] rounded-xl">
                    <p>No prize draw entries yet.</p>
                    <p className="mt-1 text-[11px] text-text-subtle">Log your round scores before the next draw cutoff.</p>
                  </div>
                ) : (
                  userWinnings.map((draw) => (
                    <div key={draw._id} className="p-3.5 bg-bg-surface-elevated/40 rounded-xl border border-white/[0.06] space-y-2">
                      <div className="flex justify-between items-start">
                        <div>
                          <span className="text-[10px] font-mono text-text-subtle block uppercase">Draw Month</span>
                          <span className="text-xs font-semibold text-text-main">{draw.month}</span>
                        </div>
                        <span className={`text-[10px] font-mono px-2 py-0.5 rounded font-semibold ${
                          draw.tier ? 'bg-jackpot/10 text-jackpot border border-jackpot/20' : 'bg-zinc-800 text-zinc-400'
                        }`}>
                          {draw.tier ? `${draw.tier} Matches` : 'No Match'}
                        </span>
                      </div>

                      {/* Verification Status */}
                      {draw.tier && (
                        <div className="pt-2 border-t border-white/[0.06]">
                          <div className="flex justify-between items-center text-xs">
                            <span className="font-mono text-text-main font-semibold">${draw.prizeAmount?.toFixed(2)}</span>
                            <span className={`text-[10px] font-mono uppercase tracking-wider ${
                              draw.verificationStatus === 'approved' ? 'text-primary' : 'text-text-muted'
                            }`}>
                              {draw.verificationStatus}
                            </span>
                          </div>
                          
                          {/* Upload Input if pending verification */}
                          {draw.verificationStatus === 'pending' && !draw.proofUrl && (
                            <div className="mt-2.5">
                              <label className="cursor-pointer flex items-center justify-center gap-1.5 w-full py-2 px-3 border border-dashed border-primary/40 hover:border-primary text-primary rounded-lg bg-primary/[0.03] hover:bg-primary/[0.08] transition-colors text-xs font-medium">
                                <Upload size={14} /> Upload Score Card Proof
                                <input 
                                  type="file" 
                                  className="hidden" 
                                  accept="image/*"
                                  onChange={(e) => handleFileUpload(draw._id, e)}
                                />
                              </label>
                            </div>
                          )}
                        </div>
                      )}
                    </div>
                  ))
                )}
              </div>
            )}
          </DashboardCard>

        </div>
      </div>

      <SubscriptionModal 
        isOpen={isSubscriptionModalOpen} 
        onClose={() => setIsSubscriptionModalOpen(false)} 
      />
    </>
  );
};