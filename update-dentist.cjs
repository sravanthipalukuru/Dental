const fs = require('fs');
const path = require('path');

const filePath = path.join(__dirname, 'src/pages/DentistPortal.jsx');

const newContent = `import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Search, UserPlus, AlertCircle, CheckCircle2 } from 'lucide-react';
import './DentistPortal.css';

export default function DentistPortal() {
  const [patientsList, setPatientsList] = useState([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    fetch('/api/patients')
      .then(res => res.json())
      .then(data => {
        setPatientsList(data);
        setIsLoading(false);
      })
      .catch(err => {
        console.error(err);
        setIsLoading(false);
      });
  }, []);

  const totalPatients = patientsList.length;
  const totalReduction = patientsList.reduce((acc, p) => acc + Math.max(0, (50 - (p.anxietyScore || 50)) * 2), 0);
  const avgReduction = totalPatients > 0 ? Math.round(totalReduction / totalPatients) : 0;
  const needsPrepCount = patientsList.filter(p => (p.readinessScore || 0) < 70).length;

  return (
    <div className="dentist-portal section-pad">
      <div className="container">
        <header className="portal-header-simple">
          <div>
            <h1>Clinic Dashboard</h1>
            <p className="text-gray">Overview of patient readiness and anxiety analytics.</p>
          </div>
          <button className="btn btn-primary"><UserPlus size={18}/> Invite Patient</button>
        </header>

        {/* Global Stats */}
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

        {/* Patient List */}
        <motion.div 
          className="card"
          initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}
        >
          <div className="card-header list-header">
            <h3>Upcoming Appointments</h3>
            <div className="search-bar">
              <Search size={18} color="var(--gray-400)" />
              <input type="text" placeholder="Search patients..." />
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
                {patientsList.map((p) => {
                  const readiness = p.readinessScore || 0;
                  const statusStr = readiness > 70 ? 'Ready' : 'Needs Prep';
                  const name = p.displayName || p.userId || 'Unknown';
                  return (
                  <tr key={p._id || p.userId}>
                    <td>
                      <div className="patient-name">
                        <span className="avatar-sm" style={{fontSize: '20px'}}>{p.avatar || '🐻'}</span>
                        <div>
                          <strong>{name}</strong>
                        </div>
                      </div>
                    </td>
                    <td>Upcoming</td>
                    <td>
                      <div className="readiness-bar-container">
                        <div 
                          className="readiness-bar" 
                          style={{ 
                            width: \`\${readiness}%\`,
                            background: readiness > 70 ? 'var(--teal)' : readiness > 50 ? 'var(--yellow-dark)' : 'var(--pink)'
                          }}
                        ></div>
                      </div>
                      <span className="readiness-text">{readiness}%</span>
                    </td>
                    <td>
                      {readiness > 70 ? (
                        <span className="status-badge status-ready"><CheckCircle2 size={14}/> {statusStr}</span>
                      ) : (
                        <span className="status-badge status-warning"><AlertCircle size={14}/> {statusStr}</span>
                      )}
                    </td>
                    <td><button className="btn btn-outline btn-sm">View Profile</button></td>
                  </tr>
                )})}
                {patientsList.length === 0 && (
                  <tr><td colSpan="5" className="text-center">No patients found.</td></tr>
                )}
              </tbody>
            </table>
            )}
          </div>
        </motion.div>
      </div>
    </div>
  );
}
`;

fs.writeFileSync(filePath, newContent, 'utf8');
console.log('DentistPortal updated');
