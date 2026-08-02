import { describe, it, expect } from 'vitest';
import { roleCustomMenu } from '../../components/navigation/Sidebar';
import { PATH_ROLE_REQUIREMENTS } from '../../components/auth/RoleGuard';

const REQUIRED_MANAGER_MENU = [
  ['Dashboard', ['Overview', 'Team KPI Cards', 'Team Performance', 'Notifications', 'Quick Actions', 'AI Insights']],
  ['Home', ['Welcome', 'Recent Activity', 'Team Announcements', 'Department Overview']],
  ['Team Management', ['My Team', 'Team Members', 'Team Availability', 'Team Profiles', 'Team Hierarchy', 'Search Team Members']],
  ['Employee Management', ['Assigned Employees', 'Employee Performance', 'Attendance Status', 'Leave Requests', 'Task Assignments', 'Employee Progress']],
  ['Meetings', ['Team Meetings', 'Live Meetings', 'Scheduled Meetings', 'Meeting History', 'Meeting Invitations', 'Meeting Templates']],
  ['Calendar', ['Team Calendar', 'Department Calendar', 'Meeting Schedule', 'Events', 'Holidays']],
  ['Task Management', ['Assigned Tasks', 'Pending Tasks', 'Completed Tasks', 'Team Workload', 'Deadlines', 'Task Progress']],
  ['Collaboration', ['Team Collaboration', 'Shared Workspace', 'Activity Feed']],
  ['Team Directory', ['Team Members', 'Departments', 'Managers', 'Online Members', 'Contact Information']],
  ['Chat', ['Team Chat', 'Direct Messages', 'Department Channels', 'Group Chat']],
  ['Files', ['Team Files', 'Shared Files', 'Uploads', 'Downloads', 'Document Library']],
  ['Whiteboard', ['Team Boards', 'Shared Boards', 'Templates']],
  ['Meeting Notes', ['Team Notes', 'Shared Notes', 'AI Notes']],
  ['Recordings', ['Team Recordings', 'Meeting Recordings', 'Recording Player', 'Recording Settings']],
  ['Reports', ['Team Reports', 'Attendance Reports', 'Task Reports', 'Meeting Reports', 'Productivity Reports', 'Department Reports']],
  ['Analytics', ['Team Analytics', 'Employee Analytics', 'Attendance Analytics', 'Productivity Analytics', 'Meeting Analytics', 'Performance Analytics']],
  ['AI Assistant', ['AI Team Insights', 'AI Productivity Analysis', 'AI Meeting Summary', 'AI Action Items', 'AI Recommendations', 'Smart Search']],
  ['Notifications', ['Team Notifications', 'Meeting Alerts', 'Task Alerts', 'Leave Notifications', 'Department Announcements']],
  ['Activity Logs', ['Team Activities', 'Employee Activities', 'Meeting Activities', 'Task History']],
  ['Profile', ['Manager Profile', 'Account Settings']],
  ['Settings', ['Team Settings', 'Notification Settings', 'Privacy', 'Security', 'Appearance', 'Language']],
  ['Help Center', ['Documentation', 'Support', 'FAQs', 'Contact Support']],
  ['Logout', []],
];

function managerCanAccess(path) {
  const requirements = Object.entries(PATH_ROLE_REQUIREMENTS).sort((a, b) => b[0].length - a[0].length);
  for (const [routePath, allowedRoles] of requirements) {
    if (path === routePath || path.startsWith(`${routePath}/`)) {
      return allowedRoles.includes('manager');
    }
  }
  return true;
}

describe('Manager menu format', () => {
  const managerMenu = roleCustomMenu.manager[0].items;
  const headingLabels = managerMenu.map((item) => item.label);

  it('has exactly the 23 required headings in order', () => {
    expect(headingLabels).toEqual(REQUIRED_MANAGER_MENU.map(([heading]) => heading));
  });

  it('has exactly the required subheadings under each heading in order', () => {
    REQUIRED_MANAGER_MENU.forEach(([heading, subheadings], i) => {
      const item = managerMenu[i];
      const childrenLabels = item.children ? item.children.map((c) => c.label) : [];
      expect(childrenLabels, `subheadings of "${heading}"`).toEqual(subheadings);
    });
  });

  it('lets the manager role access every heading and subheading path', () => {
    managerMenu.forEach((item) => {
      if (item.action) return;
      expect(managerCanAccess(item.path), `parent "${item.label}" (${item.path})`).toBe(true);
      (item.children || []).forEach((child) => {
        expect(managerCanAccess(child.path), `"${item.label}" > "${child.label}" (${child.path})`).toBe(true);
      });
    });
  });

  it('keeps the manager custom menu (so no duplicate Dashboard section renders)', () => {
    expect(headingLabels).not.toContain('Manager Dashboard');
  });
});
