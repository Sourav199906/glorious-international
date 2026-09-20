import { Router } from 'express';
import { getContent, updateContent } from '../controllers/contentController.js';
import { protect, requireRole } from '../middleware/auth.js';
const r = Router();
r.get('/', getContent);
r.put('/', protect, requireRole('ADMIN', 'STAFF'), updateContent);
export default r;
