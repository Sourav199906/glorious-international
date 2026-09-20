import mongoose from 'mongoose';
export default mongoose.model(
  'Review',
  new mongoose.Schema(
    {
      user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
      package: { type: mongoose.Schema.Types.ObjectId, ref: 'Package', required: true },
      booking: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Booking',
        required: true,
        unique: true,
      },
      rating: { type: Number, min: 1, max: 5, required: true },
      comment: { type: String, required: true },
      published: { type: Boolean, default: true },
    },
    { timestamps: true },
  ),
);
