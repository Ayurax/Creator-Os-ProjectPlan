import { useState } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { Alert, AuthShell } from '../components/ui';

export default function Login() {
  const { login } = useAuth();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      await login(email, password);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Login failed');
    } finally {
      setLoading(false);
    }
  };

  const leftPanel = (
    <div style={{ maxWidth: '28rem' }}>
      <div className="brand-lockup" style={{ justifyContent: 'flex-start', marginBottom: '2rem' }}>
        <span className="brand-mark" style={{ 
          width: '3.5rem', 
          height: '3.5rem', 
          fontSize: '1.5rem',
          background: 'var(--color-accent)',
        }}>CO</span>
      </div>
      <h3 style={{ 
        fontFamily: 'var(--font-family-serif)', 
        fontSize: 'clamp(1.5rem, 3vw, 2.25rem)', 
        fontWeight: 400, 
        lineHeight: 1.2, 
        color: 'var(--color-ink)',
        marginBottom: '1.5rem',
        letterSpacing: '-0.02em',
      }}>
        Where brands and creators<br />build together
      </h3>
      <p style={{ 
        fontSize: '1rem', 
        lineHeight: 1.7, 
        color: 'var(--color-ink-secondary)',
        maxWidth: '24rem',
      }}>
        CreatorOS is the operating system for creator-brand collaboration. 
        Streamline campaigns, manage contracts, track deliverables, and grow 
        partnerships — all in one workspace designed for the creator economy.
      </p>
    </div>
  );

  return (
    <AuthShell 
      title="Log in" 
      subtitle="Welcome back"
      leftPanel={leftPanel}
    >
      <form onSubmit={handleSubmit} className="auth-form">
        {error && <Alert>{error}</Alert>}
        <div className="form-field">
          <label htmlFor="email">Email</label>
          <input
            id="email"
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="input"
            required
            autoComplete="email"
          />
        </div>
        <div className="form-field">
          <label htmlFor="password">Password</label>
          <input
            id="password"
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className="input"
            required
            autoComplete="current-password"
          />
        </div>
        <button type="submit" disabled={loading} className="button">
          {loading ? 'Logging in...' : 'Login'}
        </button>
        <p className="auth-switch">
          Don't have an account? <Link to="/register">Register</Link>
        </p>
      </form>
    </AuthShell>
  );
}
