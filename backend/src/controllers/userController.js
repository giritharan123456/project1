const { pool } = require('../config/db');

function stripPassword(u) {
  const { password_hash, ...rest } = u;
  return rest;
}

async function getUsers(req, res, next) {
  try {
    const [rows] = await pool.query('SELECT * FROM users ORDER BY name ASC');
    res.json({ data: rows.map(stripPassword) });
  } catch (err) { next(err); }
}

async function getUserById(req, res, next) {
  try {
    const [rows] = await pool.query('SELECT * FROM users WHERE id = ?', [req.params.id]);
    if (!rows[0]) return res.json({ data: null });
    res.json({ data: stripPassword(rows[0]) });
  } catch (err) { next(err); }
}

async function updateUser(req, res, next) {
  try {
    const allowed = ['name', 'avatar', 'department', 'title', 'status', 'timezone', 'phone', 'location', 'bio'];
    const updates = [];
    const values = [];
    for (const key of allowed) {
      if (req.body[key] !== undefined) {
        updates.push(`${key === 'name' ? 'name' : key} = ?`);
        values.push(req.body[key]);
      }
    }
    if (!updates.length) return res.status(400).json({ message: 'No valid fields to update' });

    values.push(req.params.id);
    await pool.query(`UPDATE users SET ${updates.join(', ')} WHERE id = ?`, values);

    const [rows] = await pool.query('SELECT * FROM users WHERE id = ?', [req.params.id]);
    if (!rows[0]) return res.status(404).json({ message: 'User not found' });
    res.json({ data: stripPassword(rows[0]) });
  } catch (err) { next(err); }
}

async function getOnlineUsers(req, res, next) {
  try {
    const [rows] = await pool.query("SELECT * FROM users WHERE status = 'online' ORDER BY name ASC");
    res.json({ data: rows.map(stripPassword) });
  } catch (err) { next(err); }
}

async function getDepartments(req, res, next) {
  try {
    const [rows] = await pool.query(
      'SELECT DISTINCT department FROM users WHERE department IS NOT NULL ORDER BY department ASC'
    );
    res.json({ data: rows.map((r) => r.department) });
  } catch (err) { next(err); }
}

module.exports = { getUsers, getUserById, updateUser, getOnlineUsers, getDepartments };
