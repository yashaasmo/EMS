// import mongoose from "mongoose";

// const CategoryNews = mongoose.Schema({
//   category: {
//     type: mongoose.Schema.Types.ObjectId,
//     ref: "Category",
//     required: true
//   }
// }, { timestamps: true });

// export default mongoose.model("CategoryNews", CategoryNews);

// models/CategoryNews.js

import mongoose from "mongoose";

const CategoryNewsSchema = mongoose.Schema(
  {
    categories: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Category",
        required: true,
      },
    ],
  },
  { timestamps: true }
);

export default mongoose.model("CategoryNews", CategoryNewsSchema);
