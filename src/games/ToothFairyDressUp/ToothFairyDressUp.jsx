import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ArrowLeft, Star, Wand2 } from 'lucide-react';
import { Link } from 'react-router-dom';
import confetti from 'canvas-confetti';
import { useStore } from '../../store/useStore';
import './ToothFairyDressUp.css';

const wardrobe = {
  wings: [
    { id: 'w1', emoji: '🦋', name: 'Butterfly' },
    { id: 'w2', emoji: '🧚‍♀️', name: 'Classic' },
    { id: 'w3', emoji: '🦇', name: 'Nightwing' },
  ],
  wands: [
    { id: 'wa1', emoji: '🪄', name: 'Magic Wand' },
    { id: 'wa2', emoji: '✨', name: 'Sparkle Staff' },
    { id: 'wa3', emoji: '🍭', name: 'Lollipop' },
  ],
  crowns: [
    { id: 'c1', emoji: '👑', name: 'Gold Crown' },
    { id: 'c2', emoji: '🌸', name: 'Flower Crown' },
    { id: 'c3', emoji: '🧢', name: 'Cool Cap' },
  ]
};

export default function ToothFairyDressUp() {
  const [wings, setWings] = useState(wardrobe.wings[0]);
  const [wand, setWand] = useState(wardrobe.wands[0]);
  const [crown, setCrown] = useState(wardrobe.crowns[0]);
  
  const [gameState, setGameState] = useState('dressing'); // dressing, magic, done
  
  const completeGameLevel = useStore(state => state.completeGameLevel);
  const gameLevels = useStore(state => state.gameLevels);
  const currentLevel = gameLevels[19] || 0;

  const handleTransform = () => {
    setGameState('magic');
    
    // Magic sequence
    setTimeout(() => {
      setGameState('done');
      confetti({ particleCount: 200, spread: 100, origin: { y: 0.6 }});
      completeGameLevel(19);
    }, 2000);
  };

  return (
    <div className="tooth-fairy-game">
      <header className="game-header">
        <Link to="/games" className="back-btn"><ArrowLeft /> Back</Link>
      </header>

      <div className="container game-container text-center">
        <div className="mb-4">
          <h1 className="game-title">Tooth Fairy Dress Up 🧚‍♀️</h1>
          <p className="game-subtitle">Help the Tooth Fairy get ready for her night shift!</p>
        </div>

        <div className="fairy-layout card">
          {/* Display Area */}
          <div className="fairy-display">
            <AnimatePresence>
              {gameState === 'magic' && (
                <motion.div 
                  key="magic-overlay"
                  className="magic-overlay"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                />
              )}
            </AnimatePresence>

            <motion.div 
              className={`fairy-character ${gameState === 'magic' ? 'spinning' : ''}`}
              animate={gameState === 'done' ? { y: [0, -20, 0] } : {}}
              transition={{ repeat: gameState === 'done' ? Infinity : 0, duration: 2 }}
            >
              <div className="fairy-base">🦷</div>
              
              <motion.div key={wings.id} className="fairy-wings" initial={{ scale: 0 }} animate={{ scale: 1 }}>{wings.emoji}</motion.div>
              <motion.div key={wand.id} className="fairy-wand" initial={{ scale: 0 }} animate={{ scale: 1 }}>{wand.emoji}</motion.div>
              <motion.div key={crown.id} className="fairy-crown" initial={{ scale: 0, y: -50 }} animate={{ scale: 1, y: 0 }}>{crown.emoji}</motion.div>
            </motion.div>
          </div>

          {/* Controls Area */}
          <div className="fairy-controls">
            {gameState === 'dressing' ? (
              <div className="wardrobe">
                
                <div className="wardrobe-section">
                  <h3>Wings</h3>
                  <div className="options-row">
                    {wardrobe.wings.map(item => (
                      <button 
                        key={item.id} 
                        className={`wardrobe-btn ${wings.id === item.id ? 'active' : ''}`}
                        onClick={() => setWings(item)}
                      >
                        {item.emoji}
                      </button>
                    ))}
                  </div>
                </div>

                <div className="wardrobe-section">
                  <h3>Wand</h3>
                  <div className="options-row">
                    {wardrobe.wands.map(item => (
                      <button 
                        key={item.id} 
                        className={`wardrobe-btn ${wand.id === item.id ? 'active' : ''}`}
                        onClick={() => setWand(item)}
                      >
                        {item.emoji}
                      </button>
                    ))}
                  </div>
                </div>

                <div className="wardrobe-section">
                  <h3>Crown</h3>
                  <div className="options-row">
                    {wardrobe.crowns.map(item => (
                      <button 
                        key={item.id} 
                        className={`wardrobe-btn ${crown.id === item.id ? 'active' : ''}`}
                        onClick={() => setCrown(item)}
                      >
                        {item.emoji}
                      </button>
                    ))}
                  </div>
                </div>

                <button className="btn btn-primary w-full mt-8 btn-lg magical-btn" onClick={handleTransform}>
                  <Wand2 size={24} className="mr-2"/> Transform!
                </button>

              </div>
            ) : gameState === 'done' ? (
              <motion.div className="text-center py-12" initial={{ opacity: 0, scale: 0.8 }} animate={{ opacity: 1, scale: 1 }}>
                <h2 className="mb-4 text-3xl font-bold text-purple-600">She's Ready!</h2>
                <p className="text-gray mb-8">The Tooth Fairy looks absolutely magical.</p>
                <div className="final-score mb-8 justify-center"><Star size={24} fill="gold"/> 150 Score</div>
                <button className="btn btn-outline w-full" onClick={() => setGameState('dressing')}>Change Outfit</button>
              </motion.div>
            ) : (
              <div className="text-center py-20">
                <h2 className="text-2xl text-purple-600 font-bold animate-pulse">Sprinkling Magic Dust...</h2>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
