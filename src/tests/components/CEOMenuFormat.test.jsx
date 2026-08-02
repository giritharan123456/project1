import { describe, it, expect } from 'vitest';
import { roleCustomMenu } from '../../components/navigation/Sidebar';
import { PATH_ROLE_REQUIREMENTS } from '../../components/auth/RoleGuard';

const REQUIRED_CEO_MENU = [
  ['Dashboard', ['Overview', 'Company KPI Cards', 'Organization Health', 'Notifications', 'Quick Actions', 'AI Executive Insights']],
  ['Home', ['Welcome', 'Recent Activity', 'CEO Announcements', 'Company Overview']],
  ['Organization Overview', ['Company Overview', 'Organization Structure', 'Business Units', 'Global Operations', 'Organization Health', 'Company Search']],
  ['Executive Management', ['Executive Team', 'Executive Performance', 'Leadership Hierarchy', 'Executive Responsibilities', 'Executive Meetings', 'Leadership Insights']],
  ['Department Overview', ['All Departments', 'Department Performance', 'Department Comparison', 'Department Heads', 'Department Health', 'Department KPIs']],
  ['Workforce Overview', ['Total Employees', 'Workforce Distribution', 'Managers', 'HR Overview', 'Employee Engagement', 'Workforce Analytics']],
  ['Meetings', ['CEO Meetings', 'Executive Meetings', 'Board Meetings', 'Organization Meetings', 'Live Meetings', 'Meeting History']],
  ['Calendar', ['CEO Calendar', 'Executive Calendar', 'Organization Calendar', 'Board Schedule', 'Company Events', 'Holiday Calendar']],
  ['Business Strategy', ['Strategic Goals', 'Business Objectives', 'Growth Strategy', 'Company Roadmap', 'Investments', 'Decision Center']],
  ['Collaboration', ['Executive Collaboration', 'Leadership Workspace', 'Organization Collaboration', 'Activity Feed']],
  ['Team Directory', ['Executives', 'Managers', 'Department Heads', 'Employees', 'Contact Information']],
  ['Chat', ['Executive Chat', 'Leadership Channels', 'Direct Messages', 'Organization Discussions']],
  ['Files', ['Executive Files', 'Strategic Documents', 'Board Documents', 'Shared Documents', 'Downloads', 'Document Library']],
  ['Whiteboard', ['Strategy Boards', 'Executive Boards', 'Shared Boards', 'Business Planning Templates']],
  ['Meeting Notes', ['CEO Notes', 'Executive Notes', 'Board Notes', 'AI Notes']],
  ['Recordings', ['CEO Recordings', 'Executive Recordings', 'Board Meeting Recordings', 'Recording Library', 'Recording Player']],
  ['Reports', ['Executive Reports', 'Organization Reports', 'Department Reports', 'Financial Reports', 'Revenue Reports', 'Growth Reports', 'Performance Reports', 'Strategic Reports', 'Board Reports']],
  ['Analytics', ['Organization Analytics', 'Executive Analytics', 'Financial Analytics', 'Revenue Analytics', 'Workforce Analytics', 'Productivity Analytics', 'Business Analytics', 'Engagement Analytics', 'Predictive Analytics']],
  ['AI Assistant', ['AI CEO Insights', 'AI Organization Intelligence', 'AI Business Intelligence', 'AI Strategic Recommendations', 'AI Financial Insights', 'AI Risk Analysis', 'AI Executive Summary', 'Smart Search']],
  ['Notifications', ['Executive Notifications', 'Organization Alerts', 'Security Alerts', 'Department Updates', 'Strategic Announcements', 'Critical Business Alerts']],
  ['Activity Logs', ['Executive Activities', 'Organization Activities', 'Department Activities', 'Audit Logs', 'System Logs']],
  ['Profile', ['CEO Profile', 'Account Settings']],
  ['Settings', ['Organization Settings', 'Platform Settings', 'Executive Settings', 'Security Settings', 'Notification Settings', 'Privacy', 'Appearance', 'Language']],
  ['Help Center', ['Documentation', 'Support', 'FAQs', 'Contact Support']],
  ['Logout', []],
];

function ceoCanAccess(path) {
  const requirements = Object.entries(PATH_ROLE_REQUIREMENTS).sort((a, b) => b[0].length - a[0].length);
  for (const [routePath, allowedRoles] of requirements) {
    if (path === routePath || path.startsWith(`${routePath}/`)) {
      return allowedRoles.includes('ceo');
    }
  }
  return true;
}

describe('CEO menu format', () => {
  const ceoMenu = roleCustomMenu.ceo[0].items;
  const headingLabels = ceoMenu.map((item) => item.label);

  it('has exactly the 25 required headings in order', () => {
    expect(headingLabels).toEqual(REQUIRED_CEO_MENU.map(([heading]) => heading));
  });

  it('has exactly the required subheadings under each heading in order', () => {
    REQUIRED_CEO_MENU.forEach(([heading, subheadings], i) => {
      const item = ceoMenu[i];
      const childrenLabels = item.children ? item.children.map((c) => c.label) : [];
      expect(childrenLabels, `subheadings of "${heading}"`).toEqual(subheadings);
    });
  });

  it('lets the ceo role access every heading and subheading path', () => {
    ceoMenu.forEach((item) => {
      if (item.action) return;
      expect(ceoCanAccess(item.path), `parent "${item.label}" (${item.path})`).toBe(true);
      (item.children || []).forEach((child) => {
        expect(ceoCanAccess(child.path), `"${item.label}" > "${child.label}" (${child.path})`).toBe(true);
      });
    });
  });

  it('keeps the ceo custom menu (so no duplicate Dashboard section renders)', () => {
    expect(headingLabels).not.toContain('CEO Dashboard');
  });
});
