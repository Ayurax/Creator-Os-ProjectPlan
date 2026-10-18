import { useState, type FormEvent, type ReactNode } from 'react';
import { Icon } from './Icon';
import { Avatar, Badge, Button, Field, Input } from './UI';

type Role = 'BRAND' | 'CREATOR' | 'FREELANCER' | 'TALENT_MANAGER';
type FormValues = Record<string, string>;
type SubmitPayload = { email: string; password: string; role?: string; profile?: Record<string, unknown> };

const roles: Array<{ value: Role; label: string; desc: string; icon: 'briefcase' | 'camera' | 'sparkles' | 'users' }> = [
  { value: 'BRAND', label: 'Brand', desc: 'Build partnerships', icon: 'briefcase' },
  { value: 'CREATOR', label: 'Creator', desc: 'Grow your work', icon: 'camera' },
  { value: 'FREELANCER', label: 'Freelancer', desc: 'Offer your craft', icon: 'sparkles' },
  { value: 'TALENT_MANAGER', label: 'Talent manager', desc: 'Support your roster', icon: 'users' },
];

const roleFields: Record<Role, Array<{ key: string; label: string; placeholder: string; type?: string; required?: boolean; hint?: string }>> = {
  BRAND: [
    { key: 'companyName', label: 'Company or organisation', placeholder: 'Northstar Studio', required: true },
    { key: 'industry', label: 'Industry', placeholder: 'Fashion, software, food…', required: true },
    { key: 'website', label: 'Company website', placeholder: 'https://example.com', type: 'url', hint: 'Optional' },
    { key: 'description', label: 'Company description', placeholder: 'What does your organisation make?', hint: 'Optional' },
  ],
  CREATOR: [
    { key: 'niche', label: 'Primary content niche', placeholder: 'Travel, beauty, gaming…', required: true },
    { key: 'platforms', label: 'Main social platforms', placeholder: 'Instagram, TikTok, YouTube', hint: 'Optional' },
    { key: 'followers', label: 'Follower count', placeholder: '25000', type: 'number', hint: 'Optional' },
    { key: 'engagementRate', label: 'Engagement rate (%)', placeholder: '4.8', type: 'number', hint: 'Optional, from 0 to 100' },
    { key: 'bio', label: 'Short creator bio', placeholder: 'Tell brands what makes your work distinct…', hint: 'Optional' },
  ],
  FREELANCER: [
    { key: 'skills', label: 'Primary skills or services', placeholder: 'Video editing, motion design…', required: true },
    { key: 'hourlyRate', label: 'Hourly rate', placeholder: '75', type: 'number', hint: 'Optional' },
    { key: 'availability', label: 'Availability', placeholder: 'Weekdays, evenings, project-based…', hint: 'Optional' },
    { key: 'portfolioUrl', label: 'Portfolio URL', placeholder: 'https://portfolio.example', type: 'url', hint: 'Optional' },
  ],
  TALENT_MANAGER: [
    { key: 'agencyName', label: 'Agency or organisation', placeholder: 'Northstar Talent', hint: 'Optional' },
    { key: 'specialty', label: 'Professional role or specialty', placeholder: 'Creator partnerships, music…', hint: 'Optional' },
    { key: 'bio', label: 'Short professional bio', placeholder: 'Share the kind of roster or work you support…', hint: 'Optional' },
  ],
};

function initialValues(): FormValues {
  return { displayName: '', email: '', password: '', confirmPassword: '' };
}

export function AuthView({ mode: initialMode = 'login', onSubmit }: {
  mode?: 'login' | 'register';
  onSubmit?: (payload: SubmitPayload) => Promise<void> | void;
}) {
  const [mode, setMode] = useState<'login' | 'register'>(initialMode);
  const [role, setRole] = useState<Role>('CREATOR');
  const [values, setValues] = useState<FormValues>(initialValues);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const [busy, setBusy] = useState(false);
  const [message, setMessage] = useState('');
  const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({});

  const update = (key: string, value: string) => {
    setValues((current) => ({ ...current, [key]: value }));
    setFieldErrors((current) => ({ ...current, [key]: '' }));
  };

  const validate = (currentValues: FormValues = values) => {
    const errors: Record<string, string> = {};
    if (mode === 'register' && !currentValues.displayName.trim()) errors.displayName = 'Enter your name.';
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(currentValues.email)) errors.email = 'Enter a valid email address.';
    if (currentValues.password.length < 8) errors.password = 'Use at least 8 characters.';
    if (mode === 'register' && currentValues.password !== currentValues.confirmPassword) errors.confirmPassword = 'Passwords do not match.';
    if (mode === 'register') {
      for (const field of roleFields[role]) {
        const value = currentValues[field.key]?.trim() || '';
        if (field.required && !value) errors[field.key] = `${field.label} is required.`;
        if (value && field.type === 'url') {
          try { new URL(value); } catch { errors[field.key] = 'Enter a valid URL.'; }
        }
        if (value && ['followers', 'engagementRate', 'hourlyRate'].includes(field.key)) {
          const number = Number(value);
          const invalid = !Number.isFinite(number) || number < 0 || (field.key === 'engagementRate' && number > 100) || (field.key === 'followers' && !Number.isInteger(number));
          if (invalid) errors[field.key] = field.key === 'engagementRate' ? 'Use a number from 0 to 100.' : 'Enter a valid non-negative number.';
        }
      }
    }
    setFieldErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const submit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setMessage('');
    const submittedValues = { ...values };
    for (const [key, value] of new FormData(event.currentTarget).entries()) {
      if (typeof value === 'string') submittedValues[key] = value;
    }
    setValues(submittedValues);
    if (!validate(submittedValues)) return;
    setBusy(true);
    try {
      const profile: Record<string, unknown> = { displayName: submittedValues.displayName.trim() };
      for (const field of roleFields[role] || []) {
        const value = submittedValues[field.key]?.trim();
        if (!value) continue;
        profile[field.key] = ['followers', 'engagementRate', 'hourlyRate'].includes(field.key) ? Number(value) : value;
      }
      await onSubmit?.({ email: submittedValues.email.trim(), password: submittedValues.password, role: mode === 'register' ? role : undefined, profile: mode === 'register' ? profile : undefined });
    } catch (error) {
      setMessage(error instanceof Error ? error.message : 'Unable to continue. Please try again.');
    } finally {
      setBusy(false);
    }
  };

  const setAuthMode = (next: 'login' | 'register') => {
    setMode(next);
    setMessage('');
    setFieldErrors({});
  };

  const field = (key: string, label: string, placeholder: string, type = 'text', required = false, hint?: string): ReactNode => (
    <Field key={key} label={label} htmlFor={`cos-${key}`} required={required} hint={fieldErrors[key] || hint} error={fieldErrors[key]}>
      <Input id={`cos-${key}`} name={key} type={type} defaultValue={values[key] || ''} onChange={(event) => update(key, event.target.value)} onInput={(event) => update(key, event.currentTarget.value)} placeholder={placeholder} required={required} autoComplete={key === 'email' ? 'email' : key === 'displayName' ? 'name' : undefined} />
    </Field>
  );

  return <div className="cos-auth-page">
    <aside className="cos-auth-story">
      <button className="cos-brand cos-brand--on-dark" onClick={() => setAuthMode('login')}><span className="cos-brand-mark"><span /></span><span className="cos-brand-name">creator<span>os</span><small>STUDIO PLATFORM</small></span></button>
      <div className="cos-auth-story__copy"><Badge tone="lime"><span className="cos-lamp-dot" /> THE CREATOR ECONOMY, CONNECTED</Badge><h1>Good work happens <em>together.</em></h1><p>The people, partnerships and projects behind your next big idea — all in one thoughtfully built workspace.</p><div className="cos-auth-art"><div className="cos-auth-art__orb cos-auth-art__orb--one" /><div className="cos-auth-art__orb cos-auth-art__orb--two" /><div className="cos-auth-art__cross cos-auth-art__cross--one" /><div className="cos-auth-art__cross cos-auth-art__cross--two" /><div className="cos-auth-art__card cos-auth-art__card--top"><div className="cos-auth-art__label"><span><i /> NEW PARTNERSHIP</span><Icon name="arrow-up-right" size={15} /></div><div className="cos-auth-art__avatars"><Avatar name="Maya Chen" color="violet" size="lg" /><span className="cos-auth-art__plus">+</span><Avatar name="Northstar Studio" initials="N" color="mint" size="lg" /></div><strong>Summer in Motion</strong><div className="cos-auth-art__progress"><span /></div><small>72% campaign progress</small></div><div className="cos-auth-art__floating"><span className="cos-floating-icon"><Icon name="check" size={15} /></span><span><strong>Deliverable approved</strong><small>Just now · Everything's moving</small></span></div><div className="cos-auth-art__orbit-label">BUILD WITH INTENTION <span>✳</span></div></div><div className="cos-auth-social-proof"><div className="cos-proof-avatars"><Avatar name="Maya Chen" color="violet" size="sm" /><Avatar name="Jordan Lee" color="mint" size="sm" /><Avatar name="Nina Park" color="amber" size="sm" /><Avatar name="Sam Rivera" color="rose" size="sm" /></div><div><strong>Made for the people behind the work.</strong><span>One workspace. Better partnerships.</span></div></div></div><div className="cos-auth-story__footer"><span>CREATOROS © 2026</span><span>DESIGNED TO MOVE WORK FORWARD <i>↗</i></span></div>
    </aside>
    <main className="cos-auth-form-side"><div className="cos-auth-topline"><span>YOUR WORKSPACE STARTS HERE</span><button onClick={() => setAuthMode(mode === 'login' ? 'register' : 'login')}>{mode === 'login' ? 'New to CreatorOS?' : 'Already have an account?'} <strong>{mode === 'login' ? 'Create account' : 'Log in'} <Icon name="arrow-up-right" size={14} /></strong></button></div><div className="cos-auth-form-wrap"><div className="cos-auth-form-header"><span className="cos-auth-kicker"><span /> {mode === 'login' ? 'WELCOME BACK' : 'PROFILE ONBOARDING'}</span><h2>{mode === 'login' ? 'Good to have you back.' : 'Start with the right details.'}</h2><p>{mode === 'login' ? 'Sign in to pick up where your team left off.' : 'Tell us what you do so your workspace is ready on day one.'}</p></div><form className="cos-auth-form cos-registration-form" onSubmit={submit}>
      {mode === 'register' && <div className="cos-form-section"><div className="cos-form-section-heading"><strong>Choose your role</strong><span>Your role shapes the fields we save.</span></div><div className="cos-role-picker" role="radiogroup" aria-label="Select your role">{roles.map((option) => <button type="button" role="radio" aria-checked={role === option.value} key={option.value} className={role === option.value ? 'is-selected' : ''} onClick={() => { setRole(option.value); setFieldErrors({}); }}><Icon name={option.icon} size={17} /><span><strong>{option.label}</strong><small>{option.desc}</small></span><i>{role === option.value ? <Icon name="check-circle" size={16} /> : null}</i></button>)}</div></div>}
      <div className="cos-form-section"><div className="cos-form-section-heading"><strong>{mode === 'register' ? 'About you' : 'Your account'}</strong><span>{mode === 'register' ? 'Use the name people should see in CreatorOS.' : 'Use your CreatorOS account.'}</span></div>{mode === 'register' ? <>{field('displayName', 'Full name or professional name', 'Maya Chen', 'text', true)}{field('email', 'Email address', 'you@example.com', 'email', true)}</> : field('email', 'Email', 'you@company.com', 'email', true)}</div>
      {mode === 'register' && <div className="cos-form-section"><div className="cos-form-section-heading"><strong>{role === 'BRAND' ? 'Organisation' : 'Professional profile'}</strong><span>These details power your role-specific workspace.</span></div><div className="cos-registration-fields">{roleFields[role].map((item) => field(item.key, item.label, item.placeholder, item.type, item.required, item.hint))}</div></div>}
      <div className="cos-form-section"><div className="cos-form-section-heading"><strong>Account security</strong><span>Your password is encrypted before it is stored.</span></div><Field label="Password" htmlFor="cos-password" required error={fieldErrors.password}><Input id="cos-password" type={showPassword ? 'text' : 'password'} value={values.password} onChange={(event) => update('password', event.target.value)} placeholder="At least 8 characters" autoComplete={mode === 'login' ? 'current-password' : 'new-password'} trailing={<button className="cos-password-toggle" type="button" onClick={() => setShowPassword(!showPassword)}>{showPassword ? 'Hide' : 'Show'}</button>} /></Field>{mode === 'register' && <Field label="Confirm password" htmlFor="cos-confirmPassword" required error={fieldErrors.confirmPassword}><Input id="cos-confirmPassword" type={showConfirm ? 'text' : 'password'} value={values.confirmPassword} onChange={(event) => update('confirmPassword', event.target.value)} placeholder="Repeat your password" autoComplete="new-password" trailing={<button className="cos-password-toggle" type="button" onClick={() => setShowConfirm(!showConfirm)}>{showConfirm ? 'Hide' : 'Show'}</button>} /></Field>}</div>
      {message && <div className="cos-auth-message is-error" role="alert">{message}</div>}
      <Button type="submit" size="lg" className="cos-auth-submit" disabled={busy}>{busy ? 'Please wait…' : mode === 'login' ? 'Sign in to CreatorOS' : 'Create my workspace'} <Icon name="arrow-right" size={17} /></Button>
      <div className="cos-auth-trust"><Icon name="shield" size={16} /><span>Your workspace is private. We never share your credentials.</span></div>
    </form></div><div className="cos-auth-bottom"><span>{mode === 'register' ? 'Already have an account?' : 'New to CreatorOS?'} <button type="button" onClick={() => setAuthMode(mode === 'login' ? 'register' : 'login')}>{mode === 'register' ? 'Log in' : 'Create account'}</button></span><span>NEED A HAND? <button type="button" onClick={() => setMessage('Contact support from your workspace after signing in.')}>Contact support</button></span></div></main>
  </div>;
}
