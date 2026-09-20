import { Router } from 'express';
import { protect, requireRole } from '../middleware/auth.js';
import { sendMessage, messages } from '../controllers/contactController.js';
const r = Router();
r.post('/', sendMessage);
r.get('/', protect, requireRole('ADMIN', 'STAFF'), messages);
export default r;
