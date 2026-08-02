export const isActiveEmployee = (u) => u && u.status !== 'offline';

export const isNewEmployee = (u, today = '2026-08-01') => {
  if (!u || !u.joined) return false;
  const days = (new Date(`${today}T12:00:00`) - new Date(`${u.joined}T12:00:00`)) / 86400000;
  return days >= 0 && days <= 90;
};

export const groupBy = (arr, keyFn) =>
  arr.reduce((acc, item) => {
    const key = keyFn(item);
    (acc[key] = acc[key] || []).push(item);
    return acc;
  }, {});

export const sum = (arr) => arr.reduce((a, b) => a + b, 0);

export const avg = (arr) => (arr.length ? sum(arr) / arr.length : 0);

export const pct = (part, whole) => (whole > 0 ? Math.round((part / whole) * 100) : 0);

export const fmtDate = (d) => {
  if (!d) return '—';
  try {
    const date = new Date(typeof d === 'string' && d.length === 10 ? `${d}T12:00:00` : d);
    return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
  } catch {
    return String(d);
  }
};

export const DEPT_COLORS = ['bg-blue-500', 'bg-violet-500', 'bg-emerald-500', 'bg-amber-500', 'bg-rose-500', 'bg-teal-500', 'bg-indigo-500', 'bg-cyan-500'];

export const deptColor = (i) => DEPT_COLORS[i % DEPT_COLORS.length];

export const ROLE_BADGE = {
  ceo: { label: 'CEO', variant: 'danger' },
  admin: { label: 'Admin', variant: 'primary' },
  hr: { label: 'HR', variant: 'info' },
  manager: { label: 'Manager', variant: 'warning' },
  executive: { label: 'Executive', variant: 'gradient' },
  host: { label: 'Host', variant: 'success' },
  employee: { label: 'Employee', variant: 'default' },
};
