import { Navigate, useLocation } from 'react-router-dom';
import PropTypes from 'prop-types';

function ProtectedRoute({ children, requireVerified = true }) {
  const location = useLocation();
  const isAuth = localStorage.getItem('connectly-auth');
  const isGuest = !!localStorage.getItem('guest_user');
  if (isGuest && location.pathname.startsWith('/app/meeting/room')) return children;
  if (!isAuth) return <Navigate to="/auth/login" replace />;
  if (requireVerified) {
    try {
      const parsed = JSON.parse(isAuth);
      if (!parsed.verified) {
        return <Navigate to="/auth/otp-verification" replace />;
      }
    } catch {
      return <Navigate to="/auth/login" replace />;
    }
  }
  return children;
}

ProtectedRoute.propTypes = {
  children: PropTypes.node.isRequired,
  requireVerified: PropTypes.bool,
};

ProtectedRoute.displayName = 'ProtectedRoute';

export default ProtectedRoute;
