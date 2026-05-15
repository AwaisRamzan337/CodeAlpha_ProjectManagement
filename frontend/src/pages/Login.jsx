import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import axios from 'axios';
import { useAuth } from '../context/AuthContext';
import { LogIn, Mail, Lock } from 'lucide-react';

const s = {
  page: { minHeight: '100vh', background: 'linear-gradient(135deg, #0a0f1e 0%, #0f0a2e 50%, #0a0f1e 100%)', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '16px' },
  wrap: { width: '100%', maxWidth: '420px' },
  logo: { textAlign: 'center', marginBottom: '36px' },
  logoText: { fontSize: '46px', fontWeight: '800', background: 'linear-gradient(135deg, #a78bfa, #7c3aed)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent', display: 'block', marginBottom: '6px' },
  logoSub: { color: '#475569', fontSize: '14px' },
  card: { background: 'rgba(20,27,45,0.9)', backdropFilter: 'blur(20px)', borderRadius: '24px', padding: '40px', border: '1px solid rgba(139,92,246,0.15)', boxShadow: '0 30px 60px rgba(0,0,0,0.5)' },
  cardHeader: { display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '28px' },
  iconBox: { background: 'rgba(139,92,246,0.15)', borderRadius: '12px', padding: '10px', display: 'flex' },
  cardTitle: { fontSize: '22px', fontWeight: '700', color: '#fff' },
  error: { background: 'rgba(239,68,68,0.08)', border: '1px solid rgba(239,68,68,0.25)', color: '#f87171', padding: '12px 16px', borderRadius: '12px', marginBottom: '20px', fontSize: '13px' },
  label: { color: '#64748b', fontSize: '12px', fontWeight: '600', display: 'block', marginBottom: '7px', textTransform: 'uppercase', letterSpacing: '0.05em' },
  inputWrap: { position: 'relative', marginBottom: '16px' },
  icon: { position: 'absolute', left: '14px', top: '50%', transform: 'translateY(-50%)', color: '#475569', pointerEvents: 'none' },
  input: { width: '100%', background: 'rgba(10,15,30,0.8)', border: '1px solid rgba(139,92,246,0.15)', borderRadius: '12px', padding: '13px 14px 13px 42px', color: '#e2e8f0', fontSize: '14px', outline: 'none', boxSizing: 'border-box' },
  btn: { width: '100%', background: 'linear-gradient(135deg, #7c3aed, #6d28d9)', color: '#fff', fontWeight: '700', fontSize: '15px', padding: '14px', borderRadius: '12px', border: 'none', cursor: 'pointer', marginTop: '8px', boxShadow: '0 4px 20px rgba(124,58,237,0.4)' },
  footer: { color: '#475569', fontSize: '14px', textAlign: 'center', marginTop: '24px' },
  link: { color: '#a78bfa', fontWeight: '600', textDecoration: 'none' },
};

function Login() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const { login } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    try {
      const res = await axios.post('http://localhost:5000/api/auth/login', { email, password });
      login({ id: res.data.userId, username: res.data.username }, res.data.token);
      setEmail('');
      setPassword('');
      navigate('/dashboard');
    } catch (err) {
      setError(err.response?.data?.error || 'Login failed');
    }
    setLoading(false);
  };

  return (
    <div style={s.page}>
      <motion.div initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5 }} style={s.wrap}>
        <div style={s.logo}>
          <span style={s.logoText}>LoopSpace</span>
          <span style={s.logoSub}>Project Management Tool</span>
        </div>
        <div style={s.card}>
          <div style={s.cardHeader}>
            <div style={s.iconBox}><LogIn size={20} color="#a78bfa" /></div>
            <h2 style={s.cardTitle}>Welcome Back</h2>
          </div>
          {error && <div style={s.error}>{error}</div>}
          <form onSubmit={handleSubmit} autoComplete="off">
            <label style={s.label}>Email</label>
            <div style={s.inputWrap}>
              <Mail size={16} style={s.icon} />
              <input
                style={s.input}
                type="email"
                name="login-email"
                value={email}
                onChange={e => setEmail(e.target.value)}
                placeholder="Enter your email"
                autoComplete="new-password"
                required
              />
            </div>
            <label style={s.label}>Password</label>
            <div style={s.inputWrap}>
              <Lock size={16} style={s.icon} />
              <input
                style={s.input}
                type="password"
                name="login-password"
                value={password}
                onChange={e => setPassword(e.target.value)}
                placeholder="Enter your password"
                autoComplete="new-password"
                required
              />
            </div>
            <motion.button whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }} type="submit" disabled={loading} style={{ ...s.btn, opacity: loading ? 0.6 : 1 }}>
              {loading ? 'Logging in...' : 'Login'}
            </motion.button>
          </form>
          <p style={s.footer}>Don't have an account?{' '}<Link to="/register" style={s.link}>Register</Link></p>
        </div>
      </motion.div>
    </div>
  );
}

export default Login;