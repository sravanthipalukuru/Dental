const fs = require('fs');
const glob = require('glob');

const files = glob.sync('/Users/kaveen/Documents/teeth app/src/games/*/*.jsx');

files.forEach(file => {
  let content = fs.readFileSync(file, 'utf8');
  let modified = false;

  // Add the rewards UI below final-score
  if (content.includes('final-score') && !content.includes('rewards-badges')) {
    // Only inject in the win state. Usually the first final-score is the win state.
    // Actually, we can just inject it after any final-score that is inside the win block.
    // Or simpler: replace all final-scores with final-score + rewards, but then lose screens get rewards?
    // Let's just find the exact text "Score Earned!" or similar, or just manually do it for the most popular games.
    
    // Better regex: look for "gameState === 'won' ? (" or "isComplete && (" or "isWon && ("
    // Instead of regex hacking, let's just do a generic replacement for the first final-score block, which is almost always the win block.
    
    const parts = content.split('<div className="final-score">');
    if (parts.length > 1) {
      // Inject after the first one
      const endOfFirstScore = parts[1].indexOf('</div>') + 6;
      const before = parts[1].substring(0, endOfFirstScore);
      const after = parts[1].substring(endOfFirstScore);
      
      parts[1] = before + `\n              <div className="rewards-badges mt-4 mb-4" style={{ display: 'flex', gap: 12, justifyContent: 'center' }}>\n                <span className="badge badge-yellow" style={{ fontSize: 18 }}>🪙 +50 Coins</span>\n                <span className="badge badge-blue" style={{ fontSize: 18 }}>⭐ +20 XP</span>\n              </div>` + after;
      
      content = parts.join('<div className="final-score">');
      modified = true;
    }
  }
  
  // Update button text if possible
  if (content.includes('Again</button>')) {
    // Replace "Play Again", "Explore Again", etc with "Next Level / Retry"
    content = content.replace(/>([a-zA-Z\s]+) Again<\/button>/g, `>Continue (Level {currentLevel + 1})</button>`);
    modified = true;
  }

  if (modified) {
    fs.writeFileSync(file, content, 'utf8');
    console.log(`Patched rewards for ${file}`);
  }
});
console.log('Rewards patched successfully!');
