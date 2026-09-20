import bcrypt from 'bcryptjs';
import crypto from 'crypto';
import User from '../models/User.js';
import RefreshSession from '../models/RefreshSession.js';
import { signAccess, signRefresh, verifyRefresh, hashToken, newJti } from '../utils/tokens.js';
import { env } from '../config/env.js';
import { OAuth2Client } from 'google-auth-library';
const googleClient = new OAuth2Client();
const cookie = () => ({
  httpOnly: true,
  secure: env.nodeEnv === 'production',
  sameSite: env.nodeEnv === 'production' ? 'none' : 'lax',
  maxAge: 7 * 24 * 60 * 60 * 1000,
  path: '/api/auth',
});
const publicUser = (u) => ({
  id: u._id,
  name: u.name,
  email: u.email,
  phone: u.phone,
  role: u.role,
  avatar: u.avatar,
  address: u.address,
});
async function issue(user, req, familyId = crypto.randomUUID()) {
  const jti = newJti();
  const token = signRefresh(user, jti, familyId);
  const decoded = verifyRefresh(token);
  await RefreshSession.create({
    user: user._id,
    jti,
    tokenHash: hashToken(token),
    familyId,
    expiresAt: new Date(decoded.exp * 1000),
    userAgent: req.get('user-agent'),
    ip: req.ip,
  });
  return { token, access: signAccess(user) };
}
export async function register(req, res) {
  const { name, email, password, phone } = req.body;
  if (await User.exists({ email }))
    return res.status(409).json({ message: 'Email already registered' });
  const user = await User.create({ name, email, password: await bcrypt.hash(password, 12), phone });
  const t = await issue(user, req);
  res.cookie(env.cookieName, t.token, cookie());
  res.status(201).json({ accessToken: t.access, user: publicUser(user) });
}
export async function login(req, res) {
  const { email, password } = req.body;
  const user = await User.findOne({ email }).select('+password');
  if (!user || !(await bcrypt.compare(password, user.password)))
    return res.status(401).json({ message: 'Invalid email or password' });
  const t = await issue(user, req);
  res.cookie(env.cookieName, t.token, cookie());
  res.json({ accessToken: t.access, user: publicUser(user) });
}
export async function refresh(req, res) {
  try {
    const token = req.cookies[env.cookieName];
    if (!token) return res.status(401).json({ message: 'No refresh token' });
    const p = verifyRefresh(token);
    if (p.type !== 'refresh' || !p.jti)
      return res.status(401).json({ message: 'Invalid refresh token' });
    const session = await RefreshSession.findOne({ jti: p.jti });
    if (!session || session.expiresAt < new Date() || session.tokenHash !== hashToken(token)) {
      return res.status(401).json({ message: 'Refresh token revoked or invalid' });
    }
    if (session.revokedAt) {
      await RefreshSession.updateMany(
        { familyId: session.familyId, revokedAt: null },
        { revokedAt: new Date() },
      );
      return res
        .status(401)
        .json({ message: 'Refresh token reuse detected; session family revoked' });
    }
    const user = await User.findById(p.sub);
    if (!user) return res.status(401).json({ message: 'User not found' });
    const next = await issue(user, req, session.familyId);
    session.revokedAt = new Date();
    session.replacedByJti = verifyRefresh(next.token).jti;
    await session.save();
    res.cookie(env.cookieName, next.token, cookie());
    res.json({ accessToken: next.access, user: publicUser(user) });
  } catch {
    return res.status(401).json({ message: 'Invalid refresh token' });
  }
}
export async function logout(req, res) {
  const token = req.cookies[env.cookieName];
  if (token) {
    try {
      const p = verifyRefresh(token);
      await RefreshSession.updateOne({ jti: p.jti, revokedAt: null }, { revokedAt: new Date() });
    } catch {}
  }
  res.clearCookie(env.cookieName, {
    httpOnly: true,
    secure: env.nodeEnv === 'production',
    sameSite: env.nodeEnv === 'production' ? 'none' : 'lax',
    path: '/api/auth',
  });
  res.json({ message: 'Logged out' });
}
export async function logoutAll(req, res) {
  await RefreshSession.updateMany(
    { user: req.user._id, revokedAt: null },
    { revokedAt: new Date() },
  );
  res.clearCookie(env.cookieName, { path: '/api/auth' });
  res.json({ message: 'All sessions revoked' });
}

export async function googleLogin(req, res) {
  try {
    if (!env.googleClientId)
      return res.status(503).json({ message: 'Google Sign-In is not configured on the server' });
    const { credential } = req.body;
    if (typeof credential !== 'string' || credential.length < 100)
      return res.status(400).json({ message: 'Invalid Google credential' });
    const ticket = await googleClient.verifyIdToken({
      idToken: credential,
      audience: env.googleClientId,
    });
    const payload = ticket.getPayload();
    if (!payload?.sub || !payload.email || payload.email_verified !== true)
      return res.status(401).json({ message: 'Google account could not be verified' });
    const email = payload.email.toLowerCase();
    let user = await User.findOne({ googleId: payload.sub });
    if (!user) {
      user = await User.findOne({ email });
      if (user) {
        if (user.googleId && user.googleId !== payload.sub)
          return res
            .status(409)
            .json({ message: 'This email is linked to a different Google account' });
        user.googleId = payload.sub;
        user.authProvider = 'google';
        if (payload.picture && !user.avatar) user.avatar = payload.picture;
        if (payload.name && !user.name) user.name = payload.name;
        await user.save();
      } else {
        user = await User.create({
          name: payload.name || email.split('@')[0],
          email,
          googleId: payload.sub,
          authProvider: 'google',
          avatar: payload.picture || undefined,
        });
      }
    }
    const t = await issue(user, req);
    res.cookie(env.cookieName, t.token, cookie());
    res.json({ accessToken: t.access, user: publicUser(user) });
  } catch (e) {
    console.error('Google login error:', e.message);
    res.status(401).json({ message: 'Google Sign-In failed' });
  }
}

export async function me(req, res) {
  res.json({ user: req.user });
}
