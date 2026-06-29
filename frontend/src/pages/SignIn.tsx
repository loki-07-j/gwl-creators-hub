import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Seo } from '@/components/Seo';
import { useAuth } from '@/store/auth';
import { api, errorMessage, unwrap } from '@/lib/api';

type RoleTab = 'member' | 'admin';

const perks = [
  'Your full vault library & downloads',
  'Automatic member pricing on everything',
  'Bonus drops, early access & coupons',
];
const avatars = [
  { t: 'A', bg: '#2A96A6' },
  { t: 'R', bg: '#D4A017' },
  { t: 'S', bg: '#7c4dff' },
  { t: 'M', bg: '#00C853' },
];

export default function SignIn() {
  const navigate = useNavigate();
  const login = useAuth((s) => s.login);

  const [role, setRole] = useState<RoleTab>('member');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPw, setShowPw] = useState(false);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  // Forgot-password flow
  const [forgotOpen, setForgotOpen] = useState(false);
  const [forgotEmail, setForgotEmail] = useState('');
  const [forgotBusy, setForgotBusy] = useState(false);
  const [forgotMsg, setForgotMsg] = useState('');
  const [forgotErr, setForgotErr] = useState('');
  const [devLink, setDevLink] = useState('');

  function openForgot() {
    setForgotEmail(email.trim());
    setForgotMsg(''); setForgotErr(''); setDevLink('');
    setForgotOpen(true);
  }
  async function sendForgot() {
    if (forgotBusy) return;
    setForgotErr(''); setForgotMsg('');
    if (!/^\S+@\S+\.\S+$/.test(forgotEmail.trim())) { setForgotErr('Please enter a valid email.'); return; }
    setForgotBusy(true);
    try {
      const res: any = await unwrap(api.post('/auth/forgot-password', { email: forgotEmail.trim().toLowerCase() }));
      setForgotMsg(res?.message ?? 'If an account exists for that email, a reset link has been sent.');
      if (res?.devResetLink) setDevLink(res.devResetLink);
    } catch (err) {
      setForgotErr(errorMessage(err, 'Could not send the reset link. Please try again.'));
    } finally {
      setForgotBusy(false);
    }
  }

  const seg = (active: boolean) => ({
    background: active ? 'linear-gradient(95deg,#2A96A6,#36b6c9)' : 'transparent',
    color: active ? '#06222a' : '#A8B3C2',
  });
  const inputBorder = error ? 'rgba(255,82,82,.4)' : 'rgba(255,255,255,.1)';

  async function submit() {
    if (loading) return;
    setError('');
    if (!email.trim() || !password) {
      setError('Please enter your email and password.');
      return;
    }
    setLoading(true);
    try {
      const user = await login(email.trim().toLowerCase(), password, role);
      navigate(user.role === 'ADMIN' ? '/admin' : '/dashboard', { replace: true });
    } catch (err) {
      setError(errorMessage(err, 'Incorrect email or password for the selected role.'));
      setLoading(false);
    }
  }

  return (
    <>
      <Seo title="Sign in" path="/signin" noindex />
      <div style={{ minHeight: '100vh', position: 'relative', overflow: 'hidden', display: 'flex' }}>
        {/* ambient glows */}
        <div style={{ position: 'absolute', top: '-10%', left: '5%', width: 560, height: 560, borderRadius: '50%', background: 'radial-gradient(circle,rgba(42,150,166,.22),transparent 65%)', filter: 'blur(30px)', pointerEvents: 'none' }} />
        <div style={{ position: 'absolute', bottom: '-12%', right: '8%', width: 560, height: 560, borderRadius: '50%', background: 'radial-gradient(circle,rgba(212,160,23,.16),transparent 65%)', filter: 'blur(30px)', pointerEvents: 'none' }} />

        {/* LEFT BRAND PANEL */}
        <div className="brandpanel" style={{ flex: 1, position: 'relative', zIndex: 1, padding: '54px 56px', display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }}>
          <a href="/" style={{ display: 'flex', alignItems: 'center', gap: 12, textDecoration: 'none', width: 'fit-content' }}>
            <img src="/assets/gwl-logo.png" alt="GWL" style={{ width: 44, height: 44, borderRadius: 12, objectFit: 'cover' }} />
            <span style={{ fontFamily: 'Sora', fontWeight: 800, fontSize: 19, color: '#fff' }}>
              GWL <span style={{ color: '#F4C542' }}>Creators Hub</span>
            </span>
          </a>
          <div style={{ maxWidth: 440 }}>
            <h1 style={{ fontFamily: 'Sora', fontWeight: 800, fontSize: 46, lineHeight: 1.05, letterSpacing: '-.03em', marginBottom: 20 }}>
              Welcome back to your{' '}
              <span style={{ background: 'linear-gradient(100deg,#2A96A6,#F4C542)', WebkitBackgroundClip: 'text', backgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>creator hub</span>.
            </h1>
            <p style={{ fontSize: 17, lineHeight: 1.6, color: '#A8B3C2', marginBottom: 34 }}>
              Sign in to access your purchased vaults, downloads, exclusive member pricing and bonus drops.
            </p>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
              {perks.map((p) => (
                <div key={p} style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                  <span style={{ width: 30, height: 30, borderRadius: 9, background: 'rgba(42,150,166,.16)', color: '#36b6c9', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 14, flexShrink: 0 }}>✓</span>
                  <span style={{ fontSize: 15, color: '#dfe5ee' }}>{p}</span>
                </div>
              ))}
            </div>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
            <div style={{ display: 'flex' }}>
              {avatars.map((a, i) => (
                <div key={i} style={{ width: 34, height: 34, borderRadius: '50%', marginLeft: -9, border: '2px solid #0B0F14', background: a.bg, display: 'flex', alignItems: 'center', justifyContent: 'center', fontFamily: 'Sora', fontWeight: 700, fontSize: 12 }}>{a.t}</div>
              ))}
            </div>
            <span style={{ fontSize: 13.5, color: '#A8B3C2', marginLeft: 6 }}>
              Joined by <b style={{ color: '#fff' }}>12,000+</b> creators worldwide
            </span>
          </div>
        </div>

        {/* RIGHT FORM PANEL */}
        <div className="formpanel" style={{ width: 520, maxWidth: '100%', position: 'relative', zIndex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '40px 30px' }}>
          <div style={{ width: '100%', maxWidth: 400 }}>
            <a href="/" style={{ display: 'inline-flex', alignItems: 'center', gap: 7, textDecoration: 'none', color: '#A8B3C2', fontSize: 13, fontWeight: 600, marginBottom: 16, padding: '8px 14px', borderRadius: 999, background: 'rgba(255,255,255,.05)', border: '1px solid rgba(255,255,255,.1)' }}>← Back to home</a>
            <div style={{ width: '100%', background: 'linear-gradient(160deg,rgba(26,36,48,.9),rgba(13,19,26,.92))', backdropFilter: 'blur(16px)', border: '1px solid rgba(255,255,255,.12)', borderRadius: 24, padding: '34px 32px', boxShadow: '0 40px 90px -30px rgba(0,0,0,.85)' }}>
              <div style={{ fontFamily: 'Sora', fontWeight: 800, fontSize: 24, letterSpacing: '-.02em', marginBottom: 6 }}>Sign in</div>
              <div style={{ fontSize: 14, color: '#A8B3C2', marginBottom: 22 }}>Choose your account type to continue.</div>

              {/* role segmented */}
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 6, padding: 5, background: 'rgba(0,0,0,.25)', border: '1px solid rgba(255,255,255,.08)', borderRadius: 13, marginBottom: 22 }}>
                <button onClick={() => { setRole('member'); setError(''); }} style={{ cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8, padding: 11, borderRadius: 9, border: 'none', fontFamily: 'Sora', fontWeight: 700, fontSize: 14, transition: 'all .2s', ...seg(role === 'member') }}>
                  <span>👤</span> Member
                </button>
                <button onClick={() => { setRole('admin'); setError(''); }} style={{ cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8, padding: 11, borderRadius: 9, border: 'none', fontFamily: 'Sora', fontWeight: 700, fontSize: 14, transition: 'all .2s', ...seg(role === 'admin') }}>
                  <span>🛡️</span> Admin
                </button>
              </div>

              {/* email */}
              <label style={{ display: 'block', fontSize: 13, fontWeight: 600, color: '#A8B3C2', marginBottom: 7 }}>Email address</label>
              <div style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '12px 14px', borderRadius: 12, background: 'rgba(255,255,255,.05)', border: `1px solid ${inputBorder}`, marginBottom: 16, transition: 'border .2s' }}>
                <span style={{ color: '#6b7686', fontSize: 15 }}>✉️</span>
                <input value={email} onChange={(e) => { setEmail(e.target.value); setError(''); }} type="email" placeholder="you@email.com" style={{ flex: 1, background: 'none', border: 'none', outline: 'none', color: '#fff', fontSize: 14.5 }} />
              </div>

              {/* password */}
              <label style={{ display: 'block', fontSize: 13, fontWeight: 600, color: '#A8B3C2', marginBottom: 7 }}>Password</label>
              <div style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '12px 14px', borderRadius: 12, background: 'rgba(255,255,255,.05)', border: `1px solid ${inputBorder}`, marginBottom: 8, transition: 'border .2s' }}>
                <span style={{ color: '#6b7686', fontSize: 15 }}>🔒</span>
                <input value={password} onChange={(e) => { setPassword(e.target.value); setError(''); }} type={showPw ? 'text' : 'password'} placeholder="••••••" onKeyDown={(e) => { if (e.key === 'Enter') submit(); }} style={{ flex: 1, background: 'none', border: 'none', outline: 'none', color: '#fff', fontSize: 14.5 }} />
                <button onClick={() => setShowPw((v) => !v)} style={{ cursor: 'pointer', background: 'none', border: 'none', color: '#A8B3C2', fontSize: 12, fontWeight: 600 }}>{showPw ? 'Hide' : 'Show'}</button>
              </div>

              {/* error */}
              {error && (
                <div style={{ display: 'flex', alignItems: 'center', gap: 8, padding: '10px 13px', borderRadius: 10, background: 'rgba(255,82,82,.1)', border: '1px solid rgba(255,82,82,.3)', marginBottom: 14 }}>
                  <span style={{ fontSize: 14 }}>⚠️</span>
                  <span style={{ fontSize: 13, color: '#ff9b9b' }}>{error}</span>
                </div>
              )}

              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', margin: '6px 0 18px' }}>
                <label style={{ display: 'flex', alignItems: 'center', gap: 8, fontSize: 13, color: '#A8B3C2', cursor: 'pointer' }}>
                  <input type="checkbox" style={{ accentColor: '#2A96A6', width: 15, height: 15 }} /> Remember me
                </label>
                <span onClick={openForgot} style={{ fontSize: 13, color: '#36b6c9', fontWeight: 600, cursor: 'pointer' }}>Forgot password?</span>
              </div>

              {/* submit */}
              <button onClick={submit} className="btn-primary" style={{ cursor: 'pointer', width: '100%', fontFamily: 'Sora', fontWeight: 700, fontSize: 15.5, color: '#06222a', background: 'linear-gradient(95deg,#2A96A6,#36b6c9)', border: 'none', borderRadius: 13, padding: 15, boxShadow: '0 12px 30px -8px rgba(42,150,166,.55)', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 10 }}>
                {loading && <span style={{ width: 17, height: 17, border: '2.5px solid rgba(6,34,42,.3)', borderTopColor: '#06222a', borderRadius: '50%', animation: 'spin .8s linear infinite' }} />}
                {loading ? 'Signing in…' : role === 'admin' ? 'Sign in to Admin' : 'Sign in to Dashboard'}
              </button>

              <div style={{ textAlign: 'center', fontSize: 12.5, color: '#6b7686', marginTop: 18, lineHeight: 1.5 }}>
                New accounts are created via signup links issued by an admin after membership.
              </div>
            </div>
          </div>
        </div>
      </div>
      {forgotOpen && (
        <div onClick={() => setForgotOpen(false)} style={{ position: 'fixed', inset: 0, zIndex: 90, background: 'rgba(0,0,0,.6)', backdropFilter: 'blur(4px)', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 20 }}>
          <div onClick={(e) => e.stopPropagation()} style={{ width: 'min(420px,100%)', background: '#0d131a', border: '1px solid rgba(255,255,255,.12)', borderRadius: 18, padding: 24, boxShadow: '0 30px 80px -20px rgba(0,0,0,.8)' }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 6 }}>
              <div style={{ fontFamily: 'Sora', fontWeight: 800, fontSize: 18 }}>Reset your password</div>
              <button onClick={() => setForgotOpen(false)} style={{ cursor: 'pointer', width: 32, height: 32, borderRadius: 8, background: 'rgba(255,255,255,.06)', border: '1px solid rgba(255,255,255,.12)', color: '#fff', fontSize: 15 }}>✕</button>
            </div>
            <div style={{ fontSize: 12.5, color: '#6b7686', marginBottom: 16 }}>Enter your account email and we'll send a secure link to set a new password.</div>
            {forgotMsg ? (
              <div>
                <div style={{ padding: '12px 14px', borderRadius: 11, background: 'rgba(0,200,83,.1)', border: '1px solid rgba(0,200,83,.3)', color: '#7ee2a8', fontSize: 13, lineHeight: 1.5 }}>✓ {forgotMsg}</div>
                {devLink && (
                  <div style={{ marginTop: 12, fontSize: 11.5, color: '#A8B3C2' }}>
                    <div style={{ marginBottom: 6, color: '#F4C542', fontWeight: 700 }}>Dev mode (no email configured) — open this link:</div>
                    <a href={devLink} style={{ color: '#36b6c9', wordBreak: 'break-all' }}>{devLink}</a>
                  </div>
                )}
                <button onClick={() => setForgotOpen(false)} style={{ cursor: 'pointer', width: '100%', marginTop: 16, fontFamily: 'Sora', fontWeight: 700, fontSize: 14, color: '#06222a', background: 'linear-gradient(95deg,#2A96A6,#36b6c9)', border: 'none', borderRadius: 11, padding: 12 }}>Done</button>
              </div>
            ) : (
              <div>
                <input value={forgotEmail} onChange={(e) => setForgotEmail(e.target.value)} onKeyDown={(e) => { if (e.key === 'Enter') sendForgot(); }} placeholder="you@email.com" autoFocus style={{ width: '100%', background: 'rgba(255,255,255,.05)', border: `1px solid ${forgotErr ? 'rgba(255,82,82,.4)' : 'rgba(255,255,255,.12)'}`, borderRadius: 11, padding: '12px 14px', color: '#fff', fontSize: 14, outline: 'none' }} />
                {forgotErr && <div style={{ color: '#ff7b7b', fontSize: 12.5, marginTop: 8 }}>{forgotErr}</div>}
                <button onClick={sendForgot} disabled={forgotBusy} style={{ cursor: 'pointer', width: '100%', marginTop: 16, fontFamily: 'Sora', fontWeight: 700, fontSize: 14, color: '#06222a', background: 'linear-gradient(95deg,#2A96A6,#36b6c9)', border: 'none', borderRadius: 11, padding: 12, opacity: forgotBusy ? 0.7 : 1 }}>{forgotBusy ? 'Sending…' : 'Send reset link'}</button>
              </div>
            )}
          </div>
        </div>
      )}
      <style>{`@media(max-width:1024px){.brandpanel{display:none!important}.formpanel{width:100%!important;flex:1}}`}</style>
    </>
  );
}
