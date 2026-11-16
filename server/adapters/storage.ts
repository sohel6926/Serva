import crypto from 'crypto';
import fs from 'fs';
import path from 'path';

const ALLOWED_MIME_EXTENSIONS: Record<string, string> = {
  'image/jpeg': 'jpg',
  'image/jpg': 'jpg',
  'image/png': 'png',
  'image/webp': 'webp',
  'video/mp4': 'mp4',
};

const MAX_BYTES = 5 * 1024 * 1024; // 5MB

export function getUploadDir(): string {
  const dir = process.env.UPLOAD_DIR
    ? path.resolve(process.cwd(), process.env.UPLOAD_DIR)
    : path.resolve(process.cwd(), 'uploads');
  if (!fs.existsSync(dir)) {
    fs.mkdirSync(dir, { recursive: true });
  }
  return dir;
}

export function saveBase64Upload(dataUrl: string, prefix = 'media'): { url: string; mimeType: string; sizeBytes: number } {
  const match = /^data:([a-zA-Z0-9/+.-]+);base64,(.+)$/.exec(dataUrl);
  if (!match) {
    throw new Error('Invalid file format. Expected base64 data URL.');
  }

  const mimeType = match[1].toLowerCase();
  const ext = ALLOWED_MIME_EXTENSIONS[mimeType];
  if (!ext) {
    throw new Error('Unsupported file type. Allowed: JPEG, PNG, WEBP, MP4.');
  }

  const buffer = Buffer.from(match[2], 'base64');
  if (buffer.length === 0 || buffer.length > MAX_BYTES) {
    throw new Error('File size must be between 1 byte and 5 MB.');
  }

  const filename = `${prefix}-${Date.now()}-${crypto.randomBytes(4).toString('hex')}.${ext}`;
  const fullPath = path.join(getUploadDir(), filename);
  fs.writeFileSync(fullPath, buffer);

  return {
    url: `/uploads/${filename}`,
    mimeType,
    sizeBytes: buffer.length,
  };
}
