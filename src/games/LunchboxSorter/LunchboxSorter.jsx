import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ArrowLeft, Star } from 'lucide-react';
import { Link } from 'react-router-dom';
import confetti from 'canvas-confetti';
import { useStore } from '../../store/useStore';
import './LunchboxSorter.css';

const ALL_FOODS = [
  { id: 'apple', emoji: '🍎', type: 'healthy', name: 'Apple' },
  { id: 'broccoli', emoji: '🥦', type: 'healthy', name: 'Broccoli' },
  { id: 'carrot', emoji: '🥕', type: 'healthy', name: 'Carrot' },
  { id: 'water', emoji: '💧', type: 'healthy', name: 'Water' },
  { id: 'candy', emoji: '🍬', type: 'treat', name: 'Candy' },
  { id: 'soda', emoji: '🥤', type: 'treat', name: 'Soda' },
  { id: 'cake', emoji: '🍰', type: 'treat', name: 'Cake' },
  { id: 'donut', emoji: '🍩', type: 'treat', name: 'Donut' },
];

export default function LunchboxSorter() {
  const [foods, setFoods] = useState([]);
  const [healthyBox, setHealthyBox] = useState([]);
  const [treatBox, setTreatBox] = useState([]);
  const [gameState, setGameState] = useState('playing');
  const [score, setScore] = useState(0);

  const completeGameLevel = useStore(state => state.completeGameLevel);
  const gameLevels = useStore(state => state.gameLevels);
  const currentLevel = gameLevels[18] || 0;

  useEffect(() => {
    initGame();
  }, []);

  const initGame = () => {
    setFoods([...ALL_FOODS].sort(() => Math.random() - 0.5));
    setHealthyBox([]);
    setTreatBox([]);
    setGameState('playing');
    setScore(0);
  };

  const handleDragStart = (e, food) => {
    e.dataTransfer.setData('food', JSON.stringify(food));
    e.target.classList.add('dragging');
  };

  const handleDragEnd = (e) => {
    e.target.classList.remove('dragging');
  };

  const handleDrop = (e, boxType) => {
    e.preventDefault();
    e.currentTarget.classList.remove('drag-over');

    const foodData = e.dataTransfer.getData('food');
    if (!foodData) return;
    
    const food = JSON.parse(foodData);

    if (food.type === boxType) {
      // Correct Match!
      setScore(s => s + 50);
      setFoods(prev => prev.filter(f => f.id !== food.id));
      
      if (boxType === 'healthy') {
        setHealthyBox(prev => [...prev, food]);
      } else {
        setTreatBox(prev => [...prev, food]);
      }

      // Check win condition
      if (foods.length === 1) { // 1 left, and we just sorted it
        setTimeout(() => {
          setGameState('won');
          confetti({ particleCount: 150, spread: 80, origin: { y: 0.6 }});
          completeGameLevel(18);
        }, 500);
      }

    } else {
      // Wrong box!
      e.currentTarget.classList.add('shake-wrong');
      setTimeout(() => e.target.classList.remove('shake-wrong'), 400);
      setScore(s => Math.max(0, s - 10)); // small penalty
    }
  };

  return (
    <div className="lunchbox-sorter-game">
      <header className="game-header">
        <Link to="/games" className="back-btn"><ArrowLeft /> Back</Link>
        <div className="game-stats">
          <div className="stat-badge bg-teal">Level {currentLevel}</div>
          <div className="stat-badge"><Star size={16} fill="gold"/> {score}</div>
        </div>
      </header>

      <div className="container game-container text-center">
        <div className="mb-4">
          <h1 className="game-title">Lunchbox Sorter 🍱</h1>
          <p className="game-subtitle">Drag the food into the Everyday Healthy box or the Sometimes Treat box!</p>
        </div>

        {gameState === 'playing' ? (
          <div className="sorter-layout">
            
            <div className="food-conveyor card">
              <AnimatePresence>
                {foods.map(food => (
                  <motion.div
                    key={food.id}
                    layoutId={`food-${food.id}`}
                    className="food-item"
                    draggable="true"
                    onDragStart={(e) => handleDragStart(e, food)}
                    onDragEnd={handleDragEnd}
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    exit={{ scale: 0 }}
                    whileHover={{ scale: 1.1, cursor: 'grab' }}
                    whileTap={{ scale: 0.9, cursor: 'grabbing' }}
                  >
                    {food.emoji}
                  </motion.div>
                ))}
              </AnimatePresence>
            </div>

            <div className="boxes-container">
              <div 
                className="sort-box healthy-box"
                onDragOver={e => { e.preventDefault(); e.currentTarget.classList.add('drag-over'); }}
                onDragLeave={e => e.currentTarget.classList.remove('drag-over')}
                onDrop={e => handleDrop(e, 'healthy')}
              >
                <div className="box-lid bg-green text-white font-bold py-2 rounded-t-lg shadow-sm">Everyday Foods 🥗</div>
                <div className="box-inside">
                  {healthyBox.map(f => (
                    <motion.div key={f.id} initial={{ scale: 0 }} animate={{ scale: 1 }} className="boxed-food">
                      {f.emoji}
                    </motion.div>
                  ))}
                </div>
              </div>

              <div 
                className="sort-box treat-box"
                onDragOver={e => { e.preventDefault(); e.currentTarget.classList.add('drag-over'); }}
                onDragLeave={e => e.currentTarget.classList.remove('drag-over')}
                onDrop={e => handleDrop(e, 'treat')}
              >
                <div className="box-lid bg-pink text-white font-bold py-2 rounded-t-lg shadow-sm">Sometimes Treats 🍭</div>
                <div className="box-inside">
                  {treatBox.map(f => (
                    <motion.div key={f.id} initial={{ scale: 0 }} animate={{ scale: 1 }} className="boxed-food">
                      {f.emoji}
                    </motion.div>
                  ))}
                </div>
              </div>
            </div>

          </div>
        ) : (
          <motion.div className="game-over card text-center mt-12" initial={{ scale: 0.8, opacity: 0 }} animate={{ scale: 1, opacity: 1 }}>
            <div className="result-emoji bounce-in" style={{ fontSize: 80 }}>🍱</div>
            <h2>Expert Sorter!</h2>
            <p>You know exactly what helps your teeth grow strong and what should just be a sometimes treat.</p>
            <div className="final-score"><Star size={24} fill="gold"/> {score + 100} Score</div>
              <div className="rewards-badges mt-4 mb-4" style={{ display: 'flex', gap: 12, justifyContent: 'center' }}>
                <span className="badge badge-yellow" style={{ fontSize: 18 }}>🪙 +50 Coins</span>
                <span className="badge badge-blue" style={{ fontSize: 18 }}>⭐ +20 XP</span>
              </div>
            <button className="btn btn-primary mt-6 btn-lg" onClick={initGame}>Continue (Level {currentLevel + 1})</button>
          </motion.div>
        )}

      </div>
    </div>
  );
}
