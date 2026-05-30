import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ArrowLeft, Star } from 'lucide-react';
import { Link } from 'react-router-dom';
import confetti from 'canvas-confetti';
import { useStore } from '../../store/useStore';
import './ShapeMatcher.css';

const shapes = [
  { id: 'tooth', emoji: '🦷', color: '#4ECDC4' },
  { id: 'apple', emoji: '🍎', color: '#FF6B9D' },
  { id: 'paste', emoji: '🧴', color: '#A8D8EA' },
  { id: 'brush', emoji: '🪥', color: '#FFE66D' },
];

export default function ShapeMatcher() {
  const [availableItems, setAvailableItems] = useState([]);
  const [targetSilhouettes, setTargetSilhouettes] = useState([]);
  const [matchedIds, setMatchedIds] = useState([]);
  const [score, setScore] = useState(0);
  const [gameState, setGameState] = useState('playing'); 

  const completeGameLevel = useStore(state => state.completeGameLevel);
  const gameLevels = useStore(state => state.gameLevels);
  const currentLevel = gameLevels[15] || 0;

  useEffect(() => {
    initGame();
  }, []);

  const initGame = () => {
    setAvailableItems([...shapes].sort(() => Math.random() - 0.5));
    setTargetSilhouettes([...shapes].sort(() => Math.random() - 0.5));
    setMatchedIds([]);
    setScore(0);
    setGameState('playing');
  };

  const handleDragStart = (e, shapeId) => {
    e.dataTransfer.setData('shapeId', shapeId);
    e.target.classList.add('dragging');
  };

  const handleDragEnd = (e) => {
    e.target.classList.remove('dragging');
  };

  const handleDrop = (e, targetId) => {
    e.preventDefault();
    e.currentTarget.classList.remove('drag-over');

    const droppedId = e.dataTransfer.getData('shapeId');
    if (!droppedId) return;

    if (droppedId === targetId) {
      setMatchedIds(prev => [...prev, droppedId]);
      setScore(s => s + 50);

      const rect = e.currentTarget.getBoundingClientRect();
      confetti({
        particleCount: 15,
        spread: 30,
        origin: { x: (rect.left + rect.width/2)/window.innerWidth, y: (rect.top + rect.height/2)/window.innerHeight },
      });

      if (matchedIds.length + 1 === shapes.length) {
        setTimeout(() => {
          setGameState('won');
          confetti({ particleCount: 100, spread: 70, origin: { y: 0.6 }});
          completeGameLevel(15);
        }, 500);
      }
    } else {
      e.currentTarget.classList.add('shake-wrong');
      setTimeout(() => e.target.classList.remove('shake-wrong'), 400);
    }
  };

  return (
    <div className="shape-matcher-game">
      <header className="game-header">
        <Link to="/games" className="back-btn"><ArrowLeft /> Back</Link>
        <div className="game-stats">
          <div className="stat-badge bg-teal">Level {currentLevel}</div>
          <div className="stat-badge"><Star size={16} fill="gold"/> {score}</div>
        </div>
      </header>

      <div className="container game-container text-center">
        <div className="mb-8">
          <h1 className="game-title">Shape Matcher 🧩</h1>
          <p className="game-subtitle">Drag the colorful items to their matching shadows!</p>
        </div>

        {gameState === 'playing' ? (
          <div className="matcher-layout card">
            
            {/* Silhouettes (Drop Targets) */}
            <div className="silhouettes-area">
              <div className="shapes-grid">
                {targetSilhouettes.map(shape => {
                  const isMatched = matchedIds.includes(shape.id);
                  return (
                    <div 
                      key={`target-${shape.id}`}
                      className={`silhouette-dropzone ${isMatched ? 'matched' : ''}`}
                      onDragOver={e => { e.preventDefault(); e.currentTarget.classList.add('drag-over'); }}
                      onDragLeave={e => e.currentTarget.classList.remove('drag-over')}
                      onDrop={e => handleDrop(e, shape.id)}
                    >
                      {isMatched ? (
                        <motion.div initial={{ scale: 0 }} animate={{ scale: 1 }} className="matched-item" style={{ color: shape.color }}>
                          {shape.emoji}
                        </motion.div>
                      ) : (
                        <span className="shadow-shape">{shape.emoji}</span>
                      )}
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Draggable Items */}
            <div className="draggables-area">
              <div className="shapes-grid">
                <AnimatePresence>
                  {availableItems.map(shape => {
                    if (matchedIds.includes(shape.id)) return null;
                    return (
                      <motion.div 
                        key={`item-${shape.id}`}
                        layoutId={`item-${shape.id}`}
                        className="draggable-shape"
                        draggable="true"
                        onDragStart={(e) => handleDragStart(e, shape.id)}
                        onDragEnd={handleDragEnd}
                        initial={{ scale: 0 }}
                        animate={{ scale: 1 }}
                        exit={{ scale: 0 }}
                        whileHover={{ scale: 1.1, cursor: 'grab' }}
                        whileTap={{ scale: 0.9, cursor: 'grabbing' }}
                        style={{ backgroundColor: shape.color }}
                      >
                        {shape.emoji}
                      </motion.div>
                    );
                  })}
                </AnimatePresence>
              </div>
            </div>

          </div>
        ) : (
          <motion.div className="game-over card text-center mt-8" initial={{ scale: 0.8, opacity: 0 }} animate={{ scale: 1, opacity: 1 }}>
            <div className="result-emoji bounce-in" style={{ fontSize: 80 }}>🏆</div>
            <h2>Perfect Match!</h2>
            <p>You matched all the shapes perfectly.</p>
            <div className="final-score"><Star size={24} fill="gold"/> {score + 50} Score</div>
              <div className="rewards-badges mt-4 mb-4" style={{ display: 'flex', gap: 12, justifyContent: 'center' }}>
                <span className="badge badge-yellow" style={{ fontSize: 18 }}>🪙 +50 Coins</span>
                <span className="badge badge-blue" style={{ fontSize: 18 }}>⭐ +20 XP</span>
              </div>
            <button className="btn btn-primary mt-6" onClick={initGame}>Continue (Level {currentLevel + 1})</button>
          </motion.div>
        )}
      </div>
    </div>
  );
}
