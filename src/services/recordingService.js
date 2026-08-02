const recordings = [
  {
    id: 'rec1',
    title: 'Product Strategy Q3 Planning',
    meetingId: 'm2',
    date: '2026-07-30',
    duration: 3600,
    fileSize: 245,
    format: 'mp4',
    url: '/recordings/rec1.mp4',
    thumbnail: 'https://images.unsplash.com/photo-1513542789411-b6a5d4f31634?w=400',
    status: 'ready',
    participants: 5,
  },
  {
    id: 'rec2',
    title: 'Sales Pipeline Review',
    meetingId: 'm5',
    date: '2026-07-29',
    duration: 1800,
    fileSize: 128,
    format: 'mp4',
    url: '/recordings/rec2.mp4',
    thumbnail: 'https://images.unsplash.com/photo-1552664730-d307ca884978?w=400',
    status: 'ready',
    participants: 3,
  },
  {
    id: 'rec3',
    title: 'Q2 Financial Review',
    meetingId: 'm7',
    date: '2026-07-28',
    duration: 3600,
    fileSize: 312,
    format: 'webm',
    url: '/recordings/rec3.webm',
    thumbnail: 'https://images.unsplash.com/photo-1454165804606-c3d57bc86b40?w=400',
    status: 'processing',
    participants: 4,
  },
  {
    id: 'rec4',
    title: 'Architecture Review: Microservices Migration',
    meetingId: 'm9',
    date: '2026-08-03',
    duration: 5400,
    fileSize: 489,
    format: 'mp4',
    url: '/recordings/rec4.mp4',
    thumbnail: 'https://images.unsplash.com/photo-1517245386807-bb43f82c33c4?w=400',
    status: 'ready',
    participants: 5,
  },
];

export async function getRecordings() {
  return { data: recordings };
}

export async function getRecordingById(id) {
  const recording = recordings.find((r) => r.id === id) || null;
  return { data: recording };
}

export async function deleteRecording(id) {
  return { data: { id, deleted: true } };
}

export async function updateRecording(id, data) {
  const recording = recordings.find((r) => r.id === id);
  if (!recording) throw new Error('Recording not found');
  const updated = { ...recording, ...data };
  return { data: updated };
}
