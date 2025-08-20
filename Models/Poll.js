// models/Poll.js
import mongoose from 'mongoose';

const pollOptionSchema = new mongoose.Schema({
  hi: { type: String, required: true },
  en: { type: String, required: true },
  votes: { type: Number, default: 0 }
}, { _id: false });

const pollSchema = new mongoose.Schema({
  poll_id: { type: String, required: true, unique: true },
  question: {
    hi: { type: String, required: true },
    en: { type: String, required: true }
  },
  options: [pollOptionSchema],
  category: { type: String, required: true },
  start_date: { type: Date, required: true },
  end_date: { type: Date, required: true },
  visibility: { type: String, enum: ['public', 'registered'], default: 'public' },
  enable_comments: { type: Boolean, default: true },
  votes: [{
    user_id: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
    option_index: { type: Number },
    voted_at: { type: Date, default: Date.now },
    ip: { type: String }
  }],
  status: { type: String, enum: ['active', 'paused', 'ended'], default: 'active' },
  created_by: { type: mongoose.Schema.Types.ObjectId, ref: 'Admin' },
  created_at: { type: Date, default: Date.now }
}, { timestamps: true });

export default mongoose.model('Poll', pollSchema);
