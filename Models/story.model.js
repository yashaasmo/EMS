import mongoose from "mongoose";

const storySlideSchema = new mongoose.Schema({
  mediaUrl: { type: String, required: true }, // image / video url
  mediaType: { type: String, enum: ["image", "video"], default: "image" },
  caption: { type: String, default: "" },
}, { _id: false });

const storySchema = new mongoose.Schema({
  title: { type: String, required: true },
  summary: { type: String },
   slug: { 
        type: String,
        index: true,
        sparse: true // unique: true मत लगाना, क्योंकि हम id के साथ unique बनाएँगे
    },
  slides: [storySlideSchema], // ✅ ek story me multiple slides

  
  category: { type: mongoose.Schema.Types.ObjectId, ref: "Category", required: true },
  tags: [{ type: String }],  
  status: { type: String, enum: ["posted", "pending_approval"], default: "pending_approval" },

  createdBy: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
  updatedBy: { type: mongoose.Schema.Types.ObjectId, ref: "User" },

  publishedAt: { type: Date },
  shareLink: { type: String },

}, { timestamps: true });

export default mongoose.model("Story", storySchema);
