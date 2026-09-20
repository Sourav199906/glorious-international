import mongoose from 'mongoose';
export default mongoose.model(
  'ContactMessage',
  new mongoose.Schema(
    {
      name: String,
      email: String,
      phone: String,
      message: String,
      status: { type: String, enum: ['NEW', 'READ', 'RESOLVED'], default: 'NEW' },
    },
    { timestamps: true },
  ),
);
