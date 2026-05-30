import mongoose from 'mongoose';
import Progress from './models/Progress.js';

const MONGO_URI = "mongodb+srv://kaveens555_db_user:dental@cluster0.prqmrhr.mongodb.net/?appName=Cluster0";

mongoose.connect(MONGO_URI)
  .then(async () => {
    const user = await Progress.findOne({ userId: 'nk007' });
    if (user) {
      user.coins += 2000;
      await user.save();
      console.log('Added 2000 coins to nk007!');
    } else {
      console.log('User not found.');
    }
    mongoose.disconnect();
  });
