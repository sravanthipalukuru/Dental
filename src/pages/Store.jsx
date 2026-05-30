import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useStore } from '../store/useStore';
import './Store.css';

const storeItems = [
  { id: 'avatar_unicorn', title: 'Sparkle Unicorn', desc: 'A magical friend for your profile.', emoji: '🦄', cost: 100, bg: 'linear-gradient(135deg, #F472B6, #C084FC)' },
  { id: 'avatar_dino', title: 'Rex the Dino', desc: 'Roar! A brave dinosaur avatar.', emoji: '🦖', cost: 150, bg: 'linear-gradient(135deg, #34D399, #10B981)' },
  { id: 'avatar_ninja', title: 'Tooth Ninja', desc: 'Sneaky and fast flosser.', emoji: '🥷', cost: 200, bg: 'linear-gradient(135deg, #9CA3AF, #4B5563)' },
  { id: 'avatar_robot', title: 'Cyber Smile', desc: 'The future of dentistry.', emoji: '🤖', cost: 300, bg: 'linear-gradient(135deg, #60A5FA, #3B82F6)' },
  { id: 'avatar_alien', title: 'Cosmic Invader', desc: 'From a galaxy far away.', emoji: '👽', cost: 500, bg: 'linear-gradient(135deg, #A78BFA, #8B5CF6)' },
  { id: 'avatar_dragon', title: 'Fire Breath', desc: 'A legendary dragon companion.', emoji: '🐉', cost: 1000, bg: 'linear-gradient(135deg, #F87171, #EF4444)' }
];

export default function Store() {
  const { coins, purchasedItems, buyItem, userId } = useStore();
  const [buyingId, setBuyingId] = useState(null);

  const handleBuy = async (item) => {
    if (!userId) {
      alert("Please login first to buy items!");
      return;
    }
    
    setBuyingId(item.id);
    const success = await buyItem(item.id, item.cost);
    setBuyingId(null);
    
    if (success) {
      // Could add a confetti effect here!
    } else {
      alert("Purchase failed! Please try again.");
    }
  };

  return (
    <div className="store-page">
      <div className="container">
        
        <header className="store-header">
          <motion.h1 initial={{ y: -20, opacity: 0 }} animate={{ y: 0, opacity: 1 }}>
            Epic Store
          </motion.h1>
          <motion.div 
            className="coin-balance"
            initial={{ scale: 0.8, opacity: 0 }} 
            animate={{ scale: 1, opacity: 1 }}
            transition={{ delay: 0.1 }}
          >
            <span className="coin-icon">🪙</span>
            {coins} Coins
          </motion.div>
        </header>

        <div className="store-grid">
          {storeItems.map((item, i) => {
            const isOwned = purchasedItems.includes(item.id);
            const canAfford = coins >= item.cost;
            const isBuying = buyingId === item.id;

            return (
              <motion.div 
                key={item.id} 
                className="store-item"
                style={{ '--item-bg': item.bg }}
                initial={{ opacity: 0, y: 30 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.1 }}
              >
                <div className="item-emoji">{item.emoji}</div>
                <h3 className="item-title">{item.title}</h3>
                <p className="item-desc">{item.desc}</p>
                
                <button 
                  className={`buy-btn ${isOwned ? 'buy-btn--owned' : canAfford ? 'buy-btn--available' : 'buy-btn--disabled'}`}
                  onClick={() => !isOwned && canAfford && !isBuying && handleBuy(item)}
                  disabled={isOwned || !canAfford || isBuying}
                >
                  {isOwned ? (
                    '✅ Owned'
                  ) : isBuying ? (
                    'Processing...'
                  ) : (
                    <>🪙 {item.cost} Coins</>
                  )}
                </button>
              </motion.div>
            );
          })}
        </div>

      </div>
    </div>
  );
}
