import { useState } from 'react';
import { X, Check, Lock } from 'lucide-react';
import { usePaymentStore } from '../../store/usePaymentStore';
import { Button } from '../../components/ui/Button';

export const SubscriptionModal = ({ isOpen, onClose }) => {
  const [selectedPlan, setSelectedPlan] = useState('yearly');
  const { createCheckoutSession, isLoading, error } = usePaymentStore();

  if (!isOpen) return null;

  const handleCheckout = () => {
    createCheckoutSession(selectedPlan);
  };

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-bg-base/80 backdrop-blur-md animate-in fade-in duration-150">
      <div className="relative w-full max-w-xl bg-bg-surface border border-white/[0.08] rounded-2xl shadow-[0_25px_60px_rgba(0,0,0,0.6)] overflow-hidden">
        
        {/* Header */}
        <div className="flex justify-between items-start p-6 border-b border-white/[0.06]">
          <div>
            <span className="text-[10px] font-mono uppercase tracking-wider text-primary bg-primary/10 px-2 py-0.5 rounded border border-primary/20">
              Membership Plans
            </span>
            <h2 className="text-xl font-bold tracking-tight text-text-main mt-2">Activate Your Membership</h2>
            <p className="text-xs text-text-muted mt-1">Unlock 5-score rolling history, jackpot entry, and charitable impact.</p>
          </div>
          <button 
            type="button"
            onClick={onClose} 
            className="p-1.5 text-text-subtle hover:text-text-main transition-colors rounded-lg hover:bg-white/[0.05]"
          >
            <X size={18} />
          </button>
        </div>

        {/* Content */}
        <div className="p-6">
          {error && (
            <div className="mb-5 p-3 rounded-lg bg-red-500/10 border border-red-500/20 text-red-400 text-xs flex items-center gap-2">
              <span className="w-1.5 h-1.5 rounded-full bg-red-500 shrink-0" />
              <span>{error}</span>
            </div>
          )}

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-6">
            {/* Monthly Plan */}
            <div 
              onClick={() => setSelectedPlan('monthly')}
              className={`relative cursor-pointer p-5 rounded-xl border transition-all ${
                selectedPlan === 'monthly' 
                  ? 'border-primary/60 bg-primary/[0.04] shadow-xs' 
                  : 'border-white/[0.07] hover:border-white/20 bg-bg-surface-elevated/40'
              }`}
            >
              <h3 className="text-sm font-semibold text-text-main mb-1">Monthly Billing</h3>
              <div className="flex items-baseline gap-1 mb-4">
                <span className="text-3xl font-bold text-text-main font-mono">$12</span>
                <span className="text-xs text-text-subtle font-mono">/mo</span>
              </div>
              <ul className="space-y-2.5 text-xs text-text-muted">
                <li className="flex items-center gap-2">
                  <Check size={14} className="text-primary shrink-0" /> 5-Score Rolling History
                </li>
                <li className="flex items-center gap-2">
                  <Check size={14} className="text-primary shrink-0" /> Monthly Jackpot Draw Entry
                </li>
                <li className="flex items-center gap-2">
                  <Check size={14} className="text-primary shrink-0" /> Direct 10–100% Charity Route
                </li>
              </ul>
            </div>

            {/* Yearly Plan */}
            <div 
              onClick={() => setSelectedPlan('yearly')}
              className={`relative cursor-pointer p-5 rounded-xl border transition-all ${
                selectedPlan === 'yearly' 
                  ? 'border-primary/80 bg-primary/[0.06] shadow-xs' 
                  : 'border-white/[0.07] hover:border-white/20 bg-bg-surface-elevated/40'
              }`}
            >
              <div className="absolute -top-2.5 right-4 bg-primary text-zinc-950 text-[10px] font-bold px-2.5 py-0.5 rounded-full tracking-wider uppercase font-mono">
                Save 16%
              </div>
              <h3 className="text-sm font-semibold text-text-main mb-1">Annual Billing</h3>
              <div className="flex items-baseline gap-1 mb-4">
                <span className="text-3xl font-bold text-text-main font-mono">$120</span>
                <span className="text-xs text-text-subtle font-mono">/yr</span>
              </div>
              <ul className="space-y-2.5 text-xs text-text-muted">
                <li className="flex items-center gap-2">
                  <Check size={14} className="text-primary shrink-0" /> $10/mo Equivalent (Save $24)
                </li>
                <li className="flex items-center gap-2">
                  <Check size={14} className="text-primary shrink-0" /> 12 Consecutive Draw Entries
                </li>
                <li className="flex items-center gap-2">
                  <Check size={14} className="text-primary shrink-0" /> Priority Winner Verification
                </li>
              </ul>
            </div>
          </div>

          <Button 
            className="w-full py-2.5 text-sm font-semibold" 
            onClick={handleCheckout} 
            isLoading={isLoading}
          >
            Continue to Stripe Checkout
          </Button>

          <div className="mt-4 flex items-center justify-center gap-1.5 text-[11px] text-text-subtle text-center">
            <Lock size={12} className="text-text-muted" />
            <span>Encrypted 256-bit Stripe transaction • Cancel anytime in dashboard</span>
          </div>
        </div>
      </div>
    </div>
  );
};