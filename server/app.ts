import cookieParser from 'cookie-parser';
import express, { type Express } from 'express';
import { getUploadDir } from './adapters/storage.ts';
import { seedDatabase } from './db/seed.ts';
import { attachSessionUser } from './middleware/auth.ts';
import { accountSupportRouter } from './routes/accountSupport.ts';
import { agriMovingRouter } from './routes/agriMoving.ts';
import { authRouter } from './routes/auth.ts';
import { bookingsRouter } from './routes/bookings.ts';
import { contractorsEventsRouter } from './routes/contractorsEvents.ts';
import { discoveryRouter } from './routes/discovery.ts';
import { homeServicesRouter } from './routes/homeServices.ts';
import { partnerAdminRouter } from './routes/partnerAdmin.ts';
import { phase1Router } from './routes/phase1.ts';
import { uploadsRouter } from './routes/uploads.ts';

export function createApp(options?: { skipSeed?: boolean }): Express {
  if (!options?.skipSeed) {
    seedDatabase();
  }

  const app = express();
  app.use(express.json({ limit: '8mb' }));
  app.use(cookieParser());
  app.use(attachSessionUser);
  app.use('/uploads', express.static(getUploadDir()));

  app.get('/api/health', (_req, res) => {
    res.json({ ok: true, service: 'SERVA' });
  });

  app.use('/api/auth', authRouter);
  app.use('/api', discoveryRouter);
  app.use('/api', homeServicesRouter);
  app.use('/api', contractorsEventsRouter);
  app.use('/api', agriMovingRouter);
  app.use('/api', bookingsRouter);
  app.use('/api', partnerAdminRouter);
  app.use('/api', accountSupportRouter);
  app.use('/api', uploadsRouter);
  app.use('/api', phase1Router);

  return app;
}
