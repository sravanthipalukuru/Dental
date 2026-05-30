import { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ArrowLeft, Star, Search, Skull } from 'lucide-react';
import { Link } from 'react-router-dom';
import confetti from 'canvas-confetti';
import { useStore } from '../../store/useStore';
import './FindCavity.css';

export default function FindCavity() {
  const [cavities, setCavities] = useState([]);
  const [foundCount, setFoundCount] = useState(0);
  const [gameState, setGameState] = useState('playing'); // playing, won
  const [mousePos, setMousePos] = useState({ x: 0, y: 0 });
  const containerRef = useRef(null);
  
  const completeGameLevel = useStore(state => state.completeGameLevel);
  const gameLevels = useStore(state => state.gameLevels);
  const currentLevel = gameLevels[9] || 0;
  const TOTAL_CAVITIES = 5;

  useEffect(() => {
    initGame();
  }, []);

  const initGame = () => {
    const newCavities = Array.from({length: TOTAL_CAVITIES}).map((_, i) => ({
      id: i,
      found: false,
      top: Math.random() * 60 + 20, // 20-80%
      left: Math.random() * 60 + 20, // 20-80%
      size: Math.random() * 20 + 20 // 20-40px
    }));
    setCavities(newCavities);
    setFoundCount(0);
    setGameState('playing');
  };

  // Handle X-Ray lens tracking
  const handleMouseMove = (e) => {
    if (!containerRef.current) return;
    const rect = containerRef.current.getBoundingClientRect();
    
    // Calculate percentage position within the container
    const x = ((e.clientX - rect.left) / rect.width) * 100;
    const y = ((e.clientY - rect.top) / rect.height) * 100;
    
    setMousePos({ x, y });
  };

  const handleTouchMove = (e) => {
    if (!containerRef.current || e.touches.length === 0) return;
    const rect = containerRef.current.getBoundingClientRect();
    
    const x = ((e.touches[0].clientX - rect.left) / rect.width) * 100;
    const y = ((e.touches[0].clientY - rect.top) / rect.height) * 100;
    
    setMousePos({ x, y });
  };

  const handleFind = (id) => {
    if (gameState !== 'playing') return;
    
    setCavities(prev => prev.map(c => c.id === id ? { ...c, found: true } : c));
    
    const newFound = foundCount + 1;
    setFoundCount(newFound);
    
    // Spawn tiny particles where clicked
    confetti({
      particleCount: 15,
      spread: 30,
      startVelocity: 15,
      colors: ['#00ffff', '#ff00ff', '#00ff00']
    });

    if (newFound === TOTAL_CAVITIES) {
      setGameState('won');
      confetti({ particleCount: 100, spread: 70, origin: { y: 0.6 }});
      completeGameLevel(9);
    }
  };

  return (
    <div className="find-cavity-game">
      <header className="game-header">
        <Link to="/games" className="back-btn"><ArrowLeft /> Back</Link>
        <div className="game-stats">
          <div className="stat-badge bg-teal">Level {currentLevel}</div>
          <div className="stat-badge bg-teal"><Search size={16}/> {foundCount} / {TOTAL_CAVITIES} Bugs Found</div>
        </div>
      </header>

      <div className="container game-container text-center">
        <div className="mb-4">
          <h1 className="game-title">Laser X-Ray Scanner ⚡</h1>
          <p className="game-subtitle">Drag your glowing neon scanner over the holographic tooth to reveal hidden shadow viruses!</p>
        </div>

        <div className="xray-wrapper">
          <div 
            className="xray-arena card" 
            ref={containerRef}
            onMouseMove={handleMouseMove}
            onTouchMove={handleTouchMove}
          >
            {/* The Normal Layer (Teeth, no bugs) */}
            <div className="layer normal-layer">
              <div className="giant-tooth-bg">🦷</div>
            </div>

            {/* The X-Ray Layer (Dark, shows bones and bugs, masked by CSS) */}
            <div 
              className="layer xray-layer"
              style={{
                clipPath: `circle(80px at ${mousePos.x}% ${mousePos.y}%)`
              }}
            >
              <div className="giant-tooth-bg xray-bone">🦷</div>
              
              {cavities.map(c => !c.found && (
                <div
                  key={c.id}
                  className="sugar-bug"
                  style={{ top: `${c.top}%`, left: `${c.left}%`, width: `${c.size}px`, height: `${c.size}px` }}
                  onPointerDown={(e) => {
                    e.stopPropagation(); // prevent drag interference
                    handleFind(c.id);
                  }}
                >
                  <Skull size={c.size} color="#110022" />
                </div>
              ))}
            </div>

            {/* The Lens Border */}
            <div 
              className="xray-lens-border"
              style={{ top: `calc(${mousePos.y}% - 80px)`, left: `calc(${mousePos.x}% - 80px)` }}
            >
              <div className="crosshair"></div>
            </div>

          </div>

          <AnimatePresence>
            {gameState === 'won' && (
              <motion.div className="game-over card text-center mt-6" initial={{ scale: 0.8, opacity: 0 }} animate={{ scale: 1, opacity: 1 }}>
                <div className="result-emoji bounce-in">🏆</div>
                <h2>X-Ray Master!</h2>
                <p>You found all the sneaky sugar bugs hiding inside!</p>
                <div className="final-score"><Star size={24} fill="gold"/> 200 Score</div>
              <div className="rewards-badges mt-4 mb-4" style={{ display: 'flex', gap: 12, justifyContent: 'center' }}>
                <span className="badge badge-yellow" style={{ fontSize: 18 }}>🪙 +50 Coins</span>
                <span className="badge badge-blue" style={{ fontSize: 18 }}>⭐ +20 XP</span>
              </div>
                <button className="btn btn-primary mt-6" onClick={initGame}>Continue (Level {currentLevel + 1})</button>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>
    </div>
  );
}
