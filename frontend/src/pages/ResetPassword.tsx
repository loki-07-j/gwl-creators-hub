import { useState } from 'react';
import { useNavigate, useParams, Link } from 'react-router-dom';
import { Seo } from '@/components/Seo';
import { api, errorMessage, unwrap } from '@/lib/api';

export default function ResetPassword() {
  const { token = '' } = useParams();
  const navigate = useNavigate();
  const [password, setPassword] = useState('');
  const [confirm, setConfirm] = useState('');
  const [show, setShow] = useState(false);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [done, setDone] = useState(false);

  async function submit() {
    if (loading) return;
    setError('');
    if (password.length < 4) { setError('Password must be at least 4 characters.'); return; }
    if (password !== confirm) { setError('Passwords do not match.'); return; }
    setLoading(true);
    try {
      await unwrap(api.post('/auth/reset-password', { token, password }));
      setDone(true);
      setTimeout(() => navigate('/signin', { replace: true }), 2200);
    } catch (err) {
      setError(errorMessage(err, 'This reset link is invalid or has expired.'));
      setLoading(false);
    }
  }

  const inp: React.CSSProperties = { width: '100%', background: 'rgba(255,255,255,.05)', border: '1px solid rgba(255,255,255,.12)', borderRadius: 11, padding: '12px 14px', color: '#fff', fontSize: 14, outline: 'none' };
  const lbl: React.CSSProperties = { display: 'block', fontSize: 12.5, fontWeight: 600, color: '#A8B3C2', marginBottom: 7 };

  return (
    <>
      <Seo title="Reset password" path="/reset-password" noindex />
      <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 24 }}>
        <div style={{ width: '100%', maxWidth: 400, background: 'linear-gradient(160deg,rgba(26,36,48,.9),rgba(13,19,26,.92))', border: '1px solid rgba(255,255,255,.12)', borderRadius: 24, padding: '34px 32px', boxShadow: '0 40px 90px -30px rgba(0,0,0,.85)' }}>
          <img src="/assets/gwl-logo.png" alt="GWL" style={{ width: 44, height: 44, borderRadius: 12, objectFit: 'cover', marginBottom: 18 }} />
          {done ? (
            <div>
              <div style={{ fontFamily: 'Sora', fontWeight: 800, fontSize: 22, marginBottom: 8 }}>Password updated ✓</div>
              <div style={{ fontSize: 14, color: '#A8B3C2', lineHeight: 1.6 }}>Your password has been changed. Redirecting you to sign in…</div>
              <Link to="/signin" style={{ display: 'inline-block', marginTop: 18, color: '#36b6c9', fontWeight: 600, fontSize: 14 }}>Go to sign in →</Link>
            </div>
          ) : (
            <div>
              <div style={{ fontFamily: 'Sora', fontWeight: 800, fontSize: 24, marginBottom: 6 }}>Set a new password</div>
              <div style={{ fontSize: 13.5, color: '#A8B3C2', marginBottom: 22 }}>Choose a new password for your account.</div>

              <div style={{ marginBottom: 14 }}>
                <label style={lbl}>New password</label>
                <div style={{ position: 'relative' }}>
                  <input type={show ? 'text' : 'password'} value={password} onChange={(e) => setPassword(e.target.value)} placeholder="••••••••" style={inp} />
                  <span onClick={() => setShow((s) => !s)} style={{ position: 'absolute', right: 12, top: 12, cursor: 'pointer', fontSize: 13, color: '#36b6c9', fontWeight: 600 }}>{show ? 'Hide' : 'Show'}</span>
                </div>
              </div>
              <div style={{ marginBottom: 6 }}>
                <label style={lbl}>Confirm password</label>
                <input type={show ? 'text' : 'password'} value={confirm} onChange={(e) => setConfirm(e.target.value)} onKeyDown={(e) => { if (e.key === 'Enter') submit(); }} placeholder="••••••••" style={inp} />
              </div>

              {error && <div style={{ color: '#ff7b7b', fontSize: 12.5, marginTop: 10 }}>{error}</div>}

              <button onClick={submit} disabled={loading} style={{ cursor: 'pointer', width: '100%', marginTop: 18, fontFamily: 'Sora', fontWeight: 700, fontSize: 15, color: '#06222a', background: 'linear-gradient(95deg,#2A96A6,#36b6c9)', border: 'none', borderRadius: 12, padding: 13, opacity: loading ? 0.7 : 1 }}>{loading ? 'Updating…' : 'Update password'}</button>
              <Link to="/signin" style={{ display: 'block', textAlign: 'center', marginTop: 16, color: '#6b7686', fontSize: 13 }}>Back to sign in</Link>
            </div>
          )}
        </div>
      </div>
    </>
  );
}
