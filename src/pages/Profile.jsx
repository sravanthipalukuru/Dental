import { useEffect, useState, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { LogOut, Star, Trophy, Shield, Zap, Edit2, Check } from 'lucide-react';
import { useStore } from '../store/useStore';
import './Profile.css';

export default function Profile() {
  const navigate = useNavigate();
  const { userId, displayName, age, birthday, coins, level, xp, badges, gamesCompleted, purchasedItems, logout, avatar, setAvatar, setProfile } = useStore();
  const [isPickerOpen, setIsPickerOpen] = useState(false);
  const [isEditingName, setIsEditingName] = useState(false);
  const [tempName, setTempName] = useState('');
  const [tempAge, setTempAge] = useState('');
  const [tempBirthday, setTempBirthday] = useState('');
  const inputRef = useRef(null);

  const standardAvatars = ['🐻', '🦁', '🦊', '🐯', '🐰', '🐼', '🐨', '🐸', '🐶', '🐱'];
  const storeEmojiMap = {
    'avatar_unicorn': '🦄',
    'avatar_dino': '🦖',
    'avatar_ninja': '🥷',
    'avatar_robot': '🤖',
    'avatar_alien': '👽',
    'avatar_dragon': '🐉'
  };
  const unlockedAvatars = (purchasedItems || []).filter(id => storeEmojiMap[id]).map(id => storeEmojiMap[id]);
  const availableAvatars = [...standardAvatars, ...unlockedAvatars];

  // If not logged in, boot them to login page
  useEffect(() => {
    if (!userId) {
      navigate('/login');
    }
  }, [userId, navigate]);

  if (!userId) return null;

  const handleLogout = () => {
    logout();
    navigate('/');
  };

  const getAvatar = (name) => {
    const avatars = ['🐻', '🦁', '🦊', '🐯', '🐰', '🐼', '🐨', '🐸', '🦄'];
    const charCode = name.charCodeAt(0) || 0;
    return avatars[charCode % avatars.length];
  };

  const startEditing = () => {
    setTempName(displayName || userId);
    setTempAge(age || '');
    setTempBirthday(birthday || '');
    setIsEditingName(true);
    setTimeout(() => inputRef.current?.focus(), 50);
  };

  const saveProfileInfo = () => {
    const dataToSave = {};
    if (tempName.trim()) dataToSave.displayName = tempName.trim();
    if (tempAge !== '') dataToSave.age = parseInt(tempAge, 10) || null;
    if (tempBirthday !== '') dataToSave.birthday = tempBirthday;
    
    setProfile(dataToSave);
    setIsEditingName(false);
  };

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
                    <button 
                      key={a} 
                      className={`avatar-option ${avatar === a ? 'selected' : ''}`}
                      onClick={() => { setAvatar(a); setIsPickerOpen(false); }}
                    >
                      {a}
                    </button>
                  ))}
                </div>
                <div style={{textAlign: 'center', marginTop: 12, fontSize: 14}}>
                  <a href="/store" style={{color: 'var(--color-primary)', fontWeight: 'bold', textDecoration: 'none'}}>Unlock more in the Epic Store ✨</a>
                </div>
              </div>
            )}
          </div>
          
          <div className="profile-info">
            {isEditingName ? (
              <div className="name-edit-container flex-col">
                <input 
                  ref={inputRef}
                  className="name-input mb-2"
                  placeholder="Name"
                  value={tempName}
                  onChange={(e) => setTempName(e.target.value)}
                />
                <div className="flex gap-2 mb-2">
                  <div className="input-with-icon flex-1">
                    <span className="input-icon">🎂</span>
                    <input 
                      type="number"
                      className="name-input w-full"
                      placeholder="Age"
                      value={tempAge}
                      onChange={(e) => setTempAge(e.target.value)}
                    />
                  </div>
                  <div className="input-with-icon flex-1">
                    <span className="input-icon">📅</span>
                    <input 
                      type="date"
                      className="name-input w-full"
                      placeholder="Birthday"
                      value={tempBirthday}
                      onChange={(e) => setTempBirthday(e.target.value)}
                    />
                  </div>
                </div>
                <button className="save-name-btn w-full justify-center" onClick={saveProfileInfo}>
                  <Check size={20} /> Save Profile
                </button>
              </div>
            ) : (
              <div className="name-display-container flex-col items-start">
                <div className="flex items-center gap-4">
                  <h1 className="profile-name">{displayName || userId}</h1>
                  <button className="edit-name-btn" onClick={startEditing}>
                    <Edit2 size={16} /> Edit
                  </button>
                </div>
                <div className="profile-details text-gray-500 mt-2 flex gap-4">
                  {age && <span>🎂 Age: {age}</span>}
                  {birthday && <span>📅 Birthday: {new Date(birthday).toLocaleDateString()}</span>}
                </div>
              </div>
            )}
            <p className="profile-title text-teal-600 font-bold">Level {level} Super Brusher</p>
          </div>
          <button className="btn btn-outline ml-auto flex items-center gap-2 text-pink-500 border-pink-500" onClick={handleLogout}>
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
