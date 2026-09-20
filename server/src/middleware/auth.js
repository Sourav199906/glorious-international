import { verifyAccess } from '../utils/tokens.js';
import User from '../models/User.js';
export async function protect(req, res, next) {
  try {
    const h = req.headers.authorization || '';
    if (!h.startsWith('Bearer '))
      return res.status(401).json({ message: 'Authentication required' });
    const p = verifyAccess(h.slice(7));
    if (p.type !== 'access') throw new Error();
    req.user = await User.findById(p.sub).select('-password');
    if (!req.user) return res.status(401).json({ message: 'User not found' });
    next();
  } catch {
    return res.status(401).json({ message: 'Invalid or expired token' });
  }
}
export const requireRole =
  (...roles) =>
  (req, res, next) =>
    roles.includes(req.user?.role) ? next() : res.status(403).json({ message: 'Forbidden' });
