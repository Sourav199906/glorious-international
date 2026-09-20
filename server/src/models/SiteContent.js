import mongoose from 'mongoose';
export default mongoose.model(
  'SiteContent',
  new mongoose.Schema(
    {
      key: { type: String, unique: true },
      heroTitle: String,
      heroSubtitle: String,
      heroBackgroundType: { type: String, enum: ['default', 'video', 'gif'], default: 'default' },
      heroBackgroundUrl: String,
      aboutUs: String,
      contactPhone: String,
      contactEmail: String,
      address: String,
      termsConditions: String,
      refundPolicy: String,
      footerText: String,
    },
    { timestamps: true },
  ),
);
