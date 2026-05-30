import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ArrowLeft, Star, RotateCcw } from 'lucide-react';
import { Link } from 'react-router-dom';
import confetti from 'canvas-confetti';
import { useStore } from '../../store/useStore';
import './ToothpastePuzzle.css';

// 3x3 Grid
const GRID_SIZE = 3;
const TOTAL_TILES = GRID_SIZE * GRID_SIZE;

export default function ToothpastePuzzle() {
  const [tiles, setTiles] = useState([]);
  const [isWon, setIsWon] = useState(false);
  const [moves, setMoves] = useState(0);
  const completeGameLevel = useStore(state => state.completeGameLevel);
  const gameLevels = useStore(state => state.gameLevels);
  const currentLevel = gameLevels[16] || 0;

  useEffect(() => {
    initPuzzle();
  }, []);

  const initPuzzle = () => {
    // True sliding puzzle needs 8 pieces and 1 empty space (null or id: 8)
    let initialTiles = Array.from({length: TOTAL_TILES}).map((_, i) => ({
      id: i,
      correctPos: i,
      isEmpty: i === TOTAL_TILES - 1
    }));

    // Shuffle by making valid moves (ensures solvability)
    let emptyIdx = TOTAL_TILES - 1;
    for (let i = 0; i < 100; i++) {
      const neighbors = getValidNeighbors(emptyIdx);
      const randomNeighbor = neighbors[Math.floor(Math.random() * neighbors.length)];
      
      // Swap
      const temp = initialTiles[emptyIdx];
      initialTiles[emptyIdx] = initialTiles[randomNeighbor];
      initialTiles[randomNeighbor] = temp;
      
      emptyIdx = randomNeighbor;
    }

    setTiles(initialTiles);
    setIsWon(false);
    setMoves(0);
  };

  const getValidNeighbors = (emptyIdx) => {
    const neighbors = [];
    const row = Math.floor(emptyIdx / GRID_SIZE);
    const col = emptyIdx % GRID_SIZE;

    if (row > 0) neighbors.push(emptyIdx - GRID_SIZE); // Up
    if (row < GRID_SIZE - 1) neighbors.push(emptyIdx + GRID_SIZE); // Down
    if (col > 0) neighbors.push(emptyIdx - 1); // Left
    if (col < GRID_SIZE - 1) neighbors.push(emptyIdx + 1); // Right
    
    return neighbors;
  };

  const handleTileClick = (clickedIdx) => {
    if (isWon) return;

    const emptyIdx = tiles.findIndex(t => t.isEmpty);
    const validMoves = getValidNeighbors(emptyIdx);

    if (validMoves.includes(clickedIdx)) {
      // Valid move! Swap them.
      const newTiles = [...tiles];
      newTiles[emptyIdx] = newTiles[clickedIdx];
      newTiles[clickedIdx] = tiles[emptyIdx];
      
      setTiles(newTiles);
      setMoves(m => m + 1);

      // Check win condition
      const isComplete = newTiles.every((t, i) => t.id === i);
      if (isComplete) {
        setIsWon(true);
        confetti({ particleCount: 150, spread: 80, origin: { y: 0.6 }});
        completeGameLevel(16);
      }
    }
  };

  return (
    <div className="toothpaste-puzzle-game">
      <header className="game-header">
        <Link to="/games" className="back-btn"><ArrowLeft /> Back</Link>
        <div className="game-stats">
          <div className="stat-badge bg-teal">Level {currentLevel}</div>
          <div className="stat-badge bg-blue">Moves: {moves}</div>
        </div>
      </header>

      <div className="container game-container text-center">
        <div className="mb-4">
          <h1 className="game-title">Toothpaste Puzzle 🖼️</h1>
          <p className="game-subtitle">Tap a tile next to the empty space to slide it over!</p>
        </div>

        <div className="puzzle-board-container card">
          <div className={`puzzle-grid sliding-puzzle ${isWon ? 'won-grid' : ''}`}>
            {tiles.map((tile, index) => {
              
              // Calculate background position based on correctPos
              const correctRow = Math.floor(tile.correctPos / GRID_SIZE);
              const correctCol = tile.correctPos % GRID_SIZE;
              
              return (
                <motion.div
                  layout // Framer motion handles the smooth sliding animation!
                  key={tile.id}
                  className={`puzzle-tile-container ${tile.isEmpty ? 'empty-tile' : ''}`}
                  onClick={() => handleTileClick(index)}
                  transition={{ type: 'spring', stiffness: 300, damping: 30 }}
                >
                  {!tile.isEmpty && (
                    <div 
                      className="puzzle-tile-image"
                      style={{
                        backgroundPosition: `${(correctCol / (GRID_SIZE - 1)) * 100}% ${(correctRow / (GRID_SIZE - 1)) * 100}%`
                      }}
                    >
                      {/* Hint number overlay */}
                      <span className="tile-hint">{tile.correctPos + 1}</span>
                    </div>
                  )}
                  {tile.isEmpty && isWon && (
                    <div className="puzzle-tile-image" style={{ backgroundPosition: '100% 100%' }}></div>
                  )}
                </motion.div>
              );
            })}
          </div>

          <button className="btn btn-outline mt-8" onClick={initPuzzle}>
            <RotateCcw size={16} className="mr-2"/> Shuffle
          </button>
        </div>

        <AnimatePresence>
          {isWon && (
            <motion.div className="game-over card text-center mt-6" initial={{ scale: 0.8, opacity: 0 }} animate={{ scale: 1, opacity: 1 }}>
              <div className="result-emoji bounce-in" style={{ fontSize: 80 }}>🖼️</div>
              <h2>Picture Perfect!</h2>
              <p>You slid all the pieces into the right place!</p>
              <div className="final-score"><Star size={24} fill="gold"/> {Math.max(50, 200 - (moves * 2))} Score</div>
              <div className="rewards-badges mt-4 mb-4" style={{ display: 'flex', gap: 12, justifyContent: 'center' }}>
                <span className="badge badge-yellow" style={{ fontSize: 18 }}>🪙 +50 Coins</span>
                <span className="badge badge-blue" style={{ fontSize: 18 }}>⭐ +20 XP</span>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}
