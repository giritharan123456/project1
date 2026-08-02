import { describe, it, expect } from 'vitest';
import { roleCustomMenu } from '../../components/navigation/Sidebar';
import { PATH_ROLE_REQUIREMENTS } from '../../components/auth/RoleGuard';

const REQUIRED_EXECUTIVE_MENU = [
  ['Dashboard', ['Overview', 'Executive KPI Cards', 'Organization Performance', 'Notifications', 'Quick Actions', 'AI Insights']],
  ['Home', ['Welcome', 'Recent Activity', 'Executive Announcements', 'Organization Overview']],
  ['Organization Overview', ['Company Overview', 'Business Units', 'Departments', 'Organization Structure', 'Organization Health', 'Company Search']],
  ['Department Management', ['All Departments', 'Department Performance', 'Department Heads', 'Department Comparison', 'Department Status', 'Department Insights']],
  ['Workforce Overview', ['Employees', 'Managers', 'HR Overview', 'Team Distribution', 'Workforce Availability', 'Employee Insights']],
  ['Meetings', ['Executive Meetings', 'Organization Meetings', 'Live Meetings', 'Scheduled Meetings', 'Meeting History', 'Executive Briefings']],
  ['Calendar', ['Executive Calendar', 'Organization Calendar', 'Company Events', 'Board Meetings', 'Holiday Calendar']],
  ['Strategy & Planning', ['Strategic Goals', 'Business Objectives', 'Roadmaps', 'Initiatives', 'Decision Tracking', 'Business Priorities']],
  ['Collaboration', ['Executive Collaboration', 'Leadership Workspace', 'Activity Feed']],
  ['Team Directory', ['Executives', 'Managers', 'Department Heads', 'Employees', 'Contact Information']],
  ['Chat', ['Executive Chat', 'Leadership Channels', 'Direct Messages', 'Group Discussions']],
  ['Files', ['Executive Files', 'Shared Documents', 'Board Documents', 'Downloads', 'Document Library']],
  ['Whiteboard', ['Strategy Boards', 'Executive Boards', 'Shared Boards', 'Templates']],
  ['Meeting Notes', ['Executive Notes', 'Leadership Notes', 'AI Notes']],
  ['Recordings', ['Executive Recordings', 'Organization Recordings', 'Recording Library', 'Recording Player']],
  ['Reports', ['Executive Reports', 'Organization Reports', 'Department Reports', 'Financial Reports', 'Performance Reports', 'Strategic Reports']],
  ['Analytics', ['Organization Analytics', 'Executive Analytics', 'Department Analytics', 'Workforce Analytics', 'Productivity Analytics', 'Engagement Analytics']],
  ['AI Assistant', ['AI Executive Insights', 'AI Organization Summary', 'AI Business Intelligence', 'AI Decision Support', 'AI Recommendations', 'Smart Search']],
  ['Notifications', ['Executive Notifications', 'Organization Alerts', 'Meeting Alerts', 'Department Updates', 'Strategic Announcements']],
  ['Activity Logs', ['Executive Activities', 'Organization Activities', 'Department Activities', 'Audit History']],
  ['Profile', ['Executive Profile', 'Account Settings']],
  ['Settings', ['Executive Settings', 'Organization Settings', 'Notification Settings', 'Privacy', 'Security', 'Appearance', 'Language']],
  ['Help Center', ['Documentation', 'Support', 'FAQs', 'Contact Support']],
  ['Logout', []],
];

function executiveCanAccess(path) {
  const requirements = Object.entries(PATH_ROLE_REQUIREMENTS).sort((a, b) => b[0].length - a[0].length);
  for (const [routePath, allowedRoles] of requirements) {
    if (path === routePath || path.startsWith(`${routePath}/`)) {
      return allowedRoles.includes('executive');
    }
  }
  return true;
}

describe('Executive menu format', () => {
  const executiveMenu = roleCustomMenu.executive[0].items;
  const headingLabels = executiveMenu.map((item) => item.label);

  it('has exactly the 24 required headings in order', () => {
    expect(headingLabels).toEqual(REQUIRED_EXECUTIVE_MENU.map(([heading]) => heading));
  });

  it('has exactly the required subheadings under each heading in order', () => {
    REQUIRED_EXECUTIVE_MENU.forEach(([heading, subheadings], i) => {
      const item = executiveMenu[i];
      const childrenLabels = item.children ? item.children.map((c) => c.label) : [];
      expect(childrenLabels, `subheadings of "${heading}"`).toEqual(subheadings);
    });
  });

  it('lets the executive role access every heading and subheading path', () => {
    executiveMenu.forEach((item) => {
      if (item.action) return;
      expect(executiveCanAccess(item.path), `parent "${item.label}" (${item.path})`).toBe(true);
      (item.children || []).forEach((child) => {
        expect(executiveCanAccess(child.path), `"${item.label}" > "${child.label}" (${child.path})`).toBe(true);
      });
    });
  });

  it('keeps the executive custom menu (so no duplicate Dashboard section renders)', () => {
    expect(headingLabels).not.toContain('Executive Dashboard');
  });
});
