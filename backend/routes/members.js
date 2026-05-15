const express = require('express');
const router = express.Router();
const auth = require('../middleware/auth');
const { getDB } = require('../database');

// Get all members of a project
router.get('/:projectId', auth, async (req, res) => {
  try {
    const db = getDB();
    const members = await db.all(
      `SELECT users.id, users.username, users.email, project_members.role
       FROM project_members
       JOIN users ON project_members.user_id = users.id
       WHERE project_members.project_id = ?`,
      [req.params.projectId]
    );
    res.json(members);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Add member to project
router.post('/:projectId', auth, async (req, res) => {
  try {
    const { email } = req.body;
    const db = getDB();

    // User dhundo email se
    const user = await db.get(`SELECT * FROM users WHERE email = ?`, [email]);
    if (!user) return res.status(404).json({ error: 'User not found' });

    // Pehle se member hai?
    const existing = await db.get(
      `SELECT * FROM project_members WHERE project_id = ? AND user_id = ?`,
      [req.params.projectId, user.id]
    );
    if (existing) return res.status(400).json({ error: 'Already a member' });

    await db.run(
      `INSERT INTO project_members (project_id, user_id, role) VALUES (?, ?, ?)`,
      [req.params.projectId, user.id, 'member']
    );

    // Notification bhejo
    await db.run(
      `INSERT INTO notifications (user_id, message) VALUES (?, ?)`,
      [user.id, `You have been added to a project!`]
    );

    // Real-time update
    const io = req.app.get('io');
    io.to(`project_${req.params.projectId}`).emit('member_added', {
      userId: user.id, username: user.username
    });

    res.json({ message: 'Member added!' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Remove member from project
router.delete('/:projectId/:userId', auth, async (req, res) => {
  try {
    const db = getDB();

    await db.run(
      `DELETE FROM project_members WHERE project_id = ? AND user_id = ?`,
      [req.params.projectId, req.params.userId]
    );

    res.json({ message: 'Member removed!' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router; 
