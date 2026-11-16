import crypto from 'crypto';
import { getDb } from '../db/client.ts';

export interface NotificationPayload {
  userId: string;
  title: string;
  body: string;
  link?: string;
  smsTarget?: string;
  emailTarget?: string;
}

export const notificationAdapter = {
  sendInApp(payload: NotificationPayload): string {
    const db = getDb();
    const id = crypto.randomUUID();
    db.prepare(
      `INSERT INTO notifications (id, user_id, title, body, link) VALUES (?, ?, ?, ?, ?)`
    ).run(id, payload.userId, payload.title, payload.body, payload.link ?? null);
    return id;
  },

  sendSmsMock(mobile: string, message: string): void {
    if (process.env.NODE_ENV !== 'test') {
      console.info(`[SERVA SMS MOCK] To ${mobile}: ${message}`);
    }
  },

  sendEmailMock(email: string, subject: string, body: string): void {
    if (process.env.NODE_ENV !== 'test') {
      console.info(`[SERVA EMAIL MOCK] To ${email} | ${subject}: ${body}`);
    }
  },

  notifyUser(payload: NotificationPayload): string {
    const id = this.sendInApp(payload);
    if (payload.smsTarget) {
      this.sendSmsMock(payload.smsTarget, `${payload.title} - ${payload.body}`);
    }
    if (payload.emailTarget) {
      this.sendEmailMock(payload.emailTarget, payload.title, payload.body);
    }
    return id;
  },
};
