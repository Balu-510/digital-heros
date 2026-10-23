import { forwardRef } from 'react';

export const Input = forwardRef(({ label, icon: Icon, rightElement, error, className = '', ...props }, ref) => {
  return (
    <div className="flex flex-col gap-1.5 w-full">
      {label && <label className="text-xs font-medium text-text-muted uppercase tracking-wider">{label}</label>}
      <div className="relative">
        {Icon && (
          <div className="absolute left-3.5 top-1/2 -translate-y-1/2 text-text-subtle pointer-events-none">
            <Icon size={16} />
          </div>
        )}
        <input
          ref={ref}
          className={`w-full bg-bg-surface-elevated/70 border ${error ? 'border-red-500/50 focus:border-red-500 focus:ring-red-500/20' : 'border-white/10 hover:border-white/20 focus:border-primary/60 focus:ring-primary/20'} 
            rounded-lg px-3.5 py-2.5 text-sm text-text-main placeholder-text-subtle
            focus:outline-none focus:ring-2 transition-all duration-150
            ${Icon ? 'pl-10' : ''} ${rightElement ? 'pr-10' : ''} ${className}`}
          {...props}
        />
        {rightElement && (
          <div className="absolute right-3 top-1/2 -translate-y-1/2 flex items-center">
            {rightElement}
          </div>
        )}
      </div>
      {error && <span className="text-xs text-red-400 font-medium">{error}</span>}
    </div>
  );
});

Input.displayName = 'Input';