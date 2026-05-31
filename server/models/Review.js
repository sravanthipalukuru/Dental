import mongoose from 'mongoose';

const reviewSchema = new mongoose.Schema({
  doctorName: { type: String, required: true },
  reviewerUserId: { type: String, required: true },
  rating: { type: Number, required: true, min: 1, max: 5 },
  comment: { type: String, default: '' },
  createdAt: { type: Date, default: Date.now }
});

export default mongoose.model('Review', reviewSchema);
