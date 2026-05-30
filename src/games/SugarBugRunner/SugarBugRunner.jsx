import { useState, useEffect, useRef } from 'react';
import { motion } from 'framer-motion';
import { ArrowLeft, Star, Zap } from 'lucide-react';
import { Link } from 'react-router-dom';
import confetti from 'canvas-confetti';
import { useStore } from '../../store/useStore';
import './SugarBugRunner.css';

export default function SugarBugRunner() {
  const [gameState, setGameState] = useState('intro');
  const [score, setScore] = useState(0);
  const [jumpState, setJumpState] = useState('ground');
  const [obstacles, setObstacles] = useState([]);
  const [collectibles, setCollectibles] = useState([]);

  const gameLoopRef = useRef(null);
  const scoreRef = useRef(0);
  const speedMultiplier = useRef(1);
  const jumpTimeout = useRef(null);
  const jumpStateRef = useRef('ground');

  const completeGameLevel = useStore(state => state.completeGameLevel);
  const gameLevels = useStore(state => state.gameLevels);
  const currentLevel = gameLevels[12] || 0;
  const targetScore = 1000 + (currentLevel * 500);

  const setJumpStateBoth = (val) => {
    setJumpState(val);
    jumpStateRef.current = val;
  };

  const startGame = () => {
    setGameState('playing');
    setScore(0);
    scoreRef.current = 0;
    setObstacles([]);
    setCollectibles([]);
    setJumpStateBoth('ground');
    speedMultiplier.current = 1;
  };

  useEffect(() => {
    if (gameState !== 'playing') return;

    gameLoopRef.current = setInterval(() => {
      speedMultiplier.current = 1.2 + (scoreRef.current / 500) + (currentLevel * 0.2);

      if (Math.random() < 0.02 * speedMultiplier.current) {
        setObstacles(prev => {
          const last = prev[prev.length - 1];
          if (!last || last.x < 70) {
            return [...prev, { id: Date.now(), x: 100, passed: false }];
          }
          return prev;
        });
      }

      if (Math.random() < 0.03) {
        setCollectibles(prev => {
          const last = prev[prev.length - 1];
          if (!last || last.x < 80) {
            const height = Math.random() > 0.5 ? 'low' : 'high';
            return [...prev, { id: Date.now(), x: 100, height, collected: false }];
          }
          return prev;
        });
      }

      const moveSpeed = 1.5 * speedMultiplier.current;
      setObstacles(prev => prev.map(o => ({ ...o, x: o.x - moveSpeed })).filter(o => o.x > -20));
      setCollectibles(prev => prev.map(c => ({ ...c, x: c.x - moveSpeed })).filter(c => c.x > -20 && !c.collected));

      setObstacles(prev => {
        let hit = false;
        const newObs = prev.map(o => {
          if (jumpStateRef.current === 'ground' && o.x > 10 && o.x < 25) {
            hit = true;
          }
          if (o.x < 10 && !o.passed) {
            scoreRef.current += 10;
            return { ...o, passed: true };
          }
          return o;
        });
        if (hit) setGameState('lost');
        return newObs;
      });

      setCollectibles(prev => prev.map(c => {
        if (!c.collected) {
          const inXRange = c.x > 10 && c.x < 25;
          const inYRange = (c.height === 'low' && jumpStateRef.current !== 'double-jumping') ||
                           (c.height === 'high' && jumpStateRef.current !== 'ground');
          if (inXRange && inYRange) {
            scoreRef.current += 50;
            confetti({
              particleCount: 30, spread: 50,
              origin: { x: 0.2, y: c.height === 'low' ? 0.7 : 0.5 },
              colors: ['#4ECDC4', '#FF6B9D', '#FFE66D'],
              disableForReducedMotion: true
            });
            return { ...c, collected: true };
          }
        }
        return c;
      }));

      setScore(scoreRef.current);

      if (scoreRef.current >= targetScore) {
        setGameState('won');
        confetti({ particleCount: 200, spread: 100, origin: { y: 0.6 }, colors: ['#4ECDC4', '#FF6B9D'] });
        completeGameLevel(12);
      }
    }, 20);

    return () => clearInterval(gameLoopRef.current);
  }, [gameState]);

  const handleJump = () => {
    if (gameState !== 'playing') return;
    if (jumpStateRef.current === 'ground') {
      setJumpStateBoth('jumping');
      clearTimeout(jumpTimeout.current);
      jumpTimeout.current = setTimeout(() => setJumpStateBoth('ground'), 600);
    } else if (jumpStateRef.current === 'jumping') {
      setJumpStateBoth('double-jumping');
      clearTimeout(jumpTimeout.current);
      jumpTimeout.current = setTimeout(() => setJumpStateBoth('ground'), 500);
    }
  };

  const isWarpSpeed = scoreRef.current > targetScore * 0.7;
  const playerClass = jumpState === 'jumping' ? 'jumping' : jumpState === 'double-jumping' ? 'double-jumping' : 'running';

  return (
    <div className="sugar-bug-runner-game">
      <header className="game-header">
        <Link to="/games" className="back-btn"><ArrowLeft /> Back</Link>
        <div className="game-stats">
          <div className="stat-badge bg-teal">Level {currentLevel}</div>
          <div className="stat-badge bg-yellow"><Star size={16} fill="gold"/> {score}/{targetScore}</div>
          <div className="stat-badge bg-pink"><Zap size={16}/> Warp: {speedMultiplier.current.toFixed(1)}x</div>
        </div>
      </header>

      <div className="container game-container text-center">
        {gameState === 'intro' && (
          <motion.div className="intro-card card mt-12 glass" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
            <h1 className="game-title" style={{ color: '#FF6B9D', textShadow: '0 0 10px rgba(255,107,157,0.5)' }}>Neon Sugar Bug Run ⚡</h1>
            <p className="game-subtitle mb-8">Tap once to jump. Tap twice to DOUBLE JUMP over the glitchy neon bugs!</p>
            <button className="btn btn-primary btn-lg" onClick={startGame}>Initialize Run</button>
          </motion.div>
        )}

        {gameState === 'playing' && (
          <div
            className={isWarpSpeed ? 'runner-arena arena-warp' : 'runner-arena'}
            onPointerDown={handleJump}
            style={{ touchAction: 'none' }}
          >
            <div className="skyline">
              <div className="sun"></div>
            </div>
            <div className="runner-bg"></div>

            <div className={`player-tooth ${playerClass}`}>
              🦷
            </div>

            {obstacles.map(o => (
              <div key={o.id} className="obstacle" style={{ left: o.x + '%' }}>
                🦠
              </div>
            ))}

            {collectibles.map(c => !c.collected && (
              <div
                key={c.id}
                className={'collectible ' + c.height}
                style={{ left: c.x + '%' }}
              >
                ✨
              </div>
            ))}

            <div className="jump-hint">
              Tap to JUMP • Tap again to DOUBLE JUMP!
            </div>
          </div>
        )}

        {(gameState === 'won' || gameState === 'lost') && (
          <motion.div className="game-over card text-center mt-12 glass" initial={{ scale: 0.8, opacity: 0 }} animate={{ scale: 1, opacity: 1 }}>
            {gameState === 'won' ? (
              <>
                <div className="result-emoji bounce-in" style={{ fontSize: 80 }}>🏆</div>
                <h2 style={{ color: '#4ECDC4' }}>Hyperspeed Cleared!</h2>
                <p>You dodged every neon bug with your forcefield intact!</p>
                <div className="final-score"><Star size={24} fill="gold"/> {score} Score</div>
                <div className="rewards-badges mt-4 mb-4" style={{ display: 'flex', gap: 12, justifyContent: 'center' }}>
                  <span className="badge badge-yellow" style={{ fontSize: 18 }}>🪙 +50 Coins</span>
                  <span className="badge badge-purple" style={{ fontSize: 18 }}>⭐ +20 XP</span>
                </div>
              </>
            ) : (
              <>
                <div className="result-emoji" style={{ fontSize: 80, filter: 'grayscale(1)' }}>💥</div>
                <h2 style={{ color: '#FF6B9D' }}>Shield Down!</h2>
                <p>A glitchy bug broke your combo. Try again!</p>
                <div className="final-score"><Star size={24} fill="gold"/> {score} Score</div>
              </>
            )}
            <button className="btn btn-primary mt-6 btn-lg" onClick={startGame}>
              Reboot Run (Level {currentLevel + 1})
            </button>
          </motion.div>
        )}
      </div>
    </div>
  );
}
