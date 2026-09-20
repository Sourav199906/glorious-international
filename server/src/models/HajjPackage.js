import mongoose from 'mongoose';
const schema = new mongoose.Schema(
  {
    title: String,
    season: String,
    description: String,
    images: [String],
    durationDays: Number,
    price: Number,
    currency: { type: String, default: 'BDT' },
    included: [String],
    itinerary: [{ day: Number, title: String, description: String }],
    published: { type: Boolean, default: true },
  },
  { timestamps: true },
);
export default mongoose.model('HajjPackage', schema);
