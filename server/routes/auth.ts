import bcrypt from 'bcryptjs';
import crypto from 'crypto';
import { Router, type Request, type Response } from 'express';
import { z } from 'zod';
import { notificationAdapter } from '../adapters/notifications.ts';
import { getDb } from '../db/client.ts';
import { requireAuth, SESSION_COOKIE_NAME } from '../middleware/auth.ts';
import { checkRateLimit, clearRateLimit, recordFailedAttempt } from '../middleware/rateLimit.ts';

export const authRouter = Router();

const SESSION_TTL_DAYS = 7;

function hashOtp(code: string): string {
  return crypto.createHash('sha256').update(code).digest('hex');
}

function createSession(res: Response, userId: string): string {
  const db = getDb();
  const sessionId = crypto.randomBytes(32).toString('hex');
  const expiresAt = new Date(Date.now() + SESSION_TTL_DAYS * 24 * 60 * 60 * 1000).toISOString();
  db.prepare(`INSERT INTO sessions (id, user_id, expires_at) VALUES (?, ?, ?)`).run(
    sessionId,
    userId,
    expiresAt
  );
  res.cookie(SESSION_COOKIE_NAME, sessionId, {
    httpOnly: true,
    sameSite: 'lax',
    secure: process.env.NODE_ENV === 'production',
    maxAge: SESSION_TTL_DAYS * 24 * 60 * 60 * 1000,
    path: '/',
  });
  return sessionId;
}

function getSafeUser(userId: string) {
  const db = getDb();
  const row = db
    .prepare(
      `SELECT u.id, u.name, u.email, u.mobile, u.role, u.mobile_verified, u.language, u.default_city,
              p.id as partner_id, p.verification_status as partner_verification_status
       FROM users u
       LEFT JOIN partners p ON p.user_id = u.id
       WHERE u.id = ?`
    )
    .get(userId) as Record<string, unknown> | undefined;
  if (!row) return null;
  return {
    ...row,
    mobile_verified: Boolean(row.mobile_verified),
  };
}

function ensureWallet(userId: string): void {
  const db = getDb();
  const existing = db.prepare(`SELECT id FROM wallets WHERE user_id = ?`).get(userId);
  if (!existing) {
    db.prepare(`INSERT INTO wallets (id, user_id, balance_paise) VALUES (?, ?, 0)`).run(
      crypto.randomUUID(),
      userId
    );
  }
}

const registerSchema = z.object({
  name: z.string().trim().min(2, 'Name must be at least 2 characters'),
  email: z.string().trim().email('Enter a valid email address').optional().or(z.literal('')),
  mobile: z
    .string()
    .trim()
    .regex(/^[6-9]\d{9}$/, 'Enter a valid 10-digit Indian mobile number'),
  password: z.string().min(6, 'Password must be at least 6 characters'),
  role: z.enum(['CUSTOMER', 'PARTNER']).optional().default('CUSTOMER'),
  otpCode: z.string().trim().optional(),
});

authRouter.post('/register', (req: Request, res: Response) => {
  const parsed = registerSchema.safeParse(req.body);
  if (!parsed.success) {
    res.status(400).json({ error: parsed.error.issues[0]?.message ?? 'Invalid input' });
    return;
  }

  const { name, mobile, password, role, otpCode } = parsed.data;
  const email = parsed.data.email ? parsed.data.email.toLowerCase() : null;
  const db = getDb();

  const existingMobile = db.prepare(`SELECT id FROM users WHERE mobile = ?`).get(mobile);
  if (existingMobile) {
    res.status(409).json({ error: 'An account with this mobile number already exists.' });
    return;
  }
  if (email) {
    const existingEmail = db.prepare(`SELECT id FROM users WHERE email = ?`).get(email);
    if (existingEmail) {
      res.status(409).json({ error: 'An account with this email already exists.' });
      return;
    }
  }

  let mobileVerified = 0;
  if (otpCode) {
    const otpRow = db
      .prepare(
        `SELECT id, code_hash, expires_at FROM otp_codes
         WHERE target = ? AND consumed = 0 ORDER BY created_at DESC LIMIT 1`
      )
      .get(mobile) as { id: string; code_hash: string; expires_at: string } | undefined;

    if (!otpRow || new Date(otpRow.expires_at) <= new Date() || otpRow.code_hash !== hashOtp(otpCode)) {
      res.status(400).json({ error: 'Invalid or expired OTP code.' });
      return;
    }
    db.prepare(`UPDATE otp_codes SET consumed = 1 WHERE id = ?`).run(otpRow.id);
    mobileVerified = 1;
  }

  const userId = crypto.randomUUID();
  const passwordHash = bcrypt.hashSync(password, 10);

  db.prepare(
    `INSERT INTO users (id, name, email, mobile, password_hash, role, auth_provider, mobile_verified)
     VALUES (?, ?, ?, ?, ?, ?, 'LOCAL', ?)`
  ).run(userId, name, email, mobile, passwordHash, role, mobileVerified);

  ensureWallet(userId);
  notificationAdapter.notifyUser({
    userId,
    title: 'Welcome to SERVA',
    body: 'Your account is ready. Explore trusted services across Hyderabad and beyond.',
    link: '/services',
    smsTarget: mobile,
    emailTarget: email ?? undefined,
  });

  createSession(res, userId);
  res.status(201).json({ user: getSafeUser(userId) });
});

const loginSchema = z.object({
  identifier: z.string().trim().min(3, 'Enter your email or mobile number'),
  password: z.string().min(1, 'Password is required'),
});

authRouter.post('/login', (req: Request, res: Response) => {
  const parsed = loginSchema.safeParse(req.body);
  if (!parsed.success) {
    res.status(400).json({ error: parsed.error.issues[0]?.message ?? 'Invalid credentials' });
    return;
  }

  const identifier = parsed.data.identifier.toLowerCase();
  const rateKey = `login:${identifier}`;
  const limit = checkRateLimit(rateKey);
  if (!limit.allowed) {
    res.status(429).json({
      error: `Too many failed login attempts. Try again in ${Math.ceil(limit.retryAfterSeconds / 60)} minutes.`,
    });
    return;
  }

  const db = getDb();
  const user = db
    .prepare(`SELECT id, password_hash FROM users WHERE lower(email) = ? OR mobile = ?`)
    .get(identifier, parsed.data.identifier) as
    | { id: string; password_hash: string | null }
    | undefined;

  if (!user || !user.password_hash || !bcrypt.compareSync(parsed.data.password, user.password_hash)) {
    const after = recordFailedAttempt(rateKey);
    const status = after.allowed ? 401 : 429;
    res.status(status).json({
      error: after.allowed
        ? `Invalid email/mobile or password. ${after.remaining} attempt(s) remaining.`
        : 'Too many failed login attempts. Account temporarily rate limited.',
    });
    return;
  }

  clearRateLimit(rateKey);
  ensureWallet(user.id);
  createSession(res, user.id);
  res.json({ user: getSafeUser(user.id) });
});

const otpSendSchema = z.object({
  mobile: z
    .string()
    .trim()
    .regex(/^[6-9]\d{9}$/, 'Enter a valid 10-digit Indian mobile number'),
  purpose: z.enum(['LOGIN', 'REGISTER', 'RESET']).optional().default('LOGIN'),
});

authRouter.post('/otp/send', (req: Request, res: Response) => {
  const parsed = otpSendSchema.safeParse(req.body);
  if (!parsed.success) {
    res.status(400).json({ error: parsed.error.issues[0]?.message ?? 'Invalid mobile number' });
    return;
  }

  const { mobile, purpose } = parsed.data;
  const sendLimitKey = `otp_send:${mobile}`;
  const limit = checkRateLimit(sendLimitKey, 5);
  if (!limit.allowed) {
    res.status(429).json({
      error: `OTP send limit reached. Please wait ${Math.ceil(limit.retryAfterSeconds / 60)} minutes.`,
    });
    return;
  }

  const db = getDb();
  // Invalidate previous unconsumed OTPs for this mobile so resend replaces cleanly
  db.prepare(`UPDATE otp_codes SET consumed = 1 WHERE target = ? AND consumed = 0`).run(mobile);

  const code = process.env.NODE_ENV === 'production'
    ? String(crypto.randomInt(100000, 999999))
    : '123456';
  const id = crypto.randomUUID();
  const expiresAt = new Date(Date.now() + 10 * 60 * 1000).toISOString();

  db.prepare(
    `INSERT INTO otp_codes (id, target, code_hash, purpose, attempts, consumed, expires_at)
     VALUES (?, ?, ?, ?, 0, 0, ?)`
  ).run(id, mobile, hashOtp(code), purpose, expiresAt);

  recordFailedAttempt(sendLimitKey, 5);
  notificationAdapter.sendSmsMock(mobile, `Your SERVA verification OTP is ${code}. Valid for 10 minutes.`);

  res.json({
    sent: true,
    message: `OTP sent to +91 ${mobile}`,
    ...(process.env.NODE_ENV !== 'production' ? { devPreviewOtp: code } : {}),
  });
});

const otpVerifySchema = z.object({
  mobile: z
    .string()
    .trim()
    .regex(/^[6-9]\d{9}$/, 'Enter a valid 10-digit Indian mobile number'),
  code: z.string().trim().regex(/^\d{6}$/, 'Enter the 6-digit OTP code'),
  mode: z.enum(['LOGIN', 'VERIFY_ONLY']).optional().default('LOGIN'),
  name: z.string().trim().optional(),
});

authRouter.post('/otp/verify', (req: Request, res: Response) => {
  const parsed = otpVerifySchema.safeParse(req.body);
  if (!parsed.success) {
    res.status(400).json({ error: parsed.error.issues[0]?.message ?? 'Invalid OTP format' });
    return;
  }

  const { mobile, code, mode, name } = parsed.data;
  const verifyRateKey = `otp_verify:${mobile}`;
  const limit = checkRateLimit(verifyRateKey, 5);
  if (!limit.allowed) {
    res.status(429).json({
      error: `Too many invalid OTP attempts. Try again in ${Math.ceil(limit.retryAfterSeconds / 60)} minutes.`,
    });
    return;
  }

  const db = getDb();
  const otpRow = db
    .prepare(
      `SELECT id, code_hash, attempts, expires_at FROM otp_codes
       WHERE target = ? AND consumed = 0 ORDER BY created_at DESC LIMIT 1`
    )
    .get(mobile) as
    | { id: string; code_hash: string; attempts: number; expires_at: string }
    | undefined;

  if (!otpRow || new Date(otpRow.expires_at) <= new Date()) {
    const after = recordFailedAttempt(verifyRateKey, 5);
    res.status(after.allowed ? 400 : 429).json({
      error: after.allowed ? 'OTP has expired or was not requested. Please resend.' : 'Too many OTP attempts. Please try again later.',
    });
    return;
  }

  if (otpRow.code_hash !== hashOtp(code)) {
    db.prepare(`UPDATE otp_codes SET attempts = attempts + 1 WHERE id = ?`).run(otpRow.id);
    const after = recordFailedAttempt(verifyRateKey, 5);
    res.status(after.allowed ? 400 : 429).json({
      error: after.allowed
        ? `Incorrect OTP code. ${after.remaining} attempt(s) left.`
        : 'Too many incorrect OTP attempts. Rate limit active.',
    });
    return;
  }

  // Valid OTP
  db.prepare(`UPDATE otp_codes SET consumed = 1 WHERE id = ?`).run(otpRow.id);
  clearRateLimit(verifyRateKey);
  clearRateLimit(`otp_send:${mobile}`);

  if (mode === 'VERIFY_ONLY') {
    res.json({ verified: true });
    return;
  }

  let user = db.prepare(`SELECT id FROM users WHERE mobile = ?`).get(mobile) as
    | { id: string }
    | undefined;

  if (!user) {
    const userId = crypto.randomUUID();
    const displayName = name && name.length >= 2 ? name : `SERVA User ${mobile.slice(-4)}`;
    db.prepare(
      `INSERT INTO users (id, name, mobile, role, auth_provider, mobile_verified)
       VALUES (?, ?, ?, 'CUSTOMER', 'OTP', 1)`
    ).run(userId, displayName, mobile);
    ensureWallet(userId);
    user = { id: userId };
  } else {
    db.prepare(`UPDATE users SET mobile_verified = 1 WHERE id = ?`).run(user.id);
  }

  createSession(res, user.id);
  res.json({ verified: true, user: getSafeUser(user.id) });
});

const resetSchema = z.object({
  mobile: z.string().trim().regex(/^[6-9]\d{9}$/, 'Enter a valid 10-digit mobile number'),
  code: z.string().trim().regex(/^\d{6}$/, 'Enter the 6-digit OTP'),
  newPassword: z.string().min(6, 'Password must be at least 6 characters'),
});

authRouter.post('/reset-password', (req: Request, res: Response) => {
  const parsed = resetSchema.safeParse(req.body);
  if (!parsed.success) {
    res.status(400).json({ error: parsed.error.issues[0]?.message ?? 'Invalid input' });
    return;
  }

  const { mobile, code, newPassword } = parsed.data;
  const db = getDb();
  const otpRow = db
    .prepare(
      `SELECT id, code_hash, expires_at FROM otp_codes
       WHERE target = ? AND consumed = 0 ORDER BY created_at DESC LIMIT 1`
    )
    .get(mobile) as { id: string; code_hash: string; expires_at: string } | undefined;

  if (!otpRow || new Date(otpRow.expires_at) <= new Date() || otpRow.code_hash !== hashOtp(code)) {
    res.status(400).json({ error: 'Invalid or expired OTP code.' });
    return;
  }

  const user = db.prepare(`SELECT id FROM users WHERE mobile = ?`).get(mobile) as { id: string } | undefined;
  if (!user) {
    res.status(404).json({ error: 'No account found with this mobile number.' });
    return;
  }

  const hash = bcrypt.hashSync(newPassword, 10);
  db.prepare(`UPDATE users SET password_hash = ? WHERE id = ?`).run(hash, user.id);
  db.prepare(`UPDATE otp_codes SET consumed = 1 WHERE id = ?`).run(otpRow.id);
  clearRateLimit(`login:${mobile}`);

  res.json({ reset: true, message: 'Password updated. You can now log in.' });
});

authRouter.post('/oauth/:provider', (req: Request, res: Response) => {
  const provider = req.params.provider?.toUpperCase();
  if (provider !== 'GOOGLE' && provider !== 'APPLE') {
    res.status(400).json({ error: 'Unsupported OAuth provider.' });
    return;
  }

  const email = provider === 'GOOGLE' ? 'ananya@serva.demo' : 'apple.demo@serva.demo';
  const name = provider === 'GOOGLE' ? 'Ananya Reddy' : 'Vikram Sharma';
  const db = getDb();

  let user = db.prepare(`SELECT id FROM users WHERE email = ?`).get(email) as { id: string } | undefined;
  if (!user) {
    const userId = crypto.randomUUID();
    db.prepare(
      `INSERT INTO users (id, name, email, role, auth_provider, mobile_verified)
       VALUES (?, ?, ?, 'CUSTOMER', ?, 1)`
    ).run(userId, name, email, provider);
    ensureWallet(userId);
    user = { id: userId };
  }

  createSession(res, user.id);
  res.json({ user: getSafeUser(user.id), provider, simulated: true });
});

authRouter.post('/logout', (req: Request, res: Response) => {
  const db = getDb();
  if (req.sessionId) {
    db.prepare(`DELETE FROM sessions WHERE id = ?`).run(req.sessionId);
  }
  res.clearCookie(SESSION_COOKIE_NAME, { path: '/' });
  res.json({ loggedOut: true });
});

authRouter.get('/me', (req: Request, res: Response) => {
  if (!req.user) {
    res.json({ user: null });
    return;
  }
  res.json({ user: req.user });
});

const prefSchema = z.object({
  language: z.enum(['en', 'te', 'hi']).optional(),
  default_city: z.string().trim().min(2).max(60).optional(),
});

authRouter.patch('/preferences', requireAuth, (req: Request, res: Response) => {
  const parsed = prefSchema.safeParse(req.body);
  if (!parsed.success) {
    res.status(400).json({ error: 'Invalid preferences' });
    return;
  }
  const db = getDb();
  if (parsed.data.language) {
    db.prepare(`UPDATE users SET language = ? WHERE id = ?`).run(parsed.data.language, req.user!.id);
  }
  if (parsed.data.default_city) {
    db.prepare(`UPDATE users SET default_city = ? WHERE id = ?`).run(parsed.data.default_city, req.user!.id);
  }
  res.json({ user: getSafeUser(req.user!.id) });
});
