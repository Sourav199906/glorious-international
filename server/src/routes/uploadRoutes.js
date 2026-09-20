import { Router } from 'express';
import { protect, requireRole } from '../middleware/auth.js';
import { upload, uploadMedia } from '../middleware/upload.js';
import { image, media } from '../controllers/uploadController.js';
const r = Router();
r.post('/image', protect, requireRole('ADMIN', 'STAFF'), upload.single('image'), image);
r.post('/media', protect, requireRole('ADMIN', 'STAFF'), uploadMedia.single('media'), media);
export default r;
