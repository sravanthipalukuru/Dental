import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { ArrowLeft, Award, Trophy, Sparkles } from 'lucide-react';
import { Link } from 'react-router-dom';
import confetti from 'canvas-confetti';
import { useStore } from '../../store/useStore';
import './GraduationDay.css';

export default function GraduationDay() {
  const [gameState, setGameState] = useState('waiting'); // waiting, ceremony, credits
  const completeGameLevel = useStore(state => state.completeGameLevel);
  const gameLevels = useStore(state => state.gameLevels);
  const currentLevel = gameLevels[20] || 0;
  const totalScore = useStore(state => state.totalScore);

  const startCeremony = () => {
    setGameState('ceremony');

    // Epic fireworks
    const duration = 5 * 1000;
    const animationEnd = Date.now() + duration;
    const defaults = { startVelocity: 30, spread: 360, ticks: 60, zIndex: 0 };

    const randomInRange = (min, max) => Math.random() * (max - min) + min;

    const interval = setInterval(function() {
      const timeLeft = animationEnd - Date.now();

      if (timeLeft <= 0) {
        return clearInterval(interval);
      }

      const particleCount = 50 * (timeLeft / duration);
      confetti(Object.assign({}, defaults, { particleCount, origin: { x: randomInRange(0.1, 0.3), y: Math.random() - 0.2 } }));
      confetti(Object.assign({}, defaults, { particleCount, origin: { x: randomInRange(0.7, 0.9), y: Math.random() - 0.2 } }));
    }, 250);

    // Proceed to credits after 6 seconds
    setTimeout(() => {
      setGameState('credits');
      completeGameLevel(20); // Big final reward
    }, 6000);
  };

  return (
    <div className="graduation-day-game">
      <header className="game-header text-white" style={{ borderBottom: 'none' }}>
        <Link to="/games" className="back-btn text-white border-white hover:bg-white/20"><ArrowLeft /> Back to Clinic</Link>
      </header>

      <div className="container game-container text-center">
        
        {gameState === 'waiting' && (
          <motion.div className="intro-card card mx-auto mt-12 max-w-lg" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
            <h1 className="game-title text-4xl mb-6">Graduation Day! 🎓</h1>
            <p className="game-subtitle mb-8 text-lg">You have completed all your training. Are you ready to receive your Official Super Smile Certificate?</p>
            <button className="btn btn-primary btn-lg w-full py-4 text-xl flex items-center justify-center gap-2" onClick={startCeremony}>
              Start the Ceremony! <Sparkles />
            </button>
          </motion.div>
        )}

        {gameState === 'ceremony' && (
          <div className="ceremony-view">
            <motion.div 
              className="diploma-container"
              initial={{ scale: 0, rotate: -180 }}
              animate={{ scale: 1, rotate: 0 }}
              transition={{ type: 'spring', damping: 10, stiffness: 50, duration: 2 }}
            >
              <div className="diploma">
                <Trophy size={64} className="mx-auto mb-4 text-yellow-500" />
                <h1 className="font-serif text-3xl font-bold mb-2">Certificate of Bravery</h1>
                <p className="text-gray-600 mb-6">This certifies that you are an official</p>
                <h2 className="text-4xl font-bold text-teal-600 mb-6">Super Smile Expert!</h2>
                <div className="flex justify-between items-end border-t-2 border-gray-300 pt-8 mt-12 px-8">
                  <div className="text-center">
                    <div className="font-script text-2xl">Dr. Smiles</div>
                    <div className="text-sm text-gray-500 uppercase tracking-widest">Chief Dentist</div>
                  </div>
                  <div className="text-center">
                    <Award size={48} className="text-yellow-500 mx-auto" />
                  </div>
                </div>
              </div>
            </motion.div>
          </div>
        )}

        {gameState === 'credits' && (
          <div className="credits-view">
            <motion.div 
              className="credits-roll"
              initial={{ y: '100%' }}
              animate={{ y: '-150%' }}
              transition={{ duration: 15, ease: 'linear' }}
            >
              <h2 className="text-6xl font-bold text-yellow-400 mb-12 drop-shadow-lg">Congratulations!</h2>
              
              <div className="credit-block">
                <h3 className="text-gray-400 uppercase tracking-widest text-sm mb-2">Total Score Achieved</h3>
                <p className="text-5xl font-black text-white">{totalScore.toLocaleString()}</p>
              </div>

              <div className="credit-block">
                <h3 className="text-gray-400 uppercase tracking-widest text-sm mb-2">Games Mastered</h3>
                <p className="text-3xl font-bold text-white">20 / 20</p>
              </div>

              <div className="credit-block">
                <h3 className="text-gray-400 uppercase tracking-widest text-sm mb-2">Star Patient</h3>
                <p className="text-3xl font-bold text-white">YOU!</p>
              </div>

              <div className="mt-32">
                <p className="text-xl text-teal-300">Keep smiling and brushing every day!</p>
                <Link to="/" className="btn btn-primary mt-12">Return to Home Screen</Link>
              </div>

            </motion.div>
          </div>
        )}

      </div>
    </div>
  );
}
