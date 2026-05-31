import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { useStore } from '../store/useStore';
import GameCard from '../components/GameCard';
import { allGames, routeMap } from '../data/games';

export default function GamesLibrary() {
  const [filter, setFilter] = useState('All');
  const navigate = useNavigate();
  const { gameLevels } = useStore();
  
  const categories = ['All', ...new Set(allGames.map(g => g.category))];
  
  const filteredGames = filter === 'All' ? allGames : allGames.filter(g => g.category === filter);

  const handlePlay = (game) => {
    if (routeMap[game.id]) {
      navigate(routeMap[game.id]);
    } else {
      alert('🚧 Coming soon! This game is still being built.');
    }
  };

  return (
    <div className="section-pad" style={{ paddingTop: 'calc(var(--nav-height) + 40px)'}}>
      <div className="container">
        <div className="text-center mb-48">
          <h1 style={{fontSize: 40, marginBottom: 16}}>Games Library</h1>
          <p className="text-gray" style={{fontSize: 18}}>Play all {allGames.length} games to conquer your fears and become a Smile Champion!</p>
        </div>

        <div style={{display: 'flex', gap: 12, justifyContent: 'center', flexWrap: 'wrap', marginBottom: 40}}>
          {categories.map(c => (
            <button 
              key={c}
              className={`btn ${filter === c ? 'btn-primary' : 'btn-outline'}`}
              onClick={() => setFilter(c)}
              style={{padding: '8px 20px', fontSize: 14}}
            >
              {c}
            </button>
          ))}
        </div>

        <div className="games-grid" style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))', gap: 24 }}>
          {filteredGames.map((game, i) => {
             const currentLevel = gameLevels[game.id] || 0;
             return (
               <motion.div key={game.id} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.05 }}>
                 <GameCard game={game} locked={game.locked} currentLevel={currentLevel} onPlay={handlePlay} />
               </motion.div>
             )
          })}
        </div>
      </div>
    </div>
  );
}
