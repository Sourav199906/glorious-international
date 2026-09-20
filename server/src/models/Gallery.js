import mongoose from 'mongoose';
export default mongoose.model(
  'Gallery',
  new mongoose.Schema(
    {
      title: String,
      imageUrl: { type: String, required: true },
      category: String,
      description: String,
      published: { type: Boolean, default: true },
    },
    { timestamps: true },
  ),
);
