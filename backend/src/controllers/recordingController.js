const { pool } = require('../config/db');

async function getRecordings(req, res, next) {
  try {
    const [rows] = await pool.query('SELECT * FROM recordings ORDER BY recorded_date DESC');
    res.json({ data: rows });
  } catch (err) { next(err); }
}

async function getRecordingById(req, res, next) {
  try {
    const [rows] = await pool.query('SELECT * FROM recordings WHERE id = ?', [req.params.id]);
    res.json({ data: rows[0] || null });
  } catch (err) { next(err); }
}

async function updateRecording(req, res, next) {
  try {
    const allowed = ['title', 'status'];
    const updates = [];
    const values = [];
    for (const key of allowed) {
      if (req.body[key] !== undefined) {
        updates.push(`${key} = ?`);
        values.push(req.body[key]);
      }
    }
    if (!updates.length) return res.status(400).json({ message: 'No valid fields to update' });
    values.push(req.params.id);
    const [result] = await pool.query(`UPDATE recordings SET ${updates.join(', ')} WHERE id = ?`, values);
    if (!result.affectedRows) return res.status(404).json({ message: 'Recording not found' });

    const [rows] = await pool.query('SELECT * FROM recordings WHERE id = ?', [req.params.id]);
    res.json({ data: rows[0] });
  } catch (err) { next(err); }
}

async function deleteRecording(req, res, next) {
  try {
    const [result] = await pool.query('DELETE FROM recordings WHERE id = ?', [req.params.id]);
    if (!result.affectedRows) return res.status(404).json({ message: 'Recording not found' });
    res.json({ data: { id: req.params.id, deleted: true } });
  } catch (err) { next(err); }
}

module.exports = { getRecordings, getRecordingById, updateRecording, deleteRecording };
