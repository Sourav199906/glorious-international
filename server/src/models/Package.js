import mongoose from 'mongoose';
const schema = new mongoose.Schema(
  {
    title: { type: String, required: true },
    slug: { type: String, unique: true },
    destination: { type: String, required: true },
    description: String,
    images: [String],
    durationDays: Number,
    durationNights: Number,
    price: { type: Number, required: true },
    currency: { type: String, default: 'BDT' },
    included: [String],
    excluded: [String],
    itinerary: [{ day: Number, title: String, description: String }],
    rating: { type: Number, default: 0 },
    reviewCount: { type: Number, default: 0 },
    featured: { type: Boolean, default: false },
    published: { type: Boolean, default: true },
  },
  { timestamps: true },
);
export default mongoose.model('Package', schema);
