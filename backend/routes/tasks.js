const express = require('express');
const router = express.Router();
const auth = require('../middleware/auth');
const { getDB } = require('../database');

// Get all tasks of a project
router.get('/:projectId', auth, async (req, res) => {
  try {
    const db = getDB();
    const tasks = await db.all(
      `SELECT tasks.*, users.username as assigned_username
       FROM tasks
       LEFT JOIN users ON tasks.assigned_to = users.id
       WHERE tasks.project_id = ?
       ORDER BY tasks.position ASC, tasks.created_at DESC`,
      [req.params.projectId]
    );
    res.json(tasks);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Create task
router.post('/', auth, async (req, res) => {
  try {
    const { project_id, title, description, priority, assigned_to, due_date } = req.body;
    const db = getDB();

    const result = await db.run(
      `INSERT INTO tasks (project_id, title, description, priority, assigned_to, due_date, created_by)
       VALUES (?, ?, ?, ?, ?, ?, ?)`,
      [project_id, title, description, priority || 'medium', assigned_to || null, due_date || null, req.user.id]
    );

    // Notification bhejo agar task assign hua
    if (assigned_to && assigned_to !== req.user.id) {
      await db.run(
        `INSERT INTO notifications (user_id, message) VALUES (?, ?)`,
        [assigned_to, `New task assigned to you: "${title}"`]
      );
    }

    // Real-time update
    const io = req.app.get('io');
    io.to(`project_${project_id}`).emit('task_created', {
      id: result.lastID, title, priority, status: 'todo'
    });

    res.json({ id: result.lastID, message: 'Task created!' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Update task (status change, edit, drag & drop)
router.put('/:id', auth, async (req, res) => {
  try {
    const { title, description, status, priority, assigned_to, due_date, position } = req.body;
    const db = getDB();

    const task = await db.get(`SELECT * FROM tasks WHERE id = ?`, [req.params.id]);
    if (!task) return res.status(404).json({ error: 'Task not found' });

    await db.run(
      `UPDATE tasks SET
        title = COALESCE(?, title),
        description = COALESCE(?, description),
        status = COALESCE(?, status),
        priority = COALESCE(?, priority),
        assigned_to = COALESCE(?, assigned_to),
        due_date = COALESCE(?, due_date),
        position = COALESCE(?, position)
       WHERE id = ?`,
      [title, description, status, priority, assigned_to, due_date, position, req.params.id]
    );

    // Real-time update
    const io = req.app.get('io');
    io.to(`project_${task.project_id}`).emit('task_updated', {
      id: req.params.id, status, title
    });

    res.json({ message: 'Task updated!' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Delete task
router.delete('/:id', auth, async (req, res) => {
  try {
    const db = getDB();
    const task = await db.get(`SELECT * FROM tasks WHERE id = ?`, [req.params.id]);
    if (!task) return res.status(404).json({ error: 'Task not found' });

    await db.run(`DELETE FROM tasks WHERE id = ?`, [req.params.id]);

    // Real-time update
    const io = req.app.get('io');
    io.to(`project_${task.project_id}`).emit('task_deleted', { id: req.params.id });

    res.json({ message: 'Task deleted!' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router; 
