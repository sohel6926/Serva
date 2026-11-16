import React, { useEffect, useState } from 'react';
import { ArrowUp } from 'lucide-react';
import { useRouter } from '../../lib/router.tsx';

export function ScrollToTopButton() {
  const { pathname } = useRouter();
  const [scrollState, setScrollState] = useState({ visible: false, progress: 0 });

  useEffect(() => {
    let rafId = 0;

    const computeScroll = () => {
      rafId = 0;
      const doc = document.documentElement;
      const scrollTop = window.scrollY || doc.scrollTop || 0;
      const maxScroll = Math.max(0, doc.scrollHeight - window.innerHeight);
      const ratio = maxScroll > 0 ? Math.min(1, Math.max(0, scrollTop / maxScroll)) : 0;
      setScrollState({
        visible: scrollTop > 120,
        progress: ratio,
      });
    };

    const onScrollOrResize = () => {
      if (rafId) return;
      rafId = window.requestAnimationFrame(computeScroll);
    };

    computeScroll();
    window.addEventListener('scroll', onScrollOrResize, { passive: true });
    window.addEventListener('resize', onScrollOrResize, { passive: true });

    let ro: ResizeObserver | null = null;
    if (typeof ResizeObserver !== 'undefined') {
      ro = new ResizeObserver(onScrollOrResize);
      ro.observe(document.body);
    }

    return () => {
      if (rafId) window.cancelAnimationFrame(rafId);
      window.removeEventListener('scroll', onScrollOrResize);
      window.removeEventListener('resize', onScrollOrResize);
      ro?.disconnect();
    };
  }, [pathname]);

  const handleScrollTop = () => {
    const prefersReduced =
      typeof window !== 'undefined' &&
      window.matchMedia?.('(prefers-reduced-motion: reduce)').matches;
    window.scrollTo({
      top: 0,
      behavior: prefersReduced ? 'auto' : 'smooth',
    });
  };

  const size = 54;
  const strokeWidth = 3.5;
  const radius = (size - strokeWidth) / 2 - 1;
  const circumference = 2 * Math.PI * radius;
  const dashOffset = circumference * (1 - scrollState.progress);
  const percent = Math.round(scrollState.progress * 100);

  // Stack neatly above the sticky "Book a Service" pill on /home-services
  const positionClass =
    pathname === '/home-services'
      ? 'bottom-32 md:bottom-22 right-4 sm:right-8'
      : 'bottom-20 md:bottom-6 right-4 sm:right-8';

  return (
    <button
      type="button"
      onClick={handleScrollTop}
      aria-label={`Scroll to top (${percent}% of page read)`}
      title={`Back to top · ${percent}%`}
      className={`fixed ${positionClass} z-40 w-[54px] h-[54px] rounded-full bg-white/95 backdrop-blur-md shadow-[0_8px_24px_-4px_rgba(10,31,92,0.22)] flex items-center justify-center cursor-pointer transition-all duration-200 hover:scale-105 active:scale-95 focus-visible:outline-2 focus-visible:outline-[#0B5FD9] ${
        scrollState.visible
          ? 'opacity-100 translate-y-0 pointer-events-auto'
          : 'opacity-0 translate-y-4 pointer-events-none'
      }`}
    >
      <svg
        width={size}
        height={size}
        viewBox={`0 0 ${size} ${size}`}
        className="absolute inset-0 -rotate-90 pointer-events-none"
        aria-hidden="true"
      >
        <defs>
          <linearGradient id="servaScrollRingGrad" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#00E5FF" />
            <stop offset="50%" stopColor="#0B5FD9" />
            <stop offset="100%" stopColor="#7C3AED" />
          </linearGradient>
        </defs>
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          fill="none"
          stroke="#DCE7F9"
          strokeWidth={strokeWidth}
        />
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          fill="none"
          stroke="url(#servaScrollRingGrad)"
          strokeWidth={strokeWidth}
          strokeLinecap="round"
          strokeDasharray={circumference}
          strokeDashoffset={dashOffset}
          style={{ transition: 'stroke-dashoffset 80ms linear' }}
        />
      </svg>

      <span className="relative z-10 flex flex-col items-center justify-center leading-none">
        <ArrowUp className="w-4 h-4 text-[#0A1F5C] stroke-[2.5]" />
        <span className="text-[10px] font-mono-num font-bold text-[#0B5FD9] mt-0.5">
          {percent}%
        </span>
      </span>
    </button>
  );
}
