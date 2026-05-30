import { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence, useScroll, useTransform } from 'framer-motion';
import { ArrowLeft, Search, Star, ZoomIn } from 'lucide-react';
import { Link } from 'react-router-dom';
import confetti from 'canvas-confetti';
import { useStore } from '../../store/useStore';
import './ClinicExplorer.css';

const rooms = [
  { id: 'waiting', name: 'Waiting Room', icon: '🛋️', info: 'Where you play and relax before seeing Dr. Smiles. There are toys and books!', color: 'var(--teal)' },
  { id: 'xray', name: 'X-Ray Machine', icon: '📸', info: 'Takes cool pictures of the inside of your teeth! It just spins around your head.', color: 'var(--yellow)' },
  { id: 'chair', name: 'Magic Chair', icon: '💺', info: 'A special chair that goes up, down, and leans back like a spaceship.', color: 'var(--blue-light)' },
  { id: 'light', name: 'Sunshine Light', icon: '💡', info: 'A super bright light so Dr. Smiles can see every tiny sugar bug.', color: 'var(--pink)' },
  { id: 'prize', name: 'Prize Chest', icon: '🎁', info: 'Where you pick a reward for being so brave at the end!', color: 'gold' },
];

export default function ClinicExplorer() {
  const [discovered, setDiscovered] = useState([]);
  const [activeRoom, setActiveRoom] = useState(null);
  const containerRef = useRef(null);
  const completeGameLevel = useStore(state => state.completeGameLevel);
  const gameLevels = useStore(state => state.gameLevels);
  const currentLevel = gameLevels[2] || 0;

  // Parallax setup for a 3D feel
  const [mousePos, setMousePos] = useState({ x: 0, y: 0 });

  useEffect(() => {
    const handleMouseMove = (e) => {
      const { innerWidth, innerHeight } = window;
      setMousePos({
        x: (e.clientX / innerWidth) - 0.5,
        y: (e.clientY / innerHeight) - 0.5,
      });
    };
    window.addEventListener('mousemove', handleMouseMove);
    return () => window.removeEventListener('mousemove', handleMouseMove);
  }, []);

  const handleDiscover = (room) => {
    setActiveRoom(room);
    if (!discovered.includes(room.id)) {
      const newDiscovered = [...discovered, room.id];
      setDiscovered(newDiscovered);
      
      // Fire confetti when a room is discovered
      confetti({
        particleCount: 30,
        spread: 50,
        origin: { y: 0.7 },
        colors: ['#4ECDC4', '#FF6B9D', '#FFE66D']
      });

      if (newDiscovered.length === rooms.length) {
        setTimeout(() => {
          completeGameLevel(2); // Boosted rewards!
        }, 1500);
      }
    }
  };

  const isComplete = discovered.length === rooms.length;

  return (
    <div className="clinic-explorer-game" ref={containerRef}>
      <header className="game-header">
        <Link to="/games" className="back-btn"><ArrowLeft /> Back</Link>
        <div className="game-stats">
          <div className="stat-badge bg-teal">Level {currentLevel}</div>
          <div className="stat-badge bg-blue"><Search size={16}/> {discovered.length} / {rooms.length} Found</div>
        </div>
      </header>

      <div className="container game-container text-center">
        <div className="mb-4">
          <h1 className="game-title">Clinic Explorer 3D 🏥</h1>
          <p className="game-subtitle">Explore the interactive room and find all the secrets!</p>
        </div>

        <div className="parallax-room card overflow-hidden">
          {/* Background Layer */}
          <motion.div 
            className="room-layer room-bg"
            animate={{ x: mousePos.x * 20, y: mousePos.y * 20 }}
            transition={{ type: 'spring', stiffness: 50, damping: 20 }}
          ></motion.div>

          {/* Interactive Items Layer */}
          <motion.div 
            className="room-layer items-layer"
            animate={{ x: mousePos.x * -30, y: mousePos.y * -30 }}
            transition={{ type: 'spring', stiffness: 50, damping: 20 }}
          >
            {rooms.map((room, index) => {
              const isFound = discovered.includes(room.id);
              // Scatter them around using CSS percentages
              const positions = [
                { top: '20%', left: '10%' },
                { top: '15%', left: '70%' },
                { top: '50%', left: '40%' },
                { top: '70%', left: '15%' },
                { top: '75%', left: '75%' },
              ];

              return (
                <motion.div
                  key={room.id}
                  className={`interactive-item ${isFound ? 'found' : ''} ${activeRoom?.id === room.id ? 'active' : ''}`}
                  style={positions[index]}
                  onClick={() => handleDiscover(room)}
                  whileHover={{ scale: 1.15, rotate: isFound ? 5 : 0 }}
                  whileTap={{ scale: 0.9 }}
                >
                  <div className="item-glow" style={{ background: room.color }}></div>
                  <span className="item-icon">{room.icon}</span>
                  {!isFound && <ZoomIn className="magnify-hint" />}
                </motion.div>
              );
            })}
          </motion.div>

          {/* Overlay Info Card */}
          <AnimatePresence>
            {activeRoom && !isComplete && (
              <motion.div 
                className="room-info-overlay"
                initial={{ opacity: 0, scale: 0.8, y: 50 }} 
                animate={{ opacity: 1, scale: 1, y: 0 }} 
                exit={{ opacity: 0, scale: 0.8, y: 50 }}
              >
                <div className="info-card" style={{ borderTop: `6px solid ${activeRoom.color}` }}>
                  <div className="info-icon" style={{ background: activeRoom.color }}>{activeRoom.icon}</div>
                  <h3>{activeRoom.name}</h3>
                  <p>{activeRoom.info}</p>
                  <button className="btn btn-outline mt-4" onClick={() => setActiveRoom(null)}>Keep Exploring</button>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {/* Win Screen */}
        <AnimatePresence>
          {isComplete && (
            <motion.div 
              className="game-over card mt-6"
              initial={{ opacity: 0, scale: 0.8, y: 50 }} 
              animate={{ opacity: 1, scale: 1, y: 0 }}
            >
              <div className="result-emoji bounce-in" style={{ fontSize: 80 }}>🗺️</div>
              <h2>Exploration Complete!</h2>
              <p>You found every secret in the clinic. There's nothing to be afraid of!</p>
              <div className="final-score"><Star size={24} fill="gold"/> 200 Score Earned!</div>
              <div className="rewards-badges mt-4 mb-4" style={{ display: 'flex', gap: 12, justifyContent: 'center' }}>
                <span className="badge badge-yellow" style={{ fontSize: 18 }}>🪙 +50 Coins</span>
                <span className="badge badge-blue" style={{ fontSize: 18 }}>⭐ +20 XP</span>
              </div>
              <button className="btn btn-primary mt-6" onClick={() => { setDiscovered([]); setActiveRoom(null); }}>Continue (Level {currentLevel + 1})</button>
            </motion.div>
          )}
        </AnimatePresence>

      </div>
    </div>
  );
}
