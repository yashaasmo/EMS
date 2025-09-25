import mongoose from "mongoose";

const tagSchema = mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, "Tag name is required"],
      trim: true,
      unique: true,
    },
    isTrending: {
      type: Boolean,
      default: false, // Admin toggle karega
    },
    createdBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    news: [
  {
    type: mongoose.Schema.Types.ObjectId,
    ref: "News",
  },
],
  },
  {
    timestamps: true,
  }
);

export default mongoose.model("Tag", tagSchema);
