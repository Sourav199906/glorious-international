import mongoose from 'mongoose';
export default mongoose.model(
  'Accreditation',
  new mongoose.Schema(
    {
      organizationName: String,
      certificateNumber: String,
      logoUrl: String,
      certificateImageUrl: String,
      description: String,
      published: { type: Boolean, default: true },
    },
    { timestamps: true },
  ),
);
