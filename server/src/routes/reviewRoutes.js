import { Router } from 'express';
import { protect, requireRole } from '../middleware/auth.js';
import {
  listReviews,
  createReview,
  adminReviews,
  moderateReview,
} from '../controllers/reviewController.js';
import { z } from 'zod';
import { validate } from '../middleware/validate.js';
const r = Router();
r.get('/package/:packageId', listReviews);
r.post(
  '/package/:packageId',
  protect,
  validate(
    z.object({
      bookingId: z.string(),
      rating: z.number().int().min(1).max(5),
      comment: z.string().min(3).max(2000),
    }),
  ),
  createReview,
);
r.get('/admin/all', protect, requireRole('ADMIN', 'STAFF'), adminReviews);
r.patch('/admin/:id', protect, requireRole('ADMIN', 'STAFF'), moderateReview);
export default r;
