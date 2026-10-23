import { useEffect, useState } from 'react';
import { Plus, Calendar, Hash, AlertCircle, Edit2, Check, X } from 'lucide-react';
import { useScoreStore } from '../../store/useScoreStore';
import { Input } from '../../components/ui/Input';
import { Button } from '../../components/ui/Button';

export const ScoreManager = () => {
  const { scores, fetchScores, addScore, updateScore, isLoading, error } = useScoreStore();
  const [formData, setFormData] = useState({ points: '', date: '' });
  const [formError, setFormError] = useState('');
  const [editingId, setEditingId] = useState(null);
  const [editPoints, setEditPoints] = useState('');

  useEffect(() => {
    fetchScores();
  }, [fetchScores]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setFormError('');

    const pointsNum = Number(formData.points);
    if (pointsNum < 1 || pointsNum > 45) {
      return setFormError('Score must be strictly between 1 and 45.');
    }
    if (!formData.date) {
      return setFormError('A valid date is required.');
    }

    const result = await addScore(pointsNum, formData.date);
    if (result.success) {
      setFormData({ points: '', date: '' }); 
    } else {
      setFormError(result.message || 'Failed to submit score.');
    }
  };

  const handleSaveEdit = async (id) => {
    const pointsNum = Number(editPoints);
    if (pointsNum < 1 || pointsNum > 45) return;
    
    await updateScore(id, pointsNum);
    setEditingId(null);
  };

  return (
    <div className="flex flex-col lg:flex-row gap-8 h-full">
      {/* Entry Form */}
      <div className="w-full lg:w-1/3 space-y-4 border-b lg:border-b-0 lg:border-r border-white/[0.07] pb-6 lg:pb-0 lg:pr-6">
        <div className="flex items-center justify-between">
          <h3 className="text-xs font-medium text-text-muted uppercase tracking-wider">Log New Performance</h3>
          <span className="text-[10px] font-mono text-primary bg-primary/10 px-2 py-0.5 rounded border border-primary/20">Stableford</span>
        </div>
        
        <form onSubmit={handleSubmit} className="space-y-4">
          <Input 
            type="number"
            label="Round Points (1–45)"
            icon={Hash}
            min="1" max="45"
            placeholder="e.g. 36"
            value={formData.points}
            onChange={(e) => setFormData({ ...formData, points: e.target.value })}
            required
          />
          <Input 
            type="date"
            label="Date of Play"
            icon={Calendar}
            max={new Date().toISOString().split('T')[0]}
            value={formData.date}
            onChange={(e) => setFormData({ ...formData, date: e.target.value })}
            required
          />
          
          {(error || formError) && (
            <div className="flex items-start gap-2 text-xs text-red-400 bg-red-500/10 p-3 rounded-lg border border-red-500/20">
              <AlertCircle size={15} className="mt-0.5 shrink-0" />
              <span>{formError || error}</span>
            </div>
          )}

          <Button type="submit" className="w-full py-2.5" isLoading={isLoading && !editingId}>
            <Plus size={16} /> Add Score to Draw
          </Button>
        </form>
        <p className="text-[11px] text-text-subtle text-center mt-3">
          Only your latest 5 entries are active. Oldest scores roll off automatically.
        </p>
      </div>

      {/* History List */}
      <div className="w-full lg:w-2/3 flex flex-col">
        <div className="flex justify-between items-center mb-4">
          <h3 className="text-xs font-medium text-text-muted uppercase tracking-wider">Active Rolling History</h3>
          <span className="text-[11px] font-mono px-2 py-0.5 bg-white/[0.04] border border-white/[0.08] rounded text-text-muted">
            {scores.length}/5 Active Slots
          </span>
        </div>
        
        {scores.length === 0 ? (
          <div className="flex-1 flex flex-col items-center justify-center border border-dashed border-white/[0.08] rounded-xl text-text-subtle p-8 text-center text-xs">
            <Hash size={24} className="mb-2 opacity-30 text-text-muted" />
            <p>No scores logged yet.</p>
            <p className="text-text-subtle mt-1">Enter your first score to activate your draw numbers.</p>
          </div>
        ) : (
          <div className="space-y-2.5 flex-1 overflow-y-auto pr-1">
            {scores.map((score, index) => (
              <div 
                key={score._id} 
                className="flex items-center justify-between p-3.5 bg-bg-surface-elevated/40 hover:bg-bg-surface-elevated transition-colors rounded-xl border border-white/[0.07] group"
              >
                <div className="flex items-center gap-3.5">
                  <div className={`w-7 h-7 rounded-lg flex items-center justify-center text-xs font-mono font-medium shrink-0
                    ${index === 0 ? 'bg-primary/10 text-primary border border-primary/20' : 'bg-zinc-900 border border-white/[0.06] text-text-subtle'}`}>
                    {index + 1}
                  </div>
                  
                  {editingId === score._id ? (
                    <div className="flex items-center gap-2">
                      <input 
                        type="number" 
                        min="1" max="45"
                        className="w-20 bg-bg-base border border-primary/50 rounded px-2.5 py-1 text-sm text-text-main focus:outline-none"
                        value={editPoints}
                        onChange={(e) => setEditPoints(e.target.value)}
                        autoFocus
                      />
                      <span className="text-xs text-text-subtle font-mono">pts</span>
                    </div>
                  ) : (
                    <div>
                      <p className="font-semibold text-base text-text-main">
                        {score.points} <span className="text-xs text-text-subtle font-normal">pts</span>
                      </p>
                      <p className="text-[11px] text-text-subtle">
                        {new Date(score.date).toLocaleDateString('en-US', { weekday: 'short', year: 'numeric', month: 'short', day: 'numeric' })}
                      </p>
                    </div>
                  )}
                </div>

                <div className="flex items-center gap-1.5">
                  {editingId === score._id ? (
                    <>
                      <button 
                        type="button"
                        onClick={() => handleSaveEdit(score._id)} 
                        className="p-1.5 text-primary hover:bg-primary/10 rounded transition-colors"
                        title="Save edit"
                      >
                        <Check size={16} />
                      </button>
                      <button 
                        type="button"
                        onClick={() => setEditingId(null)} 
                        className="p-1.5 text-text-muted hover:bg-white/5 rounded transition-colors"
                        title="Cancel"
                      >
                        <X size={16} />
                      </button>
                    </>
                  ) : (
                    <button 
                      type="button"
                      onClick={() => { setEditingId(score._id); setEditPoints(score.points.toString()); }} 
                      className="p-1.5 text-text-subtle hover:text-text-main opacity-0 group-hover:opacity-100 transition-all rounded hover:bg-white/5"
                      title="Edit points"
                    >
                      <Edit2 size={14} />
                    </button>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};