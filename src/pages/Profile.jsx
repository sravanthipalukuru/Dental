import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Camera, ChevronDown } from 'lucide-react';
import { useStore } from '../store/useStore';
import './Profile.css';

export default function Profile() {
  const navigate = useNavigate();
  const { userId, displayName, age, birthday, avatar, setAvatar, setProfile } = useStore();
  
  const [tempName, setTempName] = useState('');
  const [tempAge, setTempAge] = useState('');
  const [tempBirthday, setTempBirthday] = useState('');
  const [loading, setLoading] = useState(false);
  const [isPickerOpen, setIsPickerOpen] = useState(false);

  const standardAvatars = ['🐻', '🦁', '🦊', '🐯', '🐰', '🐼', '🐨', '🐸', '🐶', '🐱'];

  useEffect(() => {
    if (!userId) {
      navigate('/login');
      return;
    }
    setTempName(displayName || '');
    setTempAge(age || '');
    setTempBirthday(birthday || '');
  }, [userId, displayName, age, birthday, navigate]);

  if (!userId) return null;

  const handleSave = () => {
    setLoading(true);
    const dataToSave = {};
    if (tempName.trim()) dataToSave.displayName = tempName.trim();
    if (tempAge !== '') dataToSave.age = parseInt(tempAge, 10) || null;
    if (tempBirthday !== '') dataToSave.birthday = tempBirthday;
    
    setProfile(dataToSave);
    
    setTimeout(() => {
      setLoading(false);
      navigate('/'); // Or somewhere else after saving
    }, 500);
  };

  return (
    <div className="profile-setup-page">
      <div className="profile-setup-container">
        <h1 className="profile-setup-title">Child Profile</h1>
        
        <div className="profile-setup-avatar-wrapper">
          <div className="profile-setup-avatar">
            {avatar || '😊'}
          </div>
          <button 
            className="profile-camera-badge"
            onClick={() => setIsPickerOpen(!isPickerOpen)}
          >
            <Camera size={16} color="white" />
          </button>
          
          {isPickerOpen && (
            <div className="avatar-picker-dropdown">
              {standardAvatars.map(a => (
                <button 
                  key={a} 
                  className={`avatar-option ${avatar === a ? 'selected' : ''}`}
                  onClick={() => { setAvatar(a); setIsPickerOpen(false); }}
                >
                  {a}
                </button>
              ))}
            </div>
          )}
        </div>

        <div className="profile-setup-form">
          <div className="profile-form-group">
            <label>Child's Name</label>
            <input 
              type="text" 
              placeholder="Enter name"
              value={tempName}
              onChange={(e) => setTempName(e.target.value)}
            />
          </div>

          <div className="profile-form-group">
            <label>Age</label>
            <div className="profile-input-with-icon">
              <span className="profile-input-icon">🎂</span>
              <input 
                type="number" 
                placeholder="Age"
                value={tempAge}
                onChange={(e) => setTempAge(e.target.value)}
              />
            </div>
          </div>

          <div className="profile-form-group">
            <label>Birthday</label>
            <div className="profile-input-with-icon">
              <span className="profile-input-icon">📅</span>
              <input 
                type="date" 
                value={tempBirthday}
                onChange={(e) => setTempBirthday(e.target.value)}
              />
              <ChevronDown className="profile-input-suffix" size={20} />
            </div>
          </div>

          <button className="profile-save-btn" onClick={handleSave} disabled={loading}>
            {loading ? 'Saving...' : 'Save Profile'}
          </button>
        </div>
      </div>
    </div>
  );
}
