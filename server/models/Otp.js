import mongoose from 'mongoose';

const OtpSchema = new mongoose.Schema({
  username: {
    type: String,
    required: true,
  },
  otp: {
    type: String,
    required: true,
  },
  createdAt: {
    type: Date,
    default: Date.now,
    expires: 300 // Document automatically removed after 5 minutes
  }
});

export default mongoose.model('Otp', OtpSchema);
