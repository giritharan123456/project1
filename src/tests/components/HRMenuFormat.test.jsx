import { describe, it, expect } from 'vitest';
import { roleCustomMenu } from '../../components/navigation/Sidebar';
import { PATH_ROLE_REQUIREMENTS } from '../../components/auth/RoleGuard';

const REQUIRED_HR_MENU = [
  ['Dashboard', ['Overview', 'HR KPI Cards', "Today's Priorities", 'Notifications', 'Quick Actions', 'AI Insights']],
  ['Home', ['Welcome', 'Recent Activity', 'Organization Overview', 'Announcements']],
  ['Employee Directory', ['Employees', 'Departments', 'Teams', 'Employee Profiles', 'Search']],
  ['Attendance', ['Daily', 'Weekly', 'Monthly', 'Leave Requests', 'Late Arrivals', 'Absent Employees']],
  ['Meetings', ['Organization Meetings', 'Department Meetings', 'Participation', 'Meeting History']],
  ['Calendar', ['Company Calendar', 'Events', 'Holidays', 'Team Calendar']],
  ['Recruitment & Onboarding', ['Candidates', 'Verification', 'New Joiners', 'Orientation']],
  ['Team Management', []],
  ['Communication', []],
  ['Chat', []],
  ['Files & Documents', []],
  ['Performance & Engagement', []],
  ['Reports', []],
  ['Analytics', []],
  ['AI Assistant', []],
  ['Notifications', []],
  ['Activity History', []],
  ['Search', []],
  ['Profile', []],
  ['Settings', []],
  ['Help', []],
  ['Logout', []],
];

function hrCanAccess(path) {
  const requirements = Object.entries(PATH_ROLE_REQUIREMENTS).sort((a, b) => b[0].length - a[0].length);
  for (const [routePath, allowedRoles] of requirements) {
    if (path === routePath || path.startsWith(`${routePath}/`)) {
      return allowedRoles.includes('hr');
    }
  }
  return true;
}

describe('HR menu format', () => {
  const hrMenu = roleCustomMenu.hr[0].items;
  const headingLabels = hrMenu.map((item) => item.label);

  it('has exactly the 22 required headings in order', () => {
    expect(headingLabels).toEqual(REQUIRED_HR_MENU.map(([heading]) => heading));
  });

  it('has exactly the required subheadings under each heading in order', () => {
    REQUIRED_HR_MENU.forEach(([heading, subheadings], i) => {
      const item = hrMenu[i];
      const childrenLabels = item.children ? item.children.map((c) => c.label) : [];
      expect(childrenLabels, `subheadings of "${heading}"`).toEqual(subheadings);
    });
  });

  it('lets the hr role access every subheading path', () => {
    hrMenu.forEach((item) => {
      if (item.action) return;
      expect(hrCanAccess(item.path), `parent "${item.label}" (${item.path})`).toBe(true);
      (item.children || []).forEach((child) => {
        expect(hrCanAccess(child.path), `"${item.label}" > "${child.label}" (${child.path})`).toBe(true);
      });
    });
  });

  it('keeps the hr custom menu (so no duplicate Dashboard section renders)', () => {
    expect(headingLabels).not.toContain('HR Dashboard');
  });
});
