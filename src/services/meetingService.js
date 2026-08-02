import meetings from '../data/meetings.json';

export async function getMeetings() {
  return { data: meetings };
}

export async function getMeetingById(id) {
  const meeting = meetings.find((m) => m.id === id) || null;
  return { data: meeting };
}

export async function createMeeting(data) {
  const newMeeting = { id: `m${Date.now()}`, ...data };
  return { data: newMeeting };
}

export async function updateMeeting(id, data) {
  const meeting = meetings.find((m) => m.id === id);
  if (!meeting) throw new Error('Meeting not found');
  const updated = { ...meeting, ...data };
  return { data: updated };
}

export async function deleteMeeting(id) {
  return { data: { id, deleted: true } };
}
