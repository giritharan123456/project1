/* oxlint-disable react/only-export-components */
import { lazy, Suspense } from 'react';
import { createBrowserRouter, Navigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import AppLayout from '../components/layouts/AppLayout';
import PublicLayout from '../layouts/PublicLayout';
import AuthLayout from '../layouts/AuthLayout';
import LoadingScreen from '../pages/app/LoadingScreen';
import ErrorBoundary from '../components/ErrorBoundary';
import ProtectedRoute from '../components/auth/ProtectedRoute';
import { RoutePermissionGuard } from '../components/auth/RoleGuard';

const LazyLoad = (Component) => (props) => (
  <Suspense fallback={<LoadingScreen />}>
    <Component {...props} />
  </Suspense>
);

// Public pages
const LandingPage = LazyLoad(lazy(() => import('../pages/public/LandingPage')));
const AboutPage = LazyLoad(lazy(() => import('../pages/public/AboutPage')));
const ContactPage = LazyLoad(lazy(() => import('../pages/public/ContactPage')));
const BlogPage = LazyLoad(lazy(() => import('../pages/public/BlogPage')));
const CareersPage = LazyLoad(lazy(() => import('../pages/public/CareersPage')));
const PricingPage = LazyLoad(lazy(() => import('../pages/public/PricingPage')));

// Auth pages
const LoginPage = LazyLoad(lazy(() => import('../pages/auth/LoginPage')));
const SignupPage = LazyLoad(lazy(() => import('../pages/auth/SignupPage')));
const ForgotPasswordPage = LazyLoad(lazy(() => import('../pages/auth/ForgotPasswordPage')));
const OTPVerificationPage = LazyLoad(lazy(() => import('../pages/auth/OTPVerificationPage')));
const ResetPasswordPage = LazyLoad(lazy(() => import('../pages/auth/ResetPasswordPage')));
const WorkspaceSelectionPage = LazyLoad(lazy(() => import('../pages/auth/WorkspaceSelectionPage')));
const FirstLoginSetupPage = LazyLoad(lazy(() => import('../pages/auth/FirstLoginSetupPage')));
const RoleSelectionPage = LazyLoad(lazy(() => import('../pages/auth/RoleSelectionPage')));
const EmployeeLoginPage = LazyLoad(lazy(() => import('../pages/auth/EmployeeLoginPage')));
const HostLoginPage = LazyLoad(lazy(() => import('../pages/auth/HostLoginPage')));
const AdminLoginPage = LazyLoad(lazy(() => import('../pages/auth/AdminLoginPage')));
const HRLoginPage = LazyLoad(lazy(() => import('../pages/auth/HRLoginPage')));
const ManagerLoginPage = LazyLoad(lazy(() => import('../pages/auth/ManagerLoginPage')));
const ExecutiveLoginPage = LazyLoad(lazy(() => import('../pages/auth/ExecutiveLoginPage')));
const CEOLoginPage = LazyLoad(lazy(() => import('../pages/auth/CEOLoginPage')));
const TwoFactorAuthPage = LazyLoad(lazy(() => import('../pages/auth/TwoFactorAuthPage')));
const VerificationSuccessPage = LazyLoad(lazy(() => import('../pages/auth/VerificationSuccessPage')));
const VerificationFailedPage = LazyLoad(lazy(() => import('../pages/auth/VerificationFailedPage')));
const SessionExpiredPage = LazyLoad(lazy(() => import('../pages/auth/SessionExpiredPage')));
const GuestAccessPage = LazyLoad(lazy(() => import('../components/auth/GuestAccess')));
const RolePageRouter = LazyLoad(lazy(() => import('../pages/auth/role/RolePageRouter')));

// App pages
const HomePage = LazyLoad(lazy(() => import('../pages/app/HomePage')));
const NotFoundPage = LazyLoad(lazy(() => import('../pages/app/NotFoundPage')));
const UnauthorizedPage = LazyLoad(lazy(() => import('../pages/app/UnauthorizedPage')));
const WelcomeScreen = LazyLoad(lazy(() => import('../pages/app/WelcomeScreen')));
const SearchPage = LazyLoad(lazy(() => import('../pages/app/SearchPage')));

// Employee pages
const EmployeeHomePage = LazyLoad(lazy(() => import('../pages/employee/EmployeeHomePage')));
const EmployeeCollaborationPage = LazyLoad(lazy(() => import('../pages/employee/EmployeeCollaborationPage')));

// Task pages
const TasksPage = LazyLoad(lazy(() => import('../pages/tasks/TasksPage')));
const Whiteboard = LazyLoad(lazy(() => import('../pages/whiteboard/Whiteboard')));
const MeetingNotes = LazyLoad(lazy(() => import('../pages/meetingnotes/MeetingNotes')));
const AttendancePage = LazyLoad(lazy(() => import('../pages/attendance/AttendancePage')));
const CommunicationAnalytics = LazyLoad(lazy(() => import('../pages/communications/CommunicationAnalytics')));
const ApprovalsPage = LazyLoad(lazy(() => import('../pages/approvals/ApprovalsPage')));
const TeamCalendarPage = LazyLoad(lazy(() => import('../pages/teamcalendar/TeamCalendar')));

// Admin pages
const PermissionsPage = LazyLoad(lazy(() => import('../pages/admin/PermissionsPage')));
const DepartmentManagement = LazyLoad(lazy(() => import('../pages/admin/DepartmentManagement')));

// Profile pages
const ProfilePage = LazyLoad(lazy(() => import('../pages/profile/ProfilePage')));
const DeviceTestPage = LazyLoad(lazy(() => import('../pages/meeting/DeviceTestPage')));
const OnboardingWizard = LazyLoad(lazy(() => import('../pages/onboarding/OnboardingWizard')));
const OnboardingPage = OnboardingWizard;
const MeetingHistoryPage = LazyLoad(lazy(() => import('../pages/meeting/MeetingHistory')));
const EmployeePerformancePage = LazyLoad(lazy(() => import('../pages/admin/EmployeePerformance')));

// Manager/HR/Employee pages
const ManagerProductivity = LazyLoad(lazy(() => import('../pages/manager/ManagerProductivity')));
const EmployeePersonalAnalytics = LazyLoad(lazy(() => import('../pages/employee/EmployeePersonalAnalytics')));
const HRMeetingParticipation = LazyLoad(lazy(() => import('../pages/hr/HRMeetingParticipation')));

// HR hub pages
const HREmployeeDirectory = LazyLoad(lazy(() => import('../pages/hr/HREmployeeDirectory')));
const HRAttendance = LazyLoad(lazy(() => import('../pages/hr/HRAttendance')));
const HRRecruitment = LazyLoad(lazy(() => import('../pages/hr/HRRecruitment')));
const HRTeamManagement = LazyLoad(lazy(() => import('../pages/hr/HRTeamManagement')));
const HRCommunication = LazyLoad(lazy(() => import('../pages/hr/HRCommunication')));
const HRPerformance = LazyLoad(lazy(() => import('../pages/hr/HRPerformance')));
const HRAnalytics = LazyLoad(lazy(() => import('../pages/hr/HRAnalytics')));
const HRAIAssistant = LazyLoad(lazy(() => import('../pages/hr/HRAIAssistant')));
const HRReports = LazyLoad(lazy(() => import('../pages/hr/HRReports')));
const HRActivityLogs = LazyLoad(lazy(() => import('../pages/hr/HRActivityLogs')));

// Admin pages
const HostAnalytics = LazyLoad(lazy(() => import('../pages/host/HostAnalytics')));
const AccessLogs = LazyLoad(lazy(() => import('../pages/admin/AccessLogs')));
const RegistrationApproval = LazyLoad(lazy(() => import('../pages/admin/RegistrationApproval')));
const ActivityMonitor = LazyLoad(lazy(() => import('../pages/admin/ActivityMonitor')));
const AdminMeetingManagement = LazyLoad(lazy(() => import('../pages/admin/AdminMeetingManagement')));
const UserManagement = LazyLoad(lazy(() => import('../pages/admin/UserManagement')));
const PlatformSettings = LazyLoad(lazy(() => import('../pages/admin/PlatformSettings')));

// Meeting pages
const MeetingsDashboard = LazyLoad(lazy(() => import('../pages/meeting/MeetingsDashboard')));
const MeetingLobby = LazyLoad(lazy(() => import('../pages/meeting/MeetingLobby')));
const MeetingRoom = LazyLoad(lazy(() => import('../pages/meeting/MeetingRoom')));
const MeetingDetails = LazyLoad(lazy(() => import('../pages/meeting/MeetingDetails')));
const ScheduleMeeting = LazyLoad(lazy(() => import('../pages/meeting/ScheduleMeeting')));
const JoinMeeting = LazyLoad(lazy(() => import('../pages/meeting/JoinMeeting')));
const AIMeetingIntelligence = LazyLoad(lazy(() => import('../pages/meeting/AIMeetingIntelligence')));
const AIAssistant = LazyLoad(lazy(() => import('../pages/ai/AIAssistant')));

const AnnouncementsPage = LazyLoad(lazy(() => import('../pages/announcements/AnnouncementsPage')));
const ParticipantsPage = LazyLoad(lazy(() => import('../pages/participants/ParticipantsPage')));
const CollaborationPage = LazyLoad(lazy(() => import('../pages/collaboration/CollaborationPage')));
const PollsPage = LazyLoad(lazy(() => import('../pages/polls/PollsPage')));
const HelpCenterPage = LazyLoad(lazy(() => import('../pages/help/HelpCenterPage')));
const CalendarPage = LazyLoad(lazy(() => import('../pages/calendar/CalendarPage')));
const TeamDirectoryPage = LazyLoad(lazy(() => import('../pages/team/TeamDirectoryPage')));
const ChatPage = LazyLoad(lazy(() => import('../pages/chat/ChatPage')));
const FilesPage = LazyLoad(lazy(() => import('../pages/files/FilesPage')));
const RecordingsPage = LazyLoad(lazy(() => import('../pages/recordings/RecordingsPage')));
const NotificationsPage = LazyLoad(lazy(() => import('../pages/notifications/NotificationsPage')));
const AnalyticsPage = LazyLoad(lazy(() => import('../pages/analytics/AnalyticsPage')));
const ReportsPage = LazyLoad(lazy(() => import('../pages/reports/ReportsPage')));
const SecurityPage = LazyLoad(lazy(() => import('../pages/security/SecurityPage')));
const AuditLogPage = LazyLoad(lazy(() => import('../pages/audit/AuditLogPage')));
const SettingsPage = LazyLoad(lazy(() => import('../pages/settings/SettingsPage')));
const CalendarSettings = LazyLoad(lazy(() => import('../pages/settings/CalendarSettings')));
const ChatSettings = LazyLoad(lazy(() => import('../pages/settings/ChatSettings')));

// Dashboards
const EmployeeDashboard = LazyLoad(lazy(() => import('../pages/dashboards/EmployeeDashboard')));
const HostDashboard = LazyLoad(lazy(() => import('../pages/dashboards/HostDashboard')));
const AdminDashboard = LazyLoad(lazy(() => import('../pages/dashboards/AdminDashboard')));
const HRDashboard = LazyLoad(lazy(() => import('../pages/dashboards/HRDashboard')));
const ManagerDashboard = LazyLoad(lazy(() => import('../pages/dashboards/ManagerDashboard')));
const ExecutiveDashboard = LazyLoad(lazy(() => import('../pages/dashboards/ExecutiveDashboard')));
const CEODashboard = LazyLoad(lazy(() => import('../pages/dashboards/CEODashboard')));

const RoleAwareHome = () => {
  const { user } = useAuth();
  return user?.role === 'employee' ? <EmployeeHomePage /> : <HomePage />;
};

const RoleAwareCollaboration = () => {
  const { user } = useAuth();
  return user?.role === 'employee' ? <EmployeeCollaborationPage /> : <CollaborationPage />;
};

const router = createBrowserRouter([
  {
    path: '/',
    element: <ErrorBoundary><PublicLayout /></ErrorBoundary>,
    children: [
      { index: true, element: <LandingPage /> },
      { path: 'about', element: <AboutPage /> },
      { path: 'contact', element: <ContactPage /> },
      { path: 'blog', element: <BlogPage /> },
      { path: 'careers', element: <CareersPage /> },
      { path: 'pricing', element: <PricingPage /> },
    ],
  },
  {
    path: '/role-select',
    element: <ErrorBoundary><RoleSelectionPage /></ErrorBoundary>,
  },
  {
    path: '/auth',
    element: <ErrorBoundary><AuthLayout /></ErrorBoundary>,
    children: [
      { path: 'login', element: <LoginPage /> },
      { path: 'login/employee', element: <EmployeeLoginPage /> },
      { path: 'login/host', element: <HostLoginPage /> },
      { path: 'login/admin', element: <AdminLoginPage /> },
      { path: 'login/hr', element: <HRLoginPage /> },
      { path: 'login/manager', element: <ManagerLoginPage /> },
      { path: 'login/executive', element: <ExecutiveLoginPage /> },
      { path: 'login/ceo', element: <CEOLoginPage /> },
      { path: 'signup', element: <SignupPage /> },
      { path: 'forgot-password', element: <ForgotPasswordPage /> },
      { path: 'otp-verification', element: <OTPVerificationPage /> },
      { path: 'reset-password', element: <ResetPasswordPage /> },
      { path: 'workspace', element: <WorkspaceSelectionPage /> },
      { path: 'setup', element: <FirstLoginSetupPage /> },
      { path: 'onboarding', element: <OnboardingPage /> },
      { path: '2fa', element: <TwoFactorAuthPage /> },
      { path: 'verify/success', element: <VerificationSuccessPage /> },
      { path: 'verify/failed', element: <VerificationFailedPage /> },
      { path: 'session-expired', element: <SessionExpiredPage /> },
      { path: 'guest', element: <GuestAccessPage /> },
      { path: ':role/login', element: <RolePageRouter page="login" /> },
      { path: ':role/signup', element: <RolePageRouter page="signup" /> },
      { path: ':role/forgot-password', element: <RolePageRouter page="forgot-password" /> },
      { path: ':role/reset-password', element: <RolePageRouter page="reset-password" /> },
      { path: ':role/otp', element: <RolePageRouter page="otp" /> },
      { path: ':role/2fa', element: <RolePageRouter page="twofactor" /> },
      { path: ':role/verify/success', element: <RolePageRouter page="verify-success" /> },
      { path: ':role/verify/failed', element: <RolePageRouter page="verify-failed" /> },
    ],
  },
  {
    path: '/welcome',
    element: <ErrorBoundary><ProtectedRoute><WelcomeScreen /></ProtectedRoute></ErrorBoundary>,
  },
  {
    path: '/app',
    element: <ErrorBoundary><ProtectedRoute><AppLayout /></ProtectedRoute></ErrorBoundary>,
    children: [
      { element: <RoutePermissionGuard />, children: [
      { index: true, element: <Navigate to="/app/home" replace /> },
      { path: 'home', element: <RoleAwareHome /> },
      { path: 'search', element: <SearchPage /> },
      { path: 'meetings', element: <MeetingsDashboard /> },
      { path: 'meeting/lobby/:id', element: <MeetingLobby /> },
      { path: 'meeting/room/:id', element: <MeetingRoom /> },
      { path: 'meeting/:id', element: <MeetingDetails /> },
      { path: 'meeting/:id/intelligence', element: <AIMeetingIntelligence /> },
      { path: 'schedule', element: <ScheduleMeeting /> },
      { path: 'join', element: <JoinMeeting /> },
      { path: 'calendar', element: <CalendarPage /> },
      { path: 'team', element: <TeamDirectoryPage /> },
      { path: 'participants', element: <ParticipantsPage /> },
      { path: 'collaboration', element: <RoleAwareCollaboration /> },
      { path: 'polls', element: <PollsPage /> },
      { path: 'help', element: <HelpCenterPage /> },
      { path: 'chat', element: <ChatPage /> },
      { path: 'files', element: <FilesPage /> },
      { path: 'recordings', element: <RecordingsPage /> },
      { path: 'notifications', element: <NotificationsPage /> },
      { path: 'analytics', element: <AnalyticsPage /> },
      { path: 'announcements', element: <AnnouncementsPage /> },
      { path: 'reports', element: <ReportsPage /> },
      { path: 'security', element: <SecurityPage /> },
      { path: 'audit-log', element: <AuditLogPage /> },
      { path: 'settings', element: <SettingsPage /> },
       { path: 'settings/calendar', element: <CalendarSettings /> },
       { path: 'settings/chat', element: <ChatSettings /> },
       { path: 'tasks', element: <TasksPage /> },
       { path: 'whiteboard', element: <Whiteboard /> },
       { path: 'meeting-notes', element: <MeetingNotes /> },
       { path: 'attendance', element: <AttendancePage /> },
       { path: 'communications/analytics', element: <CommunicationAnalytics /> },
       { path: 'approvals', element: <ApprovalsPage /> },
        { path: 'hr/participation', element: <HRMeetingParticipation /> },
        { path: 'hr/employees', element: <HREmployeeDirectory /> },
        { path: 'hr/attendance', element: <HRAttendance /> },
        { path: 'hr/recruitment', element: <HRRecruitment /> },
        { path: 'hr/team', element: <HRTeamManagement /> },
        { path: 'hr/communication', element: <HRCommunication /> },
        { path: 'hr/performance', element: <HRPerformance /> },
        { path: 'hr/analytics', element: <HRAnalytics /> },
        { path: 'hr/ai', element: <HRAIAssistant /> },
        { path: 'hr/reports', element: <HRReports /> },
        { path: 'hr/activity', element: <HRActivityLogs /> },
        { path: 'productivity', element: <ManagerProductivity /> },
         { path: 'analytics/personal', element: <EmployeePersonalAnalytics /> },
         { path: 'calendar/team', element: <TeamCalendarPage /> },
         { path: 'profile', element: <ProfilePage /> },
      { path: 'ai', element: <AIAssistant /> },
        { path: 'meeting-history', element: <MeetingHistoryPage /> },
        { path: 'device-test', element: <DeviceTestPage /> },
        { path: 'onboarding', element: <OnboardingWizard /> },
        { path: 'host-analytics', element: <HostAnalytics /> },
        {
          path: 'admin',
          element: <RoutePermissionGuard />,
          children: [
            { index: true, element: <Navigate to="permissions" replace /> },
            { path: 'permissions', element: <PermissionsPage /> },
            { path: 'departments', element: <DepartmentManagement /> },
            { path: 'performance', element: <EmployeePerformancePage /> },
            { path: 'logs', element: <AccessLogs /> },
            { path: 'approvals', element: <RegistrationApproval /> },
            { path: 'users', element: <UserManagement /> },
            { path: 'activity', element: <ActivityMonitor /> },
            { path: 'meetings', element: <AdminMeetingManagement /> },
            { path: 'settings', element: <PlatformSettings /> },
          ],
        },
      {
        path: 'dashboard',
        children: [
          { path: 'employee', element: <EmployeeDashboard /> },
          { path: 'host', element: <HostDashboard /> },
          { path: 'admin', element: <AdminDashboard /> },
          { path: 'hr', element: <HRDashboard /> },
          { path: 'manager', element: <ManagerDashboard /> },
          { path: 'executive', element: <ExecutiveDashboard /> },
          { path: 'ceo', element: <CEODashboard /> },
        ]},
      ]},
    ],
  },
  {
    path: '/unauthorized',
    element: <ErrorBoundary><UnauthorizedPage /></ErrorBoundary>,
  },
  {
    path: '*',
    element: <ErrorBoundary><NotFoundPage /></ErrorBoundary>,
  },
]);

export default router;
