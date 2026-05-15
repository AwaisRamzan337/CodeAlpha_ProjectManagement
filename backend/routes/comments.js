const express = require('express');
const router = express.Router();
const auth = require('../middleware/auth');
const { getDB } = require('../database');

// Get all comments of a task
router.get('/:taskId', auth, async (req, res) => {
  try {
    const db = getDB();
    const comments = await db.all(
      `SELECT comments.*, users.username
       FROM comments
       JOIN users ON comments.user_id = users.id
       WHERE comments.task_id = ?
       ORDER BY comments.created_at ASC`,
      [req.params.taskId]
    );
    res.json(comments);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Add comment
router.post('/:taskId', auth, async (req, res) => {
  try {
    const { content } = req.body;
    const db = getDB();

    const result = await db.run(
      `INSERT INTO comments (task_id, user_id, content) VALUES (?, ?, ?)`,
      [req.params.taskId, req.user.id, content]
    );

    // Task owner ko notification bhejo
    const task = await db.get(`SELECT * FROM tasks WHERE id = ?`, [req.params.taskId]);
    if (task && task.created_by !== req.user.id) {
      await db.run(
        `INSERT INTO notifications (user_id, message) VALUES (?, ?)`,
        [task.created_by, `💬 ${req.user.username} commented on task: "${task.title}"`]
      );
    }

    // Real-time update
    const io = req.app.get('io');
    io.emit('new_comment', {
      id: result.lastID,
      task_id: req.params.taskId,
      content,
      username: req.user.username
    });

    res.json({ id: result.lastID, message: 'Comment added!' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Delete comment
router.delete('/:id', auth, async (req, res) => {
  try {
    const db = getDB();
    await db.run(
      `DELETE FROM comments WHERE id = ? AND user_id = ?`,
      [req.params.id, req.user.id]
    );
    res.json({ message: 'Comment deleted!' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;