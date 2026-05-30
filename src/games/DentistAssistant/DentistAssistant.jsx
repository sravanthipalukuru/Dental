import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ArrowLeft, Star, Clock } from 'lucide-react';
import { Link } from 'react-router-dom';
import confetti from 'canvas-confetti';
import { useStore } from '../../store/useStore';
import './DentistAssistant.css';

const toolsList = [
  { id: 'mirror', emoji: '🪞', name: 'Mirror' },
  { id: 'brush', emoji: '🪥', name: 'Brush' },
  { id: 'floss', emoji: '🧵', name: 'Floss' },
  { id: 'paste', emoji: '🧴', name: 'Paste' },
  { id: 'rinse', emoji: '🥤', name: 'Rinse Cup' },
];

export default function DentistAssistant() {
  const [traySlots, setTraySlots] = useState([null, null, null]);
  const [score, setScore] = useState(0);
  const [gameState, setGameState] = useState('playing'); 
  const completeGameLevel = useStore(state => state.completeGameLevel);
  const gameLevels = useStore(state => state.gameLevels);
  const currentLevel = gameLevels[13] || 0;

  const handleDragStart = (e, tool) => {
    e.dataTransfer.setData('tool', JSON.stringify(tool));
    e.target.classList.add('dragging');
  };

  const handleDragEnd = (e) => {
    e.target.classList.remove('dragging');
  };

  const handleDrop = (e, index) => {
    e.preventDefault();
    e.currentTarget.classList.remove('drag-over');

    const toolData = e.dataTransfer.getData('tool');
    if (toolData) {
      const tool = JSON.parse(toolData);
      
      const newTray = [...traySlots];
      newTray[index] = tool;
      setTraySlots(newTray);
      setScore(s => s + 50);

      // Mini confetti on placement
      const rect = e.currentTarget.getBoundingClientRect();
      confetti({
        particleCount: 20,
        spread: 40,
        origin: { x: (rect.left + rect.width/2)/window.innerWidth, y: (rect.top + rect.height/2)/window.innerHeight },
        colors: ['#4ECDC4']
      });

      if (newTray.every(slot => slot !== null)) {
        setTimeout(() => {
          setGameState('won');
          confetti({ particleCount: 100, spread: 70, origin: { y: 0.6 }});
          completeGameLevel(13);
        }, 500);
      }
    }
  };

  return (
    <div className="dentist-assistant-game">
      <header className="game-header">
        <Link to="/games" className="back-btn"><ArrowLeft /> Back</Link>
        <div className="game-stats">
          <div className="stat-badge bg-teal">Level {currentLevel}</div>
          <div className="stat-badge"><Star size={16} fill="gold"/> {score}</div>
        </div>
      </header>

      <div className="container game-container text-center">
        <div className="mb-8">
          <h1 className="game-title">Dentist Assistant 🧑‍⚕️</h1>
          <p className="game-subtitle">Drag the tools from the shelf to prepare Dr. Smiles' tray!</p>
        </div>

        {gameState === 'playing' ? (
          <div className="assistant-layout card">
            
            <div className="shelf-area">
              <h3>Supply Shelf</h3>
              <div className="shelf-grid">
                {toolsList.map(tool => (
                  <motion.div 
                    key={tool.id}
                    className="shelf-item"
                    draggable="true"
                    onDragStart={(e) => handleDragStart(e, tool)}
                    onDragEnd={handleDragEnd}
                    whileHover={{ scale: 1.1, rotate: 5, cursor: 'grab' }}
                    whileTap={{ scale: 0.9, cursor: 'grabbing' }}
                  >
                    <span className="item-emoji">{tool.emoji}</span>
                    <span className="item-name">{tool.name}</span>
                  </motion.div>
                ))}
              </div>
            </div>

            <div className="tray-area">
              <h3>Dr. Smiles' Tray</h3>
              <div className="tray-slots">
                {traySlots.map((slot, index) => (
                  <div 
                    key={index} 
                    className={`tray-slot ${slot ? 'filled' : ''}`}
                    onDragOver={e => { e.preventDefault(); e.currentTarget.classList.add('drag-over'); }}
                    onDragLeave={e => e.currentTarget.classList.remove('drag-over')}
                    onDrop={e => handleDrop(e, index)}
                  >
                    {slot ? (
                      <motion.div initial={{ scale: 0 }} animate={{ scale: 1 }} className="slotted-item">
                        {slot.emoji}
                      </motion.div>
                    ) : (
                      <span className="slot-hint">Drop Tool Here</span>
                    )}
                  </div>
                ))}
              </div>
            </div>

          </div>
        ) : (
           <motion.div className="game-over card text-center mt-8" initial={{ scale: 0.8, opacity: 0 }} animate={{ scale: 1, opacity: 1 }}>
            <div className="result-emoji bounce-in" style={{ fontSize: 80 }}>🎖️</div>
            <h2>Perfect Tray!</h2>
            <p>You set up the tray perfectly. Dr. Smiles is ready to work!</p>
            <div className="final-score"><Star size={24} fill="gold"/> {score} Score</div>
              <div className="rewards-badges mt-4 mb-4" style={{ display: 'flex', gap: 12, justifyContent: 'center' }}>
                <span className="badge badge-yellow" style={{ fontSize: 18 }}>🪙 +50 Coins</span>
                <span className="badge badge-blue" style={{ fontSize: 18 }}>⭐ +20 XP</span>
              </div>
            <button className="btn btn-primary mt-6" onClick={() => {
              setTraySlots([null, null, null]);
              setScore(0);
              setGameState('playing');
            }}>Continue (Level {currentLevel + 1})</button>
          </motion.div>
        )}
      </div>
    </div>
  );
}
