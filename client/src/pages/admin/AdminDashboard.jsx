import { useEffect, useState } from 'react';
import { PlayCircle, CheckCircle, BarChart3, ExternalLink } from 'lucide-react';
import { useDrawStore } from '../../store/useDrawStore';
import { useAdminStore } from '../../store/useAdminStore';
import { Button } from '../../components/ui/Button';

// Admin Card Wrapper
const AdminCard = ({ title, icon: Icon, badge, children, className = "" }) => (
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

export const AdminDashboard = () => {
  const { analytics, fetchAnalytics, simulateDraw, publishDraw, isLoading } = useAdminStore();
  const [simulationMonth, setSimulationMonth] = useState('2026-04');
  const [drawType, setDrawType] = useState('algorithmic');
  const [simulationResult, setSimulationResult] = useState(null);
  const { pendingVerifications, fetchPendingVerifications, processVerification } = useDrawStore();

  useEffect(() => {
    fetchAnalytics();
    fetchPendingVerifications();
  }, [fetchAnalytics, fetchPendingVerifications]);

  const handleSimulate = async () => {
    const result = await simulateDraw(simulationMonth, drawType);
    if (result.success) {
      setSimulationResult(result.data);
    }
  };

  const handlePublish = async () => {
    if (!simulationResult) return;
    await publishDraw(simulationResult._id);
    setSimulationResult(null); 
    fetchAnalytics(); 
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-300">
      
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-4 border-b border-white/[0.06] gap-3">
        <div>
          <div className="flex items-center gap-2">
            <span className="text-[10px] font-mono uppercase tracking-wider text-primary bg-primary/10 px-2 py-0.5 rounded border border-primary/20">
              Admin Console
            </span>
          </div>
          <h1 className="text-2xl font-bold tracking-tight text-text-main mt-1">Platform Command Center</h1>
          <p className="text-xs text-text-muted mt-0.5">Real-time platform metrics, algorithmic draw simulation, and winner verification.</p>
        </div>
        
        <div className="flex items-center gap-2">
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-mono font-medium border bg-primary/10 text-primary border-primary/20">
            <span className="w-1.5 h-1.5 rounded-full bg-primary animate-pulse" />
            System Operational
          </span>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        
        {/* Module 5: Reports & Analytics */}
        <AdminCard title="Platform Overview" icon={BarChart3} badge="Live Telemetry" className="lg:col-span-3">
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
            <div className="p-4 bg-bg-surface-elevated/40 rounded-xl border border-white/[0.06]">
              <p className="text-xs text-text-muted mb-1">Active Subscribers</p>
              <p className="text-2xl sm:text-3xl font-bold font-mono text-text-main">{analytics?.activeUsers || '0'}</p>
              <p className="text-[10px] text-text-subtle font-mono mt-1">$5.00/user to draw pool</p>
            </div>
            <div className="p-4 bg-bg-surface-elevated/40 rounded-xl border border-white/[0.06]">
              <p className="text-xs text-text-muted mb-1">Estimated Prize Pool</p>
              <p className="text-2xl sm:text-3xl font-bold font-mono text-jackpot">${analytics?.currentPool || '0.00'}</p>
              <p className="text-[10px] text-text-subtle font-mono mt-1">Pre-rollover calculation</p>
            </div>
            <div className="p-4 bg-bg-surface-elevated/40 rounded-xl border border-white/[0.06]">
              <p className="text-xs text-text-muted mb-1">Charity Allocations</p>
              <p className="text-2xl sm:text-3xl font-bold font-mono text-primary">${analytics?.totalCharity || '0.00'}</p>
              <p className="text-[10px] text-text-subtle font-mono mt-1">Direct foundation pipeline</p>
            </div>
            <div className="p-4 bg-bg-surface-elevated/40 rounded-xl border border-white/[0.06]">
              <p className="text-xs text-text-muted mb-1">Verification Queue</p>
              <p className="text-2xl sm:text-3xl font-bold font-mono text-text-main">{analytics?.pendingVerifications || '0'}</p>
              <p className="text-[10px] text-text-subtle font-mono mt-1">Awaiting screenshot audit</p>
            </div>
          </div>
        </AdminCard>

        {/* Module 2: Draw Management */}
        <AdminCard title="Draw Engine" icon={PlayCircle} badge="Simulation & Publishing" className="lg:col-span-2">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 h-full">
            <div className="space-y-4 border-b md:border-b-0 md:border-r border-white/[0.06] pb-5 md:pb-0 md:pr-6 flex flex-col">
              <div>
                <label className="text-xs font-medium text-text-muted uppercase tracking-wider mb-1.5 block">Target Draw Month</label>
                <input 
                  type="month" 
                  className="w-full bg-bg-surface-elevated border border-white/10 rounded-lg px-3.5 py-2 text-sm text-text-main focus:border-primary/50 focus:ring-1 focus:ring-primary/20 outline-none font-mono"
                  value={simulationMonth}
                  onChange={(e) => setSimulationMonth(e.target.value)}
                />
              </div>
              <div>
                <label className="text-xs font-medium text-text-muted uppercase tracking-wider mb-1.5 block">Algorithm Strategy</label>
                <select 
                  className="w-full bg-bg-surface-elevated border border-white/10 rounded-lg px-3.5 py-2 text-sm text-text-main focus:border-primary/50 focus:ring-1 focus:ring-primary/20 outline-none"
                  value={drawType}
                  onChange={(e) => setDrawType(e.target.value)}
                >
                  <option value="algorithmic" className="bg-bg-surface text-text-main">Frequency Weighted (Algorithmic)</option>
                  <option value="random" className="bg-bg-surface text-text-main">Standard Random Uniform (Random)</option>
                </select>
                <p className="text-[11px] text-text-subtle mt-1.5">
                  Algorithmic weights balls according to active subscriber score distribution.
                </p>
              </div>
              <Button onClick={handleSimulate} isLoading={isLoading} className="w-full mt-auto text-xs py-2">
                Simulate Draw Calculation
              </Button>
            </div>
            
            <div className="flex flex-col h-full justify-center">
              {!simulationResult ? (
                <div className="text-center text-text-subtle py-8 text-xs border border-dashed border-white/[0.06] rounded-xl">
                  <PlayCircle size={32} className="mb-2.5 opacity-20 mx-auto text-text-muted" />
                  <p className="text-text-muted font-medium">Ready for Simulation</p>
                  <p className="mt-1 max-w-xs mx-auto">Generate winning numbers and evaluate tier payouts before publishing officially.</p>
                </div>
              ) : (
                <div className="animate-in fade-in duration-200 space-y-4">
                  <div>
                    <span className="text-[10px] font-mono uppercase tracking-wider text-text-subtle block mb-2">Simulated Winning Balls</span>
                    <div className="flex gap-2 justify-center flex-wrap">
                      {simulationResult.winningNumbers.map((num, i) => (
                        <div 
                          key={i} 
                          className="w-10 h-10 rounded-xl bg-zinc-900 border border-white/10 flex items-center justify-center font-mono font-bold text-sm text-text-main shadow-inner"
                        >
                          {num}
                        </div>
                      ))}
                    </div>
                  </div>
                  
                  <div className="bg-bg-surface-elevated/50 rounded-xl p-3.5 space-y-2 text-xs border border-white/[0.06]">
                    <div className="flex justify-between">
                      <span className="text-text-muted">Tier 5 (40% + Rollover)</span>
                      <span className="font-mono font-bold text-jackpot">${simulationResult.prizePool.tier5.toFixed(2)}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-text-muted">Tier 4 (35%)</span>
                      <span className="font-mono font-bold text-text-main">${simulationResult.prizePool.tier4.toFixed(2)}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-text-muted">Tier 3 (25%)</span>
                      <span className="font-mono font-bold text-text-main">${simulationResult.prizePool.tier3.toFixed(2)}</span>
                    </div>
                  </div>

                  <Button onClick={handlePublish} className="w-full text-xs py-2">
                    <CheckCircle size={15} /> Publish Official Draw
                  </Button>
                </div>
              )}
            </div>
          </div>
        </AdminCard>

        {/* Module 4: Winners Management*/}
        <AdminCard title="Verification Queue" icon={CheckCircle} badge="Audit Stream">
          {pendingVerifications.length === 0 ? (
            <div className="flex-1 flex flex-col items-center justify-center border border-dashed border-white/[0.06] rounded-xl p-6 text-center text-xs text-text-subtle">
              <CheckCircle size={24} className="mb-2 opacity-20 text-text-muted" />
              <p>No winner proofs currently require verification.</p>
            </div>
          ) : (
            <div className="space-y-3 flex-1 overflow-y-auto pr-1">
              {pendingVerifications.map((verification, idx) => (
                <div key={idx} className="bg-bg-surface-elevated/40 border border-white/[0.06] rounded-xl p-3.5 space-y-2.5">
                  <div className="flex justify-between items-center text-xs">
                    <span className="text-text-main font-medium truncate max-w-[150px]">{verification.userEmail}</span>
                    <span className="text-jackpot font-mono font-bold text-[11px] bg-jackpot/10 px-2 py-0.5 rounded border border-jackpot/20">
                      Tier {verification.tier} Win
                    </span>
                  </div>
                  
                  {verification.proofUrl && (
                    <a 
                      href={verification.proofUrl} 
                      target="_blank" 
                      rel="noreferrer" 
                      className="inline-flex items-center gap-1.5 text-xs text-primary hover:underline font-medium"
                    >
                      <ExternalLink size={12} /> View Scorecard Screenshot
                    </a>
                  )}
                  
                  <div className="flex gap-2 pt-1">
                    <Button 
                      className="flex-1 text-xs py-1.5"
                      onClick={() => processVerification(verification.drawId, verification.userId, 'approved')}
                    >
                      Approve
                    </Button>
                    <Button 
                      variant="destructive" 
                      className="flex-1 text-xs py-1.5"
                      onClick={() => processVerification(verification.drawId, verification.userId, 'rejected')}
                    >
                      Reject
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </AdminCard>

      </div>
    </div>
  );
};