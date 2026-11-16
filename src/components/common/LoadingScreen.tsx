import React from 'react';
import { BrandLogo } from './BrandLogo.tsx';

export function LoadingScreen({ message = 'All Your Needs, One Platform' }: { message?: string }) {
  return (
    <div
      role="status"
      aria-live="polite"
      className="min-h-screen flex flex-col items-center justify-center px-6 bg-gradient-to-b from-[#EAF2FF] to-white"
    >
      <div className="serva-card px-10 py-8 flex flex-col items-center gap-4 text-center">
        <BrandLogo variant="stacked" />
        <p className="text-sm font-medium text-[#0A1F5C] tracking-tight">{message}</p>
        <div className="w-36 h-1.5 rounded-full bg-[#DCE7F9] overflow-hidden">
          <div className="h-full w-1/2 rounded-full bg-[#0B5FD9] animate-pulse" />
        </div>
      </div>
    </div>
  );
}
