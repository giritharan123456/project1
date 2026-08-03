// Imports the existing frontend demo data (users, meetings, notifications, messages)
// into MySQL so the app has the same data it shipped with, but from a real database.
// Usage: npm run seed  (after npm run migrate)
const bcrypt = require('bcryptjs');
const { randomUUID: uuidv4 } = require('crypto');
const { pool } = require('../src/config/db');

const users = require('../src/data/users.json');
const meetings = require('../src/data/meetings.json');
const notifications = require('../src/data/notifications.json');
const messages = require('../src/data/messages.json');

const DEFAULT_PASSWORD = 'Connectly@123'; // demo password for every seeded user

// The frontend's demo JSON uses a couple of status labels ('completed',
// 'pending_approval') that aren't in the meetings.status ENUM in schema.sql
// ('upcoming','live','ended','cancelled'). Map them so the seed doesn't reject rows.
function mapMeetingStatus(status) {
  const map = { completed: 'ended', pending_approval: 'upcoming' };
  return map[status] || status || 'upcoming';
}

// MySQL TIMESTAMP columns reject ISO 8601 strings like '2026-07-30T08:45:00Z'
// under strict mode. Convert to 'YYYY-MM-DD HH:MM:SS' (UTC) before inserting.
function toMySQLDatetime(isoString) {
  if (!isoString) return null;
  return new Date(isoString).toISOString().slice(0, 19).replace('T', ' ');
}

async function seedUsers(conn) {
  console.log(`Seeding ${users.length} users ...`);
  const passwordHash = await bcrypt.hash(DEFAULT_PASSWORD, 10);
  for (const u of users) {
    await conn.query(
      `INSERT INTO users
        (id, name, email, password_hash, avatar, role, department, title, status,
         timezone, phone, location, bio, skills, meetings_hosted, meetings_attended,
         is_verified, joined)
       VALUES (?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,1,?)
       ON DUPLICATE KEY UPDATE name=VALUES(name)`,
      [
        u.id, u.name, u.email, passwordHash, u.avatar || null, u.role || 'employee',
        u.department || null, u.title || null, u.status || 'offline', u.timezone || null,
        u.phone || null, u.location || null, u.bio || null, JSON.stringify(u.skills || []),
        u.meetingsHosted || 0, u.meetingsAttended || 0, u.joined || null,
      ]
    );
  }
}

async function seedMeetings(conn) {
  console.log(`Seeding ${meetings.length} meetings ...`);
  for (const m of meetings) {
    await conn.query(
      `INSERT INTO meetings
        (id, title, type, meeting_date, meeting_time, duration, host_id, status,
         password, recording, description, meeting_code, join_url, background)
       VALUES (?,?,?,?,?,?,?,?,?,?,?,?,?,?)
       ON DUPLICATE KEY UPDATE title=VALUES(title)`,
      [
        m.id, m.title, m.type || 'scheduled', m.date, m.time || '00:00', m.duration || 30,
        m.host, mapMeetingStatus(m.status), m.password || null, m.recording ? 1 : 0,
        m.description || null, m.meetingId || m.id, m.joinUrl || null, m.background || null,
      ]
    );

    const participants = m.participants || [];
    for (const pid of participants) {
      const meta = (m.participantMeta && m.participantMeta[pid]) || {};
      const perms = meta.permissions || {};
      await conn.query(
        `INSERT IGNORE INTO meeting_participants
          (id, meeting_id, user_id, co_host, perm_mic, perm_video, perm_chat, perm_screen)
         VALUES (?,?,?,?,?,?,?,?)`,
        [
          uuidv4(), m.id, pid, meta.coHost ? 1 : 0,
          perms.mic !== false ? 1 : 0, perms.video !== false ? 1 : 0,
          perms.chat !== false ? 1 : 0, perms.screenShare ? 1 : 0,
        ]
      );
    }
  }
}

async function seedNotifications(conn) {
  console.log(`Seeding ${notifications.length} notifications ...`);
  for (const n of notifications) {
    await conn.query(
      `INSERT INTO notifications (id, user_id, type, priority, title, description, link, is_read, created_at)
       VALUES (?,?,?,?,?,?,?,?,?)
       ON DUPLICATE KEY UPDATE title=VALUES(title)`,
      [n.id, n.userId, n.type, n.priority || 'info', n.title, n.description || null, n.link || null, n.read ? 1 : 0, toMySQLDatetime(n.time)]
    );
  }
}

async function seedMessages(conn) {
  console.log(`Seeding ${messages.length} messages ...`);
  for (const m of messages) {
    await conn.query(
      `INSERT INTO messages (id, from_user_id, to_user_id, text, msg_type, reply_to, is_read, is_pinned, created_at)
       VALUES (?,?,?,?,?,?,?,?,?)
       ON DUPLICATE KEY UPDATE text=VALUES(text)`,
      [m.id, m.from, m.to || null, m.text, m.type || 'direct', m.replyTo || null, m.read ? 1 : 0, m.pinned ? 1 : 0, toMySQLDatetime(m.timestamp)]
    );
  }
}

async function run() {
  const conn = await pool.getConnection();
  try {
    await conn.query('SET FOREIGN_KEY_CHECKS=0');
    await seedUsers(conn);
    await seedMeetings(conn);
    await seedNotifications(conn);
    await seedMessages(conn);
    await conn.query('SET FOREIGN_KEY_CHECKS=1');
    console.log('\nSeed complete.');
    console.log(`Every seeded user's demo password is: ${DEFAULT_PASSWORD}`);
  } finally {
    conn.release();
  }
}

run()
  .then(() => process.exit(0))
  .catch((err) => {
    console.error('Seed failed:', err);
    process.exit(1);
  });
