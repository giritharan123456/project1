/* oxlint-disable react/only-export-components */
import { createContext, useContext, useState, useCallback, useMemo, useEffect, useRef } from 'react';
import notificationsData from '../data/notifications.json';
import meetingsData from '../data/meetings.json';
import messagesData from '../data/messages.json';
import usersData from '../data/users.json';
import { SAMPLE_RECORDING_URL } from '../utils/recordings';

const AppContext = createContext();

// Auth flow steps for state machine
export const AUTH_STEPS = {
  REGISTER: 'register',
  VERIFY_EMAIL: 'verify-email',
  OTP: 'otp',
  TWO_FA: '2fa',
  WORKSPACE: 'workspace',
  ONBOARDING: 'onboarding',
  DASHBOARD: 'dashboard',
};

export const SEED_DATA_VERSION = '1.0.3';
export const ATTENDANCE_SEED_VERSION = '2.0.1';
export const RECORDINGS_SEED_VERSION = '2.0.2';
export const TASKS_SEED_VERSION = '2.0.1';
export const NOTIF_SEED_VERSION = '2.0.1';

const seedTasks = [
  { id: 't-seed-1', title: 'Complete Q3 report', assignee: 'You', assignedTo: 'You', status: 'in-progress', priority: 'high', dueDate: 'Today', tags: ['report', 'Q3'], completed: false, createdAt: '2026-07-28T09:00:00.000Z' },
  { id: 't-seed-2', title: 'Review design mockups', assignee: 'You', assignedTo: 'You', status: 'todo', priority: 'medium', dueDate: 'Tomorrow', tags: ['design'], completed: false, createdAt: '2026-07-28T10:00:00.000Z' },
  { id: 't-seed-3', title: 'Update project docs', assignee: 'You', assignedTo: 'You', status: 'done', priority: 'low', dueDate: 'Jul 29', tags: ['docs'], completed: true, createdAt: '2026-07-20T08:00:00.000Z' },
  { id: 't-seed-4', title: 'Prepare meeting agenda', assignee: 'You', assignedTo: 'You', status: 'todo', priority: 'high', dueDate: 'Today', tags: ['meeting'], completed: false, createdAt: '2026-07-29T08:00:00.000Z' },
  { id: 't-seed-5', title: 'Code review for PR #42', assignee: 'You', assignedTo: 'You', status: 'in-progress', priority: 'medium', dueDate: 'Jul 31', tags: ['code'], completed: false, createdAt: '2026-07-29T09:00:00.000Z' },
  { id: 't-seed-6', title: 'Send status update email', assignee: 'You', assignedTo: 'You', status: 'done', priority: 'low', dueDate: 'Jul 28', tags: ['email'], completed: true, createdAt: '2026-07-19T08:00:00.000Z' },
];

const seedAttendance = [
  // Week of 2026-07-27 — realistic attendance history for the demo team
  { id: 'a-mon-u7', meetingId: 'm1', userId: 'u7', userName: 'Michael Brown', department: 'Engineering', status: 'present', joinTime: '2026-07-27T09:00:00.000Z', duration: 30 },
  { id: 'a-mon-u6', meetingId: 'm1', userId: 'u6', userName: 'Lisa Thompson', department: 'Engineering', status: 'present', joinTime: '2026-07-27T09:00:00.000Z', duration: 30 },
  { id: 'a-mon-u8', meetingId: 'm1', userId: 'u8', userName: 'Jennifer Lee', department: 'Design', status: 'present', joinTime: '2026-07-27T09:00:00.000Z', duration: 30 },
  { id: 'a-mon-u10', meetingId: 'm1', userId: 'u10', userName: 'Amanda White', department: 'Marketing', status: 'present', joinTime: '2026-07-27T10:00:00.000Z', duration: 30 },
  { id: 'a-tue-u7', meetingId: 'm7', userId: 'u7', userName: 'Michael Brown', department: 'Engineering', status: 'present', joinTime: '2026-07-28T09:30:00.000Z', duration: 60 },
  { id: 'a-tue-u1', meetingId: 'm7', userId: 'u1', userName: 'Alex Morgan', department: 'Executive', status: 'present', joinTime: '2026-07-28T09:30:00.000Z', duration: 60 },
  { id: 'a-tue-u2', meetingId: 'm7', userId: 'u2', userName: 'Sarah Chen', department: 'Engineering', status: 'present', joinTime: '2026-07-28T09:30:00.000Z', duration: 60 },
  { id: 'a-wed-u5', meetingId: 'm5', userId: 'u5', userName: 'David Kim', department: 'Finance', status: 'present', joinTime: '2026-07-29T15:00:00.000Z', duration: 30 },
  { id: 'a-wed-u4', meetingId: 'm5', userId: 'u4', userName: 'Emily Rodriguez', department: 'Marketing', status: 'present', joinTime: '2026-07-29T15:00:00.000Z', duration: 30 },
  { id: 'a-wed-u6', meetingId: 'm6', userId: 'u6', userName: 'Lisa Thompson', department: 'Engineering', status: 'present', joinTime: '2026-07-29T13:00:00.000Z', duration: 60 },
  { id: 'a-wed-u2', meetingId: 'm6', userId: 'u2', userName: 'Sarah Chen', department: 'Engineering', status: 'present', joinTime: '2026-07-29T13:00:00.000Z', duration: 60 },
  { id: 'a-thu-u7', meetingId: 'm1', userId: 'u7', userName: 'Michael Brown', department: 'Engineering', status: 'present', joinTime: '2026-07-30T09:00:00.000Z', duration: 30 },
  { id: 'a-thu-u6', meetingId: 'm1', userId: 'u6', userName: 'Lisa Thompson', department: 'Engineering', status: 'present', joinTime: '2026-07-30T09:00:00.000Z', duration: 30 },
  { id: 'a-thu-u8', meetingId: 'm1', userId: 'u8', userName: 'Jennifer Lee', department: 'Design', status: 'present', joinTime: '2026-07-30T09:00:00.000Z', duration: 30 },
  { id: 'a-thu-u8-b', meetingId: 'm10', userId: 'u8', userName: 'Jennifer Lee', department: 'Design', status: 'present', joinTime: '2026-07-30T11:30:00.000Z', duration: 15 },
  { id: 'a-thu-u10', meetingId: 'm10', userId: 'u10', userName: 'Amanda White', department: 'Marketing', status: 'present', joinTime: '2026-07-30T11:30:00.000Z', duration: 15 },
  { id: 'a-thu-u2', meetingId: 'm2', userId: 'u2', userName: 'Sarah Chen', department: 'Engineering', status: 'present', joinTime: '2026-07-30T14:00:00.000Z', duration: 60 },
  { id: 'a-thu-u5', meetingId: 'm2', userId: 'u5', userName: 'David Kim', department: 'Finance', status: 'present', joinTime: '2026-07-30T14:00:00.000Z', duration: 60 },
  { id: 'a-thu-u8-c', meetingId: 'm2', userId: 'u8', userName: 'Jennifer Lee', department: 'Design', status: 'present', joinTime: '2026-07-30T14:00:00.000Z', duration: 60 },
  { id: 'a-fri-u7', meetingId: 'm3', userId: 'u7', userName: 'Michael Brown', department: 'Engineering', status: 'present', joinTime: '2026-07-31T11:00:00.000Z', duration: 45 },
  { id: 'a-fri-u2', meetingId: 'm3', userId: 'u2', userName: 'Sarah Chen', department: 'Engineering', status: 'present', joinTime: '2026-07-31T11:00:00.000Z', duration: 45 },
  { id: 'a-fri-u4', meetingId: 'm3', userId: 'u4', userName: 'Emily Rodriguez', department: 'Marketing', status: 'present', joinTime: '2026-07-31T11:00:00.000Z', duration: 45 },
  { id: 'a-late-u4', meetingId: 'm5', userId: 'u4', userName: 'Emily Rodriguez', department: 'Marketing', status: 'present', joinTime: '2026-07-29T15:10:00.000Z', duration: 25 },
];

const seedRecordings = [
  { id: 1, title: 'Sales Pipeline Review - Recording', duration: '30min', host: 'Host User', date: 'Jul 29, 2026', views: 24, size: '1.2 GB', description: 'Auto-recorded session of "Sales Pipeline Review"', starred: false, url: SAMPLE_RECORDING_URL, rating: 5, review: 'Great overview of the pipeline. Clear action items and follow-ups.' },
  { id: 2, title: 'Q2 Financial Review - Recording', duration: '60min', host: 'Host User', date: 'Jul 28, 2026', views: 41, size: '2.4 GB', description: 'Auto-recorded session of "Q2 Financial Review"', starred: false, url: SAMPLE_RECORDING_URL, rating: 4, review: 'Solid numbers walkthrough. Could use more time on variance explanations.' },
  { id: 3, title: 'All Hands Company Meeting - Recording', duration: '90min', host: 'Host User', date: 'Jul 30, 2026', views: 156, size: '3.1 GB', description: 'Auto-recorded session of "All Hands Company Meeting"', starred: true, url: SAMPLE_RECORDING_URL, rating: 5, review: 'Great energy and transparent updates across all teams.' },
];

const seedActivityLog = [
  { id: 'act-1', type: 'meeting', action: 'Joined "Weekly Engineering Standup"', user: 'Michael Brown', role: 'employee', timestamp: '2026-07-30T09:02:00.000Z' },
  { id: 'act-2', type: 'message', action: 'Sent a message in Team Chat', user: 'Michael Brown', role: 'employee', timestamp: '2026-07-30T09:15:00.000Z' },
  { id: 'act-3', type: 'task', action: 'Completed "Update project docs"', user: 'Michael Brown', role: 'employee', timestamp: '2026-07-29T16:00:00.000Z' },
  { id: 'act-4', type: 'meeting', action: 'Joined "Design Review: New Dashboard"', user: 'Michael Brown', role: 'employee', timestamp: '2026-07-31T11:05:00.000Z' },
  { id: 'act-5', type: 'notification', action: 'New task assigned: Prepare meeting agenda', user: 'Sarah Chen', role: 'manager', timestamp: '2026-07-29T08:00:00.000Z' },
  { id: 'act-6', type: 'meeting', action: 'Started "Quick Sync: Marketing Campaign"', user: 'Lisa Thompson', role: 'employee', timestamp: '2026-07-30T11:31:00.000Z' },
];

export function AppProvider({ children }) {
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [notifications, setNotifications] = useState(() => {
    try {
      const stored = localStorage.getItem('connectly-notifications');
      const storedVersion = localStorage.getItem('connectly-notifications-version');
      if (stored && storedVersion === NOTIF_SEED_VERSION) return JSON.parse(stored);
      if (stored && storedVersion !== NOTIF_SEED_VERSION) {
        localStorage.removeItem('connectly-notifications');
        localStorage.setItem('connectly-notifications-version', NOTIF_SEED_VERSION);
      }
    } catch {}
    return notificationsData;
  });
  const [meetings, setMeetings] = useState(() => {
    try {
      const stored = localStorage.getItem('connectly-meetings');
      const storedVersion = localStorage.getItem('connectly-seed-version');
      if (stored && storedVersion === SEED_DATA_VERSION) return JSON.parse(stored);
      if (stored) {
        localStorage.removeItem('connectly-meetings');
        localStorage.removeItem('connectly-seed-version');
      }
      return meetingsData;
    } catch {
      return meetingsData;
    }
  });
  const [messages, setMessages] = useState(() => {
    try {
      const stored = localStorage.getItem('connectly-messages');
      if (stored) return JSON.parse(stored);
    } catch {}
    return messagesData;
  });
  const [inMeeting, setInMeeting] = useState(false);
  const [currentMeeting, setCurrentMeeting] = useState(null);
  const [activityLog, setActivityLog] = useState(() => {
    try {
      const stored = localStorage.getItem('connectly-activity-log');
      if (stored) return JSON.parse(stored);
    } catch {}
    return seedActivityLog;
  });
  const [attendanceRecords, setAttendanceRecords] = useState(() => {
    try {
      const stored = localStorage.getItem('connectly-attendance-records');
      const storedVersion = localStorage.getItem('connectly-attendance-version');
      if (stored && storedVersion === ATTENDANCE_SEED_VERSION) return JSON.parse(stored);
      if (stored) {
        localStorage.removeItem('connectly-attendance-records');
        localStorage.setItem('connectly-attendance-version', ATTENDANCE_SEED_VERSION);
      }
    } catch {}
    return seedAttendance;
  });
  const [reports, setReports] = useState([]);
  const [recordings, setRecordings] = useState(() => {
    const validUrl = (url) => (url && !String(url).startsWith('blob:')) ? url : SAMPLE_RECORDING_URL;
    try {
      const stored = localStorage.getItem('connectly-recordings');
      const storedVersion = localStorage.getItem('connectly-recordings-version');
      if (stored && storedVersion === RECORDINGS_SEED_VERSION) {
        const parsed = JSON.parse(stored);
        return parsed.map((r) => ({ ...r, url: validUrl(r.url) }));
      }
    } catch {}
    localStorage.removeItem('connectly-recordings');
    return seedRecordings.map((r) => ({ ...r, url: validUrl(r.url) }));
  });
  const [tasks, setTasks] = useState(() => {
    try {
      const stored = localStorage.getItem('connectly-tasks');
      const storedVersion = localStorage.getItem('connectly-tasks-version');
      if (stored && storedVersion === TASKS_SEED_VERSION) return JSON.parse(stored);
      if (stored) {
        localStorage.removeItem('connectly-tasks');
        localStorage.setItem('connectly-tasks-version', TASKS_SEED_VERSION);
      }
    } catch {}
    return seedTasks;
  });
  const [pendingRegistrations, setPendingRegistrations] = useState(() => {
    try {
      const stored = localStorage.getItem('connectly-pending-registrations');
      if (stored) return JSON.parse(stored);
    } catch {}
    return [];
  });
  const [users, setUsers] = useState(usersData);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const [currentUserId, setCurrentUserId] = useState(() => {
    try {
      const stored = localStorage.getItem('connectly-auth');
      if (stored) {
        const parsed = JSON.parse(stored);
        return parsed.user?.id || parsed.userId || 'u7';
      }
    } catch {}
    return 'u7';
  });

  // Host/participant presence map: userId -> status (online/away/offline)
  const [presence, setPresence] = useState(() => {
    try {
      const stored = localStorage.getItem('connectly-presence');
      if (stored) return JSON.parse(stored);
    } catch {}
    return {};
  });

  // Persist presence to localStorage
  useEffect(() => {
    try {
      localStorage.setItem('connectly-presence', JSON.stringify(presence));
    } catch {}
  }, [presence]);

  // Keep the authenticated user in sync with the app user list so every
  // role/dashboard/chat reflects the logged-in identity (not a default user)
  useEffect(() => {
    const syncAuthUser = () => {
      try {
        const stored = localStorage.getItem('connectly-auth');
        if (!stored) return;
        const parsed = JSON.parse(stored);
        const authUser = parsed.user;
        if (!authUser?.id) return;
        setCurrentUserId(authUser.id);
        setPresence(prev => ({ ...prev, [authUser.id]: prev[authUser.id] || authUser.status || 'online' }));
        setUsers(prev => {
          if (prev.some(u => u.id === authUser.id)) {
            return prev.map(u => u.id === authUser.id ? { ...u, ...authUser, status: u.status || authUser.status || 'online' } : u);
          }
          return [{ ...authUser, status: authUser.status || 'online' }, ...prev];
        });
      } catch {
        // noop
      }
    };
    syncAuthUser();
    window.addEventListener('connectly-auth-changed', syncAuthUser);
    return () => window.removeEventListener('connectly-auth-changed', syncAuthUser);
  }, []);

  // ──────── STALE DATA RESET: clear cached data when seed version changes ────────
  useEffect(() => {
    try {
      const storedVersion = localStorage.getItem('connectly-seed-version');
      if (storedVersion !== null && storedVersion !== SEED_DATA_VERSION) {
        localStorage.removeItem('connectly-meetings');
        localStorage.removeItem('connectly-seed-version');
        localStorage.removeItem('connectly-messages');
        localStorage.removeItem('connectly-recordings');
        localStorage.removeItem('connectly-tasks');
        localStorage.removeItem('connectly-pending-registrations');
        localStorage.removeItem('connectly-presence');
        localStorage.removeItem('connectly-notifications');
        window.location.reload();
      }
    } catch {
      // noop
    }
  }, []);

  // Real-time dashboard metrics — updated by both simulation and real events
  const [dashboardMetrics, setDashboardMetrics] = useState({
    activeUsers: 128,
    meetingsToday: 24,
    messagesSent: 1567,
    tasksCompleted: 89,
    pendingApprovals: 5,
    systemUptime: 99.97,
    responseTime: 245,
    activeSessions: 312,
    newRegistrations: 2,
    reportsGenerated: 45,
    totalEmployees: 10,
    meetingsThisWeek: 42,
    avgAttendance: 94,
    productivity: 88,
    companyGrowth: 127,
    revenueImpact: 2400000,
    teamSatisfaction: 4.8,
    wellnessScore: 86,
    npsScore: 72,
    churnRate: 2.1,
  });

  // Background simulation for live-updating feel
  useEffect(() => {
    setIsLoading(true);
    const loadTimer = setTimeout(() => {
      setIsLoading(false);
    }, 300);

    const interval = setInterval(() => {
      setDashboardMetrics(prev => ({
        ...prev,
        activeUsers: Math.max(0, prev.activeUsers + Math.floor(Math.random() * 5) - 2),
        meetingsToday: prev.meetingsToday + (Math.random() > 0.75 ? 1 : 0),
        messagesSent: prev.messagesSent + Math.floor(Math.random() * 15) + 3,
        tasksCompleted: prev.tasksCompleted + (Math.random() > 0.65 ? 1 : 0),
        systemUptime: 99.9 + Math.random() * 0.09,
        responseTime: Math.max(50, Math.min(500, prev.responseTime + Math.floor(Math.random() * 10) - 5)),
        activeSessions: Math.max(50, prev.activeSessions + Math.floor(Math.random() * 6) - 2),
      }));
    }, 8000);
    return () => { clearTimeout(loadTimer); clearInterval(interval); };
  }, []);

  // Persist meetings to localStorage
  useEffect(() => {
    try {
      localStorage.setItem('connectly-meetings', JSON.stringify(meetings));
      localStorage.setItem('connectly-seed-version', SEED_DATA_VERSION);
    } catch {
      // quota exceeded or unavailable
    }
  }, [meetings]);

  // Persist recordings to localStorage
  useEffect(() => {
    try {
      localStorage.setItem('connectly-recordings', JSON.stringify(recordings));
      localStorage.setItem('connectly-recordings-version', RECORDINGS_SEED_VERSION);
    } catch {
      // quota exceeded or unavailable
    }
  }, [recordings]);

  // Persist tasks to localStorage
  useEffect(() => {
    try {
      localStorage.setItem('connectly-tasks', JSON.stringify(tasks));
    } catch {
      // quota exceeded or unavailable
    }
  }, [tasks]);

  // Persist pending registrations to localStorage
  useEffect(() => {
    try {
      localStorage.setItem('connectly-pending-registrations', JSON.stringify(pendingRegistrations));
    } catch {}
  }, [pendingRegistrations]);

  // Persist chat messages to localStorage
  useEffect(() => {
    try {
      localStorage.setItem('connectly-messages', JSON.stringify(messages));
    } catch {}
  }, [messages]);

  // Persist notifications to localStorage
  useEffect(() => {
    try {
      localStorage.setItem('connectly-notifications', JSON.stringify(notifications));
    } catch {}
  }, [notifications]);

  // Persist attendance records to localStorage
  useEffect(() => {
    try {
      localStorage.setItem('connectly-attendance-records', JSON.stringify(attendanceRecords));
    } catch {}
  }, [attendanceRecords]);

  // Persist activity log to localStorage
  useEffect(() => {
    try {
      localStorage.setItem('connectly-activity-log', JSON.stringify(activityLog));
    } catch {}
  }, [activityLog]);

  const currentUserInfo = useMemo(() => {
    const user = users.find(u => u.id === currentUserId);
    return { user, role: user?.role?.toLowerCase(), uid: user?.id };
  }, [users, currentUserId]);

  const isNotificationVisible = useCallback((n) => {
    if (n.type === 'announcement') return true;
    const { user, role, uid } = currentUserInfo;
    if (n.targetRoles && Array.isArray(n.targetRoles)) return n.targetRoles.includes(role);
    if (n.targetUser) return n.targetUser === user?.email || n.targetUser === uid;
    if (n.userId) return n.userId === uid || n.userId === 'all';
    return false;
  }, [currentUserInfo]);

  const userNotifications = useMemo(() => notifications.filter(isNotificationVisible), [notifications, isNotificationVisible]);
  const unreadNotifications = useMemo(() => userNotifications.filter(n => !n.read).length, [userNotifications]);
  const announcements = useMemo(() => notifications.filter(n => n.type === 'announcement'), [notifications]);

  // ──────── CORE WORKFLOW: Activity Log ────────
  const addActivityLog = useCallback((entry) => {
    setActivityLog(prev => [{
      id: `a${Date.now()}_${Math.random().toString(36).substr(2, 5)}`,
      timestamp: new Date().toISOString(),
      ...entry,
    }, ...prev]);
  }, []);

  // ──────── CORE WORKFLOW: Notifications ────────
  const broadcastNotification = useCallback((notification) => {
    const newNotification = {
      id: `n${Date.now()}_${Math.random().toString(36).substr(2, 5)}`,
      ...notification,
      read: false,
      time: new Date().toISOString(),
    };
    setNotifications(prev => [newNotification, ...prev]);
    addActivityLog({
      type: 'notification',
      action: notification.title || 'Notification',
      user: notification.sender || 'System',
      role: notification.senderRole || 'system',
    });
  }, [addActivityLog]);

  // ──────── CORE WORKFLOW: Messages ────────
  const broadcastMessage = useCallback((message) => {
    const newMessage = {
      id: `msg${Date.now()}`,
      read: false,
      pinned: false,
      ...message,
      timestamp: new Date().toISOString(),
    };
    setMessages(prev => [...prev, newMessage]);
    addActivityLog({
      type: 'message',
      action: `New message: ${message.text?.substring(0, 50)}...`,
      user: message.sender,
      role: message.senderRole,
    });
  }, [addActivityLog]);

  const markNotificationRead = useCallback((id) => {
    setNotifications(prev => prev.map(n => n.id === id ? { ...n, read: true } : n));
  }, []);

  const markAllNotificationsRead = useCallback(() => {
    setNotifications(prev => prev.map(n => ({ ...n, read: true })));
  }, []);

  const markMessagesRead = useCallback((scope, targetId) => {
    setMessages(prev => {
      const matches = (m) => {
        if (scope === 'channel') return m.type === 'channel' && m.to === targetId;
        return m.type === 'direct' && ((m.from === targetId && m.to === currentUserId) || (m.from === currentUserId && m.to === targetId));
      };
      if (!prev.some((m) => matches(m) && !m.read)) return prev;
      return prev.map((m) => (matches(m) ? { ...m, read: true } : m));
    });
  }, [currentUserId]);

  // ──────── AUTH FLOW STATE MACHINE ────────
  const getAuthStep = useCallback(() => {
    try {
      const stored = localStorage.getItem('connectly-auth');
      if (!stored) return AUTH_STEPS.REGISTER;
      const parsed = JSON.parse(stored);
      if (parsed.authStep) return parsed.authStep;
      if (parsed.onboardingComplete) return AUTH_STEPS.DASHBOARD;
      return AUTH_STEPS.ONBOARDING;
    } catch {
      return AUTH_STEPS.REGISTER;
    }
  }, []);

  const setAuthStep = useCallback((step) => {
    try {
      const stored = localStorage.getItem('connectly-auth');
      if (stored) {
        const parsed = JSON.parse(stored);
        parsed.authStep = step;
        if (step === AUTH_STEPS.DASHBOARD) parsed.onboardingComplete = true;
        localStorage.setItem('connectly-auth', JSON.stringify(parsed));
      }
    } catch {
      // noop
    }
  }, []);

  // ──────── WORKFLOW: User Registration → Admin Approval Chain ────────
  const registerUser = useCallback((userData) => {
    const registration = {
      id: `reg${Date.now()}`,
      ...userData,
      status: 'pending',
      submittedAt: new Date().toISOString(),
      name: userData.name || userData.email?.split('@')[0] || 'New User',
    };
    setPendingRegistrations(prev => [...prev, registration]);
    setDashboardMetrics(prev => ({ ...prev, newRegistrations: prev.newRegistrations + 1 }));

    // Step 1: Admin is informed of the new registration and the requested role
    broadcastNotification({
      title: 'New user registration',
      message: `${registration.name} (${registration.email}) has registered as ${registration.role || 'employee'} and can now sign in`,
      type: 'approval',
      sender: registration.email || 'system',
      senderRole: registration.role || 'employee',
      link: '/app/admin/approvals',
      targetRoles: ['admin'],
    });

    addActivityLog({
      type: 'registration',
      action: `New user registered: ${registration.name}`,
      user: registration.name,
      role: 'employee',
    });

    return registration;
  }, [broadcastNotification, addActivityLog]);

  // ──────── WORKFLOW: Admin Approves/Rejects Registration ────────
  const approveRegistration = useCallback((regId) => {
    const reg = pendingRegistrations.find(r => r.id === regId);
    if (!reg) return null;

    setPendingRegistrations(prev => prev.filter(r => r.id !== regId));
    setDashboardMetrics(prev => ({
      ...prev,
      pendingApprovals: Math.max(0, prev.pendingApprovals - 1),
      totalEmployees: prev.totalEmployees + 1,
      activeUsers: prev.activeUsers + 1,
    }));

    // Step 2: Mark user as approved in localStorage
    try {
      const stored = localStorage.getItem('connectly-registered-users');
      if (stored) {
        const registeredUsers = JSON.parse(stored);
        const updated = registeredUsers.map(u =>
          u.email === reg.email ? { ...u, approved: true, verified: true, status: 'active', role: reg.role || u.role } : u
        );
        localStorage.setItem('connectly-registered-users', JSON.stringify(updated));
      }
    } catch {}

    // Step 3: Add approved user to active users
    const newUser = {
      id: `u${Date.now()}`,
      name: reg.name,
      email: reg.email,
      role: reg.role || 'employee',
      status: 'active',
      avatar: '',
      title: reg.title || 'Team Member',
      department: reg.department || 'General',
      verified: true,
      onboardingComplete: false,
    };

    // Append to users state (no mutation of imported module)
    setUsers(prev => [...prev, newUser]);

    // Step 3: Notify user that their account is active
    broadcastNotification({
      title: 'Registration approved! Welcome aboard.',
      message: `Your account has been approved by admin. You can now log in and start using the platform.`,
      type: 'success',
      sender: 'Admin',
      senderRole: 'admin',
      link: '/auth/login',
      targetUser: reg.email,
    });

    // Step 4: Notify admin of successful activation
    broadcastNotification({
      title: 'User activated successfully',
      message: `${reg.name} has been approved and can now access the platform`,
      type: 'success',
      sender: 'system',
      senderRole: 'system',
      link: '/app/admin/permissions',
      targetRoles: ['admin'],
    });

    addActivityLog({
      type: 'approval',
      action: `Admin approved registration: ${reg.name}`,
      user: 'Admin',
      role: 'admin',
    });

    return newUser;
  }, [pendingRegistrations, broadcastNotification, addActivityLog]);

  const rejectRegistration = useCallback((regId, reason) => {
    const reg = pendingRegistrations.find(r => r.id === regId);
    if (!reg) return null;

    setPendingRegistrations(prev => prev.filter(r => r.id !== regId));
    setDashboardMetrics(prev => ({
      ...prev,
      pendingApprovals: Math.max(0, prev.pendingApprovals - 1),
    }));

    broadcastNotification({
      title: 'Registration not approved',
      message: `Your registration could not be approved. ${reason ? `Reason: ${reason}` : 'Please contact support for details.'}`,
      type: 'error',
      sender: 'Admin',
      senderRole: 'admin',
      targetUser: reg.email,
    });

    addActivityLog({
      type: 'approval',
      action: `Admin rejected registration: ${reg.name}`,
      user: 'Admin',
      role: 'admin',
    });

    return reg;
  }, [pendingRegistrations, broadcastNotification, addActivityLog]);

  // ──────── WORKFLOW: User joins workspace ────────
  const joinWorkspace = useCallback((userId, workspaceData) => {
    addActivityLog({
      type: 'workspace',
      action: `User joined workspace: ${workspaceData.name || 'Main Workspace'}`,
      user: userId,
      role: 'employee',
    });

    broadcastNotification({
      title: 'New member joined workspace',
      message: `A new team member has joined ${workspaceData.name || 'the workspace'}`,
      type: 'info',
      sender: 'system',
      senderRole: 'system',
      link: '/app/team',
      targetRoles: ['manager', 'hr'],
    });

    setAuthStep(AUTH_STEPS.ONBOARDING);
  }, [addActivityLog, broadcastNotification, setAuthStep]);

  // ──────── WORKFLOW: Tasks ────────
  const addTask = useCallback((taskData) => {
    const task = {
      id: `t${Date.now()}`,
      ...taskData,
      completed: false,
      createdAt: new Date().toISOString(),
    };
    setTasks(prev => [...prev, task]);

    broadcastNotification({
      title: 'New task assigned',
      message: `Task "${taskData.title}" has been assigned`,
      type: 'task',
      sender: taskData.assignedBy || 'System',
      senderRole: 'manager',
      link: '/app/tasks',
      targetUser: taskData.assignedTo,
    });

    addActivityLog({
      type: 'task',
      action: `Task created: ${taskData.title}`,
      user: taskData.assignedTo || 'System',
      role: 'employee',
    });

    return task;
  }, [broadcastNotification, addActivityLog]);

  const completeTask = useCallback((taskId) => {
    setTasks(prev => prev.map(t => t.id === taskId ? { ...t, completed: true, completedAt: new Date().toISOString() } : t));
    setDashboardMetrics(prev => ({ ...prev, tasksCompleted: prev.tasksCompleted + 1 }));

    addActivityLog({
      type: 'task',
      action: `Task completed: ${tasks.find(t => t.id === taskId)?.title || 'Unknown'}`,
      user: 'System',
      role: 'employee',
    });
  }, [addActivityLog, tasks]);

  // ──────── WORKFLOW: Meetings ────────
  const joinMeeting = useCallback((meetingId) => {
    const meeting = meetings.find(m => m.id === meetingId || m.meetingId === meetingId);
    if (meeting) {
      setCurrentMeeting(meeting);
      setInMeeting(true);
      const joiningUser = users.find(u => u.id === currentUserId);
      if (joiningUser && Array.isArray(meeting.participants)) {
        if (!meeting.participants.includes(joiningUser.id)) {
          setMeetings(prev => prev.map(m =>
            (m.id === meetingId || m.meetingId === meetingId)
              ? { ...m, participants: [...m.participants, joiningUser.id] }
              : m
          ));
        }
        setAttendanceRecords(prev => {
          const already = prev.some(r => r.meetingId === meeting.id && r.userId === joiningUser.id);
          if (already) return prev;
          return [...prev, {
            id: `att${Date.now()}-${joiningUser.id}`,
            meetingId: meeting.id,
            userId: joiningUser.id,
            userName: joiningUser.name,
            department: joiningUser.department || 'General',
            status: 'present',
            joinTime: new Date().toISOString(),
            duration: meeting.duration || 0,
          }];
        });
      }
      addActivityLog({
        type: 'meeting',
        action: `User joined meeting: ${meeting.title}`,
        user: meeting.host,
        role: meeting.hostRole,
      });
    }
    return meeting;
  }, [meetings, users, currentUserId, addActivityLog]);

  const leaveMeeting = useCallback(() => {
    if (currentMeeting) {
      addActivityLog({
        type: 'meeting',
        action: `User left meeting: ${currentMeeting.title}`,
        user: currentMeeting.host,
        role: currentMeeting.hostRole,
      });
    }
    setInMeeting(false);
    setCurrentMeeting(null);
  }, [currentMeeting, addActivityLog]);

  // ──────── WORKFLOW: Host starts/cancels a scheduled meeting ────────
  const startMeeting = useCallback((meetingId) => {
    const meeting = meetings.find(m => m.id === meetingId || m.meetingId === meetingId);
    if (!meeting) return null;
    setMeetings(prev => prev.map(m => (m.id === meetingId || m.meetingId === meetingId) ? { ...m, status: 'live' } : m));
    setDashboardMetrics(prev => ({ ...prev, meetingsToday: prev.meetingsToday + 1 }));
    addActivityLog({
      type: 'meeting',
      action: `Meeting started: ${meeting.title}`,
      user: meeting.host,
      role: meeting.hostRole || 'host',
    });
    broadcastNotification({
      title: 'Meeting started',
      message: `"${meeting.title}" is now live. Join now!`,
      type: 'meeting',
      sender: 'Host',
      senderRole: 'host',
      link: `/app/meeting/lobby/${meeting.id}`,
      targetRoles: ['employee', 'manager', 'hr', 'executive', 'ceo'],
    });
    return meeting;
  }, [meetings, addActivityLog, broadcastNotification]);

  const cancelMeeting = useCallback((meetingId) => {
    const meeting = meetings.find(m => m.id === meetingId || m.meetingId === meetingId);
    if (!meeting) return null;
    setMeetings(prev => prev.map(m => (m.id === meetingId || m.meetingId === meetingId) ? { ...m, status: 'cancelled' } : m));
    addActivityLog({
      type: 'meeting',
      action: `Meeting cancelled: ${meeting.title}`,
      user: meeting.host,
      role: meeting.hostRole || 'host',
    });
    broadcastNotification({
      title: 'Meeting cancelled',
      message: `"${meeting.title}" has been cancelled`,
      type: 'meeting',
      sender: 'Host',
      senderRole: 'host',
      link: `/app/meeting/${meeting.id}`,
      targetRoles: ['employee', 'manager', 'hr', 'executive', 'ceo'],
    });
    return meeting;
  }, [meetings, addActivityLog, broadcastNotification]);

  // ──────── WORKFLOW: Waiting Room (real, persisted) ────────
  // Waiting = invited participants who have not yet joined (no attendance record)
  const getWaitingUsers = useCallback((meetingId) => {
    const meeting = meetings.find(m => m.id === meetingId || m.meetingId === meetingId);
    if (!meeting || !Array.isArray(meeting.participants) || meeting.participants.length === 0) return [];
    const joinedIds = new Set(attendanceRecords
      .filter(r => r.meetingId === meeting.id && r.status === 'present')
      .map(r => r.userId));
    return meeting.participants
      .filter(pid => pid !== meeting.host && !joinedIds.has(pid))
      .map(pid => users.find(u => u.id === pid))
      .filter(Boolean)
      .map(u => ({ id: u.id, name: u.name, avatar: u.avatar, department: u.department || 'General', handRaised: false }));
  }, [meetings, attendanceRecords, users]);

  const admitWaitingUser = useCallback((meetingId, userId) => {
    const meeting = meetings.find(m => m.id === meetingId || m.meetingId === meetingId);
    if (!meeting) return;
    const user = users.find(u => u.id === userId);
    setAttendanceRecords(prev => {
      const already = prev.some(r => r.meetingId === meeting.id && r.userId === userId);
      if (already) return prev;
      return [...prev, {
        id: `att${Date.now()}-${userId}`,
        meetingId: meeting.id,
        userId,
        userName: user?.name || 'Unknown',
        department: user?.department || 'General',
        status: 'present',
        joinTime: new Date().toISOString(),
        duration: meeting.duration || 0,
      }];
    });
    addActivityLog({
      type: 'meeting',
      action: `Host admitted ${user?.name || 'user'} from the waiting room`,
      user: meeting.host,
      role: 'host',
    });
  }, [meetings, users, addActivityLog]);

  const denyWaitingUser = useCallback((meetingId, userId) => {
    setMeetings(prev => prev.map(m =>
      (m.id === meetingId || m.meetingId === meetingId) && Array.isArray(m.participants)
        ? { ...m, participants: m.participants.filter(pid => pid !== userId) }
        : m
    ));
    const user = users.find(u => u.id === userId);
    addActivityLog({
      type: 'meeting',
      action: `Host denied ${user?.name || 'user'} entry from the waiting room`,
      user: 'Host',
      role: 'host',
    });
  }, [users, addActivityLog]);

  // ──────── WORKFLOW: Participant management (co-host, permissions, remove) ────────
  // participantMeta: { [userId]: { coHost: bool, permissions: { mic, video, chat, screenShare } } }
  const updateParticipantMeta = useCallback((meetingId, userId, patch) => {
    setMeetings(prev => prev.map(m => {
      if (m.id !== meetingId && m.meetingId !== meetingId) return m;
      const meta = { ...(m.participantMeta || {}) };
      meta[userId] = {
        coHost: false,
        permissions: { mic: true, video: true, chat: true, screenShare: true },
        ...(meta[userId] || {}),
        ...patch,
      };
      return { ...m, participantMeta: meta };
    }));
  }, []);

  const setCoHost = useCallback((meetingId, userId, value) => {
    updateParticipantMeta(meetingId, userId, { coHost: value });
    const user = users.find(u => u.id === userId);
    const meeting = meetings.find(m => m.id === meetingId || m.meetingId === meetingId);
    addActivityLog({
      type: 'meeting',
      action: value ? `Host assigned co-host: ${user?.name || 'user'}` : `Host removed co-host: ${user?.name || 'user'}`,
      user: meeting?.host || 'Host',
      role: 'host',
    });
  }, [updateParticipantMeta, users, meetings, addActivityLog]);

  const updateParticipantPermissions = useCallback((meetingId, userId, key, value) => {
    setMeetings(prev => prev.map(m => {
      if (m.id !== meetingId && m.meetingId !== meetingId) return m;
      const meta = { ...(m.participantMeta || {}) };
      const current = meta[userId] || {};
      const permissions = { mic: true, video: true, chat: true, screenShare: true, ...(current.permissions || {}) };
      permissions[key] = value;
      meta[userId] = { ...current, permissions };
      return { ...m, participantMeta: meta };
    }));
    const user = users.find(u => u.id === userId);
    const meeting = meetings.find(m => m.id === meetingId || m.meetingId === meetingId);
    addActivityLog({
      type: 'meeting',
      action: `Host ${value ? 'enabled' : 'disabled'} ${key} for ${user?.name || 'user'}`,
      user: meeting?.host || 'Host',
      role: 'host',
    });
  }, [users, meetings, addActivityLog]);

  const removeParticipant = useCallback((meetingId, userId) => {
    setMeetings(prev => prev.map(m => {
      if (m.id !== meetingId && m.meetingId !== meetingId) return m;
      const participants = (m.participants || []).filter(pid => pid !== userId);
      const participantMeta = { ...(m.participantMeta || {}) };
      delete participantMeta[userId];
      return { ...m, participants, participantMeta };
    }));
    setAttendanceRecords(prev => prev.filter(r => !(r.meetingId === meetingId && r.userId === userId)));
    const user = users.find(u => u.id === userId);
    const meeting = meetings.find(m => m.id === meetingId || m.meetingId === meetingId);
    addActivityLog({
      type: 'meeting',
      action: `Host removed ${user?.name || 'user'} from the meeting`,
      user: meeting?.host || 'Host',
      role: 'host',
    });
  }, [users, meetings, addActivityLog]);

  // ──────── WORKFLOW: Presence / availability ────────
  const updatePresence = useCallback((userId, status) => {
    setPresence(prev => ({ ...prev, [userId]: status }));
    setUsers(prev => prev.map(u => u.id === userId ? { ...u, status } : u));
  }, []);

  // ──────── WORKFLOW: Employee responds to a meeting invitation (RSVP) ────────
  // Persists the employee's accept/decline choice on the meeting, logs it, and
  // notifies the meeting host so host-side dashboards reflect attendance intent.
  const respondToInvitation = useCallback((meetingId, response) => {
    const meeting = meetings.find(m => m.id === meetingId || m.meetingId === meetingId);
    if (!meeting) return false;
    setMeetings(prev => prev.map(m =>
      (m.id === meetingId || m.meetingId === meetingId) ? { ...m, rsvp: response, rsvpUser: currentUserId } : m
    ));
    const responder = currentUserInfo?.user?.name || 'A participant';
    const accepted = response === 'accepted';
    addActivityLog({
      type: 'meeting',
      action: `${responder} ${accepted ? 'accepted' : 'declined'} invitation to "${meeting.title}"`,
      user: meeting.host,
      role: meeting.hostRole || 'host',
    });
    broadcastNotification({
      title: accepted ? 'Invitation accepted' : 'Invitation declined',
      message: `${responder} ${accepted ? 'accepted' : 'declined'} your invitation to "${meeting.title}".`,
      type: 'meeting',
      sender: responder,
      senderRole: currentUserInfo?.role || 'employee',
      targetUser: meeting.host,
    });
    return true;
  }, [meetings, currentUserId, currentUserInfo, addActivityLog, broadcastNotification]);

  // ──────── COMMUNICATION: Employee login broadcast ────────
  // When an employee completes login (verified), this fires once per session:
  // 1) marks the employee online in presence + user list (team/host availability)
  // 2) writes a "signed in" entry to the activity log
  // 3) notifies Admin + Manager so their dashboards reflect the employee going online
  // A storage listener syncs availability across browser tabs.
  const lastLoginEventRef = useRef(null);
  useEffect(() => {
    const handleLoginEvent = () => {
      try {
        const stored = localStorage.getItem('connectly-auth');
        if (!stored) {
          lastLoginEventRef.current = null;
          return;
        }
        const parsed = JSON.parse(stored);
        const authUser = parsed.user;
        if (!authUser?.id || parsed.verified !== true) return;
        if (lastLoginEventRef.current === authUser.id) return;
        lastLoginEventRef.current = authUser.id;
        updatePresence(authUser.id, 'online');
        addActivityLog({
          type: 'auth',
          action: `${authUser.name || authUser.email} signed in to the portal`,
          user: authUser.name || authUser.email,
          role: authUser.role || 'employee',
        });
        broadcastNotification({
          title: 'Employee online',
          message: `${authUser.name || authUser.email} is now online.`,
          type: 'user',
          sender: authUser.name || authUser.email,
          senderRole: authUser.role || 'employee',
          targetRoles: ['admin', 'manager'],
        });
      } catch {
        // noop
      }
    };
    const handleStorage = (e) => {
      // Cross-tab: when another tab logs in/out, sync that user's availability
      if (e.key !== 'connectly-auth' || !e.newValue) return;
      try {
        const parsed = JSON.parse(e.newValue);
        if (parsed?.user?.id) updatePresence(parsed.user.id, parsed.verified === true ? 'online' : 'offline');
      } catch {
        // noop
      }
    };
    handleLoginEvent();
    window.addEventListener('connectly-auth-changed', handleLoginEvent);
    window.addEventListener('storage', handleStorage);
    return () => {
      window.removeEventListener('connectly-auth-changed', handleLoginEvent);
      window.removeEventListener('storage', handleStorage);
    };
  }, [updatePresence, addActivityLog, broadcastNotification]);

  const createInstantMeeting = useCallback((hostInfo) => {
    const meetingId = `con-${Math.random().toString(36).substring(2, 10)}`;
    const now = new Date();
    const nowTime = `${String(now.getHours()).padStart(2, '0')}:${String(now.getMinutes()).padStart(2, '0')}`;
    const newMeeting = {
      id: `m${Date.now()}`,
      title: `Meeting ${nowTime}`,
      type: 'instant',
      date: now.toISOString().split('T')[0],
      time: nowTime,
      duration: 0,
      host: hostInfo?.id || 'u7',
      hostRole: hostInfo?.role || 'employee',
      participants: [],
      status: 'live',
      password: '',
      recording: false,
      description: 'Instant meeting',
      meetingId,
      joinUrl: `https://connectly.com/join/${meetingId}`,
    };
    setMeetings(prev => [newMeeting, ...prev]);
    setCurrentMeeting(newMeeting);
    setInMeeting(true);
    setDashboardMetrics(prev => ({ ...prev, meetingsToday: prev.meetingsToday + 1, meetingsThisWeek: prev.meetingsThisWeek + 1 }));

    addActivityLog({
      type: 'meeting',
      action: `Instant meeting created: ${newMeeting.title}`,
      user: hostInfo?.name || 'Host',
      role: hostInfo?.role || 'host',
    });

    broadcastNotification({
      title: 'Meeting started',
      message: `"${newMeeting.title}" has started. Join now!`,
      type: 'meeting',
      sender: hostInfo?.name || 'Host',
      senderRole: hostInfo?.role || 'host',
      link: `/app/meeting/room/${newMeeting.id}`,
      targetRoles: ['employee', 'manager', 'hr', 'executive', 'ceo'],
    });

    return newMeeting;
  }, [addActivityLog, broadcastNotification]);

  // ──────── WORKFLOW: Meeting Approval/Rejection ────────
  const approveMeeting = useCallback((meetingId) => {
    setMeetings(prev => prev.map(m =>
      (m.id === meetingId || m.meetingId === meetingId) ? { ...m, status: 'upcoming' } : m
    ));
    const meeting = meetings.find(m => m.id === meetingId || m.meetingId === meetingId);
    if (meeting) {
      addActivityLog({
        type: 'approval',
        action: `Meeting approved: ${meeting.title}`,
        user: 'Admin',
        role: 'admin',
      });
      broadcastNotification({
        title: 'Meeting approved',
        message: `"${meeting.title}" has been approved and scheduled`,
        type: 'success',
        sender: 'Admin',
        senderRole: 'admin',
        link: `/app/meeting/${meetingId}`,
        targetUser: meeting.host,
      });
    }
  }, [meetings, addActivityLog, broadcastNotification]);

  const rejectMeeting = useCallback((meetingId, reason) => {
    setMeetings(prev => prev.map(m =>
      (m.id === meetingId || m.meetingId === meetingId) ? { ...m, status: 'rejected' } : m
    ));
    const meeting = meetings.find(m => m.id === meetingId || m.meetingId === meetingId);
    if (meeting) {
      addActivityLog({
        type: 'approval',
        action: `Meeting rejected: ${meeting.title}`,
        user: 'Admin',
        role: 'admin',
      });
      broadcastNotification({
        title: 'Meeting rejected',
        message: `"${meeting.title}" was not approved. ${reason ? `Reason: ${reason}` : ''}`,
        type: 'error',
        sender: 'Admin',
        senderRole: 'admin',
        targetUser: meeting.host,
      });
    }
  }, [meetings, addActivityLog, broadcastNotification]);

  // Cross-role workflow: meeting scheduled → notify admin + participants
  const scheduleMeeting = useCallback((data, hostInfo) => {
    const meetingId = `con-${Math.random().toString(36).substring(2, 10)}`;
    const newMeeting = {
      id: `m${Date.now()}`,
      ...data,
      host: hostInfo?.id || 'u7',
      hostRole: hostInfo?.role || 'employee',
      status: 'pending_approval',
      meetingId,
      joinUrl: `https://connectly.com/join/${meetingId}`,
    };
    setMeetings(prev => [...prev, newMeeting]);

    addActivityLog({
      type: 'meeting',
      action: `Meeting scheduled: ${data.title}`,
      user: hostInfo?.name || 'Host',
      role: hostInfo?.role || 'host',
    });

    // Notify admin for approval
    broadcastNotification({
      title: 'New meeting scheduled for approval',
      message: `${hostInfo?.name || 'A user'} scheduled "${data.title}" requiring admin review`,
      type: 'approval',
      sender: hostInfo?.id || 'u7',
      senderRole: hostInfo?.role || 'employee',
      link: '/app/approvals',
      targetRoles: ['admin'],
    });

    // Notify participants (if any)
    if (data.participants && data.participants.length > 0) {
      data.participants.forEach((p) => {
        broadcastNotification({
          title: `New meeting: ${data.title}`,
          message: `You have been invited to "${data.title}" on ${data.date} at ${data.time}`,
          type: 'meeting',
          sender: hostInfo?.name || 'Host',
          senderRole: hostInfo?.role || 'host',
          link: `/app/meeting/lobby/${newMeeting.id}`,
          targetUser: typeof p === 'object' ? (p.email || p.id) : p,
        });
      });
    }

    return newMeeting;
  }, [addActivityLog, broadcastNotification]);

  // Cross-role workflow: meeting ends → attendance → reports → analytics → notify all
  const endMeeting = useCallback((meetingId) => {
    const meeting = meetings.find(m => m.id === meetingId || m.meetingId === meetingId);
    if (!meeting) return;

    setMeetings(prev => prev.map(m => m.id === meetingId || m.meetingId === meetingId ? { ...m, status: 'ended' } : m));
    setInMeeting(false);
    setCurrentMeeting(null);

    // Step 1: Auto-record attendance
    const participants = meeting.participants || [];
    const newAttendanceRecords = participants.length > 0 ? participants.map(p => ({
      id: `att${Date.now()}-${p.id || Math.random().toString(36).substr(2, 5)}`,
      meetingId,
      userId: p.id || 'unknown',
      userName: p.name || 'Unknown',
      department: p.department || 'General',
      status: 'present',
      joinTime: new Date().toISOString(),
      duration: meeting.duration || 30,
    })) : [{
      id: `att${Date.now()}-default`,
      meetingId,
      userId: 'u7',
      userName: 'Current User',
      department: 'General',
      status: 'present',
      joinTime: new Date().toISOString(),
      duration: meeting.duration || 30,
    }];

    setAttendanceRecords(prev => [...prev, ...newAttendanceRecords]);

    addActivityLog({
      type: 'attendance',
      action: `Attendance recorded for "${meeting.title}"`,
      user: 'System',
      role: 'system',
    });

    // Step 2: Generate attendance report
    const attendanceReport = {
      id: `r${Date.now()}`,
      title: `Attendance Report - ${meeting.title}`,
      type: 'attendance',
      meetingId,
      meetingTitle: meeting.title,
      date: meeting.date,
      records: newAttendanceRecords.length,
      status: 'generated',
      timestamp: new Date().toISOString(),
    };
    setReports(prev => [...prev, attendanceReport]);

    // Step 3: Notify all relevant roles

    // → HR sees attendance
    broadcastNotification({
      title: 'Meeting ended - Attendance recorded',
      message: `Attendance for "${meeting.title}" (${newAttendanceRecords.length} participants) has been recorded`,
      type: 'attendance',
      sender: 'system',
      senderRole: 'system',
      link: '/app/attendance',
      targetRoles: ['hr', 'manager'],
    });

    // → Manager sees team activity
    broadcastNotification({
      title: `Team meeting completed: ${meeting.title}`,
      message: `Attendance report is ready for review in team dashboard`,
      type: 'analytics',
      sender: 'system',
      senderRole: 'system',
      link: '/app/dashboard/manager',
      targetRoles: ['manager'],
    });

    // → HR reviews attendance data
    broadcastNotification({
      title: 'Attendance data available for review',
      message: `HR can now review attendance for "${meeting.title}" in the HR dashboard`,
      type: 'report',
      sender: 'system',
      senderRole: 'system',
      link: '/app/dashboard/hr',
      targetRoles: ['hr'],
    });

    // → Executive sees department analytics update
    broadcastNotification({
      title: 'Meeting analytics updated',
      message: `New meeting data available for "${meeting.title}" — department analytics refreshed`,
      type: 'analytics',
      sender: 'system',
      senderRole: 'system',
      link: '/app/dashboard/executive',
      targetRoles: ['executive'],
    });

    // → CEO sees organization analytics update
    broadcastNotification({
      title: 'Organization analytics updated',
      message: `Meeting "${meeting.title}" has been completed and all metrics have been refreshed`,
      type: 'report',
      sender: 'system',
      senderRole: 'system',
      link: '/app/dashboard/ceo',
      targetRoles: ['ceo'],
    });

    // Step 4: Auto-create recording entry if recording was enabled
    if (meeting.recording) {
      const hostUser = users.find(u => u.id === meeting.host);
      const newRecording = {
        id: recordings.length + 1,
        title: `${meeting.title} - Recording`,
        duration: `${meeting.duration || 30}min`,
        host: hostUser?.name || meeting.host,
        date: new Date().toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }),
        views: 0,
        size: `${(Math.random() * 3 + 0.5).toFixed(1)} GB`,
        description: `Auto-recorded session of "${meeting.title}"`,
        starred: false,
        url: SAMPLE_RECORDING_URL,
      };
      setRecordings(prev => [...prev, newRecording]);
    }

    // Step 5: Update dashboard metrics
    setDashboardMetrics(prev => ({
      ...prev,
      meetingsToday: Math.max(0, prev.meetingsToday - 1),
      reportsGenerated: prev.reportsGenerated + 1,
      avgAttendance: Math.round(((prev.avgAttendance * 9) + 94) / 10),
    }));

    addActivityLog({
      type: 'meeting',
      action: `Meeting ended: ${meeting.title}`,
      user: meeting.host,
      role: meeting.hostRole,
    });
  }, [meetings, users, recordings, addActivityLog, broadcastNotification]);

  // Cross-role workflow: generate report → notify exec/ceo
  const generateReport = useCallback((reportData) => {
    const newReport = {
      id: `r${Date.now()}_${Math.random().toString(36).substr(2, 5)}`,
      ...reportData,
      status: 'generated',
      timestamp: new Date().toISOString(),
    };
    setReports(prev => [...prev, newReport]);
    setDashboardMetrics(prev => ({ ...prev, reportsGenerated: prev.reportsGenerated + 1 }));

    broadcastNotification({
      title: 'New report generated',
      message: `${reportData.title} is ready for review`,
      type: 'report',
      sender: 'system',
      senderRole: 'system',
      link: '/app/reports',
      targetRoles: ['manager', 'admin', 'executive', 'ceo', 'hr'],
    });

    // Role-specific notifications
    if (reportData.type === 'attendance') {
      broadcastNotification({
        title: 'Attendance report available',
        message: 'Manager view: attendance report ready for team review',
        type: 'analytics',
        sender: 'system',
        senderRole: 'system',
        link: '/app/communications/analytics',
        targetRoles: ['manager'],
      });
    }
    if (reportData.type === 'executive' || reportData.type === 'financial') {
      broadcastNotification({
        title: 'Executive report generated',
        message: `${reportData.title} — available for CEO and Executive review`,
        type: 'report',
        sender: 'system',
        senderRole: 'system',
        link: '/app/reports',
        targetRoles: ['executive', 'ceo'],
      });
    }

    addActivityLog({
      type: 'report',
      action: `Report generated: ${reportData.title}`,
      user: 'System',
      role: 'system',
    });

    return newReport;
  }, [broadcastNotification, addActivityLog]);

  // ──────── WORKFLOW: Admin Broadcast Announcement ────────
  const broadcastAnnouncement = useCallback(({ title, message, priority = 'info' }) => {
    broadcastNotification({
      title,
      message,
      priority,
      type: 'announcement',
      sender: 'Admin',
      senderRole: 'admin',
      link: '/app/announcements',
      targetRoles: ['employee', 'host', 'manager', 'hr', 'executive', 'ceo'],
    });

    addActivityLog({
      type: 'announcement',
      action: `Admin announced: ${title}`,
      user: 'Admin',
      role: 'admin',
    });

    setDashboardMetrics(prev => ({ ...prev, messagesSent: prev.messagesSent + 1 }));
  }, [broadcastNotification, addActivityLog]);

  const broadcastEmergencyAlert = useCallback(({ title, message, type = 'urgent' }) => {
    broadcastNotification({
      title,
      message,
      priority: 'urgent',
      type,
      sender: 'Admin',
      senderRole: 'admin',
      link: '/app/notifications',
      targetRoles: ['employee', 'host', 'manager', 'hr', 'executive', 'ceo', 'admin'],
    });

    addActivityLog({
      type: 'alert',
      action: `Emergency alert broadcast: ${title}`,
      user: 'Admin',
      role: 'admin',
    });

    setDashboardMetrics(prev => ({ ...prev, messagesSent: prev.messagesSent + 1 }));
  }, [broadcastNotification, addActivityLog]);

  const getCurrentUser = useCallback(() => users.find(u => u.id === currentUserId), [users, currentUserId]);

  const contextValue = useMemo(() => ({
    sidebarOpen, setSidebarOpen,
    notifications, userNotifications, unreadNotifications, announcements, markNotificationRead, markAllNotificationsRead,
    broadcastNotification,
    meetings, setMeetings,
    messages, setMessages, broadcastMessage, markMessagesRead,
    inMeeting, currentMeeting, joinMeeting, leaveMeeting,
    respondToInvitation,
    createInstantMeeting, scheduleMeeting, endMeeting, generateReport,
    startMeeting, cancelMeeting,
    getWaitingUsers, admitWaitingUser, denyWaitingUser,
    setCoHost, updateParticipantPermissions, removeParticipant,
    approveMeeting, rejectMeeting,
    users, getCurrentUser, presence, updatePresence,
    activityLog, addActivityLog,
    attendanceRecords, reports, recordings, setRecordings,
    dashboardMetrics, setDashboardMetrics,
    tasks, addTask, completeTask, setTasks,
    pendingRegistrations, registerUser, approveRegistration, rejectRegistration,
    getAuthStep, setAuthStep, joinWorkspace, broadcastAnnouncement, broadcastEmergencyAlert,
    isLoading, error, setError,
    currentUserId, setCurrentUserId,
    setUsers,
  }), [
    sidebarOpen, notifications, userNotifications, unreadNotifications, announcements, markNotificationRead, markAllNotificationsRead,
    broadcastNotification, meetings, setMeetings, messages, setMessages, broadcastMessage, markMessagesRead,
    inMeeting, currentMeeting, joinMeeting, leaveMeeting, respondToInvitation, createInstantMeeting, scheduleMeeting,
    endMeeting, generateReport, approveMeeting, rejectMeeting,
    startMeeting, cancelMeeting, getWaitingUsers, admitWaitingUser, denyWaitingUser,
    setCoHost, updateParticipantPermissions, removeParticipant,
    users, getCurrentUser, presence, updatePresence, activityLog, addActivityLog,
    attendanceRecords, reports, recordings, setRecordings, dashboardMetrics, setDashboardMetrics, tasks, addTask, completeTask, setTasks,
    pendingRegistrations, registerUser, approveRegistration, rejectRegistration,
    getAuthStep, setAuthStep, joinWorkspace, broadcastAnnouncement, broadcastEmergencyAlert, isLoading, error, setError,
    currentUserId, setCurrentUserId, setUsers,
  ]);

  return (
    <AppContext.Provider value={contextValue}>
      {children}
    </AppContext.Provider>
  );
}

export const useApp = () => useContext(AppContext);
