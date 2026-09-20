import 'dotenv/config';
import bcrypt from 'bcryptjs';
import { connectDB } from '../config/db.js';
import User from '../models/User.js';
await connectDB();
const email = process.env.ADMIN_EMAIL || 'admin@gloriousinternational.com';
const password = process.env.ADMIN_PASSWORD || 'ChangeMe123!';
const hash = await bcrypt.hash(password, 12);
await User.findOneAndUpdate(
  { email },
  { name: 'Glorious Admin', email, password: hash, role: 'ADMIN' },
  { upsert: true, new: true },
);
console.log(`Admin ready: ${email}`);
process.exit(0);
