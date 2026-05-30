import { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ArrowLeft, Shield, Heart } from 'lucide-react';
import { Link } from 'react-router-dom';
import confetti from 'canvas-confetti';
import { useStore } from '../../store/useStore';
import './ToothDefender.css';

export default function ToothDefender() {
  const [score, setScore] = useState(0);
  const [lives, setLives] = useState(3);
  const [monsters, setMonsters] = useState([]);
  const [combatTexts, setCombatTexts] = useState([]);
  const [shake, setShake] = useState(false);
  const [gameState, setGameState] = useState('playing'); // playing, won, lost
  const [combo, setCombo] = useState(0);
  const completeGameLevel = useStore(state => state.completeGameLevel);
  const gameLevels = useStore(state => state.gameLevels);
  const currentLevel = gameLevels[5] || 0;
  const levelDifficulty = 1 + (currentLevel * 0.2); // Level 10 = 3x harder!
  const targetScore = 500 + (currentLevel * 200);
  const speedMultiplier = useRef(1);

  useEffect(() => {
    if (gameState !== 'playing') return;

    // Increase speed as you get closer to target score
    speedMultiplier.current = Math.max(0.3, 1 - (score / targetScore));

    const spawnInterval = setInterval(() => {
      setMonsters(prev => [
        ...prev,
        {
          id: Date.now() + Math.random(),
          type: Math.random() > 0.5 ? '🍬' : '🥤',
          left: Math.random() * 80 + 10,
          duration: ((Math.random() * 2 + 3) * speedMultiplier.current) / levelDifficulty
        }
      ]);
    }, (1500 * speedMultiplier.current) / levelDifficulty);

    return () => clearInterval(spawnInterval);
  }, [gameState, score, levelDifficulty, targetScore]);

  useEffect(() => {
    if (lives <= 0) setGameState('lost');
    if (score >= targetScore) { 
      setGameState('won');
      confetti({ particleCount: 150, spread: 100, origin: { y: 0.6 } });
      completeGameLevel(5); 
    }
  }, [lives, score, targetScore, completeGameLevel]);

  const hitMonster = (id, event) => {
    setMonsters(prev => prev.filter(m => m.id !== id));
    
    const newCombo = combo + 1;
    setCombo(newCombo);
    
    const points = 50 + (newCombo * 10);
    setScore(s => s + points);

    // Floating combat text
    if (event) {
      const { clientX, clientY } = event;
      setCombatTexts(prev => [
        ...prev,
        { id: Date.now(), x: clientX, y: clientY, text: `+${points}`, combo: newCombo > 3 }
      ]);
      
      // Clean up combat text after animation
      setTimeout(() => {
        setCombatTexts(prev => prev.filter(t => t.id !== Date.now()));
      }, 1000);
    }
  };

  const missMonster = (id) => {
    setMonsters(prev => prev.filter(m => m.id !== id));
    setLives(l => l - 1);
    setCombo(0); // Break combo
    
    // Trigger screen shake
    setShake(true);
    setTimeout(() => setShake(false), 400);
  };

  return (
    <div className={`tooth-defender-game ${shake ? 'screen-shake' : ''}`}>
      <header className="game-header">
        <Link to="/games" className="back-btn"><ArrowLeft /> Back</Link>
        <div className="game-stats">
          <div className="stat-badge bg-teal">Level {currentLevel}</div>
          <div className="stat-badge bg-blue"><Shield size={16}/> {score}/{targetScore}</div>
          {combo > 2 && <div className="stat-badge bg-yellow combo-badge">Combo x{combo}!</div>}
          <div className="stat-badge lives-badge">
            {[...Array(3)].map((_, i) => (
              <Heart key={i} size={16} fill={i < lives ? "var(--pink)" : "var(--gray-300)"} color={i < lives ? "var(--pink)" : "var(--gray-300)"}/>
            ))}
          </div>
        </div>
      </header>

      <div className="game-area">
        {gameState === 'playing' && (
          <>
            <div className="tooth-base-arena">
              <div className="tooth-shield-glow"></div>
              <div className="giant-tooth">🦷</div>
            </div>
            
            <AnimatePresence>
              {monsters.map(m => (
                <motion.button
                  key={m.id}
                  className="monster"
                  initial={{ top: '-10%', left: `${m.left}%`, scale: 0 }}
                  animate={{ top: '85%', scale: 1 }}
                  transition={{ duration: m.duration, ease: "linear" }}
                  onAnimationComplete={() => missMonster(m.id)}
                  onPointerDown={(e) => hitMonster(m.id, e)} // Better touch response than onClick
                  exit={{ opacity: 0, scale: 0, rotate: 180 }}
                >
                  {m.type}
                </motion.button>
              ))}
            </AnimatePresence>

            {/* Render Floating Combat Text */}
            <AnimatePresence>
              {combatTexts.map(ct => (
                <motion.div
                  key={ct.id}
                  className={`combat-text ${ct.combo ? 'combo-text' : ''}`}
                  initial={{ opacity: 1, top: ct.y - 20, left: ct.x }}
                  animate={{ opacity: 0, top: ct.y - 100 }}
                  exit={{ opacity: 0 }}
                  transition={{ duration: 0.8, ease: "easeOut" }}
                >
                  {ct.text}
                </motion.div>
              ))}
            </AnimatePresence>
          </>
        )}

        {gameState !== 'playing' && (
          <motion.div className="game-over card text-center" initial={{ scale: 0.8, opacity: 0 }} animate={{ scale: 1, opacity: 1 }}>
            {gameState === 'won' ? (
              <>
                <div className="result-emoji bounce-in" style={{ fontSize: 80 }}>🛡️</div>
                <h2>Legendary Defender!</h2>
                <p>You protected the teeth from the sugar invasion!</p>
                <div className="final-score"><Star size={24} fill="gold"/> {score} Score</div>
              <div className="rewards-badges mt-4 mb-4" style={{ display: 'flex', gap: 12, justifyContent: 'center' }}>
                <span className="badge badge-yellow" style={{ fontSize: 18 }}>🪙 +50 Coins</span>
                <span className="badge badge-blue" style={{ fontSize: 18 }}>⭐ +20 XP</span>
              </div>
              </>
            ) : (
              <>
                <div className="result-emoji" style={{ fontSize: 80 }}>💀</div>
                <h2>Oh no!</h2>
                <p>The sugar monsters got through the shield. We must try again!</p>
              </>
            )}
            <button className="btn btn-primary mt-6" onClick={() => {
              setScore(0); setLives(3); setMonsters([]); setCombo(0); setGameState('playing');
            }}>Continue (Level {currentLevel + 1})</button>
          </motion.div>
        )}
      </div>
    </div>
  );
}
