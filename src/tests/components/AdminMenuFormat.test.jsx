import { describe, it, expect } from 'vitest';
import { roleCustomMenu } from '../../components/navigation/Sidebar';
import { PATH_ROLE_REQUIREMENTS } from '../../components/auth/RoleGuard';

const REQUIRED_ADMIN_MENU = [
  ['Dashboard', ['Overview', 'Organization KPI Cards', 'System Status', 'Notifications', 'Quick Actions', 'AI Insights']],
  ['Home', ['Welcome', 'Recent Activity', 'Organization Announcements', 'Platform Overview']],
  ['User Management', ['All Users', 'Active Users', 'New Registrations', 'Pending Approvals', 'Suspended Users', 'Blocked Users', 'User Profiles', 'User Search']],
  ['Role Management', ['Employee Roles', 'Host Roles', 'HR Roles', 'Manager Roles', 'Executive Roles', 'CEO Access', 'Assign Roles', 'Role Permissions']],
  ['Department Management', ['Departments', 'Teams', 'Department Heads', 'Organization Structure', 'Department Settings']],
  ['Meeting Management', ['Live Meetings', 'Scheduled Meetings', 'Meeting History', 'Meeting Templates', 'Meeting Policies', 'Organization Meetings']],
  ['Calendar', ['Organization Calendar', 'Company Events', 'Department Calendar', 'Meeting Schedule', 'Holiday Calendar']],
  ['Security & Access', ['Login History', 'Access Logs', 'Device Sessions', 'Trusted Devices', 'Two Factor Authentication', 'Verification Requests', 'Privacy Settings']],
  ['Collaboration', ['Shared Workspace', 'Team Collaboration', 'Activity Feed']],
  ['Team Directory', ['Employees', 'Departments', 'Managers', 'Online Users', 'Contact Information']],
  ['Chat', ['Direct Messages', 'Team Channels', 'Organization Chat', 'Group Chat']],
  ['Files', ['Organization Files', 'Shared Files', 'Uploads', 'Downloads', 'Storage Management']],
  ['Recordings', ['Recording Library', 'Organization Recordings', 'Recording Settings', 'Recording Management']],
  ['Whiteboard', ['Organization Boards', 'Shared Boards', 'Templates']],
  ['Meeting Notes', ['Organization Notes', 'Shared Notes', 'AI Notes']],
  ['AI Assistant', ['AI Organization Insights', 'AI Meeting Summary', 'AI Analytics', 'AI User Insights', 'AI Recommendations', 'Smart Search']],
  ['Reports', ['User Reports', 'Meeting Reports', 'Attendance Reports', 'Department Reports', 'Security Reports', 'Activity Reports', 'Platform Reports']],
  ['Analytics', ['Organization Analytics', 'User Analytics', 'Meeting Analytics', 'Department Analytics', 'Engagement Analytics', 'System Analytics']],
  ['Notifications', ['User Notifications', 'Security Alerts', 'Meeting Alerts', 'Organization Announcements']],
  ['Activity Logs', ['User Activities', 'Login Activities', 'System Logs', 'Audit Logs']],
  ['Profile', ['Admin Profile', 'Account Settings']],
  ['Settings', ['Platform Settings', 'Organization Settings', 'Security Settings', 'Notification Settings', 'Appearance', 'Language']],
  ['Help Center', ['Documentation', 'Support', 'FAQs', 'Contact Support']],
  ['Logout', []],
];

function adminCanAccess(path) {
  const requirements = Object.entries(PATH_ROLE_REQUIREMENTS).sort((a, b) => b[0].length - a[0].length);
  for (const [routePath, allowedRoles] of requirements) {
    if (path === routePath || path.startsWith(`${routePath}/`)) {
      return allowedRoles.includes('admin');
    }
  }
  return true;
}

describe('Admin menu format', () => {
  const adminMenu = roleCustomMenu.admin[0].items;
  const headingLabels = adminMenu.map((item) => item.label);

  it('has exactly the 24 required headings in order', () => {
    expect(headingLabels).toEqual(REQUIRED_ADMIN_MENU.map(([heading]) => heading));
  });

  it('has exactly the required subheadings under each heading in order', () => {
    REQUIRED_ADMIN_MENU.forEach(([heading, subheadings], i) => {
      const item = adminMenu[i];
      const childrenLabels = item.children ? item.children.map((c) => c.label) : [];
      expect(childrenLabels, `subheadings of "${heading}"`).toEqual(subheadings);
    });
  });

  it('lets the admin role access every heading and subheading path', () => {
    adminMenu.forEach((item) => {
      if (item.action) return;
      expect(adminCanAccess(item.path), `parent "${item.label}" (${item.path})`).toBe(true);
      (item.children || []).forEach((child) => {
        expect(adminCanAccess(child.path), `"${item.label}" > "${child.label}" (${child.path})`).toBe(true);
      });
    });
  });

  it('keeps the admin custom menu (so no duplicate Dashboard section renders)', () => {
    expect(headingLabels).not.toContain('Admin Dashboard');
  });
});
