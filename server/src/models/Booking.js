import mongoose from 'mongoose';
const traveler = new mongoose.Schema(
  {
    name: { type: String, required: true, trim: true },
    passportNumber: { type: String, required: true },
    passportFileId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'PassportDocument',
      required: true,
    },
    dateOfBirth: Date,
    nationality: String,
  },
  { _id: false },
);
const schema = new mongoose.Schema(
  {
    confirmationNumber: { type: String, unique: true, index: true },
    user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true, index: true },
    bookingType: { type: String, enum: ['TOUR', 'HAJJ', 'FLIGHT'], required: true },
    package: { type: mongoose.Schema.Types.ObjectId, ref: 'Package' },
    hajjPackage: { type: mongoose.Schema.Types.ObjectId, ref: 'HajjPackage' },
    flight: { type: mongoose.Schema.Types.ObjectId, ref: 'Flight' },
    travelers: [traveler],
    travelDate: Date,
    totalAmount: { type: Number, min: 0 },
    currency: { type: String, default: 'BDT' },
    status: {
      type: String,
      enum: ['PENDING', 'CONFIRMED', 'CANCELLED', 'COMPLETED'],
      default: 'PENDING',
    },
    paymentStatus: {
      type: String,
      enum: ['UNPAID', 'INITIATED', 'PAID', 'FAILED', 'CANCELLED', 'REFUNDED'],
      default: 'UNPAID',
    },
    paymentGateway: { type: String, default: 'SSLCOMMERZ' },
    paymentTransactionId: String,
    paymentValidationId: String,
    paymentSessionKey: String,
    pdfPath: String,
    confirmedAt: Date,
    cancelledAt: Date,
  },
  { timestamps: true },
);
schema.index({ user: 1, createdAt: -1 });
export default mongoose.model('Booking', schema);
