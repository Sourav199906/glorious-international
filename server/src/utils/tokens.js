import jwt from 'jsonwebtoken';
import crypto from 'crypto';
import { env } from '../config/env.js';
export const hashToken = (t) => crypto.createHash('sha256').update(t).digest('hex');
export const signAccess = (user) =>
  jwt.sign({ sub: user._id.toString(), role: user.role, type: 'access' }, env.accessSecret, {
    expiresIn: env.accessExpires,
  });
export const signRefresh = (user, jti, familyId) =>
  jwt.sign({ sub: user._id.toString(), type: 'refresh', jti, familyId }, env.refreshSecret, {
    expiresIn: env.refreshExpires,
  });
export const verifyAccess = (t) => jwt.verify(t, env.accessSecret);
export const verifyRefresh = (t) => jwt.verify(t, env.refreshSecret);
export const newJti = () => crypto.randomUUID();
