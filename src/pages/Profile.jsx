import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { LogOut, Star, Trophy, Shield, Zap, Edit2, Check } from 'lucide-react';
import { useStore } from '../store/useStore';
import './Profile.css';

export default function Profile() {
  const navigate = useNavigate();
  const { userId, displayName, age, birthday, coins, level, xp, badges, gamesCompleted, purchasedItems, logout, avatar, setAvatar } = useStore();
  const [isPickerOpen, setIsPickerOpen] = useState(false);

  const standardAvatars = ['🐻', '🦁', '🦊', '🐯', '🐰', '🐼', '🐨', '🐸', '🐶', '🐱'];
  const storeEmojiMap = {
    'avatar_unicorn': '🦄', 'avatar_dino': '🦖', 'avatar_ninja': '🥷',
    'avatar_robot': '🤖', 'avatar_alien': '👽', 'avatar_dragon': '🐉'
  };
  const unlockedAvatars = (purchasedItems || []).filter(id => storeEmojiMap[id]).map(id => storeEmojiMap[id]);
  const availableAvatars = [...standardAvatars, ...unlockedAvatars];

  useEffect(() => {
    if (!userId) navigate('/login');
  }, [userId, navigate]);

  if (!userId) return null;

  const handleLogout = () => { logout(); navigate('/'); };

  return (
    <div className="profile-page">
      <div className="container profile-container">

        {/* Header Card */}
        <motion.div className="profile-header card" initial={{ y: 20, opacity: 0 }} animate={{ y: 0, opacity: 1 }}>
          <div className="profile-avatar-wrapper">
            <div className="profile-avatar" onClick={() => setIsPickerOpen(!isPickerOpen)}>
              {avatar || '🐻'}
            </div>
            <div className="edit-avatar-badge" onClick={() => setIsPickerOpen(!isPickerOpen)}>
              <Edit2 size={18} />
            </div>
            {isPickerOpen && (
              <div className="avatar-picker card">
                <h4>Pick your hero!</h4>
                <div className="avatar-grid">
                  {availableAvatars.map(a => (
                    <button key={a} className={`avatar-option ${avatar === a ? 'selected' : ''}`}
                      onClick={() => { setAvatar(a); setIsPickerOpen(false); }}>
                      {a}
                    </button>
                  ))}
                </div>
                <div style={{ textAlign: 'center', marginTop: 12, fontSize: 14 }}>
                  <a href="/store" style={{ color: 'var(--teal)', fontWeight: 'bold', textDecoration: 'none' }}>Unlock more in the Epic Store ✨</a>
                </div>
              </div>
            )}
          </div>

          <div className="profile-info">
            <h1 className="profile-name">{displayName || userId}</h1>
            <div className="profile-details text-gray-500 mt-1 flex gap-4" style={{ fontSize: 14 }}>
              {age && <span>🎂 Age: {age}</span>}
              {birthday && <span>📅 {new Date(birthday).toLocaleDateString()}</span>}
            </div>
            <p className="profile-title" style={{ color: 'var(--teal)', fontWeight: 700, marginTop: 4 }}>Level {level} Super Brusher</p>
          </div>

          <button className="btn btn-outline ml-auto flex items-center gap-2" style={{ color: '#f87171', borderColor: '#f87171' }} onClick={handleLogout}>
            <LogOut size={18} /> Logout
          </button>
        </motion.div>

        {/* Stats Grid */}
        <div className="stats-grid">
          <motion.div className="stat-card" initial={{ scale: 0.8, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} transition={{ delay: 0.1 }}>
            <div className="stat-icon bg-yellow-100 text-yellow-600"><Star /></div>
            <div className="stat-value">{coins}</div>
            <div className="stat-label">Total Coins</div>
          </motion.div>
          <motion.div className="stat-card" initial={{ scale: 0.8, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} transition={{ delay: 0.2 }}>
            <div className="stat-icon bg-blue-100 text-blue-600"><Zap /></div>
            <div className="stat-value">{xp}</div>
            <div className="stat-label">Experience Points</div>
          </motion.div>
          <motion.div className="stat-card" initial={{ scale: 0.8, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} transition={{ delay: 0.3 }}>
            <div className="stat-icon bg-green-100 text-green-600"><Trophy /></div>
            <div className="stat-value">{gamesCompleted.length} / 20</div>
            <div className="stat-label">Games Mastered</div>
          </motion.div>
        </div>

        {/* Badges Section */}
        <div className="badges-section card mt-8">
          <h2 className="section-title flex items-center gap-2 mb-6">
            <Shield className="text-teal-500" /> Earned Badges
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
            <div className="empty-state text-center py-8">
              <div className="text-4xl mb-4 opacity-50">🌱</div>
              <p className="text-gray-500">Play games to earn your first badge!</p>
              <button className="btn btn-primary mt-4" onClick={() => navigate('/games')}>Go to Games</button>
            </div>
          )}
        </div>

      </div>
    </div>
  );
}
