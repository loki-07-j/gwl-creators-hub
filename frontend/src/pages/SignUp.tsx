import { useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { Seo } from '@/components/Seo';
import { useAuth } from '@/store/auth';
import { errorMessage } from '@/lib/api';

export default function SignUp() {
  const { token = '' } = useParams();
  const navigate = useNavigate();
  const register = useAuth((s) => s.register);

  const [name, setName] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  async function submit() {
    if (loading) return;
    setError('');
    if (name.trim().length < 2 || password.length < 4) {
      setError('Enter your name and a password of at least 4 characters.');
      return;
    }
    setLoading(true);
    try {
      const user = await register(token, name.trim(), password);
      navigate(user.role === 'ADMIN' ? '/admin' : '/dashboard', { replace: true });
    } catch (err) {
      setError(errorMessage(err, 'This invite link is invalid or has expired.'));
      setLoading(false);
    }
  }

  return (
    <>
      <Seo title="Create account" path="/signup" noindex />
      <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 24 }}>
        <div style={{ width: '100%', maxWidth: 400, background: 'linear-gradient(160deg,rgba(26,36,48,.9),rgba(13,19,26,.92))', border: '1px solid rgba(255,255,255,.12)', borderRadius: 24, padding: '34px 32px', boxShadow: '0 40px 90px -30px rgba(0,0,0,.85)' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 20 }}>
            <img src="/assets/gwl-logo.png" alt="GWL" style={{ width: 40, height: 40, borderRadius: 11, objectFit: 'cover' }} />
            <span style={{ fontFamily: 'Sora', fontWeight: 800, fontSize: 17 }}>GWL <span style={{ color: '#F4C542' }}>Creators Hub</span></span>
          </div>
          <div style={{ fontFamily: 'Sora', fontWeight: 800, fontSize: 24, marginBottom: 6 }}>Create your account</div>
          <div style={{ fontSize: 14, color: '#A8B3C2', marginBottom: 22 }}>Set up your profile to access your hub.</div>

          <label style={{ display: 'block', fontSize: 13, fontWeight: 600, color: '#A8B3C2', marginBottom: 7 }}>Full name</label>
          <input value={name} onChange={(e) => setName(e.target.value)} placeholder="Your name" style={{ width: '100%', background: 'rgba(255,255,255,.05)', border: '1px solid rgba(255,255,255,.12)', borderRadius: 12, padding: '12px 14px', color: '#fff', fontSize: 14.5, outline: 'none', marginBottom: 16 }} />

          <label style={{ display: 'block', fontSize: 13, fontWeight: 600, color: '#A8B3C2', marginBottom: 7 }}>Password</label>
          <input value={password} onChange={(e) => setPassword(e.target.value)} type="password" placeholder="••••••" onKeyDown={(e) => e.key === 'Enter' && submit()} style={{ width: '100%', background: 'rgba(255,255,255,.05)', border: '1px solid rgba(255,255,255,.12)', borderRadius: 12, padding: '12px 14px', color: '#fff', fontSize: 14.5, outline: 'none', marginBottom: 16 }} />

          {error && (
            <div style={{ display: 'flex', alignItems: 'center', gap: 8, padding: '10px 13px', borderRadius: 10, background: 'rgba(255,82,82,.1)', border: '1px solid rgba(255,82,82,.3)', marginBottom: 14 }}>
              <span style={{ fontSize: 14 }}>⚠️</span><span style={{ fontSize: 13, color: '#ff9b9b' }}>{error}</span>
            </div>
          )}

          <button onClick={submit} className="btn-primary" style={{ cursor: 'pointer', width: '100%', fontFamily: 'Sora', fontWeight: 700, fontSize: 15.5, color: '#06222a', background: 'linear-gradient(95deg,#2A96A6,#36b6c9)', border: 'none', borderRadius: 13, padding: 15, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 10 }}>
            {loading && <span style={{ width: 17, height: 17, border: '2.5px solid rgba(6,34,42,.3)', borderTopColor: '#06222a', borderRadius: '50%', animation: 'spin .8s linear infinite' }} />}
            {loading ? 'Creating account…' : 'Create account'}
          </button>
        </div>
      </div>
    </>
  );
}
