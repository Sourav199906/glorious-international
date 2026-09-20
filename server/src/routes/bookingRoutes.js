import { Router } from 'express';
import { protect, requireRole } from '../middleware/auth.js';
import * as c from '../controllers/bookingController.js';
import { z } from 'zod';
import { validate } from '../middleware/validate.js';
const traveler = z.object({
  name: z.string().min(2).max(100),
  passportNumber: z.string().min(4).max(40),
  passportFileId: z.string().min(1),
  dateOfBirth: z.coerce.date().optional(),
  nationality: z.string().max(80).optional(),
});
const create = z.object({
  bookingType: z.enum(['TOUR', 'HAJJ', 'FLIGHT']),
  packageId: z.string().optional(),
  hajjPackageId: z.string().optional(),
  flightId: z.string().optional(),
  travelers: z.array(traveler).min(1).max(20),
  travelDate: z.coerce.date().optional(),
  totalAmount: z.number().nonnegative(),
  currency: z.string().length(3).default('BDT'),
});
const r = Router();
r.post('/', protect, validate(create), c.createBooking);
r.get('/my', protect, c.myBookings);
r.get('/', protect, requireRole('ADMIN', 'STAFF'), c.allBookings);
r.get('/:id', protect, c.getBooking);
r.post('/:id/pay', protect, c.startPayment);
r.get('/:id/pdf', protect, c.downloadPdf);
r.patch('/:id/confirm', protect, requireRole('ADMIN', 'STAFF'), c.confirmBooking);
r.patch('/:id/cancel', protect, requireRole('ADMIN', 'STAFF'), c.cancelBooking);
export default r;
