import type { ButtonHTMLAttributes, InputHTMLAttributes, ReactNode, SelectHTMLAttributes } from 'react';
import { Icon, type IconName } from './Icon';

export type ButtonVariant = 'primary' | 'secondary' | 'ghost' | 'danger' | 'lime';
export function Button({
  children, variant = 'primary', size = 'md', icon, iconRight, className = '', type = 'button', ...props
}: ButtonHTMLAttributes<HTMLButtonElement> & {
  variant?: ButtonVariant;
  size?: 'sm' | 'md' | 'lg' | 'icon';
  icon?: IconName;
  iconRight?: IconName;
}) {
  return (
    <button type={type} className={`cos-btn cos-btn--${variant} cos-btn--${size} ${className}`} {...props}>
      {icon && <Icon name={icon} size={17} />}{children}{iconRight && <Icon name={iconRight} size={16} />}
    </button>
  );
}

export function Badge({ children, tone = 'neutral', dot = false, className = '' }: {
  children: ReactNode; tone?: 'neutral' | 'success' | 'warning' | 'danger' | 'info' | 'lime'; dot?: boolean; className?: string;
}) {
  return <span className={`cos-badge cos-badge--${tone} ${className}`}>{dot && <span className="cos-badge__dot" />}{children}</span>;
}

export function Avatar({ name, initials, color = 'blue', size = 'md', image }: {
  name: string; initials?: string; color?: 'blue' | 'violet' | 'mint' | 'amber' | 'rose' | 'dark'; size?: 'sm' | 'md' | 'lg' | 'xl'; image?: string;
}) {
  const letters = initials || name.trim().split(/\s+/).slice(0, 2).map((part) => part[0]).join('').toUpperCase();
  return <span className={`cos-avatar cos-avatar--${color} cos-avatar--${size}`} aria-label={name} title={name}>{image ? <img src={image} alt="" /> : letters}</span>;
}

export function AvatarStack({ people, limit = 4 }: { people: Array<{ name: string; color?: 'blue' | 'violet' | 'mint' | 'amber' | 'rose' | 'dark' }>; limit?: number }) {
  const visible = people.slice(0, limit);
  return <div className="cos-avatar-stack">{visible.map((p) => <Avatar key={p.name} name={p.name} color={p.color || 'blue'} size="sm" />)}{people.length > limit && <span className="cos-avatar cos-avatar--more">+{people.length - limit}</span>}</div>;
}

export function Card({ children, className = '', padding = 'md' }: { children: ReactNode; className?: string; padding?: 'none' | 'sm' | 'md' | 'lg' }) {
  return <section className={`cos-card cos-card--${padding} ${className}`}>{children}</section>;
}

export function PageHeading({ eyebrow, title, description, action, meta }: {
  eyebrow?: string; title: string; description?: string; action?: ReactNode; meta?: ReactNode;
}) {
  return <div className="cos-page-heading"><div className="cos-page-heading__copy">{eyebrow && <div className="cos-eyebrow">{eyebrow}</div>}<h1>{title}</h1>{description && <p>{description}</p>}{meta && <div className="cos-page-heading__meta">{meta}</div>}</div>{action && <div className="cos-page-heading__action">{action}</div>}</div>;
}

export function SectionHeading({ title, description, action }: { title: string; description?: string; action?: ReactNode }) {
  return <div className="cos-section-heading"><div><h2>{title}</h2>{description && <p>{description}</p>}</div>{action && <div>{action}</div>}</div>;
}

export function Field({ label, hint, error, htmlFor, children, required = false }: {
  label: string; hint?: string; error?: string; htmlFor?: string; children: ReactNode; required?: boolean;
}) {
  return <div className={`cos-field ${error ? 'is-error' : ''}`}><label htmlFor={htmlFor}>{label}{required && <span className="cos-required"> *</span>}</label>{children}{error ? <span className="cos-field__error">{error}</span> : hint && <span className="cos-field__hint">{hint}</span>}</div>;
}

export function Input({ leadingIcon, trailing, className = '', ...props }: InputHTMLAttributes<HTMLInputElement> & { leadingIcon?: IconName; trailing?: ReactNode }) {
  return <div className={`cos-input-wrap ${className}`}>{leadingIcon && <Icon name={leadingIcon} size={17} className="cos-input-wrap__leading" />}<input className="cos-input" {...props} />{trailing && <span className="cos-input-wrap__trailing">{trailing}</span>}</div>;
}

export function Select({ className = '', children, ...props }: SelectHTMLAttributes<HTMLSelectElement>) {
  return <div className={`cos-select-wrap ${className}`}><select className="cos-select" {...props}>{children}</select><Icon name="chevron-down" size={16} /></div>;
}

export function SearchInput({ value, onChange, placeholder = 'Search anything…', className = '' }: {
  value: string; onChange: (value: string) => void; placeholder?: string; className?: string;
}) {
  return <Input leadingIcon="search" value={value} onChange={(event) => onChange(event.target.value)} placeholder={placeholder} aria-label={placeholder} className={className} />;
}

export function StatCard({ label, value, change, helper, icon, tone = 'blue', series }: {
  label: string; value: string; change?: string; helper?: string; icon: IconName; tone?: 'blue' | 'mint' | 'violet' | 'amber'; series?: number[];
}) {
  const points = (series || [5, 8, 6, 11, 9, 14, 12, 17]).map((n, i, arr) => `${(i / Math.max(arr.length - 1, 1)) * 100},${28 - n}`).join(' ');
  return <Card className={`cos-stat cos-stat--${tone}`} padding="md"><div className="cos-stat__top"><span className={`cos-stat__icon cos-stat__icon--${tone}`}><Icon name={icon} size={19} /></span>{change && <Badge tone={change.startsWith('-') ? 'danger' : 'success'}>{change}</Badge>}</div><div className="cos-stat__value">{value}</div><div className="cos-stat__label">{label}</div>{helper && <div className="cos-stat__helper">{helper}</div>}<svg className="cos-stat__sparkline" viewBox="0 0 100 30" preserveAspectRatio="none" aria-hidden="true"><polyline points={points} fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" /></svg></Card>;
}

export function Progress({ value, max = 100, tone = 'blue', label }: { value: number; max?: number; tone?: 'blue' | 'mint' | 'amber' | 'violet'; label?: string }) {
  const safeValue = Math.min(Math.max(value, 0), max);
  const percent = max > 0 ? (safeValue / max) * 100 : 0;
  return <div className="cos-progress-wrap">{label && <div className="cos-progress__label"><span>{label}</span><strong>{Math.round(percent)}%</strong></div>}<div className="cos-progress" role="progressbar" aria-valuenow={safeValue} aria-valuemin={0} aria-valuemax={max}><span className={`cos-progress__fill cos-progress__fill--${tone}`} style={{ width: `${percent}%` }} /></div></div>;
}

export function EmptyState({ icon = 'layers', title, description, action }: { icon?: IconName; title: string; description: string; action?: ReactNode }) {
  return <div className="cos-empty"><span className="cos-empty__icon"><Icon name={icon} size={24} /></span><h3>{title}</h3><p>{description}</p>{action && <div>{action}</div>}</div>;
}

export function Divider() { return <div className="cos-divider" />; }

export function TinyLabel({ children }: { children: ReactNode }) { return <span className="cos-tiny-label">{children}</span>; }

export function TrendLine({ values, color = 'currentColor' }: { values: number[]; color?: string }) {
  const low = Math.min(...values); const high = Math.max(...values); const range = high - low || 1;
  const points = values.map((v, i) => `${(i / Math.max(1, values.length - 1)) * 100},${28 - ((v - low) / range) * 24}`).join(' ');
  return <svg className="cos-trend-line" viewBox="0 0 100 30" preserveAspectRatio="none" aria-hidden="true"><polyline points={points} fill="none" stroke={color} strokeWidth="2.25" strokeLinecap="round" strokeLinejoin="round" /></svg>;
}
