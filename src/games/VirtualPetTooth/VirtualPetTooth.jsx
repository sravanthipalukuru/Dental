import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ArrowLeft, Star, Heart, Droplets, Zap } from 'lucide-react';
import { Link } from 'react-router-dom';
import confetti from 'canvas-confetti';
import { useStore } from '../../store/useStore';
import './VirtualPetTooth.css';

export default function VirtualPetTooth() {
  const [stats, setStats] = useState({
    happiness: 50,
    cleanliness: 50,
    energy: 50,
  });
  
  const [actionLabel, setActionLabel] = useState('');
  const [petState, setPetState] = useState('idle'); // idle, eating, brushing, sleeping, sick
  const completeGameLevel = useStore(state => state.completeGameLevel);
  const gameLevels = useStore(state => state.gameLevels);
  const currentLevel = gameLevels[1] || 0;

  // Time decay loop
  useEffect(() => {
    const timer = setInterval(() => {
      setStats(prev => {
        const newStats = {
          happiness: Math.max(0, prev.happiness - 2),
          cleanliness: Math.max(0, prev.cleanliness - 1),
          energy: Math.max(0, prev.energy - 1),
        };
        
        // If cleanliness is 0, pet gets sick
        if (newStats.cleanliness === 0 && petState !== 'sick') {
          setPetState('sick');
        } else if (newStats.cleanliness > 0 && petState === 'sick') {
          setPetState('idle');
        }
        
        return newStats;
      });
    }, 2000);

    return () => clearInterval(timer);
  }, [petState]);

  // Win condition: Max out all stats to earn reward
  useEffect(() => {
    if (stats.happiness >= 100 && stats.cleanliness >= 100 && stats.energy >= 100) {
      confetti({
        particleCount: 100,
        spread: 70,
        origin: { y: 0.6 },
        colors: ['#4ECDC4', '#FF6B9D', '#FFE66D']
      });
      completeGameLevel(1);
      setActionLabel('Perfectly Happy Tooth! Reward Earned! ✨');
    }
  }, [stats, completeGameLevel]);

  const handleAction = (action) => {
    if (stats.happiness >= 100 && stats.cleanliness >= 100 && stats.energy >= 100) return;

    if (action === 'apple') {
      setPetState('eating');
      setActionLabel('Yummy Apple! +Happiness +Energy');
      setStats(p => ({ ...p, happiness: Math.min(100, p.happiness + 20), energy: Math.min(100, p.energy + 10) }));
    } else if (action === 'candy') {
      setPetState('eating');
      setActionLabel('Sweet Candy! +Happiness but -Cleanliness!');
      setStats(p => ({ ...p, happiness: Math.min(100, p.happiness + 25), cleanliness: Math.max(0, p.cleanliness - 30) }));
    } else if (action === 'brush') {
      setPetState('brushing');
      setActionLabel('Scrub scrub! +Cleanliness');
      setStats(p => ({ ...p, cleanliness: Math.min(100, p.cleanliness + 30) }));
    } else if (action === 'sleep') {
      setPetState('sleeping');
      setActionLabel('Zzz... +Energy');
      setStats(p => ({ ...p, energy: Math.min(100, p.energy + 40), happiness: Math.min(100, p.happiness + 5) }));
    }

    setTimeout(() => {
      setPetState(prev => prev === 'sick' ? 'sick' : 'idle');
    }, 1500);
  };

  // Determine Emoji based on state
  let petEmoji = '😁';
  if (petState === 'eating') petEmoji = '😋';
  if (petState === 'brushing') petEmoji = '✨';
  if (petState === 'sleeping') petEmoji = '😴';
  if (petState === 'sick') petEmoji = '🤒';
  if (petState === 'idle') {
    if (stats.happiness < 30) petEmoji = '😢';
    else if (stats.cleanliness < 30) petEmoji = '😬';
    else if (stats.energy < 30) petEmoji = '🥱';
  }

  return (
    <div className="virtual-pet-game">
      <header className="game-header">
        <Link to="/games" className="back-btn"><ArrowLeft /> Back</Link>
        <div className="game-stats">
          <div className="stat-badge bg-teal">Level {currentLevel}</div>
          <div className="stat-badge bg-pink"><Heart size={16}/> {stats.happiness}%</div>
          <div className="stat-badge bg-teal"><Droplets size={16}/> {stats.cleanliness}%</div>
          <div className="stat-badge bg-yellow"><Zap size={16}/> {stats.energy}%</div>
        </div>
      </header>

      <div className="container game-container text-center">
        <h1 className="game-title">Virtual Pet Tooth 🦷</h1>
        <p className="game-subtitle mb-8">Take care of your tooth! Max out all stats to win.</p>

        <div className="pet-arena card">
          <div className="pet-stats-bars">
            <div className="stat-row">
              <span>Happy</span>
              <div className="bar-bg"><div className="bar-fill bg-pink" style={{ width: `${stats.happiness}%` }}></div></div>
            </div>
            <div className="stat-row">
              <span>Clean</span>
              <div className="bar-bg"><div className="bar-fill bg-teal" style={{ width: `${stats.cleanliness}%` }}></div></div>
            </div>
            <div className="stat-row">
              <span>Energy</span>
              <div className="bar-bg"><div className="bar-fill bg-yellow" style={{ width: `${stats.energy}%` }}></div></div>
            </div>
          </div>

          <div className="pet-character-zone">
            <AnimatePresence mode="wait">
              <motion.div 
                key={petState}
                className="pet-character"
                initial={{ scale: 0.8, opacity: 0, rotate: -10 }}
                animate={{ scale: 1, opacity: 1, rotate: 0 }}
                exit={{ scale: 0.8, opacity: 0, rotate: 10 }}
                transition={{ type: 'spring', bounce: 0.6 }}
              >
                <div className={`tooth-body ${petState}`}>
                  <span className="tooth-face">{petEmoji}</span>
                </div>
              </motion.div>
            </AnimatePresence>

            {/* Action Feedback Label */}
            <div className="action-feedback">
              <AnimatePresence>
                {actionLabel && (
                  <motion.p 
                    initial={{ opacity: 0, y: 10 }} 
                    animate={{ opacity: 1, y: 0 }} 
                    exit={{ opacity: 0 }}
                  >
                    {actionLabel}
                  </motion.p>
                )}
              </AnimatePresence>
            </div>
          </div>

          <div className="pet-controls">
            <button className="btn btn-outline control-btn" onClick={() => handleAction('apple')}>
              <span className="control-emoji">🍎</span> Feed Apple
            </button>
            <button className="btn btn-outline control-btn" onClick={() => handleAction('candy')}>
              <span className="control-emoji">🍭</span> Feed Candy
            </button>
            <button className="btn btn-outline control-btn" onClick={() => handleAction('brush')}>
              <span className="control-emoji">🪥</span> Brush
            </button>
            <button className="btn btn-outline control-btn" onClick={() => handleAction('sleep')}>
              <span className="control-emoji">🌙</span> Sleep
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
