const express = require('express');
const router = express.Router();
const auth = require('../middleware/auth');
const { getDB } = require('../database');

// Get all notifications
router.get('/', auth, async (req, res) => {
  try {
    const db = getDB();
    const notifications = await db.all(
      `SELECT * FROM notifications 
       WHERE user_id = ? 
       ORDER BY created_at DESC`,
      [req.user.id]
    );
    res.json(notifications);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Mark as read
router.put('/:id', auth, async (req, res) => {
  try {
    const db = getDB();
    await db.run(
      `UPDATE notifications SET is_read = 1 WHERE id = ? AND user_id = ?`,
      [req.params.id, req.user.id]
    );
    res.json({ message: 'Marked as read!' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Mark all as read
router.put('/read/all', auth, async (req, res) => {
  try {
    const db = getDB();
    await db.run(
      `UPDATE notifications SET is_read = 1 WHERE user_id = ?`,
      [req.user.id]
    );
    res.json({ message: 'All marked as read!' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Delete notification
router.delete('/:id', auth, async (req, res) => {
  try {
    const db = getDB();
    await db.run(
      `DELETE FROM notifications WHERE id = ? AND user_id = ?`,
      [req.params.id, req.user.id]
    );
    res.json({ message: 'Notification deleted!' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router; 
