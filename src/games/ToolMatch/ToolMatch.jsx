import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ArrowLeft, Star, Clock } from 'lucide-react';
import { Link } from 'react-router-dom';
import confetti from 'canvas-confetti';
import { useStore } from '../../store/useStore';
import './ToolMatch.css';

const tools = [
  { id: 'mirror', name: 'Peek-a-boo Mirror', emoji: '🪞', job: 'Looking behind teeth', color: '#FF6B9D' },
  { id: 'probe', name: 'Tooth Tickler', emoji: '🥢', job: 'Counting and checking for sugar bugs', color: '#4ECDC4' },
  { id: 'suction', name: 'Water Vacuum', emoji: '🥤', job: 'Sucking up extra water', color: '#FFE66D' },
  { id: 'syringe', name: 'Wind Wand', emoji: '💨', job: 'Blowing air and spraying water', color: '#A8D8EA' },
  { id: 'bib', name: 'Superhero Cape', emoji: '🦸', job: 'Keeping your clothes clean', color: '#95E1D3' },
];

export default function ToolMatch() {
  const [availableTools, setAvailableTools] = useState([]);
  const [availableJobs, setAvailableJobs] = useState([]);
  const [matchedPairs, setMatchedPairs] = useState([]);
  const [score, setScore] = useState(0);
  const [timeLeft, setTimeLeft] = useState(60);
  const [gameState, setGameState] = useState('playing'); 
  const completeGameLevel = useStore(state => state.completeGameLevel);
  const gameLevels = useStore(state => state.gameLevels);
  const currentLevel = gameLevels[3] || 0;

  useEffect(() => {
    initGame();
  }, []);

  const initGame = () => {
    const shuffledTools = [...tools].sort(() => Math.random() - 0.5);
    const shuffledJobs = [...tools].map(t => ({ id: t.id, job: t.job })).sort(() => Math.random() - 0.5);
    setAvailableTools(shuffledTools);
    setAvailableJobs(shuffledJobs);
    setMatchedPairs([]);
    setScore(0);
    setTimeLeft(60);
    setGameState('playing');
  };

  useEffect(() => {
    if (gameState === 'playing' && timeLeft > 0) {
      const timer = setInterval(() => setTimeLeft(t => t - 1), 1000);
      return () => clearInterval(timer);
    } else if (timeLeft === 0 && matchedPairs.length < tools.length) {
      setGameState('lost');
    }
  }, [timeLeft, gameState, matchedPairs]);

  // Drag and Drop Logic
  const handleDragStart = (e, toolId) => {
    e.dataTransfer.setData('toolId', toolId);
    e.target.classList.add('dragging');
  };

  const handleDragEnd = (e) => {
    e.target.classList.remove('dragging');
  };

  const handleDragOver = (e) => {
    e.preventDefault(); // necessary to allow dropping
    e.currentTarget.classList.add('drag-over');
  };

  const handleDragLeave = (e) => {
    e.currentTarget.classList.remove('drag-over');
  };

  const handleDrop = (e, targetJobId) => {
    e.preventDefault();
    e.currentTarget.classList.remove('drag-over');
    
    const droppedToolId = e.dataTransfer.getData('toolId');
    if (!droppedToolId) return;

    if (droppedToolId === targetJobId) {
      // Match!
      setMatchedPairs(prev => [...prev, droppedToolId]);
      setScore(prev => prev + 100);
      
      // Mini pop animation/confetti for correct drop
      const rect = e.currentTarget.getBoundingClientRect();
      confetti({
        particleCount: 15,
        spread: 30,
        origin: { x: (rect.left + rect.width/2)/window.innerWidth, y: (rect.top + rect.height/2)/window.innerHeight },
        colors: ['#4ECDC4', '#FFE66D']
      });

      if (matchedPairs.length + 1 === tools.length) {
        setTimeout(() => {
          setGameState('won');
          confetti({ particleCount: 100, spread: 70, origin: { y: 0.6 }});
          completeGameLevel(3);
        }, 500);
      }
    } else {
      // Wrong Match Animation
      e.currentTarget.classList.add('shake-wrong');
      setTimeout(() => e.target.classList.remove('shake-wrong'), 400);
    }
  };

  return (
    <div className="tool-match-game">
      <header className="game-header">
        <Link to="/games" className="back-btn"><ArrowLeft /> Back</Link>
        <div className="game-stats">
          <div className="stat-badge bg-teal">Level {currentLevel}</div>
          <div className="stat-badge"><Star size={16} fill="gold"/> {score}</div>
          <div className={`stat-badge ${timeLeft < 10 ? 'urgent' : ''}`}><Clock size={16}/> {timeLeft}s</div>
        </div>
      </header>

      <div className="container game-container">
        <div className="text-center mb-8">
          <h1 className="game-title">Tool Match Drag & Drop 🧩</h1>
          <p className="game-subtitle">Drag Dr. Smiles' magical tools into the correct job box!</p>
        </div>

        <AnimatePresence mode="wait">
          {gameState === 'playing' ? (
            <motion.div 
              className="game-board"
              initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -20 }}
              key="board"
            >
              {/* Tools Column */}
              <div className="items-column">
                <h3>The Tools</h3>
                <div className="items-grid">
                  <AnimatePresence>
                    {availableTools.map((tool) => {
                      const isMatched = matchedPairs.includes(tool.id);
                      if (isMatched) return null; // Hide tool when matched

                      return (
                        <motion.div
                          key={`tool-${tool.id}`}
                          layoutId={`tool-${tool.id}`}
                          initial={{ opacity: 0, scale: 0.5 }}
                          animate={{ opacity: 1, scale: 1 }}
                          exit={{ opacity: 0, scale: 0 }}
                          className="tool-draggable card"
                          draggable="true"
                          onDragStart={(e) => handleDragStart(e, tool.id)}
                          onDragEnd={handleDragEnd}
                          style={{ borderColor: tool.color, borderLeftWidth: '8px' }}
                          whileHover={{ scale: 1.05, cursor: 'grab' }}
                          whileTap={{ cursor: 'grabbing' }}
                        >
                          <span className="item-emoji">{tool.emoji}</span>
                          <span className="item-name">{tool.name}</span>
                        </motion.div>
                      );
                    })}
                  </AnimatePresence>
                </div>
              </div>

              {/* Jobs Column */}
              <div className="items-column">
                <h3>The Friendly Jobs</h3>
                <div className="items-grid">
                  {availableJobs.map((jobObj) => {
                    const isMatched = matchedPairs.includes(jobObj.id);
                    const toolDetails = tools.find(t => t.id === jobObj.id);

                    return (
                      <div
                        key={`job-${jobObj.id}`}
                        className={`job-dropzone card ${isMatched ? 'matched-zone' : ''}`}
                        onDragOver={handleDragOver}
                        onDragLeave={handleDragLeave}
                        onDrop={(e) => handleDrop(e, jobObj.id)}
                      >
                        {isMatched ? (
                          <motion.div 
                            className="matched-content"
                            initial={{ scale: 0 }} animate={{ scale: 1 }}
                            transition={{ type: 'spring', bounce: 0.5 }}
                          >
                            <span className="matched-emoji">{toolDetails.emoji}</span>
                            <div className="matched-text">
                              <strong>{toolDetails.name}</strong>
                              <span>{jobObj.job}</span>
                            </div>
                          </motion.div>
                        ) : (
                          <span className="item-job-text">Drop here if: <br/><strong>{jobObj.job}</strong></span>
                        )}
                      </div>
                    );
                  })}
                </div>
              </div>
            </motion.div>
          ) : (
            <motion.div 
              className="game-over card text-center"
              initial={{ opacity: 0, scale: 0.8 }} animate={{ opacity: 1, scale: 1 }}
              key="gameover"
            >
              {gameState === 'won' ? (
                <>
                  <div className="result-emoji bounce-in">🏆</div>
                  <h2>You Did It!</h2>
                  <p>You matched all the tools and saved the day! Dr. Smiles is so proud.</p>
                  <div className="final-score"><Star size={24} fill="gold"/> {score + (timeLeft * 10)} Score</div>
              <div className="rewards-badges mt-4 mb-4" style={{ display: 'flex', gap: 12, justifyContent: 'center' }}>
                <span className="badge badge-yellow" style={{ fontSize: 18 }}>🪙 +50 Coins</span>
                <span className="badge badge-blue" style={{ fontSize: 18 }}>⭐ +20 XP</span>
              </div>
                  <p className="text-sm text-gray">({timeLeft} seconds remaining bonus!)</p>
                </>
              ) : (
                <>
                  <div className="result-emoji">⏰</div>
                  <h2>Time's Up!</h2>
                  <p>Oh no, the patients are arriving! Let's try again.</p>
                </>
              )}
              <button className="btn btn-primary mt-6" onClick={initGame}>Continue (Level {currentLevel + 1})</button>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}
