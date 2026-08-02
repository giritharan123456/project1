import { lazy, Suspense } from 'react';
import { useParams } from 'react-router-dom';
import RoleAuthWrapper from './RoleAuthWrapper';
import LoadingScreen from '../../app/LoadingScreen';

const RoleLoginContent = lazy(() => import('./RoleLoginContent'));
const RoleSignupContent = lazy(() => import('./RoleSignupContent'));
const RoleForgotPasswordContent = lazy(() => import('./RoleForgotPasswordContent'));
const RoleResetPasswordContent = lazy(() => import('./RoleResetPasswordContent'));
const RoleOTPContent = lazy(() => import('./RoleOTPContent'));
const RoleTwoFactorContent = lazy(() => import('./RoleTwoFactorContent'));
const RoleVerificationSuccessContent = lazy(() => import('./RoleVerificationSuccessContent'));
const RoleVerificationFailedContent = lazy(() => import('./RoleVerificationFailedContent'));

const CONTENT_MAP = {
  login: RoleLoginContent,
  signup: RoleSignupContent,
  'forgot-password': RoleForgotPasswordContent,
  'reset-password': RoleResetPasswordContent,
  otp: RoleOTPContent,
  twofactor: RoleTwoFactorContent,
  'verify-success': RoleVerificationSuccessContent,
  'verify-failed': RoleVerificationFailedContent,
};

const CONFIG_MAP = {
  login: { title: 'Welcome back', subtitle: 'Sign in to your account to continue' },
  signup: { title: 'Create your account', subtitle: 'Join your team on Connectly' },
  'forgot-password': { title: 'Forgot password?', subtitle: "Enter your email and we'll send you a reset link" },
  'reset-password': { title: 'Reset your password', subtitle: 'Choose a strong password for your account' },
  otp: { title: 'Verify your identity', subtitle: 'Enter the verification code sent to your email' },
  twofactor: {},
  'verify-success': {},
  'verify-failed': {},
};

export default function RolePageRouter({ page }) {
  const { role } = useParams();
  const Content = CONTENT_MAP[page];
  const config = CONFIG_MAP[page];
  if (!Content || !config) return null;

  return (
    <Suspense fallback={<LoadingScreen />}>
      <RoleAuthWrapper role={role} title={config.title} subtitle={config.subtitle}>
        <Content role={role} />
      </RoleAuthWrapper>
    </Suspense>
  );
}
