import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ArrowLeft, CheckCircle2, Star, Sparkles, ScanLine } from 'lucide-react';
import { Link } from 'react-router-dom';
import confetti from 'canvas-confetti';
import { useStore } from '../../store/useStore';
import './SmileBuilder.css';

const styles = {
  colors: [
    { id: 'white', hex: '#FFFFFF', name: 'Pearly White' },
    { id: 'cream', hex: '#FDF5E6', name: 'Natural Cream' },
    { id: 'blue', hex: '#E0FFFF', name: 'Ice Blue' },
    { id: 'pink', hex: '#FFB6C1', name: 'Cotton Candy' },
    { id: 'purple', hex: '#DDA0DD', name: 'Plum Magic' }
  ],
  braces: [
    { id: 'none', name: 'No Braces', color: 'transparent' },
    { id: 'silver', name: 'Silver Tech', color: '#bdc3c7' },
    { id: 'gold', name: 'Gold Star', color: '#f1c40f' },
    { id: 'neon', name: 'Neon Party', color: '#2ecc71' }
  ],
  accessories: [
    { id: 'none', emoji: '', name: 'Clean' },
    { id: 'gem', emoji: '💎', name: 'Tooth Gem' },
    { id: 'star', emoji: '⭐', name: 'Gold Star' }
  ]
};

export default function SmileBuilder() {
  const [color, setColor] = useState(styles.colors[0]);
  const [braces, setBraces] = useState(styles.braces[0]);
  const [accessory, setAccessory] = useState(styles.accessories[0]);
  const [sparkles, setSparkles] = useState(false);
  const [gameState, setGameState] = useState('building'); // building, done
  
  const completeGameLevel = useStore(state => state.completeGameLevel);
  const gameLevels = useStore(state => state.gameLevels);
  const currentLevel = gameLevels[11] || 0;

  const handleFinish = () => {
    setGameState('done');
    confetti({ particleCount: 150, spread: 80, origin: { y: 0.6 }, colors: ['#00ffff', '#ff00ff', '#ffffff'] });
    completeGameLevel(11); 
  };

  return (
    <div className="smile-builder-game">
      <header className="game-header">
        <Link to="/games" className="back-btn-holo"><ArrowLeft className="mr-2" /> Abort Mission</Link>
      </header>

      <div className="container game-container text-center" style={{ textAlign: 'center' }}>
        <div className="mb-4">
          <h1 className="game-title">Smile Builder Holo-Lab <ScanLine className="inline ml-2" size={32} color="#00ffff" /></h1>
          <p className="game-subtitle">INITIALIZE HOLOGRAM INTERFACE FOR DENTAL MODIFICATION</p>
        </div>

        <div className="builder-layout">
          {/* Preview Area */}
          <div className="preview-area glass-panel">
            <div className="laser-scanner"></div>
            <motion.div 
              className={`smile-preview ${sparkles ? 'sparkling' : ''}`}
              animate={{ backgroundColor: color.hex }}
              transition={{ duration: 0.5 }}
            >
              <div className="eyes">
                <motion.div className="eye" animate={{ scaleY: [1, 0.1, 1] }} transition={{ repeat: Infinity, duration: 4, repeatDelay: 1 }}></motion.div>
                <motion.div className="eye" animate={{ scaleY: [1, 0.1, 1] }} transition={{ repeat: Infinity, duration: 4, repeatDelay: 1 }}></motion.div>
              </div>
              
              <div className="mouth">
                <AnimatePresence>
                  {braces.id !== 'none' && (
                    <motion.div 
                      key="braces"
                      className="braces-overlay"
                      initial={{ scale: 0, opacity: 0 }}
                      animate={{ scale: 1, opacity: 1, borderColor: braces.color, color: braces.color }}
                      exit={{ scale: 0, opacity: 0 }}
                      transition={{ type: 'spring', bounce: 0.5 }}
                    >
                      <div className="brace-bracket" style={{ background: braces.color }}></div>
                      <div className="brace-bracket" style={{ background: braces.color }}></div>
                      <div className="brace-bracket" style={{ background: braces.color }}></div>
                      <div className="brace-bracket" style={{ background: braces.color }}></div>
                    </motion.div>
                  )}
                </AnimatePresence>

                <AnimatePresence>
                  {accessory.id !== 'none' && (
                    <motion.div 
                      key="accessory"
                      className="tooth-accessory"
                      initial={{ y: -50, opacity: 0, rotate: -45 }}
                      animate={{ y: 0, opacity: 1, rotate: 0 }}
                      exit={{ scale: 0, opacity: 0 }}
                      transition={{ type: 'spring', bounce: 0.6 }}
                    >
                      {accessory.emoji}
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            </motion.div>
          </div>

          {/* Controls Area */}
          <div className="controls-area glass-panel">
            <AnimatePresence mode="wait">
              {gameState === 'building' ? (
                <motion.div key="building" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }}>
                  
                  <div className="control-group">
                    <h3>Tooth Pigmentation</h3>
                    <div className="options-row">
                      {styles.colors.map(c => (
                        <motion.button 
                          key={c.id} 
                          className={`color-btn ${color.id === c.id ? 'active' : ''}`}
                          style={{ backgroundColor: c.hex }}
                          onClick={() => setColor(c)}
                          whileHover={{ scale: 1.1 }}
                          whileTap={{ scale: 0.9 }}
                          title={c.name}
                        />
                      ))}
                    </div>
                  </div>

                  <div className="control-group mt-6">
                    <h3>Hardware Modules</h3>
                    <div className="options-grid">
                      {styles.braces.map(b => (
                        <button 
                          key={b.id} 
                          className={`text-btn ${braces.id === b.id ? 'active' : ''}`}
                          onClick={() => setBraces(b)}
                        >
                          {b.name}
                        </button>
                      ))}
                    </div>
                  </div>

                  <div className="control-group mt-6">
                    <h3>Aesthetic Upgrades</h3>
                    <div className="options-grid">
                      {styles.accessories.map(a => (
                        <button 
                          key={a.id} 
                          className={`text-btn ${accessory.id === a.id ? 'active' : ''}`}
                          onClick={() => setAccessory(a)}
                        >
                          {a.emoji} {a.name}
                        </button>
                      ))}
                    </div>
                  </div>

                  <div className="control-group mt-6">
                    <h3>Energy Fields</h3>
                    <button 
                      className={`btn-holo ${sparkles ? 'btn-holo-primary' : ''}`}
                      onClick={() => setSparkles(!sparkles)}
                      style={{ marginTop: 0 }}
                    >
                      <Sparkles size={18} className="mr-2"/> {sparkles ? 'Fields Active' : 'Activate Fields'}
                    </button>
                  </div>

                  <button className="btn-holo btn-holo-primary w-full mt-8" onClick={handleFinish}>
                    Compile Simulation <CheckCircle2 size={24} className="ml-2" />
                  </button>
                </motion.div>
              ) : (
                <motion.div key="done" className="text-center py-12" initial={{ opacity: 0, scale: 0.8 }} animate={{ opacity: 1, scale: 1 }} style={{ textAlign: 'center' }}>
                  <div className="result-emoji bounce-in" style={{ fontSize: 80 }}>📸</div>
                  <h2 className="mb-4 text-3xl font-bold" style={{ color: '#00ffff', textShadow: '0 0 10px rgba(0,255,255,0.5)' }}>Scan Saved!</h2>
                  <p className="text-gray mb-8 text-lg">Subject has achieved an optimal aesthetic configuration.</p>
                  <div className="final-score mb-8 justify-center"><Star size={24} fill="#00ffff" color="#00ffff"/> Data Logged: 200XP</div>
                  <button className="btn-holo w-full" onClick={() => setGameState('building')}>Recalibrate</button>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </div>
      </div>
    </div>
  );
}
