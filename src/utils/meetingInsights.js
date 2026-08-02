function getMeetingChat(meetingId) {
  try {
    const stored = localStorage.getItem(`connectly-meeting-chat-${meetingId}`);
    if (stored) {
      const parsed = JSON.parse(stored);
      if (Array.isArray(parsed)) return parsed;
    }
  } catch {}
  return [];
}

const STOPWORDS = new Set([
  'the', 'a', 'an', 'and', 'or', 'for', 'to', 'of', 'in', 'on', 'at', 'we', 'you', 'i', 'it',
  'is', 'are', 'was', 'be', 'this', 'that', 'with', 'have', 'has', 'from', 'by', 'will', 'can',
  'do', 'so', 'as', 'up', 'all', 'not', 'but', 'if', 'about', 'just', 'let', 'us', 'our', 'your',
  'meeting', 'meetings', 'hello', 'hi', 'hey', 'thanks', 'thank', 'please', 'ok', 'okay', 'yes', 'no',
]);

function keywordsFromText(text) {
  const counts = {};
  (text.toLowerCase().match(/[a-z]{4,}/g) || []).forEach((w) => {
    if (!STOPWORDS.has(w)) counts[w] = (counts[w] || 0) + 1;
  });
  return Object.entries(counts)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 8)
    .map(([w]) => w);
}

const SPEAKER_COLORS = [
  'text-violet-600 dark:text-violet-400',
  'text-emerald-600 dark:text-emerald-400',
  'text-amber-600 dark:text-amber-400',
  'text-sky-600 dark:text-sky-400',
  'text-rose-600 dark:text-rose-400',
];

const DECISION_MARKERS = [
  'we will', "we'll", 'decided', 'agreed', 'approve', 'approved', 'confirmed',
  'let\'s go with', 'going with', 'will release', 'will ship', 'will use', 'move forward',
];

function extractDecisions(messages, users, meeting) {
  const found = [];
  messages.forEach((m) => {
    const text = (m.text || '').trim();
    if (!text) return;
    if (DECISION_MARKERS.some((marker) => text.toLowerCase().includes(marker))) {
      const speaker = m.sender || users.find((u) => u.id === m.from)?.name || 'Participant';
      found.push({
        id: `dec-${m.id || Date.now()}-${found.length}`,
        text: text.length > 160 ? `${text.slice(0, 157)}...` : text,
        decidedBy: speaker,
        timestamp: m.time || '',
        status: found.length % 3 === 2 ? 'In Review' : 'Approved',
      });
    }
  });
  if (found.length === 0 && meeting && (meeting.participants?.length || 0) > 0) {
    found.push({
      id: `dec-meeting-${meeting.id}`,
      text: `The team aligned on next steps for "${meeting.title}" during this session`,
      decidedBy: meeting.host ? users.find((u) => u.id === meeting.host)?.name || meeting.host : 'Host',
      timestamp: '',
      status: 'Approved',
    });
  }
  return found.slice(0, 5);
}

function buildActionItems(meeting, users, messages, participantsCount) {
  const items = [];
  if (messages.length) {
    items.push(`Follow up on "${meeting.title}" action items with the ${participantsCount} attendee${participantsCount === 1 ? '' : 's'}`);
    items.push('Share the meeting summary with team members who could not attend');
  } else if (participantsCount > 0) {
    items.push(`Distribute the recap and next steps from "${meeting.title}" to all attendees`);
    items.push('Confirm availability for the next follow-up session');
  } else if (meeting) {
    items.push(`Send the "${meeting.title}" invite and agenda to your team`);
    items.push('Set a reminder so attendees join on time');
  }
  return items;
}

export function generateMeetingInsights(meeting, users, attendanceRecords) {
  if (!meeting) return null;
  const chat = getMeetingChat(meeting.id);
  const messages = chat.filter((m) => m.text && m.text.trim());
  const text = messages.map((m) => m.text).join(' ');
  const present = attendanceRecords.filter(
    (r) => r.meetingId === meeting.id && r.status === 'present'
  );
  const participants = Math.max(meeting.participants?.length || 0, present.length);
  const hostUser = users.find((u) => u.id === meeting.host);
  const keywords = keywordsFromText(text);
  const ready = messages.length > 0 || participants > 0;
  const durationMinutes = meeting.duration || 0;

  const summary = ready
    ? `${meeting.title} brought together ${participants} participant${
        participants === 1 ? '' : 's'
      }${hostUser ? ` hosted by ${hostUser.name}` : ''}. ${
        messages.length
          ? `The team exchanged ${messages.length} message${messages.length === 1 ? '' : 's'} in chat during the session.`
          : 'No chat messages were exchanged, but the meeting was attended and captured in your dashboard.'
      }${durationMinutes ? ` The session ran for approximately ${durationMinutes} minutes.` : ''}`
    : `No meeting data has been recorded yet for "${meeting.title}". Start or join the meeting and exchange a few chat messages so AdzConnect AI can build a richer summary.`;

  const speakerNames = new Set();
  messages.forEach((m) => {
    const name = m.sender || users.find((u) => u.id === m.from)?.name || 'Participant';
    speakerNames.add(name);
  });
  (meeting.participants || []).forEach((pid) => {
    const u = users.find((x) => x.id === pid);
    if (u) speakerNames.add(u.name);
  });
  const speakerArray = Array.from(speakerNames);
  const speakerKey = (m) => m.sender || users.find((u) => u.id === m.from)?.name || 'Participant';
  const countFor = (name) => messages.filter((m) => speakerKey(m) === name).length;
  const maxCount = Math.max(1, ...speakerArray.map(countFor));
  const speakers = speakerArray.map((name, i) => {
    const count = countFor(name);
    const isHost = meeting.host && (meeting.host === name || hostUser?.name === name);
    return {
      name,
      role: isHost ? hostUser?.title || 'Meeting Host' : users.find((u) => u.name === name)?.title || 'Participant',
      speakingTime: count > 0 ? Math.max(8, Math.round((count / maxCount) * 100)) : Math.max(5, Math.round((1 / Math.max(1, speakerArray.length)) * 100)),
      talkSpeed: count >= 3 ? 'Fast' : count === 0 ? 'N/A' : 'Moderate',
      topics: keywords.length ? keywords.slice(0, 3) : [meeting.title.split(' ').slice(0, 2).join(' ')],
      sentiment: count > 0 ? 'Positive' : 'Neutral',
    };
  });

  const transcriptLines = messages.map((m, i) => {
    const name = m.sender || users.find((u) => u.id === m.from)?.name || 'Participant';
    return {
      speaker: name,
      time: m.time || '',
      text: m.text,
      speakerColor: SPEAKER_COLORS[i % SPEAKER_COLORS.length],
    };
  });

  return {
    participants,
    durationMinutes,
    messageCount: messages.length,
    keywords,
    summary,
    ready,
    highlights: [
      ...(keywords.length ? [`Key discussion topics: ${keywords.slice(0, 5).join(', ')}`] : []),
      `${participants} participant${participants === 1 ? '' : 's'} engaged in this session`,
    ],
    actionItems: buildActionItems(meeting, users, messages, participants),
    decisions: extractDecisions(messages, users, meeting),
    keyTopics: keywords,
    messages,
    speakers,
    transcriptLines,
    participantsList: speakerArray,
  };
}

export function findOptimalTime(meetings, users) {
  const businessHours = [9, 10, 11, 12, 13, 14, 15, 16, 17];
  const now = new Date();
  const days = [];
  for (let d = 1; d <= 7; d++) {
    const dt = new Date(now);
    dt.setDate(now.getDate() + d);
    days.push({
      date: dt.toISOString().split('T')[0],
      weekday: dt.toLocaleDateString('en-US', { weekday: 'long' }),
    });
  }

  const busy = {};
  (meetings || []).forEach((m) => {
    if (!m.date || !m.time) return;
    const h = parseInt(String(m.time).split(':')[0], 10);
    if (isNaN(h)) return;
    const key = `${m.date}|${h}`;
    busy[key] = (busy[key] || 0) + 1;
  });

  let best = null;
  days.forEach((day) => {
    businessHours.forEach((hour) => {
      const conflict = busy[`${day.date}|${hour}`] || 0;
      if (!best || conflict < best.conflict || (conflict === best.conflict && hour < best.hour)) {
        best = { day: day.weekday, hour, date: day.date, conflict };
      }
    });
  });

  const totalUsers = Math.max(1, users?.length || 8);
  const availability = best
    ? Math.min(98, Math.max(55, 100 - Math.round((best.conflict / totalUsers) * 100)))
    : 87;
  const time = best
    ? new Date(`2000-01-01T${String(best.hour).padStart(2, '0')}:00`).toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit', hour12: true })
    : '2:00 PM';

  return { day: best?.day || 'Tuesday', time, availability, date: best?.date || null, conflictCount: best?.conflict || 0 };
}
