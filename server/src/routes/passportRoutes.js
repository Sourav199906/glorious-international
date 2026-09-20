import { Router } from 'express';
import { protect, requireRole } from '../middleware/auth.js';
import { passportUpload } from '../middleware/passportUpload.js';
import {
  uploadPassport,
  downloadPassport,
  cleanupPassport,
} from '../controllers/passportController.js';
import Booking from '../models/Booking.js';

const r = Router();
r.post('/upload', protect, passportUpload.single('passport'), uploadPassport);
r.post('/cleanup', protect, requireRole('ADMIN', 'STAFF'), cleanupPassport);
r.get(
  '/booking/:id/:index',
  protect,
  requireRole('ADMIN', 'STAFF'),
  async (req, res, next) => {
    try {
      const b = await Booking.findById(req.params.id);
      if (!b) return res.status(404).json({ message: 'Booking not found' });
      req.booking = b;
      next();
    } catch (e) {
      next(e);
    }
  },
  downloadPassport,
);
export default r;
