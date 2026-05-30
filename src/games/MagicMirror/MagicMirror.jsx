import { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ArrowLeft, Crosshair, Zap, Activity } from 'lucide-react';
import { Link } from 'react-router-dom';
import confetti from 'canvas-confetti';
import { useStore } from '../../store/useStore';
import './MagicMirror.css';

export default function MagicMirror() {
  const [gameState, setGameState] = useState('playing'); 
  const [mousePos, setMousePos] = useState({ x: 50, y: 50 });
  const [foundItems, setFoundItems] = useState([]);
  const containerRef = useRef(null);
  
  const completeGameLevel = useStore(state => state.completeGameLevel);
  const gameLevels = useStore(state => state.gameLevels);
  const currentLevel = gameLevels[14] || 0;

  const hiddenSecrets = [
    { id: 1, name: 'Anomalous Energy', emoji: '💠', x: 20, y: 30 },
    { id: 2, name: 'Tech Core', emoji: '🔋', x: 70, y: 20 },
    { id: 3, name: 'Bio-Signature', emoji: '🧬', x: 80, y: 70 },
    { id: 4, name: 'Data Fragment', emoji: '💾', x: 30, y: 80 },
  ];

  // Handle magnifying glass tracking
  const handleMouseMove = (e) => {
    if (!containerRef.current || gameState !== 'playing') return;
    const rect = containerRef.current.getBoundingClientRect();
    
    let x = ((e.clientX - rect.left) / rect.width) * 100;
    let y = ((e.clientY - rect.top) / rect.height) * 100;
    
    // Constrain to bounds
    x = Math.max(0, Math.min(100, x));
    y = Math.max(0, Math.min(100, y));

    setMousePos({ x, y });
    checkDiscovery(x, y);
  };

  const handleTouchMove = (e) => {
    if (!containerRef.current || gameState !== 'playing' || e.touches.length === 0) return;
    const rect = containerRef.current.getBoundingClientRect();
    
    let x = ((e.touches[0].clientX - rect.left) / rect.width) * 100;
    let y = ((e.touches[0].clientY - rect.top) / rect.height) * 100;
    
    x = Math.max(0, Math.min(100, x));
    y = Math.max(0, Math.min(100, y));

    setMousePos({ x, y });
    checkDiscovery(x, y);
  };

  const checkDiscovery = (mouseX, mouseY) => {
    // Check if the mirror center is close to any hidden secret
    hiddenSecrets.forEach(secret => {
      if (!foundItems.includes(secret.id)) {
        const dist = Math.sqrt(Math.pow(secret.x - mouseX, 2) + Math.pow(secret.y - mouseY, 2));
        if (dist < 10) { // If within 10% distance
          handleFind(secret.id);
        }
      }
    });
  };

  const handleFind = (id) => {
    setFoundItems(prev => {
      if (prev.includes(id)) return prev;
      const newItems = [...prev, id];
      
      confetti({ particleCount: 30, spread: 50, colors: ['#00f0ff', '#ff003c'] });

      if (newItems.length === hiddenSecrets.length) {
        setTimeout(() => {
          setGameState('won');
          confetti({ particleCount: 150, spread: 80, origin: { y: 0.6 }, colors: ['#00f0ff', '#ff003c']});
          completeGameLevel(14);
        }, 1000);
      }
      return newItems;
    });
  };

  return (
    <div className="ar-game-wrapper">
      <div className="cyber-grid"></div>
      <header className="ar-header">
        <Link to="/games" className="cyber-back-btn"><ArrowLeft /> ABORT MISSION</Link>
        <div className="cyber-stats">
          <div className="cyber-badge cyan">SECTOR {currentLevel}</div>
          <div className="cyber-badge magenta"><Activity size={16} /> ANOMALIES: {foundItems.length} / {hiddenSecrets.length}</div>
        </div>
      </header>

      <div className="ar-container text-center">
        <div className="mb-4 ar-title-group">
          <h1 className="ar-title text-cyan glow-text">AR TARGETING SYSTEM <Crosshair className="inline-icon" /></h1>
          <p className="ar-subtitle text-magenta">Scan the sector to detect hidden anomalies.</p>
        </div>

        <div className="cyber-card">
          {gameState === 'playing' ? (
            <div 
              className="ar-arena" 
              ref={containerRef}
              onMouseMove={handleMouseMove}
              onTouchMove={handleTouchMove}
            >
              {/* Scanline overlay */}
              <div className="scanlines"></div>

              {/* Background layer */}
              <div className="ar-bg">
                <div className="cyber-target-dummy">👤</div>
              </div>

              {/* Magnified Layer (Only visible inside clip-path) */}
              <div 
                className="ar-scan-layer"
                style={{
                  clipPath: `circle(90px at ${mousePos.x}% ${mousePos.y}%)`,
                  /* We apply a zoom effect to this layer based on mouse pos */
                  transformOrigin: `${mousePos.x}% ${mousePos.y}%`,
                  transform: 'scale(1.2)'
                }}
              >
                <div className="cyber-target-dummy-zoomed">🤖</div>
                
                {hiddenSecrets.map(secret => (
                  <div 
                    key={secret.id}
                    className={`ar-secret ${foundItems.includes(secret.id) ? 'found' : ''}`}
                    style={{ left: `${secret.x}%`, top: `${secret.y}%` }}
                  >
                    {secret.emoji}
                  </div>
                ))}
              </div>

              {/* The Reticle */}
              <div 
                className="reticle-frame"
                style={{ top: `calc(${mousePos.y}% - 90px)`, left: `calc(${mousePos.x}% - 90px)` }}
              >
                <div className="reticle-crosshair"></div>
                <div className="reticle-corner top-left"></div>
                <div className="reticle-corner top-right"></div>
                <div className="reticle-corner bottom-left"></div>
                <div className="reticle-corner bottom-right"></div>
                <div className="reticle-ring"></div>
              </div>

              <div className="ar-inventory glass-panel">
                {hiddenSecrets.map(secret => (
                  <div key={secret.id} className={`ar-inventory-item ${foundItems.includes(secret.id) ? 'found' : ''}`}>
                    {foundItems.includes(secret.id) ? secret.emoji : '?'}
                  </div>
                ))}
              </div>

            </div>
          ) : (
            <motion.div className="ar-mission-complete text-center py-12" initial={{ scale: 0.8, opacity: 0 }} animate={{ scale: 1, opacity: 1 }}>
              <div className="result-emoji" style={{ fontSize: 80, filter: 'drop-shadow(0 0 20px #00f0ff)' }}>🌐</div>
              <h2 className="text-cyan glow-text mt-4">SCAN COMPLETE</h2>
              <p className="text-gray-300">All anomalies successfully identified and neutralized.</p>
              <div className="final-score cyber-badge cyan mt-4" style={{ display: 'inline-flex', marginBottom: '1rem' }}><Zap size={20}/> SYSTEM OPTIMIZED</div>
              <div className="rewards-badges mt-6 mb-4" style={{ display: 'flex', gap: 12, justifyContent: 'center' }}>
                <span className="cyber-badge magenta">CREDITS +50</span>
                <span className="cyber-badge cyan">EXP +20</span>
              </div>
              <button className="cyber-btn mt-6" onClick={() => {
                setFoundItems([]);
                setGameState('playing');
              }}>INITIATE NEXT SCAN</button>
            </motion.div>
          )}
        </div>
      </div>
    </div>
  );
}
