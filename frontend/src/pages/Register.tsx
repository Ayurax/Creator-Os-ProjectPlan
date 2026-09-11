import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { Alert, AuthShell } from '../components/ui';

type Role = 'BRAND' | 'CREATOR' | 'FREELANCER' | 'TALENT_MANAGER';

const roleOptions: Array<{ value: Role; label: string; description: string }> = [
  { value: 'BRAND', label: 'Brand', description: 'Find and manage creator partnerships' },
  { value: 'CREATOR', label: 'Creator', description: 'Monetize your audience with brand deals' },
  { value: 'FREELANCER', label: 'Freelancer', description: 'Offer creative services to brands' },
  { value: 'TALENT_MANAGER', label: 'Talent Manager', description: 'Represent and grow creator rosters' },
];

export default function Register() {
  const { register } = useAuth();
  const navigate = useNavigate();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [role, setRole] = useState<Role>('CREATOR');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      await register(email, password, role);
      navigate('/dashboard');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Registration failed');
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
        Join the collaboration<br />operating system
      </h3>
      <p style={{ 
        fontSize: '1rem', 
        lineHeight: 1.7, 
        color: 'var(--color-ink-secondary)',
        maxWidth: '24rem',
      }}>
        CreatorOS connects brands, creators, freelancers, and talent managers 
        in one unified workspace. Choose your role and start building 
        meaningful partnerships today.
      </p>
    </div>
  );

  return (
    <AuthShell 
      title="Create account" 
      subtitle="Choose your role"
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
            autoComplete="new-password"
          />
        </div>
        <div className="form-field">
          <label htmlFor="role">Role</label>
          <div 
            id="role" 
            role="radiogroup" 
            aria-label="Select your role"
            style={{ 
              display: 'grid', 
              gridTemplateColumns: 'repeat(2, 1fr)', 
              gap: '0.75rem',
              marginTop: '0.25rem',
            }}
          >
            {roleOptions.map((option) => (
              <button
                key={option.value}
                type="button"
                role="radio"
                aria-checked={role === option.value}
                aria-label={option.label}
                onClick={() => setRole(option.value)}
                style={{
                  display: 'flex',
                  flexDirection: 'column',
                  gap: '0.35rem',
                  padding: '1rem',
                  textAlign: 'left',
                  background: role === option.value ? 'var(--color-accent-soft)' : 'var(--color-surface)',
                  border: `2px solid ${role === option.value ? 'var(--color-accent)' : 'var(--color-line-strong)'}`,
                  borderRadius: 'var(--radius-sm)',
                  cursor: 'pointer',
                  transition: 'all var(--transition-fast)',
                }}
                onMouseEnter={(e) => {
                  if (role !== option.value) {
                    e.currentTarget.style.borderColor = 'var(--color-accent)';
                    e.currentTarget.style.background = 'var(--color-accent-soft)';
                  }
                }}
                onMouseLeave={(e) => {
                  if (role !== option.value) {
                    e.currentTarget.style.borderColor = 'var(--color-line-strong)';
                    e.currentTarget.style.background = 'var(--color-surface)';
                  }
                }}
              >
                <span style={{ 
                  fontFamily: 'var(--font-family-sans)', 
                  fontSize: '0.82rem', 
                  fontWeight: 700, 
                  color: role === option.value ? 'var(--color-accent)' : 'var(--color-ink)',
                }}>
                  {option.label}
                </span>
                <span style={{ 
                  fontFamily: 'var(--font-family-sans)', 
                  fontSize: '0.7rem', 
                  fontWeight: 500, 
                  color: 'var(--color-ink-tertiary)',
                  lineHeight: 1.4,
                }}>
                  {option.description}
                </span>
              </button>
            ))}
          </div>
        </div>
        <button type="submit" disabled={loading} className="button">
          {loading ? 'Registering...' : 'Register'}
        </button>
        <p className="auth-switch">
          Already have an account? <Link to="/login">Login</Link>
        </p>
      </form>
    </AuthShell>
  );
}
