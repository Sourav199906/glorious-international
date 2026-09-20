import { Router } from 'express';
import { list, adminList, get, create, update, remove } from '../controllers/crudController.js';
import { protect, requireRole } from '../middleware/auth.js';
export function crudRoutes(Model, { publicFilter = {}, fields = [] } = {}) {
  const r = Router();
  r.get('/', list(Model, publicFilter));
  r.get('/admin/all', protect, requireRole('ADMIN', 'STAFF'), adminList(Model));
  r.get('/:id', get(Model, publicFilter));
  r.post('/', protect, requireRole('ADMIN', 'STAFF'), create(Model, fields));
  r.put('/:id', protect, requireRole('ADMIN', 'STAFF'), update(Model, fields));
  r.delete('/:id', protect, requireRole('ADMIN', 'STAFF'), remove(Model));
  return r;
}
