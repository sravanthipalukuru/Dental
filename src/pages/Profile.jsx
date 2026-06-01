import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { LogOut, Star, Trophy, Shield, Zap, Edit2 } from 'lucide-react';
import { useStore } from '../store/useStore';
import './Profile.css';

export default function Profile() {
  const navigate = useNavigate();
  const {
    userId, displayName, age, birthday,
    coins, level, xp, badges, gamesCompleted,
    purchasedItems, logout, avatar, setAvatar
  } = useStore();
  const [isPickerOpen, setIsPickerOpen] = useState(false);

  const standardAvatars = ['🐻', '🦁', '🦊', '🐯', '🐰', '🐼', '🐨', '🐸', '🐶', '🐱'];
  const storeEmojiMap = {
    'avatar_unicorn': '🦄', 'avatar_dino': '🦖', 'avatar_ninja': '🥷',
    'avatar_robot': '🤖', 'avatar_alien': '👽', 'avatar_dragon': '🐉'
  };
  const unlockedAvatars = (purchasedItems || [])
    .filter(id => storeEmojiMap[id])
    .map(id => storeEmojiMap[id]);
  const availableAvatars = [...standardAvatars, ...unlockedAvatars];

  useEffect(() => {
    if (!userId) navigate('/login');
  }, [userId, navigate]);

  if (!userId) return null;

  const handleLogout = () => { logout(); navigate('/'); };

  const stats = [
    { icon: <Star />, value: coins,                        label: 'Total Coins',        bg: '#fef9c3', color: '#d97706' },
    { icon: <Zap />,  value: xp,                           label: 'Experience Points',  bg: '#eff6ff', color: '#2563eb' },
    { icon: <Trophy />, value: `${gamesCompleted.length} / 20`, label: 'Games Mastered', bg: '#f0fdf4', color: '#16a34a' },
  ];

  return (
    <div className="profile-page">
      <div className="profile-container">

        {/* ── Header Card ── */}
        <motion.div
          className="profile-header"
          initial={{ y: -20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ duration: 0.4 }}
        >
          {/* Avatar */}
          <div className="profile-avatar-wrapper">
            <div className="profile-avatar" onClick={() => setIsPickerOpen(!isPickerOpen)}>
              {avatar || '🐻'}
            </div>
            <div className="edit-avatar-badge" onClick={() => setIsPickerOpen(!isPickerOpen)}>
              <Edit2 size={14} />
            </div>
            {isPickerOpen && (
              <div className="avatar-picker">
                <h4>Pick your hero!</h4>
                <div className="avatar-grid">
                  {availableAvatars.map(a => (
                    <button
                      key={a}
                      className={`avatar-option ${avatar === a ? 'selected' : ''}`}
                      onClick={() => { setAvatar(a); setIsPickerOpen(false); }}
                    >
                      {a}
                    </button>
                  ))}
                </div>
                <div style={{ textAlign: 'center', marginTop: 12, fontSize: 13 }}>
                  <a href="/store" style={{ color: '#0d9488', fontWeight: 700, textDecoration: 'none' }}>
                    Unlock more in the Epic Store ✨
                  </a>
                </div>
              </div>
            )}
          </div>

          {/* Info */}
          <div className="profile-info">
            <h1 className="profile-name">{displayName || userId}</h1>
            <div className="profile-details">
              {age     && <span>🎂 Age: {age}</span>}
              {birthday && <span>📅 {new Date(birthday).toLocaleDateString()}</span>}
            </div>
            <span className="profile-title">Level {level} Super Brusher 🦷</span>
          </div>

          {/* Logout */}
          <button className="logout-btn" onClick={handleLogout}>
            <LogOut size={16} /> Logout
          </button>
        </motion.div>

        {/* ── Stats Grid ── */}
        <div className="stats-grid">
          {stats.map((s, i) => (
            <motion.div
              key={i}
              className="stat-card"
              initial={{ scale: 0.85, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              transition={{ delay: 0.1 + i * 0.1 }}
            >
              <div className="stat-icon" style={{ background: s.bg, color: s.color }}>
                {s.icon}
              </div>
              <div className="stat-value">{s.value}</div>
              <div className="stat-label">{s.label}</div>
            </motion.div>
          ))}
        </div>

        {/* ── Badges Section ── */}
        <motion.div
          className="badges-section"
          initial={{ y: 20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.4 }}
        >
          <h2 className="section-title">
            <Shield size={22} color="#0d9488" /> Earned Badges
          </h2>

          {badges && badges.length > 0 ? (
            <div className="badges-grid">
              {badges.map((badge, i) => (
                <div key={i} className="badge-item">
                  <div className="badge-icon">🏅</div>
                  <div className="badge-name">{badge}</div>
                </div>
              ))}
            </div>
          ) : (
            <div className="empty-state">
              <div style={{ fontSize: 48, marginBottom: 12, opacity: 0.5 }}>🌱</div>
              <p style={{ color: '#94a3b8', marginBottom: 16 }}>Play games to earn your first badge!</p>
              <button className="btn btn-primary" onClick={() => navigate('/games')}>
                Go to Games 🎮
              </button>
            </div>
          )}
        </motion.div>

      </div>
    </div>
  );
}
