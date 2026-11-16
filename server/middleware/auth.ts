import type { NextFunction, Request, Response } from 'express';
import { getDb } from '../db/client.ts';

export type UserRole = 'CUSTOMER' | 'PARTNER' | 'ADMIN';

export interface AuthUser {
  id: string;
  name: string;
  email: string | null;
  mobile: string | null;
  role: UserRole;
  mobile_verified: boolean;
  language: string;
  default_city: string;
  partner_id?: string | null;
  partner_verification_status?: string | null;
}

declare global {
  namespace Express {
    interface Request {
      user?: AuthUser;
      sessionId?: string;
    }
  }
}

export const SESSION_COOKIE_NAME = 'serva_session';

export function attachSessionUser(req: Request, _res: Response, next: NextFunction): void {
  const token = req.cookies?.[SESSION_COOKIE_NAME];
  if (!token || typeof token !== 'string') {
    next();
    return;
  }

  const db = getDb();
  const row = db
    .prepare(
      `SELECT s.id as session_id, s.expires_at, u.id, u.name, u.email, u.mobile, u.role, u.mobile_verified, u.language, u.default_city,
              p.id as partner_id, p.verification_status as partner_verification_status
       FROM sessions s
       JOIN users u ON u.id = s.user_id
       LEFT JOIN partners p ON p.user_id = u.id
       WHERE s.id = ?`
    )
    .get(token) as
    | {
        session_id: string;
        expires_at: string;
        id: string;
        name: string;
        email: string | null;
        mobile: string | null;
        role: UserRole;
        mobile_verified: number;
        language: string;
        default_city: string;
        partner_id: string | null;
        partner_verification_status: string | null;
      }
    | undefined;

  if (!row || new Date(row.expires_at) <= new Date()) {
    if (row) {
      db.prepare(`DELETE FROM sessions WHERE id = ?`).run(row.session_id);
    }
    next();
    return;
  }

  req.sessionId = row.session_id;
  req.user = {
    id: row.id,
    name: row.name,
    email: row.email,
    mobile: row.mobile,
    role: row.role,
    mobile_verified: Boolean(row.mobile_verified),
    language: row.language,
    default_city: row.default_city,
    partner_id: row.partner_id,
    partner_verification_status: row.partner_verification_status,
  };
  next();
}

export function requireAuth(req: Request, res: Response, next: NextFunction): void {
  if (!req.user) {
    res.status(401).json({ error: 'Authentication required. Please log in to continue.' });
    return;
  }
  next();
}

export function requireRole(...roles: UserRole[]) {
  return (req: Request, res: Response, next: NextFunction): void => {
    if (!req.user) {
      res.status(401).json({ error: 'Authentication required.' });
      return;
    }
    if (!roles.includes(req.user.role)) {
      res.status(403).json({ error: 'Access denied for your account role.' });
      return;
    }
    next();
  };
}
