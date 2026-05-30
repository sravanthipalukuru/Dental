import { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ArrowLeft, Star, Clock, Droplets } from 'lucide-react';
import { Link } from 'react-router-dom';
import confetti from 'canvas-confetti';
import { useStore } from '../../store/useStore';
import './BrushMaster.css';

const TOTAL_SPOTS = 15;

export default function BrushMaster() {
  const [dirtySpots, setDirtySpots] = useState([]);
  const [particles, setParticles] = useState([]);
  const [timeLeft, setTimeLeft] = useState(30);
  const [gameState, setGameState] = useState('playing'); // playing, won, lost
  const [isBrushing, setIsBrushing] = useState(false);
  const containerRef = useRef(null);
  
  const completeGameLevel = useStore(state => state.completeGameLevel);
  const gameLevels = useStore(state => state.gameLevels);
  const currentLevel = gameLevels[6] || 0;

  useEffect(() => {
    initGame();
  }, []);

  const initGame = () => {
    // Generate spots mostly inside a "tooth" shaped boundary
    const spots = Array.from({length: TOTAL_SPOTS}).map((_, i) => ({ 
      id: i, 
      cleaned: false, 
      top: Math.random()*60 + 20, // 20-80% 
      left: Math.random()*60 + 20 // 20-80%
    }));
    setDirtySpots(spots);
    setTimeLeft(30);
    setGameState('playing');
    setParticles([]);
  };

  useEffect(() => {
    if (gameState === 'playing' && timeLeft > 0) {
      const timer = setInterval(() => setTimeLeft(t => t - 1), 1000);
      return () => clearInterval(timer);
    } else if (timeLeft === 0 && dirtySpots.some(s => !s.cleaned)) {
      setGameState('lost');
    }
  }, [timeLeft, gameState, dirtySpots]);

  useEffect(() => {
    if (gameState === 'playing' && dirtySpots.length > 0 && dirtySpots.every(s => s.cleaned)) {
      setGameState('won');
      confetti({ particleCount: 100, spread: 70, origin: { y: 0.6 }});
      completeGameLevel(6);
    }
  }, [dirtySpots, gameState]);

  // Handle brushing action
  const handleBrushMove = (e) => {
    if (gameState !== 'playing' || !isBrushing) return;

    // We can use the event coordinates to find nearby spots, 
    // but a simpler way that works well on mobile/desktop is 
    // to just rely on onPointerEnter on the spots themselves if they're small,
    // OR calculate distance. Since we are using onPointerEnter on the spots, 
    // we just need to track if the pointer is down.
  };

  const handleSpotEnter = (id, e) => {
    if (gameState !== 'playing' || !isBrushing) return;

    const spot = dirtySpots.find(s => s.id === id);
    if (!spot || spot.cleaned) return;

    // Mark as cleaned
    setDirtySpots(prev => prev.map(s => s.id === id ? { ...s, cleaned: true } : s));

    // Spawn brushing particles
    const rect = e.target.getBoundingClientRect();
    const newParticles = Array.from({length: 5}).map((_, i) => ({
      id: Date.now() + i,
      x: rect.left + rect.width / 2,
      y: rect.top + rect.height / 2,
      vx: (Math.random() - 0.5) * 10,
      vy: (Math.random() - 0.5) * 10 - 5
    }));

    setParticles(prev => [...prev, ...newParticles]);

    // Clean up particles
    setTimeout(() => {
      setParticles(prev => prev.filter(p => !newParticles.find(np => np.id === p.id)));
    }, 800);
  };

  const cleanedCount = dirtySpots.filter(s => s.cleaned).length;
  const progressPercent = (cleanedCount / TOTAL_SPOTS) * 100;

  return (
    <div className="brush-master-game" onPointerUp={() => setIsBrushing(false)} onPointerLeave={() => setIsBrushing(false)}>
      <header className="game-header">
        <Link to="/games" className="back-btn"><ArrowLeft /> Back</Link>
        <div className="game-stats" style={{ gap: '16px', display: 'flex', alignItems: 'center' }}>
          <div className="cleanliness-meter">
            <Droplets size={16} color="var(--teal)" className="mr-2"/> 
            <div className="meter-bg">
              <div className="meter-fill bg-teal" style={{ width: `${progressPercent}%` }}></div>
            </div>
            <span className="ml-2 text-sm">{Math.round(progressPercent)}%</span>
          </div>
          <div className={`stat-badge ${timeLeft < 10 ? 'urgent' : ''}`}><Clock size={16}/> {timeLeft}s</div>
        </div>
      </header>

      <div className="container game-container text-center">
        <div className="mb-4">
          <h1 className="game-title">Brush Master 🪥</h1>
          <p className="game-subtitle">Press and hold to brush away all the dirty spots before time runs out!</p>
        </div>

        <div className="brush-area card" ref={containerRef}>
          {gameState === 'playing' ? (
             <div 
               className={`teeth-bg ${isBrushing ? 'brushing' : ''}`}
               onPointerDown={() => setIsBrushing(true)}
               onPointerMove={handleBrushMove}
               style={{ touchAction: 'none' }} // Prevent scrolling while brushing
             >
                <div className="tooth-big" style={{ filter: `brightness(${0.8 + (progressPercent/100 * 0.2)})` }}>🦷</div>
                
                {dirtySpots.map(spot => !spot.cleaned && (
                  <motion.div 
                    key={spot.id} 
                    className="plaque-spot"
                    style={{ top: `${spot.top}%`, left: `${spot.left}%` }}
                    onPointerEnter={(e) => handleSpotEnter(spot.id, e)}
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    exit={{ scale: 0, opacity: 0 }}
                  />
                ))}

                {/* Render Particles */}
                {particles.map(p => (
                  <motion.div
                    key={p.id}
                    className="brush-particle"
                    initial={{ left: p.x, top: p.y, opacity: 1, scale: 1 }}
                    animate={{ 
                      left: p.x + (p.vx * 10), 
                      top: p.y + (p.vy * 10) + 50, // Gravity effect
                      opacity: 0, 
                      scale: 0 
                    }}
                    transition={{ duration: 0.8, ease: "easeOut" }}
                  />
                ))}
             </div>
          ) : (
            <motion.div 
              className="game-over text-center"
              initial={{ opacity: 0, scale: 0.8 }} animate={{ opacity: 1, scale: 1 }}
            >
              {gameState === 'won' ? (
                <>
                  <div className="result-emoji bounce-in" style={{ fontSize: 80 }}>✨</div>
                  <h2>So Shiny!</h2>
                  <p>You brushed away all the plaque like a pro.</p>
                  <div className="final-score"><Star size={24} fill="gold"/> {200 + (timeLeft * 10)} Score</div>
              <div className="rewards-badges mt-4 mb-4" style={{ display: 'flex', gap: 12, justifyContent: 'center' }}>
                <span className="badge badge-yellow" style={{ fontSize: 18 }}>🪙 +50 Coins</span>
                <span className="badge badge-blue" style={{ fontSize: 18 }}>⭐ +20 XP</span>
              </div>
                </>
              ) : (
                <>
                  <div className="result-emoji" style={{ fontSize: 80 }}>⏰</div>
                  <h2>Time's Up!</h2>
                  <p>Some plaque was left behind. Let's try again.</p>
                </>
              )}
              <button className="btn btn-primary mt-6" onClick={initGame}>Continue (Level {currentLevel + 1})</button>
            </motion.div>
          )}
        </div>
      </div>
    </div>
  );
}
