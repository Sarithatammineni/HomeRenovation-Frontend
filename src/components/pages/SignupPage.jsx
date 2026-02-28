// frontend/src/components/pages/SignupPage.jsx
import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { checkPassword, STRENGTH_META } from '../../hooks/usePasswordStrength';
import {
  Eye, EyeOff, Check, X, Home, User, Mail, Lock,
  ArrowRight, Loader2, ShieldCheck, AlertCircle
} from 'lucide-react';

/* ── Decorative left-panel features list ─────────────────────────────────── */
const FEATURES = [
  { emoji: '📐', text: 'Plan & manage renovation projects' },
  { emoji: '💰', text: 'Track budgets and log expenses'    },
  { emoji: '👷', text: 'Manage contractors & schedules'    },
  { emoji: '📋', text: 'Tasks, permits & shopping lists'   },
  { emoji: '🏗️', text: 'Templates for faster project setup'},
];

/* ── Success screen (shown after account created) ────────────────────────── */
function SuccessScreen() {
  return (
    <div className="min-h-screen bg-dark-900 flex items-center justify-center p-6">
      <div className="text-center animate-scale-in space-y-6 max-w-sm">

        {/* Animated checkmark */}
        <div className="relative inline-flex">
          <div className="w-24 h-24 rounded-full bg-success/10 flex items-center justify-center">
            <Check className="w-12 h-12 text-success" strokeWidth={2.5} />
          </div>
          <div className="absolute inset-0 rounded-full border-2 border-success/30 animate-ping2" />
        </div>

        <div>
          <h2 className="font-display text-3xl font-bold text-white mb-2">
            Account Created! 🎉
          </h2>
          <p className="text-dark-400 text-sm leading-relaxed">
            Your RenovateIQ account is ready.<br />
            Signing you in now…
          </p>
        </div>

        {/* Loading indicator */}
        <div className="flex flex-col items-center gap-3">
          <div className="flex items-center gap-2 text-dark-400 text-sm">
            <Loader2 className="w-4 h-4 animate-spin-fast text-brand-400" />
            <span>Redirecting you to login…</span>
          </div>

          {/* Progress bar */}
          <div className="w-48 h-1 bg-dark-700 rounded-full overflow-hidden">
            <div className="h-full bg-brand-500 rounded-full animate-bar-fill" />
          </div>
        </div>

        <p className="text-dark-600 text-xs">You'll be redirected automatically in a moment</p>
      </div>
    </div>
  );
}

/* ── PasswordRuleItem ─────────────────────────────────────────────────────── */
function PasswordRuleItem({ passed, label }) {
  return (
    <div className={`flex items-center gap-2 transition-all duration-200 ${passed ? 'text-success' : 'text-dark-400'}`}>
      <div className={`w-4 h-4 rounded-full flex items-center justify-center flex-shrink-0 transition-all duration-200 ${passed ? 'bg-success/15' : 'bg-dark-100'}`}>
        {passed
          ? <Check className="w-2.5 h-2.5" strokeWidth={3} />
          : <div className="w-1.5 h-1.5 rounded-full bg-dark-300" />
        }
      </div>
      <span className="text-xs">{label}</span>
    </div>
  );
}

/* ── Main SignupPage component ───────────────────────────────────────────── */
export default function SignupPage() {
  const navigate = useNavigate();
  const { signUp } = useAuth();

  const [form, setForm] = useState({
    fullName: '', email: '', password: '', confirm: '',
  });
  const [showPwd,    setShowPwd]    = useState(false);
  const [showCnf,    setShowCnf]    = useState(false);
  const [loading,    setLoading]    = useState(false);
  const [success,    setSuccess]    = useState(false);
  const [error,      setError]      = useState('');
  const [pwdFocused, setPwdFocused] = useState(false);
  const [touched,    setTouched]    = useState({});

  const set  = (k) => (e) => { setForm(f => ({ ...f, [k]: e.target.value })); setError(''); };
  const blur = (k) => ()  => setTouched(t => ({ ...t, [k]: true }));

  const { results: pwdRules, strength, isValid: pwdValid } = checkPassword(form.password);
  const { pct, color: barColor, label: strengthLabel, textColor } = STRENGTH_META[strength];

  const confirmMatch = form.confirm === form.password;
  const confirmError = touched.confirm && form.confirm.length > 0 && !confirmMatch;

  /* ── Submit ─────────────────────────────────────────────────────────────── */
  async function handleSubmit(e) {
    e.preventDefault();
    setError('');

    // Client-side guard
    if (!form.fullName.trim()) return setError('Please enter your full name.');
    if (!pwdValid)             return setError('Your password does not meet all requirements below.');
    if (!confirmMatch)         return setError('Passwords do not match.');

    setLoading(true);
    try {
      const { error: supaErr } = await signUp(form.email, form.password, form.fullName.trim());
      if (supaErr) throw supaErr;

      // Show success screen, then redirect to /login after 2.5 s
      setSuccess(true);
      setTimeout(() => navigate('/login', { state: { fromSignup: true } }), 2500);
    } catch (err) {
      setError(err.message || 'Sign up failed. Please try again.');
      setLoading(false);
    }
  }

  // ── Render success screen while redirecting ────────────────────────────
  if (success) return <SuccessScreen />;

  // ── Main form ──────────────────────────────────────────────────────────
  return (
    <div className="min-h-screen flex">

      {/* ── Left panel — brand/features ──────────────────────────────────── */}
      <div className="hidden lg:flex w-[44%] xl:w-[40%] bg-dark-900 flex-col justify-between p-12 relative overflow-hidden">

        {/* Geometric decorations */}
        <div className="absolute -top-20 -right-20 w-72 h-72 rounded-full bg-brand-500 opacity-[0.06]" />
        <div className="absolute -bottom-24 -left-16 w-80 h-80 rounded-full bg-success opacity-[0.05]" />
        <div className="absolute top-1/3 right-12 w-40 h-40 rounded-full bg-brand-400 opacity-[0.04]" />

        {/* Subtle grid lines */}
        <div className="absolute inset-0 opacity-[0.025]"
          style={{
            backgroundImage: `
              linear-gradient(rgba(255,255,255,.2) 1px, transparent 1px),
              linear-gradient(90deg, rgba(255,255,255,.2) 1px, transparent 1px)
            `,
            backgroundSize: '48px 48px'
          }}
        />

        {/* Logo */}
        <div className="relative z-10">
          <div className="flex items-center gap-3 mb-14">
            <div className="w-11 h-11 bg-brand-500 rounded-2xl flex items-center justify-center shadow-glow">
              <Home className="w-5 h-5 text-white" />
            </div>
            <div>
              <div className="font-display text-xl text-brand-400 font-semibold leading-none">RenovateIQ</div>
              <div className="text-[10px] text-dark-600 uppercase tracking-widest mt-0.5">Home Improvement</div>
            </div>
          </div>

          <h2 className="font-display text-4xl xl:text-[2.6rem] text-white leading-[1.18] mb-5">
            Build your dream home,<br />
            <span className="text-brand-400">one project</span><br />
            at a time.
          </h2>
          <p className="text-dark-400 text-sm leading-relaxed max-w-xs">
            Join thousands of homeowners who plan smarter renovations with RenovateIQ.
          </p>
        </div>

        {/* Feature list */}
        <div className="relative z-10 space-y-3.5">
          {FEATURES.map((f, i) => (
            <div
              key={f.text}
              className="flex items-center gap-4 animate-slide-in"
              style={{ animationDelay: `${i * 0.1}s` }}
            >
              <div className="w-9 h-9 rounded-xl bg-dark-800 border border-dark-700 flex items-center justify-center text-lg flex-shrink-0">
                {f.emoji}
              </div>
              <span className="text-dark-300 text-sm">{f.text}</span>
            </div>
          ))}
        </div>

        {/* Bottom strip */}
        <div className="relative z-10 pt-6 border-t border-dark-800">
          <p className="text-dark-600 text-xs italic">
            "The best renovation starts with a solid plan."
          </p>
        </div>
      </div>

      {/* ── Right panel — signup form ─────────────────────────────────────── */}
      <div className="flex-1 flex flex-col justify-center bg-white overflow-y-auto px-6 py-10 sm:px-10 lg:px-14 xl:px-16">
        <div className="w-full max-w-md mx-auto">

          {/* Mobile logo */}
          <div className="flex items-center gap-2.5 mb-8 lg:hidden">
            <div className="w-9 h-9 bg-brand-500 rounded-xl flex items-center justify-center">
              <Home className="w-4 h-4 text-white" />
            </div>
            <span className="font-display text-xl text-brand-500 font-semibold">RenovateIQ</span>
          </div>

          {/* Heading */}
          <div className="mb-7 animate-fade-up">
            <h1 className="font-display text-3xl font-bold text-dark-900 mb-1.5">Create Account</h1>
            <p className="text-dark-500 text-sm">
              Already have an account?{' '}
              <Link to="/login" className="text-brand-500 font-semibold hover:underline">
                Sign in here
              </Link>
            </p>
          </div>

          {/* Global error */}
          {error && (
            <div className="mb-5 flex items-start gap-3 bg-danger-light border border-danger/20 rounded-xl px-4 py-3 animate-scale-in">
              <AlertCircle className="w-4 h-4 text-danger flex-shrink-0 mt-0.5" />
              <p className="text-danger text-sm font-medium">{error}</p>
            </div>
          )}

          {/* ── FORM ─────────────────────────────────────────────────────── */}
          <form onSubmit={handleSubmit} className="space-y-5" noValidate>

            {/* Full name */}
            <div className="animate-fade-up" style={{ animationDelay: '0.05s' }}>
              <label className="label">Full Name</label>
              <div className="relative">
                <User className="pointer-events-none absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-dark-400" />
                <input
                  type="text"
                  value={form.fullName}
                  onChange={set('fullName')}
                  onBlur={blur('fullName')}
                  placeholder="e.g. Ravi Kumar"
                  autoComplete="name"
                  required
                  className={`field pl-10 ${touched.fullName && !form.fullName.trim() ? 'field-error' : ''}`}
                />
              </div>
              {touched.fullName && !form.fullName.trim() && (
                <p className="text-danger text-xs mt-1.5 flex items-center gap-1">
                  <X className="w-3 h-3" /> Full name is required
                </p>
              )}
            </div>

            {/* Email */}
            <div className="animate-fade-up" style={{ animationDelay: '0.1s' }}>
              <label className="label">Email Address</label>
              <div className="relative">
                <Mail className="pointer-events-none absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-dark-400" />
                <input
                  type="email"
                  value={form.email}
                  onChange={set('email')}
                  onBlur={blur('email')}
                  placeholder="you@example.com"
                  autoComplete="email"
                  required
                  className="field pl-10"
                />
              </div>
            </div>

            {/* Password */}
            <div className="animate-fade-up" style={{ animationDelay: '0.15s' }}>
              <label className="label">Password</label>
              <div className="relative">
                <Lock className="pointer-events-none absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-dark-400" />
                <input
                  type={showPwd ? 'text' : 'password'}
                  value={form.password}
                  onChange={set('password')}
                  onFocus={() => setPwdFocused(true)}
                  onBlur={() => { setPwdFocused(false); blur('password')(); }}
                  placeholder="Create a strong password"
                  autoComplete="new-password"
                  required
                  className={`field pl-10 pr-10 ${
                    touched.password && form.password && !pwdValid ? 'field-error' :
                    touched.password && pwdValid ? 'field-ok' : ''
                  }`}
                />
                <button
                  type="button"
                  onClick={() => setShowPwd(s => !s)}
                  className="absolute right-3.5 top-1/2 -translate-y-1/2 text-dark-400 hover:text-dark-700 transition-colors"
                  tabIndex={-1}
                >
                  {showPwd ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>

              {/* Strength meter */}
              {form.password.length > 0 && (
                <div className="mt-2.5 space-y-2 animate-fade-in">
                  {/* Bar */}
                  <div className="flex items-center justify-between mb-1">
                    <span className="text-xs text-dark-400">Password strength</span>
                    <span className={`text-xs font-bold ${textColor}`}>{strengthLabel}</span>
                  </div>
                  <div className="h-1.5 bg-dark-100 rounded-full overflow-hidden">
                    <div
                      className={`h-full rounded-full transition-all duration-500 ${barColor}`}
                      style={{ width: `${pct}%` }}
                    />
                  </div>

                  {/* Rules checklist — always shown when focused or not strong */}
                  {(pwdFocused || strength !== 'strong') && (
                    <div className="mt-3 grid grid-cols-1 sm:grid-cols-2 gap-1.5 p-3 bg-dark-50 rounded-xl animate-fade-in">
                      {pwdRules.map(r => (
                        <PasswordRuleItem key={r.id} passed={r.passed} label={r.label} />
                      ))}
                    </div>
                  )}
                </div>
              )}
            </div>

            {/* Confirm Password */}
            <div className="animate-fade-up" style={{ animationDelay: '0.2s' }}>
              <label className="label">Confirm Password</label>
              <div className="relative">
                <Lock className="pointer-events-none absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-dark-400" />
                <input
                  type={showCnf ? 'text' : 'password'}
                  value={form.confirm}
                  onChange={set('confirm')}
                  onBlur={blur('confirm')}
                  placeholder="Repeat your password"
                  autoComplete="new-password"
                  required
                  className={`field pl-10 pr-10 ${
                    confirmError           ? 'field-error' :
                    touched.confirm && form.confirm && confirmMatch ? 'field-ok' : ''
                  }`}
                />
                <button
                  type="button"
                  onClick={() => setShowCnf(s => !s)}
                  className="absolute right-3.5 top-1/2 -translate-y-1/2 text-dark-400 hover:text-dark-700 transition-colors"
                  tabIndex={-1}
                >
                  {showCnf ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
                {/* Match icon */}
                {form.confirm.length > 0 && (
                  <div className="absolute right-9 top-1/2 -translate-y-1/2">
                    {confirmMatch
                      ? <Check className="w-4 h-4 text-success" strokeWidth={2.5} />
                      : <X     className="w-4 h-4 text-danger"  strokeWidth={2.5} />
                    }
                  </div>
                )}
              </div>
              {confirmError && (
                <p className="text-danger text-xs mt-1.5 flex items-center gap-1">
                  <X className="w-3 h-3" /> Passwords do not match
                </p>
              )}
              {touched.confirm && form.confirm && confirmMatch && (
                <p className="text-success text-xs mt-1.5 flex items-center gap-1">
                  <Check className="w-3 h-3" strokeWidth={3} /> Passwords match
                </p>
              )}
            </div>

            {/* Terms */}
            <p className="text-xs text-dark-400 leading-relaxed animate-fade-up" style={{ animationDelay: '0.22s' }}>
              By creating an account you agree to our{' '}
              <span className="text-brand-500 cursor-pointer hover:underline">Terms of Service</span>{' '}
              and{' '}
              <span className="text-brand-500 cursor-pointer hover:underline">Privacy Policy</span>.
            </p>

            {/* Submit button */}
            <button
              type="submit"
              disabled={loading}
              className="w-full btn-lg bg-brand-500 text-white hover:bg-brand-600 rounded-2xl shadow-glow focus:ring-brand-400 animate-fade-up"
              style={{ animationDelay: '0.25s' }}
            >
              {loading ? (
                <><Loader2 className="w-5 h-5 animate-spin-fast" />Creating account…</>
              ) : (
                <><ShieldCheck className="w-5 h-5" />Create Account<ArrowRight className="w-5 h-5 ml-auto" /></>
              )}
            </button>

          </form>
        </div>
      </div>
    </div>
  );
}
