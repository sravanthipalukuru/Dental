import mongoose from 'mongoose';
import Progress from './models/Progress.js';

const MONGO_URI = "mongodb+srv://kaveens555_db_user:dental@cluster0.prqmrhr.mongodb.net/?appName=Cluster0";

mongoose.connect(MONGO_URI)
  .then(async () => {
    console.log('Connected to DB');
    const all = await Progress.find({});
    console.log('All Users in DB:');
    console.log(JSON.stringify(all, null, 2));
    mongoose.disconnect();
  })
  .catch(err => {
    console.error(err);
    process.exit(1);
  });
