import mongoose from "mongoose";

const PortfolioItemSchema = new mongoose.Schema({
  title: {
    type: String,
    required: [true, "Title is required."],
    trim: true,
  },
  category: {
    type: String,
    enum: ["Bridal", "Formal", "Alterations", "Restoration"],
    required: [true, "Category is required."],
  },
  url: {
    type: String, // The secure URL from Cloudinary
    required: [true, "Media URL is required."],
  },
  mediaType: {
    type: String, // 'image' or 'video'
    required: [true, "Media Type is required."],
  },
  publicId: {
    type: String, // Cloudinary ID for potential deletion/management later
    required: false,
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
});

// Use existing model or compile a new one
const PortfolioItem =
  mongoose.models.PortfolioItem ||
  mongoose.model("PortfolioItem", PortfolioItemSchema);

export default PortfolioItem;
