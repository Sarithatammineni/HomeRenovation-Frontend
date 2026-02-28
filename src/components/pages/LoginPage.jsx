// frontend/src/components/pages/LoginPage.jsx
import { useState, useEffect } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import {
  Eye, EyeOff, Home, Mail, Lock, ArrowRight,
  Loader2, CheckCircle2, AlertCircle, LogIn
} from 'lucide-react';

/* ── Full-screen redirect loader shown after successful login ─────────────── */
function RedirectLoader({ userName }) {
  return (
    <div className="fixed inset-0 z-50 bg-dark-900 flex flex-col items-center justify-center gap-8 animate-fade-in">

      {/* Pulsing logo */}
      <div className="relative">
        <div className="w-28 h-28 bg-brand-500 rounded-3xl flex items-center justify-center shadow-glow animate-scale-in">
          <Home className="w-14 h-14 text-white" />
        </div>
        {/* Outer ping rings */}
        <div className="absolute inset-0 rounded-3xl border-2 border-brand-400/30 animate-ping2" style={{ animationDuration: '1.4s' }} />
        <div className="absolute -inset-3 rounded-[28px] border border-brand-400/15 animate-ping2" style={{ animationDuration: '1.8s', animationDelay: '.3s' }} />
      </div>

      {/* Text */}
      <div className="text-center space-y-2">
        <h2 className="font-display text-2xl font-bold text-white">
          Welcome back{userName ? `, ${userName.split(' ')[0]}` : ''}! 👋
        </h2>
        <p className="text-dark-400 text-sm">Loading your workspace…</p>
      </div>

      {/* Animated step dots */}
      <div className="flex items-center gap-2">
        {[0, 1, 2, 3, 4].map(i => (
          <div
            key={i}
            className="w-2 h-2 rounded-full bg-brand-500 animate-pulse2"
            style={{ animationDelay: `${i * 0.18}s` }}
          />
        ))}
      </div>

      {/* Progress bar */}
      <div className="w-56 h-1 bg-dark-700 rounded-full overflow-hidden">
        <div className="h-full bg-brand-500 rounded-full animate-bar-fill" />
      </div>

      <p className="text-dark-600 text-xs">Redirecting to your dashboard…</p>
    </div>
  );
}

/* ── Floating decorative tiles (left panel) ──────────────────────────────── */
const DECOR_TILES = [
  { emoji: '🏗️', pos: 'top-[12%]  left-[10%]',  delay: '0s'   },
  { emoji: '🔨', pos: 'top-[22%]  right-[8%]',   delay: '0.3s' },
  { emoji: '🪟', pos: 'top-[55%]  left-[7%]',    delay: '0.6s' },
  { emoji: '🛁', pos: 'bottom-[14%] right-[9%]', delay: '0.9s' },
  { emoji: '🌿', pos: 'top-[40%]  right-[5%]',   delay: '1.2s' },
  { emoji: '💡', pos: 'top-[70%]  left-[13%]',   delay: '1.5s' },
  { emoji: '🪣', pos: 'bottom-[28%] left-[5%]',  delay: '1.8s' },
];

/* ── Main LoginPage ──────────────────────────────────────────────────────── */
export default function LoginPage() {
  const navigate   = useNavigate();
  const location   = useLocation();
  const { signIn, user } = useAuth();

  const fromSignup = location.state?.fromSignup;

  const [form, setForm]           = useState({ email: '', password: '' });
  const [showPwd, setShowPwd]     = useState(false);
  const [loading, setLoading]     = useState(false);
  const [redirecting, setRedirecting] = useState(false);
  const [error, setError]         = useState('');
  const [signupMsg, setSignupMsg] = useState(fromSignup);
  const [touched, setTouched]     = useState({});

  // Auto-dismiss signup success banner after 6 s
  useEffect(() => {
    if (!fromSignup) return;
    const t = setTimeout(() => setSignupMsg(false), 6000);
    return () => clearTimeout(t);
  }, [fromSignup]);

  const set  = k => e => { setForm(f => ({ ...f, [k]: e.target.value })); setError(''); };
  const blur = k => () => setTouched(t => ({ ...t, [k]: true }));

  /* ── Submit ─────────────────────────────────────────────────────────────── */
  async function handleSubmit(e) {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      const { data, error: supaErr } = await signIn(form.email, form.password);
      if (supaErr) throw supaErr;

      // Trigger full-screen redirect loader → then navigate
      setRedirecting(true);
      setTimeout(() => navigate('/', { replace: true }), 2000);
    } catch (err) {
      const msg = err.message || '';
      setError(
        msg.includes('Invalid login') ? 'Invalid email or password. Please try again.' :
        msg || 'Login failed. Please try again.'
      );
      setLoading(false);
    }
  }

  /* ── Show loader overlay if redirecting ─────────────────────────────────── */
  if (redirecting) return <RedirectLoader userName={user?.user_metadata?.full_name} />;

  /* ── Main render ─────────────────────────────────────────────────────────── */
  return (
    <div className="min-h-screen flex">

      {/* ── Left decorative panel ────────────────────────────────────────── */}
      <div className="hidden lg:flex w-[42%] xl:w-[38%] bg-dark-900 flex-col relative overflow-hidden">

        {/* Floating emoji tiles */}
        {DECOR_TILES.map(t => (
          <div
            key={t.emoji}
            className={`absolute ${t.pos} w-14 h-14 bg-dark-800 border border-dark-700 rounded-2xl
              flex items-center justify-center text-2xl animate-float opacity-70`}
            style={{ animationDelay: t.delay, animationDuration: `${3 + parseFloat(t.delay) * 0.5}s` }}
          >
            {t.emoji}
          </div>
        ))}

        {/* Glow blobs */}
        <div className="absolute top-1/4 left-1/2 -translate-x-1/2 w-64 h-64 rounded-full bg-brand-500 opacity-[0.07] blur-3xl" />
        <div className="absolute bottom-1/4 left-1/3 w-48 h-48 rounded-full bg-success opacity-[0.05] blur-2xl" />

        {/* Center content */}
        <div className="flex-1 flex flex-col items-center justify-center p-10 relative z-10">
          <div className="w-20 h-20 bg-brand-500 rounded-3xl flex items-center justify-center mb-6 shadow-glow">
            <Home className="w-10 h-10 text-white" />
          </div>
          <h2 className="font-display text-3xl font-bold text-white text-center mb-3">RenovateIQ</h2>
          <p className="text-dark-400 text-sm text-center leading-relaxed max-w-[240px]">
            Your home improvement projects, budgets &amp; contractors — all in one place.
          </p>

          {/* Mini stats */}
          <div className="mt-10 grid grid-cols-3 gap-3 w-full max-w-[280px]">
            {[
              ['📁', '∞',    'Projects'],
              ['✅', 'Track', 'Tasks'],
              ['💰', 'Smart', 'Budgets'],
            ].map(([icon, val, label]) => (
              <div key={label} className="bg-dark-800 border border-dark-700 rounded-2xl p-3 text-center">
                <div className="text-xl mb-1">{icon}</div>
                <div className="text-white text-xs font-bold font-mono">{val}</div>
                <div className="text-dark-500 text-[10px]">{label}</div>
              </div>
            ))}
          </div>
        </div>

        {/* Bottom strip */}
        <div className="border-t border-dark-800 p-5 text-center">
          <p className="text-dark-600 text-xs">
            New to RenovateIQ?{' '}
            <Link to="/signup" className="text-brand-400 hover:underline font-semibold">
              Create a free account →
            </Link>
          </p>
        </div>
      </div>

      {/* ── Right panel — login form ──────────────────────────────────────── */}
      <div className="flex-1 flex flex-col justify-center bg-white px-6 py-12 sm:px-10 lg:px-14 xl:px-16 overflow-y-auto">
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
            <h1 className="font-display text-3xl font-bold text-dark-900 mb-1.5">Welcome Back</h1>
            <p className="text-dark-500 text-sm">
              Don't have an account?{' '}
              <Link to="/signup" className="text-brand-500 font-semibold hover:underline">
                Sign up free
              </Link>
            </p>
          </div>

          {/* ── Signup success banner ──────────────────────────────────────── */}
          {signupMsg && (
            <div className="mb-5 flex items-start gap-3 bg-success-light border border-success/25 rounded-xl px-4 py-3.5 animate-scale-in">
              <CheckCircle2 className="w-5 h-5 text-success flex-shrink-0 mt-0.5" />
              <div>
                <p className="text-success font-semibold text-sm">Account created successfully!</p>
                <p className="text-success/70 text-xs mt-0.5">
                  You're all set — sign in below.
                </p>
              </div>
              <button onClick={() => setSignupMsg(false)} className="ml-auto text-success/60 hover:text-success transition-colors">
                <span className="text-xs">✕</span>
              </button>
            </div>
          )}

          {/* ── Error banner ──────────────────────────────────────────────── */}
          {error && (
            <div className="mb-5 flex items-start gap-3 bg-danger-light border border-danger/25 rounded-xl px-4 py-3.5 animate-scale-in">
              <AlertCircle className="w-5 h-5 text-danger flex-shrink-0 mt-0.5" />
              <p className="text-danger text-sm font-medium">{error}</p>
            </div>
          )}

          {/* ── Form ─────────────────────────────────────────────────────── */}
          <form onSubmit={handleSubmit} className="space-y-5" noValidate>

            {/* Email */}
            <div className="animate-fade-up" style={{ animationDelay: '0.05s' }}>
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
                  autoFocus
                  required
                  className={`field pl-10 ${touched.email && !form.email ? 'field-error' : ''}`}
                />
              </div>
              {touched.email && !form.email && (
                <p className="text-danger text-xs mt-1.5">Email is required</p>
              )}
            </div>

            {/* Password */}
            <div className="animate-fade-up" style={{ animationDelay: '0.1s' }}>
              <div className="flex items-center justify-between mb-1.5">
                <label className="label mb-0">Password</label>
                <button
                  type="button"
                  className="text-xs text-brand-500 hover:underline font-medium"
                  onClick={() => alert('Password reset coming soon!')}
                >
                  Forgot password?
                </button>
              </div>
              <div className="relative">
                <Lock className="pointer-events-none absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-dark-400" />
                <input
                  type={showPwd ? 'text' : 'password'}
                  value={form.password}
                  onChange={set('password')}
                  onBlur={blur('password')}
                  placeholder="Your password"
                  autoComplete="current-password"
                  required
                  className={`field pl-10 pr-10 ${touched.password && !form.password ? 'field-error' : ''}`}
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
              {touched.password && !form.password && (
                <p className="text-danger text-xs mt-1.5">Password is required</p>
              )}
            </div>

            {/* Remember me */}
            <div className="animate-fade-up" style={{ animationDelay: '0.15s' }}>
              <label className="flex items-center gap-3 cursor-pointer group">
                <div className="relative">
                  <input
                    type="checkbox"
                    className="peer sr-only"
                  />
                  <div className="w-5 h-5 rounded-md border-2 border-dark-200 bg-dark-50
                    peer-checked:bg-brand-500 peer-checked:border-brand-500
                    group-hover:border-brand-400 transition-all duration-150" />
                  <div className="absolute inset-0 flex items-center justify-center scale-0 peer-checked:scale-100 transition-transform duration-150">
                    <svg className="w-3 h-3 text-white" fill="none" stroke="currentColor" strokeWidth="3" viewBox="0 0 24 24">
                      <polyline points="20 6 9 17 4 12" />
                    </svg>
                  </div>
                </div>
                <span className="text-sm text-dark-500 group-hover:text-dark-700 transition-colors">
                  Keep me signed in for 30 days
                </span>
              </label>
            </div>

            {/* Submit */}
            <button
              type="submit"
              disabled={loading}
              className="w-full btn-lg bg-brand-500 text-white hover:bg-brand-600
                rounded-2xl shadow-glow focus:ring-brand-400 animate-fade-up"
              style={{ animationDelay: '0.2s' }}
            >
              {loading ? (
                <><Loader2 className="w-5 h-5 animate-spin-fast" />Signing in…</>
              ) : (
                <><LogIn className="w-5 h-5" />Sign In<ArrowRight className="w-5 h-5 ml-auto" /></>
              )}
            </button>

          </form>

          {/* Divider */}
          <div className="my-7 flex items-center gap-3 animate-fade-up" style={{ animationDelay: '0.25s' }}>
            <div className="flex-1 h-px bg-dark-100" />
            <span className="text-dark-400 text-xs font-semibold uppercase tracking-wider">or</span>
            <div className="flex-1 h-px bg-dark-100" />
          </div>

          {/* Sign up CTA */}
          <Link
            to="/signup"
            className="flex items-center justify-center gap-2 w-full btn-lg btn-secondary rounded-2xl animate-fade-up"
            style={{ animationDelay: '0.3s' }}
          >
            Create New Account
          </Link>

        </div>
      </div>
    </div>
  );
}
