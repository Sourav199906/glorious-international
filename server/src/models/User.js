import mongoose from 'mongoose';
const schema = new mongoose.Schema(
  {
    name: { type: String, required: true, trim: true },
    email: { type: String, required: true, unique: true, lowercase: true, trim: true },
    phone: String,
    password: { type: String, select: false },
    googleId: { type: String, unique: true, sparse: true, index: true },
    authProvider: { type: String, enum: ['local', 'google'], default: 'local' },
    role: { type: String, enum: ['USER', 'ADMIN', 'STAFF'], default: 'USER' },
    avatar: String,
    address: String,
  },
  { timestamps: true },
);
export default mongoose.model('User', schema);
