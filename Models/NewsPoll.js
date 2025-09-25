import mongoose from "mongoose";

const optionSchema = new mongoose.Schema({
  text: { type: String, required: true },
  votes: { type: Number, default: 0 },
});

const newsPollSchema = new mongoose.Schema(
  {
    question: { type: String, required: true, trim: true },
    options: [optionSchema],
    totalVotes: { type: Number, default: 0 },

    newsId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "News",
      required: true,
    },

    createdBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },

    status: {
      type: String,
      enum: ["active", "closed"],
      default: "active",
    },
  },
  { timestamps: true }
);

export default mongoose.model("NewsPoll", newsPollSchema);
