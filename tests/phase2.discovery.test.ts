import http from 'http';
import { afterAll, beforeAll, describe, expect, it } from 'vitest';
import { createApp } from '../server/app.ts';
import { resetDbForTests } from '../server/db/client.ts';
import { seedDatabase } from '../server/db/seed.ts';

let server: http.Server;
let baseUrl = '';

async function getJson(path: string) {
  const res = await fetch(`${baseUrl}${path}`);
  const data = await res.json();
  return { status: res.status, data };
}

describe('Phase 2: Discovery, Search & Portfolio Galleries (Test 22)', () => {
  beforeAll(async () => {
    process.env.NODE_ENV = 'test';
    resetDbForTests(':memory:');
    seedDatabase();
    const app = createApp({ skipSeed: true });
    await new Promise<void>((resolve) => {
      server = app.listen(0, '127.0.0.1', () => {
        const addr = server.address();
        if (addr && typeof addr !== 'string') {
          baseUrl = `http://127.0.0.1:${addr.port}`;
        }
        resolve();
      });
    });
  });

  afterAll(async () => {
    await new Promise<void>((resolve) => server.close(() => resolve()));
  });

  it('Test 22a: All five categories show at least 6 listings with images', async () => {
    const categories = ['home-services', 'contractors', 'events', 'agriculture', 'moving'];
    for (const cat of categories) {
      const { status, data } = await getJson(`/api/services?category=${cat}`);
      expect(status).toBe(200);
      expect(data.services.length).toBeGreaterThanOrEqual(6);
      for (const svc of data.services) {
        expect(svc.image_url).toBeTruthy();
      }
    }
  });

  it('Test 22b: Search finds "electrician", "DJ", and "tractor"', async () => {
    const elec = await getJson('/api/search?q=electrician');
    expect(elec.status).toBe(200);
    expect(elec.data.services.some((s: { slug: string }) => s.slug === 'electrician')).toBe(true);

    const dj = await getJson('/api/search?q=DJ');
    expect(dj.status).toBe(200);
    expect(dj.data.services.some((s: { slug: string }) => s.slug === 'dj')).toBe(true);

    const tractor = await getJson('/api/search?q=tractor');
    expect(tractor.status).toBe(200);
    expect(tractor.data.services.some((s: { slug: string }) => s.slug === 'tractor-rental')).toBe(true);
  });

  it('Portfolio gallery returns both photo and local playable video items across categories', async () => {
    const res = await getJson('/api/portfolio');
    expect(res.status).toBe(200);
    const items = res.data.items as Array<{ media_type: string; media_url: string; category_slug: string }>;
    expect(items.some((i) => i.media_type === 'IMAGE')).toBe(true);
    expect(items.some((i) => i.media_type === 'VIDEO' && i.media_url.endsWith('.mp4'))).toBe(true);
    expect(items.some((i) => i.category_slug === 'contractors')).toBe(true);
    expect(items.some((i) => i.category_slug === 'events')).toBe(true);
    expect(items.some((i) => i.category_slug === 'home-services')).toBe(true);
  });
});
