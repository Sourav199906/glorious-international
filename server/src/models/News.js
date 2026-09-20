import mongoose from 'mongoose';
export default mongoose.model(
  'News',
  new mongoose.Schema(
    {
      title: String,
      slug: { type: String, unique: true },
      imageUrl: String,
      body: String,
      published: { type: Boolean, default: true },
      publishedAt: Date,
    },
    { timestamps: true },
  ),
);
