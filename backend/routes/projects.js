const express = require('express');
const router = express.Router();
const auth = require('../middleware/auth');
const { getDB } = require('../database');

// Get all projects (jisme user member hai)
router.get('/', auth, async (req, res) => {
  try {
    const db = getDB();
    const projects = await db.all(
      `SELECT projects.*, users.username as owner_name,
      (SELECT COUNT(*) FROM tasks WHERE tasks.project_id = projects.id) as task_count,
      (SELECT COUNT(*) FROM project_members WHERE project_members.project_id = projects.id) as member_count
      FROM projects
      LEFT JOIN users ON projects.owner_id = users.id
      WHERE projects.owner_id = ?
      OR projects.id IN (SELECT project_id FROM project_members WHERE user_id = ?)
      ORDER BY projects.created_at DESC`,
      [req.user.id, req.user.id]
    );
    res.json(projects);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Get single project
router.get('/:id', auth, async (req, res) => {
  try {
    const db = getDB();
    const project = await db.get(
      `SELECT projects.*, users.username as owner_name
       FROM projects
       LEFT JOIN users ON projects.owner_id = users.id
       WHERE projects.id = ?`,
      [req.params.id]
    );
    if (!project) return res.status(404).json({ error: 'Project not found' });

    const members = await db.all(
      `SELECT users.id, users.username, users.email, project_members.role
       FROM project_members
       JOIN users ON project_members.user_id = users.id
       WHERE project_members.project_id = ?`,
      [req.params.id]
    );

    res.json({ ...project, members });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Create project
router.post('/', auth, async (req, res) => {
  try {
    const { name, description } = req.body;
    const db = getDB();

    const result = await db.run(
      `INSERT INTO projects (name, description, owner_id) VALUES (?, ?, ?)`,
      [name, description, req.user.id]
    );

    // Owner ko automatically member banao
    await db.run(
      `INSERT INTO project_members (project_id, user_id, role) VALUES (?, ?, ?)`,
      [result.lastID, req.user.id, 'owner']
    );

    // Real-time update
    const io = req.app.get('io');
    io.emit('project_created', { id: result.lastID, name });

    res.json({ id: result.lastID, message: 'Project created!' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Update project
router.put('/:id', auth, async (req, res) => {
  try {
    const { name, description } = req.body;
    const db = getDB();

    await db.run(
      `UPDATE projects SET name = ?, description = ? WHERE id = ? AND owner_id = ?`,
      [name, description, req.params.id, req.user.id]
    );

    res.json({ message: 'Project updated!' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Delete project
router.delete('/:id', auth, async (req, res) => {
  try {
    const db = getDB();

    await db.run(
      `DELETE FROM projects WHERE id = ? AND owner_id = ?`,
      [req.params.id, req.user.id]
    );

    res.json({ message: 'Project deleted!' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router; 
