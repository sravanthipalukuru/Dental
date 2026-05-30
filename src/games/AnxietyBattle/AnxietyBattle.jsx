import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ArrowLeft, Star, Zap, ShieldAlert, Crosshair } from 'lucide-react';
import { Link } from 'react-router-dom';
import confetti from 'canvas-confetti';
import { useStore } from '../../store/useStore';
import './AnxietyBattle.css';

const monsters = [
  { id: 1, name: 'Glitchy Shadow', emoji: '👾', hp: 3, weakness: 'Plasma Pulse', color: '#00ffcc' },
  { id: 2, name: 'Neon Phantasm', emoji: '👻', hp: 4, weakness: 'Laser Beam', color: '#ff00ff' },
  { id: 3, name: 'Cyber Virus', emoji: '🦠', hp: 5, weakness: 'EMP Blast', color: '#ffff00' },
];

export default function AnxietyBattle() {
  const [currentMonsterIndex, setCurrentMonsterIndex] = useState(0);
  const [monsterHp, setMonsterHp] = useState(3);
  const [gameState, setGameState] = useState('intro'); // intro, playing, won
  const [shake, setShake] = useState(false);
  const [flash, setFlash] = useState(false);
  const [damageText, setDamageText] = useState(null);
  const [laserActive, setLaserActive] = useState(false);
  const completeGameLevel = useStore(state => state.completeGameLevel);
  const gameLevels = useStore(state => state.gameLevels);
  const currentLevel = gameLevels[10] || 0;

  const monster = monsters[currentMonsterIndex];

  useEffect(() => {
    if (gameState === 'playing') {
      setMonsterHp(monsters[currentMonsterIndex].hp);
    }
  }, [currentMonsterIndex, gameState]);

  const handleAttack = () => {
    if (gameState !== 'playing') return;

    // Trigger visual effects
    setLaserActive(true);
    setShake(true);
    setFlash(true);
    setDamageText('-1 Integrity!');
    
    setTimeout(() => {
      setLaserActive(false);
      setShake(false);
      setFlash(false);
      setDamageText(null);
    }, 400);

    if (monsterHp > 1) {
      setMonsterHp(h => h - 1);
    } else {
      // Monster defeated
      if (currentMonsterIndex < monsters.length - 1) {
        setTimeout(() => {
          setCurrentMonsterIndex(i => i + 1);
        }, 500); // Wait for death animation
      } else {
        setTimeout(() => {
          setGameState('won');
          confetti({ particleCount: 150, spread: 80, origin: { y: 0.6 }, colors: ['#00ffcc', '#ff00ff', '#ffff00']});
          completeGameLevel(10); // Huge anxiety reduction!
        }, 500);
      }
    }
  };

  return (
    <div className={`anxiety-battle-game ${flash ? 'screen-shake' : ''}`}>
      <div className="neon-grid"></div>
      <header className="game-header neon-header">
        <Link to="/games" className="back-btn neon-btn"><ArrowLeft /> Back</Link>
        <div className="game-stats">
          <div className="stat-badge neon-badge" style={{ borderColor: '#00ffcc', color: '#00ffcc' }}>Level {currentLevel}</div>
          <div className="stat-badge neon-badge" style={{ borderColor: '#ff00ff', color: '#ff00ff' }}><ShieldAlert size={16}/> Targets: {monsters.length - currentMonsterIndex}</div>
        </div>
      </header>

      <div className="container game-container text-center">
        {gameState === 'intro' && (
          <motion.div className="intro-card glass-card mt-12" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
            <h1 className="game-title neon-text">SYSTEM INFECTION ⚠️</h1>
            <p className="game-subtitle mb-8 text-glow">Sometimes the digital realm is infected by fear. Eradicate the Glitchy Shadow Viruses using your neon arsenal!</p>
            <button className="btn btn-primary btn-lg neon-btn-primary" onClick={() => setGameState('playing')}>INITIALIZE COMBAT</button>
          </motion.div>
        )}

        {gameState === 'playing' && (
          <div className="battle-arena glass-card">
            <AnimatePresence mode="wait">
              <motion.div 
                key={monster.id}
                initial={{ opacity: 0, scale: 0.5, x: 200 }}
                animate={{ opacity: 1, scale: 1, x: 0 }}
                exit={{ opacity: 0, scale: 0, rotate: -45, y: 100 }}
                transition={{ type: 'spring', bounce: 0.5 }}
                className="monster-container"
              >
                <div className="monster-info mb-6">
                  <h3 className="neon-monster-name" style={{ color: monster.color, textShadow: `0 0 10px ${monster.color}, 0 0 20px ${monster.color}` }}>{monster.name}</h3>
                  <div className="hp-bar-container mt-2">
                    <div className="hp-bar-bg neon-border">
                      <motion.div 
                        className="hp-bar-fill" 
                        style={{ backgroundColor: monster.color, boxShadow: `0 0 10px ${monster.color}` }}
                        initial={{ width: '100%' }}
                        animate={{ width: `${(monsterHp / monster.hp) * 100}%` }}
                        transition={{ type: 'tween' }}
                      ></motion.div>
                    </div>
                  </div>
                </div>
                
                <div className="monster-visual">
                  <motion.div 
                    className={`monster-emoji ${shake ? 'monster-glitch' : ''}`}
                    animate={{ y: [0, -20, 0] }}
                    transition={{ repeat: Infinity, duration: 2, ease: "easeInOut" }}
                    style={{ filter: `drop-shadow(0 0 30px ${monster.color})` }}
                  >
                    {monster.emoji}
                  </motion.div>

                  {laserActive && (
                    <div className="laser-blast" style={{ backgroundColor: monster.color, boxShadow: `0 0 20px ${monster.color}` }}></div>
                  )}

                  <AnimatePresence>
                    {damageText && (
                      <motion.div 
                        className="damage-text neon-damage"
                        style={{ color: monster.color, textShadow: `0 0 10px ${monster.color}` }}
                        initial={{ opacity: 1, scale: 0.5, y: 0 }}
                        animate={{ opacity: 0, scale: 1.5, y: -50 }}
                        exit={{ opacity: 0 }}
                      >
                        {damageText}
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>

                <div className="actions mt-12">
                  <p className="text-gray mb-4 font-bold text-glow">Target weakness identified!</p>
                  <motion.button 
                    className="btn btn-primary btn-lg w-full neon-attack-btn"
                    style={{ borderColor: monster.color, color: monster.color, textShadow: `0 0 5px ${monster.color}`, boxShadow: `inset 0 0 10px ${monster.color}, 0 0 10px ${monster.color}` }}
                    onClick={handleAttack}
                    whileTap={{ scale: 0.9 }}
                  >
                    <Crosshair className="mr-2"/> Fire {monster.weakness}!
                  </motion.button>
                </div>
              </motion.div>
            </AnimatePresence>
          </div>
        )}

        {gameState === 'won' && (
          <motion.div className="game-over glass-card text-center mt-12" initial={{ opacity: 0, scale: 0.8 }} animate={{ opacity: 1, scale: 1 }}>
            <div className="result-emoji bounce-in neon-text" style={{ fontSize: 80, filter: 'drop-shadow(0 0 20px #00ffcc)' }}>🛡️</div>
            <h2 className="neon-text" style={{ color: '#00ffcc' }}>SYSTEM PURGED!</h2>
            <p className="text-glow">You have eradicated the viruses and secured the network.</p>
            <div className="final-score neon-text" style={{ color: '#ffff00', textShadow: '0 0 10px #ffff00' }}><Star size={24} fill="#ffff00"/> 500 Score</div>
              <div className="rewards-badges mt-4 mb-4" style={{ display: 'flex', gap: 12, justifyContent: 'center' }}>
                <span className="badge neon-badge" style={{ fontSize: 18, borderColor: '#ffff00', color: '#ffff00' }}>🪙 +50 Crypto</span>
                <span className="badge neon-badge" style={{ fontSize: 18, borderColor: '#ff00ff', color: '#ff00ff' }}>⭐ +20 XP</span>
              </div>
            <button className="btn btn-primary mt-6 neon-btn-primary" onClick={() => {
              setCurrentMonsterIndex(0);
              setGameState('intro');
            }}>Next Wave (Level {currentLevel + 1})</button>
          </motion.div>
        )}
      </div>
    </div>
  );
}
