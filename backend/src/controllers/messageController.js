const { randomUUID } = require('crypto');
const { pool } = require('../config/db');

// GET /api/messages?with=<userId>  -> direct-message thread between the caller and :with
// GET /api/messages?channel=<channelId> -> channel/group thread
async function getMessages(req, res, next) {
  try {
    const selfId = req.user?.sub;
    const { with: withUser, channel } = req.query;

    let rows;
    if (channel) {
      [rows] = await pool.query(
        'SELECT * FROM messages WHERE channel_id = ? ORDER BY created_at ASC',
        [channel]
      );
    } else if (withUser) {
      [rows] = await pool.query(
        `SELECT * FROM messages
         WHERE (from_user_id = ? AND to_user_id = ?) OR (from_user_id = ? AND to_user_id = ?)
         ORDER BY created_at ASC`,
        [selfId, withUser, withUser, selfId]
      );
    } else {
      [rows] = await pool.query(
        'SELECT * FROM messages WHERE from_user_id = ? OR to_user_id = ? ORDER BY created_at DESC LIMIT 100',
        [selfId, selfId]
      );
    }
    res.json({ data: rows });
  } catch (err) { next(err); }
}

async function createMessage(req, res, next) {
  try {
    const fromUserId = req.user?.sub;
    const { to, channel, text, replyTo } = req.body;
    if (!text || (!to && !channel)) {
      return res.status(400).json({ message: 'text and either "to" or "channel" are required' });
    }

    const id = randomUUID();
    await pool.query(
      `INSERT INTO messages (id, from_user_id, to_user_id, channel_id, text, msg_type, reply_to)
       VALUES (?,?,?,?,?,?,?)`,
      [id, fromUserId, to || null, channel || null, text, channel ? 'channel' : 'direct', replyTo || null]
    );

    const [rows] = await pool.query('SELECT * FROM messages WHERE id = ?', [id]);
    res.status(201).json({ data: rows[0] });
  } catch (err) { next(err); }
}

module.exports = { getMessages, createMessage };
