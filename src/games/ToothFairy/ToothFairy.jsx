import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ArrowLeft, Star, Camera } from 'lucide-react';
import { Link } from 'react-router-dom';
import { useStore } from '../../store/useStore';
import './ToothFairy.css';

const OPTIONS = {
  wings: [
    { id: 'w1', label: 'Classic', emoji: '🧚‍♀️' },
    { id: 'w2', label: 'Butterfly', emoji: '🦋' },
    { id: 'w3', label: 'Starry', emoji: '✨' },
  ],
  dress: [
    { id: 'd1', label: 'Blue', color: '#A8D8EA' },
    { id: 'd2', label: 'Pink', color: '#FF6B9D' },
    { id: 'd3', label: 'Mint', color: '#95E1D3' },
    { id: 'd4', label: 'Yellow', color: '#FFE66D' },
  ],
  wand: [
    { id: 'm1', label: 'Star', emoji: '⭐' },
    { id: 'm2', label: 'Tooth', emoji: '🦷' },
    { id: 'm3', label: 'Heart', emoji: '❤️' },
  ]
};

export default function ToothFairy() {
  const [wings, setWings] = useState(OPTIONS.wings[0]);
  const [dress, setDress] = useState(OPTIONS.dress[0]);
  const [wand, setWand] = useState(OPTIONS.wand[0]);
  
  const [gameState, setGameState] = useState('playing'); // playing, finished
  const completeGameLevel = useStore(state => state.completeGameLevel);
  const gameLevels = useStore(state => state.gameLevels);
  const currentLevel = gameLevels[20] || 0;

  const handleFinish = () => {
    setGameState('finished');
    completeGameLevel(20); // Big reward for finishing the last game!
  };

  return (
    <div className="tooth-fairy-game">
      <header className="game-header">
        <Link to="/games" className="back-btn"><ArrowLeft /> Back</Link>
      </header>

      <div className="container game-container text-center">
        <div className="mb-8">
          <h1 className="game-title">Tooth Fairy Dress Up 🧚‍♀️</h1>
          <p className="game-subtitle">Create your perfect Tooth Fairy character!</p>
        </div>

        {gameState === 'playing' ? (
          <div className="fairy-layout">
            
            {/* The Character Preview */}
            <div className="fairy-preview card">
              <motion.div 
                className="fairy-character"
                animate={{ y: [0, -15, 0] }}
                transition={{ repeat: Infinity, duration: 4, ease: "easeInOut" }}
              >
                {/* Visual construction of the fairy using CSS/Emojis */}
                <div className="f-wings" key={wings.id}>{wings.emoji}</div>
                <div className="f-head">👱‍♀️</div>
                <div className="f-dress" style={{ background: dress.color }} key={dress.id}></div>
                <div className="f-wand" key={wand.id}>
                  <div className="wand-stick"></div>
                  <div className="wand-top">{wand.emoji}</div>
                </div>
              </motion.div>
            </div>

            {/* Customization Controls */}
            <div className="fairy-controls card">
              
              <div className="control-section">
                <h3>Dress Color</h3>
                <div className="options-row">
                  {OPTIONS.dress.map(opt => (
                    <button 
                      key={opt.id}
                      className={`color-btn ${dress.id === opt.id ? 'active' : ''}`}
                      style={{ background: opt.color }}
                      onClick={() => setDress(opt)}
                    ></button>
                  ))}
                </div>
              </div>

              <div className="control-section">
                <h3>Wings</h3>
                <div className="options-row">
                  {OPTIONS.wings.map(opt => (
                    <button 
                      key={opt.id}
                      className={`opt-btn ${wings.id === opt.id ? 'active' : ''}`}
                      onClick={() => setWings(opt)}
                    >
                      {opt.emoji}
                    </button>
                  ))}
                </div>
              </div>

              <div className="control-section">
                <h3>Magic Wand</h3>
                <div className="options-row">
                  {OPTIONS.wand.map(opt => (
                    <button 
                      key={opt.id}
                      className={`opt-btn ${wand.id === opt.id ? 'active' : ''}`}
                      onClick={() => setWand(opt)}
                    >
                      {opt.emoji}
                    </button>
                  ))}
                </div>
              </div>

              <button className="btn btn-primary btn-lg mt-6" style={{ width: '100%' }} onClick={handleFinish}>
                <Camera className="mr-2" /> Take Photo!
              </button>

            </div>

          </div>
        ) : (
          <motion.div className="game-over card text-center" initial={{ scale: 0.8, opacity: 0 }} animate={{ scale: 1, opacity: 1 }}>
            
            <div className="fairy-character mb-8 mx-auto" style={{ position: 'relative', height: 200 }}>
              <div className="f-wings">{wings.emoji}</div>
              <div className="f-head">👱‍♀️</div>
              <div className="f-dress" style={{ background: dress.color }}></div>
              <div className="f-wand">
                <div className="wand-stick"></div>
                <div className="wand-top">{wand.emoji}</div>
              </div>
            </div>

            <h2>Beautiful!</h2>
            <p>Your Tooth Fairy is ready to collect some teeth tonight!</p>
            <div className="final-score"><Star fill="gold" /> 500 Score</div>
              <div className="rewards-badges mt-4 mb-4" style={{ display: 'flex', gap: 12, justifyContent: 'center' }}>
                <span className="badge badge-yellow" style={{ fontSize: 18 }}>🪙 +50 Coins</span>
                <span className="badge badge-blue" style={{ fontSize: 18 }}>⭐ +20 XP</span>
              </div>
            
            <div className="mt-6">
              <button className="btn btn-outline mr-4" onClick={() => setGameState('playing')}>Design Another</button>
              <Link to="/games" className="btn btn-primary">Back to Games</Link>
            </div>
          </motion.div>
        )}

      </div>
    </div>
  );
}
