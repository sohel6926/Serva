import { useEffect } from 'react';
import { useRouter } from '../../lib/router.tsx';

const REVEAL_SELECTOR = [
  '#main-content section',
  '#main-content .serva-card',
  '#main-content article',
  '#main-content [role="note"]',
  '#main-content .serva-reveal',
].join(', ');

export function ScrollRevealObserver() {
  const { pathname } = useRouter();

  useEffect(() => {
    const root = document.getElementById('main-content');
    if (!root) return;

    const prefersReduced =
      typeof window !== 'undefined' &&
      window.matchMedia?.('(prefers-reduced-motion: reduce)').matches;

    const revealElement = (el: HTMLElement, delayMs = 0) => {
      if (el.getAttribute('data-reveal') === 'done') return;
      if (prefersReduced) {
        el.setAttribute('data-reveal', 'done');
        return;
      }
      if (delayMs > 0) {
        el.style.transitionDelay = `${delayMs}ms`;
      }
      el.setAttribute('data-reveal', 'visible');
      window.setTimeout(() => {
        el.style.transitionDelay = '';
        el.setAttribute('data-reveal', 'done');
      }, 520 + delayMs);
    };

    if (prefersReduced || typeof IntersectionObserver === 'undefined') {
      root.querySelectorAll<HTMLElement>(REVEAL_SELECTOR).forEach((el) => {
        el.setAttribute('data-reveal', 'done');
      });
      return;
    }

    const observer = new IntersectionObserver(
      (entries) => {
        let batchIdx = 0;
        for (const entry of entries) {
          if (!entry.isIntersecting) continue;
          const el = entry.target as HTMLElement;
          observer.unobserve(el);
          const delay = Math.min(batchIdx * 45, 180);
          batchIdx += 1;
          revealElement(el, delay);
        }
      },
      {
        threshold: 0.05,
        rootMargin: '0px 0px -20px 0px',
      }
    );

    const scanTargets = () => {
      const vh = window.innerHeight || 800;
      const nodes = root.querySelectorAll<HTMLElement>(REVEAL_SELECTOR);
      nodes.forEach((el) => {
        const current = el.getAttribute('data-reveal');
        if (current) return;

        const rect = el.getBoundingClientRect();
        // Keep above-the-fold content visible immediately (zero LCP/render delay)
        if (rect.top < vh * 0.92) {
          el.setAttribute('data-reveal', 'done');
          return;
        }

        el.setAttribute('data-reveal', 'pending');
        observer.observe(el);
      });
    };

    scanTargets();

    let scanRaf = 0;
    const scheduleScan = () => {
      if (scanRaf) return;
      scanRaf = window.requestAnimationFrame(() => {
        scanRaf = 0;
        scanTargets();
      });
    };

    const mutationObserver = new MutationObserver(scheduleScan);
    mutationObserver.observe(root, { childList: true, subtree: true });

    // Safety fallback near page bottom so short footer/tail cards never stay hidden
    const onScrollEndCheck = () => {
      const doc = document.documentElement;
      if (window.scrollY + window.innerHeight >= doc.scrollHeight - 48) {
        root
          .querySelectorAll<HTMLElement>('[data-reveal="pending"]')
          .forEach((el, idx) => {
            observer.unobserve(el);
            revealElement(el, Math.min(idx * 35, 140));
          });
      }
    };

    window.addEventListener('scroll', onScrollEndCheck, { passive: true });
    window.addEventListener('resize', scheduleScan, { passive: true });

    return () => {
      if (scanRaf) window.cancelAnimationFrame(scanRaf);
      observer.disconnect();
      mutationObserver.disconnect();
      window.removeEventListener('scroll', onScrollEndCheck);
      window.removeEventListener('resize', scheduleScan);
    };
  }, [pathname]);

  return null;
}
