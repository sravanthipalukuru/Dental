import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ArrowLeft, Star, BookOpen, Cpu } from 'lucide-react';
import { Link } from 'react-router-dom';
import confetti from 'canvas-confetti';
import { useStore } from '../../store/useStore';
import './DentalAdventure.css';

const storyData = {
  start: {
    id: 'start',
    text: "Initializing Holo-Deck. You stand before the neon gates of Clinic Alpha. What is your directive?",
    image: "🌌",
    bgClass: "bg-cyber-blue",
    choices: [
      { text: "Enter the grid bravely!", next: "waiting_room" },
      { text: "Scan the perimeter first.", next: "window_peek" }
    ]
  },
  window_peek: {
    id: 'window_peek',
    text: "Sensors detect friendly avatars and low-gravity entertainment zones.",
    image: "📡",
    bgClass: "bg-cyber-teal",
    choices: [
      { text: "Acknowledge and proceed inside.", next: "waiting_room" }
    ]
  },
  waiting_room: {
    id: 'waiting_room',
    text: "You are in the stasis chamber. Holographic aquatic lifeforms swim in the void.",
    image: "🛰️",
    bgClass: "bg-cyber-purple",
    choices: [
      { text: "Access superhero datalogs.", next: "dr_smiles" },
      { text: "Observe the void swimmers.", next: "dr_smiles" }
    ]
  },
  dr_smiles: {
    id: 'dr_smiles',
    text: "Dr. Smiles manifests! 'Greetings, traveler! Ready for a dental diagnostic scan?'",
    image: "👨‍🚀",
    bgClass: "bg-cyber-pink",
    choices: [
      { text: "Affirmative! Engage!", next: "chair" },
      { text: "My anxiety levels are elevated...", next: "nervous" }
    ]
  },
  nervous: {
    id: 'nervous',
    text: "Dr. Smiles adjusts his visor. 'No worries! I will project the schematic before we proceed.'",
    image: "🤝",
    bgClass: "bg-cyber-orange",
    choices: [
      { text: "Accept protocol. Proceed.", next: "chair" }
    ]
  },
  chair: {
    id: 'chair',
    text: "You board the command chair. Anti-gravity thrusters engage!",
    image: "🚀",
    bgClass: "bg-cyber-blue",
    choices: [
      { text: "Initiate oral scan!", next: "win" }
    ]
  },
  win: {
    id: 'win',
    text: "Diagnostic complete. Oral integrity at 100%! You receive a digital merit badge!",
    image: "✨",
    bgClass: "bg-cyber-win",
    choices: []
  }
};

export default function DentalAdventure() {
  const [currentNodeId, setCurrentNodeId] = useState('start');
  const [history, setHistory] = useState([]);
  const [direction, setDirection] = useState(1);
  const completeGameLevel = useStore(state => state.completeGameLevel);
  const gameLevels = useStore(state => state.gameLevels);
  const currentLevel = gameLevels[8] || 0;

  const currentNode = storyData[currentNodeId];

  const handleChoice = (nextId) => {
    setDirection(1);
    setHistory(prev => [...prev, currentNodeId]);
    setCurrentNodeId(nextId);
    
    if (nextId === 'win') {
      confetti({ particleCount: 150, spread: 100, origin: { y: 0.6 }, colors: ['#0ff', '#f0f', '#00f']});
      completeGameLevel(8);
    }
  };

  const handleBack = () => {
    if (history.length > 0) {
      setDirection(-1);
      const prevId = history[history.length - 1];
      setHistory(prev => prev.slice(0, -1));
      setCurrentNodeId(prevId);
    }
  };

  const variants = {
    enter: (direction) => ({
      x: direction > 0 ? 1000 : -1000,
      opacity: 0,
      scale: 0.8,
      rotateY: 45 * direction
    }),
    center: {
      zIndex: 1,
      x: 0,
      opacity: 1,
      scale: 1,
      rotateY: 0
    },
    exit: (direction) => ({
      zIndex: 0,
      x: direction < 0 ? 1000 : -1000,
      opacity: 0,
      scale: 0.8,
      rotateY: -45 * direction
    })
  };

  return (
    <div className={`dental-adventure-game holo-deck ${currentNode.bgClass}`}>
      <div className="space-particles"></div>
      
      <header className="game-header cyberpunk-header">
        <Link to="/games" className="cyber-back-btn">
          <ArrowLeft size={18} /> Abort Mission
        </Link>
        <div className="game-stats cyber-stats">
          <div className="cyber-badge level-badge"><Cpu size={16}/> Level {currentLevel}</div>
          <div className="cyber-badge"><BookOpen size={16}/> Holo-Log</div>
        </div>
      </header>

      <div className="container game-container text-center relative z-10">
        <div className="mb-8 text-white">
          <h1 className="game-title neon-text">Holo-Deck Dental Sim</h1>
          <p className="game-subtitle cyber-subtext">Navigate the digital clinic protocols</p>
        </div>

        <div className="story-container">
          <AnimatePresence initial={false} custom={direction} mode="wait">
            <motion.div
              key={currentNodeId}
              custom={direction}
              variants={variants}
              initial="enter"
              animate="center"
              exit="exit"
              transition={{ type: "spring", stiffness: 200, damping: 20 }}
              className="story-card holo-panel"
            >
              <div className="story-image float neon-glow">{currentNode.image}</div>
              <h2 className="story-text glitch-effect">{currentNode.text}</h2>
              
              <div className="story-choices">
                {currentNode.choices.map((choice, i) => (
                  <motion.button 
                    key={i}
                    className="cyber-btn w-full"
                    onClick={() => handleChoice(choice.next)}
                    whileHover={{ scale: 1.03, boxShadow: "0 0 15px rgba(0, 255, 255, 0.6)" }}
                    whileTap={{ scale: 0.95 }}
                  >
                    <span className="btn-glitch-layer"></span>
                    {choice.text}
                  </motion.button>
                ))}
              </div>

              {currentNodeId === 'win' && (
                <motion.div 
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.5 }}
                  className="mt-8"
                >
                  <div className="final-score neon-text mb-6">
                    <Star size={28} className="text-yellow-400 drop-shadow-[0_0_10px_rgba(250,204,21,0.8)]"/> 
                    <span className="ml-2">100 XP SECURED</span>
                  </div>
                  <button className="cyber-btn outline-variant" onClick={() => {
                     setHistory([]);
                     setCurrentNodeId('start');
                  }}>Restart Sequence (Level {currentLevel + 1})</button>
                </motion.div>
              )}

              {history.length > 0 && currentNodeId !== 'win' && (
                <button className="cyber-back-link mt-6" onClick={handleBack}>
                  &#60; Revert Last Action
                </button>
              )}
            </motion.div>
          </AnimatePresence>
        </div>
      </div>
    </div>
  );
}
