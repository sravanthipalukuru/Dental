import express from 'express';
import cors from 'cors';
import mongoose from 'mongoose';
import Progress from './models/Progress.js';
import Chat from './models/Chat.js';

const app = express();
app.use(cors());
app.use(express.json());

const PORT = 54321;

// MongoDB Connection
const MONGO_URI = "mongodb+srv://kaveens555_db_user:dental@cluster0.prqmrhr.mongodb.net/?appName=Cluster0";

mongoose.connect(MONGO_URI)
  .then(() => console.log('Connected to MongoDB Cloud'))
  .catch((err) => console.error('MongoDB connection error:', err));

// Helper to get default progress
const getDefaultProgress = (userId) => ({
  userId,
  coins: 0,
  level: 1,
  xp: 0,
  badges: [],
  gamesCompleted: [],
  anxietyScore: 50,
  readinessScore: 50,
  avatar: '🐻',
  displayName: userId,
  age: null,
  birthday: null,
  purchasedItems: [],
  gameLevels: {}
});

// GET user progress
app.get('/api/progress/:userId', async (req, res) => {
  try {
    console.log(`[GET] /api/progress/${req.params.userId}`);
    const userId = req.params.userId;
    let progress = await Progress.findOne({ userId });
    
    if (!progress) {
      // Create default if not found
      progress = new Progress(getDefaultProgress(userId));
      await progress.save();
    }
    
    res.json(progress);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// GET all patients
app.get('/api/patients', async (req, res) => {
  try {
    console.log(`[GET] /api/patients`);
    const patients = await Progress.find({});
    res.json(patients);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// POST to update progress after completing a game
app.post('/api/progress/:userId/complete-game', async (req, res) => {
  try {
    console.log(`[POST] complete-game for ${req.params.userId}`, req.body);
    const { gameId, scoreEarned, anxietyReduction } = req.body;
    const userId = req.params.userId;
    
    let progress = await Progress.findOne({ userId });
    if (!progress) {
      progress = new Progress(getDefaultProgress(userId));
    }

    const isNewCompletion = !progress.gamesCompleted.includes(gameId);
    if (isNewCompletion) {
      progress.gamesCompleted.push(gameId);
    }
    
    progress.coins += scoreEarned;
    progress.anxietyScore = Math.max(0, progress.anxietyScore - anxietyReduction);
    progress.readinessScore = Math.min(100, progress.readinessScore + anxietyReduction);
    
    const xpEarned = isNewCompletion ? 50 : 10;
    progress.xp += xpEarned;
    progress.level = Math.floor(progress.xp / 100) + 1;

    await progress.save();
    res.json(progress);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: error.message });
  }
});

// PUT to update avatar
app.put('/api/progress/:userId/avatar', async (req, res) => {
  try {
    console.log(`[PUT] avatar for ${req.params.userId}`, req.body);
    const { avatar } = req.body;
    const userId = req.params.userId;
    
    const progress = await Progress.findOneAndUpdate(
      { userId },
      { avatar },
      { new: true, upsert: true } // Upsert in case it doesn't exist
    );
    
    res.json({ success: true, avatar: progress.avatar });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

app.put('/api/progress/:userId/profile', async (req, res) => {
  try {
    console.log(`[PUT] profile for ${req.params.userId}`, req.body);
    const { displayName, age, birthday } = req.body;
    const userId = req.params.userId;
    
    const updateData = {};
    if (displayName !== undefined) updateData.displayName = displayName;
    if (age !== undefined) updateData.age = age;
    if (birthday !== undefined) updateData.birthday = birthday;

    const progress = await Progress.findOneAndUpdate(
      { userId },
      updateData,
      { new: true, upsert: true } // Upsert in case it doesn't exist
    );
    
    res.json({ success: true, displayName: progress.displayName, age: progress.age, birthday: progress.birthday });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// POST to buy an item
app.post('/api/progress/:userId/buy', async (req, res) => {
  try {
    console.log(`[POST] buy for ${req.params.userId}`, req.body);
    const { itemId, cost } = req.body;
    const userId = req.params.userId;
    
    let progress = await Progress.findOne({ userId });
    if (!progress) {
      progress = new Progress(getDefaultProgress(userId));
    }
    
    if (progress.purchasedItems.includes(itemId)) {
      return res.status(400).json({ message: 'Item already purchased' });
    }
    
    if (progress.coins < cost) {
      return res.status(400).json({ message: 'Not enough coins' });
    }
    
    progress.coins -= cost;
    progress.purchasedItems.push(itemId);
    
    await progress.save();
    res.json(progress);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: error.message });
  }
});

// POST to complete a game level
app.post('/api/progress/:userId/complete-level', async (req, res) => {
  try {
    console.log(`[POST] complete-level for ${req.params.userId}`, req.body);
    const { gameId } = req.body;
    const userId = req.params.userId;
    
    let progress = await Progress.findOne({ userId });
    if (!progress) {
      progress = new Progress(getDefaultProgress(userId));
    }
    
    // Initialize map if missing
    if (!progress.gameLevels) {
      progress.gameLevels = new Map();
    }
    
    const currentLevel = progress.gameLevels.get(String(gameId)) || 0;
    
    if (currentLevel < 10) {
      progress.gameLevels.set(String(gameId), currentLevel + 1);
      progress.coins += 50; // Give 50 coins per level
      progress.xp += 20;    // Give 20 XP per level
      progress.level = Math.floor(progress.xp / 100) + 1;
    }
    
    await progress.save();
    res.json(progress);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: error.message });
  }
});

// GET user chat history
app.get('/api/chat/:userId', async (req, res) => {
  try {
    const userId = req.params.userId;
    let chat = await Chat.findOne({ userId });
    
    if (!chat) {
      chat = new Chat({ 
        userId, 
        messages: [{ 
          id: 1, 
          text: "Hi! I'm Dr. Smiles 🐻. I'm here to answer any questions you have about visiting the dentist. What's on your mind?", 
          sender: 'bot', 
          time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) 
        }] 
      });
      await chat.save();
    }
    
    res.json(chat);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// POST append message to chat
app.post('/api/chat/:userId', async (req, res) => {
  try {
    const userId = req.params.userId;
    const { message } = req.body; // Expects { id, text, sender, time }
    
    let chat = await Chat.findOne({ userId });
    if (!chat) {
      chat = new Chat({ userId, messages: [] });
    }
    
    chat.messages.push(message);
    await chat.save();
    
    res.json(chat);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
