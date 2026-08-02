import { Navigate, useLocation, Outlet } from 'react-router-dom';
import PropTypes from 'prop-types';

const ROLE_GUARD_MAP = {
  employee: ['employee', 'admin'],
  host: ['host', 'admin'],
  admin: ['admin'],
  hr: ['hr', 'admin'],
  manager: ['manager', 'admin'],
  executive: ['executive', 'admin', 'ceo'],
  ceo: ['ceo', 'admin', 'executive'],
};

const PATH_ROLE_REQUIREMENTS = {
  '/app/admin': ['admin'],
  '/app/dashboard/admin': ['admin'],
  '/app/dashboard/ceo': ['ceo', 'admin', 'executive'],
  '/app/dashboard/executive': ['executive', 'admin', 'ceo'],
  '/app/dashboard/manager': ['manager', 'admin'],
  '/app/dashboard/hr': ['hr', 'admin'],
  '/app/dashboard/host': ['host', 'admin'],
  '/app/dashboard/employee': ['employee', 'admin'],
  '/app/hr': ['hr', 'admin'],
  '/app/hr/participation': ['hr', 'admin'],
  '/app/productivity': ['manager', 'admin'],
  '/app/analytics/personal': ['employee', 'admin'],
  '/app/host-analytics': ['host', 'admin'],
  '/app/host': ['host', 'admin'],
  '/app/analytics': ['manager', 'admin', 'executive', 'ceo', 'hr', 'host'],
  '/app/reports': ['manager', 'admin', 'executive', 'ceo', 'hr', 'host'],
  '/app/attendance': ['hr', 'admin', 'manager'],
  '/app/communications/analytics': ['hr', 'admin', 'executive', 'ceo', 'manager'],
  '/app/approvals': ['manager', 'admin', 'executive', 'ceo'],
  '/app/calendar/team': ['manager', 'admin', 'employee', 'host'],
  '/app/security': ['admin', 'executive', 'ceo'],
  '/app/audit-log': ['admin', 'executive', 'ceo'],
};

function RoleGuard({ role, children }) {
  let user = null;
  try {
    const stored = localStorage.getItem('connectly-auth');
    if (stored) user = JSON.parse(stored).user;
  } catch {}
  if (!user) return <Navigate to="/auth/login" replace />;
  const allowed = ROLE_GUARD_MAP[role] || [role];
  if (!allowed.includes(user.role)) return <Navigate to="/unauthorized" replace />;
  if (children) return children;
  return <Outlet />;
}

function RoutePermissionGuard() {
  const location = useLocation();
  let user = null;
  try {
    const stored = localStorage.getItem('connectly-auth');
    if (stored) user = JSON.parse(stored).user;
  } catch {}
  if (!user) return <Navigate to="/auth/login" replace />;
  const path = location.pathname;
  // Longest (most specific) route first; match only on exact path or segment boundary,
  // and stop at the first match so a parent route (e.g. /app/analytics) cannot
  // overrule a more specific allowed child (e.g. /app/analytics/personal).
  const requirements = Object.entries(PATH_ROLE_REQUIREMENTS).sort((a, b) => b[0].length - a[0].length);
  for (const [routePath, allowedRoles] of requirements) {
    const matches = path === routePath || path.startsWith(`${routePath}/`);
    if (matches) {
      if (!allowedRoles.includes(user.role)) {
        return <Navigate to="/unauthorized" replace />;
      }
      break;
    }
  }
  return <Outlet />;
}

RoleGuard.propTypes = {
  role: PropTypes.string.isRequired,
  children: PropTypes.node,
};

RoleGuard.displayName = 'RoleGuard';

export { RoleGuard, RoutePermissionGuard, PATH_ROLE_REQUIREMENTS };
export default RoleGuard;
