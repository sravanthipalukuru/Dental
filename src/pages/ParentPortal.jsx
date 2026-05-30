import { motion } from 'framer-motion';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Area, AreaChart } from 'recharts';
import { Bell, Heart, Shield, Award } from 'lucide-react';
import { useStore } from '../store/useStore';
import './ParentPortal.css';

const anxietyData = [
  { session: 'Week 1', score: 85 },
  { session: 'Week 2', score: 70 },
  { session: 'Week 3', score: 65 },
  { session: 'Week 4', score: 45 },
  { session: 'Week 5', score: 30 },
];

export default function ParentPortal() {
  const { anxietyScore, readinessScore, gamesCompleted, level, displayName } = useStore();
  const childName = displayName || 'Your Child';
  const anxietyReduction = Math.max(0, (50 - anxietyScore) * 2);
  
  // Use current live score for latest data point
  const liveData = [...anxietyData, { session: 'Current', score: anxietyScore }];

  return (
    <div className="parent-portal section-pad">
      <div className="container">
        <header className="portal-header-simple">
          <div>
            <h1>Parent Dashboard</h1>
            <p className="text-gray">Track {childName}'s progress and anxiety reduction.</p>
          </div>
          <button className="btn btn-outline"><Bell size={18}/> Notifications</button>
        </header>

        <div className="dashboard-grid">
          {/* Main Chart */}
          <motion.div 
            className="card chart-card col-span-2"
            initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}
          >
            <div className="card-header">
              <h3>Smart Anxiety Index™</h3>
              <span className="badge badge-teal">⬇ {anxietyReduction}% Reduction</span>
            </div>
            <p className="text-gray mb-4">{childName}'s anxiety score based on game behavior, facial analysis, and session duration.</p>
            <div className="chart-container">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={liveData} margin={{ top: 10, right: 30, left: 0, bottom: 0 }}>
                  <defs>
                    <linearGradient id="colorScore" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="var(--teal)" stopOpacity={0.8}/>
                      <stop offset="95%" stopColor="var(--teal)" stopOpacity={0}/>
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="var(--gray-200)" />
                  <XAxis dataKey="session" axisLine={false} tickLine={false} />
                  <YAxis axisLine={false} tickLine={false} domain={[0, 100]} />
                  <Tooltip contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: 'var(--shadow-md)' }} />
                  <Area type="monotone" dataKey="score" stroke="var(--teal)" strokeWidth={3} fillOpacity={1} fill="url(#colorScore)" />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </motion.div>

          {/* Quick Stats */}
          <motion.div 
            className="card stats-card"
            initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }}
          >
            <h3>{childName}'s Stats</h3>
            <div className="stat-item">
               <div className="stat-icon bg-pink"><Heart size={20} color="white"/></div>
               <div className="stat-text">
                 <strong>Readiness Score</strong>
                 <span>{readinessScore}% (Ready for checkup)</span>
               </div>
            </div>
            <div className="stat-item">
               <div className="stat-icon bg-yellow"><Award size={20} color="white"/></div>
               <div className="stat-text">
                 <strong>Games Completed</strong>
                 <span>{gamesCompleted.length} / 15</span>
               </div>
            </div>
            <div className="stat-item">
               <div className="stat-icon bg-teal"><Shield size={20} color="white"/></div>
               <div className="stat-text">
                 <strong>Current Level</strong>
                 <span>Level {level} Explorer</span>
               </div>
            </div>
          </motion.div>

          {/* Recommendations */}
          <motion.div 
            className="card recommendations-card col-span-3"
            initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }}
          >
            <h3>Dr. Smiles' Recommendations</h3>
            <div className="recs-list">
              <div className="rec-item">
                <span className="rec-emoji">🦷</span>
                <div className="rec-content">
                  <h4>Practice the "Mirror Game"</h4>
                  <p>{childName} struggled slightly with the mirror tool in Game 3. Encourage playing Game 14 (Magic Mirror Checkup) before the next visit.</p>
                </div>
              </div>
              <div className="rec-item">
                <span className="rec-emoji">🗣️</span>
                <div className="rec-content">
                  <h4>Parent Coaching: Conversation Starter</h4>
                  <p>Ask {childName}: "What was your favorite part of the clinic explorer game?" to reinforce positive associations.</p>
                </div>
              </div>
            </div>
          </motion.div>

          {/* Dentist Review Section */}
          <motion.div
            className="card review-card col-span-2"
            initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 }}
          >
            <div className="flex flex-col items-center p-4">
              <div className="text-6xl mb-2">👨‍⚕️</div>
              <h3 className="text-xl font-bold mb-4">Dr. Sarah Smith</h3>
              <div className="flex gap-2 mb-6">
                {[1, 2, 3, 4, 5].map((star) => (
                  <Star key={star} size={32} className="text-gray-300 hover:text-yellow-400 cursor-pointer transition-colors" />
                ))}
              </div>
              <textarea 
                className="w-full p-4 border border-gray-200 rounded-xl resize-none focus:outline-none focus:ring-2 focus:ring-teal-500 bg-gray-50"
                rows="3"
                placeholder="Share your experience... (optional)"
              ></textarea>
              <button className="btn btn-primary mt-4 w-full">Submit Review</button>
            </div>
          </motion.div>
        </div>
      </div>
    </div>
  );
}
