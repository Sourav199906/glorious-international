import mongoose from 'mongoose';
const schema = new mongoose.Schema(
  {
    airline: String,
    flightNumber: String,
    origin: String,
    destination: String,
    departure: Date,
    arrival: Date,
    cabin: { type: String, default: 'Economy' },
    price: Number,
    currency: { type: String, default: 'BDT' },
    seats: Number,
    published: { type: Boolean, default: true },
  },
  { timestamps: true },
);
export default mongoose.model('Flight', schema);
