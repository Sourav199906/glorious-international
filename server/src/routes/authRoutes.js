import { Router } from 'express';
import { z } from 'zod';
import {
  register,
  login,
  googleLogin,
  refresh,
  logout,
  logoutAll,
  me,
} from '../controllers/authController.js';
import { protect } from '../middleware/auth.js';
import { validate } from '../middleware/validate.js';
const r = Router();
const registration = z.object({
  name: z.string().min(2).max(100),
  email: z.string().email(),
  password: z.string().min(8).max(72),
  phone: z.string().max(30).optional(),
});
r.post('/register', validate(registration), register);
r.post('/google', validate(z.object({ credential: z.string().min(100).max(10000) })), googleLogin);
r.post(
  '/login',
  validate(z.object({ email: z.string().email(), password: z.string().min(8).max(72) })),
  login,
);
r.post('/refresh', refresh);
r.post('/logout', logout);
r.post('/logout-all', protect, logoutAll);
r.get('/me', protect, me);
export default r;
