import mongoose from 'mongoose';

const MessageSchema = new mongoose.Schema({
  id: { type: Number, required: true },
  text: { type: String, required: true },
  sender: { type: String, enum: ['user', 'bot'], required: true },
  time: { type: String, required: true }
});

const ChatSchema = new mongoose.Schema({
  userId: { type: String, required: true, unique: true },
  messages: [MessageSchema]
}, { timestamps: true });

export default mongoose.model('Chat', ChatSchema);
