const { pool } = require('../config/db');

async function getNotifications(req, res, next) {
  try {
    const userId = req.query.userId || req.user?.sub;
    const [rows] = await pool.query(
      'SELECT * FROM notifications WHERE user_id = ? ORDER BY created_at DESC',
      [userId]
    );
    res.json({ data: rows });
  } catch (err) { next(err); }
}

async function markAsRead(req, res, next) {
  try {
    const [result] = await pool.query('UPDATE notifications SET is_read = 1 WHERE id = ?', [req.params.id]);
    if (!result.affectedRows) return res.status(404).json({ message: 'Notification not found' });
    res.json({ data: { id: req.params.id, read: true } });
  } catch (err) { next(err); }
}

async function markAllAsRead(req, res, next) {
  try {
    const userId = req.body.userId || req.user?.sub;
    await pool.query('UPDATE notifications SET is_read = 1 WHERE user_id = ?', [userId]);
    res.json({ data: { success: true } });
  } catch (err) { next(err); }
}

async function deleteNotification(req, res, next) {
  try {
    const [result] = await pool.query('DELETE FROM notifications WHERE id = ?', [req.params.id]);
    if (!result.affectedRows) return res.status(404).json({ message: 'Notification not found' });
    res.json({ data: { id: req.params.id, deleted: true } });
  } catch (err) { next(err); }
}

module.exports = { getNotifications, markAsRead, markAllAsRead, deleteNotification };
