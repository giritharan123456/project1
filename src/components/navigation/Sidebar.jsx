/* oxlint-disable react/only-export-components */
import { memo, useMemo, useCallback, useRef, useState } from 'react';
import { motion } from 'framer-motion';
import { NavLink, useLocation, useNavigate } from 'react-router-dom';
import { HiHome, HiVideoCamera, HiCalendar, HiUsers, HiChat, HiFolder, HiMicrophone, HiBell, HiChartBar, HiDocumentReport, HiShieldCheck, HiCog, HiLogout, HiChevronLeft, HiChevronDown, HiSearch, HiPencilAlt, HiCheckCircle, HiExclamationCircle, HiClock, HiChartPie, HiUser, HiUserGroup, HiTrendingUp, HiBookOpen, HiSparkles, HiCollection, HiAnnotation, HiQuestionMarkCircle, HiLogin, HiOfficeBuilding, HiDocumentText, HiSpeakerphone, HiClipboardCheck, HiServer, HiCloudUpload, HiDownload, HiUserAdd, HiLockClosed, HiKey, HiGlobeAlt, HiPhone, HiTrendingDown } from 'react-icons/hi';
import { useApp } from '../../context/AppContext';
import { useAuth } from '../../context/AuthContext';
import Avatar from '../ui/Avatar';
import Badge from '../ui/Badge';
import ThemeSwitcher from '../common/ThemeSwitcher';

const pathWithoutSearch = (p = '') => p.split('?')[0];

const isPathActive = (path, locationPath) => {
  const base = pathWithoutSearch(path);
  return locationPath === base || locationPath.startsWith(`${base}/`);
};

const menuItems = [
  { section: 'Main', items: [
    { label: 'Home', icon: HiHome, path: '/app/home' },
    { label: 'Meetings', icon: HiVideoCamera, path: '/app/meetings' },
    { label: 'Calendar', icon: HiCalendar, path: '/app/calendar' },
  ]},
  { section: 'Collaboration', items: [
    { label: 'Team Directory', icon: HiUsers, path: '/app/team' },
    { label: 'Chat', icon: HiChat, path: '/app/chat' },
    { label: 'Files', icon: HiFolder, path: '/app/files' },
    { label: 'Recordings', icon: HiMicrophone, path: '/app/recordings' },
    { label: 'Whiteboard', icon: HiPencilAlt, path: '/app/whiteboard' },
    { label: 'Meeting Notes', icon: HiBookOpen, path: '/app/meeting-notes' },
    { label: 'AI Assistant', icon: HiSparkles, path: '/app/ai' },
  ]},
  { section: 'Workflow', items: [
    { label: 'Tasks', icon: HiCheckCircle, path: '/app/tasks' },
    { label: 'Attendance', icon: HiUserGroup, path: '/app/attendance' },
    { label: 'Approvals', icon: HiExclamationCircle, path: '/app/approvals' },
    { label: 'Team Calendar', icon: HiCalendar, path: '/app/calendar/team' },
    { label: 'Meeting History', icon: HiClock, path: '/app/meeting-history' },
  ]},
  { section: 'Management', items: [
    { label: 'Notifications', icon: HiBell, path: '/app/notifications', badge: 'notifications' },
    { label: 'Host Analytics', icon: HiChartPie, path: '/app/host-analytics' },
    { label: 'Communications Analytics', icon: HiChartPie, path: '/app/communications/analytics' },
    { label: 'Analytics', icon: HiChartBar, path: '/app/analytics' },
    { label: 'Reports', icon: HiDocumentReport, path: '/app/reports' },
    { label: 'Security', icon: HiShieldCheck, path: '/app/security' },
    { label: 'Settings', icon: HiCog, path: '/app/settings' },
  ]},
  { section: 'Admin', items: [
    { label: 'Users', icon: HiUserGroup, path: '/app/admin/users' },
    { label: 'Permissions', icon: HiShieldCheck, path: '/app/admin/permissions' },
    { label: 'Departments', icon: HiUsers, path: '/app/admin/departments' },
    { label: 'Performance', icon: HiChartBar, path: '/app/admin/performance' },
    { label: 'Meetings', icon: HiVideoCamera, path: '/app/admin/meetings' },
    { label: 'Approvals', icon: HiCheckCircle, path: '/app/admin/approvals' },
    { label: 'Access Logs', icon: HiClock, path: '/app/admin/logs' },
    { label: 'Activity', icon: HiTrendingUp, path: '/app/admin/activity' },
    { label: 'Settings', icon: HiCog, path: '/app/admin/settings' },
  ]},
];

const roleAllowedPaths = {
  employee: new Set([
    '/app/home', '/app/meetings', '/app/calendar',
    '/app/team', '/app/chat', '/app/files', '/app/recordings',
    '/app/whiteboard', '/app/meeting-notes',
    '/app/ai',
    '/app/notifications', '/app/settings',
  ]),
  host: new Set([
    '/app/home', '/app/meetings', '/app/calendar',
    '/app/team', '/app/chat', '/app/files', '/app/recordings',
    '/app/whiteboard', '/app/meeting-notes',
    '/app/ai',
    '/app/host-analytics',
    '/app/notifications', '/app/settings',
  ]),
  hr: new Set([
    '/app/home', '/app/meetings', '/app/calendar',
    '/app/team', '/app/chat', '/app/files', '/app/recordings',
    '/app/whiteboard', '/app/meeting-notes',
    '/app/ai',
    '/app/tasks', '/app/attendance', '/app/approvals',
    '/app/notifications', '/app/analytics', '/app/reports',
    '/app/settings',
  ]),
  manager: new Set([
    '/app/home', '/app/meetings', '/app/calendar',
    '/app/team', '/app/chat', '/app/files', '/app/recordings',
    '/app/whiteboard', '/app/meeting-notes',
    '/app/ai',
    '/app/tasks', '/app/attendance', '/app/approvals',
    '/app/calendar/team', '/app/meeting-history',
    '/app/notifications', '/app/communications/analytics',
    '/app/analytics', '/app/reports',
    '/app/settings',
  ]),
  executive: new Set([
    '/app/home', '/app/meetings', '/app/calendar',
    '/app/team', '/app/chat', '/app/files', '/app/recordings',
    '/app/whiteboard', '/app/meeting-notes',
    '/app/ai',
    '/app/notifications', '/app/analytics', '/app/reports',
    '/app/security', '/app/settings',
  ]),
  ceo: null,
  admin: null,
};

const roleVisibleSections = {
  employee: new Set(['Main', 'Collaboration']),
  host: new Set(['Main', 'Collaboration']),
  hr: new Set(['Main', 'Collaboration', 'Workflow', 'Management']),
  manager: new Set(['Main', 'Collaboration', 'Workflow', 'Management']),
  executive: new Set(['Main', 'Collaboration', 'Management']),
  ceo: null,
  admin: null,
};

const roleMenuOrder = {
  employee: ['Dashboard', 'Main', 'Collaboration', 'Profile & Settings'],
  host: [],
  hr: [],
  manager: [],
  admin: [],
  executive: [],
  ceo: [],
};

const roleItemOrder = {
  employee: {
    Collaboration: ['Chat', 'Team Directory', 'Files', 'Whiteboard', 'Meeting Notes', 'Recordings', 'AI Assistant'],
  },
};

const roleExtraSections = {
  employee: [
    { section: 'Profile & Settings', items: [
      { label: 'Profile', icon: HiUser, path: '/app/profile' },
      { label: 'Settings', icon: HiCog, path: '/app/settings' },
    ]},
  ],
};

// Enterprise page hierarchy for the Host role (21 items, in order)
const roleCustomMenu = {
  host: [
    { section: 'Menu', hideHeader: true, items: [
      { label: 'Dashboard', icon: HiChartBar, path: '/app/dashboard/host' },
      { label: 'Home', icon: HiHome, path: '/app/home' },
      { label: 'Meetings', icon: HiVideoCamera, path: '/app/meetings', children: [
        { label: 'Meetings Dashboard', icon: HiVideoCamera, path: '/app/meetings' },
        { label: 'Create Meeting', icon: HiClock, path: '/app/schedule' },
        { label: 'Join Meeting', icon: HiLogin, path: '/app/join' },
        { label: 'Meeting History', icon: HiClock, path: '/app/meeting-history' },
      ]},
      { label: 'Calendar', icon: HiCalendar, path: '/app/calendar', children: [
        { label: 'Calendar', icon: HiCalendar, path: '/app/calendar' },
        { label: 'Schedule Meeting', icon: HiClock, path: '/app/schedule' },
        { label: 'Team Calendar', icon: HiUserGroup, path: '/app/calendar/team' },
      ]},
      { label: 'Participants', icon: HiUserGroup, path: '/app/participants' },
      { label: 'Collaboration', icon: HiCollection, path: '/app/collaboration' },
      { label: 'Chat', icon: HiChat, path: '/app/chat' },
      { label: 'Whiteboard', icon: HiPencilAlt, path: '/app/whiteboard' },
      { label: 'Polls & Engagement', icon: HiAnnotation, path: '/app/polls' },
      { label: 'Files', icon: HiFolder, path: '/app/files' },
      { label: 'Meeting Notes', icon: HiBookOpen, path: '/app/meeting-notes' },
      { label: 'Recordings', icon: HiMicrophone, path: '/app/recordings' },
      { label: 'AI Assistant', icon: HiSparkles, path: '/app/ai' },
      { label: 'Team Directory', icon: HiUsers, path: '/app/team' },
      { label: 'Reports', icon: HiDocumentReport, path: '/app/reports' },
      { label: 'Analytics', icon: HiChartPie, path: '/app/analytics' },
      { label: 'Notifications', icon: HiBell, path: '/app/notifications', badge: 'notifications' },
      { label: 'Profile', icon: HiUser, path: '/app/profile' },
      { label: 'Settings', icon: HiCog, path: '/app/settings' },
      { label: 'Help Center', icon: HiQuestionMarkCircle, path: '/app/help' },
      { label: 'Logout', icon: HiLogout, action: 'logout' },
    ]},
  ],
  hr: [
    { section: 'Menu', hideHeader: true, items: [
      { label: 'Dashboard', icon: HiChartBar, path: '/app/dashboard/hr', children: [
        { label: 'Overview', icon: HiHome, path: '/app/dashboard/hr' },
        { label: 'HR KPI Cards', icon: HiChartBar, path: '/app/dashboard/hr' },
        { label: "Today's Priorities", icon: HiClock, path: '/app/dashboard/hr' },
        { label: 'Notifications', icon: HiBell, path: '/app/notifications' },
        { label: 'Quick Actions', icon: HiClipboardCheck, path: '/app/dashboard/hr' },
        { label: 'AI Insights', icon: HiSparkles, path: '/app/dashboard/hr' },
      ]},
      { label: 'Home', icon: HiHome, path: '/app/home', children: [
        { label: 'Welcome', icon: HiHome, path: '/app/home' },
        { label: 'Recent Activity', icon: HiTrendingUp, path: '/app/hr/activity?tab=recent' },
        { label: 'Organization Overview', icon: HiChartPie, path: '/app/hr/team?tab=hierarchy' },
        { label: 'Announcements', icon: HiSpeakerphone, path: '/app/hr/communication?tab=announcements' },
      ]},
      { label: 'Employee Directory', icon: HiUsers, path: '/app/hr/employees', children: [
        { label: 'Employees', icon: HiUserGroup, path: '/app/hr/employees?tab=all' },
        { label: 'Departments', icon: HiOfficeBuilding, path: '/app/hr/employees?tab=departments' },
        { label: 'Teams', icon: HiUserGroup, path: '/app/hr/employees?tab=teams' },
        { label: 'Employee Profiles', icon: HiUser, path: '/app/hr/employees?tab=profiles' },
        { label: 'Search', icon: HiSearch, path: '/app/hr/employees?tab=search' },
      ]},
      { label: 'Attendance', icon: HiUserGroup, path: '/app/hr/attendance', children: [
        { label: 'Daily', icon: HiUserGroup, path: '/app/hr/attendance?tab=daily' },
        { label: 'Weekly', icon: HiTrendingUp, path: '/app/hr/attendance?tab=weekly' },
        { label: 'Monthly', icon: HiOfficeBuilding, path: '/app/hr/attendance?tab=monthly' },
        { label: 'Leave Requests', icon: HiDocumentText, path: '/app/hr/attendance?tab=leave' },
        { label: 'Late Arrivals', icon: HiClock, path: '/app/hr/attendance?tab=late' },
        { label: 'Absent Employees', icon: HiExclamationCircle, path: '/app/hr/attendance?tab=absent' },
      ]},
      { label: 'Meetings', icon: HiVideoCamera, path: '/app/meetings', children: [
        { label: 'Organization Meetings', icon: HiOfficeBuilding, path: '/app/meetings' },
        { label: 'Department Meetings', icon: HiUsers, path: '/app/meetings' },
        { label: 'Participation', icon: HiUserGroup, path: '/app/hr/participation' },
        { label: 'Meeting History', icon: HiClock, path: '/app/meeting-history' },
      ]},
      { label: 'Calendar', icon: HiCalendar, path: '/app/calendar', children: [
        { label: 'Company Calendar', icon: HiCalendar, path: '/app/calendar' },
        { label: 'Events', icon: HiAnnotation, path: '/app/calendar' },
        { label: 'Holidays', icon: HiClock, path: '/app/calendar' },
        { label: 'Team Calendar', icon: HiUserGroup, path: '/app/calendar' },
      ]},
      { label: 'Recruitment & Onboarding', icon: HiClipboardCheck, path: '/app/hr/recruitment', children: [
        { label: 'Candidates', icon: HiUserGroup, path: '/app/hr/recruitment?tab=approvals' },
        { label: 'Verification', icon: HiCheckCircle, path: '/app/hr/recruitment?tab=verification' },
        { label: 'New Joiners', icon: HiTrendingUp, path: '/app/hr/recruitment?tab=joiners' },
        { label: 'Orientation', icon: HiCalendar, path: '/app/hr/recruitment?tab=orientation' },
      ]},
      { label: 'Team Management', icon: HiUserGroup, path: '/app/hr/team' },
      { label: 'Communication', icon: HiSpeakerphone, path: '/app/hr/communication' },
      { label: 'Chat', icon: HiChat, path: '/app/chat' },
      { label: 'Files & Documents', icon: HiFolder, path: '/app/files' },
      { label: 'Performance & Engagement', icon: HiChartBar, path: '/app/hr/performance' },
      { label: 'Reports', icon: HiDocumentReport, path: '/app/hr/reports' },
      { label: 'Analytics', icon: HiChartPie, path: '/app/hr/analytics' },
      { label: 'AI Assistant', icon: HiSparkles, path: '/app/hr/ai' },
      { label: 'Notifications', icon: HiBell, path: '/app/notifications', badge: 'notifications' },
      { label: 'Activity History', icon: HiTrendingUp, path: '/app/hr/activity' },
      { label: 'Search', icon: HiSearch, path: '/app/search' },
      { label: 'Profile', icon: HiUser, path: '/app/profile' },
      { label: 'Settings', icon: HiCog, path: '/app/settings' },
      { label: 'Help', icon: HiQuestionMarkCircle, path: '/app/help' },
      { label: 'Logout', icon: HiLogout, action: 'logout' },
    ]},
  ],
  admin: [
    { section: 'Menu', hideHeader: true, items: [
      { label: 'Dashboard', icon: HiChartBar, path: '/app/dashboard/admin', children: [
        { label: 'Overview', icon: HiHome, path: '/app/dashboard/admin' },
        { label: 'Organization KPI Cards', icon: HiChartBar, path: '/app/dashboard/admin' },
        { label: 'System Status', icon: HiServer, path: '/app/dashboard/admin' },
        { label: 'Notifications', icon: HiBell, path: '/app/notifications' },
        { label: 'Quick Actions', icon: HiClipboardCheck, path: '/app/dashboard/admin' },
        { label: 'AI Insights', icon: HiSparkles, path: '/app/dashboard/admin' },
      ]},
      { label: 'Home', icon: HiHome, path: '/app/home', children: [
        { label: 'Welcome', icon: HiHome, path: '/app/home' },
        { label: 'Recent Activity', icon: HiTrendingUp, path: '/app/admin/activity' },
        { label: 'Organization Announcements', icon: HiSpeakerphone, path: '/app/announcements' },
        { label: 'Platform Overview', icon: HiChartPie, path: '/app/dashboard/admin' },
      ]},
      { label: 'User Management', icon: HiUserGroup, path: '/app/admin/users', children: [
        { label: 'All Users', icon: HiUsers, path: '/app/admin/users?tab=all' },
        { label: 'Active Users', icon: HiCheckCircle, path: '/app/admin/users?tab=active' },
        { label: 'New Registrations', icon: HiUserAdd, path: '/app/admin/users?tab=new' },
        { label: 'Pending Approvals', icon: HiClock, path: '/app/admin/approvals' },
        { label: 'Suspended Users', icon: HiTrendingDown, path: '/app/admin/users?tab=suspended' },
        { label: 'Blocked Users', icon: HiLockClosed, path: '/app/admin/users?tab=blocked' },
        { label: 'User Profiles', icon: HiUser, path: '/app/admin/users?tab=profiles' },
        { label: 'User Search', icon: HiSearch, path: '/app/admin/users?tab=search' },
      ]},
      { label: 'Role Management', icon: HiShieldCheck, path: '/app/admin/permissions', children: [
        { label: 'Employee Roles', icon: HiUserGroup, path: '/app/admin/permissions?role=employee' },
        { label: 'Host Roles', icon: HiVideoCamera, path: '/app/admin/permissions?role=host' },
        { label: 'HR Roles', icon: HiClipboardCheck, path: '/app/admin/permissions?role=hr' },
        { label: 'Manager Roles', icon: HiTrendingUp, path: '/app/admin/permissions?role=manager' },
        { label: 'Executive Roles', icon: HiChartBar, path: '/app/admin/permissions?role=executive' },
        { label: 'CEO Access', icon: HiChartPie, path: '/app/admin/permissions?role=ceo' },
        { label: 'Assign Roles', icon: HiUserAdd, path: '/app/admin/users?tab=roles' },
        { label: 'Role Permissions', icon: HiShieldCheck, path: '/app/admin/permissions' },
      ]},
      { label: 'Department Management', icon: HiOfficeBuilding, path: '/app/admin/departments', children: [
        { label: 'Departments', icon: HiOfficeBuilding, path: '/app/admin/departments?tab=departments' },
        { label: 'Teams', icon: HiUsers, path: '/app/admin/departments?tab=teams' },
        { label: 'Department Heads', icon: HiUser, path: '/app/admin/departments?tab=heads' },
        { label: 'Organization Structure', icon: HiChartPie, path: '/app/admin/departments?tab=structure' },
        { label: 'Department Settings', icon: HiCog, path: '/app/admin/departments?tab=settings' },
      ]},
      { label: 'Meeting Management', icon: HiVideoCamera, path: '/app/admin/meetings', children: [
        { label: 'Live Meetings', icon: HiVideoCamera, path: '/app/admin/meetings?tab=live' },
        { label: 'Scheduled Meetings', icon: HiCalendar, path: '/app/admin/meetings?tab=scheduled' },
        { label: 'Meeting History', icon: HiClock, path: '/app/meeting-history' },
        { label: 'Meeting Templates', icon: HiDocumentText, path: '/app/admin/meetings?tab=templates' },
        { label: 'Meeting Policies', icon: HiShieldCheck, path: '/app/admin/meetings?tab=policies' },
        { label: 'Organization Meetings', icon: HiOfficeBuilding, path: '/app/admin/meetings' },
      ]},
      { label: 'Calendar', icon: HiCalendar, path: '/app/calendar', children: [
        { label: 'Organization Calendar', icon: HiCalendar, path: '/app/calendar?tab=organization' },
        { label: 'Company Events', icon: HiAnnotation, path: '/app/calendar?tab=events' },
        { label: 'Department Calendar', icon: HiOfficeBuilding, path: '/app/calendar?tab=department' },
        { label: 'Meeting Schedule', icon: HiClock, path: '/app/schedule' },
        { label: 'Holiday Calendar', icon: HiChartPie, path: '/app/calendar?tab=holidays' },
      ]},
      { label: 'Security & Access', icon: HiShieldCheck, path: '/app/security', children: [
        { label: 'Login History', icon: HiKey, path: '/app/security?tab=login-history' },
        { label: 'Access Logs', icon: HiClock, path: '/app/admin/logs' },
        { label: 'Device Sessions', icon: HiDocumentText, path: '/app/security?tab=devices' },
        { label: 'Trusted Devices', icon: HiCheckCircle, path: '/app/security?tab=trusted' },
        { label: 'Two Factor Authentication', icon: HiLockClosed, path: '/app/security?tab=2fa' },
        { label: 'Verification Requests', icon: HiClipboardCheck, path: '/app/admin/approvals?tab=verification' },
        { label: 'Privacy Settings', icon: HiCog, path: '/app/security?tab=privacy' },
      ]},
      { label: 'Collaboration', icon: HiCollection, path: '/app/collaboration', children: [
        { label: 'Shared Workspace', icon: HiCollection, path: '/app/collaboration' },
        { label: 'Team Collaboration', icon: HiUserGroup, path: '/app/collaboration?tab=teams' },
        { label: 'Activity Feed', icon: HiTrendingUp, path: '/app/admin/activity' },
      ]},
      { label: 'Team Directory', icon: HiUsers, path: '/app/team', children: [
        { label: 'Employees', icon: HiUserGroup, path: '/app/team?tab=employees' },
        { label: 'Departments', icon: HiOfficeBuilding, path: '/app/team?tab=departments' },
        { label: 'Managers', icon: HiTrendingUp, path: '/app/team?tab=managers' },
        { label: 'Online Users', icon: HiCheckCircle, path: '/app/team?tab=online' },
        { label: 'Contact Information', icon: HiDocumentText, path: '/app/team?tab=contacts' },
      ]},
      { label: 'Chat', icon: HiChat, path: '/app/chat', children: [
        { label: 'Direct Messages', icon: HiUser, path: '/app/chat?tab=direct' },
        { label: 'Team Channels', icon: HiUsers, path: '/app/chat?tab=channels' },
        { label: 'Organization Chat', icon: HiOfficeBuilding, path: '/app/chat?tab=organization' },
        { label: 'Group Chat', icon: HiUserGroup, path: '/app/chat?tab=groups' },
      ]},
      { label: 'Files', icon: HiFolder, path: '/app/files', children: [
        { label: 'Organization Files', icon: HiOfficeBuilding, path: '/app/files?tab=organization' },
        { label: 'Shared Files', icon: HiUsers, path: '/app/files?tab=shared' },
        { label: 'Uploads', icon: HiCloudUpload, path: '/app/files?tab=uploads' },
        { label: 'Downloads', icon: HiDownload, path: '/app/files?tab=downloads' },
        { label: 'Storage Management', icon: HiCog, path: '/app/files?tab=storage' },
      ]},
      { label: 'Recordings', icon: HiMicrophone, path: '/app/recordings', children: [
        { label: 'Recording Library', icon: HiMicrophone, path: '/app/recordings?tab=library' },
        { label: 'Organization Recordings', icon: HiOfficeBuilding, path: '/app/recordings?tab=organization' },
        { label: 'Recording Settings', icon: HiCog, path: '/app/recordings?tab=settings' },
        { label: 'Recording Management', icon: HiVideoCamera, path: '/app/recordings?tab=management' },
      ]},
      { label: 'Whiteboard', icon: HiPencilAlt, path: '/app/whiteboard', children: [
        { label: 'Organization Boards', icon: HiOfficeBuilding, path: '/app/whiteboard?tab=organization' },
        { label: 'Shared Boards', icon: HiUsers, path: '/app/whiteboard?tab=shared' },
        { label: 'Templates', icon: HiDocumentText, path: '/app/whiteboard?tab=templates' },
      ]},
      { label: 'Meeting Notes', icon: HiBookOpen, path: '/app/meeting-notes', children: [
        { label: 'Organization Notes', icon: HiOfficeBuilding, path: '/app/meeting-notes?tab=organization' },
        { label: 'Shared Notes', icon: HiUsers, path: '/app/meeting-notes?tab=shared' },
        { label: 'AI Notes', icon: HiSparkles, path: '/app/meeting-notes?tab=ai' },
      ]},
      { label: 'AI Assistant', icon: HiSparkles, path: '/app/ai', children: [
        { label: 'AI Organization Insights', icon: HiOfficeBuilding, path: '/app/ai?tab=organization' },
        { label: 'AI Meeting Summary', icon: HiVideoCamera, path: '/app/ai?tab=meetings' },
        { label: 'AI Analytics', icon: HiChartBar, path: '/app/ai?tab=analytics' },
        { label: 'AI User Insights', icon: HiUsers, path: '/app/ai?tab=users' },
        { label: 'AI Recommendations', icon: HiSparkles, path: '/app/ai?tab=recommendations' },
        { label: 'Smart Search', icon: HiSearch, path: '/app/search' },
      ]},
      { label: 'Reports', icon: HiDocumentReport, path: '/app/reports', children: [
        { label: 'User Reports', icon: HiUsers, path: '/app/reports?tab=users' },
        { label: 'Meeting Reports', icon: HiVideoCamera, path: '/app/reports?tab=meetings' },
        { label: 'Attendance Reports', icon: HiClipboardCheck, path: '/app/reports?tab=attendance' },
        { label: 'Department Reports', icon: HiOfficeBuilding, path: '/app/reports?tab=departments' },
        { label: 'Security Reports', icon: HiShieldCheck, path: '/app/reports?tab=security' },
        { label: 'Activity Reports', icon: HiTrendingUp, path: '/app/reports?tab=activity' },
        { label: 'Platform Reports', icon: HiServer, path: '/app/reports?tab=platform' },
      ]},
      { label: 'Analytics', icon: HiChartPie, path: '/app/analytics', children: [
        { label: 'Organization Analytics', icon: HiOfficeBuilding, path: '/app/analytics?tab=organization' },
        { label: 'User Analytics', icon: HiUsers, path: '/app/analytics?tab=users' },
        { label: 'Meeting Analytics', icon: HiVideoCamera, path: '/app/analytics?tab=meetings' },
        { label: 'Department Analytics', icon: HiChartPie, path: '/app/analytics?tab=departments' },
        { label: 'Engagement Analytics', icon: HiTrendingUp, path: '/app/analytics?tab=engagement' },
        { label: 'System Analytics', icon: HiServer, path: '/app/analytics?tab=system' },
      ]},
      { label: 'Notifications', icon: HiBell, path: '/app/notifications', badge: 'notifications', children: [
        { label: 'User Notifications', icon: HiBell, path: '/app/notifications?tab=user' },
        { label: 'Security Alerts', icon: HiShieldCheck, path: '/app/notifications?tab=security' },
        { label: 'Meeting Alerts', icon: HiVideoCamera, path: '/app/notifications?tab=meetings' },
        { label: 'Organization Announcements', icon: HiSpeakerphone, path: '/app/notifications?tab=announcements' },
      ]},
      { label: 'Activity Logs', icon: HiClock, path: '/app/admin/logs', children: [
        { label: 'User Activities', icon: HiUsers, path: '/app/admin/activity' },
        { label: 'Login Activities', icon: HiKey, path: '/app/admin/logs?tab=login' },
        { label: 'System Logs', icon: HiServer, path: '/app/admin/logs?tab=system' },
        { label: 'Audit Logs', icon: HiDocumentText, path: '/app/audit-log' },
      ]},
      { label: 'Profile', icon: HiUser, path: '/app/profile', children: [
        { label: 'Admin Profile', icon: HiUser, path: '/app/profile' },
        { label: 'Account Settings', icon: HiCog, path: '/app/settings' },
      ]},
      { label: 'Settings', icon: HiCog, path: '/app/admin/settings', children: [
        { label: 'Platform Settings', icon: HiCog, path: '/app/admin/settings' },
        { label: 'Organization Settings', icon: HiOfficeBuilding, path: '/app/admin/settings?tab=organization' },
        { label: 'Security Settings', icon: HiShieldCheck, path: '/app/admin/settings?tab=security' },
        { label: 'Notification Settings', icon: HiBell, path: '/app/admin/settings?tab=notifications' },
        { label: 'Appearance', icon: HiSparkles, path: '/app/settings?tab=appearance' },
        { label: 'Language', icon: HiGlobeAlt, path: '/app/settings?tab=language' },
      ]},
      { label: 'Help Center', icon: HiQuestionMarkCircle, path: '/app/help', children: [
        { label: 'Documentation', icon: HiDocumentText, path: '/app/help?tab=documentation' },
        { label: 'Support', icon: HiCheckCircle, path: '/app/help?tab=support' },
        { label: 'FAQs', icon: HiQuestionMarkCircle, path: '/app/help?tab=faqs' },
        { label: 'Contact Support', icon: HiPhone, path: '/app/help?tab=contact' },
      ]},
      { label: 'Logout', icon: HiLogout, action: 'logout' },
    ]},
  ],
  manager: [
    { section: 'Menu', hideHeader: true, items: [
      { label: 'Dashboard', icon: HiChartBar, path: '/app/dashboard/manager', children: [
        { label: 'Overview', icon: HiHome, path: '/app/dashboard/manager' },
        { label: 'Team KPI Cards', icon: HiChartBar, path: '/app/dashboard/manager' },
        { label: 'Team Performance', icon: HiTrendingUp, path: '/app/dashboard/manager' },
        { label: 'Notifications', icon: HiBell, path: '/app/notifications' },
        { label: 'Quick Actions', icon: HiClipboardCheck, path: '/app/dashboard/manager' },
        { label: 'AI Insights', icon: HiSparkles, path: '/app/dashboard/manager' },
      ]},
      { label: 'Home', icon: HiHome, path: '/app/home', children: [
        { label: 'Welcome', icon: HiHome, path: '/app/home' },
        { label: 'Recent Activity', icon: HiTrendingUp, path: '/app/productivity' },
        { label: 'Team Announcements', icon: HiSpeakerphone, path: '/app/announcements' },
        { label: 'Department Overview', icon: HiChartPie, path: '/app/productivity' },
      ]},
      { label: 'Team Management', icon: HiUserGroup, path: '/app/team', children: [
        { label: 'My Team', icon: HiUserGroup, path: '/app/team?tab=team' },
        { label: 'Team Members', icon: HiUsers, path: '/app/team?tab=members' },
        { label: 'Team Availability', icon: HiCheckCircle, path: '/app/team?tab=availability' },
        { label: 'Team Profiles', icon: HiUser, path: '/app/team?tab=profiles' },
        { label: 'Team Hierarchy', icon: HiChartPie, path: '/app/team?tab=hierarchy' },
        { label: 'Search Team Members', icon: HiSearch, path: '/app/team?tab=search' },
      ]},
      { label: 'Employee Management', icon: HiUsers, path: '/app/attendance', children: [
        { label: 'Assigned Employees', icon: HiUserGroup, path: '/app/team?tab=members' },
        { label: 'Employee Performance', icon: HiTrendingUp, path: '/app/productivity' },
        { label: 'Attendance Status', icon: HiClipboardCheck, path: '/app/attendance' },
        { label: 'Leave Requests', icon: HiClock, path: '/app/attendance?tab=leave' },
        { label: 'Task Assignments', icon: HiCheckCircle, path: '/app/tasks' },
        { label: 'Employee Progress', icon: HiTrendingUp, path: '/app/productivity' },
      ]},
      { label: 'Meetings', icon: HiVideoCamera, path: '/app/meetings', children: [
        { label: 'Team Meetings', icon: HiVideoCamera, path: '/app/meetings?tab=team' },
        { label: 'Live Meetings', icon: HiVideoCamera, path: '/app/meetings?tab=live' },
        { label: 'Scheduled Meetings', icon: HiCalendar, path: '/app/schedule' },
        { label: 'Meeting History', icon: HiClock, path: '/app/meeting-history' },
        { label: 'Meeting Invitations', icon: HiUserAdd, path: '/app/meetings?tab=invitations' },
        { label: 'Meeting Templates', icon: HiDocumentText, path: '/app/schedule' },
      ]},
      { label: 'Calendar', icon: HiCalendar, path: '/app/calendar', children: [
        { label: 'Team Calendar', icon: HiUserGroup, path: '/app/calendar/team' },
        { label: 'Department Calendar', icon: HiOfficeBuilding, path: '/app/calendar?tab=department' },
        { label: 'Meeting Schedule', icon: HiClock, path: '/app/schedule' },
        { label: 'Events', icon: HiAnnotation, path: '/app/calendar?tab=events' },
        { label: 'Holidays', icon: HiChartPie, path: '/app/calendar?tab=holidays' },
      ]},
      { label: 'Task Management', icon: HiCheckCircle, path: '/app/tasks', children: [
        { label: 'Assigned Tasks', icon: HiCheckCircle, path: '/app/tasks?tab=assigned' },
        { label: 'Pending Tasks', icon: HiClock, path: '/app/tasks?tab=pending' },
        { label: 'Completed Tasks', icon: HiClipboardCheck, path: '/app/tasks?tab=completed' },
        { label: 'Team Workload', icon: HiChartBar, path: '/app/productivity' },
        { label: 'Deadlines', icon: HiExclamationCircle, path: '/app/tasks?tab=deadlines' },
        { label: 'Task Progress', icon: HiTrendingUp, path: '/app/productivity' },
      ]},
      { label: 'Collaboration', icon: HiCollection, path: '/app/collaboration', children: [
        { label: 'Team Collaboration', icon: HiUserGroup, path: '/app/collaboration?tab=teams' },
        { label: 'Shared Workspace', icon: HiCollection, path: '/app/collaboration' },
        { label: 'Activity Feed', icon: HiTrendingUp, path: '/app/productivity' },
      ]},
      { label: 'Team Directory', icon: HiUsers, path: '/app/team', children: [
        { label: 'Team Members', icon: HiUserGroup, path: '/app/team?tab=members' },
        { label: 'Departments', icon: HiOfficeBuilding, path: '/app/team?tab=departments' },
        { label: 'Managers', icon: HiTrendingUp, path: '/app/team?tab=managers' },
        { label: 'Online Members', icon: HiCheckCircle, path: '/app/team?tab=online' },
        { label: 'Contact Information', icon: HiDocumentText, path: '/app/team?tab=contacts' },
      ]},
      { label: 'Chat', icon: HiChat, path: '/app/chat', children: [
        { label: 'Team Chat', icon: HiChat, path: '/app/chat?tab=team' },
        { label: 'Direct Messages', icon: HiUser, path: '/app/chat?tab=direct' },
        { label: 'Department Channels', icon: HiUsers, path: '/app/chat?tab=channels' },
        { label: 'Group Chat', icon: HiUserGroup, path: '/app/chat?tab=groups' },
      ]},
      { label: 'Files', icon: HiFolder, path: '/app/files', children: [
        { label: 'Team Files', icon: HiFolder, path: '/app/files?tab=team' },
        { label: 'Shared Files', icon: HiUsers, path: '/app/files?tab=shared' },
        { label: 'Uploads', icon: HiCloudUpload, path: '/app/files?tab=uploads' },
        { label: 'Downloads', icon: HiDownload, path: '/app/files?tab=downloads' },
        { label: 'Document Library', icon: HiDocumentText, path: '/app/files?tab=library' },
      ]},
      { label: 'Whiteboard', icon: HiPencilAlt, path: '/app/whiteboard', children: [
        { label: 'Team Boards', icon: HiPencilAlt, path: '/app/whiteboard?tab=team' },
        { label: 'Shared Boards', icon: HiUsers, path: '/app/whiteboard?tab=shared' },
        { label: 'Templates', icon: HiDocumentText, path: '/app/whiteboard?tab=templates' },
      ]},
      { label: 'Meeting Notes', icon: HiBookOpen, path: '/app/meeting-notes', children: [
        { label: 'Team Notes', icon: HiBookOpen, path: '/app/meeting-notes?tab=team' },
        { label: 'Shared Notes', icon: HiUsers, path: '/app/meeting-notes?tab=shared' },
        { label: 'AI Notes', icon: HiSparkles, path: '/app/meeting-notes?tab=ai' },
      ]},
      { label: 'Recordings', icon: HiMicrophone, path: '/app/recordings', children: [
        { label: 'Team Recordings', icon: HiMicrophone, path: '/app/recordings?tab=team' },
        { label: 'Meeting Recordings', icon: HiVideoCamera, path: '/app/recordings?tab=meetings' },
        { label: 'Recording Player', icon: HiVideoCamera, path: '/app/recordings?tab=player' },
        { label: 'Recording Settings', icon: HiCog, path: '/app/recordings?tab=settings' },
      ]},
      { label: 'Reports', icon: HiDocumentReport, path: '/app/reports', children: [
        { label: 'Team Reports', icon: HiUsers, path: '/app/reports?tab=team' },
        { label: 'Attendance Reports', icon: HiClipboardCheck, path: '/app/reports?tab=attendance' },
        { label: 'Task Reports', icon: HiCheckCircle, path: '/app/reports?tab=tasks' },
        { label: 'Meeting Reports', icon: HiVideoCamera, path: '/app/reports?tab=meetings' },
        { label: 'Productivity Reports', icon: HiTrendingUp, path: '/app/productivity' },
        { label: 'Department Reports', icon: HiOfficeBuilding, path: '/app/reports?tab=departments' },
      ]},
      { label: 'Analytics', icon: HiChartPie, path: '/app/analytics', children: [
        { label: 'Team Analytics', icon: HiUsers, path: '/app/analytics?tab=team' },
        { label: 'Employee Analytics', icon: HiUserGroup, path: '/app/analytics?tab=employees' },
        { label: 'Attendance Analytics', icon: HiClipboardCheck, path: '/app/analytics?tab=attendance' },
        { label: 'Productivity Analytics', icon: HiTrendingUp, path: '/app/productivity' },
        { label: 'Meeting Analytics', icon: HiVideoCamera, path: '/app/analytics?tab=meetings' },
        { label: 'Performance Analytics', icon: HiChartBar, path: '/app/analytics?tab=performance' },
      ]},
      { label: 'AI Assistant', icon: HiSparkles, path: '/app/ai', children: [
        { label: 'AI Team Insights', icon: HiUserGroup, path: '/app/ai?tab=team' },
        { label: 'AI Productivity Analysis', icon: HiTrendingUp, path: '/app/ai?tab=productivity' },
        { label: 'AI Meeting Summary', icon: HiVideoCamera, path: '/app/ai?tab=meetings' },
        { label: 'AI Action Items', icon: HiCheckCircle, path: '/app/ai?tab=actions' },
        { label: 'AI Recommendations', icon: HiSparkles, path: '/app/ai?tab=recommendations' },
        { label: 'Smart Search', icon: HiSearch, path: '/app/search' },
      ]},
      { label: 'Notifications', icon: HiBell, path: '/app/notifications', badge: 'notifications', children: [
        { label: 'Team Notifications', icon: HiBell, path: '/app/notifications?tab=team' },
        { label: 'Meeting Alerts', icon: HiVideoCamera, path: '/app/notifications?tab=meetings' },
        { label: 'Task Alerts', icon: HiCheckCircle, path: '/app/notifications?tab=tasks' },
        { label: 'Leave Notifications', icon: HiClock, path: '/app/notifications?tab=leave' },
        { label: 'Department Announcements', icon: HiSpeakerphone, path: '/app/notifications?tab=announcements' },
      ]},
      { label: 'Activity Logs', icon: HiClock, path: '/app/productivity', children: [
        { label: 'Team Activities', icon: HiUserGroup, path: '/app/productivity' },
        { label: 'Employee Activities', icon: HiUsers, path: '/app/productivity' },
        { label: 'Meeting Activities', icon: HiVideoCamera, path: '/app/meeting-history' },
        { label: 'Task History', icon: HiCheckCircle, path: '/app/tasks' },
      ]},
      { label: 'Profile', icon: HiUser, path: '/app/profile', children: [
        { label: 'Manager Profile', icon: HiUser, path: '/app/profile' },
        { label: 'Account Settings', icon: HiCog, path: '/app/settings' },
      ]},
      { label: 'Settings', icon: HiCog, path: '/app/settings', children: [
        { label: 'Team Settings', icon: HiUserGroup, path: '/app/settings?tab=team' },
        { label: 'Notification Settings', icon: HiBell, path: '/app/settings?tab=notifications' },
        { label: 'Privacy', icon: HiLockClosed, path: '/app/settings?tab=privacy' },
        { label: 'Security', icon: HiShieldCheck, path: '/app/settings?tab=security' },
        { label: 'Appearance', icon: HiSparkles, path: '/app/settings?tab=appearance' },
        { label: 'Language', icon: HiGlobeAlt, path: '/app/settings?tab=language' },
      ]},
      { label: 'Help Center', icon: HiQuestionMarkCircle, path: '/app/help', children: [
        { label: 'Documentation', icon: HiDocumentText, path: '/app/help?tab=documentation' },
        { label: 'Support', icon: HiCheckCircle, path: '/app/help?tab=support' },
        { label: 'FAQs', icon: HiQuestionMarkCircle, path: '/app/help?tab=faqs' },
        { label: 'Contact Support', icon: HiPhone, path: '/app/help?tab=contact' },
      ]},
      { label: 'Logout', icon: HiLogout, action: 'logout' },
    ]},
  ],
  executive: [
    { section: 'Menu', hideHeader: true, items: [
      { label: 'Dashboard', icon: HiChartBar, path: '/app/dashboard/executive', children: [
        { label: 'Overview', icon: HiHome, path: '/app/dashboard/executive' },
        { label: 'Executive KPI Cards', icon: HiChartBar, path: '/app/dashboard/executive' },
        { label: 'Organization Performance', icon: HiTrendingUp, path: '/app/dashboard/executive' },
        { label: 'Notifications', icon: HiBell, path: '/app/notifications' },
        { label: 'Quick Actions', icon: HiClipboardCheck, path: '/app/dashboard/executive' },
        { label: 'AI Insights', icon: HiSparkles, path: '/app/dashboard/executive' },
      ]},
      { label: 'Home', icon: HiHome, path: '/app/home', children: [
        { label: 'Welcome', icon: HiHome, path: '/app/home' },
        { label: 'Recent Activity', icon: HiTrendingUp, path: '/app/analytics' },
        { label: 'Executive Announcements', icon: HiSpeakerphone, path: '/app/announcements' },
        { label: 'Organization Overview', icon: HiChartPie, path: '/app/analytics' },
      ]},
      { label: 'Organization Overview', icon: HiOfficeBuilding, path: '/app/team', children: [
        { label: 'Company Overview', icon: HiChartPie, path: '/app/analytics' },
        { label: 'Business Units', icon: HiOfficeBuilding, path: '/app/team?tab=departments' },
        { label: 'Departments', icon: HiUsers, path: '/app/team?tab=departments' },
        { label: 'Organization Structure', icon: HiChartPie, path: '/app/team?tab=hierarchy' },
        { label: 'Organization Health', icon: HiTrendingUp, path: '/app/analytics' },
        { label: 'Company Search', icon: HiSearch, path: '/app/search' },
      ]},
      { label: 'Department Management', icon: HiUsers, path: '/app/team', children: [
        { label: 'All Departments', icon: HiOfficeBuilding, path: '/app/team?tab=departments' },
        { label: 'Department Performance', icon: HiTrendingUp, path: '/app/analytics?tab=departments' },
        { label: 'Department Heads', icon: HiUserGroup, path: '/app/team?tab=managers' },
        { label: 'Department Comparison', icon: HiChartPie, path: '/app/analytics?tab=departments' },
        { label: 'Department Status', icon: HiCheckCircle, path: '/app/team?tab=status' },
        { label: 'Department Insights', icon: HiSparkles, path: '/app/analytics?tab=departments' },
      ]},
      { label: 'Workforce Overview', icon: HiUserGroup, path: '/app/team', children: [
        { label: 'Employees', icon: HiUsers, path: '/app/team?tab=members' },
        { label: 'Managers', icon: HiTrendingUp, path: '/app/team?tab=managers' },
        { label: 'HR Overview', icon: HiUserGroup, path: '/app/team?tab=departments' },
        { label: 'Team Distribution', icon: HiChartPie, path: '/app/analytics?tab=workforce' },
        { label: 'Workforce Availability', icon: HiCheckCircle, path: '/app/team?tab=availability' },
        { label: 'Employee Insights', icon: HiSparkles, path: '/app/analytics?tab=employees' },
      ]},
      { label: 'Meetings', icon: HiVideoCamera, path: '/app/meetings', children: [
        { label: 'Executive Meetings', icon: HiVideoCamera, path: '/app/meetings?tab=executive' },
        { label: 'Organization Meetings', icon: HiVideoCamera, path: '/app/meetings?tab=organization' },
        { label: 'Live Meetings', icon: HiVideoCamera, path: '/app/meetings?tab=live' },
        { label: 'Scheduled Meetings', icon: HiCalendar, path: '/app/schedule' },
        { label: 'Meeting History', icon: HiClock, path: '/app/meeting-history' },
        { label: 'Executive Briefings', icon: HiDocumentText, path: '/app/meetings?tab=briefings' },
      ]},
      { label: 'Calendar', icon: HiCalendar, path: '/app/calendar', children: [
        { label: 'Executive Calendar', icon: HiCalendar, path: '/app/calendar' },
        { label: 'Organization Calendar', icon: HiOfficeBuilding, path: '/app/calendar?tab=organization' },
        { label: 'Company Events', icon: HiAnnotation, path: '/app/calendar?tab=events' },
        { label: 'Board Meetings', icon: HiOfficeBuilding, path: '/app/calendar?tab=board' },
        { label: 'Holiday Calendar', icon: HiChartPie, path: '/app/calendar?tab=holidays' },
      ]},
      { label: 'Strategy & Planning', icon: HiDocumentReport, path: '/app/approvals', children: [
        { label: 'Strategic Goals', icon: HiTrendingUp, path: '/app/reports?tab=strategy' },
        { label: 'Business Objectives', icon: HiCheckCircle, path: '/app/approvals?tab=objectives' },
        { label: 'Roadmaps', icon: HiClock, path: '/app/approvals?tab=roadmaps' },
        { label: 'Initiatives', icon: HiSparkles, path: '/app/approvals?tab=initiatives' },
        { label: 'Decision Tracking', icon: HiExclamationCircle, path: '/app/approvals?tab=decisions' },
        { label: 'Business Priorities', icon: HiChartBar, path: '/app/reports?tab=priorities' },
      ]},
      { label: 'Collaboration', icon: HiCollection, path: '/app/collaboration', children: [
        { label: 'Executive Collaboration', icon: HiUserGroup, path: '/app/collaboration?tab=executive' },
        { label: 'Leadership Workspace', icon: HiCollection, path: '/app/collaboration' },
        { label: 'Activity Feed', icon: HiTrendingUp, path: '/app/analytics' },
      ]},
      { label: 'Team Directory', icon: HiUsers, path: '/app/team', children: [
        { label: 'Executives', icon: HiUser, path: '/app/team?tab=executives' },
        { label: 'Managers', icon: HiTrendingUp, path: '/app/team?tab=managers' },
        { label: 'Department Heads', icon: HiOfficeBuilding, path: '/app/team?tab=departments' },
        { label: 'Employees', icon: HiUserGroup, path: '/app/team?tab=members' },
        { label: 'Contact Information', icon: HiDocumentText, path: '/app/team?tab=contacts' },
      ]},
      { label: 'Chat', icon: HiChat, path: '/app/chat', children: [
        { label: 'Executive Chat', icon: HiChat, path: '/app/chat?tab=executive' },
        { label: 'Leadership Channels', icon: HiUsers, path: '/app/chat?tab=leadership' },
        { label: 'Direct Messages', icon: HiUser, path: '/app/chat?tab=direct' },
        { label: 'Group Discussions', icon: HiUserGroup, path: '/app/chat?tab=groups' },
      ]},
      { label: 'Files', icon: HiFolder, path: '/app/files', children: [
        { label: 'Executive Files', icon: HiFolder, path: '/app/files?tab=executive' },
        { label: 'Shared Documents', icon: HiUsers, path: '/app/files?tab=shared' },
        { label: 'Board Documents', icon: HiDocumentText, path: '/app/files?tab=board' },
        { label: 'Downloads', icon: HiDownload, path: '/app/files?tab=downloads' },
        { label: 'Document Library', icon: HiDocumentText, path: '/app/files?tab=library' },
      ]},
      { label: 'Whiteboard', icon: HiPencilAlt, path: '/app/whiteboard', children: [
        { label: 'Strategy Boards', icon: HiPencilAlt, path: '/app/whiteboard?tab=strategy' },
        { label: 'Executive Boards', icon: HiPencilAlt, path: '/app/whiteboard?tab=executive' },
        { label: 'Shared Boards', icon: HiUsers, path: '/app/whiteboard?tab=shared' },
        { label: 'Templates', icon: HiDocumentText, path: '/app/whiteboard?tab=templates' },
      ]},
      { label: 'Meeting Notes', icon: HiBookOpen, path: '/app/meeting-notes', children: [
        { label: 'Executive Notes', icon: HiBookOpen, path: '/app/meeting-notes?tab=executive' },
        { label: 'Leadership Notes', icon: HiUsers, path: '/app/meeting-notes?tab=leadership' },
        { label: 'AI Notes', icon: HiSparkles, path: '/app/meeting-notes?tab=ai' },
      ]},
      { label: 'Recordings', icon: HiMicrophone, path: '/app/recordings', children: [
        { label: 'Executive Recordings', icon: HiMicrophone, path: '/app/recordings?tab=executive' },
        { label: 'Organization Recordings', icon: HiVideoCamera, path: '/app/recordings?tab=organization' },
        { label: 'Recording Library', icon: HiDocumentText, path: '/app/recordings?tab=library' },
        { label: 'Recording Player', icon: HiVideoCamera, path: '/app/recordings?tab=player' },
      ]},
      { label: 'Reports', icon: HiDocumentReport, path: '/app/reports', children: [
        { label: 'Executive Reports', icon: HiDocumentReport, path: '/app/reports?tab=executive' },
        { label: 'Organization Reports', icon: HiUsers, path: '/app/reports?tab=organization' },
        { label: 'Department Reports', icon: HiOfficeBuilding, path: '/app/reports?tab=departments' },
        { label: 'Financial Reports', icon: HiChartBar, path: '/app/reports?tab=financial' },
        { label: 'Performance Reports', icon: HiTrendingUp, path: '/app/reports?tab=performance' },
        { label: 'Strategic Reports', icon: HiDocumentText, path: '/app/reports?tab=strategy' },
      ]},
      { label: 'Analytics', icon: HiChartPie, path: '/app/analytics', children: [
        { label: 'Organization Analytics', icon: HiChartPie, path: '/app/analytics?tab=organization' },
        { label: 'Executive Analytics', icon: HiChartBar, path: '/app/analytics?tab=executive' },
        { label: 'Department Analytics', icon: HiOfficeBuilding, path: '/app/analytics?tab=departments' },
        { label: 'Workforce Analytics', icon: HiUserGroup, path: '/app/analytics?tab=workforce' },
        { label: 'Productivity Analytics', icon: HiTrendingUp, path: '/app/analytics?tab=productivity' },
        { label: 'Engagement Analytics', icon: HiSparkles, path: '/app/analytics?tab=engagement' },
      ]},
      { label: 'AI Assistant', icon: HiSparkles, path: '/app/ai', children: [
        { label: 'AI Executive Insights', icon: HiSparkles, path: '/app/ai?tab=executive' },
        { label: 'AI Organization Summary', icon: HiUserGroup, path: '/app/ai?tab=organization' },
        { label: 'AI Business Intelligence', icon: HiChartBar, path: '/app/ai?tab=business' },
        { label: 'AI Decision Support', icon: HiCheckCircle, path: '/app/ai?tab=decisions' },
        { label: 'AI Recommendations', icon: HiSparkles, path: '/app/ai?tab=recommendations' },
        { label: 'Smart Search', icon: HiSearch, path: '/app/search' },
      ]},
      { label: 'Notifications', icon: HiBell, path: '/app/notifications', badge: 'notifications', children: [
        { label: 'Executive Notifications', icon: HiBell, path: '/app/notifications?tab=executive' },
        { label: 'Organization Alerts', icon: HiSpeakerphone, path: '/app/notifications?tab=organization' },
        { label: 'Meeting Alerts', icon: HiVideoCamera, path: '/app/notifications?tab=meetings' },
        { label: 'Department Updates', icon: HiOfficeBuilding, path: '/app/notifications?tab=departments' },
        { label: 'Strategic Announcements', icon: HiSpeakerphone, path: '/app/notifications?tab=announcements' },
      ]},
      { label: 'Activity Logs', icon: HiClock, path: '/app/audit-log', children: [
        { label: 'Executive Activities', icon: HiUser, path: '/app/audit-log?tab=executive' },
        { label: 'Organization Activities', icon: HiUsers, path: '/app/audit-log?tab=organization' },
        { label: 'Department Activities', icon: HiOfficeBuilding, path: '/app/audit-log?tab=departments' },
        { label: 'Audit History', icon: HiClock, path: '/app/audit-log' },
      ]},
      { label: 'Profile', icon: HiUser, path: '/app/profile', children: [
        { label: 'Executive Profile', icon: HiUser, path: '/app/profile' },
        { label: 'Account Settings', icon: HiCog, path: '/app/settings' },
      ]},
      { label: 'Settings', icon: HiCog, path: '/app/settings', children: [
        { label: 'Executive Settings', icon: HiUserGroup, path: '/app/settings?tab=executive' },
        { label: 'Organization Settings', icon: HiOfficeBuilding, path: '/app/settings?tab=organization' },
        { label: 'Notification Settings', icon: HiBell, path: '/app/settings?tab=notifications' },
        { label: 'Privacy', icon: HiLockClosed, path: '/app/settings?tab=privacy' },
        { label: 'Security', icon: HiShieldCheck, path: '/app/settings?tab=security' },
        { label: 'Appearance', icon: HiSparkles, path: '/app/settings?tab=appearance' },
        { label: 'Language', icon: HiGlobeAlt, path: '/app/settings?tab=language' },
      ]},
      { label: 'Help Center', icon: HiQuestionMarkCircle, path: '/app/help', children: [
        { label: 'Documentation', icon: HiDocumentText, path: '/app/help?tab=documentation' },
        { label: 'Support', icon: HiCheckCircle, path: '/app/help?tab=support' },
        { label: 'FAQs', icon: HiQuestionMarkCircle, path: '/app/help?tab=faqs' },
        { label: 'Contact Support', icon: HiPhone, path: '/app/help?tab=contact' },
      ]},
      { label: 'Logout', icon: HiLogout, action: 'logout' },
    ]},
  ],
  ceo: [
    { section: 'Menu', hideHeader: true, items: [
      { label: 'Dashboard', icon: HiChartBar, path: '/app/dashboard/ceo', children: [
        { label: 'Overview', icon: HiHome, path: '/app/dashboard/ceo' },
        { label: 'Company KPI Cards', icon: HiChartBar, path: '/app/dashboard/ceo' },
        { label: 'Organization Health', icon: HiTrendingUp, path: '/app/dashboard/ceo' },
        { label: 'Notifications', icon: HiBell, path: '/app/notifications' },
        { label: 'Quick Actions', icon: HiClipboardCheck, path: '/app/dashboard/ceo' },
        { label: 'AI Executive Insights', icon: HiSparkles, path: '/app/dashboard/ceo' },
      ]},
      { label: 'Home', icon: HiHome, path: '/app/home', children: [
        { label: 'Welcome', icon: HiHome, path: '/app/home' },
        { label: 'Recent Activity', icon: HiTrendingUp, path: '/app/analytics' },
        { label: 'CEO Announcements', icon: HiSpeakerphone, path: '/app/announcements' },
        { label: 'Company Overview', icon: HiChartPie, path: '/app/analytics' },
      ]},
      { label: 'Organization Overview', icon: HiOfficeBuilding, path: '/app/team', children: [
        { label: 'Company Overview', icon: HiChartPie, path: '/app/analytics' },
        { label: 'Organization Structure', icon: HiChartPie, path: '/app/team?tab=hierarchy' },
        { label: 'Business Units', icon: HiOfficeBuilding, path: '/app/team?tab=departments' },
        { label: 'Global Operations', icon: HiGlobeAlt, path: '/app/analytics?tab=global' },
        { label: 'Organization Health', icon: HiTrendingUp, path: '/app/analytics' },
        { label: 'Company Search', icon: HiSearch, path: '/app/search' },
      ]},
      { label: 'Executive Management', icon: HiUserGroup, path: '/app/team', children: [
        { label: 'Executive Team', icon: HiUserGroup, path: '/app/team?tab=executives' },
        { label: 'Executive Performance', icon: HiTrendingUp, path: '/app/analytics?tab=executive' },
        { label: 'Leadership Hierarchy', icon: HiChartPie, path: '/app/team?tab=hierarchy' },
        { label: 'Executive Responsibilities', icon: HiClipboardCheck, path: '/app/team?tab=executives' },
        { label: 'Executive Meetings', icon: HiVideoCamera, path: '/app/meetings?tab=executive' },
        { label: 'Leadership Insights', icon: HiSparkles, path: '/app/analytics?tab=leadership' },
      ]},
      { label: 'Department Overview', icon: HiOfficeBuilding, path: '/app/team', children: [
        { label: 'All Departments', icon: HiOfficeBuilding, path: '/app/team?tab=departments' },
        { label: 'Department Performance', icon: HiTrendingUp, path: '/app/analytics?tab=departments' },
        { label: 'Department Comparison', icon: HiChartPie, path: '/app/analytics?tab=departments' },
        { label: 'Department Heads', icon: HiUserGroup, path: '/app/team?tab=managers' },
        { label: 'Department Health', icon: HiCheckCircle, path: '/app/analytics?tab=departments' },
        { label: 'Department KPIs', icon: HiChartBar, path: '/app/analytics?tab=kpis' },
      ]},
      { label: 'Workforce Overview', icon: HiUsers, path: '/app/team', children: [
        { label: 'Total Employees', icon: HiUsers, path: '/app/team?tab=members' },
        { label: 'Workforce Distribution', icon: HiChartPie, path: '/app/analytics?tab=workforce' },
        { label: 'Managers', icon: HiTrendingUp, path: '/app/team?tab=managers' },
        { label: 'HR Overview', icon: HiUserGroup, path: '/app/team?tab=departments' },
        { label: 'Employee Engagement', icon: HiSparkles, path: '/app/analytics?tab=engagement' },
        { label: 'Workforce Analytics', icon: HiChartBar, path: '/app/analytics?tab=workforce' },
      ]},
      { label: 'Meetings', icon: HiVideoCamera, path: '/app/meetings', children: [
        { label: 'CEO Meetings', icon: HiVideoCamera, path: '/app/meetings?tab=ceo' },
        { label: 'Executive Meetings', icon: HiVideoCamera, path: '/app/meetings?tab=executive' },
        { label: 'Board Meetings', icon: HiOfficeBuilding, path: '/app/meetings?tab=board' },
        { label: 'Organization Meetings', icon: HiVideoCamera, path: '/app/meetings?tab=organization' },
        { label: 'Live Meetings', icon: HiVideoCamera, path: '/app/meetings?tab=live' },
        { label: 'Meeting History', icon: HiClock, path: '/app/meeting-history' },
      ]},
      { label: 'Calendar', icon: HiCalendar, path: '/app/calendar', children: [
        { label: 'CEO Calendar', icon: HiCalendar, path: '/app/calendar' },
        { label: 'Executive Calendar', icon: HiUserGroup, path: '/app/calendar?tab=executive' },
        { label: 'Organization Calendar', icon: HiOfficeBuilding, path: '/app/calendar?tab=organization' },
        { label: 'Board Schedule', icon: HiOfficeBuilding, path: '/app/calendar?tab=board' },
        { label: 'Company Events', icon: HiAnnotation, path: '/app/calendar?tab=events' },
        { label: 'Holiday Calendar', icon: HiChartPie, path: '/app/calendar?tab=holidays' },
      ]},
      { label: 'Business Strategy', icon: HiDocumentReport, path: '/app/approvals', children: [
        { label: 'Strategic Goals', icon: HiTrendingUp, path: '/app/reports?tab=strategy' },
        { label: 'Business Objectives', icon: HiCheckCircle, path: '/app/approvals?tab=objectives' },
        { label: 'Growth Strategy', icon: HiTrendingUp, path: '/app/reports?tab=growth' },
        { label: 'Company Roadmap', icon: HiClock, path: '/app/approvals?tab=roadmap' },
        { label: 'Investments', icon: HiChartBar, path: '/app/approvals?tab=investments' },
        { label: 'Decision Center', icon: HiExclamationCircle, path: '/app/approvals?tab=decisions' },
      ]},
      { label: 'Collaboration', icon: HiCollection, path: '/app/collaboration', children: [
        { label: 'Executive Collaboration', icon: HiUserGroup, path: '/app/collaboration?tab=executive' },
        { label: 'Leadership Workspace', icon: HiCollection, path: '/app/collaboration' },
        { label: 'Organization Collaboration', icon: HiUsers, path: '/app/collaboration?tab=organization' },
        { label: 'Activity Feed', icon: HiTrendingUp, path: '/app/analytics' },
      ]},
      { label: 'Team Directory', icon: HiUsers, path: '/app/team', children: [
        { label: 'Executives', icon: HiUserGroup, path: '/app/team?tab=executives' },
        { label: 'Managers', icon: HiTrendingUp, path: '/app/team?tab=managers' },
        { label: 'Department Heads', icon: HiOfficeBuilding, path: '/app/team?tab=departments' },
        { label: 'Employees', icon: HiUsers, path: '/app/team?tab=members' },
        { label: 'Contact Information', icon: HiDocumentText, path: '/app/team?tab=contacts' },
      ]},
      { label: 'Chat', icon: HiChat, path: '/app/chat', children: [
        { label: 'Executive Chat', icon: HiChat, path: '/app/chat?tab=executive' },
        { label: 'Leadership Channels', icon: HiUsers, path: '/app/chat?tab=leadership' },
        { label: 'Direct Messages', icon: HiUser, path: '/app/chat?tab=direct' },
        { label: 'Organization Discussions', icon: HiUserGroup, path: '/app/chat?tab=organization' },
      ]},
      { label: 'Files', icon: HiFolder, path: '/app/files', children: [
        { label: 'Executive Files', icon: HiFolder, path: '/app/files?tab=executive' },
        { label: 'Strategic Documents', icon: HiDocumentText, path: '/app/files?tab=strategy' },
        { label: 'Board Documents', icon: HiDocumentText, path: '/app/files?tab=board' },
        { label: 'Shared Documents', icon: HiUsers, path: '/app/files?tab=shared' },
        { label: 'Downloads', icon: HiDownload, path: '/app/files?tab=downloads' },
        { label: 'Document Library', icon: HiDocumentText, path: '/app/files?tab=library' },
      ]},
      { label: 'Whiteboard', icon: HiPencilAlt, path: '/app/whiteboard', children: [
        { label: 'Strategy Boards', icon: HiPencilAlt, path: '/app/whiteboard?tab=strategy' },
        { label: 'Executive Boards', icon: HiPencilAlt, path: '/app/whiteboard?tab=executive' },
        { label: 'Shared Boards', icon: HiUsers, path: '/app/whiteboard?tab=shared' },
        { label: 'Business Planning Templates', icon: HiDocumentText, path: '/app/whiteboard?tab=templates' },
      ]},
      { label: 'Meeting Notes', icon: HiBookOpen, path: '/app/meeting-notes', children: [
        { label: 'CEO Notes', icon: HiBookOpen, path: '/app/meeting-notes?tab=ceo' },
        { label: 'Executive Notes', icon: HiUsers, path: '/app/meeting-notes?tab=executive' },
        { label: 'Board Notes', icon: HiOfficeBuilding, path: '/app/meeting-notes?tab=board' },
        { label: 'AI Notes', icon: HiSparkles, path: '/app/meeting-notes?tab=ai' },
      ]},
      { label: 'Recordings', icon: HiMicrophone, path: '/app/recordings', children: [
        { label: 'CEO Recordings', icon: HiMicrophone, path: '/app/recordings?tab=ceo' },
        { label: 'Executive Recordings', icon: HiVideoCamera, path: '/app/recordings?tab=executive' },
        { label: 'Board Meeting Recordings', icon: HiOfficeBuilding, path: '/app/recordings?tab=board' },
        { label: 'Recording Library', icon: HiDocumentText, path: '/app/recordings?tab=library' },
        { label: 'Recording Player', icon: HiVideoCamera, path: '/app/recordings?tab=player' },
      ]},
      { label: 'Reports', icon: HiDocumentReport, path: '/app/reports', children: [
        { label: 'Executive Reports', icon: HiDocumentReport, path: '/app/reports?tab=executive' },
        { label: 'Organization Reports', icon: HiUsers, path: '/app/reports?tab=organization' },
        { label: 'Department Reports', icon: HiOfficeBuilding, path: '/app/reports?tab=departments' },
        { label: 'Financial Reports', icon: HiChartBar, path: '/app/reports?tab=financial' },
        { label: 'Revenue Reports', icon: HiTrendingUp, path: '/app/reports?tab=revenue' },
        { label: 'Growth Reports', icon: HiTrendingUp, path: '/app/reports?tab=growth' },
        { label: 'Performance Reports', icon: HiTrendingUp, path: '/app/reports?tab=performance' },
        { label: 'Strategic Reports', icon: HiDocumentText, path: '/app/reports?tab=strategy' },
        { label: 'Board Reports', icon: HiOfficeBuilding, path: '/app/reports?tab=board' },
      ]},
      { label: 'Analytics', icon: HiChartPie, path: '/app/analytics', children: [
        { label: 'Organization Analytics', icon: HiChartPie, path: '/app/analytics?tab=organization' },
        { label: 'Executive Analytics', icon: HiChartBar, path: '/app/analytics?tab=executive' },
        { label: 'Financial Analytics', icon: HiChartBar, path: '/app/analytics?tab=financial' },
        { label: 'Revenue Analytics', icon: HiTrendingUp, path: '/app/analytics?tab=revenue' },
        { label: 'Workforce Analytics', icon: HiUsers, path: '/app/analytics?tab=workforce' },
        { label: 'Productivity Analytics', icon: HiTrendingUp, path: '/app/analytics?tab=productivity' },
        { label: 'Business Analytics', icon: HiChartBar, path: '/app/analytics?tab=business' },
        { label: 'Engagement Analytics', icon: HiSparkles, path: '/app/analytics?tab=engagement' },
        { label: 'Predictive Analytics', icon: HiTrendingUp, path: '/app/analytics?tab=predictive' },
      ]},
      { label: 'AI Assistant', icon: HiSparkles, path: '/app/ai', children: [
        { label: 'AI CEO Insights', icon: HiSparkles, path: '/app/ai?tab=ceo' },
        { label: 'AI Organization Intelligence', icon: HiUserGroup, path: '/app/ai?tab=organization' },
        { label: 'AI Business Intelligence', icon: HiChartBar, path: '/app/ai?tab=business' },
        { label: 'AI Strategic Recommendations', icon: HiTrendingUp, path: '/app/ai?tab=strategy' },
        { label: 'AI Financial Insights', icon: HiChartBar, path: '/app/ai?tab=financial' },
        { label: 'AI Risk Analysis', icon: HiExclamationCircle, path: '/app/ai?tab=risk' },
        { label: 'AI Executive Summary', icon: HiDocumentText, path: '/app/ai?tab=summary' },
        { label: 'Smart Search', icon: HiSearch, path: '/app/search' },
      ]},
      { label: 'Notifications', icon: HiBell, path: '/app/notifications', badge: 'notifications', children: [
        { label: 'Executive Notifications', icon: HiBell, path: '/app/notifications?tab=executive' },
        { label: 'Organization Alerts', icon: HiSpeakerphone, path: '/app/notifications?tab=organization' },
        { label: 'Security Alerts', icon: HiShieldCheck, path: '/app/notifications?tab=security' },
        { label: 'Department Updates', icon: HiOfficeBuilding, path: '/app/notifications?tab=departments' },
        { label: 'Strategic Announcements', icon: HiSpeakerphone, path: '/app/notifications?tab=announcements' },
        { label: 'Critical Business Alerts', icon: HiExclamationCircle, path: '/app/notifications?tab=critical' },
      ]},
      { label: 'Activity Logs', icon: HiClock, path: '/app/audit-log', children: [
        { label: 'Executive Activities', icon: HiUser, path: '/app/audit-log?tab=executive' },
        { label: 'Organization Activities', icon: HiUsers, path: '/app/audit-log?tab=organization' },
        { label: 'Department Activities', icon: HiOfficeBuilding, path: '/app/audit-log?tab=departments' },
        { label: 'Audit Logs', icon: HiClock, path: '/app/audit-log' },
        { label: 'System Logs', icon: HiCog, path: '/app/audit-log?tab=system' },
      ]},
      { label: 'Profile', icon: HiUser, path: '/app/profile', children: [
        { label: 'CEO Profile', icon: HiUser, path: '/app/profile' },
        { label: 'Account Settings', icon: HiCog, path: '/app/settings' },
      ]},
      { label: 'Settings', icon: HiCog, path: '/app/settings', children: [
        { label: 'Organization Settings', icon: HiOfficeBuilding, path: '/app/settings?tab=organization' },
        { label: 'Platform Settings', icon: HiCog, path: '/app/settings?tab=platform' },
        { label: 'Executive Settings', icon: HiUserGroup, path: '/app/settings?tab=executive' },
        { label: 'Security Settings', icon: HiShieldCheck, path: '/app/settings?tab=security' },
        { label: 'Notification Settings', icon: HiBell, path: '/app/settings?tab=notifications' },
        { label: 'Privacy', icon: HiLockClosed, path: '/app/settings?tab=privacy' },
        { label: 'Appearance', icon: HiSparkles, path: '/app/settings?tab=appearance' },
        { label: 'Language', icon: HiGlobeAlt, path: '/app/settings?tab=language' },
      ]},
      { label: 'Help Center', icon: HiQuestionMarkCircle, path: '/app/help', children: [
        { label: 'Documentation', icon: HiDocumentText, path: '/app/help?tab=documentation' },
        { label: 'Support', icon: HiCheckCircle, path: '/app/help?tab=support' },
        { label: 'FAQs', icon: HiQuestionMarkCircle, path: '/app/help?tab=faqs' },
        { label: 'Contact Support', icon: HiPhone, path: '/app/help?tab=contact' },
      ]},
      { label: 'Logout', icon: HiLogout, action: 'logout' },
    ]},
  ],
  employee: [
    { section: 'Menu', hideHeader: true, items: [
      { label: 'Dashboard', icon: HiChartBar, path: '/app/dashboard/employee' },
      { label: 'Home', icon: HiHome, path: '/app/home' },
      { label: 'Meetings', icon: HiVideoCamera, path: '/app/meetings', children: [
        { label: 'My Meetings', icon: HiVideoCamera, path: '/app/meetings' },
        { label: 'Join Meeting', icon: HiLogin, path: '/app/join' },
        { label: 'Meeting History', icon: HiClock, path: '/app/meeting-history' },
        { label: 'My Tasks', icon: HiCheckCircle, path: '/app/tasks' },
      ]},
      { label: 'Calendar', icon: HiCalendar, path: '/app/calendar', children: [
        { label: 'My Calendar', icon: HiCalendar, path: '/app/calendar' },
        { label: 'Team Calendar', icon: HiUserGroup, path: '/app/calendar/team' },
      ]},
      { label: 'Collaboration', icon: HiCollection, path: '/app/collaboration', children: [
        { label: 'Collaboration Hub', icon: HiCollection, path: '/app/collaboration' },
        { label: 'Smart Search', icon: HiSearch, path: '/app/search' },
      ]},
      { label: 'Chat', icon: HiChat, path: '/app/chat' },
      { label: 'Team Directory', icon: HiUsers, path: '/app/team' },
      { label: 'Files', icon: HiFolder, path: '/app/files' },
      { label: 'Whiteboard', icon: HiPencilAlt, path: '/app/whiteboard' },
      { label: 'Meeting Notes', icon: HiBookOpen, path: '/app/meeting-notes' },
      { label: 'Recordings', icon: HiMicrophone, path: '/app/recordings' },
      { label: 'AI Assistant', icon: HiSparkles, path: '/app/ai' },
      { label: 'Profile & Settings', icon: HiCog, path: '/app/profile', children: [
        { label: 'Personal Analytics', icon: HiChartPie, path: '/app/analytics/personal' },
        { label: 'Profile', icon: HiUser, path: '/app/profile' },
        { label: 'Settings', icon: HiCog, path: '/app/settings' },
        { label: 'Help Center', icon: HiQuestionMarkCircle, path: '/app/help' },
        { label: 'Notifications', icon: HiBell, path: '/app/notifications', badge: 'notifications' },
      ]},
    ]},
  ],
};

const dashboardMap = {
  employee: { label: 'Employee', path: '/app/dashboard/employee', color: 'bg-blue-500' },
  host: { label: 'Host', path: '/app/dashboard/host', color: 'bg-green-500' },
  admin: { label: 'Admin', path: '/app/dashboard/admin', color: 'bg-purple-500' },
  hr: { label: 'HR', path: '/app/dashboard/hr', color: 'bg-pink-500' },
  manager: { label: 'Manager', path: '/app/dashboard/manager', color: 'bg-orange-500' },
  executive: { label: 'Executive', path: '/app/dashboard/executive', color: 'bg-indigo-500' },
  ceo: { label: 'CEO', path: '/app/dashboard/ceo', color: 'bg-amber-500' },
};

const Sidebar = memo(function Sidebar() {
  const { sidebarOpen, setSidebarOpen, unreadNotifications } = useApp();
  const { user, logout } = useAuth();
  const location = useLocation();
  const navigate = useNavigate();
  const navRef = useRef(null);
  const [sidebarSearch, setSidebarSearch] = useState('');
  const [expandedModules, setExpandedModules] = useState({});

  const runSidebarSearch = () => {
    const q = sidebarSearch.trim();
    if (!q) return;
    navigate(`/app/search?q=${encodeURIComponent(q)}`);
  };

  const handleKeyDown = useCallback((e) => {
    if (e.key !== 'ArrowDown' && e.key !== 'ArrowUp') return;
    e.preventDefault();
    const links = navRef.current?.querySelectorAll('a[href]');
    if (!links || links.length === 0) return;
    const currentIndex = Array.from(links).indexOf(document.activeElement);
    const nextIndex = e.key === 'ArrowDown'
      ? (currentIndex + 1) % links.length
      : (currentIndex - 1 + links.length) % links.length;
    links[nextIndex]?.focus();
  }, []);

  const filteredMenuItems = useMemo(() => {
    const role = user?.role;
    const customMenu = roleCustomMenu[role];
    if (customMenu) return customMenu;
    const allowedPaths = roleAllowedPaths[role];
    const visibleSections = roleVisibleSections[role];
    if (!role || allowedPaths === undefined || visibleSections === undefined) return [];
    if (visibleSections === null && allowedPaths === null) return menuItems;

    const itemOrder = roleItemOrder[role] || {};
    const baseGroups = menuItems
      .filter(group => visibleSections === null || visibleSections.has(group.section))
      .map(group => {
        let items = allowedPaths === null
          ? group.items
          : group.items.filter(item => allowedPaths.has(item.path));
        const order = itemOrder[group.section];
        if (order) {
          items = [...items].sort((a, b) => {
            const ia = order.indexOf(a.label);
            const ib = order.indexOf(b.label);
            if (ia === -1 && ib === -1) return 0;
            if (ia === -1) return 1;
            if (ib === -1) return -1;
            return ia - ib;
          });
        }
        return { ...group, items };
      })
      .filter(group => group.items.length > 0);

    const menuOrder = roleMenuOrder[role];
    if (!menuOrder) return baseGroups;

    const groups = [...baseGroups];
    const d = dashboardMap[role];
    if (d) groups.push({ section: 'Dashboard', dashboard: true, items: [d] });
    (roleExtraSections[role] || []).forEach(extra => groups.push(extra));

    const orderIndex = {};
    menuOrder.forEach((name, i) => { orderIndex[name] = i; });
    return groups.sort((a, b) => {
      const ia = orderIndex[a.section] ?? Number.MAX_SAFE_INTEGER;
      const ib = orderIndex[b.section] ?? Number.MAX_SAFE_INTEGER;
      return ia - ib;
    });
  }, [user]);

  return (
    <motion.aside
      initial={false}
      animate={{ width: sidebarOpen ? 280 : 72 }}
      aria-label="Main navigation"
      role="navigation"
      className="fixed left-0 top-0 h-screen bg-white dark:bg-slate-900 border-r border-gray-200 dark:border-slate-700 z-40 flex flex-col overflow-hidden"
    >
      <div className="flex items-center justify-between p-4 h-16 border-b border-gray-100 dark:border-slate-700/50">
        {sidebarOpen && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-primary-500 to-primary-700 flex items-center justify-center">
              <span className="text-white font-bold text-sm">C</span>
            </div>
            <span className="font-bold text-lg text-gray-900 dark:text-white">Connectly</span>
          </motion.div>
        )}
        {!sidebarOpen && (
          <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-primary-500 to-primary-700 flex items-center justify-center mx-auto">
            <span className="text-white font-bold text-sm">C</span>
          </div>
        )}
        <button onClick={() => setSidebarOpen(!sidebarOpen)} aria-expanded={sidebarOpen} aria-label={sidebarOpen ? 'Collapse sidebar' : 'Expand sidebar'} className="p-1.5 rounded-lg hover:bg-gray-100 dark:hover:bg-slate-700 transition-colors">
          <HiChevronLeft className={`w-5 h-5 text-gray-500 transition-transform ${!sidebarOpen ? 'rotate-180' : ''}`} />
        </button>
      </div>

      <div ref={navRef} onKeyDown={handleKeyDown} className="flex-1 overflow-y-auto overflow-x-hidden py-4 px-3 space-y-6">
        {sidebarOpen && (
          <div className="relative px-1">
            <HiSearch className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
            <input
              type="text"
              value={sidebarSearch}
              onChange={(e) => setSidebarSearch(e.target.value)}
              onKeyDown={(e) => { if (e.key === 'Enter') runSidebarSearch(); }}
              placeholder="Search..."
              aria-label="Search workspace"
              className="w-full pl-10 pr-4 py-2 text-sm bg-gray-100 dark:bg-slate-700/50 border-0 rounded-xl text-gray-900 dark:text-slate-100 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-primary-500"
            />
          </div>
        )}

        {filteredMenuItems.map((group) => (
          <div key={group.section}>
            {sidebarOpen && !group.hideHeader && <p className="px-3 text-xs font-semibold text-gray-400 dark:text-slate-500 uppercase tracking-wider mb-2">{group.section}</p>}
            <div className="space-y-0.5">
              {group.items.map((item) => {
                if (group.dashboard) {
                  const isActive = location.pathname === item.path;
                  return (
                    <NavLink key={item.path} to={item.path}
                      className={`flex items-center gap-3 px-3 py-2 rounded-xl text-sm font-medium transition-all ${isActive ? 'bg-primary-50 text-primary-700 dark:bg-primary-900/20 dark:text-primary-400' : 'text-gray-600 dark:text-slate-400 hover:bg-gray-50 dark:hover:bg-slate-700/50'}`}>
                      <span className={`w-2 h-2 rounded-full ${item.color}`} />
                      {sidebarOpen && <span className="flex-1 truncate">{item.label} Dashboard</span>}
                    </NavLink>
                  );
                }
                const Icon = item.icon;
                const badge = item.badge === 'notifications' ? unreadNotifications : null;
                const isActive = isPathActive(item.path, location.pathname);
                if (item.action === 'logout') {
                  return (
                    <button
                      key={item.label}
                      type="button"
                      onClick={() => { logout(); navigate('/'); }}
                      aria-label="Logout"
                      className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20 transition-all duration-200"
                    >
                      <Icon className="w-5 h-5 flex-shrink-0" />
                      {sidebarOpen && <span>Logout</span>}
                    </button>
                  );
                }
                if (item.children && sidebarOpen) {
                  const parentExpanded = expandedModules[item.path] ?? isActive;
                  const childActive = item.children.some((c) => isPathActive(c.path, location.pathname));
                  return (
                    <div key={item.path}>
                      <button
                        type="button"
                        onClick={() => setExpandedModules((prev) => ({ ...prev, [item.path]: !parentExpanded }))}
                        aria-expanded={parentExpanded}
                        className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-all duration-200 group ${childActive ? 'bg-primary-50 text-primary-700 dark:bg-primary-900/20 dark:text-primary-400' : 'text-gray-600 dark:text-slate-400 hover:bg-gray-50 dark:hover:bg-slate-700/50 hover:text-gray-900 dark:hover:text-slate-200'}`}>
                        <Icon className="w-5 h-5 flex-shrink-0" />
                        <span className="flex-1 truncate text-left">{item.label}</span>
                        {item.badge === 'notifications' && badge > 0 && <Badge variant="primary" size="sm">{badge}</Badge>}
                        <HiChevronDown className={`w-4 h-4 flex-shrink-0 transition-transform duration-200 ${parentExpanded ? 'rotate-180' : ''}`} />
                      </button>
                      {parentExpanded && (
                        <div className="mt-0.5 space-y-0.5">
                          {item.children.map((child) => {
                            const ChildIcon = child.icon;
                            const childBadge = child.badge === 'notifications' ? unreadNotifications : null;
                            const childIsActive = isPathActive(child.path, location.pathname);
                            return (
                              <NavLink key={`${child.path}|${child.label}`} to={child.path}
                                className={`flex items-center gap-3 pl-9 pr-3 py-2 rounded-xl text-sm font-medium transition-all duration-200 ${childIsActive ? 'bg-primary-50 text-primary-700 dark:bg-primary-900/20 dark:text-primary-400' : 'text-gray-600 dark:text-slate-400 hover:bg-gray-50 dark:hover:bg-slate-700/50 hover:text-gray-900 dark:hover:text-slate-200'}`}>
                                <ChildIcon className="w-4 h-4 flex-shrink-0" />
                                <span className="flex-1 truncate">{child.label}</span>
                                {childBadge > 0 && <Badge variant="primary" size="sm">{childBadge}</Badge>}
                              </NavLink>
                            );
                          })}
                        </div>
                      )}
                    </div>
                  );
                }
                return (
                  <NavLink key={item.path} to={item.path}
                    className={`flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-all duration-200 group ${isActive ? 'bg-primary-50 text-primary-700 dark:bg-primary-900/20 dark:text-primary-400' : 'text-gray-600 dark:text-slate-400 hover:bg-gray-50 dark:hover:bg-slate-700/50 hover:text-gray-900 dark:hover:text-slate-200'}`}>
                    <Icon className="w-5 h-5 flex-shrink-0" />
                    {sidebarOpen && (
                      <>
                        <span className="flex-1 truncate">{item.label}</span>
                        {badge > 0 && <Badge variant="primary" size="sm">{badge}</Badge>}
                      </>
                    )}
                  </NavLink>
                );
              })}
            </div>
          </div>
        ))}

        {sidebarOpen && user && !roleMenuOrder[user.role] && (
          <div>
            <p className="px-3 text-xs font-semibold text-gray-400 dark:text-slate-500 uppercase tracking-wider mb-2">Dashboard</p>
            <div className="space-y-0.5">
              {(() => { const d = dashboardMap[user.role]; return d ? [d] : []; })().map((d) => {
                const isActive = location.pathname === d.path;
                return (
                  <NavLink key={d.path} to={d.path}
                    className={`flex items-center gap-3 px-3 py-2 rounded-xl text-sm font-medium transition-all ${isActive ? 'bg-primary-50 text-primary-700 dark:bg-primary-900/20 dark:text-primary-400' : 'text-gray-600 dark:text-slate-400 hover:bg-gray-50 dark:hover:bg-slate-700/50'}`}>
                    <span className={`w-2 h-2 rounded-full ${d.color}`} />
                    <span>{d.label} Dashboard</span>
                  </NavLink>
                );
              })}
            </div>
          </div>
        )}
      </div>

      <div className="border-t border-gray-100 dark:border-slate-700/50 p-3 space-y-1">
        {sidebarOpen && <ThemeSwitcher variant="sidebar" />}
        {!sidebarOpen && <ThemeSwitcher variant="navbar" />}
        {sidebarOpen && user && (
          <NavLink to="/app/settings" className="flex items-center gap-3 px-3 py-2.5 rounded-xl hover:bg-gray-50 dark:hover:bg-slate-700/50 transition-all">
            <Avatar src={user.avatar} name={user.name} size="sm" status="online" />
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium text-gray-900 dark:text-white truncate">{user.name}</p>
              <p className="text-xs text-gray-500 dark:text-slate-400 truncate">{user.title}</p>
            </div>
          </NavLink>
        )}
        <button onClick={() => { logout(); navigate('/'); }} aria-label="Logout" className="flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20 w-full transition-all">
          <HiLogout className="w-5 h-5" /> {sidebarOpen && <span>Logout</span>}
        </button>
      </div>
    </motion.aside>
  );
});

Sidebar.propTypes = {};

Sidebar.displayName = 'Sidebar';

export { roleCustomMenu };

export default Sidebar;
