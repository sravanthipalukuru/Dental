import { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ArrowLeft, Star, Zap } from 'lucide-react';
import { Link } from 'react-router-dom';
import confetti from 'canvas-confetti';
import { useStore } from '../../store/useStore';
import './PlaqueBlaster.css';

export default function PlaqueBlaster() {
  const [plaqueSpots, setPlaqueSpots] = useState([]);
  const [particles, setParticles] = useState([]);
  const [isSpraying, setIsSpraying] = useState(false);
  const [gameState, setGameState] = useState('playing'); 
  const containerRef = useRef(null);
  
  const completeGameLevel = useStore(state => state.completeGameLevel);
  const gameLevels = useStore(state => state.gameLevels);
  const currentLevel = gameLevels[17] || 0;

  useEffect(() => {
    initGame();
  }, []);

  const initGame = () => {
    setPlaqueSpots(
      Array.from({length: 8}).map((_, i) => ({
        id: i,
        hp: 100, 
        top: Math.random() * 60 + 20,
        left: Math.random() * 60 + 20,
        size: Math.random() * 30 + 40
      }))
    );
    setGameState('playing');
  };

  const handlePointerDown = (e) => {
    setIsSpraying(true);
    handleSprayMove(e);
  };

  const handlePointerUp = () => {
    setIsSpraying(false);
  };

  const handleSprayMove = (e) => {
    if (!isSpraying || gameState !== 'playing' || !containerRef.current) return;

    const rect = containerRef.current.getBoundingClientRect();
    const clientX = e.touches ? e.touches[0].clientX : e.clientX;
    const clientY = e.touches ? e.touches[0].clientY : e.clientY;

    const mouseX = ((clientX - rect.left) / rect.width) * 100;
    const mouseY = ((clientY - rect.top) / rect.height) * 100;

    // Generate plasma particles
    const newParticles = Array.from({length: 3}).map((_, i) => ({
      id: Date.now() + i + Math.random(),
      x: mouseX + (Math.random() * 10 - 5),
      y: mouseY + (Math.random() * 10 - 5),
    }));
    setParticles(prev => [...prev.slice(-30), ...newParticles]);

    // Damage alien plaque
    setPlaqueSpots(prev => prev.map(spot => {
      if (spot.hp <= 0) return spot;
      
      const dist = Math.sqrt(Math.pow(spot.left - mouseX, 2) + Math.pow(spot.top - mouseY, 2));
      if (dist < 15) {
        return { ...spot, hp: spot.hp - 5 };
      }
      return spot;
    }));
  };

  useEffect(() => {
    if (gameState === 'playing' && plaqueSpots.length > 0 && plaqueSpots.every(s => s.hp <= 0)) {
      setGameState('won');
      confetti({ particleCount: 150, spread: 80, origin: { y: 0.6 }, colors: ['#00ffcc', '#ff00ff', '#00ffff']});
      completeGameLevel(17);
    }
  }, [plaqueSpots, gameState]);

  return (
    <div className="plaque-blaster-game" onPointerUp={handlePointerUp} onPointerLeave={handlePointerUp}>
      <header className="game-header">
        <Link to="/games" className="back-btn"><ArrowLeft /> Back</Link>
        <div className="game-stats">
          <div className="stat-badge bg-teal">Level {currentLevel}</div>
          <div className="stat-badge bg-purple"><Zap size={16}/> Plasma Ready</div>
        </div>
      </header>

      <div className="container game-container text-center">
        <div className="mb-4">
          <h1 className="game-title text-neon">Plasma Washer ⚡</h1>
          <p className="game-subtitle text-light">Press and hold to unleash high-energy plasma and vaporize the alien plaque!</p>
        </div>

        <div className="blaster-arena card bg-dark">
          {gameState === 'playing' ? (
            <div 
              className={`teeth-canvas sci-fi-grid ${isSpraying ? 'spraying' : ''}`}
              ref={containerRef}
              onPointerDown={handlePointerDown}
              onPointerMove={handleSprayMove}
              style={{ touchAction: 'none' }}
            >
              <div className="giant-tooth-bg neon-tooth">🦷</div>

              {/* Alien Plaque Spots */}
              {plaqueSpots.map(spot => spot.hp > 0 && (
                <div 
                  key={spot.id} 
                  className="alien-plaque-blob"
                  style={{ 
                    top: `${spot.top}%`, left: `${spot.left}%`, 
                    width: `${spot.size}px`, height: `${spot.size}px`,
                    opacity: spot.hp / 100 
                  }}
                >
                </div>
              ))}

              {/* Plasma Particles */}
              {particles.map(p => (
                <motion.div
                  key={p.id}
                  className="plasma-particle"
                  initial={{ left: `${p.x}%`, top: `${p.y}%`, scale: 1, opacity: 1 }}
                  animate={{ top: `${p.y + (Math.random() * 20 - 10)}%`, left: `${p.x + (Math.random() * 20 - 10)}%`, scale: 2.5, opacity: 0 }}
                  transition={{ duration: 0.4, ease: "easeOut" }}
                />
              ))}

            </div>
          ) : (
            <motion.div className="game-over text-center py-12 text-light" initial={{ scale: 0.8, opacity: 0 }} animate={{ scale: 1, opacity: 1 }}>
              <div className="result-emoji bounce-in neon-text" style={{ fontSize: 80 }}>🌌</div>
              <h2 className="neon-text">Alien Threat Neutralized!</h2>
              <p>You vaporized all the alien plaque. Incredible firepower!</p>
              <div className="final-score"><Star size={24} fill="#00ffcc" color="#00ffcc"/> 300 Score</div>
              <div className="rewards-badges mt-4 mb-4" style={{ display: 'flex', gap: 12, justifyContent: 'center' }}>
                <span className="badge badge-yellow" style={{ fontSize: 18 }}>🪙 +50 Coins</span>
                <span className="badge badge-blue" style={{ fontSize: 18 }}>⭐ +20 XP</span>
              </div>
              <button className="btn btn-primary mt-6 btn-lg neon-btn" onClick={initGame}>Continue (Level {currentLevel + 1})</button>
            </motion.div>
          )}
        </div>
      </div>
    </div>
  );
}
