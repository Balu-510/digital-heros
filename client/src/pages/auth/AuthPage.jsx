import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Mail, Lock, ArrowRight, Check, Eye, EyeOff } from 'lucide-react';
import { useAuthStore } from '../../store/useAuthStore';
import { Input } from '../../components/ui/Input';
import { Button } from '../../components/ui/Button';

// Validation Regular Expressions
const EMAIL_REGEX = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
const PASSWORD_RULES = [
  { id: 'length', label: '8+ characters', test: (pwd) => pwd.length >= 8 },
  { id: 'uppercase', label: 'One uppercase letter (A–Z)', test: (pwd) => /[A-Z]/.test(pwd) },
  { id: 'lowercase', label: 'One lowercase letter (a–z)', test: (pwd) => /[a-z]/.test(pwd) },
  { id: 'number', label: 'One number (0–9)', test: (pwd) => /\d/.test(pwd) },
  { id: 'special', label: 'One special character (!@#$%^&*)', test: (pwd) => /[!@#$%^&*()_+\-=[\]{};':"\\|,.<>/?]/.test(pwd) }
];

export const AuthPage = () => {
  const [isLogin, setIsLogin] = useState(true);
  const [formData, setFormData] = useState({ email: '', password: '', confirmPassword: '' });
  const [fieldErrors, setFieldErrors] = useState({ email: '', password: '', confirmPassword: '' });
  const [touched, setTouched] = useState({ email: false, password: false, confirmPassword: false });
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  
  const navigate = useNavigate();
  const { login, register, isLoading, error, user, isAuthenticated } = useAuthStore();

  useEffect(() => {
    if (isAuthenticated && user) {
      navigate(user.role === 'admin' ? '/admin' : '/dashboard', { replace: true });
    }
  }, [isAuthenticated, user, navigate]);

  // Reset errors when toggling tabs
  /* eslint-disable react-hooks/set-state-in-effect */
  useEffect(() => {
    setFieldErrors({ email: '', password: '', confirmPassword: '' });
    setTouched({ email: false, password: false, confirmPassword: false });
    setFormData((prev) => ({ ...prev, confirmPassword: '' }));
  }, [isLogin]);
  /* eslint-enable react-hooks/set-state-in-effect */

  // Validation logic
  const validateField = (name, value, allValues = formData) => {
    let err = '';
    if (name === 'email') {
      if (!value.trim()) {
        err = 'Email address is required.';
      } else if (!EMAIL_REGEX.test(value.trim())) {
        err = 'Please enter a valid email address (e.g. name@domain.com).';
      }
    } else if (name === 'password') {
      if (!value) {
        err = 'Password is required.';
      } else if (!isLogin) {
        const failedRule = PASSWORD_RULES.find(rule => !rule.test(value));
        if (failedRule) {
          err = 'Password does not meet all security requirements.';
        }
      }
    } else if (name === 'confirmPassword' && !isLogin) {
      if (!value) {
        err = 'Please confirm your password.';
      } else if (value !== allValues.password) {
        err = 'Passwords do not match.';
      }
    }
    return err;
  };

  const handleBlur = (field) => {
    setTouched((prev) => ({ ...prev, [field]: true }));
    const errorMsg = validateField(field, formData[field]);
    setFieldErrors((prev) => ({ ...prev, [field]: errorMsg }));
  };

  const handleChange = (field, value) => {
    const updated = { ...formData, [field]: value };
    setFormData(updated);

    if (touched[field]) {
      const errorMsg = validateField(field, value, updated);
      setFieldErrors((prev) => ({ ...prev, [field]: errorMsg }));
    }

    if (field === 'password' && touched.confirmPassword && !isLogin) {
      const confirmError = validateField('confirmPassword', formData.confirmPassword, updated);
      setFieldErrors((prev) => ({ ...prev, confirmPassword: confirmError }));
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    const emailErr = validateField('email', formData.email);
    const pwdErr = validateField('password', formData.password);
    const confirmErr = !isLogin ? validateField('confirmPassword', formData.confirmPassword) : '';

    setTouched({ email: true, password: true, confirmPassword: true });
    setFieldErrors({ email: emailErr, password: pwdErr, confirmPassword: confirmErr });

    if (emailErr || pwdErr || confirmErr) {
      return;
    }

    const action = isLogin ? login : register;
    const result = await action(formData.email.trim(), formData.password);
    
    if (result.success) {
      if (result.user?.role === 'admin') {
        navigate('/admin');
      } else {
        navigate('/dashboard');
      }
    }
  };

  const passedRulesCount = PASSWORD_RULES.filter(rule => rule.test(formData.password)).length;
  const strengthColor = passedRulesCount <= 2 ? 'bg-red-500' : passedRulesCount <= 4 ? 'bg-amber-500' : 'bg-primary';

  return (
    <div className="min-h-screen flex items-center justify-center p-4 bg-bg-base relative selection:bg-primary/20 selection:text-primary">
      {/* Subtle Grid Accent */}
      <div className="absolute inset-0 bg-[linear-gradient(to_right,#ffffff05_1px,transparent_1px),linear-gradient(to_bottom,#ffffff05_1px,transparent_1px)] bg-[size:4rem_4rem] [mask-image:radial-gradient(ellipse_60%_50%_at_50%_50%,#000_70%,transparent_100%)] pointer-events-none" />

      <div className="w-full max-w-md bg-bg-surface/90 backdrop-blur-xl border border-white/[0.08] p-8 rounded-2xl shadow-[0_20px_50px_rgba(0,0,0,0.5)] relative z-10">
        
        {/* Brand Header */}
        <div className="mb-6 text-center">
          <div className="inline-flex items-center justify-center w-10 h-10 rounded-xl bg-zinc-900 border border-white/10 text-text-main font-bold text-sm mb-4 shadow-inner">
            DH
          </div>
          <h1 className="text-2xl font-bold tracking-tight text-text-main">
            {isLogin ? 'Sign in to Digital Heroes' : 'Create an Account'}
          </h1>
          <p className="text-xs text-text-muted mt-1.5">
            {isLogin ? 'Access your dashboard, score log, and monthly draws' : 'Track your game, enter jackpots, and support top charities'}
          </p>
        </div>

        {/* Tab Switcher */}
        <div className="flex p-1 bg-zinc-900/90 rounded-lg border border-white/[0.06] mb-6">
          <button
            type="button"
            onClick={() => setIsLogin(true)}
            className={`flex-1 py-1.5 text-xs font-medium rounded-md transition-all cursor-pointer ${
              isLogin ? 'bg-zinc-800 text-text-main shadow-xs' : 'text-text-muted hover:text-text-main'
            }`}
          >
            Sign In
          </button>
          <button
            type="button"
            onClick={() => setIsLogin(false)}
            className={`flex-1 py-1.5 text-xs font-medium rounded-md transition-all cursor-pointer ${
              !isLogin ? 'bg-zinc-800 text-text-main shadow-xs' : 'text-text-muted hover:text-text-main'
            }`}
          >
            Register
          </button>
        </div>

        {error && (
          <div className="mb-5 p-3 rounded-lg bg-red-500/10 border border-red-500/20 text-red-400 text-xs flex items-center gap-2">
            <span className="w-1.5 h-1.5 rounded-full bg-red-500 shrink-0" />
            <span>{error}</span>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4" noValidate>
          {/* Email Address */}
          <Input 
            label="Email Address"
            type="email"
            icon={Mail}
            placeholder="player@digitalheroes.co.in"
            value={formData.email}
            onChange={(e) => handleChange('email', e.target.value)}
            onBlur={() => handleBlur('email')}
            error={touched.email ? fieldErrors.email : ''}
            required
          />

          {/* Password */}
          <Input 
            label="Password"
            type={showPassword ? 'text' : 'password'}
            icon={Lock}
            placeholder="••••••••••••"
            value={formData.password}
            onChange={(e) => handleChange('password', e.target.value)}
            onBlur={() => handleBlur('password')}
            error={touched.password ? fieldErrors.password : ''}
            rightElement={
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="text-text-subtle hover:text-text-main transition-colors p-1"
                title={showPassword ? 'Hide password' : 'Show password'}
              >
                {showPassword ? <EyeOff size={15} /> : <Eye size={15} />}
              </button>
            }
            required
          />

          {/* Password Strength Checklist (Only for Registration) */}
          {!isLogin && (
            <div className="p-3 bg-bg-surface-elevated/40 rounded-lg border border-white/[0.05] space-y-2.5">
              <div className="flex items-center justify-between text-[11px]">
                <span className="text-text-muted font-medium">Security Requirements</span>
                <span className="font-mono text-text-subtle">
                  {passedRulesCount}/5 Met
                </span>
              </div>

              {/* Progress bar */}
              <div className="w-full bg-white/[0.05] h-1 rounded-full overflow-hidden">
                <div 
                  className={`h-full transition-all duration-300 ${strengthColor}`}
                  style={{ width: `${(passedRulesCount / 5) * 100}%` }}
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-1.5 pt-1">
                {PASSWORD_RULES.map((rule) => {
                  const passed = rule.test(formData.password);
                  return (
                    <div key={rule.id} className="flex items-center gap-1.5 text-[11px]">
                      {passed ? (
                        <Check size={12} className="text-primary shrink-0" />
                      ) : (
                        <span className="w-1.5 h-1.5 rounded-full bg-zinc-600 shrink-0 mx-0.5" />
                      )}
                      <span className={passed ? 'text-text-main font-medium' : 'text-text-subtle'}>
                        {rule.label}
                      </span>
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {/* Confirm Password (Only for Registration) */}
          {!isLogin && (
            <Input 
              label="Confirm Password"
              type={showConfirmPassword ? 'text' : 'password'}
              icon={Lock}
              placeholder="••••••••••••"
              value={formData.confirmPassword}
              onChange={(e) => handleChange('confirmPassword', e.target.value)}
              onBlur={() => handleBlur('confirmPassword')}
              error={touched.confirmPassword ? fieldErrors.confirmPassword : ''}
              rightElement={
                <button
                  type="button"
                  onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                  className="text-text-subtle hover:text-text-main transition-colors p-1"
                  title={showConfirmPassword ? 'Hide password' : 'Show password'}
                >
                  {showConfirmPassword ? <EyeOff size={15} /> : <Eye size={15} />}
                </button>
              }
              required
            />
          )}

          <Button type="submit" className="w-full mt-2 py-2.5 text-sm" isLoading={isLoading}>
            {isLogin ? 'Continue to Dashboard' : 'Complete Registration'}
            {!isLoading && <ArrowRight size={16} />}
          </Button>
        </form>

        <div className="mt-6 pt-5 border-t border-white/[0.06] text-center">
          <p className="text-xs text-text-subtle">
            {isLogin ? 'Need an account? ' : 'Already registered? '}
            <button 
              type="button"
              onClick={() => setIsLogin(!isLogin)}
              className="text-text-muted hover:text-text-main font-medium underline underline-offset-4 transition-colors cursor-pointer"
            >
              {isLogin ? 'Create one now' : 'Sign in here'}
            </button>
          </p>
        </div>
      </div>
    </div>
  );
};