import { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ArrowLeft, Star, Heart, Wind } from 'lucide-react';
import { Link } from 'react-router-dom';
import confetti from 'canvas-confetti';
import { useStore } from '../../store/useStore';
import './BravePatient.css';

const BREATH_DURATION = 4; // seconds to breathe in/out

export default function BravePatient() {
  const [phase, setPhase] = useState('intro'); // intro, breathing, checkup, won
  const [breathState, setBreathState] = useState('inhale'); // inhale, hold, exhale
  const [breathCount, setBreathCount] = useState(0);
  const [progress, setProgress] = useState(0);
  
  const completeGameLevel = useStore(state => state.completeGameLevel);
  const gameLevels = useStore(state => state.gameLevels);
  const currentLevel = gameLevels[4] || 0;
  const timerRef = useRef(null);

  const startBreathing = () => {
    setPhase('breathing');
    runBreathCycle();
  };

  const runBreathCycle = () => {
    setBreathState('inhale');
    setProgress(0);
    
    // Simulate progress bar filling up over BREATH_DURATION
    let ticks = 0;
    const totalTicks = BREATH_DURATION * 10; // 10 ticks per sec
    
    timerRef.current = setInterval(() => {
      ticks++;
      setProgress((ticks / totalTicks) * 100);
      
      if (ticks >= totalTicks) {
        clearInterval(timerRef.current);
        setBreathState('exhale');
        setProgress(100);
        
        // Now exhale
        let exTicks = totalTicks;
        timerRef.current = setInterval(() => {
          exTicks--;
          setProgress((exTicks / totalTicks) * 100);
          
          if (exTicks <= 0) {
            clearInterval(timerRef.current);
            setBreathCount(c => c + 1);
          }
        }, 100);
      }
    }, 100);
  };

  useEffect(() => {
    if (breathCount > 0) {
      if (breathCount < 3) {
        // Run next breath cycle after a short pause
        setTimeout(runBreathCycle, 1000);
      } else {
        // 3 breaths done! Move to checkup phase
        setPhase('checkup');
      }
    }
  }, [breathCount]);

  useEffect(() => {
    return () => clearInterval(timerRef.current);
  }, []);

  const handleCheckupComplete = () => {
    setPhase('won');
    confetti({ particleCount: 150, spread: 80, origin: { y: 0.6 } });
    completeGameLevel(4); // Higher anxiety reduction!
  };

  return (
    <div className="brave-patient-game">
      <header className="game-header">
        <Link to="/games" className="back-btn"><ArrowLeft /> Back</Link>
        <div className="game-stats">
          <div className="stat-badge bg-teal">Level {currentLevel}</div>
          <div className="stat-badge"><Heart size={16} fill="var(--pink)" color="var(--pink)"/> Calmness: {Math.min(100, breathCount * 33)}%</div>
        </div>
      </header>

      <div className="container game-container text-center">
        <div className="mb-8">
          <h1 className="game-title">Brave Patient Protocol 🛡️</h1>
          <p className="game-subtitle">Charge your energy forcefield with deep breaths before your dental scan begins.</p>
        </div>

        <div className="simulator-area card overflow-hidden" style={{ minHeight: '400px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          <AnimatePresence mode="wait">
            
            {phase === 'intro' && (
              <motion.div key="intro" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0, y: -20 }}>
                <div className="step-icon float">⚡</div>
                <h2>Forcefield Offline</h2>
                <p className="mb-6">Your energy shield needs charging! Take 3 deep power breaths to activate your dental forcefield.</p>
                <button className="btn btn-primary btn-lg" onClick={startBreathing}>Charge Forcefield</button>
              </motion.div>
            )}

            {phase === 'breathing' && (
              <motion.div key="breathing" initial={{ opacity: 0, scale: 0.8 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 1.2 }} className="w-full">
                <div className="breathing-circle-container mb-8">
                  <motion.div 
                    className="breathing-circle"
                    animate={{ 
                      scale: breathState === 'inhale' ? 1.5 : 1,
                      backgroundColor: breathState === 'inhale' ? 'rgba(0,200,255,0.2)' : 'rgba(100,0,255,0.1)'
                    }}
                    transition={{ duration: BREATH_DURATION, ease: 'easeInOut' }}
                  >
                    <Wind size={48} color="#00c8ff" />
                  </motion.div>
                </div>
                
                <h2>{breathState === 'inhale' ? '⚡ Charging...' : '🌀 Release Power...'}</h2>
                <p className="text-gray mb-4">Power Cycle {breathCount + 1} of 3</p>
                
                <div className="progress-bar-container" style={{ width: '60%', margin: '0 auto', height: '10px' }}>
                  <div className="progress-bar bg-teal" style={{ width: `${progress}%`, transition: 'none' }}></div>
                </div>
              </motion.div>
            )}

            {phase === 'checkup' && (
              <motion.div key="checkup" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -20 }}>
                <div className="step-icon float">🔬</div>
                <h2>Forcefield Online! 100%</h2>
                <p className="mb-6">Excellent power levels! Now open the dental portal so Dr. Smiles can begin your tooth scan!</p>
                
                <motion.div 
                  className="interactive-mouth"
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={handleCheckupComplete}
                >
                  <div className="mouth-hole">
                    Tap to Open Portal
                  </div>
                </motion.div>
              </motion.div>
            )}

            {phase === 'won' && (
              <motion.div key="won" className="game-over text-center" initial={{ opacity: 0, scale: 0.8 }} animate={{ opacity: 1, scale: 1 }}>
                <div className="result-emoji bounce-in" style={{ fontSize: 80 }}>🛡️</div>
                <h2>Forcefield Mastered!</h2>
                <p>Your shield held at 100% integrity. You are ready for the dental scan!</p>
                <div className="final-score"><Star size={24} fill="gold"/> 300 Score</div>
              <div className="rewards-badges mt-4 mb-4" style={{ display: 'flex', gap: 12, justifyContent: 'center' }}>
                <span className="badge badge-yellow" style={{ fontSize: 18 }}>🪙 +50 Coins</span>
                <span className="badge badge-blue" style={{ fontSize: 18 }}>⭐ +20 XP</span>
              </div>
                <button className="btn btn-outline mt-6" onClick={() => { setPhase('intro'); setBreathCount(0); }}>Next Protocol (Level {currentLevel + 1})</button>
              </motion.div>
            )}

          </AnimatePresence>
        </div>
      </div>
    </div>
  );
}
