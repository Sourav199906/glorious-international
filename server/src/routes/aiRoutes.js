import { Router } from 'express';
import rateLimit from 'express-rate-limit';
import { chat } from '../controllers/aiController.js';
const r = Router();
const aiLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 30,
  standardHeaders: true,
  legacyHeaders: false,
  message: { message: 'Too many AI requests. Please try again later.' },
});
r.post('/chat', aiLimiter, chat);
export default r;
