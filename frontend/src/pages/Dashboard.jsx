import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { useAuth } from '../context/AuthContext';
import useApi from '../hooks/useApi';
import { Plus, LogOut, FolderKanban, Users, CheckSquare, Bell } from 'lucide-react';

const styles = {
  page: { minHeight: '100vh', background: 'linear-gradient(135deg, #0f172a 0%, #1a1040 50%, #0f172a 100%)' },
  nav: { background: 'rgba(30,41,59,0.9)', backdropFilter: 'blur(20px)', borderBottom: '1px solid rgba(148,163,184,0.1)', padding: '16px 32px', display: 'flex', alignItems: 'center', justifyContent: 'space-between', position: 'sticky', top: 0, zIndex: 100 },
  logo: { fontSize: '26px', fontWeight: '800', background: 'linear-gradient(135deg, #a78bfa, #7c3aed)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' },
  navRight: { display: 'flex', alignItems: 'center', gap: '16px' },
  bellBtn: { position: 'relative', background: 'rgba(139,92,246,0.1)', border: '1px solid rgba(139,92,246,0.2)', borderRadius: '10px', padding: '8px', cursor: 'pointer', color: '#a78bfa', display: 'flex', alignItems: 'center' },
  badge: { position: 'absolute', top: '-6px', right: '-6px', background: '#7c3aed', color: '#fff', fontSize: '10px', width: '18px', height: '18px', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: '700' },
  username: { color: '#cbd5e1', fontSize: '14px', background: 'rgba(139,92,246,0.1)', padding: '6px 14px', borderRadius: '20px', border: '1px solid rgba(139,92,246,0.2)' },
  logoutBtn: { display: 'flex', alignItems: 'center', gap: '6px', color: '#94a3b8', background: 'none', border: 'none', cursor: 'pointer', fontSize: '14px', padding: '6px 12px', borderRadius: '8px' },
  main: { maxWidth: '1200px', margin: '0 auto', padding: '40px 32px' },
  header: { display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '40px' },
  title: { fontSize: '32px', fontWeight: '800', color: '#fff', marginBottom: '4px' },
  subtitle: { color: '#64748b', fontSize: '15px' },
  newBtn: { display: 'flex', alignItems: 'center', gap: '8px', background: 'linear-gradient(135deg, #7c3aed, #6d28d9)', color: '#fff', border: 'none', padding: '12px 24px', borderRadius: '12px', fontWeight: '600', cursor: 'pointer', fontSize: '15px', boxShadow: '0 4px 15px rgba(124,58,237,0.4)' },
  grid: { display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))', gap: '24px' },
  card: { background: 'rgba(30,41,59,0.8)', backdropFilter: 'blur(10px)', border: '1px solid rgba(148,163,184,0.1)', borderRadius: '20px', padding: '24px', cursor: 'pointer', transition: 'all 0.3s' },
  cardIcon: { width: '48px', height: '48px', background: 'rgba(139,92,246,0.15)', borderRadius: '12px', display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: '16px' },
  cardTitle: { fontSize: '18px', fontWeight: '700', color: '#fff', marginBottom: '8px' },
  cardDesc: { fontSize: '14px', color: '#64748b', marginBottom: '16px', lineHeight: '1.5' },
  cardMeta: { display: 'flex', gap: '16px' },
  metaItem: { display: 'flex', alignItems: 'center', gap: '6px', color: '#475569', fontSize: '13px' },
  emptyState: { textAlign: 'center', padding: '80px 20px' },
  emptyIcon: { color: '#1e293b', marginBottom: '16px' },
  emptyTitle: { fontSize: '22px', color: '#334155', fontWeight: '600', marginBottom: '8px' },
  emptyText: { color: '#475569', fontSize: '15px' },
  overlay: { position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.7)', backdropFilter: 'blur(4px)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 200, padding: '16px' },
  modal: { background: 'linear-gradient(135deg, #1e293b, #1a1040)', border: '1px solid rgba(139,92,246,0.2)', borderRadius: '24px', padding: '40px', width: '100%', maxWidth: '460px', boxShadow: '0 25px 50px rgba(0,0,0,0.6)' },
  modalTitle: { fontSize: '22px', fontWeight: '700', color: '#fff', marginBottom: '28px' },
  label: { color: '#94a3b8', fontSize: '13px', display: 'block', marginBottom: '8px', fontWeight: '500' },
  input: { width: '100%', background: 'rgba(15,23,42,0.8)', border: '1px solid rgba(148,163,184,0.15)', borderRadius: '12px', padding: '12px 16px', color: '#fff', fontSize: '14px', outline: 'none', boxSizing: 'border-box', marginBottom: '16px' },
  textarea: { width: '100%', background: 'rgba(15,23,42,0.8)', border: '1px solid rgba(148,163,184,0.15)', borderRadius: '12px', padding: '12px 16px', color: '#fff', fontSize: '14px', outline: 'none', boxSizing: 'border-box', resize: 'none', marginBottom: '24px', fontFamily: 'inherit' },
  btnRow: { display: 'flex', gap: '12px' },
  cancelBtn: { flex: 1, background: 'rgba(51,65,85,0.8)', color: '#94a3b8', border: '1px solid rgba(148,163,184,0.1)', padding: '13px', borderRadius: '12px', cursor: 'pointer', fontSize: '15px', fontWeight: '600' },
  createBtn: { flex: 1, background: 'linear-gradient(135deg, #7c3aed, #6d28d9)', color: '#fff', border: 'none', padding: '13px', borderRadius: '12px', cursor: 'pointer', fontSize: '15px', fontWeight: '600', boxShadow: '0 4px 15px rgba(124,58,237,0.3)' },
  notifDropdown: { position: 'absolute', right: 0, top: '48px', width: '320px', background: '#1e293b', border: '1px solid rgba(148,163,184,0.1)', borderRadius: '16px', boxShadow: '0 20px 40px rgba(0,0,0,0.4)', zIndex: 300 },
  notifHeader: { padding: '16px 20px', borderBottom: '1px solid rgba(148,163,184,0.1)', fontWeight: '600', color: '#fff', fontSize: '15px' },
  notifItem: { padding: '12px 20px', borderBottom: '1px solid rgba(148,163,184,0.05)', fontSize: '13px', color: '#94a3b8', lineHeight: '1.5' },
  notifUnread: { padding: '12px 20px', borderBottom: '1px solid rgba(148,163,184,0.05)', fontSize: '13px', color: '#e2e8f0', lineHeight: '1.5', background: 'rgba(139,92,246,0.08)' },
};

function Dashboard() {
  const { user, logout } = useAuth();
  const { get, post } = useApi();
  const navigate = useNavigate();

  const [projects, setProjects] = useState([]);
  const [notifications, setNotifications] = useState([]);
  const [showModal, setShowModal] = useState(false);
  const [showNotif, setShowNotif] = useState(false);
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    fetchProjects();
    fetchNotifications();
  }, []);

  const fetchProjects = async () => {
    try {
      const data = await get('/projects');
      setProjects(data);
    } catch (err) {
      console.error(err);
    }
  };

  const fetchNotifications = async () => {
    try {
      const data = await get('/notifications');
      setNotifications(data);
    } catch (err) {
      console.error(err);
    }
  };

  const handleCreateProject = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      await post('/projects', { name, description });
      setName('');
      setDescription('');
      setShowModal(false);
      fetchProjects();
    } catch (err) {
      console.error(err);
    }
    setLoading(false);
  };

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const unreadCount = notifications.filter(n => !n.is_read).length;

  const handleBellClick = () => {
    const next = !showNotif;
    setShowNotif(next);
    if (next) fetchNotifications();
  };

  return (
    <div style={styles.page}>
      {/* Navbar */}
      <nav style={styles.nav}>
        <span style={styles.logo}>LoopSpace</span>
        <div style={styles.navRight}>
          {/* BUG 3 FIX: Notifications */}
          <div style={{ position: 'relative' }}>
            <button style={styles.bellBtn} onClick={handleBellClick}>
              <Bell size={20} />
              {unreadCount > 0 && <span style={styles.badge}>{unreadCount}</span>}
            </button>
            {showNotif && (
              <div style={styles.notifDropdown}>
                <div style={styles.notifHeader}>
                  🔔 Notifications {unreadCount > 0 && `(${unreadCount} new)`}
                </div>
                {notifications.length === 0 ? (
                  <div style={{ ...styles.notifItem, textAlign: 'center', padding: '24px', color: '#475569' }}>
                    No notifications yet
                  </div>
                ) : (
                  notifications.map(n => (
                    <div key={n.id} style={n.is_read ? styles.notifItem : styles.notifUnread}>
                      {n.message}
                      <div style={{ fontSize: '11px', color: '#475569', marginTop: '4px' }}>
                        {new Date(n.created_at).toLocaleDateString()}
                      </div>
                    </div>
                  ))
                )}
              </div>
            )}
          </div>

          <span style={styles.username}>👋 {user?.username}</span>
          <button style={styles.logoutBtn} onClick={handleLogout}>
            <LogOut size={16} /> Logout
          </button>
        </div>
      </nav>

      {/* Main */}
      <div style={styles.main}>
        <div style={styles.header}>
          <div>
            <h2 style={styles.title}>My Projects</h2>
            <p style={styles.subtitle}>Manage your projects and tasks</p>
          </div>
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            style={styles.newBtn}
            onClick={() => setShowModal(true)}
          >
            <Plus size={20} /> New Project
          </motion.button>
        </div>

        {projects.length === 0 ? (
          <div style={styles.emptyState}>
            <FolderKanban size={80} style={styles.emptyIcon} />
            <h3 style={styles.emptyTitle}>No projects yet</h3>
            <p style={styles.emptyText}>Create your first project to get started!</p>
          </div>
        ) : (
          <div style={styles.grid}>
            {projects.map((project, index) => (
              <motion.div
                key={project.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.1 }}
                whileHover={{ y: -4, boxShadow: '0 20px 40px rgba(124,58,237,0.2)' }}
                style={styles.card}
                onClick={() => navigate(`/project/${project.id}`)}
              >
                <div style={styles.cardIcon}>
                  <FolderKanban size={24} color="#a78bfa" />
                </div>
                <h3 style={styles.cardTitle}>{project.name}</h3>
                <p style={styles.cardDesc}>{project.description || 'No description'}</p>
                <div style={styles.cardMeta}>
                  <div style={styles.metaItem}>
                    <CheckSquare size={14} color="#7c3aed" />
                    <span>{project.task_count || 0} tasks</span>
                  </div>
                  <div style={styles.metaItem}>
                    <Users size={14} color="#7c3aed" />
                    <span>{project.member_count || 0} members</span>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        )}
      </div>

      {/* Create Project Modal */}
      {showModal && (
        <div style={styles.overlay}>
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            style={styles.modal}
          >
            <h3 style={styles.modalTitle}>✨ Create New Project</h3>
            <form onSubmit={handleCreateProject}>
              <label style={styles.label}>Project Name</label>
              <input
                style={styles.input}
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="Enter project name"
                required
              />
              <label style={styles.label}>Description</label>
              <textarea
                style={styles.textarea}
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="Enter project description"
                rows={3}
              />
              <div style={styles.btnRow}>
                <button type="button" style={styles.cancelBtn} onClick={() => setShowModal(false)}>Cancel</button>
                <motion.button
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  type="submit"
                  style={{ ...styles.createBtn, opacity: loading ? 0.6 : 1 }}
                  disabled={loading}
                >
                  {loading ? 'Creating...' : 'Create Project'}
                </motion.button>
              </div>
            </form>
          </motion.div>
        </div>
      )}
    </div>
  );
}

export default Dashboard;