const fs = require('fs');
const glob = require('glob');

const files = glob.sync('/Users/kaveen/Documents/teeth app/src/games/*/*.jsx');

files.forEach(file => {
  let content = fs.readFileSync(file, 'utf8');
  let modified = false;

  // Find the game ID from the completeGame call
  const match = content.match(/completeGame\((\d+)/);
  if (match) {
    const gameId = match[1];

    // 1. Replace the completeGame hook
    if (content.includes('const completeGame = useStore')) {
      content = content.replace(
        /const completeGame = useStore[^\n]+/,
        `const completeGameLevel = useStore(state => state.completeGameLevel);\n  const gameLevels = useStore(state => state.gameLevels);\n  const currentLevel = gameLevels[${gameId}] || 0;`
      );
      modified = true;
    }

    // 2. Replace the completeGame(...) call
    if (content.match(/completeGame\(\d+[^)]*\)/)) {
      content = content.replace(/completeGame\(\d+[^)]*\)/g, `completeGameLevel(${gameId})`);
      modified = true;
    }

    // 3. Add the Level badge to the header
    if (content.includes('<div className="game-stats">') && !content.includes('Level {currentLevel}')) {
      content = content.replace(
        '<div className="game-stats">',
        `<div className="game-stats">\n          <div className="stat-badge bg-teal">Level {currentLevel}</div>`
      );
      modified = true;
    }
  }

  if (modified) {
    fs.writeFileSync(file, content, 'utf8');
    console.log(`Patched ${file}`);
  }
});
console.log('All games patched successfully!');
