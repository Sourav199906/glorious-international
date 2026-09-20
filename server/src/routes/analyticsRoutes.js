import { Router } from 'express';
import { protect, requireRole } from '../middleware/auth.js';
import { overview } from '../controllers/analyticsController.js';
const r = Router();
r.get('/overview', protect, requireRole('ADMIN', 'STAFF'), overview);
export default r;
