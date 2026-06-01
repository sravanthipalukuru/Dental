import express from 'express';
import cors from 'cors';
import mongoose from 'mongoose';
import Progress from './models/Progress.js';
import Chat from './models/Chat.js';
import Otp from './models/Otp.js';
import Review from './models/Review.js';
import nodemailer from 'nodemailer';

const app = express();
app.use(cors());
app.use(express.json());

const PORT = 54321;

// MongoDB Connection
const MONGO_URI = "mongodb://kaveens555_db_user:dental@ac-zep0sdb-shard-00-00.prqmrhr.mongodb.net:27017,ac-zep0sdb-shard-00-01.prqmrhr.mongodb.net:27017,ac-zep0sdb-shard-00-02.prqmrhr.mongodb.net:27017/?ssl=true&replicaSet=atlas-kkm6qm-shard-0&authSource=admin&appName=Cluster0";

mongoose.connect(MONGO_URI, { family: 4 })
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

async function sendOtpEmail(email, otpCode) {
  try {
    let transporter = nodemailer.createTransport({
      service: 'gmail',
      auth: {
        user: process.env.EMAIL_USER, 
        pass: process.env.EMAIL_PASS,
      },
    });

    transporter.sendMail({
      from: `"Happy Dental App 🦷" <${process.env.EMAIL_USER}>`,
      to: email,
      subject: "Your OTP Login Code",
      html: `
        <div style="font-family: sans-serif; max-width: 500px; margin: 0 auto; text-align: center;">
          <h1 style="color: #0d9488;">Welcome Back!</h1>
          <p style="font-size: 16px; color: #4b5563;">You requested a secure code to log into the Happy Dental app.</p>
          <div style="background-color: #f0fdfa; border: 2px solid #5eead4; border-radius: 12px; padding: 20px; font-size: 32px; font-weight: bold; letter-spacing: 5px; color: #0f766e; margin: 30px 0;">
            ${otpCode}
          </div>
          <p style="font-size: 14px; color: #9ca3af;">This code will expire in 5 minutes.</p>
        </div>
      `,
    }).then(() => {
      console.log(`\n\x1b[36m📧 REAL EMAIL SENT to ${email}\x1b[0m\n`);
    }).catch((err) => {
      console.error("Failed to send real email. Did you set EMAIL_USER and EMAIL_PASS?", err);
    });
  } catch (err) {
    console.error("Failed to send real email. Did you set EMAIL_USER and EMAIL_PASS?", err);
  }
}

// POST to send OTP
app.post('/api/auth/send-otp', async (req, res) => {
  try {
    const { username } = req.body;
    if (!username) return res.status(400).json({ message: 'Username required' });
    
    // Generate random 6 digit OTP
    const otpCode = Math.floor(100000 + Math.random() * 900000).toString();
    
    // Save to DB (override previous if exists)
    await Otp.findOneAndUpdate(
      { username },
      { otp: otpCode, createdAt: new Date() },
      { upsert: true, new: true }
    );
    
    // PRINT to console for dev mode
    console.log(`\n\x1b[32m====================================`);
    console.log(`🔐 OTP for ${username}: ${otpCode}`);
    console.log(`====================================\x1b[0m\n`);
    
    // SEND via Nodemailer Ethereal
    await sendOtpEmail(username, otpCode);
    
    res.json({ success: true, message: 'OTP stored and email sent.' });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// POST to verify OTP
app.post('/api/auth/verify-otp', async (req, res) => {
  try {
    const { username, otp } = req.body;
    
    const record = await Otp.findOne({ username, otp });
    if (!record) {
      return res.status(401).json({ success: false, message: 'Invalid or expired OTP' });
    }
    
    // Delete OTP after successful use
    await Otp.deleteOne({ _id: record._id });
    
    res.json({ success: true, message: 'Login successful' });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
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

      // Award Graduation badge if completing Graduation Day game
      if (String(gameId) === '20') {
        if (!progress.badges.includes('Super Smile Graduate')) {
          progress.badges.push('Super Smile Graduate');
        }
      }
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

// POST - Save a new review
app.post('/api/reviews', async (req, res) => {
  try {
    const { doctorName, reviewerUserId, rating, comment } = req.body;
    if (!doctorName || !reviewerUserId || !rating) {
      return res.status(400).json({ message: 'doctorName, reviewerUserId, and rating are required.' });
    }
    const review = new Review({ doctorName, reviewerUserId, rating, comment });
    await review.save();
    res.json({ success: true, review });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// GET - Fetch all reviews for a specific doctor
app.get('/api/reviews/:doctorName', async (req, res) => {
  try {
    const reviews = await Review.find({ doctorName: req.params.doctorName }).sort({ createdAt: -1 });
    const avgRating = reviews.length
      ? (reviews.reduce((sum, r) => sum + r.rating, 0) / reviews.length).toFixed(1)
      : null;
    res.json({ reviews, avgRating, totalReviews: reviews.length });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
