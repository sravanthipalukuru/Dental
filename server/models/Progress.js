import mongoose from 'mongoose';

const progressSchema = new mongoose.Schema({
  userId: { type: String, required: true, unique: true },
  coins: { type: Number, default: 0 },
  level: { type: Number, default: 1 },
  xp: { type: Number, default: 0 },
  badges: { type: [String], default: [] },
  gamesCompleted: { type: [String], default: [] },
  anxietyScore: { type: Number, default: 50 },
  readinessScore: { type: Number, default: 50 },
  avatar: { type: String, default: '🐻' },
  displayName: { type: String },
  age: { type: Number },
  birthday: { type: String },
  purchasedItems: { type: [String], default: [] },
  gameLevels: { type: Map, of: Number, default: {} }
});

export default mongoose.model('Progress', progressSchema);
