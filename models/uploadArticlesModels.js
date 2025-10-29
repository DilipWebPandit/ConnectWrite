import mongoose from "mongoose";

const articleSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: "user", required: true },
  writerName: { type: String, required: true },
  title: { type: String, required: true },
  content: { type: String, required: true },
  imageUrl: { type: String, default: "/images/article.png" },
  imagePublicId: { type: String },
  created_at: {
    type: Date,
    default: () => {
      // Get current time in IST
      const istOffset = 5.5 * 60 * 60 * 1000; // 5 hours 30 minutes
      return new Date(Date.now() + istOffset);
    },
  },
  updated_at: {
    type: Date,
    default: () => {
      const istOffset = 5.5 * 60 * 60 * 1000;
      return new Date(Date.now() + istOffset);
    },
  },
});

const articleModel = mongoose.model("articleDetails", articleSchema);
export default articleModel;
