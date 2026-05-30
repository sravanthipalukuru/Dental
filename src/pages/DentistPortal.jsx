import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Search, UserPlus, AlertCircle, CheckCircle2, X, User, Star, Gamepad2, TrendingUp, ArrowLeft } from 'lucide-react';
import './DentistPortal.css';

export default function DentistPortal() {
  const [patientsList, setPatientsList] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [showInviteModal, setShowInviteModal] = useState(false);
  const [inviteUsername, setInviteUsername] = useState('');
  const [inviteStatus, setInviteStatus] = useState(null); // null | 'loading' | 'success' | 'error'
  const [inviteError, setInviteError] = useState('');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedPatient, setSelectedPatient] = useState(null); // for View Profile

  const fetchPatients = () => {
    fetch('/api/patients')
      .then(res => res.json())
      .then(data => { setPatientsList(data); setIsLoading(false); })
      .catch(() => setIsLoading(false));
  };

  useEffect(() => { fetchPatients(); }, []);

  const totalPatients = patientsList.length;
  const avgReduction = totalPatients > 0
    ? Math.round(patientsList.reduce((acc, p) => acc + Math.max(0, (50 - (p.anxietyScore || 50)) * 2), 0) / totalPatients)
    : 0;
  const needsPrepCount = patientsList.filter(p => (p.readinessScore || 0) < 70).length;

  const filteredPatients = patientsList.filter(p =>
    (p.displayName || p.userId || '').toLowerCase().includes(searchQuery.toLowerCase())
  );

  const handleInvite = async () => {
    if (!inviteUsername.trim()) return;
    setInviteStatus('loading');
    setInviteError('');
    try {
      const res = await fetch('/api/dentist/invite', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username: inviteUsername.trim() }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Patient not found');
      setInviteStatus('success');
      fetchPatients();
      setTimeout(() => {
        setShowInviteModal(false);
        setInviteUsername('');
        setInviteStatus(null);
      }, 1800);
    } catch (err) {
      setInviteStatus('error');
      setInviteError(err.message);
    }
  };

  // ── PATIENT PROFILE VIEW ──
  if (selectedPatient) {
    const p = selectedPatient;
    const readiness = p.readinessScore || 0;
    const gamesCompleted = Object.values(p.gameLevels || {}).filter(v => v > 0).length;
    return (
      <div className="dentist-portal section-pad">
        <div className="container">
          <button className="btn btn-outline mb-24" onClick={() => setSelectedPatient(null)}>
            <ArrowLeft size={18}/> Back to Dashboard
          </button>
          <motion.div className="card profile-detail-card" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
            <div className="profile-detail-header">
              <span className="avatar-lg">{p.avatar || '🐻'}</span>
              <div>
                <h2>{p.displayName || p.userId}</h2>
                <p className="text-gray">Patient ID: {p.userId}</p>
              </div>
              <span className={`status-badge ${readiness > 70 ? 'status-ready' : 'status-warning'} ml-auto`}>
                {readiness > 70 ? <><CheckCircle2 size={14}/> Ready</> : <><AlertCircle size={14}/> Needs Prep</>}
              </span>
            </div>

            <div className="profile-stats-grid mt-24">
              <div className="profile-stat-box">
                <TrendingUp size={28} color="var(--teal)"/>
                <span className="profile-stat-value">{readiness}%</span>
                <span className="profile-stat-label">Readiness Score</span>
                <div className="readiness-bar-container" style={{ width: '100%', marginTop: 8 }}>
                  <div className="readiness-bar" style={{ width: `${readiness}%`, background: readiness > 70 ? 'var(--teal)' : readiness > 50 ? 'var(--yellow-dark)' : 'var(--pink)' }}></div>
                </div>
              </div>
              <div className="profile-stat-box">
                <Gamepad2 size={28} color="var(--pink)"/>
                <span className="profile-stat-value">{gamesCompleted}</span>
                <span className="profile-stat-label">Games Completed</span>
              </div>
              <div className="profile-stat-box">
                <Star size={28} color="var(--yellow-dark)" fill="var(--yellow-dark)"/>
                <span className="profile-stat-value">{p.coins || 0}</span>
                <span className="profile-stat-label">Coins Earned</span>
              </div>
              <div className="profile-stat-box">
                <User size={28} color="var(--blue)"/>
                <span className="profile-stat-value">{p.xp || 0}</span>
                <span className="profile-stat-label">Total XP</span>
              </div>
            </div>

            {p.gameLevels && Object.keys(p.gameLevels).length > 0 && (
              <div className="mt-24">
                <h3 className="mb-12">Game Progress</h3>
                <div className="game-levels-grid">
                  {Object.entries(p.gameLevels).map(([gameId, level]) => (
                    <div key={gameId} className="game-level-chip">
                      <span>Game #{gameId}</span>
                      <span className="game-level-badge">Lv. {level}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </motion.div>
        </div>
      </div>
    );
  }

  // ── MAIN DASHBOARD ──
  return (
    <div className="dentist-portal section-pad">
      <div className="container">
        <header className="portal-header-simple">
          <div>
            <h1>Clinic Dashboard</h1>
            <p className="text-gray">Overview of patient readiness and anxiety analytics.</p>
          </div>
          <button className="btn btn-primary" onClick={() => setShowInviteModal(true)}>
            <UserPlus size={18}/> Invite Patient
          </button>
        </header>

        <div className="dentist-stats mb-48">
          <div className="card stat-card">
            <span className="stat-label">Total Active Patients</span>
            <span className="stat-value text-teal">{totalPatients}</span>
          </div>
          <div className="card stat-card">
            <span className="stat-value text-pink">{avgReduction}%</span>
            <span className="stat-label">Avg. Anxiety Reduction</span>
          </div>
          <div className="card stat-card">
            <span className="stat-value text-yellow">{needsPrepCount}</span>
            <span className="stat-label">Patients Need Prep</span>
          </div>
        </div>

        <motion.div className="card" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
          <div className="card-header list-header">
            <h3>Upcoming Appointments</h3>
            <div className="search-bar">
              <Search size={18} color="var(--gray-400)" />
              <input
                type="text"
                placeholder="Search patients..."
                value={searchQuery}
                onChange={e => setSearchQuery(e.target.value)}
              />
            </div>
          </div>

          <div className="patient-table-container">
            {isLoading ? (
              <p className="text-center p-4">Loading patients...</p>
            ) : (
              <table className="patient-table">
                <thead>
                  <tr>
                    <th>Patient</th>
                    <th>Next Appt</th>
                    <th>Readiness Score</th>
                    <th>Status</th>
                    <th>Action</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredPatients.map((p) => {
                    const readiness = p.readinessScore || 0;
                    const name = p.displayName || p.userId || 'Unknown';
                    return (
                      <tr key={p._id || p.userId}>
                        <td>
                          <div className="patient-name">
                            <span className="avatar-sm" style={{ fontSize: '20px' }}>{p.avatar || '🐻'}</span>
                            <div><strong>{name}</strong></div>
                          </div>
                        </td>
                        <td>Upcoming</td>
                        <td>
                          <div className="readiness-bar-container">
                            <div className="readiness-bar" style={{
                              width: `${readiness}%`,
                              background: readiness > 70 ? 'var(--teal)' : readiness > 50 ? 'var(--yellow-dark)' : 'var(--pink)'
                            }}></div>
                          </div>
                          <span className="readiness-text">{readiness}%</span>
                        </td>
                        <td>
                          {readiness > 70 ? (
                            <span className="status-badge status-ready"><CheckCircle2 size={14}/> Ready</span>
                          ) : (
                            <span className="status-badge status-warning"><AlertCircle size={14}/> Needs Prep</span>
                          )}
                        </td>
                        <td>
                          <button
                            className="btn btn-outline btn-sm"
                            onClick={() => setSelectedPatient(p)}
                          >
                            View Profile
                          </button>
                        </td>
                      </tr>
                    );
                  })}
                  {filteredPatients.length === 0 && (
                    <tr><td colSpan="5" className="text-center">No patients found.</td></tr>
                  )}
                </tbody>
              </table>
            )}
          </div>
        </motion.div>
      </div>

      {/* ── INVITE PATIENT MODAL ── */}
      <AnimatePresence>
        {showInviteModal && (
          <motion.div
            className="modal-overlay"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={(e) => e.target === e.currentTarget && setShowInviteModal(false)}
          >
            <motion.div
              className="modal-card"
              initial={{ scale: 0.85, opacity: 0, y: 30 }}
              animate={{ scale: 1, opacity: 1, y: 0 }}
              exit={{ scale: 0.85, opacity: 0, y: 30 }}
              transition={{ type: 'spring', bounce: 0.4 }}
            >
              <div className="modal-header">
                <div className="modal-icon"><UserPlus size={28} color="var(--teal)"/></div>
                <div>
                  <h2 className="modal-title">Invite a Patient</h2>
                  <p className="text-gray" style={{ fontSize: 14 }}>Enter the patient's username to add them to your clinic.</p>
                </div>
                <button className="modal-close-btn" onClick={() => { setShowInviteModal(false); setInviteStatus(null); setInviteUsername(''); }}>
                  <X size={20}/>
                </button>
              </div>

              <div className="modal-body">
                <label className="input-label">Patient Username</label>
                <input
                  className="modal-input"
                  type="text"
                  placeholder="e.g. nk007"
                  value={inviteUsername}
                  onChange={e => setInviteUsername(e.target.value)}
                  onKeyDown={e => e.key === 'Enter' && handleInvite()}
                  disabled={inviteStatus === 'loading' || inviteStatus === 'success'}
                  autoFocus
                />

                {inviteStatus === 'error' && (
                  <motion.p className="invite-error" initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
                    <AlertCircle size={16}/> {inviteError}
                  </motion.p>
                )}

                {inviteStatus === 'success' && (
                  <motion.p className="invite-success" initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
                    <CheckCircle2 size={16}/> Patient added successfully!
                  </motion.p>
                )}
              </div>

              <div className="modal-footer">
                <button className="btn btn-outline" onClick={() => setShowInviteModal(false)}>Cancel</button>
                <button
                  className="btn btn-primary"
                  onClick={handleInvite}
                  disabled={!inviteUsername.trim() || inviteStatus === 'loading' || inviteStatus === 'success'}
                >
                  {inviteStatus === 'loading' ? 'Adding...' : inviteStatus === 'success' ? '✓ Added!' : 'Add Patient'}
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
