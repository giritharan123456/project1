const { randomUUID } = require('crypto');
const { pool } = require('../config/db');

async function attachParticipants(meetings) {
  if (!meetings.length) return meetings;
  const ids = meetings.map((m) => m.id);
  const [rows] = await pool.query(
    `SELECT * FROM meeting_participants WHERE meeting_id IN (?)`,
    [ids]
  );
  const byMeeting = {};
  for (const r of rows) {
    if (!byMeeting[r.meeting_id]) byMeeting[r.meeting_id] = [];
    byMeeting[r.meeting_id].push({
      userId: r.user_id,
      coHost: !!r.co_host,
      permissions: {
        mic: !!r.perm_mic, video: !!r.perm_video, chat: !!r.perm_chat, screenShare: !!r.perm_screen,
      },
    });
  }
  return meetings.map((m) => ({ ...m, participants: byMeeting[m.id] || [] }));
}

async function getMeetings(req, res, next) {
  try {
    const [rows] = await pool.query('SELECT * FROM meetings ORDER BY meeting_date DESC, meeting_time DESC');
    const data = await attachParticipants(rows);
    res.json({ data });
  } catch (err) { next(err); }
}

async function getMeetingById(req, res, next) {
  try {
    const [rows] = await pool.query('SELECT * FROM meetings WHERE id = ?', [req.params.id]);
    if (!rows[0]) return res.json({ data: null });
    const [data] = await attachParticipants(rows);
    res.json({ data });
  } catch (err) { next(err); }
}

async function createMeeting(req, res, next) {
  try {
    const {
      title, type = 'scheduled', date, time = '00:00', duration = 30,
      hostId, password, recording, description, participants = [],
    } = req.body;

    if (!title || !date || !hostId) {
      return res.status(400).json({ message: 'title, date and hostId are required' });
    }

    const id = randomUUID();
    const meetingCode = `con-${Math.random().toString(36).slice(2, 6)}-${Math.random().toString(36).slice(2, 5)}`;
    const joinUrl = `${req.protocol}://${req.get('host')}/join/${meetingCode}`;

    await pool.query(
      `INSERT INTO meetings
        (id, title, type, meeting_date, meeting_time, duration, host_id, status,
         password, recording, description, meeting_code, join_url)
       VALUES (?,?,?,?,?,?,?,?,?,?,?,?,?)`,
      [id, title, type, date, time, duration, hostId, 'upcoming', password || null,
        recording ? 1 : 0, description || null, meetingCode, joinUrl]
    );

    for (const p of participants) {
      const userId = typeof p === 'string' ? p : p.userId;
      const perms = (typeof p === 'object' && p.permissions) || {};
      await pool.query(
        `INSERT INTO meeting_participants (id, meeting_id, user_id, co_host, perm_mic, perm_video, perm_chat, perm_screen)
         VALUES (?,?,?,?,?,?,?,?)`,
        [randomUUID(), id, userId, p.coHost ? 1 : 0, perms.mic !== false ? 1 : 0,
          perms.video !== false ? 1 : 0, perms.chat !== false ? 1 : 0, perms.screenShare ? 1 : 0]
      );
    }

    const [rows] = await pool.query('SELECT * FROM meetings WHERE id = ?', [id]);
    const [data] = await attachParticipants(rows);
    res.status(201).json({ data });
  } catch (err) { next(err); }
}

async function updateMeeting(req, res, next) {
  try {
    const allowed = ['title', 'type', 'duration', 'status', 'password', 'recording', 'description', 'background'];
    const updates = [];
    const values = [];
    for (const key of allowed) {
      if (req.body[key] !== undefined) {
        updates.push(`${key} = ?`);
        values.push(key === 'recording' ? (req.body[key] ? 1 : 0) : req.body[key]);
      }
    }
    if (req.body.date) { updates.push('meeting_date = ?'); values.push(req.body.date); }
    if (req.body.time) { updates.push('meeting_time = ?'); values.push(req.body.time); }
    if (!updates.length) return res.status(400).json({ message: 'No valid fields to update' });

    values.push(req.params.id);
    const [result] = await pool.query(`UPDATE meetings SET ${updates.join(', ')} WHERE id = ?`, values);
    if (!result.affectedRows) return res.status(404).json({ message: 'Meeting not found' });

    const [rows] = await pool.query('SELECT * FROM meetings WHERE id = ?', [req.params.id]);
    const [data] = await attachParticipants(rows);
    res.json({ data });
  } catch (err) { next(err); }
}

async function deleteMeeting(req, res, next) {
  try {
    const [result] = await pool.query('DELETE FROM meetings WHERE id = ?', [req.params.id]);
    if (!result.affectedRows) return res.status(404).json({ message: 'Meeting not found' });
    res.json({ data: { id: req.params.id, deleted: true } });
  } catch (err) { next(err); }
}

module.exports = { getMeetings, getMeetingById, createMeeting, updateMeeting, deleteMeeting };
