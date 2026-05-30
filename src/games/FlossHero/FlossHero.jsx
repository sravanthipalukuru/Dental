import { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ArrowLeft, Star, Heart, Activity } from 'lucide-react';
import { Link } from 'react-router-dom';
import confetti from 'canvas-confetti';
import { useStore } from '../../store/useStore';
import './FlossHero.css';

// A rhythm game. Food items drop down. 
// When they hit the "floss zone" at the bottom, user presses Floss!

export default function FlossHero() {
  const [score, setScore] = useState(0);
  const [combo, setCombo] = useState(0);
  const [lives, setLives] = useState(3);
  const [foods, setFoods] = useState([]);
  const [gameState, setGameState] = useState('intro'); // intro, playing, won, lost
  const [flossActive, setFlossActive] = useState(false);
  const [feedback, setFeedback] = useState(null); // Perfect, Good, Miss

  const completeGameLevel = useStore(state => state.completeGameLevel);
  const gameLevels = useStore(state => state.gameLevels);
  const currentLevel = gameLevels[7] || 0;
  const gameLoopRef = useRef(null);
  const foodsRef = useRef([]); // Use ref to track real-time position without rerendering constantly
  const hitZoneY = 80; // percentage from top

  const startGame = () => {
    setScore(0);
    setCombo(0);
    setLives(3);
    setFoods([]);
    foodsRef.current = [];
    setGameState('playing');
  };

  useEffect(() => {
    if (gameState !== 'playing') return;

    let tick = 0;
    gameLoopRef.current = setInterval(() => {
      tick++;
      
      // Spawn new food
      if (tick % 20 === 0) { // Every 20 ticks (~2 seconds)
        const newFood = {
          id: Date.now(),
          type: ['🍎', '🥦', '🍖', '🍭'][Math.floor(Math.random() * 4)],
          y: -10, // Start above screen
          speed: Math.random() * 0.5 + 0.8 // Random speed
        };
        foodsRef.current.push(newFood);
      }

      // Move foods
      foodsRef.current = foodsRef.current.map(f => ({ ...f, y: f.y + f.speed }));

      // Check misses (went past bottom)
      const missed = foodsRef.current.filter(f => f.y > 110);
      if (missed.length > 0) {
        setLives(l => l - missed.length);
        setCombo(0);
        showFeedback('Miss!');
      }

      // Filter out missed
      foodsRef.current = foodsRef.current.filter(f => f.y <= 110);

      // Update state for rendering
      setFoods([...foodsRef.current]);

    }, 50); // 20 FPS game loop

    return () => clearInterval(gameLoopRef.current);
  }, [gameState]);

  useEffect(() => {
    if (lives <= 0 && gameState === 'playing') {
      setGameState('lost');
    }
    if (score >= 1000 && gameState === 'playing') {
      setGameState('won');
      confetti({ particleCount: 200, spread: 90, origin: { y: 0.6 }, colors: ['#00ffff', '#ff00ff', '#ffff00']});
      completeGameLevel(7);
    }
  }, [lives, score, gameState]);

  // Handle User Input
  const handleFloss = () => {
    if (gameState !== 'playing') return;

    setFlossActive(true);
    setTimeout(() => setFlossActive(false), 150);

    // Check collision in the hit zone (75% to 85% y)
    let hitSomething = false;
    let newFoods = [...foodsRef.current];

    for (let i = newFoods.length - 1; i >= 0; i--) {
      const f = newFoods[i];
      if (f.y >= hitZoneY - 10 && f.y <= hitZoneY + 10) {
        // Hit!
        hitSomething = true;
        
        // Calculate accuracy
        const accuracy = Math.abs(f.y - hitZoneY);
        let points = 50;
        let msg = 'Good!';
        
        if (accuracy < 3) {
          points = 100;
          msg = 'Perfect!';
        }

        setScore(s => s + points + (combo * 10));
        setCombo(c => c + 1);
        showFeedback(msg);
        
        // Remove hit food
        newFoods.splice(i, 1);
        break; // Only hit one at a time per press
      }
    }

    if (!hitSomething) {
      setCombo(0); // Pressing nothing breaks combo
    }

    foodsRef.current = newFoods;
    setFoods(newFoods);
  };

  const showFeedback = (text) => {
    setFeedback({ id: Date.now(), text });
  };

  return (
    <div className="floss-hero-game">
      <header className="game-header">
        <Link to="/games" className="back-btn"><ArrowLeft /> Back</Link>
        <div className="game-stats">
          <div className="stat-badge bg-teal">LEVEL {currentLevel}</div>
          <div className="stat-badge bg-blue"><Star size={18} fill="#ff00ff" /> {score}/1000</div>
          {combo > 2 && <div className="stat-badge bg-yellow combo-badge"><Activity size={18}/> COMBO x{combo}</div>}
          <div className="stat-badge lives-badge">
            {[...Array(3)].map((_, i) => (
              <Heart key={i} size={18} fill={i < lives ? "#ff0055" : "transparent"} color={i < lives ? "#ff0055" : "rgba(255,255,255,0.3)"}/>
            ))}
          </div>
        </div>
      </header>

      <div className="game-container">
        
        {gameState === 'intro' && (
          <motion.div className="intro-card" initial={{ opacity: 0, scale: 0.9, y: 30 }} animate={{ opacity: 1, scale: 1, y: 0 }} transition={{ duration: 0.5, type: "spring" }}>
            <h1 className="game-title">Floss Hero</h1>
            <p className="game-subtitle">Engage your laser-floss when the debris hits the neon zone! Keep the rhythm and clean the gaps.</p>
            <button className="btn-primary" onClick={startGame}>Initialize Run</button>
          </motion.div>
        )}

        {gameState === 'playing' && (
          <motion.div className="rhythm-arena" initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }}>
            
            {/* The tracks */}
            <div className="track-container">
              {/* Floating food items */}
              {foods.map(f => (
                <div 
                  key={f.id} 
                  className="rhythm-note"
                  style={{ top: `${f.y}%` }}
                >
                  {f.type}
                </div>
              ))}

              {/* The Hit Zone / Floss String */}
              <div className={`hit-zone ${flossActive ? 'active' : ''}`} style={{ top: `${hitZoneY}%` }}>
                <div className="floss-string"></div>
              </div>
            </div>

            {/* Feedback Popups */}
            <AnimatePresence>
              {feedback && (
                <motion.div 
                  key={feedback.id}
                  className={`rhythm-feedback ${feedback.text === 'Perfect!' ? 'perfect' : feedback.text === 'Miss!' ? 'miss' : 'good'}`}
                  initial={{ opacity: 0, scale: 0.2, y: 20 }}
                  animate={{ opacity: 1, scale: 1.2, y: -40 }}
                  exit={{ opacity: 0, scale: 2, y: -80 }}
                  transition={{ duration: 0.4 }}
                >
                  {feedback.text}
                </motion.div>
              )}
            </AnimatePresence>

            <button 
              className={`floss-btn ${flossActive ? 'active' : ''}`} 
              onPointerDown={handleFloss}
            >
              FLOSS!
            </button>
          </motion.div>
        )}

        {(gameState === 'won' || gameState === 'lost') && (
          <motion.div className="game-over" initial={{ scale: 0.8, opacity: 0, y: 20 }} animate={{ scale: 1, opacity: 1, y: 0 }} transition={{ type: "spring", bounce: 0.5 }}>
            {gameState === 'won' ? (
              <>
                <div className="result-emoji" style={{ fontSize: 80 }}>🎸</div>
                <h2 style={{ fontSize: '2.5rem', margin: '10px 0', color: '#0ff', textTransform: 'uppercase', textShadow: '0 0 10px #0ff' }}>Floss Hero!</h2>
                <p style={{ fontSize: '1.2rem', color: '#a0c0d0' }}>Perfect sync! The gaps are clean and glowing.</p>
                <div className="final-score"><Star size={30} fill="#ff0"/> {score + (lives * 100)} FINAL SCORE</div>
                <div className="rewards-badges mt-4 mb-4" style={{ display: 'flex', gap: 12, justifyContent: 'center', marginTop: 20, marginBottom: 20 }}>
                  <span className="badge badge-yellow">🪙 +50 Coins</span>
                  <span className="badge badge-blue">⭐ +20 XP</span>
                </div>
              </>
            ) : (
              <>
                <div className="result-emoji" style={{ fontSize: 80 }}>💀</div>
                <h2 style={{ fontSize: '2.5rem', margin: '10px 0', color: '#ff0055', textTransform: 'uppercase', textShadow: '0 0 10px #ff0055' }}>System Failure</h2>
                <p style={{ fontSize: '1.2rem', color: '#a0c0d0' }}>Too much debris accumulated. Reboot and try again.</p>
              </>
            )}
            <button className="btn-primary" style={{ marginTop: 20 }} onClick={startGame}>Continue (Level {currentLevel + 1})</button>
          </motion.div>
        )}

      </div>
    </div>
  );
}
