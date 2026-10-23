import { useEffect, useState } from 'react';
import { ChevronDown } from 'lucide-react';
import { useAuthStore } from '../../store/useAuthStore';
import { useCharityStore } from '../../store/useCharityStore';
import { Button } from '../../components/ui/Button';

export const CharityManager = () => {
  const { user } = useAuthStore();
  const { charities, fetchCharities, updatePreference, isLoading } = useCharityStore();
  
  const currentPref = user?.charityPreferences || {};
  
  const [isEditing, setIsEditing] = useState(false);
  const [selectedCharity, setSelectedCharity] = useState(currentPref.charityId || '');
  const [percentage, setPercentage] = useState(currentPref.contributionPercentage || 10);

  useEffect(() => {
    fetchCharities();
  }, [fetchCharities]);

  const activeCharity = charities.find(c => c._id === (isEditing ? selectedCharity : currentPref.charityId));

  const handleSave = async () => {
    const result = await updatePreference(selectedCharity, percentage);
    if (result.success) {
      setIsEditing(false);
    }
  };

  if (!isEditing) {
    return (
      <div className="flex flex-col md:flex-row gap-6 items-start md:items-center justify-between h-full">
        <div className="flex-1 w-full space-y-3">
          <div className="flex items-center gap-2">
            <span className="text-[10px] font-mono uppercase tracking-wider text-primary bg-primary/10 px-2 py-0.5 rounded border border-primary/20">
              Active Designation
            </span>
          </div>
          <p className="text-xl font-semibold text-text-main">
            {activeCharity ? activeCharity.name : 'No Charity Selected'}
          </p>
          <p className="text-xs text-text-muted line-clamp-2">
            {activeCharity?.description || 'Select an accredited non-profit to allocate your monthly subscription contribution.'}
          </p>
          
          <div className="pt-2 space-y-2">
            <div className="flex justify-between text-xs">
              <span className="text-text-muted">Subscription Allocation</span>
              <span className="text-primary font-mono font-semibold text-sm">{currentPref.contributionPercentage || 10}%</span>
            </div>
            {/* Visual Bar */}
            <div className="w-full bg-white/[0.05] rounded-full h-2 overflow-hidden">
              <div 
                className="bg-primary h-full transition-all duration-700 rounded-full" 
                style={{ width: `${currentPref.contributionPercentage || 10}%` }} 
              />
            </div>
          </div>
        </div>
        
        <div className="w-full md:w-auto shrink-0">
          <Button variant="secondary" className="w-full md:w-auto text-xs py-2" onClick={() => setIsEditing(true)}>
            Edit Allocation
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col h-full animate-in fade-in duration-200">
      <div className="flex-1 space-y-4">
        
        {/* Charity Selector */}
        <div>
          <label className="text-xs font-medium text-text-muted uppercase tracking-wider mb-1.5 block">Select Verified Cause</label>
          <div className="relative">
            <select 
              className="w-full bg-bg-surface-elevated border border-white/10 rounded-lg px-3.5 py-2.5 text-sm text-text-main appearance-none focus:border-primary/50 focus:ring-1 focus:ring-primary/20 outline-none"
              value={selectedCharity}
              onChange={(e) => setSelectedCharity(e.target.value)}
            >
              <option value="" disabled>Select a charity partner...</option>
              {charities.map(charity => (
                <option key={charity._id} value={charity._id} className="bg-bg-surface text-text-main">
                  {charity.name}
                </option>
              ))}
            </select>
            <ChevronDown className="absolute right-3.5 top-1/2 -translate-y-1/2 text-text-subtle pointer-events-none" size={16} />
          </div>
        </div>

        {/* Percentage Slider */}
        <div>
          <div className="flex justify-between items-baseline mb-2">
            <label className="text-xs font-medium text-text-muted uppercase tracking-wider">Contribution Rate</label>
            <span className="text-lg font-mono font-bold text-primary">{percentage}%</span>
          </div>
          <input 
            type="range" 
            min="10" 
            max="100" 
            step="5"
            value={percentage}
            onChange={(e) => setPercentage(Number(e.target.value))}
            className="w-full h-1.5 bg-white/10 rounded-lg appearance-none cursor-pointer accent-emerald-500"
          />
          <div className="flex justify-between text-[11px] text-text-subtle font-mono mt-1.5">
            <span>Min 10%</span>
            <span>Max 100%</span>
          </div>
        </div>

      </div>

      <div className="flex gap-2.5 mt-5 pt-3.5 border-t border-white/[0.06]">
        <Button variant="ghost" className="flex-1 text-xs py-2" onClick={() => {
          setIsEditing(false);
          setSelectedCharity(currentPref.charityId);
          setPercentage(currentPref.contributionPercentage || 10);
        }}>
          Cancel
        </Button>
        <Button className="flex-1 text-xs py-2" onClick={handleSave} isLoading={isLoading} disabled={!selectedCharity}>
          Confirm Impact
        </Button>
      </div>
    </div>
  );
};