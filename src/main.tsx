import {createRoot} from 'react-dom/client';
import App from './App.tsx';
import './index.css';

if (typeof document !== 'undefined') {
  const timers = new WeakMap<HTMLElement, number>();

  const triggerNeon = (target: EventTarget | null) => {
    if (!(target instanceof Element)) return;
    const card = target.closest('a.serva-card, button.serva-card, .serva-card-press');
    if (!(card instanceof HTMLElement)) return;

    const existing = timers.get(card);
    if (existing) window.clearTimeout(existing);
    card.setAttribute('data-neon-pressed', 'true');

    const releaseTimer = window.setTimeout(() => {
      card.removeAttribute('data-neon-pressed');
      timers.delete(card);
    }, 260);
    timers.set(card, releaseTimer);
  };

  document.addEventListener('pointerdown', (e) => triggerNeon(e.target), { passive: true });
}

createRoot(document.getElementById('root')!).render(<App />);
