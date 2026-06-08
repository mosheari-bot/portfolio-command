import { useState } from 'react';
import { login } from './firebase.js';
import { useTheme, btn, inp } from './theme.jsx';

export default function Login() {
  const { t } = useTheme();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  async function handleLogin(e) {
    e.preventDefault();
    setError(''); setLoading(true);
    try {
      await login(email, password);
    } catch (err) {
      setError('Invalid email or password. Please try again.');
      setLoading(false);
    }
  }

  return (
    <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', background: t.bg, padding: 24 }}>
      <div style={{ background: t.bgCard, border: `1px solid ${t.border}`, borderRadius: 12, padding: '40px 36px', width: '100%', maxWidth: 400, boxShadow: t.shadow }}>

        {/* Logo */}
        <div style={{ textAlign: 'center', marginBottom: 32 }}>
          <div style={{ fontSize: 40, marginBottom: 8 }}>🏛</div>
          <div style={{ fontSize: 22, fontWeight: 700, color: t.text, letterSpacing: '0.1em', fontFamily: "'Courier New', monospace" }}>
            PORTFOLIO COMMAND
          </div>
          <div style={{ fontSize: 13, color: t.textMuted, marginTop: 4 }}>
            Boss Property Management System
          </div>
        </div>

        {/* Form */}
        <form onSubmit={handleLogin} style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
            <label style={{ fontSize: 13, fontWeight: 600, color: t.textSub }}>Email</label>
            <input
              type="email" required autoComplete="email"
              style={{ ...inp(t), padding: '12px 14px', fontSize: 15 }}
              value={email} onChange={e => setEmail(e.target.value)}
              placeholder="your@email.com"
            />
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
            <label style={{ fontSize: 13, fontWeight: 600, color: t.textSub }}>Password</label>
            <input
              type="password" required autoComplete="current-password"
              style={{ ...inp(t), padding: '12px 14px', fontSize: 15 }}
              value={password} onChange={e => setPassword(e.target.value)}
              placeholder="••••••••"
            />
          </div>

          {error && (
            <div style={{ background: t.redBg, border: `1px solid ${t.red}`, borderRadius: 6, padding: '10px 14px', fontSize: 13, color: t.red }}>
              {error}
            </div>
          )}

          <button
            type="submit" disabled={loading}
            style={{ ...btn(t, 'dark'), padding: '14px', fontSize: 15, marginTop: 8, opacity: loading ? 0.7 : 1 }}
          >
            {loading ? 'Signing in…' : 'Sign In'}
          </button>
        </form>

        {/* Face ID note */}
        <div style={{ marginTop: 20, padding: '12px 14px', background: t.bgAlt, borderRadius: 8, border: `1px solid ${t.borderLight}` }}>
          <div style={{ fontSize: 12, color: t.textMuted, textAlign: 'center', lineHeight: 1.6 }}>
            💡 Save your password when prompted by your browser to enable <strong>Face ID</strong> or <strong>fingerprint</strong> login on your next visit.
          </div>
        </div>
      </div>
    </div>
  );
}
