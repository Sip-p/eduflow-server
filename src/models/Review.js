 import mongoose from "mongoose";

const appReviewSchema = new mongoose.Schema({
  user: {
    _id: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
    name: String,
    pic: String
  },
  rating: { type: Number, required: true, min: 1, max: 5 },
  comment: { type: String },
  createdAt: { type: Date, default: Date.now }
});

export default mongoose.model("AppReview", appReviewSchema);
