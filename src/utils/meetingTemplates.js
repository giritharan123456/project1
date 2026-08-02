const STORAGE_KEY = 'connectly-meeting-templates';

export function loadTemplates() {
  try {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (stored) return JSON.parse(stored);
  } catch {}
  return [];
}

export function saveTemplate(template) {
  const templates = loadTemplates();
  const id = template.id || `tpl${Date.now()}`;
  const next = [{ ...template, id, createdAt: new Date().toISOString() }, ...templates];
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(next));
  } catch {}
  return next;
}

export function deleteTemplate(id) {
  const next = loadTemplates().filter((t) => t.id !== id);
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(next));
  } catch {}
  return next;
}
