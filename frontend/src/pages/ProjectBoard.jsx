import { useState, useEffect, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { useAuth } from '../context/AuthContext';
import useApi from '../hooks/useApi';
import { ArrowLeft, Plus, Trash2, UserPlus, MessageSquare, X, Calendar, Flag, Users } from 'lucide-react';

const COLUMNS = [
  { id: 'todo', label: 'To Do', emoji: '📋', color: '#6366f1', bg: 'rgba(99,102,241,0.1)', border: 'rgba(99,102,241,0.3)' },
  { id: 'inprogress', label: 'In Progress', emoji: '🔄', color: '#3b82f6', bg: 'rgba(59,130,246,0.1)', border: 'rgba(59,130,246,0.3)' },
  { id: 'review', label: 'Review', emoji: '👀', color: '#f59e0b', bg: 'rgba(245,158,11,0.1)', border: 'rgba(245,158,11,0.3)' },
  { id: 'done', label: 'Done', emoji: '✅', color: '#22c55e', bg: 'rgba(34,197,94,0.1)', border: 'rgba(34,197,94,0.3)' },
];

const PRIORITY = {
  low: { color: '#22c55e', bg: 'rgba(34,197,94,0.15)', label: 'Low' },
  medium: { color: '#f59e0b', bg: 'rgba(245,158,11,0.15)', label: 'Medium' },
  high: { color: '#ef4444', bg: 'rgba(239,68,68,0.15)', label: 'High' },
};

const s = {
  page: { minHeight: '100vh', background: 'linear-gradient(135deg, #0a0f1e 0%, #0f0a2e 50%, #0a0f1e 100%)' },
  nav: { background: 'rgba(15,23,42,0.95)', backdropFilter: 'blur(20px)', borderBottom: '1px solid rgba(139,92,246,0.15)', padding: '14px 28px', display: 'flex', alignItems: 'center', justifyContent: 'space-between', position: 'sticky', top: 0, zIndex: 100 },
  navLeft: { display: 'flex', alignItems: 'center', gap: '16px' },
  backBtn: { background: 'rgba(139,92,246,0.1)', border: '1px solid rgba(139,92,246,0.2)', borderRadius: '10px', padding: '8px', cursor: 'pointer', color: '#a78bfa', display: 'flex', alignItems: 'center' },
  projectName: { fontSize: '20px', fontWeight: '700', color: '#fff' },
  projectDesc: { fontSize: '13px', color: '#64748b', marginTop: '2px' },
  navRight: { display: 'flex', alignItems: 'center', gap: '12px' },
  avatarGroup: { display: 'flex', cursor: 'pointer' },
  avatar: { width: '34px', height: '34px', borderRadius: '50%', background: 'linear-gradient(135deg, #7c3aed, #4f46e5)', border: '2px solid #0a0f1e', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '13px', fontWeight: '700', color: '#fff', marginLeft: '-8px' },
  memberBtn: { display: 'flex', alignItems: 'center', gap: '6px', background: 'rgba(30,41,59,0.8)', border: '1px solid rgba(148,163,184,0.15)', color: '#94a3b8', padding: '8px 16px', borderRadius: '10px', cursor: 'pointer', fontSize: '13px', fontWeight: '500' },
  addTaskBtn: { display: 'flex', alignItems: 'center', gap: '8px', background: 'linear-gradient(135deg, #7c3aed, #6d28d9)', color: '#fff', border: 'none', padding: '10px 20px', borderRadius: '10px', cursor: 'pointer', fontSize: '14px', fontWeight: '600', boxShadow: '0 4px 15px rgba(124,58,237,0.35)' },
  board: { padding: '28px', overflowX: 'auto', display: 'flex', gap: '20px', minHeight: 'calc(100vh - 70px)' },
  col: { minWidth: '290px', width: '290px', display: 'flex', flexDirection: 'column', gap: '0' },
  colHeader: (col) => ({ background: col.bg, border: `1px solid ${col.border}`, borderRadius: '16px 16px 0 0', padding: '14px 16px', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }),
  colTitle: (col) => ({ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '15px', fontWeight: '600', color: col.color }),
  colCount: (col) => ({ background: col.bg, border: `1px solid ${col.border}`, color: col.color, fontSize: '12px', fontWeight: '700', padding: '2px 10px', borderRadius: '20px' }),
  colBody: { background: 'rgba(15,23,42,0.5)', border: '1px solid rgba(148,163,184,0.08)', borderTop: 'none', borderRadius: '0 0 16px 16px', padding: '12px', minHeight: '400px', display: 'flex', flexDirection: 'column', gap: '10px' },
  taskCard: { background: 'rgba(30,41,59,0.9)', backdropFilter: 'blur(10px)', border: '1px solid rgba(148,163,184,0.1)', borderRadius: '12px', padding: '14px', cursor: 'pointer' },
  taskTitle: { fontSize: '14px', fontWeight: '600', color: '#e2e8f0', marginBottom: '6px', lineHeight: '1.4' },
  taskDesc: { fontSize: '12px', color: '#64748b', marginBottom: '10px', lineHeight: '1.5', display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical', overflow: 'hidden' },
  taskMeta: { display: 'flex', alignItems: 'center', justifyContent: 'space-between' },
  priorityBadge: (p) => ({ fontSize: '11px', fontWeight: '600', color: PRIORITY[p]?.color || '#94a3b8', background: PRIORITY[p]?.bg || 'rgba(148,163,184,0.1)', padding: '3px 10px', borderRadius: '20px' }),
  dueDateBadge: { fontSize: '11px', color: '#64748b', display: 'flex', alignItems: 'center', gap: '4px' },
  assignee: { display: 'flex', alignItems: 'center', gap: '6px', marginTop: '10px', paddingTop: '10px', borderTop: '1px solid rgba(148,163,184,0.07)' },
  assigneeAvatar: { width: '22px', height: '22px', borderRadius: '50%', background: 'linear-gradient(135deg, #7c3aed, #4f46e5)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '10px', fontWeight: '700', color: '#fff' },
  assigneeName: { fontSize: '12px', color: '#64748b' },
  overlay: { position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.75)', backdropFilter: 'blur(8px)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 200, padding: '16px' },
  modal: { background: 'linear-gradient(135deg, #1e293b, #1a1040)', border: '1px solid rgba(139,92,246,0.2)', borderRadius: '24px', padding: '32px', width: '100%', maxWidth: '480px', boxShadow: '0 30px 60px rgba(0,0,0,0.6)', maxHeight: '90vh', overflowY: 'auto' },
  modalTitle: { fontSize: '20px', fontWeight: '700', color: '#fff', marginBottom: '24px', display: 'flex', alignItems: 'center', gap: '10px' },
  label: { color: '#94a3b8', fontSize: '12px', fontWeight: '600', display: 'block', marginBottom: '6px', textTransform: 'uppercase', letterSpacing: '0.05em' },
  input: { width: '100%', background: 'rgba(15,23,42,0.8)', border: '1px solid rgba(148,163,184,0.12)', borderRadius: '10px', padding: '11px 14px', color: '#fff', fontSize: '14px', outline: 'none', boxSizing: 'border-box', marginBottom: '16px' },
  select: { width: '100%', background: 'rgba(15,23,42,0.8)', border: '1px solid rgba(148,163,184,0.12)', borderRadius: '10px', padding: '11px 14px', color: '#fff', fontSize: '14px', outline: 'none', boxSizing: 'border-box', marginBottom: '16px' },
  textarea: { width: '100%', background: 'rgba(15,23,42,0.8)', border: '1px solid rgba(148,163,184,0.12)', borderRadius: '10px', padding: '11px 14px', color: '#fff', fontSize: '14px', outline: 'none', boxSizing: 'border-box', resize: 'none', marginBottom: '16px', fontFamily: 'inherit' },
  grid2: { display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' },
  btnRow: { display: 'flex', gap: '10px', marginTop: '8px' },
  cancelBtn: { flex: 1, background: 'rgba(51,65,85,0.8)', color: '#94a3b8', border: '1px solid rgba(148,163,184,0.1)', padding: '12px', borderRadius: '10px', cursor: 'pointer', fontSize: '14px', fontWeight: '600' },
  submitBtn: { flex: 1, background: 'linear-gradient(135deg, #7c3aed, #6d28d9)', color: '#fff', border: 'none', padding: '12px', borderRadius: '10px', cursor: 'pointer', fontSize: '14px', fontWeight: '600', boxShadow: '0 4px 15px rgba(124,58,237,0.3)' },
  statusBtns: { display: 'flex', flexWrap: 'wrap', gap: '8px', marginBottom: '20px' },
  detailModal: { background: 'linear-gradient(135deg, #1e293b, #1a1040)', border: '1px solid rgba(139,92,246,0.2)', borderRadius: '24px', width: '100%', maxWidth: '540px', boxShadow: '0 30px 60px rgba(0,0,0,0.6)', maxHeight: '90vh', overflowY: 'auto' },
  detailHeader: { padding: '24px 28px', borderBottom: '1px solid rgba(148,163,184,0.08)', display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: '12px' },
  detailBody: { padding: '24px 28px' },
  commentBox: { background: 'rgba(15,23,42,0.6)', border: '1px solid rgba(148,163,184,0.08)', borderRadius: '10px', padding: '12px 14px', marginBottom: '8px' },
  commentUser: { fontSize: '12px', fontWeight: '600', color: '#a78bfa', marginBottom: '4px' },
  commentText: { fontSize: '13px', color: '#cbd5e1', lineHeight: '1.5' },
  deleteBtn: { display: 'flex', alignItems: 'center', gap: '6px', color: '#ef4444', background: 'rgba(239,68,68,0.08)', border: '1px solid rgba(239,68,68,0.2)', padding: '8px 14px', borderRadius: '8px', cursor: 'pointer', fontSize: '13px', marginTop: '16px' },
  closeBtn: { background: 'rgba(148,163,184,0.1)', border: 'none', borderRadius: '8px', padding: '6px', cursor: 'pointer', color: '#94a3b8', display: 'flex' },
  divider: { borderTop: '1px solid rgba(148,163,184,0.08)', margin: '20px 0' },
  toast: { position: 'fixed', bottom: '24px', right: '24px', background: 'linear-gradient(135deg, #22c55e, #16a34a)', color: '#fff', padding: '12px 20px', borderRadius: '12px', fontSize: '14px', fontWeight: '600', boxShadow: '0 8px 25px rgba(34,197,94,0.3)', zIndex: 999 },
  membersDropdown: { position: 'absolute', top: '50px', right: '0', background: 'linear-gradient(135deg, #1e293b, #1a1040)', border: '1px solid rgba(139,92,246,0.2)', borderRadius: '16px', padding: '16px', minWidth: '220px', boxShadow: '0 20px 40px rgba(0,0,0,0.5)', zIndex: 300 },
  commentInputWrap: { display: 'flex', gap: '8px', marginTop: '12px' },
  commentInput: { flex: 1, background: 'rgba(15,23,42,0.8)', border: '1px solid rgba(148,163,184,0.12)', borderRadius: '10px', padding: '11px 14px', color: '#fff', fontSize: '14px', outline: 'none', boxSizing: 'border-box' },
  sendBtn: { background: 'linear-gradient(135deg, #7c3aed, #6d28d9)', color: '#fff', border: 'none', padding: '11px 18px', borderRadius: '10px', cursor: 'pointer', fontSize: '14px', fontWeight: '600', whiteSpace: 'nowrap' },
};

function ProjectBoard() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();
  const { get, post, put, del } = useApi();
  const commentRef = useRef(null);

  const [project, setProject] = useState(null);
  const [tasks, setTasks] = useState([]);
  const [comments, setComments] = useState([]);
  const [showTaskModal, setShowTaskModal] = useState(false);
  const [showMemberModal, setShowMemberModal] = useState(false);
  const [showMembersDropdown, setShowMembersDropdown] = useState(false);
  const [selectedTask, setSelectedTask] = useState(null);
  const [memberEmail, setMemberEmail] = useState('');
  const [memberError, setMemberError] = useState('');
  const [taskForm, setTaskForm] = useState({ title: '', description: '', priority: 'medium', due_date: '' });
  const [toast, setToast] = useState('');

  useEffect(() => { fetchProject(); fetchTasks(); }, [id]);

  const showToast = (msg) => {
    setToast(msg);
    setTimeout(() => setToast(''), 3000);
  };

  const fetchProject = async () => {
    try { const data = await get(`/projects/${id}`); setProject(data); } catch (e) { console.error(e); }
  };
  const fetchTasks = async () => {
    try { const data = await get(`/tasks/${id}`); setTasks(data); } catch (e) { console.error(e); }
  };
  const fetchComments = async (taskId) => {
    try { const data = await get(`/comments/${taskId}`); setComments(data); } catch (e) { console.error(e); }
  };

  const handleCreateTask = async (e) => {
    e.preventDefault();
    try {
      await post('/tasks', { project_id: id, ...taskForm });
      setTaskForm({ title: '', description: '', priority: 'medium', due_date: '' });
      setShowTaskModal(false);
      fetchTasks();
      showToast('✅ Task created!');
    } catch (e) { console.error(e); }
  };

  const handleStatusChange = async (taskId, newStatus) => {
    try {
      await put(`/tasks/${taskId}`, { status: newStatus });
      fetchTasks();
      setSelectedTask(prev => prev ? { ...prev, status: newStatus } : null);
      showToast('✅ Task moved!');
    } catch (e) { console.error(e); }
  };

  const handleDeleteTask = async (taskId) => {
    try {
      await del(`/tasks/${taskId}`);
      setSelectedTask(null);
      fetchTasks();
      showToast('🗑️ Task deleted!');
    } catch (e) { console.error(e); }
  };

  const handleAddComment = async () => {
    const trimmed = commentRef.current?.value?.trim();
    if (!trimmed) return;
    commentRef.current.value = '';
    try {
      await post(`/comments/${selectedTask.id}`, { content: trimmed });
      await fetchComments(selectedTask.id);
      showToast('💬 Comment added!');
    } catch (e) {
      console.error(e);
    }
  };

  const handleCommentKeyDown = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleAddComment();
    }
  };

  const handleAddMember = async (e) => {
    e.preventDefault();
    setMemberError('');
    try {
      await post(`/members/${id}`, { email: memberEmail });
      setMemberEmail('');
      setShowMemberModal(false);
      fetchProject();
      showToast('👥 Member added!');
    } catch (err) {
      setMemberError(err.response?.data?.error || 'Failed to add member');
    }
  };

  const openTask = (task) => {
    setSelectedTask(task);
    fetchComments(task.id);
    setTimeout(() => { if (commentRef.current) commentRef.current.value = ''; }, 100);
  };

  const getByStatus = (status) => tasks.filter(t => t.status === status);

  return (
    <div style={s.page}>
      <AnimatePresence>
        {toast && (
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: 20 }} style={s.toast}>
            {toast}
          </motion.div>
        )}
      </AnimatePresence>

      <nav style={s.nav}>
        <div style={s.navLeft}>
          <button style={s.backBtn} onClick={() => navigate('/dashboard')}><ArrowLeft size={18} /></button>
          <div>
            <div style={s.projectName}>{project?.name}</div>
            <div style={s.projectDesc}>{project?.description}</div>
          </div>
        </div>
        <div style={s.navRight}>
          <div style={{ position: 'relative' }}>
            <div style={s.avatarGroup} onClick={() => setShowMembersDropdown(!showMembersDropdown)}>
              {project?.members?.slice(0, 4).map((m, i) => (
                <div key={m.id} style={{ ...s.avatar, marginLeft: i === 0 ? 0 : '-8px', zIndex: 4 - i }} title={m.username}>
                  {m.username[0].toUpperCase()}
                </div>
              ))}
            </div>
            {showMembersDropdown && (
              <div style={s.membersDropdown}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '14px' }}>
                  <Users size={16} color="#a78bfa" />
                  <span style={{ color: '#fff', fontWeight: '700', fontSize: '14px' }}>Team Members</span>
                </div>
                {project?.members?.map(m => (
                  <div key={m.id} style={{ display: 'flex', alignItems: 'center', gap: '10px', padding: '8px 0', borderBottom: '1px solid rgba(148,163,184,0.07)' }}>
                    <div style={{ width: '32px', height: '32px', borderRadius: '50%', background: 'linear-gradient(135deg, #7c3aed, #4f46e5)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '13px', fontWeight: '700', color: '#fff' }}>
                      {m.username[0].toUpperCase()}
                    </div>
                    <div>
                      <div style={{ color: '#e2e8f0', fontSize: '13px', fontWeight: '600' }}>{m.username}</div>
                      <div style={{ color: '#64748b', fontSize: '11px' }}>{m.role}</div>
                    </div>
                  </div>
                ))}
                <button onClick={() => { setShowMembersDropdown(false); setShowMemberModal(true); }}
                  style={{ width: '100%', background: 'rgba(139,92,246,0.1)', border: '1px solid rgba(139,92,246,0.2)', color: '#a78bfa', padding: '8px', borderRadius: '8px', cursor: 'pointer', fontSize: '13px', fontWeight: '600', marginTop: '12px' }}>
                  + Add Member
                </button>
              </div>
            )}
          </div>
          <button style={s.memberBtn} onClick={() => setShowMemberModal(true)}>
            <UserPlus size={15} /> Add Member
          </button>
          <motion.button whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }} style={s.addTaskBtn} onClick={() => setShowTaskModal(true)}>
            <Plus size={16} /> Add Task
          </motion.button>
        </div>
      </nav>

      <div style={s.board}>
        {COLUMNS.map(col => (
          <div key={col.id} style={s.col}>
            <div style={s.colHeader(col)}>
              <span style={s.colTitle(col)}>{col.emoji} {col.label}</span>
              <span style={s.colCount(col)}>{getByStatus(col.id).length}</span>
            </div>
            <div style={s.colBody}>
              {getByStatus(col.id).map((task, i) => (
                <motion.div key={task.id} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.05 }} whileHover={{ y: -2, boxShadow: '0 8px 25px rgba(0,0,0,0.3)' }} style={s.taskCard} onClick={() => openTask(task)}>
                  <div style={s.taskTitle}>{task.title}</div>
                  {task.description && <div style={s.taskDesc}>{task.description}</div>}
                  <div style={s.taskMeta}>
                    <span style={s.priorityBadge(task.priority)}><Flag size={10} style={{ display: 'inline', marginRight: '3px' }} />{PRIORITY[task.priority]?.label}</span>
                    {task.due_date && <span style={s.dueDateBadge}><Calendar size={11} />{task.due_date}</span>}
                  </div>
                  {task.assigned_username && (
                    <div style={s.assignee}>
                      <div style={s.assigneeAvatar}>{task.assigned_username[0].toUpperCase()}</div>
                      <span style={s.assigneeName}>{task.assigned_username}</span>
                    </div>
                  )}
                </motion.div>
              ))}
            </div>
          </div>
        ))}
      </div>

      <AnimatePresence>
        {selectedTask && (
          <div style={s.overlay}>
            <motion.div initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.9 }} style={s.detailModal}>
              <div style={s.detailHeader}>
                <div>
                  <div style={{ fontSize: '18px', fontWeight: '700', color: '#fff', marginBottom: '8px' }}>{selectedTask.title}</div>
                  <span style={s.priorityBadge(selectedTask.priority)}>{PRIORITY[selectedTask.priority]?.label} Priority</span>
                </div>
                <button style={s.closeBtn} onClick={() => setSelectedTask(null)}><X size={18} /></button>
              </div>
              <div style={s.detailBody}>
                {selectedTask.description && <p style={{ color: '#94a3b8', fontSize: '14px', marginBottom: '20px', lineHeight: '1.6' }}>{selectedTask.description}</p>}
                <div style={{ ...s.label, marginBottom: '10px' }}>Move to Column</div>
                <div style={s.statusBtns}>
                  {COLUMNS.map(col => (
                    <button key={col.id} onClick={() => handleStatusChange(selectedTask.id, col.id)}
                      style={{ fontSize: '12px', padding: '6px 14px', borderRadius: '20px', cursor: 'pointer', fontWeight: '600', border: `1px solid ${col.border}`, background: selectedTask.status === col.id ? col.bg : 'transparent', color: selectedTask.status === col.id ? col.color : '#64748b', transition: 'all 0.2s' }}>
                      {col.emoji} {col.label}
                    </button>
                  ))}
                </div>
                <div style={s.divider} />
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '14px' }}>
                  <MessageSquare size={16} color="#a78bfa" />
                  <span style={{ color: '#e2e8f0', fontWeight: '600', fontSize: '14px' }}>Comments ({comments.length})</span>
                </div>
                <div style={{ maxHeight: '180px', overflowY: 'auto', marginBottom: '12px' }}>
                  {comments.length === 0
                    ? <p style={{ color: '#475569', fontSize: '13px', textAlign: 'center', padding: '20px 0' }}>No comments yet</p>
                    : comments.map(c => (
                      <div key={c.id} style={s.commentBox}>
                        <div style={s.commentUser}>{c.username}</div>
                        <div style={s.commentText}>{c.content}</div>
                      </div>
                    ))
                  }
                </div>
                <div style={s.commentInputWrap}>
                  <input
                    ref={commentRef}
                    style={s.commentInput}
                    onKeyDown={handleCommentKeyDown}
                    placeholder="Write a comment... (Enter to send)"
                    autoComplete="off"
                  />
                  <button type="button" onClick={handleAddComment} style={s.sendBtn}>Send</button>
                </div>
                <button style={s.deleteBtn} onClick={() => handleDeleteTask(selectedTask.id)}>
                  <Trash2 size={14} /> Delete Task
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {showTaskModal && (
        <div style={s.overlay}>
          <motion.div initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} style={s.modal}>
            <div style={s.modalTitle}><Plus size={22} color="#a78bfa" /> Create New Task</div>
            <form onSubmit={handleCreateTask}>
              <label style={s.label}>Task Title</label>
              <input style={s.input} type="text" value={taskForm.title} onChange={e => setTaskForm({ ...taskForm, title: e.target.value })} placeholder="Enter task title" required />
              <label style={s.label}>Description</label>
              <textarea style={s.textarea} rows={3} value={taskForm.description} onChange={e => setTaskForm({ ...taskForm, description: e.target.value })} placeholder="Describe the task..." />
              <div style={s.grid2}>
                <div>
                  <label style={s.label}>Priority</label>
                  <select style={s.select} value={taskForm.priority} onChange={e => setTaskForm({ ...taskForm, priority: e.target.value })}>
                    <option value="low">🟢 Low</option>
                    <option value="medium">🟡 Medium</option>
                    <option value="high">🔴 High</option>
                  </select>
                </div>
                <div>
                  <label style={s.label}>Due Date</label>
                  <input style={s.input} type="date" value={taskForm.due_date} onChange={e => setTaskForm({ ...taskForm, due_date: e.target.value })} />
                </div>
              </div>
              <div style={s.btnRow}>
                <button type="button" style={s.cancelBtn} onClick={() => setShowTaskModal(false)}>Cancel</button>
                <button type="submit" style={s.submitBtn}>Create Task</button>
              </div>
            </form>
          </motion.div>
        </div>
      )}

      {showMemberModal && (
        <div style={s.overlay}>
          <motion.div initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} style={s.modal}>
            <div style={s.modalTitle}><UserPlus size={22} color="#a78bfa" /> Add Member</div>
            {memberError && <div style={{ background: 'rgba(239,68,68,0.1)', border: '1px solid rgba(239,68,68,0.3)', color: '#f87171', padding: '10px 14px', borderRadius: '10px', fontSize: '13px', marginBottom: '16px' }}>{memberError}</div>}
            <form onSubmit={handleAddMember}>
              <label style={s.label}>Member Email</label>
              <input style={s.input} type="email" value={memberEmail} onChange={e => setMemberEmail(e.target.value)} placeholder="Enter member's email address" required />
              <div style={s.btnRow}>
                <button type="button" style={s.cancelBtn} onClick={() => { setShowMemberModal(false); setMemberError(''); }}>Cancel</button>
                <button type="submit" style={s.submitBtn}>Add Member</button>
              </div>
            </form>
          </motion.div>
        </div>
      )}
    </div>
  );
}

export default ProjectBoard;