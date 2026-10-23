export const Button = ({ children, variant = 'primary', isLoading, className = '', ...props }) => {
  const baseStyles = "relative inline-flex items-center justify-center gap-2 font-medium text-sm rounded-lg px-4 py-2 transition-all duration-150 active:scale-[0.98] disabled:opacity-50 disabled:pointer-events-none cursor-pointer";
  
  const variants = {
    primary: "bg-primary hover:bg-primary-hover text-zinc-950 font-semibold shadow-[0_1px_2px_rgba(0,0,0,0.3)]",
    secondary: "bg-bg-surface hover:bg-bg-surface-hover border border-white/10 text-text-main hover:border-white/20 shadow-sm",
    outline: "border border-white/15 hover:border-white/30 text-text-main hover:bg-white/[0.04]",
    ghost: "hover:bg-white/[0.06] text-text-muted hover:text-text-main",
    destructive: "bg-red-500/10 hover:bg-red-500/20 text-red-400 border border-red-500/20"
  };

  return (
    <button className={`${baseStyles} ${variants[variant] || variants.primary} ${className}`} disabled={isLoading} {...props}>
      {isLoading ? (
        <div className="w-4 h-4 border-2 border-current/30 border-t-current rounded-full animate-spin" />
      ) : children}
    </button>
  );
};