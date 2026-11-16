import { Router, type Request, type Response } from 'express';
import { z } from 'zod';
import { saveBase64Upload } from '../adapters/storage.ts';
import { requireAuth } from '../middleware/auth.ts';

export const uploadsRouter = Router();

const uploadSchema = z.object({
  dataUrl: z.string().min(20),
  prefix: z.string().trim().max(24).optional(),
});

uploadsRouter.post('/uploads', requireAuth, (req: Request, res: Response) => {
  const parsed = uploadSchema.safeParse(req.body);
  if (!parsed.success) {
    res.status(400).json({ error: 'Invalid upload payload.' });
    return;
  }
  try {
    const result = saveBase64Upload(parsed.data.dataUrl, parsed.data.prefix || 'serva');
    res.status(201).json(result);
  } catch (err) {
    res.status(400).json({ error: err instanceof Error ? err.message : 'Upload rejected.' });
  }
});
